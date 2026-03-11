import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
async function testNews() {
    try {
        console.log("Testing search for '^NSEI'");
        const res1 = await YahooFinance.search('^NSEI', { newsCount: 10 });
        console.log("res1 news count:", res1.news ? res1.news.length : 0);
        if (res1.news && res1.news.length > 0) {
            console.log(res1.news[0]);
        }

        console.log("Testing search for 'Nifty 50'");
        const res2 = await YahooFinance.search('Nifty 50', { newsCount: 10 });
        console.log("res2 news count:", res2.news ? res2.news.length : 0);

        console.log("Testing search for 'Indian share market'");
        const res3 = await YahooFinance.search('Indian share market', { newsCount: 10 });
        console.log("res3 news count:", res3.news ? res3.news.length : 0);
        if (res3.news && res3.news.length > 0) {
            console.log(res3.news[0]);
        }

    } catch (err) {
        console.error(err);
    }
}

testNews();
