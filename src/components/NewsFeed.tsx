"use client";

import { useState } from 'react';
import { ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsItem {
    title: string;
    url: string;
    publisher: string;
    providerPublishTime?: number;
}

interface NewsFeedProps {
    news: NewsItem[];
    onRefresh?: () => Promise<void> | void;
}

export default function NewsFeed({ news, onRefresh }: NewsFeedProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh || isRefreshing) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            // Keep it spinning for at least half a second so it feels responsive
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    return (
        <div className="glass-panel animate-fade-in delay-300" style={{ padding: '1.5rem', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3>Market & Global News</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Live Feed</span>
                    {onRefresh && (
                        <button 
                            onClick={handleRefresh} 
                            disabled={isRefreshing}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: isRefreshing ? 'wait' : 'pointer', 
                                padding: '4px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: isRefreshing ? 'var(--accent-primary)' : 'var(--text-muted)' 
                            }}
                            title="Refresh News"
                        >
                            <RefreshCw size={14} className={`transition-colors ${isRefreshing ? 'animate-spin' : 'hover:text-primary'}`} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                {news && news.length > 0 ? (
                    news.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-card"
                            style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.2rem' }}
                        >
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.4, margin: 0 }}>
                                {item.title}
                            </h4>

                            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.8rem', marginTop: 'auto' }}>
                                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.publisher}</span>
                                <div className="flex items-center gap-1">
                                    {item.providerPublishTime && (
                                        <>
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(item.providerPublishTime * 1000), { addSuffix: true })}
                                        </>
                                    )}
                                    <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>
                        No recent news articles found.
                    </div>
                )}
            </div>
        </div>
    );
}
