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

$.grappelli = (new function(){
    var g = this;
    g._
    g._registy = {};
    g.inst = {};

    g.inst.widgets = {
        init: function (widgets, parent){
            var iterator = function (i, widgetName) {
            var w = jQuery.ui[widgetName];
            if (w && w.autoSelector) {
                if (parent) {
                    console.log(jQuery(parent).find(w.autoSelector))
                    jQuery(parent).find(w.autoSelector)[widgetName]();
                }
                else {
                    jQuery(w.autoSelector)[widgetName]();
                }
            }
            };
            $.each(widgets, iterator);
        }
    };

    g.inst.conf = {
        extend: function (obj){
            for (var x in obj) {
                if (obj.hasOwnProperty(x)) {
                    g.inst.conf.set(x, obj[x]);
                }
            }
        },
        set: function (k, v){
            return g._registy[k] = v;
        },
        get: function (k, fallback){
            try {
                return g._registy[k];
            }
            catch (e) {
                return fallback || false;
            }
        }
    };

    g.inst.contentTypeExist = function(pk) {
        return g.inst.conf.get('content_types')[pk] && true || false;
    };

    g.inst.contentTypeURL = function(pk) {
        var ct = g.inst.conf.get('content_types')[pk];
        return  [g.inst.conf.get('admin_url'), ct.app, '/', ct.model, '/'].join('');
    };

    g.inst.getMessages = function(url, method, data, callback) {
            var wrapper = $('.messagelist').hide();
            if (!wrapper.get(0)) {
                wrapper = $('<ul class="messagelist" />').hide().insertBefore('#content');
            }
            jQuery[method](url, data || {}, function() {
                if (callback) {
                    callback.apply(this, arguments);
                }
                var tmp = arguments[0].match(/\<ul\sclass="messagelist\s?(\w+?)">(.*)<\/ul>/);
                if (tmp[1]) {
                    wrapper.html(tmp[2]).addClass(tmp[1]).slideDown('fast');
                }
            });
    
    };
    return g.inst;
}());


// Minimal Window Manager
$.extend($.grappelli, {
    window: function () {
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
            this._win.close();
            this._win = false;
        };

        this.open = function (focus) {
            this._win = window.open(this.href, this.name, this._getOptions());
            this._win.name = this.name;
            if (focus) {
                this._win.focus();
            }
            return this._win;
        };
        if (arguments.length > 1) {
            this.href    = arguments[0];
            this.options = $.extend(this.defaults, arguments[1] || {});
            this.name    = 'window-'+ String((new Date()).getTime());
            this._win    = false;
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
    }
});

$.unescapeHTML = function(str) {
    var div = $('<div />').html(str.replace(/<\/?[^>]+>/gi, ''));
    return div.get(0) ? div.text(): '';
};

$(function(){
    
    
    // Always focus first field of a form OR the search input
    // TODO: this is most likely broken if the first field is a rich text area ..
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
