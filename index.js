const https = require('https');

const RANGES = ['1h', '1d', '5d', '1mo', '1y', 'max'];

const get = url =>
    new Promise((resolve, reject) => {
        const req = https.get(url, res => {
            let data = '';
            res.on('data', d => {
                data += d;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
        req.on('error', e => {
            reject(e);
        });
    });

const getJson = url =>
    new Promise((resolve, reject) => {
        get(url)
            .then(resp => JSON.parse(resp))
            .then(resolve)
            .catch(reject);
    });


/**
 * Used to interact with the Yahoo Finance API.
 */
class Yahoo {

    /**
     * Returns an array of Quote objects from Yahoo Finance.
     * @author Torrey Leonard <https://github.com/Ladinn>
     * @constructor
     * @param {String} symbol
     * @param {String} range - How far back to retrieve data: [1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max]
     * @param {String} interval - How long each quote should represent: [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo]
     * @param {Boolean} extended - Whether to include data from extended trading hours.
     * @returns {Promise<Array>}
     */
    getHistory(symbol, args) {
        return new Promise((resolve, reject) => {
            let options = {
                interval: '1d',
                ...args,
            };

            getJson(
                `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${
                    options.period1
                }&period2=${
                    options.period2
                }&interval=${
                    options.interval
                }&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn`
            )
                .then(body => {

                    let json = JSON.parse(body).chart.result[0];

                    let array = [];

                    const timestamps = json.timestamp;
                    const quotes = json.indicators.quote[0];

                    if (timestamps === undefined) reject(new LibraryError("Invalid range given. Yahoo suggests using: " + json.meta.validRanges + " (Is this stock too young?)"));
                    else {

                        Object.keys(timestamps).forEach(key => {
                            if (quotes[key] !== null) array.push(
                                new Quote({
                                    symbol: symbol,
                                    source: "Yahoo/" + json.meta.exchangeName,
                                    date: new Date(timestamps[key] * 1000),
                                    price: {
                                        open: Number(quotes.open[key]),
                                        high: Number(quotes.high[key]),
                                        low: Number(quotes.low[key]),
                                        close: Number(quotes.close[key]),
                                        volume: Number(quotes.volume[key])
                                    }
                                })
                            )
                        });

                        resolve(array);

                    }

                }

                // {
                //     const quote = response.chart.result[0].indicators.quote[0];
                //     const meta = response.chart.result[0].meta;
                //     const h = response.chart.result[0].timestamp.map(
                //         (time, idx) => {
                //             return {
                //                 time,
                //                 close: quote.close[idx],
                //                 open: quote.open[idx],
                //                 high: quote.high[idx],
                //                 low: quote.low[idx],
                //                 volume: quote.volume[idx],
                //             };
                //         }
                //     );
                //     resolve({
                //         previousClose: meta.chartPreviousClose,
                //         records: h,
                //     });
                // }
                )
                .catch(reject);
        });
    }
}

module.exports = Yahoo;


// static getQuotes(symbol, range, interval, extended) {
//     return new Promise((resolve, reject) => {
//         request({
//             uri: "https://query2.finance.yahoo.com/v7/finance/chart/" + symbol + "?range=" + range + "&interval=" + interval + "&indicators=quote&includeTimestamps=true&includePrePost=" + extended + "&events=div%7Csplit%7Cearn"
//         }, (error, response, body) => {
//             if (error) reject(error);
//             else if (response.statusCode !== 200) reject(new LibraryError(body));
//             else {
//
//                 let json = JSON.parse(body).chart.result[0];
//
//                 let array = [];
//
//                 const timestamps = json.timestamp;
//                 const quotes = json.indicators.quote[0];
//
//                 if (timestamps === undefined) reject(new LibraryError("Invalid range given. Yahoo suggests using: " + json.meta.validRanges + " (Is this stock too young?)"));
//                 else {
//
//                     Object.keys(timestamps).forEach(key => {
//                         if (quotes[key] !== null) array.push(
//                             new Quote({
//                                 symbol: symbol,
//                                 source: "Yahoo/" + json.meta.exchangeName,
//                                 date: new Date(timestamps[key] * 1000),
//                                 price: {
//                                     open: Number(quotes.open[key]),
//                                     high: Number(quotes.high[key]),
//                                     low: Number(quotes.low[key]),
//                                     close: Number(quotes.close[key]),
//                                     volume: Number(quotes.volume[key])
//                                 }
//                             })
//                         )
//                     });
//
//                     resolve(array);
//
//                 }
//
//             }
//         })
//     })
// }

