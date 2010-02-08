/**
 * @author tan@enonic.com
 *
 * This plugin fixes various issues that occures when editing content in the editor.
 *
 */
(function() {
  tinymce.create('tinymce.plugins.EditorEnhancements', {
    init : function(ed, url) {
			var t = this;

      // ---------------------------------------------------------------------------------------------------------------
      // Events.
      // ---------------------------------------------------------------------------------------------------------------
      // Register events to the current editor instance.

      // This will give the user a chance to place the caret after the current block.
      ed.onSetContent.add(function(ed, o) {
        t._insertTrailingElement(ed);
      });
      ed.onNodeChange.add(function(ed, cm, e) {
        t._insertTrailingElement(ed);
      });

      // IE inserts a new PRE tag each time the user hits enter. This will make the behaviour more Gecko like by
      // preventing the behaviour and insert a temporary BR.
      if (tinymce.isIE) {
        ed.onKeyDown.add(function(ed, e) {
          var n, s = ed.selection;
          if (e.keyCode == 13 && s.getNode().nodeName == 'PRE') {
            // IE will not display the new line if there is no content. The nbsp will be removed on
            // onBeforeSetContent events.
            s.setContent('<br id="__" />&nbsp;', {format : 'raw'});
            n = ed.dom.get('__');
            n.removeAttribute('id');
            s.select(n);
            s.collapse();
            return tinymce.dom.Event.cancel(e);
          }
        });
      }

      // This makes sure that all BRs inside PRE is replaced with newlines when events like
      // save view HTML source etc. occurres.
      // Also cleans up trailing empty P
      // TODO: Remvoe trailing P elements.
      ed.onBeforeGetContent.add(function(ed, o) {
        t._cleanPreTag(ed);
        t._removeTrailingElement(ed);
      });
    },

    getInfo : function() {
			return {
				longname : 'Editor Enhancements',
				author : 'tan@enonic.com',
				authorurl : 'http://www.enonic.com',
				infourl : 'http://www.enonic.com',
				version : "1.0"
			};
		},

    // -----------------------------------------------------------------------------------------------------------------
    // Internals.
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Method: _insertTrailingElement
     *
     * This should Make sure that it is always posible to place the caret after
     * the block where the caret is.
    */
    _insertTrailingElement : function(ed) {
      var lc = ed.getDoc().getElementsByTagName('body')[0].lastChild;

      if (!lc)
        return;

      try {
        if (!lc.innerHTML.match(/^<br>$/i)) {
          var p, br;
          p = ed.getDoc().createElement('p');
          br = ed.getDoc().createElement('br');
          p.appendChild(br);
          ed.dom.insertAfter(p, lc);
        }
      } catch(err) {/**/}
    },

    /**
     * Method: _cleanPreTag
     *
     * Replaces all BR tags with newlines inside the PRE elements.
    */
    _cleanPreTag : function(ed) {
      var br = ed.dom.select('pre br');
      for (var i = 0; i < br.length; i++) {
        var nlChar;
        if (tinymce.isIE)
          nlChar = '\r\n';
        else
          nlChar = '\n';

        var nl = ed.getDoc().createTextNode(nlChar);
        ed.dom.insertAfter(nl, br[i]);
        ed.dom.remove(br[i]);
      }
      // Since our handling of the pre tag inserts &nbsp;:Text we need to remove them.
      if (tinymce.isIE) {
        // TODO: This could be done with regex, but I have not found a way to find the nbsp;
        var tempContent = ed.getDoc().getElementsByTagName('body')[0].innerHTML.split('&nbsp;');
        ed.getDoc().getElementsByTagName('body')[0].innerHTML = tempContent.join('');
      }
    },

    /**
     * Method: _removeTrailingElement
     *
     * Removes trailing P elements.
     */
    _removeTrailingElement : function(ed) {
      var root = ed.getDoc().getElementsByTagName('body')[0];
      if (!root)
        return;

      var children = root.childNodes;
      if (children.length <= 1)
        return;

      var current = root.firstChild, i = 0, last;
      while(current) {
        if (current.nodeName == 'P') {
          last = i;
        }
        current = current.nextSibling;
        i++;
      }

      if (children[last].innerHTML.match(/^<br>$/i)) {
        root.removeChild(children[last]);
      }
    }
	});

	tinymce.PluginManager.add('editorenhancements', tinymce.plugins.EditorEnhancements);
})();
