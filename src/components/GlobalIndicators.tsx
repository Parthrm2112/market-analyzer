"use client";

import { useEffect, useState } from 'react';
import { Globe, TrendingDown, TrendingUp } from 'lucide-react';

interface Indicator {
    name: string;
    symbol: string;
    price: number;
    changePercent: number;
}

export default function GlobalIndicators() {
    const [indicators, setIndicators] = useState<Indicator[]>([
        { name: 'Dow Jones', symbol: '^DJI', price: 38722.69, changePercent: -0.18 },
        { name: 'Nasdaq', symbol: '^IXIC', price: 16085.11, changePercent: -1.16 },
        { name: 'Gift Nifty', symbol: '^NSEI', price: 22355.50, changePercent: -0.80 },
        { name: 'Crude Oil', symbol: 'CL=F', price: 78.01, changePercent: 0.81 }
    ]);

    useEffect(() => {
        async function fetchGlobal() {
            try {
                const res = await fetch(`/api/market/global?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.indicators && data.indicators.length > 0) {
                        setIndicators(data.indicators);
                    }
                }
            } catch (err) {
                console.error("Failed to load global indicators", err);
            }
        }
        fetchGlobal();
        
        // Refresh every 60 seconds
        const interval = setInterval(fetchGlobal, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!indicators || indicators.length === 0) return null;

    return (
        <div className="glass-panel animate-fade-in flex items-center gap-4" style={{ padding: '0.75rem 1.5rem', marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap', borderRadius: 'var(--border-radius-md)' }}>
            <div className="flex items-center gap-2" style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1rem', flexShrink: 0 }}>
                <Globe size={18} className="text-primary" />
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Global Markets</span>
            </div>
            
            <div className="flex items-center gap-6">
                {indicators.map((ind, i) => {
                    const isUp = ind.changePercent >= 0;
                    const colorVar = isUp ? 'var(--success)' : 'var(--danger)';
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{ind.name}</span>
                            <div className="flex items-center gap-1 glass-card" style={{ padding: '2px 8px', borderRadius: '12px', background: `${colorVar}11`, border: `1px solid ${colorVar}33` }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: colorVar, boxShadow: `0 0 6px ${colorVar}` }} />
                                <span style={{ color: colorVar, fontSize: '0.8rem', fontWeight: 600, paddingLeft: '2px' }}>
                                    {isUp ? '+' : ''}{ind.changePercent?.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
