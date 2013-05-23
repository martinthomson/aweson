'use strict';
require('./aweson.js'); /*global AWESON*/

var d;
if (process.env.DEBUG) {
    d = function() { console.log.apply(console, arguments); };
} else {
    d = function() { };
}


function stringify(input, output) {
    d('INPUT>>', input);
    var str = AWESON.stringify(input);
    d('  AWESON>>', str);
    if (str !== output) {
	throw new Error('Expected:\n' + output + '\nGot:\n' + str);
    }
}

stringify('Hello World!', 'Hello World!');
stringify('\'quote at the start', '\'\'\'quote at the start\'');
stringify('Double quotes "', '\'Double quotes "\'');
stringify('Angles <>', '\'Angles <>\'');
stringify(123, '123');
stringify(1e40, '1e+40');
stringify([1, 2, 3], '<<>1>2>3>>');
stringify({ a: 1, b: 2, c: 3 }, '<<<a>1<b>2<c>3>>');
stringify({ a: [], b: 1, c: '' }, '<<<a><<>><b>1<c>>>');
stringify([ { value: 2 }, { name: 'n', value: 3 } ], '<<>2<n>3>>');

function parse(input, output) {
    d('INPUT>>', input);
    var parsed = AWESON.parse(input);
    d('  PARSED>>', parsed);
    var str = AWESON.stringify(parsed);
    d('  AWESON>>', str);
    if (str !== output) {
	throw new Error('Expected:\n' + output + '\nGot:\n' + str);
    }
}

parse('<<>>', '<<>>');
parse('\'string\'', 'string');
parse('\'a\'\n\'b\'', 'ab');
parse('a "comment" b', 'ab');
parse('a "comment" \' b\' c', 'a bc');
parse('<<<"c"\'a\'"c">"c"value"c">>', '<<<a>value>>');
parse('<< >1 >2 >3 >>', '<<>1>2>3>>');

console.log('OK');
