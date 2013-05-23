(function(g) {
	'use strict';

	var AWESON = g.AWESON = {};

	var input, cursor;

	function d() {}

	function skipWhitespace() {
		d('skipWhitespace', input.substring(cursor));
		var ch = input.charAt(cursor);
		var comment = ch === '"';
		while (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || comment) {
			++cursor;
			ch = input.charAt(cursor);
			if (comment) {
				comment = ch !== '"';
				if (!comment) {
					++cursor;
				}
			}
		}
		return cursor;
	}

	function readName() {
		d('readName', input.substring(cursor));
		skipWhitespace();
		var name = readValue();
		if (input.charAt(cursor) !== '>') {
			throw new Error('Missing > at ' + cursor);
		}
		++cursor;
		if (Array.isArray(name)) {
			throw new Error('Whoa, that\'s not a good idea.');
		}
	}

	function readPair() {
		d('readPair', input.substring(cursor));
		skipWhitespace();
		var pair = {};
		switch (input.charAt(cursor)) {
			case '>':
				++cursor;
				if (input.charAt(cursor) === '>') {
					cursor++;
					pair = null;
				} else {
					pair.value = readValue();
				}
				break;
			case '<':
				++cursor;
				pair.name = readName(); // consumes '>'
				pair.value = readValue();
				break;
			default:
				throw new Error('I don\'t know what to make of character @' + cursor);
		}
		return pair;
	}

	function notString(i) {
		return typeof i.name !== 'string';
	}

	function justTheValue(i) {
		return i.value;
	}

	function readArray() {
		d('readArray', input.substring(cursor));
		var a = [];
		skipWhitespace();
		var pair = readPair();
		while (pair !== null) {
			a.push(pair);
			pair = readPair();
		}
		if (a.every(notString)) {
			return a.map(justTheValue);
		}
		return a;
	}


	function readQuotedString() {
		d('readQuotedString', input.substring(cursor));
		var str = '';

		++cursor;
		var start = cursor;
		var doubled;
		do {
			while (input.charAt(cursor) !== "'") {
				++cursor;
			}
			str += input.substring(start, cursor);
			++cursor;
			doubled = input.charAt(cursor) === "'";
			if (doubled) {
				start = cursor;
			}
		} while (doubled);
		return str;
	}

	function isSpecial(ch) {
		return ch === '"' || ch === "'" || ch === '<' || ch === '>';
	}

	function readUnquotedString() {
		d('readUnquotedString', input.substring(cursor));
		var start = cursor;
		while (cursor < input.length && !isSpecial(input.charAt(cursor))) {
			++cursor;
		}
		return input.substring(start, cursor).trimRight();
	}

	function readValue() {
		d('readValue', input.substring(cursor));
		skipWhitespace();
		var value;
		switch (input.charAt(cursor)) {
			case '<':
				cursor++;
				if (input.charAt(cursor) !== '<') {
					throw new Error('Values can\'t start with just one <');
				}
				cursor++;
				value = readArray();
				// read array consumes the trailing '>>'
				break;
			case '\'':
				value = readQuotedString();
				break;
			default:
				value = readUnquotedString();
				break;
		}
		return value;
	}

	AWESON.parse = function(str, c) {
		var value;

		input = str;
		cursor = c || 0;

		return readValue();
	};

	AWESON.stringify = function(obj, replacer, sp) {
		switch (typeof obj) {
			case 'string':
				if (/[<>"]/.test(obj) || obj.charAt(0) === "'") {
					return "'" + obj.replace(/'/g, "''") + "'";
				}
				return obj;
			case 'number':
				return obj.toString();
			case 'object':
				if (Array.isArray(obj)) {
					return '<<' + obj.map(function(e) {
						return '>' + AWESON.stringify(e);
					}).join('') + '>>';
				}
				return '<<' + Object.keys(obj).map(function(k) {
					return '<' + AWESON.stringify(k) + '>' + AWESON.stringify(obj[k]);
				}).join('') + '>>';
			default:
				throw new Error('Can\'t stringify that');
		}
	};
}(global || this));