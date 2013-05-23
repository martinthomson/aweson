'use strict';
require('./aweson.js'); /*global AWESON*/

function test(input) {
	console.log('INPUT>>', input);
	var str = AWESON.stringify(input);
	console.log('  AWESON>>', str);
	var output = AWESON.parse(str);
	console.log('  PARSED>>', output);
}

test('Hello World!');
test('\'With a quote at the start');
test('Double quotes "');
test('Angles <>');
test(123);
test(1e40);
test([1,2,3]);
test({a: 1, b: 2, c: 3});
test({a: [], b: 1, c: ''});
