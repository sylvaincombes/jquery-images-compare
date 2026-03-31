(($, window) => {
	var pluginName = "imagesCompare",
		defaults = {
			initVisibleRatio: 0.5,
			interactionMode: "drag", // "drag", "mousemove", "click"
			animationDuration: 400, // default animation duration in ms
			animationEasing: "swing",
			addSeparator: true, // add a html element on the separation
			addDragHandle: true, // add a html drag handle element on the separation
			precision: 4,
		};

	// Our object, using revealing module pattern
	function ImagesCompare(element, options) {
		element = $(element);
		options = $.extend({}, defaults, options);
		options.roundFactor = 10 ** options.precision;

		this._name = pluginName;

		var frontElement,
			backElement,
			separator,
			dragHandle,
			lastRatio = 1,
			size = {
				width: 0,
				height: 0,
				maxWidth: 0,
				maxHeight: 0,
			},
			events = {
				initialised: "imagesCompare:initialised",
				changed: "imagesCompare:changed",
				resized: "imagesCompare:resized",
			};

		function onImagesLoaded() {
			var images = element.find("img"),
				totalImagesCount = images.length,
				elementsLoaded = 0;

			if (totalImagesCount === 0) {
				init();
				return;
			}

			function onImageLoaded() {
				if (elementsLoaded >= totalImagesCount) {
					init();
				}
			}

			images.each(function () {
				// Image already loaded (cached)
				if ($(this)[0].complete) {
					totalImagesCount--;
					onImageLoaded();
				} else {
					// Image loading / error
					$(this).on("load", () => {
						elementsLoaded++;
						onImageLoaded();
					});
					$(this).on("error", () => {
						elementsLoaded++;
						onImageLoaded();
					});
				}
			});
		}

		onImagesLoaded();

		function init() {
			updateDom();
			patchSize();
			initInteractions();

			$(frontElement).attr("ratio", options.initVisibleRatio);
			setVisibleRatio(options.initVisibleRatio);

			// Let the world know we have done the init
			element.trigger({
				type: events.initialised,
			});
		}

		function addResize() {
			$(window).on("resize", (event) => {
				frontElement.css("clip", "").css("clip-path", "");
				patchSize();
				setVisibleRatio(lastRatio);

				// Let the world know we have done some resize updates
				element.trigger({
					type: events.resized,
					originalEvent: event,
				});
			});
		}

		function initInteractions() {
			options.interactionMode = options.interactionMode.toLowerCase();

			if (
				options.interactionMode !== "drag" &&
				options.interactionMode !== "mousemove" &&
				options.interactionMode !== "click"
			) {
				console.warn(
					'No valid interactionMode found, valid values are "drag", "mousemove", "click"',
				);
			}

			switch (options.interactionMode) {
				case "drag":
					initDrag();
					break;
				case "mousemove":
					initMouseMove();
					break;
				case "click":
					initClick();
					break;
				default:
					initDrag();
			}
		}

		function initDrag() {
			element.css("touch-action", "none");
			addDrag();
			addResize();
		}

		function initMouseMove() {
			addMouseMove();
			addResize();
		}

		function initClick() {
			addClick();
			addResize();
		}

		function addClick() {
			element.on("click", (event) => {
				const ratio = getElementRatio(event.pageX);
				setVisibleRatio(ratio);
			});
		}

		function addMouseMove() {
			let lastMove = 0;
			const eventThrottle = 1;
			element.on("mousemove", (event) => {
				event.preventDefault();
				const now = Date.now();
				if (now > lastMove + eventThrottle) {
					lastMove = now;
					const ratio = getElementRatio(event.pageX);
					setVisibleRatio(ratio);
				}
			});

			element.on("mouseout", (event) => {
				const ratio = getElementRatio(event.pageX);
				setVisibleRatio(ratio);
			});
		}

		function addDrag() {
			if (window.PointerEvent) {
				addPointerDrag();
			} else {
				addMouseTouchDrag();
			}
		}

		function addPointerDrag() {
			var activePointerId = null;
			var isPointerDown = false;

			element.on("pointerdown", (event) => {
				var rawEvent = event.originalEvent || event;
				if (event.button !== undefined && event.button !== 0) {
					return;
				}
				if (rawEvent.pointerId === undefined || rawEvent.pointerId === null) {
					return;
				}
				activePointerId = rawEvent.pointerId;
				isPointerDown = true;

				if (element[0]?.setPointerCapture) {
					try {
						element[0].setPointerCapture(activePointerId);
					} catch (_error) {
						// Ignore capture errors in browsers that don't fully support it.
					}
				}

				var pageX = getPageX(event);
				if (pageX === null) {
					return;
				}
				var ratio = getElementRatio(pageX);
				setVisibleRatio(ratio);
				event.preventDefault();
			});

			element.on("pointermove", (event) => {
				var rawEvent = event.originalEvent || event;
				if (!isPointerDown || rawEvent.pointerId !== activePointerId) {
					return;
				}
				var pageX = getPageX(event);
				if (pageX === null) {
					return;
				}
				var ratio = getElementRatio(pageX);
				setVisibleRatio(ratio);
			});

			element.on("pointerup pointercancel lostpointercapture", (event) => {
				var rawEvent = event.originalEvent || event;
				if (rawEvent.pointerId !== activePointerId) {
					return;
				}
				isPointerDown = false;
				activePointerId = null;
			});
		}

		function addMouseTouchDrag() {
			var activeTouchId = null;
			var isPointerDown = false;

			element.on("mousedown", (event) => {
				if (event.button !== undefined && event.button !== 0) {
					return;
				}
				isPointerDown = true;
				var pageX = getPageX(event);
				if (pageX === null) {
					return;
				}
				var ratio = getElementRatio(pageX);
				setVisibleRatio(ratio);
				event.preventDefault();
			});

			element.on("touchstart", (event) => {
				var rawEvent = event.originalEvent || event;
				var touch = rawEvent.touches?.[0];
				if (!touch) {
					return;
				}
				activeTouchId = touch.identifier;
				isPointerDown = true;
				var ratio = getElementRatio(touch.pageX);
				setVisibleRatio(ratio);
				event.preventDefault();
			});

			$(window).on("mousemove", (event) => {
				if (!isPointerDown) {
					return;
				}
				var pageX = getPageX(event);
				if (pageX === null) {
					return;
				}
				var ratio = getElementRatio(pageX);
				setVisibleRatio(ratio);
			});

			$(window).on("touchmove", (event) => {
				if (!isPointerDown) {
					return;
				}
				var rawEvent = event.originalEvent || event;
				var touch = getActiveTouch(rawEvent.touches, activeTouchId);
				if (!touch) {
					return;
				}
				var ratio = getElementRatio(touch.pageX);
				setVisibleRatio(ratio);
				event.preventDefault();
			});

			$(window).on("mouseup touchend touchcancel", () => {
				isPointerDown = false;
				activeTouchId = null;
			});
		}

		function updateDom() {
			element.addClass("images-compare-container");
			element.css("display", "inline-block");

			frontElement = element.find("> *:nth-child(1)");
			backElement = element.find("> *:nth-child(2)");

			frontElement.addClass("images-compare-before");
			frontElement.css("display", "block");
			backElement.addClass("images-compare-after");
			backElement.css("display", "block");

			if (options.addDragHandle) {
				buildDragHandle();
			}

			if (options.addSeparator) {
				buildSeparator();
			}
		}

		function buildSeparator() {
			element.prepend("<div class='images-compare-separator'></div>");
			separator = element.find(".images-compare-separator");
		}

		function buildDragHandle() {
			element.prepend("<div class='images-compare-handle'></div>");
			dragHandle = element.find(".images-compare-handle");
			dragHandle.append("<span class='images-compare-left-arrow'></span>");
			dragHandle.append("<span class='images-compare-right-arrow'></span>");
		}

		function patchSize() {
			var imgRef = backElement.find("img").first();
			setSize(
				imgRef.width(),
				imgRef.height(),
				imgRef[0]?.naturalWidth,
				imgRef[0]?.naturalHeight,
			);
			element.css("max-width", `${size.maxWidth}px`);
			element.css("max-height", `${size.maxHeight}px`);
			frontElement.width(size.width);
			frontElement.height(size.height);
		}

		/**
		 *
		 * @param x
		 * @return float
		 */
		function getElementRatio(x) {
			return roundRatio((x - element.offset().left) / frontElement.width());
		}

		/**
		 *
		 * @param ratio
		 * @return float
		 */
		function roundRatio(ratio) {
			ratio = Math.round(ratio * options.roundFactor) / options.roundFactor;
			if (ratio > 1) {
				ratio = 1;
			}

			if (ratio < 0) {
				ratio = 0;
			}

			return ratio;
		}

		/**
		 * Animation request
		 *
		 * @param startValue float
		 * @param endValue float
		 * @param duration value in ms
		 * @param easing linear or swing
		 */
		function launchAnimation(startValue, endValue, duration, easing) {
			$(frontElement).attr("ratio", startValue).animate(
				{ ratio: startValue },
				{
					duration: 0,
				},
			);

			$(frontElement)
				.stop()
				.attr("ratio", startValue)
				.animate(
					{ ratio: endValue },
					{
						duration: duration,
						easing: easing,
						step: (now) => {
							var width = getRatioValue(now);
							lastRatio = now;
							frontElement
								.attr("ratio", now)
								.css("clip", `rect(0, ${width}px, ${size.height}px, 0)`)
								.css("clip-path", getClipPath(width));

							if (options.addSeparator) {
								separator.css("left", `${width}px`);
							}

							if (options.addDragHandle) {
								dragHandle.css("left", `${width}px`);
							}
						},
						done: (animation, jumpedToEnd) => {
							var ratio = $(frontElement).attr("ratio");
							// Let the world know something has changed
							element.trigger({
								type: events.changed,
								ratio: ratio,
								value: getRatioValue(ratio),
								animate: true,
								animation: animation,
								jumpedToEnd: jumpedToEnd,
							});
						},
					},
				);
		}

		/**
		 * Get value to reach, based on a ratio
		 *
		 * @param ratio float
		 * @return {number}
		 */
		function getRatioValue(ratio) {
			ratio = Math.round(ratio * options.roundFactor) / options.roundFactor;
			return Math.round(frontElement.width() * ratio);
		}

		function getPageX(event) {
			var rawEvent = event.originalEvent || event;
			if (typeof rawEvent.pageX === "number") {
				return rawEvent.pageX;
			}
			if (rawEvent.touches?.[0]) {
				return rawEvent.touches[0].pageX;
			}
			if (rawEvent.changedTouches?.[0]) {
				return rawEvent.changedTouches[0].pageX;
			}
			return null;
		}

		function getActiveTouch(touches, activeTouchId) {
			var index;
			if (!touches || activeTouchId === null) {
				return null;
			}
			for (index = 0; index < touches.length; index++) {
				if (touches[index].identifier === activeTouchId) {
					return touches[index];
				}
			}
			return null;
		}

		/**
		 * Change visible ratio
		 *
		 * @param ratio float
		 * @param animate boolean Do we want an animation ?
		 * @param duration in ms
		 * @param easing 'swing', 'linear'
		 */
		function setVisibleRatio(ratio, animate, duration, easing) {
			if (typeof animate === "undefined") {
				animate = false;
			}

			const width = getRatioValue(ratio);

			if (animate) {
				const finalDuration = duration ? duration : options.animationDuration;
				const finalEasing = easing ? easing : options.animationEasing;

				launchAnimation(lastRatio, ratio, finalDuration, finalEasing);

				// Let the world know something has changed
				if (lastRatio !== ratio) {
					element.trigger({
						type: events.changed,
						ratio: lastRatio,
						value: width,
						animate: animate,
					});
				}

				return;
			} else {
				frontElement
					.stop()
					.css("clip", `rect(0, ${width}px, ${size.height}px, 0)`)
					.css("clip-path", getClipPath(width));

				if (options.addSeparator) {
					$(separator).stop().css("left", `${width}px`);
				}

				if (options.addDragHandle) {
					dragHandle.css("left", `${width}px`);
				}
			}

			// Let the world know something has changed
			if (lastRatio !== ratio) {
				element.trigger({
					type: events.changed,
					ratio: ratio,
					value: width,
					animate: animate,
				});
			}

			lastRatio = ratio;
		}

		function getClipPath(width) {
			var totalWidth = size.width || frontElement.width();
			var rightInset = Math.max(0, totalWidth - width);
			return `inset(0 ${rightInset}px 0 0)`;
		}

		function setSize(width, height, maxWidth, maxHeight) {
			if (typeof width !== "undefined") {
				setWidth(width);
			}
			if (typeof height !== "undefined") {
				setHeight(height);
			}
			if (typeof maxWidth !== "undefined") {
				setMaxWidth(maxWidth);
			}
			if (typeof maxHeight !== "undefined") {
				setMaxHeight(maxHeight);
			}
			return size;
		}

		function setWidth(width) {
			size.width = width;
			return size;
		}

		function setMaxWidth(maxWidth) {
			size.maxWidth = maxWidth;
			return size;
		}

		function setHeight(height) {
			size.height = height;
			return size;
		}

		function setMaxHeight(maxHeight) {
			size.maxHeight = maxHeight;
			return size;
		}

		// public function declaration
		// returning element to preserve chaining
		return {
			setValue: (ratio, animate, duration, easing) => {
				setVisibleRatio(ratio, animate, duration, easing);
				return element;
			},
			getValue: () => lastRatio,
			on: (eventName, callback) => {
				element.on(eventName, callback);
				return element;
			},
			off: (eventName, callback) => {
				element.off(eventName, callback);
				return element;
			},
			events: () => events,
		};
	}

	/**
	 * Plugin declaration
	 *
	 * @param userOptions
	 * @return {*}
	 */
	$.fn.imagesCompare = function (userOptions) {
		var options = $.extend({}, defaults, userOptions);
		return this.each(function () {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new ImagesCompare(this, options));
			}
		});
	};
})(jQuery, window, document);
