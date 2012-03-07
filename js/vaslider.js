// ––––––––––––––––––––––––––––––––––––––––
// VASLIDER
// copyright 2012, p. kranzlmueller
// ––––––––––––––––––––––––––––––––––––––––


(function($) {
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.vaSlider.defaults, options);
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('vaSlider');
                if (!data) {
                    // variables
                    var margin = distance = 0;
                    var index = 1;
                    var sliderlist = $this.find(options.sliderListClass);
                    var slideritems = $this.find(options.sliderListItemClass);
                    var items = slideritems.length;
                    var width = sliderlist.width();
                    // width
                    slideritems.each(function(){$(this).width(sliderlist.width());});
                    sliderlist.width(width*items);
                    // data
                    $(this).data('vaSlider', {
                        slider: $this,
                        sliderlist: sliderlist,
                        distance: width,
                        items: items,
                        index: index,
                        options: options
                    });
                }
                // handlers
                $this.find(options.prevHandlerClass).find("a").bind("click", function() {
                    $this.vaSlider("moveLeft");
                    $this.vaSlider("updateButtons");
                });
                $this.find(options.nextHandlerClass).find("a").bind("click", function() {
                    $this.vaSlider("moveRight");
                    $this.vaSlider("updateButtons");
                });
                $this.find(options.buttonHandlerClass).find("a").bind("click", function() {
                    $this.vaSlider("moveTo", parseInt($(this).attr("class"), 10));
                    $this.vaSlider("updateButtons");
                });
                // init state
                $this.find(options.prevHandlerClass).addClass("inactive");
                $this.find(options.buttonHandlerClass).eq(0).addClass("active");
            });
        },
        moveLeft: function() {
            var $this = $(this), data = $this.data('vaSlider');
            if (data.index!=1) {
                data.index -= 1;
                data.sliderlist.animate({ 
                    marginLeft: "+="+data.distance
                }, data.options.speed, data.options.animation);
            }
        },
        moveRight: function() {
            var $this = $(this), data = $this.data('vaSlider');
            if (data.index!=data.items) {
                data.index += 1;
                data.sliderlist.animate({ 
                    marginLeft: "-="+data.distance
                }, data.options.speed, data.options.animation);
            }
        },
        moveTo: function(index) {
            var $this = $(this), data = $this.data('vaSlider');
            var w = parseInt(index, 10)*data.distance-data.distance;
            data.index = index;
            data.sliderlist.animate({ 
                marginLeft: -w
            }, data.options.speed, data.options.animation);
        },
        updateButtons: function() {
            var $this = $(this), data = $this.data('vaSlider'),
                prev = $this.find(data.options.prevHandlerClass),
                next = $this.find(data.options.nextHandlerClass),
                buttons = $this.find(data.options.buttonHandlerClass);
            data.index==1 ? prev.addClass("inactive") : prev.removeClass("inactive");
            data.index==data.items ? next.addClass("inactive") : next.removeClass("inactive");
            buttons.removeClass("active");
            $(buttons.get(data.index-1)).addClass("active");
        }
    };
    
    $.fn.vaSlider = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.bookingForm');
        }
        return false;
    };
    
    // ********************
    // DEFAULTS
    
    $.fn.vaSlider.defaults = {
        sliderListClass: ".slider-list",
        sliderListItemClass: ".slider-item",
        sliderButtonClass: "ul.slider-buttons",
        // handlers
        prevHandlerClass: "li.slider-prev",
        nextHandlerClass: "li.slider-next",
        buttonHandlerClass: "li.slider-button",
        // animation
        speed: 300,
        animation: "swing"
    };
    
})(jQuery);
