import React from 'react';

const StatItem = ({ value, label }) => {
    return (
        <div className="text-center p-6 border-r last:border-r-0 border-border md:last:border-r-0">
            <div className="text-5xl md:text-6xl font-black text-accent mb-2">{value}</div>
            <div className="text-textSecondary text-xs uppercase tracking-[0.2em] font-bold">{label}</div>
        </div>
    );
};

export default StatItem;
