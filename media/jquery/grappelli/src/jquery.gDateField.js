/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 */

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonText:      'Date picker',
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext('Cancel'),
//  buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-calendar.png'
});

$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;
        ui.element.datepicker(ui.options.datepicker)
            .parent().find('br').replaceWith('<span class="spacer" />').end();
    }
});

