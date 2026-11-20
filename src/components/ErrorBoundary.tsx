import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-8 p-6 card-soft bg-white border border-red-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937]">Unable to load reviews right now</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            There was a problem connecting to the reviews database. Please refresh or try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1F2937] hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
