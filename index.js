function createJsonErrorMessage(message, object) {
	var json;

	try {
		json = JSON.stringify(object);
	} catch(e) {
		throw Error(message);
	}
	
	throw Error(`${message}: ${json}`);
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
	if (typeof items == 'undefined' || items == false) return [];

	if (!(items instanceof Array)) {
		throw Error(createJsonErrorMessage('Invalid items', items));
	}
	
	items = items.map(o => normalizeItem(o));

	if (new Set(items.map(({name}) => name)).size != items.length) {
		throw Error(createJsonErrorMessage('Item name cannot be duplicated', items));
	}
	
	return items;
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
	
	function recurse(currentCounts, currentNetWeight, currentNetValue, itemsStartIndex) {
		if (currentNetWeight > W) {
			return false;
		}
	
		var optimum = false;
	
		for (var i = itemsStartIndex; i < items.length; i++) {
			var {name, weight, value, count} = items[i];
			if (count == 0) continue;

			currentCounts[name] = (name in currentCounts ? currentCounts[name] : 0) + 1;
			items[i].count--;

			var candidate = recurse(
				currentCounts,
				currentNetWeight + weight,
				currentNetValue + value,
				i
			);

			currentCounts[name]--;
			items[i].count++;

			if (!candidate) continue;
	
			if (!optimum
					|| optimum.netValue < candidate.netValue
					|| optimum.netValue == candidate.netValue
						&& optimum.netWeight > candidate.netWeight) {
				optimum = candidate;
			}
		}

		if (!optimum) {
			optimum = {netCounts: {}, netWeight: currentNetWeight, netValue: currentNetValue};

			for (var name in currentCounts) {
				if (currentCounts[name] > 0) {
					optimum.netCounts[name] = currentCounts[name];
				}
			}
		}
	
		return optimum;
	}

	var ret = recurse({}, 0, 0, 0);

	if (!ret) return false;

	return {
		counts: ret.netCounts,
		weight: ret.netWeight,
		value: ret.netValue
	};
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

	function recurse(currentCounts, currentNetWeight, currentNetValue, itemsStartIndex) {
		if (currentNetWeight >= W) {
			var ret = {netCounts: {}, netWeight: currentNetWeight, netValue: currentNetValue};

			for (var name in currentCounts) {
				if (currentCounts[name] > 0) {
					ret.netCounts[name] = currentCounts[name];
				}
			}

			return ret;
		}

		if (itemsStartIndex == items.length) {
			return false;
		}
	
		var optimum = false;
	
		for (var i = itemsStartIndex; i < items.length; i++) {
			var {name, weight, value, count} = items[i];
			if (count == 0) continue;

			currentCounts[name] = (name in currentCounts ? currentCounts[name] : 0) + 1;
			items[i].count--;

			var candidate = recurse(
				currentCounts,
				currentNetWeight + weight,
				currentNetValue + value,
				i
			);

			currentCounts[name]--;
			items[i].count++;

			if (!candidate) continue;
	
			if (!optimum
					|| optimum.netValue > candidate.netValue
					|| optimum.netValue == candidate.netValue
						&& optimum.netWeight < candidate.netWeight) {
				optimum = candidate;
			}
		}
	
		return optimum;
	}

	var ret = recurse({}, 0, 0, 0);

	if (!ret) return false;

	return {
		counts: ret.netCounts,
		weight: ret.netWeight,
		value: ret.netValue
	};
}

ukp.dual = dual;
module.exports = ukp;