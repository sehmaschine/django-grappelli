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
        delay: 1.5,

        // events
        slugify: function(e, ui) {
            var slugfield = $(e.data.slugfield);
            var target    = $(e.data.target);
            var value     = $.slugify(target.val() || target.text(), slugfield.attr('maxlength'));
            slugfield.val(value);
        },
        slugified: function(e, ui) {}
    },

    _create: function() {
        var ui = this; 
        if (!/__prefix__/.test(ui.element.attr('id'))) {
            ui.mode = ui.element.attr('rel') && 'target' || 'standalone';
            ui.dom  = {};
            // target mode use a draggable handle which can
            // be dragged on other fields in the form to fill
            // automatically the slug field
            if (ui.mode == 'target') {
                var crosshair_src = $.grappelli.conf.get('admin_media_prefix') + ui.option('crosshairImg');
                ui.dom.crosshair = $(ui.option('crosshair')).attr('src', crosshair_src)
                    .insertAfter(ui.element).draggable({
                        helper:   'clone',
                        appendTo: 'body',
                        scope:    'slugfield',
                        scroll:   true,
                        revert:   true,
                        revertDuration: 100,
                        start: function(e) {

                            $('body').addClass('ui-state-dragging').data('activeSlugfield', ui.element);
                        },
                        stop: function(e, ui) {
                            $('body').removeClass('ui-state-dragging').data('activeSlugfield', null);
                        }
                    });
                // apply droppale on specified forms elements
                $(ui.element.attr('rel'))
                    .droppable({
                        scope: 'slugfield',
                        greedy: true,
                        activeClass: 'ui-state-highlight',
                        drop:  function(e, inst) { 
                            ui._refresh(e, this);
                        }
                    });            
            }

            // Make sure the field is slugified 
            // either on blur or on keyup
            ui.element.bind('blur', function(e){
                ui._refresh(e, this);
            }).delayedObserver(function(e){
                ui._refresh(e, this);
            }, ui.option('delay'));
        }
    },
    
    _refresh: function(e, source) {
        var ui = this;
        var sf = $('body').data('activeSlugfield') || ui.element;
        ui._trigger('slugify',   {type:'slugify',   data: {target: source, slugfield: sf}}, ui);
        ui._trigger('slugified', {type:'slugified', data: {target: source, slugified: sf}}, ui);
    }
});
})(jQuery);
