/*  Author:  Maxime Haineault <max@motion-m.ca>
 *  widget:  gBookmarks
 *  Package: Grappelli
 *
 *  jslinted - 10 Mar 2010
 */
(function($){

$.widget('ui.gBookmarks', {
         
    options: {
        autoSelector: '#bookmarks',
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
    },

    _create: function() {
        var ui, url;
        ui  = this;
        url = $.grappelli.conf.get('bookmarks_url') +'?path='+ window.location.pathname +' #bookmarks > li';

        ui.options = $.extend($.ui.gBookmarks.defaults, ui.options);
        ui.dom = {};

        ui.element.load(url, function(){
            ui._mapDom();
            ui._timeout   = true;
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

    /* Maps the ui.options.ns property to their
     * respective DOM node so that { wrapper: '#bookmarks' }
     * becomes "ui.dom.wrapper" that points to $('#bookmarks')
     **/
    _mapDom: function() {
        var ui, x;
        ui = this;
        for (x in ui.options.ns) {
            ui.dom[x] = jQuery(ui.options.ns[x]);
        }
    },

    /*  Show the drop down menu
     *  @speed animation speed, uses options by default
     * */
    show: function(el, speed) {
        var ui = this;
        ui._timeout = false;
        $(el)[ui.showMethod](speed || ui.options.effectsSpeed);
    },

    /* Hide a given menu
     *  @timeout animation timeout, uses options by default
     *  @speed animation speed, uses options by default
     * */
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

    /* This method is called when the cancel button of
     * the add bookmark form is pressed.
     * */
    cancel: function() {
        var ui = this;
        ui.hide(ui.dom.addWrapper, 0);
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    /* This method is called when the add bookmark 
     * button (+) is pressed
     * */
    add: function() {
        var ui = this;
        var addForm = ui.dom.addWrapper.find('form');

        ui.dom.title.val($('h1').text());
        ui.dom.path.val(window.location.pathname);
        ui.dom.list.removeClass('enabled');
        ui.hide(ui.dom.list, 0, 0);
        ui.show(ui.dom.addWrapper);
        addForm.bind('submit', function(e){
            var $elf = $(this);
            ui.hide(ui.dom.addWrapper, 0, 0);
            setTimeout(function(){
                $.grappelli.getMessages($elf.attr('action'), 
                                        $elf.attr('method').toLowerCase(),
                                        $elf.serialize());
            }, 200);
            return false;             
        });
        return false;
    }
});

})(jQuery);
