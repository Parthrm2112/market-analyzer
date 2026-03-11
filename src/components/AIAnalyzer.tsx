"use client";

import { AlertCircle, CheckCircle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface AIAnalyzerProps {
    prediction: {
        action: string;
        confidence: number;
        reasons: string[];
        color: string;
        entry?: number;
        target?: number;
        stopLoss?: number;
    };
}

export default function AIAnalyzer({ prediction }: AIAnalyzerProps) {
    const { action, confidence, reasons, color, entry, target, stopLoss } = prediction;

    const getIcon = () => {
        if (action.includes('CE')) {
            return <TrendingUp size={32} color={color} />;
        } else if (action.includes('PE')) {
            return <TrendingDown size={32} color={color} />;
        }
        return <Minus size={32} color={color} />;
    };

    const getReasonIcon = (reason: string) => {
        if (reason.toLowerCase().includes('bullish') || reason.toLowerCase().includes('positive')) {
            return <CheckCircle size={16} className="text-success" />;
        } else if (reason.toLowerCase().includes('bearish') || reason.toLowerCase().includes('negative')) {
            return <AlertCircle size={16} className="text-danger" />;
        }
        return <Info size={16} className="text-warning" />;
    };

    return (
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-gradient">AI Market Analyzer</span>
            </h3>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Personalized analysis based on Nifty 50 technicals and latest global news.</p>

            <div className="flex items-center justify-between" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: `1px solid ${color}33` }}>
                <div className="flex-col gap-2">
                    <span className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Recommendation</span>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: color, letterSpacing: '2px' }}>
                            {action}
                        </span>
                    </div>
                </div>

                <div className="flex-col items-center gap-1" style={{ textAlign: 'right' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="80" height="80" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={color}
                                strokeWidth="8"
                                strokeDasharray={`${(confidence / 100) * 283} 283`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', fontWeight: 700, fontSize: '1.2rem', color }}>
                            {confidence}%
                        </div>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Confidence</span>
                </div>
            </div>

            {entry && target && stopLoss && (
                <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '2rem' }}>
                    <div className="glass-card flex-col items-center justify-center p-3 text-center" style={{ gap: '0.25rem', border: '1px solid var(--warning)33' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Entry (Spot)</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{entry}</span>
                    </div>
                    <div className="glass-card flex-col items-center justify-center p-3 text-center" style={{ gap: '0.25rem', border: '1px solid var(--success)55', background: 'var(--success)05' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Target</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{target}</span>
                    </div>
                    <div className="glass-card flex-col items-center justify-center p-3 text-center" style={{ gap: '0.25rem', border: '1px solid var(--danger)55', background: 'var(--danger)05' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Stop Loss</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)' }}>{stopLoss}</span>
                    </div>
                </div>
            )}

            {entry && target && stopLoss && (
                <div style={{ marginBottom: '2rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Option Strategy Payoff</h4>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Estimated Risk/Reward</span>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={(() => {
                                    const strikeMatch = action.match(/\d+/);
                                    if (!strikeMatch) return [];
                                    const strike = parseInt(strikeMatch[0]);
                                    const isCE = action.includes('CE');
                                    const premium = 120; // estimated ATM premium

                                    const data = [];
                                    for (let i = -250; i <= 250; i += 25) {
                                        const spot = strike + i;
                                        const pnl = isCE
                                            ? Math.max(0, spot - strike) - premium
                                            : Math.max(0, strike - spot) - premium;
                                        data.push({ spot, pnl });
                                    }
                                    return data;
                                })()}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="spot" stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickFormatter={(v) => v.toString().slice(-3)} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    formatter={(value: any) => [`₹${(value as number) * 25}`, 'Estimated PnL']}
                                    labelFormatter={(label) => `Nifty @ ${label}`}
                                />
                                <Area type="monotone" dataKey="pnl" stroke={color} strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div>
                <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Key Drivers</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reasons.map((reason, i) => (
                        <li key={i} className="flex" style={{ gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
                            <div style={{ marginTop: '2px' }}>
                                {getReasonIcon(reason)}
                            </div>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {reason}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
