import React from 'react';
import { Shield } from 'lucide-react';

export class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let message = "Une erreur inattendue est survenue.";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.userMessage) message = parsed.userMessage;
      } catch (e) {
        if (error.message) message = error.message;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-4">Oups ! Quelque chose a mal tourné</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-violet text-white py-4 rounded-xl font-bold shadow-lg shadow-violet/20"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
