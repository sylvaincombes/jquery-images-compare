;(function ($, window, document, undefined) {

    var pluginName = 'imagesCompare',
        defaults = {
            initVisibleRatio: 0.5,
            interactionMode: "drag", // "drag", "mousemove", "click"
            precision: 2
        };

    // Our object, using revealing module pattern
    function ImagesCompare(element, options) {
        element = $(element);
        options = $.extend({}, defaults, options);
        options.roundFactor = parseInt('1' + '0'.repeat(options.precision));

        this._name = pluginName;
        var frontElement, backElement, dragHandle, frontInitialCssTransitionDuration = "333ms";

        init();
        function init() {
            updateDom();
            patchSize();
            initInteractions();
        }

        function initInteractions() {
            options.interactionMode = options.interactionMode.toLowerCase();

            if (options.interactionMode != "drag" && options.interactionMode != "mousemove" && options.interactionMode != "click") {
                console.warn('No valid interactionMode found, valid values are "drag", "mousemove", "click"');
            }

            switch (options.interactionMode) {
                case "drag":
                    if (typeof Hammer == 'undefined') {
                        console.error('Please include the hammerjs library for drag support');
                    }
                    addDrag();
                    break;
                case "mousemove":
                    addMouseMove();
                    break;
                case "click":
                    addClick();
                    break;
            }
        }

        function addClick() {
            console.log('click event listener');
            element.on('click', function (event) {
                var ratio = getElementRatio(event.pageX);
                setVisibleRatio(ratio);
            });
        }

        function addMouseMove() {
            var lastMove = 0;
            var eventThrottle = 1;
            element.on('mousemove', function (event) {
                event.preventDefault();
                var now = Date.now();
                if (now > lastMove + eventThrottle) {
                    lastMove = now;
                    var ratio = getElementRatio(event.pageX);
                    setVisibleRatio(ratio);
                }
            });

            element.on('mouseout', function (event) {
                var ratio = getElementRatio(event.pageX);
                setVisibleRatio(ratio);
            });
        }

        function addDrag() {
            var hammertime = new Hammer(element[0]);
            hammertime.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL});
            hammertime.on('pan', function (event) {
                var ratio = getElementRatio(event.srcEvent.pageX);
                setVisibleRatio(ratio);
            });

            hammertime.on('panstart', function (event) {
                frontElement.addClass('images-compare-notransition');
            });

            hammertime.on('panend', function (event) {
                frontElement.removeClass('images-compare-notransition');
            });
        }

        function updateDom() {
            element.addClass('images-compare-container');

            frontElement = element.find('> *:nth-child(1)');
            backElement = element.find('> *:nth-child(2)');

            frontElement.addClass("images-compare-before");
            backElement.addClass("images-compare-after");
        }

        function buildDragHandle() {
            element.append("<div class='images-compare-handle'></div>");
            dragHandle = element.find(".images-compare-handle");
            dragHandle.append("<span class='images-compare-left-arrow'></span>");
            dragHandle.append("<span class='images-compare-right-arrow'></span>");
        }

        function patchSize() {
            var imgRef = backElement.find('img').first();
            element.width(imgRef.width());
            element.height(imgRef.height());
        }

        function getElementRatio(x) {
            return roundRatio((x - element.offset().left) / frontElement.width());
        }

        function roundRatio(ratio) {
            ratio = Math.round((ratio * options.roundFactor)) / options.roundFactor;
            if (ratio > 1) {
                ratio = 1;
            }

            if (ratio < 0) {
                ratio = 0;
            }

            return ratio;

        }

        function getRatioValue(ratio) {
            ratio = Math.round((ratio * options.roundFactor)) / options.roundFactor;
            return Math.round(frontElement.width() * ratio);
        }

        function setVisibleRatio(ratio) {
            var width = getRatioValue(ratio);
            frontElement.css('clip', 'rect(0, ' + width + 'px, ' + frontElement.height() + 'px, 0)');
            // frontElement.width(width);
            // frontElement.removeClass('images-compare-notransition');
            element.trigger({
                type: 'change',
                ratio: ratio,
                value: width
            });
        }

        // public function declaration
        // returning element to preserve chaining
        return {
            "setValue": function (ratio) {
                setVisibleRatio(ratio);
                return element;
            },
            "on": function (eventName, callback) {
                element.on(eventName, callback);
            },
            "off": function (eventName, callback) {
                element.off(eventName, callback);
            }
        };
    }


    $.fn.imagesCompare = function (userOptions) {
        var options = $.extend(defaults, userOptions);
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new ImagesCompare(this, options));
            }
        });
    };

})(jQuery, window, document);
