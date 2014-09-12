var sQuery = sQuery || {};
(function (w) {
	var doc = w.document,
		sElems = [],
		callbacks = [],
		options = {
			removeDataAttributes: true
		},
		hasLoaded = false,
		// private functions
		getDefaultWidth,
		compareFunction,
		emStyles = [
		   'font-size: 1em',
		   'margin: 0',
		   'padding: 0',
		   'border: none',
		   'width: 1em'
		  ].join(';'),
		defaultWidthStyles = [
		   'height: 0',
		   'visibility: hidden',
		   'overflow: hidden',
		   'clear: both'
		  ].join(';'),
		dataKey = 'data-squery',
		_memoize,
		_emsToPixels,
		_getDefaultWidth,
		_addListeners,
		_addResizeListener,
		_removeListeners;

	/**
	 * add listeners for main window
	 */
	_addListeners = function () {
		if (doc.addEventListener) {
			doc.addEventListener('DOMContentLoaded', contentReady, false);
		}
	};

	/**
	 * remove listeners for main window
	 */
	_removeListeners = function () {
		if (doc.removeEventListener) {
			doc.removeEventListener('DOMContentLoaded', contentReady, false);
		}
	};

	/**
	 * add listeners for resizing event
	 */
	_addResizeListener = function () {
		if (w.addEventListener) {
			w.addEventListener('resize', applyRules, false);
		}
	};

	/**
	 * cache function calls to speed second request
	 */
	_memoize = function (f) {
		return function () {
			var args = Array.prototype.slice.call(arguments);
			f._memoize = f._memoize || {};
			return (args in f._memoize) ? f._memoize[args] : f._memoize[args] = f.apply(this, args);
		};
	};

	_emsToPixels = _memoize(function (em, ele) {
		var testEle = doc.createElement('div'),
			width;
		testEle.style = emStyles;
		ele.appendChild(testEle);
		width = testEle.offsetWidth;
		ele.removeChild(testEle);
		return Math.round(width * em);
	});

	_getDefaultWidth = function (ele, newClass) {
		var testEle = ele.cloneNode(true),
			parent,
			width;
		testEle.className = (" " + testEle.className + " ")
			.replace(" " + newClass + " ", " ");
		testEle.style = defaultWidthStyles;
		parent = ele.parentNode;
		parent.insertBefore(testEle, ele);
		width = testEle.offsetWidth;
		parent.removeChild(test);
		return width;
	};

	function add(elements, query, value, class_name) {
		var split_value = /([0-9]*)(px|em)/.exec(value);
		for (var i = 0, j = elements.length; i < j; ++i) {
			var el = elements[i];
			el.cq_rules = el.cq_rules || [];
			el.cq_rules.push([null, query, split_value[1], split_value[2], class_name]);
			sElems.push(el);
		}
		if (hasLoaded) { // if we're not loaded yet, domLoaded will run applyRules() for us.
			applyRules();
		}
	}

	function _updateOptions(newOptions) {
		if (newOptions && typeof newOptions === 'object') {
			options = {
				removeDataAttributes: newOptions.hasOwnProperty(removeDataAttributes) ? newOptions.removeDataAttributes : options.removeDataAttributes
			};
		}
	}

	function findContainerQueries() {
			// Find data-squery attributes.
			var nodes = [];
			if (doc.querySelectorAll) {
				nodes = doc.querySelectorAll('[' + dataKey + ']');
			} else {
				// If no query selectors.
				var e = doc.getElementsByTagName("*");
				for (var i = 0, j = e.length; i < j; ++i) {
					if (e[i].getAttribute(dataKey)) {
						nodes.push(e[i]);
					}
				}
			}
			// Parse the data-squery attribute and store resulting rules on the element.
			for (var i = 0, j = nodes.length; i < j; ++i) {
				var el = nodes[i],
					cq_rules = [],
					raw_rules = el.getAttribute(dataKey)
						.split(" ");
				// clear attr
				if (options.removeDataAttributes) {
					el.removeAttribute(dataKey);
				}
				for (var k = 0, l = raw_rules.length; k < l; ++k) {
					var rule = /(.*):([0-9]*)(px|em)=(.*)/.exec(raw_rules[k]);
					if (rule) {
						cq_rules.push(rule);
					} else {
						rule = /(.*):([0-9]*)(px|em),([0-9]*)(px|em)=(.*)/.exec(raw_rules[k]);
						if (rule) {
							cq_rules.push(rule);
						}
					}
				}
				el.cq_rules = el.cq_rules || [];
				el.cq_rules = el.cq_rules.concat(cq_rules);
				sElems.push(el);
			}
	}

	function _onResize() {
		var el,
		i,
		j,
		isUpdated = false;

		// For each element, apply the rules to the class name.
		for (i = 0, j = sElems.length; i < j; ++i) {
			el = sElems[i];
			for (var k = 0, l = el.cq_rules.length; k < l; ++k) {
				var rule = el.cq_rules[k],
					className = rule[4],
					width = parseInt(rule[2], 10),
					defaultWidth,
					class_name,
					oldClass;

				// Get a target width value in pixels.
				if (rule[3] === "em") {
					width = _emsToPixels(parseFloat(rule[2]), el);
				}

				if (rule[1] === "between") {
					className = rule[6];
					width = {
						'wMin': rule[3] === "em" ? _emsToPixels(parseFloat(rule[2]), el) : parseInt(rule[2], 10),
						'wMax': rule[5] === "em" ? _emsToPixels(parseFloat(rule[4]), el) : parseInt(rule[4], 10)
					};
				}

				// Calculate the width of the target without the class added.
				defaultWidth = getDefaultWidth(el, className);
				// Test current width against target width and add/remove class values.
				if (compareFunction[rule[1]](defaultWidth, width)) {
					if (el.className.indexOf(className) < 0) {
						el.className += " " + className;
						isUpdated = true;
					}
				} else {
					oldClass = el.className;
					class_name = oldClass.replace(new RegExp('(^| )' + className + '( |$)'), '$1');
					class_name = class_name.replace(/ $/, '');
					if (oldClass !== class_name) {
						el.className = class_name;
						isUpdated = true;
					}
				}
			}
		}

		if (isUpdated) {
			for (i = 0; i < callbacks.length; i++) {
				callbacks[i]();
			}
		}
	}

	function onReady(isForceUpdate) {
		_removeListeners();
		if (hasLoaded && !isForceUpdate) {
			return;
		}
		hasLoaded = true;
		findContainerQueries();
		applyRules();
		_addResizeListener();
	}

	compareFunction = {
		"min-width": function (a, b) {
			return a > b;
		},
		"max-width": function (a, b) {
			return a < b;
		},
		"between": function (a, obj) {
			return a > obj.wMin && a < obj.wMax;
		}
	};

	// setup
	_addListeners();
	// allow for post page load calls
	sQuery.resize = _onResize;
	sQuery.updateOptions = _updateOptions;
	sQuery.add = add;
	sQuery.addCallback = function (callback) {
		if (typeof callback === 'function') {
			callbacks.push(callback);
		}
	};
})(window);