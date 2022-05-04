var assert = require('assert');
var ukp = require('..');

describe('Input validation', function () {
	it('ukp(-1, []) throws', function () {
		assert.throws(() => ukp(-1, []));
	});

	it('ukp.dual(-1, []) throws', function () {
		assert.throws(() => ukp.dual(-1, []));
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