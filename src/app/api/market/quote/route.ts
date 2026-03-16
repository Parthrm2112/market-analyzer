import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)();

export async function GET() {
    try {
        const symbol = '^NSEI'; // Nifty 50 Index

        const [quote, sensexQuote]: any = await Promise.all([
            yahooFinance.quote(symbol),
            yahooFinance.quote('^BSESN')
        ]);

        return NextResponse.json({
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            symbol: quote.symbol,
            marketState: quote.marketState,
            regularMarketTime: quote.regularMarketTime,
            sensexQuote: {
                price: sensexQuote.regularMarketPrice,
                change: sensexQuote.regularMarketChange,
                changePercent: sensexQuote.regularMarketChangePercent,
                symbol: sensexQuote.symbol,
            }
        });
    } catch (error) {
        console.error('Quote API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch quote data' }, { status: 500 });
    }
}
