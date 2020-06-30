const https = require('https');
const Quote = require('./model/Quote');

/**
 * Used to interact with the Yahoo Finance API.
 */
class Yahoo {
  _get(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        let body = '';
        res.on('data', (data) => {
          body += data;
        });
        res.on('end', () => {
          resolve(JSON.parse(body));
        });
      });
      req.on('error', (e) => {
        reject(e);
      });
    });
  }

  /**
     * Returns an array of Quote model from Yahoo Finance.
     * @constructor
     * @param {String} symbol
     * @param args interval
     * @returns {Promise<Array>}
     */
  getHistory(symbol, args) {
    return new Promise((resolve, reject) => {
      const options = {
        interval: '1d',
        period1: 0,
        period2: 9999999999,
        ...args,
      };

      this._get(
        `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${
          options.period1
        }&period2=${
          options.period2
        }&interval=${
          options.interval
        }&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn`
      ).then((body) => {
        const json = body.chart.result[0];
        const array = [];

        const timestamps = json.timestamp;
        const quotes = json.indicators.quote[0];

        if (timestamps === undefined) reject(new Error('Requested range is invalid'));

        Object.keys(timestamps).forEach((key) => {
          if (quotes[key] !== null) array.push(
            new Quote({
              symbol: symbol,
              date: new Date(timestamps[key] * 1000),
              price: {
                open: Number(quotes.open[key]),
                high: Number(quotes.high[key]),
                low: Number(quotes.low[key]),
                close: Number(quotes.close[key]),
                volume: Number(quotes.volume[key])
              }
            })
          );
        });

        resolve(array);
      }).catch(reject);
    });
  }
}

module.exports = Yahoo;
