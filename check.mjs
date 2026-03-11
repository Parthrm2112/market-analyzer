import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function check() {
    try {
        const searchRes = await yahooFinance.search('stocks', { newsCount: 15 });
        const res2 = await yahooFinance.search('nifty', { newsCount: 15 });
        console.log("Success! Found:", searchRes.news ? searchRes.news.length : 0);
        console.log("Success2! Found:", res2.news ? res2.news.length : 0);
    } catch (e) {
        console.error("FAIL", e);
    }
}
check();
