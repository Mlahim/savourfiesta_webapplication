import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="max-w-xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                        <div className="bg-red-600 p-4 text-white">
                            <h2 className="text-xl font-bold">Something went wrong</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">An error occurred while rendering this page.</p>
                            <details className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                                <summary className="cursor-pointer font-medium text-red-600 mb-2">Error Details</summary>
                                <div className="text-xs font-mono text-gray-800">
                                    <p className="font-bold mb-1">{this.state.error && this.state.error.toString()}</p>
                                    <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                                </div>
                            </details>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
