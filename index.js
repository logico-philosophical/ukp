function createJsonErrorMessage(message, object) {
	var json;

	try {
		json = JSON.stringify(object, (k, v) => {
			if (typeof v == 'number' && !Number.isFinite(v)) {
				return `<${v}>`;
			}

			return v;
		});
	} catch(e) {
		return message;
	}
	
	return `${message}: ${json}`;
}

function checkW(W) {
	return typeof W == 'number' && !isNaN(W) && isFinite(W) && W >= 0;
}

function normalizeItem(item) {
	if (item instanceof Array) {
		if (item.length == 3) {
			item = item.concat([Infinity]);
		}

		if (item.length != 4) {
			throw Error(createJsonErrorMessage('Invalid item', item));
		}

		item = {
			name: item[0],
			weight: item[1],
			value: item[2],
			count: item[3]
		};
	}

	if (typeof item != 'object') {
		throw Error(createJsonErrorMessage('Invalid item', item));
	}

	if (typeof item.name != 'string') {
		throw Error(createJsonErrorMessage('Item name should be a string', item));
	}

	if (typeof item.weight != 'number'
			|| isNaN(item.weight)
			|| !isFinite(item.weight)
			|| item.weight < 0) {
		throw Error(createJsonErrorMessage('Invalid weight', item));
	}

	if (typeof item.value != 'number'
			|| isNaN(item.value)
			|| !isFinite(item.value)
			|| item.value < 0) {
		throw Error(createJsonErrorMessage('Invalid value', item));
	}

	if (!('count' in item)) {
		item.count = Infinity;
	}

	if (typeof item.count != 'number'
			|| Number.isFinite(item.count) && !Number.isInteger(item.count)
			|| item.count < 0) {
		throw Error(createJsonErrorMessage('Invalid count', item));
	}

	return item;
}

function normalizeItems(items) {
	if (!(items instanceof Array)) {
		throw Error(createJsonErrorMessage('Invalid items', items));
	}
	
	items = items.map(o => normalizeItem(o));

	if (new Set(items.map(({name}) => name)).size != items.length) {
		throw Error(createJsonErrorMessage('Item name cannot be duplicated', items));
	}
	
	return items;
}

function getCache(cache, W, itemCounts) {
	if (!(W in cache)) return false;

	var ret = cache[W];

	for (var count of itemCounts) {
		if (count == Infinity) continue;
		if (!(count in ret)) return false;
		ret = ret[count];
	}

	return ret;
}

function setCache(cache, W, itemCounts, value) {
	var target = cache;
	if (!(W in target)) target[W] = {};

	var parent = target;
	var targetIndex = W;
	target = target[W];

	for (var count of itemCounts) {
		if (count == Infinity) continue;
		if (!(count in target)) target[count] = {};
		parent = target;
		targetIndex = count;
		target = target[count];
	}

	return parent[targetIndex] = value;
}

function ukp(W, items) {
	if (!checkW(W)) {
		throw Error(createJsonErrorMessage('Invalid W', W));
	}

	items = normalizeItems(items);

	try {
		items = items.filter(item => {
			if (item.value == 0) return false;

			if (item.weight == 0) {
				throw item.name;
			}

			return true;
		})
	} catch (e) {
		if (typeof e != 'string') throw e;
		return {
			counts: {
				[e]: Infinity
			},
			weight: 0,
			value: Infinity
		};
	}

	var itemCounts = items.map(({count}) => count);
	var cache = {};

	function recurse(W) {
		var theCache = getCache(cache, W, itemCounts);
		if (theCache) return theCache;
		
		var optimum = {
			counts: {},
			weight: 0,
			value: 0
		};

		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if (itemCounts[i] <= 0) continue;

			if (item.weight <= W) {
				itemCounts[i]--;
				var {counts: counts_, weight, value} = recurse(W - item.weight);
				itemCounts[i]++;

				var counts = {};
				for (var name in counts_) {
					counts[name] = counts_[name];
				}

				counts[item.name] = (item.name in counts ? counts[item.name] : 0) + 1;

				weight += item.weight;
				value += item.value;

				if (optimum.value < value
						|| optimum.value == value
							&& optimum.weight > weight) {
					optimum = {counts, weight, value};
				}
			}
		}

		return setCache(cache, W, itemCounts, optimum);
	}

	return recurse(W);
}

function dual(W, items) {
	if (!checkW(W)) {
		throw Error(createJsonErrorMessage('Invalid W', W));
	}

	items = normalizeItems(items);

	try {
		items = items.filter(item => {
			if (item.weight == 0) return false;

			if (item.value == 0) {
				throw item.name;
			}

			return true;
		})
	} catch (e) {
		if (typeof e != 'string') throw e;
		return {
			counts: {
				[e]: Infinity
			},
			weight: Infinity,
			value: 0
		};
	}

	var itemCounts = items.map(({count}) => count);
	var cache = {};

	function recurse(W) {
		var theCache = getCache(cache, W, itemCounts);
		if (theCache) return theCache;
		
		var optimum = W == 0
			? {
				counts: {},
				weight: 0,
				value: 0
			}
			: false;
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if (itemCounts[i] <= 0) continue;

			var candidate;

			if (item.weight >= W) {
				candidate = {
					counts: {
						[item.name]: 1
					},
					weight: item.weight,
					value: item.value
				};
			} else {
				itemCounts[i]--;
				var {counts: counts_, weight, value} = recurse(W - item.weight);
				itemCounts[i]++;

				var counts = {};
				for (var name in counts_) {
					counts[name] = counts_[name];
				}

				counts[item.name] = (item.name in counts ? counts[item.name] : 0) + 1;

				weight += item.weight;
				value += item.value;

				candidate = {counts, weight, value};
			}

			if (!optimum
					|| optimum.value > candidate.value
					|| optimum.value == candidate.value
						&& optimum.weight < candidate.weight) {
				optimum = candidate;
			}
		}

		return setCache(cache, W, itemCounts, optimum);
	}

	return recurse(W);
}

ukp.dual = dual;
module.exports = ukp;