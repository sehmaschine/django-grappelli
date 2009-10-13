/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gActions
 *  Package: Grappelli
 */

$.widget('ui.gActions', {
    _init: function() {
        var ui = this;
        $('#action-toggle').show().bind('click.grappelli', function(){
            ui.element.find('.result-list input.action-select').attr('checked', $(this).attr('checked'));
        });
    }
});


