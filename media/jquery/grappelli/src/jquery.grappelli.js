/*  Author: Maxime Haineault <max@motion-m.ca>
 *  Package: Grappelli
 */

if (typeof(gettext) == 'undefined') {
    function gettext(i) { return i; }; // TODO: temporary fix
}

$.popup = function(name, href, options) {
    var arr = [];
    var opt = $.extend({width:  600, height: 920, resizable: true, scrollbars: true}, options);
    $.each(opt, function(k, v){ arr.push(k +'='+ v); });
    var win  = window.open(href, name, arr.join(','));
    win.name = name;
    win.focus();
    return win;
};

$(function(){
    
    // Fieldset collapse
    $('.module.collapse-closed h2, .module.collapse-open h2').addClass('collapse-toggle').bind('click.grappelli', function(){
        $(this).parent().toggleClass('collapse-open').toggleClass('collapse-closed');
    });

    // Always focus first field of a form OR the search input
    $('form .form-row:eq(0)')
        .find('input, select, textarea, button').eq(0)
        .add('#searchbar').focus();

    $('.object-tools a[href=history/]').bind('click.grappelli', function(){
        $('<div />').hide().appendTo('body')
            .load($(this).attr('href') +' #content', {}, function(html, rsStatus){
                $(this).dialog({
                    width:  700,
                    title:  $(this).find('h1:first').hide().text(),
                    height: 300        
                }).show();
            })
        return false;
    });
});


