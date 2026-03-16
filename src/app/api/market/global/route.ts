import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const symbols = ['^DJI', '^IXIC', '^NSEI', 'CL=F'];
    const names: any = {
      '^DJI': 'Dow Jones',
      '^IXIC': 'Nasdaq',
      '^NSEI': 'Gift Nifty',
      'CL=F': 'Crude Oil'
    };

    const quotes = await Promise.all(
      symbols.map(s => yahooFinance.quote(s).catch(() => null))
    );

    const indicators = quotes
      .filter(q => q !== null)
      .map((q: any) => ({
        name: names[q.symbol] || q.symbol,
        symbol: q.symbol,
        price: q.regularMarketPrice,
        changePercent: q.regularMarketChangePercent
      }));

    return NextResponse.json({ indicators });
  } catch (error) {
    console.error('Global API Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

