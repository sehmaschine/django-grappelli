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
        crosshair:    '<img alt="X" title="Drag on other input to set new slug" style="z-index:1000;position:relative;top:6px;left:6px;" />',
        crosshairImg: 'img/icons/icon-changelist-actions.png',
        delay: 1.5
    },

    _init: function() {
        var ui  = this; 
        ui.mode = ui.element.attr('rel') && 'target' || 'standalone';
        ui.dom  = {};
        console.log($.grappelli.conf.get('admin_media_prefix'));
        console.log(ui.options.crosshair);

        if (ui.mode == 'target') {
            //ui.element.attr('readonly', 'true');
            ui.dom.crosshair  = $(ui.options.crosshair).attr('src', $.grappelli.conf.get('admin_media_prefix') + ui.options.crosshairImg).insertAfter(ui.element).draggable({
                helper:   'clone',
                appendTo: 'body',
                revert:   true,
                revertDuration: 100,
                scope:    'slugfield',
//                scroll:   true,
                start: function(e) {
                    $('body').addClass('ui-state-dragging');
                },
                stop: function(e) {
                    $('body').removeClass('ui-state-dragging');
                }
            });
            $(ui.element.attr('rel')).droppable({
                scope: 'slugfield',
                activeClass: 'ui-state-highlight',
                drop:  function(e) { 
                    ui._refresh(e, this);
                }
            });            
        }
        else {
            ui.dom.input = ui.element;
            ui.dom.input.delayedObserver(function(e){
                ui._refresh(e, this);
            }, ui.options.delay);
        }
    },
    
    _refresh: function(e, source) {

        var ui, val;
        ui  = this;
        src = (source && $(source) || ui.dom.input);
        val = $.slugify(src.val() || src.text(), ui.element.attr('maxlength'));
        ui.element.val(val);
    }
});

})(jQuery);
