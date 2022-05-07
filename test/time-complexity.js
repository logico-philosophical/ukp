var ukp = require('..');

var ukpItems = [
	// name, weight, value
	['a', 10, 10],
	['b', 50, Math.floor(50 * 1.1)],
	['c', 99, Math.floor(99 * 1.2)],
	['d', 201, Math.floor(201 * 1.35)],
	['e', 1009, Math.floor(1009 * 2)]
];

var ukpDualItems = [
	// name, weight, value
	['a', 10, 10],
	['b', 50, Math.floor(50 * .9)],
	['c', 99, Math.floor(99 * .8)],
	['d', 201, Math.floor(201 * .65)],
	['e', 1009, Math.floor(1009 * .5)]
];

var ukpPoints = [];
var ukpDualPoints = [];

function hrtime(fun) {
	var start = process.hrtime();
	var result = fun();
	var [seconds, nanoseconds] = process.hrtime(start);
	var t = seconds * 10 ** 9 + nanoseconds;

	return {result, t};
}

for (var W = 0; W < 30000; W += 17) {
	var {result, t} = hrtime(() => ukp(W, ukpItems));
	console.log(`ukp #${W}: value: ${result.value}, duration: ${t / 10 ** 9} s`);
	ukpPoints.push([W, t]);
}

for (var W = 0; W < 30000; W += 17) {
	var {result, t} = hrtime(() => ukp.dual(W, ukpDualItems));
	console.log(`ukp.dual #${W}: value: ${result.value}, duration: ${t / 10 ** 9} s`);
	ukpDualPoints.push([W, t]);
}

/**
 * Performs a linear regression by minimizing the sum of
 * squares, and calculates the R-squared value.
 * 
 * * Slope m = Σ x_i y_i / Σ x_i^2,
 * * bar y = Σ y_i / n,
 * * R^2 = 1 - Σ (y_i - m x_i)^2 / Σ (y_i - bar y)^2.
 * 
 * @returns {m, R2}
 */
function linearFit(points) {
	var m = points.reduce((sum, [x, y]) => sum + x * y, 0)
			/ points.reduce((sum, [x, y]) => sum + x * x, 0);
	var bar_y = points.reduce((sum, [x, y]) => sum + y, 0) / points.length;
	var R2 = 1 - points.reduce((sum, [x, y]) => sum + (y - m * x) ** 2, 0)
			/ points.reduce((sum, [x, y]) => sum + (y - bar_y) ** 2, 0);
	
	return {m, R2};
}

function formatLinearFit({m, R2}) {
	return `m = ${m} ns/W, R2 = ${R2}`;
}

console.log(`
ukp: ${formatLinearFit(linearFit(ukpPoints))}
ukp.dual: ${formatLinearFit(linearFit(ukpDualPoints))}

Note: m is the slope of the linear fit t = m W, and R2 is the goodness of the
linear fit, where a value closer to 1 represents a better fit.
`);