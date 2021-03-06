'use strict';
require('./aweson.js'); /*global AWESON*/

var d;
if (process.env.DEBUG) {
    d = function() { console.log.apply(console, arguments); };
} else {
    d = function() { };
}


function stringify(input, output) {
	d('STRINGIFY>>', input);
	var str = AWESON.stringify(input);
	d('  AWESON>>', str);
	if (str !== output) {
		throw new Error('Expected:\n' + output + '\nGot:\n' + str);
	}
}

stringify('Hello World!', 'Hello World!');
stringify(' space start', '\' space start\'');
stringify('space end ', '\'space end \'');
stringify('\'quote at the start', '\'\'\'quote at the start\'');
stringify('Double quotes "', '\'Double quotes "\'');
stringify('Angles <>', '\'Angles <>\'');
stringify(123, '123');
stringify(1e40, '1e+40');
stringify([1, 2, 3], '<< >1 >2 >3 >>');
stringify({ a: 1, b: 2, c: 3 }, '<< <a>1 <b>2 <c>3 >>');
stringify({ a: [], b: 1, c: '' }, '<< <a><< >> <b>1 <c> >>');

function cant(input) {
	try {
		d('CANT>>', input);
		AWESON.stringify(input);
		throw new Error('Shouldn\'t:\n' + input);
	} catch (e) { d(e); }
}

cant();
cant(null);
cant(function() {});

function parse(input, output) {
    d('PARSE>>', input);
    var parsed = AWESON.parse(input);
    d('  PARSED>>', parsed);
    var str = AWESON.stringify(parsed);
    d('  AWESON>>', str);
    if (str !== output) {
        throw new Error('Expected:\n' + output + '\nGot:\n' + str);
    }
}

parse('<<>>', '<< >>');
parse('\'string\'', 'string');
parse('<< >1 >2 >3 >>', '<< >1 >2 >3 >>');
parse('<< <a>1 <b>2 <c>3 >>', '<< <a>1 <b>2 <c>3 >>');
parse('<< <a>1 >2 <c>3 >>', '<< <a>1 >2 <c>3 >>');

parse('\'a\'\n\'b\'', 'ab'); // concatenation
parse('a "comment" b', 'ab'); // bare string with comment
parse('a "comment" \' b\' c', 'a bc'); // mixed types
parse('"c"<<<"c"\'a\'"c">"c"value"c">>', '<< <a>value >>'); // comments

function invalid(input) {
    try {
        d('INVALID>>', input);
        AWESON.parse(input);
        throw new Error('Expected error:\n' + input);
    } catch (e) { d(e); }
}

invalid('\'');
invalid('"');
invalid('<<>');
invalid('<<');

try {
	AWESON.stringify(null);
} catch (e) { d(e); }

console.log(AWESON.parse('<<<ok>OK> >>').n['ok']);
