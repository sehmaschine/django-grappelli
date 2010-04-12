/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gLayout
 *  Package: Grappelli
 *
 */
(function($){

$.widget('ui.gLayout', {

    options: {
        autoSelector: '.container-flexible',
    },

    _tableStrech: function() {
        var ui = this;

        // Table of module, always '.changelist-results'
        var table = ui.element.children('table');
        
        // Set width to 'auto' to calculate new TableLastChildModifiedWidth when th browser-window is resized
        table.children('table thead th:last').css('width', 'auto');
        
        // Calculate desired width of thead th:last
        var ModuleWidth = ui.element.outerWidth();
        var TableWidth  = table.outerWidth();
        var TableModuleDifference = ModuleWidth - TableWidth;
        var TableLastChildWidth = table.children('thead th:last').outerWidth();
        var TableLastChildModifiedWidth = TableLastChildWidth + TableModuleDifference - 12;
        
        //  assign TableLastChildModifiedWidth to thead th:last
        table.children('thead th:last').css('width', TableLastChildModifiedWidth);
    },

    _horizontalOverflow: function() {
        var ui = this;
        var tablewidth = ui.element.find('table').outerWidth();
        var spanflexiblewidth = ui.element.find('.span-flexible').outerWidth();
        if (tablewidth > spanflexiblewidth) {
            ui.element.find('.span-flexible').css('min-width', tablewidth + 1 + 'px');
            ui.element.find('.span-flexible').next('.column').css('border-right', '20px solid transparent');
        }
        else {
            ui.element.find('.span-flexible').css('min-width', 'auto');
        }
    },

    _create: function() {
        var ui = this;
        $('#content').addClass('content-flexible');

        if ($.grappelli.conf.get('isPopup')) {
            // HACK: REMOVE ACTIONS and LIST_EDITABLES FOR POPUPS
            $('div.actions, p.submit-row').hide();
            $('input.action-select').parent().hide();
            $('input#action-toggle').parent().hide();
        }

        ui.element.find('.span-flexible').next('.column').parent().addClass('layout-flexible-grid');
        ui.element.find('.column').next('.span-flexible').parent().addClass('layout-grid-flexible');
        ui.element.append('<br clear="all" />');

        $('.changelist-results a.add-another').parent().addClass('nowrap');
        // $('.changelist-results a.related-lookup').parent().addClass('nowrap');

        // Layout Flexible + Grid
        if (ui.element.hasClass('layout-flexible-grid')) {
            var SpanGrid     = ui.element.find('.span-flexible').next('.column').outerWidth();
            var PaddingRight = SpanGrid + 20;
            var MarginRight  = - SpanGrid - 20;

            ui.element.css('padding-right', PaddingRight)
                .find('.span-flexible')
                    .next('.column')
                    .css('margin-right', -10000);
        }

        $(window).resize(function(){
            ui._horizontalOverflow();
            ui._tableStrech();
        });

        // Stretch the table as soon as it - and its delayed contents like RelatedObjects - are loaded
        // The image is a temporary solution
        $('.changelist-results img.loader').load(function() {
            ui._tableStrech();
        });

        window.onload = function () {
            // Stretch the table as soon as it - and its delayed contents like RelatedObjects - are loaded
            // inserted temporarily because the document.ready does not work on first load (just when the page is reloaded)
            ui._horizontalOverflow();
            ui._tableStrech();
        }

//          var filter_activated = false;
//          var filter_activated_counter = 0;
//          $(".filter_choice").each(function(){
//              $(this).find("option:selected").not(":first-child").each(function(){
//                  filter_activated_counter = filter_activated_counter + 1;
//                  filter_activated = true;
//              });
//          });
        
    }
});
})(jQuery);
