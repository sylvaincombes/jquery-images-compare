(function ($) {

    $.fn.imagesCompare = function (options) {
        //noinspection JSDuplicatedDeclaration
        var options = $.extend({
            initVisibleRatio: 0.5,
            mouseMove: true,
            click: true,
            precision: 2

        }, options);

        options.roundFactor = parseInt('1' + '0'.repeat(options.precision));

        return this.each(function () {

            var container = $(this);
            
            /**
             *
             * @param value
             * @return {*}
             */
            $.fn.imagesCompare.setValue = function (value) {
                return setVisibleRatio(value);
            };

            if (options.mouseMove) {
                var lastMove = 0;
                var eventThrottle = 1;
                container.on('mousemove', function (event) {
                    event.preventDefault();
                    var now = Date.now();
                    if (now > lastMove + eventThrottle) {
                        lastMove = now;
                        console.log(event);
                        var ratio = (event.pageX - container.offset().left) / frontElement.width();
                        console.log(ratio);
                        setVisibleRatio(ratio);
                    }
                });

                container.on('mouseout', function (event) {
                    console.log('mouseout');
                    var ratio = (event.pageX - container.offset().left) / frontElement.width();
                    if (ratio > 1) {
                        ratio = 1;
                    }
                    if (ratio < 0) {
                        ratio = 0;
                    }
                    setVisibleRatio(ratio);
                });
            }

            if (options.click) {
                container.on('click', function (event) {
                    console.log(event.target);
                    var ratio = (event.pageX - container.offset().left) / frontElement.width();
                    console.log(ratio);
                    setVisibleRatio(ratio);
                });
            }

            container.append("<div class='images-compare-handle'></div>");
            var slider = container.find(".images-compare-handle");
            slider.append("<span class='images-compare-left-arrow'></span>");
            slider.append("<span class='images-compare-right-arrow'></span>");

            container.addClass('images-compare-container');

            var frontElement = container.find('> *:nth-child(1)');
            var backElement = container.find('> *:nth-child(2)');
            frontElement.addClass("images-compare-before");
            backElement.addClass("images-compare-after");

            var imgRef = backElement.find('img').first();
            container.width(imgRef.width());
            container.height(imgRef.height());

            function setVisibleRatio(ratio) {
                ratio = Math.round((ratio * options.roundFactor)) / options.roundFactor;
                console.log(ratio);
                var width = Math.round(frontElement.width() * ratio);
                frontElement.css('clip', 'rect(0, ' + width + 'px, ' + frontElement.height() + 'px, 0)');
                container.trigger({
                    type: 'change',
                    ratio: ratio,
                    value: width
                });
            }

            setVisibleRatio(options.initVisibleRatio);

            // check if same sizes
            if (backElement.width() != frontElement.width()) {
                console.error("Images haven't the same width !");
                console.log("Please change width of image " + frontElement.attr('src') + " to " + backElement.width() + "px");
                frontElement.width(backElement.width());

            }

            if (backElement.height() != frontElement.height()) {
                console.error("Images haven't the same height !");
                console.log("Please change height of image " + frontElement.attr('src') + " to " + backElement.height() + "px");
            }

        });
    };

})(jQuery);
