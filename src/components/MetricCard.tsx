"use client";

import { ReactNode } from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changePercent?: number;
    icon?: ReactNode;
    delay?: string;
    action?: ReactNode;
}

export default function MetricCard({ title, value, change, changePercent, icon, delay = "delay-100", action }: MetricCardProps) {
    const isPositive = change !== undefined && change >= 0;
    const isNegative = change !== undefined && change < 0;

    const valueColorClass = isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-primary';

    return (
        <div className={`glass-card animate-fade-in ${delay}`}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h4 className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon} {title}
                </h4>
            </div>

            <div className="flex-col gap-1">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{value}</span>
                    {action && <div>{action}</div>}
                </div>

                {change !== undefined && changePercent !== undefined && (
                    <div className={`flex items-center gap-1 ${valueColorClass}`} style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {isPositive ? '▲ +' : isNegative ? '▼ ' : ''}
                        {Math.abs(change).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        ({Math.abs(changePercent).toFixed(2)}%)
                    </div>
                )}
            </div>
        </div>
    );
}
