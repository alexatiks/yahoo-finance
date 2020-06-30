class Quote {
	/**
	 * Creates a new Quote instance.
	 * @constructor
	 * @param {Object} object
	 * @property {String} symbol
	 * @property {Date} date
	 * @property {String} source
	 * @property {Object} price
	 * @property {Number} price.open
	 * @property {Number} price.high
	 * @property {Number} price.low
	 * @property {Number} price.close
	 * @property {Number} price.volume
	 */
	constructor(object) {
		this.symbol = object.symbol;
		this.date = object.date;
		this.source = object.source;
		this.price = object.price;
	}

	getSymbol() {
		return this.symbol;
	}

	getDate() {
		return this.date;
	}

	getOpen() {
		return this.price.open;
	}

	getHigh() {
		return this.price.high;
	}

	getLow() {
		return this.price.low;
	}

	getClose() {
		return this.price.close;
	}

	getVolume() {
		return this.price.volume;
	}
}

module.exports = Quote;
