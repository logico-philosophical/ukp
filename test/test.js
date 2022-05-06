var assert = require('assert');
var ukp = require('..');

describe('Input validation', function () {
	it(`ukp() throws`, function () {
		assert.throws(() => ukp());
	});

	it(`ukp.dual() throws`, function () {
		assert.throws(() => ukp.dual());
	});

	it('ukp(-1, []) throws', function () {
		assert.throws(() => ukp(-1, []));
	});

	it('ukp.dual(-1, []) throws', function () {
		assert.throws(() => ukp.dual(-1, []));
	});

	it ('ukp(0) throws', function () {
		assert.throws(() => ukp(0));
	});

	it ('ukp.dual(0) throws', function () {
		assert.throws(() => ukp.dual(0));
	});

	it ('ukp(0, [[]]) throws', function () {
		assert.throws(() => ukp(0, [[]]));
	});

	it ('ukp.dual(0, [[]]) throws', function () {
		assert.throws(() => ukp.dual(0, [[]]));
	});

	it ('ukp(0, [{}]) throws', function () {
		assert.throws(() => ukp(0, [{}]));
	});

	it ('ukp.dual(0, [{}]) throws', function () {
		assert.throws(() => ukp.dual(0, [{}]));
	});

	it ('ukp(0, [0]) throws', function () {
		assert.throws(() => ukp(0, [0]));
	});

	it ('ukp.dual(0, [0]) throws', function () {
		assert.throws(() => ukp.dual(0, [0]));
	});

	it ('ukp(0, [[Circular]]) throws', function () {
		var a = []; a.push(a);
		assert.throws(() => ukp(0, a));
	});

	it ('ukp.dual(0, [[Circular]]) throws', function () {
		var a = []; a.push(a);
		assert.throws(() => ukp.dual(0, a));
	});

	it (`ukp(0, [['a', -1, 0]]) throws`, function () {
		assert.throws(() => ukp(0, [['a', -1, 0]]));
	});

	it (`ukp.dual(0, [['a', -1, 0]]) throws`, function () {
		assert.throws(() => ukp.dual(0, [['a', -1, 0]]));
	});

	it (`ukp(0, [['a', 0, -1]]) throws`, function () {
		assert.throws(() => ukp(0, [['a', 0, -1]]));
	});

	it (`ukp.dual(0, [['a', 0, -1]]) throws`, function () {
		assert.throws(() => ukp.dual(0, [['a', 0, -1]]));
	});

	it (`ukp(0, [['a', 0, 0, -1]]) throws`, function () {
		assert.throws(() => ukp(0, [['a', 0, 0, -1]]));
	});

	it (`ukp.dual(0, [['a', 0, 0, -1]]) throws`, function () {
		assert.throws(() => ukp.dual(0, [['a', 0, 0, -1]]));
	});

	it (`ukp(0, [['a', 0, 0], ['a', 0, 0]]) throws`, function () {
		assert.throws(() => ukp(0, [['a', 0, 0], ['a', 0, 0]]));
	});

	it (`ukp.dual(0, [['a', 0, 0], ['a', 0, 0]]) throws`, function () {
		assert.throws(() => ukp.dual(0, [['a', 0, 0], ['a', 0, 0]]));
	});
});

describe('Some edge cases', function () {
	it('ukp(0, []) == 0', function () {
		assert.deepStrictEqual(ukp(0, []), {
			counts: {},
			weight: 0,
			value: 0
		});
	});

	it('ukp.dual(0, []) == 0', function () {
		assert.deepStrictEqual(ukp.dual(0, []), {
			counts: {},
			weight: 0,
			value: 0
		});
	});

	it('ukp(1, []) == 0', function () {
		assert.deepStrictEqual(ukp(1, []), {
			counts: {},
			weight: 0,
			value: 0
		});
	});

	it('ukp.dual(1, []) is unsatisfiable', function () {
		assert.equal(ukp.dual(1, []), false);
	});

	it(`ukp(1, [['a', 0, 1]]) == Infinity`, function () {
		assert.deepStrictEqual(ukp(1, [['a', 0, 1]]), {
			counts: {
				a: Infinity
			},
			value: Infinity,
			weight: 0
		});
	});

	it(`ukp.dual(1, [['a', 0, 1]]) is unsatisfiable`, function () {
		assert.equal(ukp.dual(1, [['a', 0, 1]]), false);
	});

	it(`ukp(1, [['a', 0, 0]]) == 0`, function () {
		assert.deepStrictEqual(ukp(1, [['a', 0, 0]]), {
			counts: {},
			weight: 0,
			value: 0
		});
	});

	it(`ukp.dual(1, [['a', 0, 0]]) is unsatisfiable`, function () {
		assert.equal(ukp.dual(1, [['a', 0, 0]]), false);
	});

	it(`ukp(1, [['a', 1, 0]]) == 0`, function () {
		assert.deepStrictEqual(ukp(1, [['a', 1, 0]]), {
			counts: {},
			weight: 0,
			value: 0
		});
	});

	it(`ukp.dual(1, [['a', 1, 0]]) == 0`, function () {
		assert.deepStrictEqual(ukp.dual(1, [['a', 1, 0]]), {
			counts: {
				a: Infinity
			},
			weight: Infinity,
			value: 0
		});
	});
});

describe('Cases from the readme file', function () {
	it('ukp', function () {
		assert.deepStrictEqual(
			ukp(11, [
				{name: 'a', weight: 2, value: 10, count: 2},
				// `count` defaults to Infinity if omitted
				{name: 'b', weight: 3, value: 11},
				// name, weight, value in that order
				['c', 4, 19],
				// name, weight, value, count in that order
				['d', 0, 0, Infinity]
			]),
			{ counts: { a: 2, b: 1, c: 1 }, weight: 11, value: 50 }
		);
	});

	it('ukp.dual', function () {
		assert.deepStrictEqual(
			// Same thing goes for the dual version
			ukp.dual(11, [
				{name: 'a', weight: 2, value: 10, count: 2},
				{name: 'b', weight: 3, value: 11},
				['c', 4, 19],
				['d', 0, 0, Infinity]
			]),
			{ counts: { a: 1, b: 3 }, weight: 11, value: 43 }
		)
	});
});