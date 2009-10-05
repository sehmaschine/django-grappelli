// DATE PICKER

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonImageOnly: true,
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext('Cancel'),
    buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-calendar.png'
});

$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;
        ui.element.datepicker(ui.options.datepicker)
            .parent().find('br').replaceWith('<span class="spacer" />').end()
                .find('img')
                    .attr('alt', gettext('Calendar'))
                    .attr('title', gettext('Calendar'))
                    .wrap('<span />').wrap('<a />')
                        .hover(function(){
                            $(this).attr('src', $(this).attr('src').replace('.png', '-hover.png'));
                        }, function(){
                            $(this).attr('src', $(this).attr('src').replace('-hover.png', '.png'));
                        }).parent().click(function(){ return false; });
    }
});

