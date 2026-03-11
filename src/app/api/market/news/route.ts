import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

const yahooFinance = new (YahooFinance as any)();

export async function GET() {
    try {
        // Fetch RSS feeds for live market news update
        const Parser = require('rss-parser');
        const parser = new Parser();

        const [cnbcRes, ndtvRes, mcRes] = await Promise.allSettled([
            parser.parseURL('https://www.cnbc.com/id/100003114/device/rss/rss.html'),
            parser.parseURL('https://feeds.feedburner.com/ndtvprofit-latest'),
            parser.parseURL('https://www.moneycontrol.com/rss/MCtopnews.xml'),
        ]);

        const cnbcNews = cnbcRes.status === 'fulfilled' ? cnbcRes.value.items.map((i: any) => ({
            title: i.title,
            url: i.link,
            publisher: 'CNBC',
            providerPublishTime: i.pubDate ? Math.floor(new Date(i.pubDate).getTime() / 1000) : null,
        })) : [];

        const ndtvNews = ndtvRes.status === 'fulfilled' ? ndtvRes.value.items.map((i: any) => ({
            title: i.title,
            url: i.link,
            publisher: 'NDTV Profit',
            providerPublishTime: i.pubDate ? Math.floor(new Date(i.pubDate).getTime() / 1000) : null,
        })) : [];

        const mcNews = mcRes.status === 'fulfilled' ? mcRes.value.items.map((i: any) => ({
            title: i.title,
            url: i.link,
            publisher: 'MoneyControl',
            providerPublishTime: i.pubDate ? Math.floor(new Date(i.pubDate).getTime() / 1000) : null,
        })) : [];

        const allNews = [...cnbcNews, ...ndtvNews, ...mcNews].sort((a: any, b: any) => {
            const timeA = a.providerPublishTime || 0;
            const timeB = b.providerPublishTime || 0;
            return timeB - timeA;
        }).slice(0, 15);

        return NextResponse.json({ news: allNews });
    } catch (error) {
        console.error('News API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch news data' }, { status: 500 });
    }
}
