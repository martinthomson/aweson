'use strict';
require('./aweson.js'); /*global AWESON*/

function stringify(input) {
	console.log('INPUT>>', input);
	console.log('OUTPUT>>', AWESON.stringify(input));
}

stringify('Hello World!');
stringify('\'With a quote at the start');
stringify('Double quotes "');
stringify('Angles <>');
stringify(123);
stringify(1e40);
stringify([1,2,3]);
stringify({a: 1, b: 2, c: 3});
stringify({a: [], b: 1, c: ''});
