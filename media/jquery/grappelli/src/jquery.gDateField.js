/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 */
(function($){

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
        ui.element.datepicker()
            .parent().find('br').replaceWith('<span class="spacer" />');
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    }
});

$.ui.gDateField.defaults = {
    mask: '9999-99-99', // set to false to disable
};

})(jQuery);
