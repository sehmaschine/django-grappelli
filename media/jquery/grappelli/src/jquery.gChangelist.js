/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gChangelist
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gChangelist', {
    
    options: {
        autoSelector: '.changelist-content'
    },

    _create: function() {
        var ui = this;
          
        this.table   = ui.element.find('table');
        this.content = ui.element;

        $(".date-hierarchy-choice").change(function(){
            location.href = $(this).val();
        });

        $(".filter_choice").change(function(){
            location.href = $(this).val();
        });
        
        // TICKET #11447: td containing a.add-another need.nowrap
        $('table a.add-another').parent('td').addClass('nowrap');

        $('.filterset h3').click(function() {
            $(this).parent()
                .toggleClass('collapse-closed')
                .toggleClass('collapse-open').end()
                .next().next().toggle();
        });
        $('input.search-fields-verbose').click(function() {
            $(this).val('').removeClass("search-fields-verbose");
        });
    
        // SUBMIT FORM WITHOUT "RUN"-BUTTON
        $('div.actions select').change(function(){
            if ($(this).val()) {
                $('div.changelist-content form').submit();
            }
        });

        $(window).resize(function(){ ui.redraw(); });
        ui.redraw();
    },

    /// CHANGELIST functions
    /// in order to prevent overlapping between the result-list
    /// and the sidebar, we insert a horizontal scrollbar instead.
    redraw: function() {
        var ui = this;
        var tw = ui.table.outerWidth();
        var cw = ui.content.outerWidth();

        if (tw > cw) {
            // $('#changelist.module.filtered').css('padding-right', 227);
            // $('.changelist-content').css('min-width', (tw + 1) +'px');
            // $('#changelist-filter').css('border-right', '15px solid #fff');
        }
        if (tw < cw) {
            // $('#changelist.module.filtered').css('padding-right', 210);
            // $('.changelist-content').css('min-width', 'auto');
            // $('#changelist-filter').css('border-right', 0);
        }
    }
});

})(jQuery);
