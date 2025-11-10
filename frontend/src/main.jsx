import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import App from "./App"; // ← existing column comparison UI
import { ReportDifferenceAnalyzer } from "./pages/ReportDifferenceAnalyzer";
import "./index.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <nav className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between">
          <h1 className="font-semibold text-lg">Report Verification System</h1>
          <div className="space-x-6">
            <Link to="/" className="hover:text-blue-200">Column Validator</Link>
            <Link to="/analyzer" className="hover:text-blue-200">Report Difference Analyzer</Link>
          </div>
        </nav>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/analyzer" element={<ReportDifferenceAnalyzer />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);