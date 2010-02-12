(function() {
    var a = tinymce.DOM;
    tinymce.create("tinymce.plugins.Grappelli", {
        init: function(c, d) {
            var e = this,
            h = c.getParam("grappelli_adv_toolbar", "toolbar2"),
            g = 0,
            f,
            b;
            f = '<img src="' + d + '/img/trans.gif" class="mceWPmore mceItemNoResize" title="' + c.getLang("wordpress.wp_more_alt") + '" />';
            b = '<img src="' + d + '/img/trans.gif" class="mceWPnextpage mceItemNoResize" title="' + c.getLang("wordpress.wp_page_alt") + '" />';
            if (getUserSetting("hidetb", "0") == "1") {
                c.settings.wordpress_adv_hidden = 0
            }
            c.onPostRender.add(function() {
                if (c.getParam("wordpress_adv_hidden", 1)) {
                    a.hide(c.controlManager.get(h).id);
                    e._resizeIframe(c, h, 28)
                }
            });
            c.addCommand("Grappelli_Adv",
            function() {
                var j = c.controlManager.get(h).id,
                i = c.controlManager;
                if (a.isHidden(j)) {
                    i.setActive("wp_adv", 1);
                    a.show(j);
                    e._resizeIframe(c, h, -28);
                    c.settings.wordpress_adv_hidden = 0;
                    setUserSetting("hidetb", "1")
                } else {
                    i.setActive("wp_adv", 0);
                    a.hide(j);
                    e._resizeIframe(c, h, 28);
                    c.settings.wordpress_adv_hidden = 1;
                    setUserSetting("hidetb", "0")
                }
            });
            c.addButton("grappelli_adv", {
                title: "grappelli.grappelli_adv_desc",
                image: d + "/img/toolbars.gif",
                cmd: "Grappelli_Adv"
            });
            c.addShortcut("alt+shift+z", c.getLang("grappelli_adv_desc"), "Grappelli_Adv");
            
            e.onNodeChange.add(function(ed, cm, e) {
              alert(cm);
            });
            
        },
        getInfo: function() {
            return {
                longname: "Grappelli Plugin",
                author: "vonautomatisch",
                authorurl: "http://vonautomatisch.at",
                infourl: "http://vonautomatisch.at",
                version: "1.0"
            }
        }
    });
    tinymce.PluginManager.add("grappelli", tinymce.plugins.Grappelli)
})();