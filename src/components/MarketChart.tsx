"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface MarketChartProps {
    data: {
        date: string;
        close: number;
        open: number;
        high: number;
        low: number;
        volume: number;
    }[];
}

export default function MarketChart({ data }: MarketChartProps) {
    if (!data || data.length === 0) return null;

    const chartData = data.map(d => ({
        ...d,
        formattedDate: format(new Date(d.date), 'MMM dd'),
    }));

    // Detect trend to set gradient colors
    const isUp = chartData.length > 1 && chartData[chartData.length - 1].close >= chartData[0].close;
    const strokeColor = isUp ? 'var(--success)' : 'var(--danger)';
    const glowId = "glowFilter";

    // Dynamic min max calculation for cleaner y-axis
    const minVal = Math.min(...chartData.map(d => d.low)) - 100;
    const maxVal = Math.max(...chartData.map(d => d.high)) + 100;

    return (
        <div className="glass-card animate-fade-in delay-200" style={{ height: '70vh', minHeight: '500px', width: '100%', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '2rem 2rem 0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="flex-col gap-1">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <Layers className="text-gradient" size={24} /> 
                        <span className="text-gradient" style={{ fontSize: '1.5rem' }}>Nifty 50 Historic Trend</span>
                    </h3>
                    <span className="text-muted">30-Day Market Analysis</span>
                </div>
                
                <div className="flex items-center gap-2 glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '30px', border: `1px solid ${strokeColor}44` }}>
                    {isUp ? <TrendingUp size={18} color={strokeColor} /> : <TrendingDown size={18} color={strokeColor} />}
                    <span style={{ color: strokeColor, fontWeight: 600, letterSpacing: '1px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        {isUp ? 'Bullish Trend' : 'Bearish Trend'}
                    </span>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', marginTop: '-1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 30, right: 30, left: 30, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.6} />
                                <stop offset="60%" stopColor={strokeColor} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="formattedDate"
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'var(--text-muted)', fontSize: 13, fontFamily: 'Outfit' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                            dy={10}
                        />
                        <YAxis
                            domain={[minVal, maxVal]}
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'var(--text-muted)', fontSize: 13, fontFamily: 'Outfit' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => '₹' + val.toLocaleString('en-IN')}
                            width={80}
                            dx={-5}
                        />
                        <Tooltip
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            contentStyle={{
                                backgroundColor: 'var(--bg-tertiary)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '1rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                color: 'var(--text-primary)'
                            }}
                            itemStyle={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.2rem', padding: '4px 0' }}
                            labelStyle={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                            formatter={(value: any) => [`₹${(value as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'NIFTY Level']}
                        />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={strokeColor}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorClose)"
                            filter={`url(#${glowId})`}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
