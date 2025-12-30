import React from 'react';

const SkeletonLoader = ({ type = 'card', lines = 3, className = '' }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-6 animate-pulse ${className}`}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[...Array(lines)].map((_, i) => (
                                <div key={i} className="h-3 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'table':
                return (
                    <div className={`bg-white border border-[#F3F4F6] rounded-lg shadow-sm animate-pulse ${className}`}>
                        <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            {[...Array(lines)].map((_, i) => (
                                <div key={i} className="flex space-x-4 mb-3">
                                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'list':
                return (
                    <div className={`space-y-2 animate-pulse ${className}`}>
                        {[...Array(lines)].map((_, i) => (
                            <div key={i} className="bg-white border border-[#F3F4F6] rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            
            default:
                return (
                    <div className={`bg-gray-200 rounded animate-pulse ${className}`}>
                        <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                );
        }
    };

    return renderSkeleton();
};

export default SkeletonLoader; 