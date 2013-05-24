(function(g) {
	'use strict';

	var AWESON = g.AWESON = {};

	var d;
	if (process.env.DEBUG) {
		d = function() {
			console.log.apply(console, arguments);
		};
	} else {
		d = function() {};
	}

	var input, cursor;

	function cur() {
		return input.charAt(cursor);
	}

	function isWhitespace(ch) {
		return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n';
	}

	function skipWhitespace() {
		d('skipWhitespace', input.substring(cursor));
		var ch = cur();
		var comment = ch === '"';
		var quote;
		while (cursor < input.length && (isWhitespace(ch) || comment)) {
			++cursor;
			ch = cur();
			quote = ch === '"';
			if (quote) {
				++cursor;
				ch = cur();
			}
			comment ^= quote;
		}
		return cursor;
	}

	function readName() {
		d('readName', input.substring(cursor));
		skipWhitespace();
		var name = readString();
		if (cur() !== '>') {
			throw new Error('Missing > after name @' + cursor);
		}
		++cursor;
		return name;
	}

	function readPair() {
		d('readPair', input.substring(cursor));
		skipWhitespace();
		var pair = {};
		switch (cur()) {
			case '>':
				++cursor;
				if (cur() === '>') {
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
				if (cursor > input.length) {
					throw new Error('Oops, ran off the end');
				}
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

	function fixArray(a) {
		var duplicateKeys = false;

		function toKeyValue(target, pair) {
			if (typeof target[pair.name] === 'undefined') {
				target[pair.name] = pair.value;
			} else {
				duplicateKeys = true;
			}
			return target;
		}

		var mapped;
		if (a.every(notString)) { // full array
			d('array');
			return a.map(justTheValue);
		}
		mapped = a.reduce(toKeyValue, {});
		if (!duplicateKeys && !a.some(notString)) { // straight map
			d('map', mapped);
			return mapped;
		}
		var result = a.map(justTheValue);
		Object.defineProperty(result, 'n', {
			value: mapped,
			enumerable: false
		});
		Object.defineProperty(result, 'aweson', {
			value: a,
			enumerable: false
		});
		return result;
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
		return fixArray(a);
	}

	function readQuotedString() {
		d('readQuotedString', input.substring(cursor));
		var str = '';

		++cursor;
		var start = cursor;
		var doubled;
		do {
			while (cur() !== "'" && cursor < input.length) {
				++cursor;
			}
			str += input.substring(start, cursor);
			++cursor;
			doubled = cur() === "'";
			if (doubled) {
				start = cursor;
				++cursor;
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
		while (cursor < input.length && !isSpecial(cur())) {
			++cursor;
		}
		return input.substring(start, cursor).trimRight();
	}

	function readString() {
		var str = '';
		d('readString', input.substring(cursor));
		var start;
		var ch;
		do {
			start = cursor;
			skipWhitespace();
			ch = cur();
			if (ch === '\'') {
				str += readQuotedString();
			} else if (ch !== '<' && ch !== '>') {
				str += readUnquotedString();
			}
		} while (cursor < input.length && cursor > start);
		return str;
	}

	function readValue() {
		d('readValue', input.substring(cursor));
		skipWhitespace();
		var value;
		if (cur() === '<') {
			cursor++;
			if (cur() !== '<') {
				throw new Error('Arrays need to start with << @' + cursor);
			}
			cursor++;
			value = readArray(); // read array consumes the trailing '>>'
		} else {
			value = readString();
		}
		return value;
	}

	AWESON.parse = function(str, c) {
		var value;

		input = str;
		cursor = c || 0;

		return readValue(true);
	};

	function isNameOrValue(e) {
		return e === 'name' || e === 'value';
	}

	function isKeyValue(e) {
		return (typeof e.value !== 'undefined') && Object.keys(e).every(isNameOrValue);
	}

	function objectToAweson(obj) {
		if (Array.isArray(obj)) {
			// special AWESON array
			if (obj.every(isKeyValue)) {
				return obj.map(function(e) {
					var n = ' ';
					if (typeof e.name === 'string') {
						n += '<' + e.name;
					}
					return n + '>' + e.value;
				});
			}
			// regular array
			return obj.map(function(e) {
				return ' >' + toAweson(e);
			});
		}
		// flat ol' object
		return Object.keys(obj).map(function(k) {
			return ' <' + toAweson(k) + '>' + toAweson(obj[k]);
		});
	}

	function toAweson(obj) {
		switch (typeof obj) {
			case 'string':
				if (/[<>"]/.test(obj) || obj.charAt(0) === "'" || /\s/.test(obj.charAt(0)) || /\s/.test(obj.charAt(obj.length - 1))) {
					return "'" + obj.replace(/'/g, "''") + "'";
				}
				return obj;
			case 'number':
				return obj.toString();
			case 'object':
				return '<<' + objectToAweson(obj).join('') + ' >>';
			default:
				throw new Error('Can\'t stringify ' + (typeof obj));
		}
	}

	AWESON.stringify = function(obj) {
		return toAweson(obj).trim();
	};
}(global || this));