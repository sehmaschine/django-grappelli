/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonText:      ' ',
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext && gettext('Cancel') || 'Cancel',
    showOtherMonths: true,
    constrainInput:  true,
    defaultDate:     'today',
});


$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;
        console.log(ui.element)
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
