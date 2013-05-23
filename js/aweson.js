(function(g) {
	'use strict';

	var AWESON = g.AWESON = {};
	AWESON.parse = function(str) {
		return {};
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