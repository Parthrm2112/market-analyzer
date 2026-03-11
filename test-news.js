const yahooFinance = require('yahoo-finance2').default;

// To bypass the 'need to instantiate' warning/error on v2:
yahooFinance.suppressNotices(['yahooSurvey']);

async function testNews() {
    try {
        console.log("Testing search for '^NSEI'");
        const res1 = await yahooFinance.search('^NSEI', { newsCount: 10 });
        console.log("res1 news count:", res1.news ? res1.news.length : 0);
        if (res1.news && res1.news.length > 0) {
            console.log(res1.news[0]);
        }

        console.log("Testing search for 'Nifty 50'");
        const res2 = await yahooFinance.search('Nifty 50', { newsCount: 10 });
        console.log("res2 news count:", res2.news ? res2.news.length : 0);

        console.log("Testing search for 'Indian share market'");
        const res3 = await yahooFinance.search('Indian share market', { newsCount: 10 });
        console.log("res3 news count:", res3.news ? res3.news.length : 0);

    } catch (err) {
        console.error(err);
    }
}

testNews();
