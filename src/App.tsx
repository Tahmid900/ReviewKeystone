import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  BarChart3,
  ShieldCheck,
  FileSpreadsheet,
  Link2,
  Clock,
  Layers,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Mail,
  Send,
  Building2,
  MapPin,
  X,
  RotateCcw,
  Hotel,
  UtensilsCrossed,
  Stethoscope,
  Scissors,
  Ticket
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ReviewsSection } from './components/ReviewsSection';

// Assets
const FOUNDER_PHOTO = '/assets/aistudio/Tahmid_eabd5c1f.jpg';

// Exact sample data provided in the specification
const SAMPLE_STATS = {
  rating: 4.1,
  analyzed: 300,
  negative: 54,
  rate: 18,
};

interface ThemeItem {
  id: string;
  name: string;
  count: number;
  severity: number; // 1-10
  severityLabel: string;
  share: number; // % of negative
  rootCause: string;
  quickWin: string;
  structuralFix: string;
  sampleSnippet: string;
  proofUrl: string;
}

const SAMPLE_THEMES: ThemeItem[] = [
  {
    id: 'staff',
    name: 'Staff Conduct & Responsiveness',
    count: 21,
    severity: 8,
    severityLabel: 'High',
    share: 38.9,
    rootCause: 'Evening shift understaffing leading to defensive customer interactions during peak check-in rushes.',
    quickWin: 'Implement 3-sentence de-escalation response script at reception desk during turnover hours.',
    structuralFix: 'Re-align front desk shift scheduling with reservation arrival patterns and conduct empathy refresher.',
    sampleSnippet: '"Front desk clerk rolled eyes when we asked for an extra blanket at 9pm and told us to come back in the morning."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev1'
  },
  {
    id: 'cleanliness',
    name: 'Cleanliness & Housekeeping',
    count: 14,
    severity: 9,
    severityLabel: 'Critical',
    share: 25.9,
    rootCause: 'Hair in bathtubs and unemptied waste bins skipped during hurried 15-minute room turnover cycles.',
    quickWin: 'Mandatory 6-point bathroom checklist signed off by shift supervisor before room release.',
    structuralFix: 'Adjust room turnaround allowance from 15 to 22 minutes to restore baseline quality control.',
    sampleSnippet: '"Found someone else’s hair in the shower drain and dirty towels left folded behind the bathroom door."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev2'
  },
  {
    id: 'billing',
    name: 'Billing / Refunds / Booking',
    count: 11,
    severity: 7,
    severityLabel: 'High',
    share: 20.4,
    rootCause: 'Third-party OTA deposit holds remaining blocked on guest cards for up to 14 days without explanation.',
    quickWin: 'Print automated departure receipt showing authorization hold release timeline with bank disclaimers.',
    structuralFix: 'Integrate merchant payment gateway with direct PMS auto-release triggered at key drop-off.',
    sampleSnippet: '"Charged twice for the incidental hold and took three weeks and six unreturned phone calls to reverse."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev3'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    count: 10,
    severity: 6,
    severityLabel: 'Moderate',
    share: 18.5,
    rootCause: 'Slow response to in-room HVAC thermostat errors and loose shower fixtures logged only on checkout.',
    quickWin: 'QR code in guest rooms linking directly to instant maintenance alert log for on-duty engineer.',
    structuralFix: 'Scheduled bi-weekly preventative HVAC filter and water-pressure checks across odd/even wings.',
    sampleSnippet: '"Air conditioning rattled like a tractor all night, room stayed 28°C and night staff couldn’t swap rooms."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev4'
  },
  {
    id: 'checkin',
    name: 'Check-in Delays',
    count: 8,
    severity: 6,
    severityLabel: 'Moderate',
    share: 14.8,
    rootCause: 'Rooms not flagged as inspected in PMS, leaving guests waiting in lobby past guaranteed 3:00 PM check-in.',
    quickWin: 'Introduce complimentary lobby beverage voucher when room release is delayed beyond 15 minutes.',
    structuralFix: 'Real-time handheld PMS status updates for housekeeping supervisors rather than batch paper logs.',
    sampleSnippet: '"Arrived at 4:30 PM (guaranteed 3 PM) and had to sit with our luggage in the foyer for an hour with zero update."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev5'
  },
  {
    id: 'noise',
    name: 'Noise',
    count: 7,
    severity: 5,
    severityLabel: 'Moderate',
    share: 13.0,
    rootCause: 'Street-facing single pane windows and service elevator hum vibrating through adjacent wall cavities.',
    quickWin: 'Reassign light sleepers to courtyard wings automatically when flagged on pre-arrival preferences.',
    structuralFix: 'Install acoustic acoustic sweep seals on hallway fire doors and elevator buffer dampening.',
    sampleSnippet: '"Could hear every single car and delivery truck outside from the 2nd floor, impossible to sleep before 2am."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev6'
  },
  {
    id: 'food',
    name: 'Food & Breakfast Service',
    count: 6,
    severity: 5,
    severityLabel: 'Moderate',
    share: 11.1,
    rootCause: 'Buffet trays running cold between 9:00 AM and 10:00 AM rush hour with depleted hot water wells.',
    quickWin: 'Stagger kitchen restock intervals every 12 minutes rather than batch-cooking at 8:00 AM.',
    structuralFix: 'Replace induction heating plates and re-train breakfast culinary assistants on temperature logs.',
    sampleSnippet: '"Breakfast eggs were ice cold at 9:15 AM and coffee station was out of milk for 25 minutes."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev7'
  },
  {
    id: 'safety',
    name: 'Safety / Health / Lost Property',
    count: 3,
    severity: 10,
    severityLabel: 'Critical Risk',
    share: 5.6,
    rootCause: 'Delayed handover of forgotten chargers and jewelry between housekeeping bin and secure manager lockbox.',
    quickWin: 'Numbered tamper-evident lost property pouches logged immediately with dual-signature sign-off.',
    structuralFix: 'Implement serialized chain-of-custody logging with timestamped photo records within 60 minutes.',
    sampleSnippet: '"Left my watch on the bedside table; called 2 hours after checkout and was told nothing was found."',
    proofUrl: 'https://maps.google.com/?cid=sample_fictional_hotel_rev8'
  }
];

// Interactive hero demo snippets
interface HeroSnippet {
  id: number;
  text: string;
  theme: string;
  severity: number;
  stars: number;
}

const HERO_SNIPPETS: HeroSnippet[] = [
  {
    id: 1,
    text: '"Front desk staff shrugged and refused to help when our key card stopped working at midnight."',
    theme: 'Staff Conduct',
    severity: 8,
    stars: 1,
  },
  {
    id: 2,
    text: '"Stained pillowcase and thick dust behind the headboard. Housekeeping never showed up."',
    theme: 'Cleanliness',
    severity: 9,
    stars: 1,
  },
  {
    id: 3,
    text: '"Overcharged by $85 for minibar items we never touched. Still waiting for manager callback."',
    theme: 'Billing & Booking',
    severity: 7,
    stars: 2,
  },
  {
    id: 4,
    text: '"AC was stuck on maximum heat and the window wouldn’t open. Ruined our entire stay."',
    theme: 'Maintenance',
    severity: 6,
    stars: 1,
  }
];

export default function App() {
  // Navigation & Scroll
  const [activeTheme, setActiveTheme] = useState<ThemeItem>(SAMPLE_THEMES[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Hero interactive animation state
  const [heroStep, setHeroStep] = useState<number>(0);
  const [isHeroPlaying, setIsHeroPlaying] = useState<boolean>(true);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formMapsLink, setFormMapsLink] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formConcern, setFormConcern] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Count-up stats trigger on intersection
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Animated stat counters
  const [countRating, setCountRating] = useState(1.0);
  const [countAnalyzed, setCountAnalyzed] = useState(0);
  const [countNegative, setCountNegative] = useState(0);
  const [countRate, setCountRate] = useState(0);

  // Cycle hero animation
  useEffect(() => {
    if (!isHeroPlaying) return;
    const timer = setInterval(() => {
      setHeroStep((prev) => (prev + 1) % (HERO_SNIPPETS.length + 1));
    }, 3200);
    return () => clearInterval(timer);
  }, [isHeroPlaying]);

  // Observer for stats count-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.25 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Smooth count-up logic
  useEffect(() => {
    if (!statsVisible) return;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCountRating(Number((1.0 + (SAMPLE_STATS.rating - 1.0) * ease).toFixed(1)));
      setCountAnalyzed(Math.round(SAMPLE_STATS.analyzed * ease));
      setCountNegative(Math.round(SAMPLE_STATS.negative * ease));
      setCountRate(Math.round(SAMPLE_STATS.rate * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [statsVisible]);

  // Form submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formBusiness.trim() || !formMapsLink.trim() || !formEmail.trim()) {
      setFormError('Please fill in your name, business name, Google Maps link, and email.');
      return;
    }

    // Basic maps url / link validation
    if (!formMapsLink.toLowerCase().includes('maps') && !formMapsLink.toLowerCase().includes('google') && !formMapsLink.startsWith('http')) {
      setFormError('Please provide a valid Google Maps link or URL for your business.');
      return;
    }

    setFormSubmitted(true);
  };

  const founderEmail = 'tahmid@reviewkeystone.com';
  const whatsappNumber = '01575874321';
  const whatsappIntl = whatsappNumber.startsWith('0') ? `88${whatsappNumber}` : whatsappNumber.replace(/[^0-9]/g, '');
  const mailtoLink = `mailto:${founderEmail}?subject=Free%20Review%20Preview%20Request%20-%20${encodeURIComponent(
    formBusiness || 'My Business'
  )}&body=Hi%20Tahmid,%0D%0A%0D%0AI%20would%20like%20to%20request%20a%20free%20negative%20review%20diagnostic%20preview%20for%20my%20business.%0D%0A%0D%0AName:%20${encodeURIComponent(
    formName
  )}%0D%0ABusiness:%20${encodeURIComponent(formBusiness)}%0D%0AGoogle%20Maps%20Link:%20${encodeURIComponent(
    formMapsLink
  )}%0D%0AEmail:%20${encodeURIComponent(formEmail)}%0D%0ASpecific%20Concern:%20${encodeURIComponent(formConcern)}`;

  const whatsappLink = `https://wa.me/${whatsappIntl}?text=Hi%20Tahmid,%20I%20would%20like%20a%20free%20ReviewKeystone%20preview%20for%20my%20business:%20${encodeURIComponent(
    formBusiness || 'My Business'
  )}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans antialiased selection:bg-[#B91C1C] selection:text-white">
      {/* 1. STICKY NAV */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark (Single element) */}
          <a
            href="#"
            className="text-lg font-bold tracking-tight text-[#B91C1C] hover:text-[#991B1B] transition-colors whitespace-nowrap shrink-0"
          >
            ReviewKeystone
          </a>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4B5563]">
            <a href="#how-it-works" className="hover:text-[#1F2937] transition-colors whitespace-nowrap">
              How it works
            </a>
            <a href="#sample-report" className="hover:text-[#1F2937] transition-colors whitespace-nowrap">
              Sample report
            </a>
            <a href="#method" className="hover:text-[#1F2937] transition-colors whitespace-nowrap">
              Our method
            </a>
            <a href="#reviews" className="hover:text-[#1F2937] transition-colors whitespace-nowrap">
              Reviews
            </a>
            <a href="#faq" className="hover:text-[#1F2937] transition-colors whitespace-nowrap">
              Q&A
            </a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#contact-preview"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              Free preview
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B91C1C]">
                <span>Independent Google Review Diagnostics</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1F2937] tracking-tight leading-[1.12]">
                Your negative reviews already tell you what to fix.
              </h1>

              <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-2xl">
                <span className="text-[#B91C1C] font-semibold">ReviewKeystone</span> reads your negative Google reviews,
                groups them into themes, scores how serious each one is, and gives you a prioritized fix plan, with a
                link to every original review as proof.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#contact-preview"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap text-center"
                >
                  <span>Get a free preview</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#sample-report"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#1F2937] bg-white hover:bg-gray-100 border border-[#D1D5DB] rounded-xl transition-colors whitespace-nowrap text-center"
                >
                  <BarChart3 className="w-4 h-4 text-[#4B5563]" />
                  <span>See a sample report</span>
                </a>
              </div>

              {/* Zero-Baggage Trust Markers */}
              <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                  <span>No login or account access required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                  <span>Direct link to original review for every finding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                  <span>Ready within 48 hours</span>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Interactive Sorting Simulation Card */}
            <div className="lg:col-span-5">
              <div className="card-soft p-5 sm:p-6 relative overflow-hidden bg-white">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Diagnostic Logic</h3>
                    <p className="text-sm font-bold text-[#1F2937]">Reviews mapped into ranked themes</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsHeroPlaying(false);
                      setHeroStep((prev) => (prev + 1) % (HERO_SNIPPETS.length + 1));
                    }}
                    title="Step through review diagnostic demo"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Next step</span>
                  </button>
                </div>

                {/* Animated Review Snippet */}
                <div className="min-h-[96px] bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 transition-all">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span className="font-semibold text-gray-700">Incoming Public Review</span>
                    <span className="text-[#B91C1C] font-bold">★☆☆☆☆ (1 Star)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1F2937] italic leading-snug">
                    {heroStep === 0
                      ? HERO_SNIPPETS[0].text
                      : HERO_SNIPPETS[(heroStep - 1) % HERO_SNIPPETS.length].text}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Classified: {heroStep === 0 ? HERO_SNIPPETS[0].theme : HERO_SNIPPETS[(heroStep - 1) % HERO_SNIPPETS.length].theme}
                    </span>
                    <span className="text-gray-400 font-mono">Proof link attached</span>
                  </div>
                </div>

                {/* Theme Ranking Progress Bars with Severity */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                    <span>Ranked Themes & Severity</span>
                    <span>Impact (1–10)</span>
                  </div>

                  {/* Staff Conduct */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1F2937]">Staff Conduct & Responsiveness</span>
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                        Severity 8/10
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1F2937] rounded-full transition-all duration-700"
                        style={{ width: heroStep >= 1 ? '78%' : '65%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Cleanliness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1F2937]">Cleanliness & Housekeeping</span>
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                        Severity 9/10
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B91C1C] rounded-full transition-all duration-700"
                        style={{ width: heroStep >= 2 ? '62%' : '48%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Billing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1F2937]">Billing / Refunds / Booking</span>
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                        Severity 7/10
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-600 rounded-full transition-all duration-700"
                        style={{ width: heroStep >= 3 ? '45%' : '35%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1F2937]">Maintenance & Facilities</span>
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                        Severity 6/10
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full transition-all duration-700"
                        style={{ width: heroStep >= 4 ? '38%' : '28%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Interactive demonstration</span>
                  <span className="italic">Sample data, fictional hotel</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PROBLEM STRIP */}
        <section className="bg-[#1F2937] text-white py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-900/40 text-[#EF4444] mb-1">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-snug">
              Reading hundreds of reviews by hand is slow, and the patterns hide in the noise.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              When angry customers leave 1-star ratings, managers get caught up in defensive emotions or isolated rants.
              Meanwhile, the systemic operational root cause — whether it’s an evening shift gap or a faulty batch of
              keycards — remains invisible until your overall score drops.
            </p>
          </div>
        </section>

        {/* 4. HOW IT WORKS (4 STEPS) */}
        <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">Methodology</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
              How <span className="text-[#B91C1C]">ReviewKeystone</span> works
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              A transparent, straightforward 4-step diagnostic that turns public review frustration into an actionable
              leadership roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="card-soft p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Step 01</span>
                <div className="w-10 h-10 rounded-lg bg-red-50 text-[#B91C1C] flex items-center justify-center my-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] mb-2">Send your Google Maps link</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  No accounts, passwords, or integrations required. We only use public customer data already visible to
                  anyone browsing your venue.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">Zero access credentials</div>
            </div>

            {/* Step 2 */}
            <div className="card-soft p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Step 02</span>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1F2937] flex items-center justify-center my-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] mb-2">Every negative reviews is read and tagged</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Every negative review from your past 12–24 months is catalogued by hand and parsed into clear,
                  consistent operational categories.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">Exhaustive manual taxonomy</div>
            </div>

            {/* Step 3 */}
            <div className="card-soft p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Step 03</span>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center my-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] mb-2">Themes are ranked and scored for severity (1–10)</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We weigh frequency against guest impact and business risk, separating minor quibbles from severe
                  revenue leaks and safety hazards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">1–10 Severity matrix</div>
            </div>

            {/* Step 4 */}
            <div className="card-soft p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Step 04</span>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center my-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] mb-2">You receive a report plus spreadsheet with proof</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  An executive diagnostic presentation for department heads, plus an Excel/Sheets fix register where
                  every point has a direct link to the original review.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">Verifiable proof links</div>
            </div>
          </div>
        </section>

        {/* 5. SAMPLE REPORT (INTERACTIVE CHART & STAT TILES) */}
        <section id="sample-report" className="py-16 md:py-24 bg-[#F3F4F6] border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">
                  <span>Interactive Demonstration</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-gray-500 font-normal">Explore Real Deliverable Structure</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
                  Sample Report: The Grand Sovereign Hotel
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">
                  Sample data, fictional hotel · Past 18 months analyzed
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = SAMPLE_THEMES.findIndex((t) => t.id === activeTheme.id);
                    const nextTheme = SAMPLE_THEMES[(currentIndex + 1) % SAMPLE_THEMES.length];
                    setActiveTheme(nextTheme);
                    const detailEl = document.getElementById('theme-diagnostic-detail');
                    if (detailEl && window.innerWidth < 1024) {
                      detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1F2937] bg-white hover:bg-red-50 hover:text-[#B91C1C] border border-gray-300 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <span>Click any bar to view diagnostic detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Stat Tiles with Count-Up */}
            <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Tile 1 */}
              <div className="card-soft p-5 bg-white border border-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overall Rating</div>
                <div className="text-3xl sm:text-4xl font-black text-[#1F2937] mt-1 tabular-nums">
                  {statsVisible ? countRating.toFixed(1) : '4.1'}
                  <span className="text-base text-gray-400 font-medium"> / 5.0</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">Sample data, fictional hotel</div>
              </div>

              {/* Tile 2 */}
              <div className="card-soft p-5 bg-white border border-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reviews Analysed</div>
                <div className="text-3xl sm:text-4xl font-black text-[#1F2937] mt-1 tabular-nums">
                  {statsVisible ? countAnalyzed : 300}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">Sample data, fictional hotel</div>
              </div>

              {/* Tile 3 */}
              <div className="card-soft p-5 bg-white border border-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#B91C1C]">Negative Reviews</div>
                <div className="text-3xl sm:text-4xl font-black text-[#B91C1C] mt-1 tabular-nums">
                  {statsVisible ? countNegative : 54}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">Sample data, fictional hotel</div>
              </div>

              {/* Tile 4 */}
              <div className="card-soft p-5 bg-white border border-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Negative Review Rate</div>
                <div className="text-3xl sm:text-4xl font-black text-[#1F2937] mt-1 tabular-nums">
                  {statsVisible ? countRate : 18}%
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">Sample data, fictional hotel</div>
              </div>
            </div>

            {/* Interactive Theme Breakdown & Detail Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Interactive Bar Chart (Left 7 Cols) */}
              <div className="lg:col-span-7 card-soft p-6 bg-white">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-[#1F2937]">Theme Frequency & Negative Review Count</h3>
                  <span className="text-xs text-gray-400 font-mono">Total = 54 negative reviews</span>
                </div>

                <div className="space-y-3.5">
                  {SAMPLE_THEMES.map((theme) => {
                    const isSelected = activeTheme.id === theme.id;
                    const maxCount = 21;
                    const widthPercent = (theme.count / maxCount) * 100;

                    return (
                      <div
                        key={theme.id}
                        onClick={() => setActiveTheme(theme)}
                        className={`p-2.5 rounded-lg transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-red-50/70 border-red-200 shadow-sm'
                            : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
                          <span className={isSelected ? 'text-[#B91C1C]' : 'text-[#1F2937]'}>{theme.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono">
                              {theme.count} {theme.count === 1 ? 'review' : 'reviews'} ({theme.share}%)
                            </span>
                            <span
                              className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                theme.severity >= 9
                                  ? 'bg-red-100 text-red-800'
                                  : theme.severity >= 7
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              Sev {theme.severity}/10
                            </span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected
                                ? 'bg-[#B91C1C]'
                                : theme.severity >= 9
                                ? 'bg-red-600'
                                : theme.severity >= 7
                                ? 'bg-amber-600'
                                : 'bg-[#1F2937]'
                            }`}
                            style={{ width: `${widthPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Click any row to view diagnostic root cause & fix</span>
                  <span className="font-mono">Sample data, fictional hotel</span>
                </div>
              </div>

              {/* Theme Detail & Root Cause Drill-down (Right 5 Cols) */}
              <div id="theme-diagnostic-detail" className="lg:col-span-5 card-soft p-6 bg-white border border-gray-200 space-y-5">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                      Selected Theme Diagnostic
                    </span>
                    <h3 className="text-lg font-bold text-[#1F2937] leading-tight mt-0.5">{activeTheme.name}</h3>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-mono font-bold ${
                        activeTheme.severity >= 9
                          ? 'bg-red-100 text-red-800'
                          : activeTheme.severity >= 7
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Severity {activeTheme.severity}/10
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">{activeTheme.severityLabel}</div>
                  </div>
                </div>

                {/* Root Cause */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Systemic Root Cause Identified
                  </h4>
                  <p className="text-sm text-[#1F2937] leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {activeTheme.rootCause}
                  </p>
                </div>

                {/* Sample Review Proof Snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Sample Review Proof</h4>
                    <span className="text-[11px] text-[#B91C1C] font-mono">Public Record</span>
                  </div>
                  <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 space-y-2">
                    <p className="text-xs sm:text-sm italic text-gray-800 leading-snug">{activeTheme.sampleSnippet}</p>
                    <div className="flex items-center justify-end text-[11px] text-gray-500 pt-1 border-t border-red-100/60">
                      <a
                        href={activeTheme.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#B91C1C] hover:underline font-medium"
                      >
                        <span>View original review</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                      Quick Win (0–7 Days)
                    </span>
                    <p className="text-xs text-gray-700">{activeTheme.quickWin}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-0.5">
                      Structural Fix (30–60 Days)
                    </span>
                    <p className="text-xs text-gray-700">{activeTheme.structuralFix}</p>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-mono text-center pt-2">
                  Sample data, fictional hotel · Report includes full catalog of 54 proofs
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. WHAT'S IN THE REPORT (6 CARDS) */}
        <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">The Deliverables</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
              What’s inside your full diagnostic
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Every deliverable is crafted to help your leadership team understand exactly where operations break down,
              without ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="card-soft p-6 card-soft-hover">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-[#1F2937] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">1. Ranked Themes</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Review complaints grouped into concrete operational buckets (e.g. billing disputes, turnover speed,
                cleanliness) sorted strictly by frequency and revenue threat.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-soft p-6 card-soft-hover">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-[#B91C1C] flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">2. Severity Scores (1–10)</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                An objective 1–10 severity scale that distinguishes annoying one-offs (cold toast) from existential
                reputation hazards (security leaks, health risks, or lost property).
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-soft p-6 card-soft-hover">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1F2937] flex items-center justify-center mb-4">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">3. Proof Link for Every Review</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Complete traceability. Every row in your spreadsheet contains a direct clickable link to the public
                Google Maps review so you can independently verify every claim.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card-soft p-6 card-soft-hover">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">4. Prioritised Fix Plan</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                A step-by-step roadmap showing which operational fixes yield the fastest improvement to your overall
                star rating and guest retention.
              </p>
            </div>

            {/* Card 5 */}
            <div className="card-soft p-6 card-soft-hover">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">5. Quick Wins vs Structural Fixes</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Separates zero-cost tweaks (changing a checkout script or shift handover checklist) from capital
                investments (soundproofing, HVAC replacement, or software upgrades).
              </p>
            </div>

            {/* Card 6 */}
            <div className="card-soft p-6 card-soft-hover">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">6. Role View (No Individuals Named)</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Fixes mapped directly to operational roles (Front Desk Lead, Head Housekeeper, General Manager) to prevent
                finger-pointing while ensuring clear departmental accountability.
              </p>
            </div>
          </div>
        </section>

        {/* 7. WHO IT'S FOR */}
        <section className="py-16 md:py-24 bg-[#F3F4F6] border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">Industries Served</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
                Designed for venue owners and general managers
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                We work across customer-facing industries where public Google reviews make or break booking decisions.
              </p>
              <div className="inline-block mt-3 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                💡 <span className="font-semibold text-[#1F2937]">Note:</span> Theme names and severity criteria adapt
                specifically to your industry.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Hotel */}
              <div className="card-soft p-5 bg-white text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#1F2937] flex items-center justify-center mx-auto mb-3">
                  <Hotel className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Hotels & Resorts</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Turnover times, room cleanliness, HVAC noise, night staff demeanor, and booking deposits.
                </p>
              </div>

              {/* Restaurants */}
              <div className="card-soft p-5 bg-white text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#1F2937] flex items-center justify-center mx-auto mb-3">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Restaurants & Cafes</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Table seating delays, food temperature consistency, server attention, and billing disputes.
                </p>
              </div>

              {/* Clinics */}
              <div className="card-soft p-5 bg-white text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#1F2937] flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Clinics & Medical</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Waiting room duration, reception empathy, insurance clarity, and post-visit followup.
                </p>
              </div>

              {/* Salons */}
              <div className="card-soft p-5 bg-white text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#1F2937] flex items-center justify-center mx-auto mb-3">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Salons & Spas</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Booking calendar mixups, hygiene standards, consultation rushing, and price transparency.
                </p>
              </div>

              {/* Venues */}
              <div className="card-soft p-5 bg-white text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-[#1F2937] flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Entertainment Venues</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Queue flow, entry ticketing bottlenecks, sound/lighting issues, and security conduct.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. OUR METHOD (TRUST SECTION) */}
        <section id="method" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">Uncompromising Integrity</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
              Our Method & Trust Guarantees
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              We do not sell reputation management software, fake review removal, or marketing fluff. Here is the strict
              standard <span className="text-[#B91C1C] font-semibold">ReviewKeystone</span> upholds on every engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rule 1 */}
            <div className="card-soft p-6 border-t-2 border-t-[#B91C1C]">
              <div className="text-xs font-bold text-[#B91C1C] mb-1">STANDARD 01</div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Only public Google reviews are used</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We never request access to your Google Business Profile, internal PMS, or login credentials. We analyze
                only what your guests and competitors can already see.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="card-soft p-6 border-t-2 border-t-[#B91C1C]">
              <div className="text-xs font-bold text-[#B91C1C] mb-1">STANDARD 02</div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Every finding links to the original review</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Every statistic, theme count, and diagnostic conclusion is supported by an active direct link to the
                original Google Maps review as verifiable proof.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="card-soft p-6 border-t-2 border-t-[#B91C1C]">
              <div className="text-xs font-bold text-[#B91C1C] mb-1">STANDARD 03</div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Summaries are in our own words</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We distill emotional, chaotic customer rants into objective, neutral operational diagnoses so your team
                can act on root causes without distress.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="card-soft p-6 border-t-2 border-t-[#B91C1C]">
              <div className="text-xs font-bold text-[#B91C1C] mb-1">STANDARD 04</div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">No individuals are named</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our reports address roles, shifts, training protocols, and systems — never individual team members by
                name. We diagnose operational failures, not scapegoats.
              </p>
            </div>

            {/* Rule 5 */}
            <div className="card-soft p-6 border-t-2 border-t-[#B91C1C]">
              <div className="text-xs font-bold text-[#B91C1C] mb-1">STANDARD 05</div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Allegations are reported as allegations</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                When reviews contain serious claims (theft, food safety violations, or discrimination), we report them
                strictly as customer allegations rather than established facts.
              </p>
            </div>

            {/* Rule 6 */}
            <div className="card-soft p-6 border-t-2 border-t-[#B91C1C]">
              <div className="text-xs font-bold text-[#B91C1C] mb-1">STANDARD 06</div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">We say plainly what data cannot prove</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Google reviews represent voluntary self-selected feedback. We are always explicit about sample size
                limitations, timing gaps, and biases in public review sentiment.
              </p>
            </div>
          </div>
        </section>

        {/* 9. ABOUT (FOUNDER NOTE) */}
        <section className="py-16 md:py-24 bg-[#F3F4F6] border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-soft p-6 sm:p-10 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Founder Photo */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md mb-3 bg-gray-100">
                    <img
                      src={FOUNDER_PHOTO}
                      alt="Tahmid, Founder of ReviewKeystone"
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2937]">Tahmid</h3>
                  <p className="text-xs text-[#B91C1C] font-semibold">Founder, ReviewKeystone</p>
                  <p className="text-xs text-gray-500 mt-0.5">Dhaka, Bangladesh · Working Remotely Worldwide</p>
                </div>

                {/* Honest Note */}
                <div className="md:col-span-8 space-y-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">About the consultancy</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight">
                    An honest note from the founder
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-700 space-y-3 leading-relaxed">
                    <p>
                      I’m Tahmid, an undergraduate student in Bangladesh, and I run{' '}
                      <span className="text-[#B91C1C] font-semibold">ReviewKeystone</span> on my own. I analyze the
                      negative Google reviews of a business, group them into clear themes, and turn them into a
                      prioritized plan for what to fix first. I use AI tools to help with the analysis, and I check the
                      results myself. Every finding links to the original review, so you can check it too.
                    </p>
                    <p>
                      I started this to pay for my education and to help my dad. I’m new, so I don’t have a client list
                      yet. What I can show you is the work: send your Google Maps link and I’ll send you a free one-page
                      preview. If it’s useful, we can talk about the full report. If not, there’s no obligation.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-4 text-xs font-medium text-gray-600">
                    <span>Direct personal engagement</span>
                    <span aria-hidden="true">·</span>
                    <span>No outsourced assistants</span>
                    <span aria-hidden="true">·</span>
                    <span>Confidential review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">Questions &amp; Answers</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1F2937] tracking-tight mt-1">
              Clear answers before you start
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Everything you need to know about the process, deliverables, and free preview.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="card-soft overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#1F2937] hover:bg-gray-50/50 transition-colors"
                aria-expanded={openFaq === 0}
              >
                <span>What do you need from me?</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openFaq === 0 ? 'rotate-180 text-[#B91C1C]' : ''
                  }`}
                />
              </button>
              {openFaq === 0 && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  Just your Google Maps link (or your business name and location). That is all. You don’t need to fill out
                  long onboarding forms or download software.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="card-soft overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#1F2937] hover:bg-gray-50/50 transition-colors"
                aria-expanded={openFaq === 1}
              >
                <span>Do you need access to my accounts?</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openFaq === 1 ? 'rotate-180 text-[#B91C1C]' : ''
                  }`}
                />
              </button>
              {openFaq === 1 && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  No. We never ask for access to your Google Business Profile, login credentials, or internal systems.{' '}
                  <span className="text-[#B91C1C] font-semibold">ReviewKeystone</span> works entirely with publicly
                  posted customer reviews.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="card-soft overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#1F2937] hover:bg-gray-50/50 transition-colors"
                aria-expanded={openFaq === 2}
              >
                <span>Do you fix things for me?</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openFaq === 2 ? 'rotate-180 text-[#B91C1C]' : ''
                  }`}
                />
              </button>
              {openFaq === 2 && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  You get an actionable diagnostic and a prioritised fix plan; your team carries it out. We show you the
                  exact root causes, the role responsible, and quick wins vs structural remedies, giving your team a
                  clear blueprint without guesswork.
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="card-soft overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#1F2937] hover:bg-gray-50/50 transition-colors"
                aria-expanded={openFaq === 3}
              >
                <span>Which industries do you cover?</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openFaq === 3 ? 'rotate-180 text-[#B91C1C]' : ''
                  }`}
                />
              </button>
              {openFaq === 3 && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  We specialize in hotels, resorts, restaurants, cafes, medical clinics, dental practices, salons, spas,
                  and entertainment venues. If your business relies on Google Maps reputation to attract foot traffic and
                  direct bookings, this service is built for you.
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="card-soft overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#1F2937] hover:bg-gray-50/50 transition-colors"
                aria-expanded={openFaq === 4}
              >
                <span>How do I get started?</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openFaq === 4 ? 'rotate-180 text-[#B91C1C]' : ''
                  }`}
                />
              </button>
              {openFaq === 4 && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  Simply fill in the form below with your name, business name, and Google Maps link to request a free
                  preview. You’ll receive an initial 3-theme diagnostic preview at zero cost and with no obligation.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CLIENT REVIEWS & OVERALL RATING */}
        <ErrorBoundary>
          <ReviewsSection onSelectImage={setSelectedImage} />
        </ErrorBoundary>

        {/* 11. CONTACT & FREE PREVIEW REQUEST FORM */}
        <section id="contact-preview" className="py-16 md:py-24 bg-[#1F2937] text-white px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Zero Risk</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mt-1">
                Request for a free preview
              </h2>
              <p className="text-sm sm:text-base text-gray-300 mt-2">
                Send your business name and Google Maps link. Within 48 hours, you&apos;ll receive a free one-page
                summary of what guests are saying, with a quick fix.
              </p>
            </div>

            <div className="card-soft p-6 sm:p-8 bg-white text-[#1F2937] max-w-2xl mx-auto">
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Your Name <span className="text-[#B91C1C]">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="business" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Business Name <span className="text-[#B91C1C]">*</span>
                    </label>
                    <input
                      id="business"
                      type="text"
                      required
                      value={formBusiness}
                      onChange={(e) => setFormBusiness(e.target.value)}
                      placeholder="e.g. Royal Oak Hotel & Spa"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="maps" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Google Maps Link <span className="text-[#B91C1C]">*</span>
                    </label>
                    <input
                      id="maps"
                      type="text"
                      required
                      value={formMapsLink}
                      onChange={(e) => setFormMapsLink(e.target.value)}
                      placeholder="Paste your Google Maps link or venue search URL"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none transition-all font-mono text-xs"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Tip: Open Google Maps, search your venue, and copy the browser URL or Share link.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Your Email Address <span className="text-[#B91C1C]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="you@yourbusiness.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="concern" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Specific operational concern (Optional)
                    </label>
                    <textarea
                      id="concern"
                      rows={2}
                      value={formConcern}
                      onChange={(e) => setFormConcern(e.target.value)}
                      placeholder="e.g. Housekeeping scores have dipped recently; want to know if it is isolated to weekend shifts."
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request free preview diagnostic</span>
                    <Send className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-gray-500 text-center pt-1">
                    Free, no commitment. We will send the preview directly to your email within 48 hours.
                  </p>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937]">Preview Request Prepared!</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-[#1F2937]">{formName}</strong>. Your request for{' '}
                    <strong className="text-[#1F2937]">{formBusiness}</strong> is ready. Click below to send directly via
                    email or WhatsApp:
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={mailtoLink}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1F2937] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send via Email Client</span>
                    </a>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message on WhatsApp</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline pt-2 block mx-auto"
                  >
                    Edit details or submit another business
                  </button>
                </div>
              )}

              {/* Direct Founder Contact Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center mb-3">
                  Prefer direct contact? Reach founder Tahmid directly
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`mailto:${founderEmail}?subject=Inquiry%20from%20ReviewKeystone%20Website`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#B91C1C]" />
                    <span className="truncate">{founderEmail}</span>
                  </a>
                  <a
                    href={`https://wa.me/${whatsappIntl}?text=Hi%20Tahmid,%20I%20have%20a%20question%20about%20ReviewKeystone`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span>WhatsApp: {whatsappNumber}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 12. FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 text-xs text-gray-500">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#1F2937] text-white flex items-center justify-center font-bold text-xs">
                RK
              </span>
              <span className="font-bold text-[#B91C1C] text-sm">ReviewKeystone</span>
              <span aria-hidden="true" className="text-gray-300">·</span>
              <span>
                © {new Date().getFullYear()} <span className="text-[#B91C1C] font-semibold">ReviewKeystone</span>. All
                rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors">
                How it works
              </a>
              <a href="#sample-report" className="hover:text-gray-900 transition-colors">
                Sample report
              </a>
              <a href="#method" className="hover:text-gray-900 transition-colors">
                Method
              </a>
              <a href="#faq" className="hover:text-gray-900 transition-colors">
                Q&A
              </a>
              <a href={`mailto:${founderEmail}`} className="hover:text-[#B91C1C] transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
            <p>
              <strong className="text-gray-600">Strict Data Transparency:</strong> All sample data on this page is
              illustrative (Sample data, fictional hotel).
            </p>
            <p className="text-center sm:text-right">
              We only email you regarding your requested review diagnostic. To opt out or delete your request data, reply
              "Unsubscribe" at any time.
            </p>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal for Sample Report Pages */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-700 hover:text-black z-10 transition-colors shadow-sm"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged Review Image Attachment"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
