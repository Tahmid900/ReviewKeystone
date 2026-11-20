import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ImagePlus,
  X,
  Trash2,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, googleProvider, OperationType, handleFirestoreError } from '../firebase';

export interface ClientReview {
  id: string;
  authorId: string;
  authorName: string;
  businessName?: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  status: 'published';
  createdAt?: Timestamp | null;
}

const ADMIN_EMAIL = 'md.tahmidbhuyan009@gmail.com';
const MAX_IMAGES = 2;
const MAX_IMAGE_DATA_LENGTH = 240000;

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const maxDimension = 800;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas compression unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.78;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > MAX_IMAGE_DATA_LENGTH && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > MAX_IMAGE_DATA_LENGTH) {
          reject(new Error('Image is still too large after compression. Please pick a smaller image.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function renderStars(rating: number, sizeClass = 'w-4 h-4') {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? 'fill-[#B91C1C] text-[#B91C1C]'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ onSelectImage }: { onSelectImage: (url: string) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (asyncError) {
    throw asyncError;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser?.displayName && !authorName) {
        setAuthorName(currentUser.displayName);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('status', '==', 'published')
    );

    const unsub = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loaded: ClientReview[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorId: String(data.authorId || ''),
            authorName: String(data.authorName || 'Verified Reviewer'),
            businessName: data.businessName ? String(data.businessName) : undefined,
            rating: Number(data.rating || 5),
            comment: String(data.comment || ''),
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls.map(String) : [],
            status: 'published',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          };
        });

        loaded.sort((a, b) => {
          const aTime = a.createdAt ? a.createdAt.toMillis() : Date.now();
          const bTime = b.createdAt ? b.createdAt.toMillis() : Date.now();
          return bTime - aTime;
        });

        setReviews(loaded);
        setLoadingReviews(false);
      },
      (error) => {
        setLoadingReviews(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'reviews');
        } catch (err) {
          setAsyncError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    );

    return () => unsub();
  }, []);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews
      : 0;

  const starCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  const handleSignIn = async () => {
    setFormError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.displayName && !authorName) {
        setAuthorName(result.user.displayName);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Google sign-in was cancelled or blocked.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('');
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (attachedImages.length + files.length > MAX_IMAGES) {
      setFormError(`You can attach up to ${MAX_IMAGES} images per review.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const compressed = await Promise.all(files.map(compressImageToDataUrl));
      setAttachedImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to process attached image.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedImage = (idx: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitSuccess(false);

    if (!user) {
      setFormError('Please sign in with Google to post a review.');
      return;
    }

    const cleanName = authorName.trim().slice(0, 80);
    const cleanBusiness = businessName.trim().slice(0, 100);
    const cleanComment = comment.trim().slice(0, 1500);

    if (cleanName.length < 1) {
      setFormError('Please enter your name.');
      return;
    }
    if (cleanComment.length < 5) {
      setFormError('Please write at least 5 characters in your review.');
      return;
    }

    setSubmitting(true);
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const reviewPath = `reviews/${reviewId}`;

    try {
      const payload: {
        authorId: string;
        authorName: string;
        businessName?: string;
        rating: number;
        comment: string;
        imageUrls: string[];
        status: 'published';
        createdAt: ReturnType<typeof serverTimestamp>;
      } = {
        authorId: user.uid,
        authorName: cleanName,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: cleanComment,
        imageUrls: attachedImages.slice(0, MAX_IMAGES),
        status: 'published',
        createdAt: serverTimestamp(),
      };

      if (cleanBusiness.length > 0) {
        payload.businessName = cleanBusiness;
      }

      await setDoc(doc(db, 'reviews', reviewId), payload);

      setComment('');
      setBusinessName('');
      setRating(5);
      setAttachedImages([]);
      setSubmitSuccess(true);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, reviewPath);
      } catch (err) {
        setFormError('Unable to publish review. Please ensure your Google account email is verified.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);
    const reviewPath = `reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, reviewPath);
      } catch (err) {
        setAsyncError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="reviews" className="py-16 md:py-24 bg-[#F3F4F6] border-y border-gray-200 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">Client Feedback</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
            Client Reviews &amp; Overall Rating
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Verified ratings and feedback shared by business owners and managers, including report snapshots.
          </p>
        </div>

        {/* Overall Rating Banner at Top */}
        <div className="card-soft p-6 sm:p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 text-center md:text-left md:border-r md:border-gray-200 md:pr-6">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Overall Rating</div>
              <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-[#1F2937] tabular-nums">
                  {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-base text-gray-400 font-semibold">/ 5.0</span>
              </div>
              <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                {renderStars(averageRating, 'w-5 h-5')}
              </div>
              <div className="text-xs text-gray-500 mt-2 font-mono tabular-nums">
                {loadingReviews
                  ? 'Loading ratings...'
                  : totalReviews === 0
                  ? 'No reviews yet'
                  : `Based on ${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`}
              </div>
            </div>

            <div className="md:col-span-8 space-y-2">
              {starCounts.map(({ stars, count }) => {
                const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-gray-700 tabular-nums shrink-0">{stars} stars</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B91C1C] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-14 text-right text-gray-500 font-mono tabular-nums shrink-0">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two-column layout: Reviews List + Submit Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reviews Feed (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1F2937]">Published Reviews</h3>
              <span className="text-xs text-gray-500 font-mono tabular-nums">{totalReviews} total</span>
            </div>

            {loadingReviews ? (
              <div className="card-soft p-8 bg-white text-center text-sm text-gray-500">
                Loading client reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="card-soft p-8 bg-white text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#1F2937]">No reviews submitted yet</h4>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  Only real, user-submitted reviews are displayed here. If you have worked with{' '}
                  <span className="text-[#B91C1C] font-semibold">ReviewKeystone</span>, share your rating and optional
                  images using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const canDelete =
                    Boolean(user) &&
                    (user?.uid === rev.authorId ||
                      (user?.email === ADMIN_EMAIL && user?.emailVerified));
                  const dateLabel = rev.createdAt
                    ? rev.createdAt.toDate().toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Just now';

                  return (
                    <article key={rev.id} className="card-soft p-5 sm:p-6 bg-white space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-[#1F2937]">{rev.authorName}</h4>
                            {rev.businessName && (
                              <>
                                <span aria-hidden="true" className="text-gray-300">·</span>
                                <span className="text-xs text-gray-500 font-medium">{rev.businessName}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(rev.rating, 'w-3.5 h-3.5')}
                            <span className="text-xs text-gray-400 font-mono">{rev.rating}.0</span>
                            <span aria-hidden="true" className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{dateLabel}</span>
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            disabled={deletingId === rev.id}
                            title="Delete review"
                            className="p-1.5 text-gray-400 hover:text-[#B91C1C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {rev.comment}
                      </p>

                      {rev.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          {rev.imageUrls.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onSelectImage(url)}
                              className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-[#B91C1C] transition-colors cursor-pointer bg-gray-50"
                            >
                              <img
                                src={url}
                                alt={`Attachment ${idx + 1} from ${rev.authorName}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Write a Review Form (Right 5 cols) */}
          <div className="lg:col-span-5 card-soft p-6 bg-white space-y-4">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1F2937]">Leave a Review</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Rate your experience and optionally attach up to 2 images.
              </p>
            </div>

            {!authReady ? (
              <div className="py-6 text-center text-xs text-gray-500">Checking sign-in status...</div>
            ) : !user ? (
              <div className="py-4 space-y-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Sign in with Google to publish a verified review with ratings and image attachments.
                </p>
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#B91C1C] flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1F2937] hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-gray-600 truncate">
                    Signed in as <strong className="text-[#1F2937]">{user.displayName || user.email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-[#B91C1C] font-medium shrink-0 ml-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Your review has been published and added to the overall rating.</span>
                  </div>
                )}

                {/* Star Rating Input */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Rating <span className="text-[#B91C1C]">*</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Rate ${star} out of 5 stars`}
                          className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              active ? 'fill-[#B91C1C] text-[#B91C1C]' : 'fill-gray-200 text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-mono text-gray-500">{rating}.0 / 5.0</span>
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label htmlFor="rev-name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Name <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    maxLength={80}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                  />
                </div>

                {/* Business Name (Optional) */}
                <div>
                  <label htmlFor="rev-business" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Business / Role (Optional)
                  </label>
                  <input
                    id="rev-business"
                    type="text"
                    maxLength={100}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. General Manager, Boutique Hotel"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="rev-comment" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Review <span className="text-[#B91C1C]">*</span>
                  </label>
                  <textarea
                    id="rev-comment"
                    required
                    rows={3}
                    maxLength={1500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how clear and useful the diagnostic or preview was for your team..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                  />
                </div>

                {/* Image Attachments */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Attach Images (Optional, up to {MAX_IMAGES})
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {attachedImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={imgUrl} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeAttachedImage(idx)}
                          aria-label="Remove attached image"
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 text-white rounded-full hover:bg-[#B91C1C] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {attachedImages.length < MAX_IMAGES && (
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1F2937] bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors">
                        <ImagePlus className="w-4 h-4 text-[#B91C1C]" />
                        <span>Add image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  {submitting ? 'Publishing review...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
