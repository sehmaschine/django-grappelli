/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gTimeField
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gTimeField', {

    options: {
        autoSelector: 'input.vTimeField',
        mask: '99:99:99', // set to false to disable
        buttons: [
            {label: gettext("Now"), callback: function(e, ui){ 
                return ui.element.val(new Date().getHourMinuteSecond()); 
            }},
            {label: gettext("Midnight"), callback: function(e, ui){ 
                return ui.element.val('00:00:00'); 
            }},
            {label: gettext("6 a.m."), callback: function(e, ui){ 
                return ui.element.val('06:00:00'); 
            }},
            {label: gettext("Noon"), callback: function(e, ui){ 
                return ui.element.val('12:00:00'); 
            }}
        ]
    },

    _init: function() {
        var ui = this;
        ui.dom = {
            picker: $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a href="#" /></p></div>'),
            button: $('<button class="ui-timepicker-trigger" type="button" />')
        };
        ui.dom.picker.appendTo('body')
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({ display:  'none', position: 'absolute'});

        ui.dom.button
            .bind('click.grappelli', function(){
                ui.toggle(this);
            })
            .insertAfter(ui.element);

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a href="#"></a></li>').find('a')
                .text(button.label).bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    ui.dom.picker.hide();
                    return false;
                }).end()
                .appendTo(ui.dom.picker.find('.timelist'));
        });

        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
        
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    },

    toggle: function(at) {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.hide();
        }
        else {
            ui.show(at);
        }
    },

    show: function(at) {
        var pos = $(at).offset();
        var ui = this;
        $('.clockbox.module:visible').hide();
        ui.dom.picker.show().css({
            top: pos.top - ui.dom.picker.height()/2,
            left: pos.left + 20
        });
        $('body').bind('click.gTimeField', function(e){
            var target = $(e.originalTarget);
            if (!target.hasClass('.clock-title') && !target.hasClass('ui-timepicker-trigger')) {
               ui.hide(); 
            }
        });
    },

    hide: function() {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.dom.picker.hide();
            $('body').unbind('click.gTimeField');
        }
    }

});

})(jQuery);
