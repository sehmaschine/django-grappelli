/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var Event = tinymce.dom.Event, each = tinymce.each, DOM = tinymce.DOM;

	/**
	 * This plugin a context menu to TinyMCE editor instances.
	 *
	 * @class tinymce.plugins.ContextMenu
	 */
	tinymce.create('tinymce.plugins.ContextMenu', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @method init
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed) {
			var t = this, lastRng;

			t.editor = ed;

			/**
			 * This event gets fired when the context menu is shown.
			 *
			 * @event onContextMenu
			 * @param {tinymce.plugins.ContextMenu} sender Plugin instance sending the event.
			 * @param {tinymce.ui.DropMenu} menu Drop down menu to fill with more items if needed.
			 */
			t.onContextMenu = new tinymce.util.Dispatcher(this);

			ed.onContextMenu.add(function(ed, e) {
				if (!e.ctrlKey) {
					// Restore the last selection since it was removed
					if (lastRng)
						ed.selection.setRng(lastRng);

					t._getMenu(ed).showMenu(e.clientX, e.clientY);
					Event.add(ed.getDoc(), 'click', function(e) {
						hide(ed, e);
					});
					Event.cancel(e);
				}
			});

			ed.onRemove.add(function() {
				if (t._menu)
					t._menu.removeAll();
			});

			function hide(ed, e) {
				lastRng = null;

				// Since the contextmenu event moves
				// the selection we need to store it away
				if (e && e.button == 2) {
					lastRng = ed.selection.getRng();
					return;
				}

				if (t._menu) {
					t._menu.removeAll();
					t._menu.destroy();
					Event.remove(ed.getDoc(), 'click', hide);
				}
			};

			ed.onMouseDown.add(hide);
			ed.onKeyDown.add(hide);
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @method getInfo
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Contextmenu',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/contextmenu',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		_getMenu : function(ed) {
			var t = this, m = t._menu, se = ed.selection, col = se.isCollapsed(), el = se.getNode() || ed.getBody(), am, p1, p2;

			if (m) {
				m.removeAll();
				m.destroy();
			}

			p1 = DOM.getPos(ed.getContentAreaContainer());
			p2 = DOM.getPos(ed.getContainer());

			m = ed.controlManager.createDropMenu('contextmenu', {
				offset_x : p1.x + ed.getParam('contextmenu_offset_x', 0),
				offset_y : p1.y + ed.getParam('contextmenu_offset_y', 0),
				constrain : 1
			});

			t._menu = m;

			m.add({title : 'advanced.cut_desc', icon : 'cut', cmd : 'Cut'}).setDisabled(col);
			m.add({title : 'advanced.copy_desc', icon : 'copy', cmd : 'Copy'}).setDisabled(col);
			m.add({title : 'advanced.paste_desc', icon : 'paste', cmd : 'Paste'});

			if ((el.nodeName == 'A' && !ed.dom.getAttrib(el, 'name')) || !col) {
				m.addSeparator();
				m.add({title : 'advanced.link_desc', icon : 'link', cmd : ed.plugins.advlink ? 'mceAdvLink' : 'mceLink', ui : true});
				m.add({title : 'advanced.unlink_desc', icon : 'unlink', cmd : 'UnLink'});
			}

			m.addSeparator();
			m.add({title : 'advanced.image_desc', icon : 'image', cmd : ed.plugins.advimage ? 'mceAdvImage' : 'mceImage', ui : true});

			m.addSeparator();
			am = m.addMenu({title : 'contextmenu.align'});
			am.add({title : 'contextmenu.left', icon : 'justifyleft', cmd : 'JustifyLeft'});
			am.add({title : 'contextmenu.center', icon : 'justifycenter', cmd : 'JustifyCenter'});
			am.add({title : 'contextmenu.right', icon : 'justifyright', cmd : 'JustifyRight'});
			am.add({title : 'contextmenu.full', icon : 'justifyfull', cmd : 'JustifyFull'});

			t.onContextMenu.dispatch(t, m, el, col);

			return m;
		}
	});

	// Register plugin
	tinymce.PluginManager.add('contextmenu', tinymce.plugins.ContextMenu);
})();