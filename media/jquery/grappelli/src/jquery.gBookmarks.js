/*  Author:  Maxime Haineault <max@motion-m.ca>
 *  widget:  gBookmarks
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gBookmarks', {

    _mapDom: function() {
        var ui = this;
        for (var x in ui.options.ns) {
            ui.dom[x] = jQuery(ui.options.ns[x]);
        }
    },
         
    _init: function() {
        var ui  = this;
        var url = ui.options.url +'?path='+ window.location.pathname +' #bookmarks > li';
        ui.dom = {};

        ui.element.load(url, function(){

            ui._mapDom();
            
            ui._timeout = true;
            ui.showMethod = ui.options.effects && 'slideDown' || 'show';
            ui.hideMethod = ui.options.effects && 'slideUp'   || 'hide';

            ui.dom.add.live("click",    function() { return ui.add();    });
            ui.dom.cancel.live("click", function() { return ui.cancel(); });

            $("li#toggle-bookmarks-listing.enabled")
                .live("mouseover", function(){ 
                    ui.show("#bookmarks-listing:hidden"); 
                    $("#bookmarks").one("mouseleave", function(){ 
                        ui.hide("#bookmarks-listing:visible"); 
                    });
                });
        });
    },

    /*  Show the drop down menu
     *
     * */
    show: function(el) {
        var ui = this;
        ui._timeout = false;
        $(el)[ui.showMethod](ui.options.effectsSpeed);
    },

    hide: function(el, timeout, speed) {
        var ui = this;
        ui._timeout = true;
        setTimeout(function(){
            if (ui._timeout) {
                $(el)[ui.hideMethod](speed || ui.options.effectsSpeed);
                ui._timeout = false;
            }
        }, typeof(timeout) == 'undefined' && ui.options.hideTimeout || timeout);
    },

    cancel: function() {
        var ui = this;
        ui.hide(ui.dom.addWrapper, 0);
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    add: function() {
        var ui = this;
        $("#bookmark-title").val($('h1').text());
        $("#bookmark-path").val(window.location.pathname);
        $("#toggle-bookmarks-listing").removeClass('enabled');
        $('#bookmarks-listing').hide();
        ui.hide("#bookmarks-listing", 0, 0);
        ui.show(ui.dom.addWrapper);
        return false;
    }
});

$.ui.gBookmarks.defaults = {

    // DOM mapping
    ns: {
        wrapper:    '#bookmarks',
        addWrapper: '#bookmark-add',
        add:        '#toggle-bookmark-add',
        cancel:     '#bookmark-add-cancel',
        list:       '#toggle-bookmarks-listing',
        path:       '#bookmark-path',
        title:      '#bookmark-title'
    },

    // backend URL
    url: BOOKMARKS_URL,

    // Set to false to disable effects or true to enable them
    effects: true,

    // Speed at which effects are applied (in ms)
    effectsSpeed: 80,
    
    // Amount of time (in ms) before hiding the menu.
    //
    // Allowing a small grace period before hiding the menu avoid
    // lots of accidental gestures and makes the menu feels more
    // "solid" for the user. 
    //
    // TL-DR: the menu doesn't feel like it has ADD
    hideTimeout: 500

};

})(jQuery);
