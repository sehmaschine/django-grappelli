/// CHANGELIST functions
/// in order to prevent overlapping between the result-list
/// and the sidebar, we insert a horizontal scrollbar instead.

function HorizontalOverflow() {
    var TableWidth = $('table').outerWidth();
    var ContentWidth = $('.changelist-content').outerWidth();
    if (TableWidth > ContentWidth) {
        $('#changelist.module.filtered').css({
            'padding-right' : 227
        });
        $('.changelist-content').css({
            'min-width' : TableWidth+1+'px'
        });
        $('#changelist-filter').css({
            'border-right' : '15px solid #fff'
        });
    }
    if (TableWidth < ContentWidth) {
        $('#changelist.module.filtered').css({
            'padding-right': 210
        });
        $('.changelist-content').css({
            'min-width': 'auto'
        });
        $('#changelist-filter').css({
            'border-right': 0
        });
    }
};
$(window).resize(function(){
    HorizontalOverflow();
});
window.onload = function () {
    HorizontalOverflow();
}
$(document).ready(function(){
    
    // TICKET #11447: td containing a.add-another need.nowrap
    $('table').find('a.add-another').parent('td').addClass('nowrap');
    
    $('.filterset h3').click(function() {
        $(this).parent().toggleClass('collapse-closed');
        $(this).parent().toggleClass('collapse-open');
        $(this).next().next().toggle();
    });
    $('input.search-fields-verbose').click(function() {
        $(this).val("");
        $(this).removeClass("search-fields-verbose");
    });
    
    // SUBMIT FORM WITHOUT "RUN"-BUTTON
    $('div.actions select').change(function(){
        if ($(this).val()) {
            $('div.changelist-content form').submit();
        }
    });
    
});
