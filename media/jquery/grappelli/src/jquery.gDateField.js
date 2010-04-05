/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 *
 *  jslinted - 9 Mar 2010 (r764)
 */
(function($){
$.datepicker.setDefaults({
//    dateFormat:      'yy-mm-dd',
    dateFormat:      (gettext('DATE_FORMAT') == 'DATE_FORMAT') && 'yy-mm-dd' || gettext('DATE_FORMAT'),
    buttonText:      ' ',
    duration:        160,
    showAnim:        'slideDown',
    showOn:          'button',
    buttonImageOnly: false, 
    showButtonPanel: true, 
    closeText:       gettext && gettext('Cancel') || 'Cancel',
    showOtherMonths: true,
    constrainInput:  true,
    defaultDate:     'today',
    // Localization
    monthNames:      gettext('January February March April May June July August September October November December').split(' '),
    dayNamesMin:     gettext('S M T W T F S').split(' '),
    dayNamesShort:   gettext('S M T W T F S').split(' '),
    firstDay:        parseInt(gettext('FIRST_DAY_OF_WEEK') == 'FIRST_DAY_OF_WEEK' && 0 || gettext('FIRST_DAY_OF_WEEK')),
    isRTL:           $.grappelli.conf.get('rtl')
});

$.widget('ui.gDateField', {

    options: {
        autoSelector: 'input.vDateField',

        // set to false to disable input masking
        mask:   false, //'9999-99-99',                   

        // separator between date and time fields
        spacer: '<span class="spacer" />'
    },

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
    events: {
        nodeCloned: function(e) {
            var parent = e.originalEvent.data.node;
            var nodes  = $($.ui.gDateField.autoSelector, e.originalEvent.data.node);
            if (nodes.length) {
                nodes.parent().find('.ui-datepicker-trigger').remove();
                nodes.removeClass('hasDatepicker').data('datepicker', false);
                nodes.gDateField('destroy').gDateField();
            }
        }
    }
});
})(jQuery);
