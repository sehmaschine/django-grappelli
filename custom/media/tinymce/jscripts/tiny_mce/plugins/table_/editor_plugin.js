/**
 * $Id: editor_plugin_src.js 953 2008-11-04 10:16:50Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
    var each = tinymce.each;
    
    tinymce.create('tinymce.plugins.TablePlugin', {
        init : function(ed, url) {
            var t = this;
            
            t.editor = ed;
            t.url = url;
            
            // Register buttons
            each([
                ['table', 'table.desc', 'mceInsertTable', true],
            ], function(c) {
                ed.addButton(c[0], {title : c[1], cmd : c[2], ui : c[3]});
            });
            
            // Select whole table is a table border is clicked
            if (!tinymce.isIE) {
                if (ed.getParam('table_selection', true)) {
                    ed.onClick.add(function(ed, e) {
                        e = e.target;
                        if (e.nodeName === 'TABLE')
                            ed.selection.select(e);
                    });
                }
            }
            
            ed.onNodeChange.add(function(ed, cm, n) {
                var p = ed.dom.getParent(n, 'td,th,caption');
                
                cm.setActive('table', n.nodeName === 'TABLE' || !!p);
                if (p && p.nodeName === 'CAPTION')
                    p = null;
            });
            
            // Padd empty table cells
            if (!tinymce.isIE) {
                ed.onBeforeSetContent.add(function(ed, o) {
                    if (o.initial)
                        o.content = o.content.replace(/<(td|th)([^>]+|)>\s*<\/(td|th)>/g, tinymce.isOpera ? '<$1$2>&nbsp;</$1>' : '<$1$2><br mce_bogus="1" /></$1>');
                });
            }
        },
        
        execCommand : function(cmd, ui, val) {
            var ed = this.editor, b;
            
            // Is table command
            switch (cmd) {
                case "mceInsertTable":
                    ed.execCommand('mceBeginUndoLevel');
                    this._doExecCommand(cmd, ui, val);
                    ed.execCommand('mceEndUndoLevel');
                    
                    return true;
            }
            
            // Pass to next handler in chain
            return false;
        },
        
        // Info
        getInfo : function() {
            return {
                longname : 'Tables',
                author : 'vonautomatisch',
                authorurl : 'http://vonautomatisch.at',
                infourl : 'http://code.google.com/p/django-grappelli/',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        },
        
        // Private plugin internal methods
        
        /**
         * Executes the table commands.
         */
        _doExecCommand : function(command, user_interface, value) {
            var inst = this.editor, ed = inst, url = this.url;
            var focusElm = inst.selection.getNode();
            var trElm = inst.dom.getParent(focusElm, "tr");
            var tdElm = inst.dom.getParent(focusElm, "td,th");
            var tableElm = inst.dom.getParent(focusElm, "table");
            var doc = inst.contentWindow.document;
            var tableBorder = tableElm ? tableElm.getAttribute("border") : "";
            
            // Get first TD if no TD found
            if (trElm && tdElm == null)
                tdElm = trElm.cells[0];
            
            // ---- Commands -----
            
            // Handle commands
            switch (command) {
                case "mceInsertTable":
                    if (user_interface) {
                        inst.windowManager.open({
                            url : url + '/table.htm',
                            width : 700 + parseInt(inst.getLang('table.table_delta_width', 0)),
                            height : 500 + parseInt(inst.getLang('table.table_delta_height', 0)),
                            inline : 1
                        }, {
                            plugin_url : url,
                            action : value ? value.action : 0
                        });
                    }
                    return true;
            }
            
            // Pass to next handler in chain
            return false;
        }
    });
    
    // Register plugin
    tinymce.PluginManager.add('table', tinymce.plugins.TablePlugin);
})();
