/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gActions
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gActions', {
    options: {
        autoSelector: '#changelist'
    },
    _init: function() {
        var ui = this;
        $('#action-toggle').show().bind('click.grappelli', function(){
            ui.element.find('input.action-select').attr('checked', $(this).attr('checked'));
        });
    }
});

})(jQuery);
