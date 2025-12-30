import React from 'react';

const SimpleChart = ({ data, type = 'bar', title, className = '' }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    const renderBarChart = () => (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-gray-600 truncate">
                        {item.label}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-[#3465B4] to-[#C62B34] h-full rounded-full transition-all duration-500"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-gray-800 text-right">
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        return (
            <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const colors = ['#3465B4', '#C62B34', '#F8D7DA', '#E3EAFD', '#FFD700'];
                        const color = colors[index % colors.length];

                        return (
                            <path
                                key={index}
                                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={color}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{total}</div>
                        <div className="text-xs text-gray-600">Total</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLineChart = () => (
        <div className="relative h-32">
            <svg className="w-full h-full">
                <polyline
                    fill="none"
                    stroke="#3465B4"
                    strokeWidth="2"
                    points={data.map((item, index) => 
                        `${(index / (data.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                    ).join(' ')}
                />
                {data.map((item, index) => (
                    <circle
                        key={index}
                        cx={`${(index / (data.length - 1)) * 100}%`}
                        cy={`${100 - (item.value / maxValue) * 100}%`}
                        r="3"
                        fill="#C62B34"
                    />
                ))}
            </svg>
        </div>
    );

    const renderChart = () => {
        switch (type) {
            case 'pie':
                return renderPieChart();
            case 'line':
                return renderLineChart();
            default:
                return renderBarChart();
        }
    };

    return (
        <div className={`bg-white border border-[#F3F4F6] rounded-xl p-6 shadow-sm ${className}`}>
            {title && (
                <h3 className="text-lg font-semibold text-[#C62B34] mb-4">{title}</h3>
            )}
            {renderChart()}
            {type === 'pie' && (
                <div className="mt-4 space-y-2">
                    {data.map((item, index) => {
                        const colors = ['#3465B4', '#C62B34', '#F8D7DA', '#E3EAFD', '#FFD700'];
                        const color = colors[index % colors.length];
                        return (
                            <div key={index} className="flex items-center space-x-2">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                ></div>
                                <span className="text-sm text-gray-600">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SimpleChart; 