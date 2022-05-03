# `ukp`

[![npm](https://img.shields.io/npm/v/ukp)](https://www.npmjs.com/package/ukp)

Solve the [unbounded knapsack problem](https://en.wikipedia.org/wiki/Knapsack_problem#Definition) and its dual version.

The original UKP tries to find the maximum value of Σ <i>v</i><sub><i>i</i></sub> <i>x</i><sub><i>i</i></sub> subject to Σ <i>w</i><sub><i>i</i></sub> <i>x</i><sub><i>i</i></sub> ≤ <i>W</i>, and the dual version tries to find the minimum value of Σ <i>v</i><sub><i>i</i></sub> <i>x</i><sub><i>i</i></sub> subject to Σ <i>w</i><sub><i>i</i></sub> <i>x</i><sub><i>i</i></sub> ≥ <i>W</i>, where
 * <i>w</i><sub><i>i</i></sub> ≥ 0 is the weight of the <i>i</i>-th item,
 * <i>v</i><sub><i>i</i></sub> ≥ 0 is the value of the <i>i</i>-th item, and
 * <i>x</i><sub><i>i</i></sub> = 0, 1, 2, 3, … is the number of copies of the <i>i</i>-th item.

## Usage

```
npm install ukp
```

### `ukp(W, items)`

```js
var ukp = require('ukp');


ukp(11, [
    {name: 'a', weight: 2, value: 10, count: 2},
    // `count` defaults to Infinity if omitted
    {name: 'b', weight: 3, value: 11},
    // name, weight, value in that order
    ['c', 4, 19],
    // name, weight, value, count in that order
    ['d', 0, 0, Infinity]
]);
```

**Output**
```js
{ counts: { a: 2, b: 1, c: 1 }, weight: 11, value: 50 }
```

If the value is the same this function picks the one with a smaller weight.

### `ukp.dual(W, items)`

```js
// Same thing goes for the dual version
ukp.dual(11, [
    {name: 'a', weight: 2, value: 10, count: 2},
    {name: 'b', weight: 3, value: 11},
    ['c', 4, 19],
    ['d', 0, 0, Infinity]
]);
```

**Output**
```js
{ counts: { a: 1, b: 3 }, weight: 11, value: 43 }
```

If the value is the same this function picks the one with a larger weight.

## Limitations

* The algorithm is not optimized properly so it may rather be slow
* Call stack may overflow if the recursion gets too deep
* Using non-integer values for the weights and the values may result in an incorrect answer
