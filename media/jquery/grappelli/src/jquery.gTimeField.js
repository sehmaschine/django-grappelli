// TIME PICKER

$.widget('ui.gTimeField', {
    _init: function() {
        var ui = this;
        var picker = $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a href="#" /></p></div>')
            .appendTo('body')
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({ display:  'none', position: 'absolute'});

        var button = $('<img />')
                        .attr('src', ui.options.buttonImage)
                        .attr('alt', gettext('Clock'))
                        .wrap('<a href="#" />')
                            .attr('title', gettext('Clock'))
                            .insertAfter(ui.element)
                            .bind('click.grappelli', function(){
                                var pos = $(this).offset();
                                if (picker.is(':visible')) {
                                    picker.hide();
                                    $('body').unbind('click.gTimeField');
                                }
                                else {
                                    $('.clockbox.module:visible').hide();
                                    picker.show().css({
                                        top: pos.top - picker.height()/2,
                                        left: pos.left + 20
                                    });
                                    $('body').bind('click.gTimeField', function(e){
                                        var target = $(e.originalTarget);
                                        if (!target.hasClass('clock-title')) {
                                           picker.hide(); 
                                        }
                                    });
                                }
                            })
                            .parent().click(function(){ return false; })

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a href="#"></a></li>').find('a')
                .text(button.label).bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    picker.hide();
                    return false;
                }).end()
                .appendTo(picker.find('.timelist'));
        });

        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
    }         
});

$.ui.gTimeField.defaults = {
    buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-clock.png',
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
};
