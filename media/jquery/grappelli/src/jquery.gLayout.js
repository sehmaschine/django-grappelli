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
    }
});
})(jQuery);
