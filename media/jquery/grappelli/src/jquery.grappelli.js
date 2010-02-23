/*  Author: Maxime Haineault <max@motion-m.ca>
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

// Fail silently if gettext is unavailable
if (typeof(gettext) == 'undefined') {
    gettext = function (i) { return i; };
}

// Minimal Window Manager
$.wm = function () {
    this.defaults = {width:  600, height: 920, resizable: true, scrollbars: true};

    this._data = function (k, v){
        var html  = (opener && opener.jQuery('html') || $('html'));
        var cache = html.data(this.name);
        if (cache) {
            if (k && v) { cache[k] = v; return v; }
            else if (k) { return cache[k] || false; }
            else        { return cache; }
        }
        else {
            return false;
        }
    };

    this._getOptions = function () {
        var a = [];
        $.each(this.options, function(k, v){ 
            a.push(k +'='+ v); 
        });
        return a.join(',');
    };

    this.close = function () {
        this.window.close();
        this.window = false;
    };

    this.open = function (focus) {
        this.window = window.open(this.href, this.name, this._getOptions());
        this.window.name = this.name;
        if (focus) {
            this.window.focus();
        }
        return this.window;
    };
    if (arguments.length > 1) {
        this.href    = arguments[0];
        this.options = $.extend(this.defaults, arguments[1] || {});
        this.name    = 'window-'+ String((new Date()).getTime());
        this.window  = false;
    }
    else {
        this.name = arguments[0];
        var data = (opener && opener.jQuery('html') || $('html')).data(this.name);
        if (data && data.instance) {
            return data.instance;
        }
        else {
            return false;
        }
    }

    (opener && opener.jQuery('html') || $('html')).data(this.name, { instance: this });

    return this;
};

$.unescapeHTML = function(str) {
    var div = $('<div />').html(str.replace(/<\/?[^>]+>/gi, ''));
    return div.get(0) ? div.text(): '';
};

$(function(){
    
    // Fieldset collapse
    // $('.module.collapse-closed h2, .module.collapse-open h2').addClass('collapse-toggle').bind('click.grappelli', function(){
    //     $(this).parent().toggleClass('collapse-open').toggleClass('collapse-closed');
    // });
    $('.group.collapsible h2, .module.collapsible h2, .module.collapsible h3, .module.collapsible h4').addClass('collapsible-handler').bind('click.grappelli', function(){
        var collapsible = $(this).parent();
        var collapsibleExclude = '.collapsible-handler, .module .tools, .collapsible-bypass';

        // Simple Toggle Behaviour
        collapsible.toggleClass('open').toggleClass('closed');

        // SlideUp/SlideDown Behaviour
        // if (collapsible.hasClass('open')) {
        //     $(collapsible).removeClass('open');
        //     $(collapsible).children().not(collapsibleExclude).slideUp(400, function(){
        //         $(collapsible).addClass('closed');
        //     });
        // }
        // if (collapsible.hasClass('closed')) {
        //     $(collapsible).removeClass('closed').addClass('open');
        //     $(collapsible).children().not(collapsibleExclude).slideDown(400);
        // }
    });

    // Collapsible groups
    // $('.group.collapsible .section').parent().bind('click.grappelli', function (){
    //     $(this).parents('table').find('tbody').toggle();
    // });
    
    // 
    
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
            });
        return false;
    });
    

});

})(jQuery);
