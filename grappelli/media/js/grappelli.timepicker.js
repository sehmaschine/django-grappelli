(function( $ ) {


$.widget("ui.timepicker", {
    // default options
    options: {
        template: '<div id="ui-timepicker" class="module" style="position: absolute; display: none;"></div>',
        timepicker_selector: "#ui-timepicker",
        offset: {
            top: 5
        },
        time_list: [
            'now',
            '18:00',
            '18:30',
            '19:00',
            '19:30',
            '20:00',
            '20:30',
            '21:00',
            '21:30',
            '22:00',
            '22:30',
            '23:00',
            '23:30'
        ]
    },
    
    _create: function() {
        //console.log("JO!", this.element)
        //this.element.after('<button type="button" class="ui-timepicker-trigger"></button>');
        //this.element.next().click(function() {
        //    alert("JOJO!!!")
        //});
        var self = this,
            options = self.options;
        
        this._init();
        
        this.element.addClass("hasTimepicker");
        this.button = $('<button type="button" class="ui-timepicker-trigger"></button>');
        this.element.after(this.button);
        
        // get/create timepicker
        this.timepicker = $(options.timepicker_selector);
        this.timepicker.hide();
        
        // register events
        this.button.click(function() {
            if (self.element.attr("disabled")) return;
            self._toggleTimepicker();
        });
        //this.element.focus(function() {
        //    self._toggleTimepicker();
        //})
    },
    
    _init: function() {
        if ($(this.options.timepicker_selector).size() > 0) return;
        
        var self = this,
            options = self.options,
            template = $(options.template),
            template_str = "<ul>";
            
        
        for (var i = 0; i < options.time_list.length; i++) {
            if (options.time_list[i] == "now") {
                template_str += '<li class="ui-state-active row">' + options.time_list[i] + '</li>';
            } else {
                template_str += '<li class="ui-state-default row">' + options.time_list[i] + '</li>';
            }
        }
        template_str += "</ul>";
        template.append(template_str);
        
        template.appendTo("body").find('li').click(function() {
            $(this).parent().children('li').removeClass("ui-state-active");
            $(this).addClass("ui-state-active");
            var new_val = $(this).html();
            if (new_val == "now") {
                var now = new Date(),
                    hours = now.getHours(), 
                    minutes = now.getMinutes();
                
                hours = ((hours < 10) ? "0" + hours : hours);
                minutes = ((minutes < 10) ? "0" + minutes : minutes);
                
                new_val = hours + ":" + minutes;
            }
            $(self.timepicker.data("current_input")).val(new_val);
            self.timepicker.hide();
        });
        
        $(document).mousedown(function(evt) {
            if (self.timepicker.is(":visible")) {
                var $target = $(evt.target);
                if ($target[0].id != self.timepicker[0].id && $target.parents(options.timepicker_selector).length == 0 && !$target.hasClass('hasTimepicker') && !$target.hasClass('ui-timepicker-trigger')) {
                    self.timepicker.hide();
                }
            }
        });
    },
    
    _toggleTimepicker: function() {
        if (this.timepicker.is(":visible")) {
            this.timepicker.data("current_input", null);
            this.timepicker.hide();
        } else {
            this.timepicker_offset = this.element.offset();
            //this.timepicker_offset.left += this.element.outerWidth() 
            this.timepicker_offset.top += this.element.outerHeight() + this.options.offset.top;
            this.timepicker.css(this.timepicker_offset);
            this.timepicker.data("current_input", this.element);
            this.element.focus();
            this.timepicker.show();
        }
        this.timepicker_open = !this.timepicker_open;
    },
    
    value: function() {
        // calculate some value and return it
        return 25;
    },
    
    length: function() {
        return 22;
    },
    
    destroy: function() {
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
        // now do other stuff particular to this widget
    }
});

})(jQuery.noConflict());