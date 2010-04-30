/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gAutoSlugField
 *  Package:  Grappelli
 *  Requires: jquery.gAutoSlugField.js
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gAutoSlugField', {

    options: {
        autoSelector: '.ui-gAutoSlugField',
        crosshair:    '<img alt="X" class="ui-gAutoSlugField-handle" title="Drag on other input to set new slug" />',
        crosshairImg: 'img/icons/icon-changelist-actions.png',
        delay: 1.5
    },

    _create: function() {
        var ui  = this; 
        ui.mode = ui.element.attr('rel') && 'target' || 'standalone';
        ui.dom  = {};

        if (ui.mode == 'target') {
            ui.dom.crosshair  = $(ui.option('crosshair')).attr('src', $.grappelli.conf.get('admin_media_prefix') + ui.option('crosshairImg')).insertAfter(ui.element).draggable({
                helper:   'clone',
                appendTo: 'body',
                scope:    'slugfield',
                scroll:   true,
                revert:   true,
                revertDuration: 100,
                start: function(e) {
                    $('body').addClass('ui-state-dragging');
                },
                stop: function(e) {
                    $('body').removeClass('ui-state-dragging');
                }
            });
            $(ui.element.attr('rel')).not(ui.element).droppable({
                scope: 'slugfield',
                activeClass: 'ui-state-highlight',
                drop:  function(e) { 
                    ui._refresh(e, this);
                }
            });            
        }
        ui.element.bind('blur', function(e){
            ui._refresh(e, this);
        }).delayedObserver(function(e){
            ui._refresh(e, this);
        }, ui.option('delay'));
    },
    
    _refresh: function(e, source) {
        var ui, val;
        ui  = this;
        src = (source && $(source) || ui.element);
        val = $.slugify(src.val() || src.text(), ui.element.attr('maxlength'));
        ui.element.val(val);
    }
});

})(jQuery);
