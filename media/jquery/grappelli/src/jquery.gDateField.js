/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 *
 *  jslinted - 9 Mar 2010 (r764)
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
    isRTL:           $.grappelli.conf.get('rtl')
});


$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;

        ui.element.datepicker().parent()
            // replace BR
            .find('br').replaceWith(ui.options.spacer || '');

        // remove text Date: & Time: (now that's ugly..)
        if (!ui.element.prev().get(0)) {
            try {
                ui.element.parent().get(0).childNodes[0].replaceWholeText('');
                ui.element.parent().get(0).childNodes[3].replaceWholeText('');
            } catch (e) {}
        }
            
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    }
});

$.extend($.ui.gDateField, {
    autoSelector: 'input.vDateField',
    defaults: {
        // set to false to disable input masking
        mask:   '9999-99-99',                   

        // separator between date and time fields
        spacer: '<span class="spacer" />'
    }
});
})(jQuery);
