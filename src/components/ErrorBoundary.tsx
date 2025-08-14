import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
    <h2 className="text-red-800 font-semibold mb-2">Có lỗi xảy ra</h2>
    <p className="text-red-600 text-sm">{error.message}</p>
    <button
      className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      onClick={() => window.location.reload()}
    >
      Tải lại trang
    </button>
  </div>
);