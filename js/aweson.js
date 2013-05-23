(function(g) {
    'use strict';

    var AWESON = g.AWESON = {};

    var input, cursor;

    var d;
    if (process.env.DEBUG) {
	d = function() { console.log.apply(console, arguments); };
    } else {
	d = function() { };
    }
    
    function skipWhitespace() {
	d('skipWhitespace', input.substring(cursor));
	var ch = input.charAt(cursor);
	var comment = ch === '"';
	var quote;
	while (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || comment) {
	    ++cursor;
	    ch = input.charAt(cursor);
	    quote = ch === '"';
	    if (quote) {
		++cursor;
		ch = input.charAt(cursor);
	    }
	    comment ^= quote;
	}
	return cursor;
    }

    function readName() {
	d('readName', input.substring(cursor));
	skipWhitespace();
	var name = readString();
	if (input.charAt(cursor) !== '>') {
	    throw new Error('Missing > after name @' + cursor);
	}
	++cursor;
	return name;
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
    function fixArray(a) {
	var duplicateKeys = false;
	function toKeyValue(target, pair) {
	    duplicateKeys |= (typeof target[pair.name] !== 'undefined');
	    target[pair.name] = pair.value;
	}
	
	if (a.every(notString)) { // full array
	    return a.map(justTheValue);
	} else if (!a.some(notString)) { // full map
	    var b = a.reduce({}, toKeyValue);
	    if (!duplicateKeys) { // duplicate keys
		return b;
	    }
	}
	return a;
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
	while (cursor < input.length && !isSpecial(input.charAt(cursor))) {
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
	    ch = input.charAt(cursor); 
	    if (ch === '\'') {
		str += readQuotedString();
	    } else if (ch !== '<' && ch !== '>') {
		str += readUnquotedString();
	    }
	} while(cursor < input.length && cursor > start);
	return str;
    }

    function readValue() {
	d('readValue', input.substring(cursor));
	skipWhitespace();
	var value;
	if (input.charAt(cursor) === '<') {
	    cursor++;
	    if (input.charAt(cursor) !== '<') {
		throw new Error('Arrays need to start with << @' + cursor);
	    }
	    cursor++;
	    value = readArray();	    // read array consumes the trailing '>>'
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
		// special AWESON array
		if (obj.every(isKeyValue)) {
		    return '<<' + obj.map(function(e) {
			var n = '';
			if (typeof e.name === 'string') {
			    n += '<' + e.name;
			}
			return n + '>' + e.value;
		    }).join('') + '>>';
		}
		// regular array
		return '<<' + obj.map(function(e) {
		    return '>' + AWESON.stringify(e);
		}).join('') + '>>';
	    }
	    // flat ol' object
	    return '<<' + Object.keys(obj).map(function(k) {
		return '<' + AWESON.stringify(k) + '>' + AWESON.stringify(obj[k]);
	    }).join('') + '>>';
	default:
	    throw new Error('Can\'t stringify that');
	}
    };
}(global || this));
