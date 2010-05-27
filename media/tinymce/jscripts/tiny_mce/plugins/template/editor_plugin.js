/**
 * $Id: editor_plugin_src.js 201 2007-02-12 15:56:56Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */


(function() {
    var each = tinymce.each;
    
    tinymce.create('tinymce.plugins.TemplatePlugin', {
        init : function(ed, url) {
            var t = this;
            t.editor = ed;
            
            // commands
            ed.addCommand('mceTemplate', function(ui) {
                ed.windowManager.open({
                    file : url + '/template.htm',
                    width : ed.getParam('template_popup_width', 750),
                    height : ed.getParam('template_popup_height', 600),
                    inline : 1
                }, {
                    plugin_url : url
                });
            });
            ed.addCommand('mceInsertTemplate', t._insertTemplate, t);
            
            // buttons
            ed.addButton('template', {title : 'template.desc', cmd : 'mceTemplate'});
            
            // insert template is only allowed within a paragraph
            ed.onNodeChange.add(function(ed, cm, n, co) {
                cm.setDisabled('template', n.nodeName != 'P' || n.firstChild.nodeValue != null || n.parentNode.nodeName != "BODY");
            });
            
            // table to div / div to table
            ed.onPreProcess.add(function(ed, o) {
                var dom = ed.dom;
                
                if (o.set) {
                    
                    each(ed.dom.select('div', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-td')) {
                            class_el = ed.dom.getAttrib(e, 'class');
                            td_el = ed.dom.create('td', {'class': class_el});
                            ed.dom.replace(td_el, e, true);
                        }
                    });
                    
                    each(ed.dom.select('div', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-table')) {
                            class_el = ed.dom.getAttrib(e, 'class');
                            table_el = ed.dom.create('table', {'class': class_el, 'cellpadding': '0', 'cellspacing': '10'});
                            ed.dom.setHTML(table_el, e.innerHTML);
                            p_el = ed.dom.create('p', {'class': 'mce-grid-container'});
                            p_el.appendChild(table_el);
                            ed.dom.replace(p_el, e, false);
                        }
                    });
                    
                }
                
                if (o.save) {
                    
                    each(ed.dom.select('td', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-td')) {
                            class_el = ed.dom.getAttrib(e, 'class');
                            div_el = ed.dom.create('div', {'class': class_el});
                            ed.dom.replace(div_el, e, true);
                        }
                    });
                    
                    each(ed.dom.select('table', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-table')) {
                            class_el = ed.dom.getAttrib(e, 'class');
                            div_el = ed.dom.create('div', {'class': class_el});
                            ed.dom.replace(div_el, e, true);
                        }
                    });
                    
                    each(ed.dom.select('tr', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-tr')) {
                            ed.dom.remove(e, true);
                        }
                    });
                    
                    each(ed.dom.select('tbody', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-tbody')) {
                            ed.dom.remove(e, true);
                        }
                    });
                    
                    each(ed.dom.select('p', o.node), function(e) {
                        if (ed.dom.hasClass(e, 'mce-grid-container')) {
                            ed.dom.remove(e, true);
                        }
                    });
                    
                }
                
            });
            
        },
        
        getInfo : function() {
            return {
                longname : 'Grid plugin',
                author : 'Patrick Kranzlmueller',
                authorurl : 'http://vonautomatisch.at',
                infourl : 'http:/vonautomatisch.at',
                version : '0.1'
            };
        },
        
        _insertTemplate : function(ui, v) {
            var t = this, ed = t.editor, h, el, dom = ed.dom, sel = ed.selection.getContent();
            
            // using dom.replace in order to avoid empty paragraph
            // after the insert (e.g. with using setContent)
            p_el = ed.dom.create('p', {'class': 'mce-grid-container'}, v.content);
            ed.dom.replace(p_el, this.editor.selection.getNode(), true);
            // cleanup
            this.editor.execCommand('mceCleanup');
            // move caret to first paragraph inside the template
            n = ed.dom.select('p', p_el)[0];
            tinyMCE.execCommand("mceSelectNode", false, n.firstChild);
            
            ed.addVisual();
        },
        
    });
    
    // Register plugin
    tinymce.PluginManager.add('template', tinymce.plugins.TemplatePlugin);
})();