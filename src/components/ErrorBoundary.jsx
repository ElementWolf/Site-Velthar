"use client"

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Actualizar el estado para que el siguiente render muestre la UI de fallback
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log del error
        console.error('Error capturado por ErrorBoundary:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // UI de fallback personalizada
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD]">
                    <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Algo salió mal
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#C62B34] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A52A2A] transition-colors"
                        >
                            Recargar Página
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Ver detalles del error (solo desarrollo)
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                    {this.state.error && this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 