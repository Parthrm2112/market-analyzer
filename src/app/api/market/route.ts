import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)();

// Simple heuristic for prediction
function generatePrediction(currentPrice: number, changePercent: number, historyPrices: number[], newsSentiment: number) {
  // Calculate slightly simple moving average (SMA)
  const sma10 = historyPrices.slice(-10).reduce((a, b) => a + b, 0) / 10;

  // Use the actual live change percent from the market quote for accurate day momentum
  const momentum = changePercent / 100;

  let score = 0;
  let reasons: string[] = [];

  // 1. Technical indicators
  if (currentPrice > sma10) {
    score += 1;
    reasons.push("Trading above 10-day moving average (Bullish Signal)");
  } else {
    score -= 1;
    reasons.push("Trading below 10-day moving average (Bearish Signal)");
  }

  // Heavily weight the live market trend today
  if (momentum > 0.003) { // +0.3%
    score += 1.5;
    reasons.push(`Strong positive momentum today (+${changePercent.toFixed(2)}%)`);
  } else if (momentum < -0.003) { // -0.3%
    score -= 1.5;
    reasons.push(`Strong negative trend today (${changePercent.toFixed(2)}%)`);
  } else if (momentum > 0) {
    score += 0.5;
    reasons.push("Slightly positive market trend");
  } else {
    score -= 0.5;
    reasons.push("Slightly negative market trend");
  }

  // 2. News sentiment
  if (newsSentiment > 0.3) {
    score += 1;
    reasons.push("Overall news sentiment is positive");
  } else if (newsSentiment < -0.3) {
    score -= 1;
    reasons.push("Overall news sentiment is negative");
  } else {
    reasons.push("News sentiment is mixed/neutral");
  }

  let action = 'HOLD';
  let confidence = 50; // out of 100
  let color = 'var(--text-primary)';
  let suggestedOption = '';

  // Nifty strikes are usually in multiples of 50. Let's round the current price to the nearest 50 for ITM/ATM/OTM calculation.
  const nearestStrike = Math.round(currentPrice / 50) * 50;

  let entry = Math.round(currentPrice);
  let target = 0;
  let stopLoss = 0;

  if (score >= 1.5) {
    action = `BUY ${nearestStrike} CE`;
    confidence = Math.min(100, 50 + score * 15);
    color = 'var(--success)';
  } else if (score <= -1.5) {
    action = `BUY ${nearestStrike} PE`;
    confidence = Math.min(100, 50 + Math.abs(score) * 15);
    color = 'var(--danger)';
  } else {
    action = 'SIDEWAYS (WAIT)';
    confidence = Math.max(50, 50 + Math.abs(score) * 10);
    color = 'var(--warning)';
  }

  if (action.includes('CE')) {
    target = entry + 120;
    stopLoss = entry - 60;
  } else if (action.includes('PE')) {
    target = entry - 120;
    stopLoss = entry + 60;
  } else {
    // No target/SL for sideways
    target = 0;
    stopLoss = 0;
  }

  return { action, confidence, reasons, color, entry, target, stopLoss };
}

export async function GET() {
  try {
    const symbol = '^NSEI'; // Nifty 50 Index

    let quote: any;
    let sensexQuote: any;
    let result: any[];
    try {
      const quoteRes = await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.quote('^BSESN')
      ]);
      quote = quoteRes[0];
      sensexQuote = quoteRes[1];
      
      const period1 = new Date();
      period1.setDate(period1.getDate() - 40);
      const chartRes = await yahooFinance.chart(symbol, { period1, period2: new Date(), interval: '1d' });
      result = chartRes.quotes;
    } catch (e) {
      // Retry once on ECONNRESET network drop
      await new Promise(r => setTimeout(r, 1000));
      const quoteRes = await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.quote('^BSESN')
      ]);
      quote = quoteRes[0];
      sensexQuote = quoteRes[1];

      const period1 = new Date();
      period1.setDate(period1.getDate() - 40);
      const chartRes = await yahooFinance.chart(symbol, { period1, period2: new Date(), interval: '1d' });
      result = chartRes.quotes;
    }
    const historicalData = result.slice(-30).map((item: any) => ({
      date: item.date.toISOString(),
      close: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume
    }));

    // 3. Get News (Using RSS Parsers)
    const Parser = require('rss-parser');
    const parser = new Parser();

    const [cnbcRes, ndtvRes, mcRes] = await Promise.allSettled([
      parser.parseURL('https://www.cnbc.com/id/100003114/device/rss/rss.html'),
      parser.parseURL('https://feeds.feedburner.com/ndtvprofit-latest'),
      parser.parseURL('https://www.moneycontrol.com/rss/MCtopnews.xml'),
    ]);

    const cnbcNews = cnbcRes.status === 'fulfilled' ? cnbcRes.value.items.map((i: any) => ({
      title: i.title,
      link: i.link,
      publisher: 'CNBC',
      providerPublishTime: i.pubDate ? new Date(i.pubDate).toISOString() : null,
    })) : [];

    const ndtvNews = ndtvRes.status === 'fulfilled' ? ndtvRes.value.items.map((i: any) => ({
      title: i.title,
      link: i.link,
      publisher: 'NDTV Profit',
      providerPublishTime: i.pubDate ? new Date(i.pubDate).toISOString() : null,
    })) : [];

    const mcNews = mcRes.status === 'fulfilled' ? mcRes.value.items.map((i: any) => ({
      title: i.title,
      link: i.link,
      publisher: 'MoneyControl',
      providerPublishTime: i.pubDate ? new Date(i.pubDate).toISOString() : null,
    })) : [];

    const allNews = [...cnbcNews, ...ndtvNews, ...mcNews].sort((a: any, b: any) => {
      return new Date(b.providerPublishTime || 0).getTime() - new Date(a.providerPublishTime || 0).getTime();
    }).slice(0, 15); // limit appropriately

    // Naive sentiment analysis: count positive/negative keywords in titles
    let sentimentScore = 0;
    const positiveWords = ['up', 'gain', 'surges', 'rally', 'bull', 'high', 'positive', 'growth'];
    const negativeWords = ['down', 'fall', 'plunges', 'drop', 'bear', 'low', 'negative', 'crash'];

    const news = allNews.map((n: any) => {
      const titleLower = n.title.toLowerCase();
      let isPositive = positiveWords.some(w => titleLower.includes(w));
      let isNegative = negativeWords.some(w => titleLower.includes(w));
      if (isPositive) sentimentScore += 0.5;
      if (isNegative) sentimentScore -= 0.5;

      return {
        title: n.title,
        url: n.link,
        publisher: n.publisher,
        providerPublishTime: n.providerPublishTime ? Math.floor(new Date(n.providerPublishTime).getTime() / 1000) : null,
      };
    });

    // 4. Generate AI Prediction
    const closePrices = historicalData.map(d => d.close);
    const prediction = generatePrediction(
      quote.regularMarketPrice || closePrices[closePrices.length - 1],
      quote.regularMarketChangePercent || 0,
      closePrices,
      sentimentScore
    );

    return NextResponse.json({
      quote: {
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        symbol: quote.symbol,
        marketState: quote.marketState,
        regularMarketTime: quote.regularMarketTime,
      },
      sensexQuote: {
        price: sensexQuote.regularMarketPrice,
        change: sensexQuote.regularMarketChange,
        changePercent: sensexQuote.regularMarketChangePercent,
        symbol: sensexQuote.symbol,
      },
      chartData: historicalData,
      news,
      prediction
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
