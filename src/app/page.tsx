"use client";

import { useEffect, useState } from 'react';
import { Activity, Clock, TrendingUp, LineChart } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MarketChart from '@/components/MarketChart';
import AIAnalyzer from '@/components/AIAnalyzer';
import NewsFeed from '@/components/NewsFeed';
import GlobalIndicators from '@/components/GlobalIndicators';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let quoteInterval: NodeJS.Timeout;
    let newsInterval: NodeJS.Timeout;

    async function fetchMarketData() {
      try {
        const res = await fetch('/api/market');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setData(json);

        // Start live polling after initial data load
        startRealtimeUpdates();
      } catch (err) {
        setError('Could not establish connection to market data servers.');
      } finally {
        setLoading(false);
      }
    }

    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/market/quote');
        if (res.ok) {
          const { sensexQuote, ...activeQuote } = await res.json();
          setData((prev: any) => prev ? { ...prev, quote: activeQuote, sensexQuote } : prev);
        }
      } catch (err) {
        console.error("Failed to update realtime quote", err);
      }
    };

    const fetchNews = async () => {
      try {
        const res = await fetch('/api/market/news');
        if (res.ok) {
          const { news } = await res.json();
          setData((prev: any) => prev ? { ...prev, news } : prev);
        }
      } catch (err) {
        console.error("Failed to update realtime news", err);
      }
    };

    const startRealtimeUpdates = () => {
      // 1-second interval for market value
      quoteInterval = setInterval(fetchQuote, 1000);
      // 60-second interval for global & market news
      newsInterval = setInterval(fetchNews, 60000);
    };

    fetchMarketData();

    return () => {
      clearInterval(quoteInterval);
      clearInterval(newsInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className="flex-col items-center gap-4">
          <Activity size={48} className="text-gradient" style={{ animation: 'pulse 1.5s infinite' }} />
          <h2 className="text-muted">Analyzing Markets...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '100vh', padding: '2rem' }}>
        <div className="glass-panel text-center" style={{ padding: '3rem', maxWidth: '500px' }}>
          <h2 className="text-danger">Connection Error</h2>
          <p className="text-muted" style={{ margin: '1rem 0' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
      </div>
    );
  }

  const { quote, sensexQuote, chartData, news, prediction } = data;

  const handleRefreshNews = async () => {
    try {
      const res = await fetch(`/api/market/news?t=${Date.now()}`);
      if (res.ok) {
        const { news } = await res.json();
        setData((prev: any) => prev ? { ...prev, news } : prev);
      }
    } catch (err) {
      console.error("Failed to manual refresh news", err);
    }
  };

  return (
    <main style={{ padding: 'var(--main-padding)', maxWidth: '1440px', margin: '0 auto' }}>
      <div className="bg-glow"></div>
      <div className="bg-glow-extra"></div>

      {/* Header */}
      <header className="flex flex-wrap justify-between items-center animate-fade-in" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <div className="flex items-center gap-3">
          <TrendingUp className="text-gradient" size={32} />
          <div>
            <h1>Market Analyzer</h1>
            <p className="text-muted">Nifty 50 Engine ({quote.symbol})</p>
          </div>
        </div>

        <div className="glass-card flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: quote.marketState === 'REGULAR' ? 'var(--success)' : 'var(--warning)', boxShadow: `0 0 10px ${quote.marketState === 'REGULAR' ? 'var(--success)' : 'var(--warning)'}` }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{quote.marketState} MARKET</span>
        </div>
      </header>

      {/* Live Global Indicators Dashboard */}
      <GlobalIndicators />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="NIFTY"
          value={`₹${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          change={quote.change}
          changePercent={quote.changePercent}
          icon={<LineChart size={18} className="text-accent" color="var(--accent-primary)" />}
        />
        <MetricCard
          title="SENSEX"
          value={`₹${sensexQuote?.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '---'}`}
          change={sensexQuote?.change}
          changePercent={sensexQuote?.changePercent}
          icon={<LineChart size={18} className="text-accent" color="var(--accent-primary)" />}
          delay="delay-150"
        />
        <MetricCard
          title="Day High"
          value={`₹${chartData[chartData.length - 1]?.high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={18} color="var(--success)" />}
          delay="delay-200"
        />
        <MetricCard
          title="Day Low"
          value={`₹${chartData[chartData.length - 1]?.low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={18} color="var(--danger)" style={{ transform: 'rotate(180deg)' }} />}
          delay="delay-300"
        />
        <MetricCard
          title="Last Updated"
          value={new Date(quote.regularMarketTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          icon={<Clock size={18} color="var(--warning)" />}
          delay="delay-300"
        />
      </div>

      {/* Main Content: Chart */}
      <div style={{ marginBottom: '2rem' }}>
        <MarketChart data={chartData} />
      </div>

      {/* AI Recommendation Panel */}
      <div style={{ marginBottom: '2rem' }}>
        <AIAnalyzer prediction={prediction} />
      </div>

      {/* Full Width News Feed */}
      <div style={{ marginBottom: '2rem', height: '400px' }}>
        <NewsFeed news={news} onRefresh={handleRefreshNews} />
      </div>
    </main>
  );
}
