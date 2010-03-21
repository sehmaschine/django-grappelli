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
        lockButton:   '<button title="Unlock" class="ui-gAutoSlugField-toggle" />',
        delay: 1.5
    },

    _init: function() {
        var ui  = this; 
        ui.mode = ui.element.attr('rel') && 'target' || 'standalone';
        ui.dom  = {};

        if (ui.mode == 'target') {
            ui.element.attr('readonly', 'true');
            ui.dom.lockButton = $(ui.options.lockButton).insertAfter(ui.element);
            ui.dom.lockButton.draggable({
                appendTo: ui.element.parent(),
                helper:   function() {
                $('<div style="background:#c30;width:10px;height:10px;position:relative;">test</div>'); },
//                revert:   true,
//                revertDuration: 800,
//                scope:    'slugfield',
//                scroll:   true,
                start: function(e) {
                    //console.log(this, e);
                }
            });
            $(ui.element.attr('rel')).droppable({
//                scope: 'slugfield',
                drop: function() { alert('dropped'); }
            });            
        }
        else {
            ui.dom.input = ui.element;
            ui.dom.input.delayedObserver(function(e){
                ui._refresh(e, this);
            }, ui.options.delay);
        }

//      ui.element.bind('blur', function(e){
//          ui._refresh(e, this);
//      });

//      ui.dom.input.bind('blur', function(e){
//          ui._refresh(e, this);
//      });

        //ui._refresh(); // sync initial values
    },
    
    _refresh: function(e, source) {

        var ui, val;
        ui  = this;
        val = $.slugify((source && $(source) || ui.dom.input).val(), ui.element.attr('maxlength'));
        ui.element.val(val);
    }
});

})(jQuery);
