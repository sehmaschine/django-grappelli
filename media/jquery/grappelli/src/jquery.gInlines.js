/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gInlineGroup, gInlineStacked, gInlineTabular
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.grappelli.gInlineTabularBase = {
    
    
};
    
$.grappelli.gInlineStackedBase = {
    
    
};
         
$.widget('ui.gInlineGroup', {

    options: {
        autoSelector: '.group',
        updatedTags: ['input:id,name', 'select:id,name', 'textarea:id,name', 'label:for'],
    },

    _updateIdentifiers: function(row, index) {
        var ui, attr, attrs, tag, tags, curr, t, x;
        ui   = this;
        attr = {};
        tags = $.map(ui.options.updatedTags, function(tag){
                       t = tag.match(/^(\w+):(.*)$/);
                       attr[t[1]] = t[2] && t[2].split(',') || false;
                       return t[1]; }).join(',');

        row.find(tags).each(function(i, t){
            tag   = t.nodeName.toLowerCase();
            attrs = attr[tag];
            for (x in attrs) {
                curr = attrs[x];
                $(this).attr(curr, $(this).attr(curr).replace(/\-\d+\-/, '-'+ index +'-'));
            }
        });
    },

    _newRow: function() {
        var ui, index, old, row, title;
        ui = this;
        index = ui._totalForms + 1;
        old   = ui._templateRow;
        row   = old.clone(false);
        // Update title for stacked inlines
        if (ui._isStacked) {
            title = row.find('h3:first');
            title.text(title.text().replace(/#\d+/, '#'+ index));
        }
        $.grappelli.widgets.trigger('nodeCloned', {node: row});
        ui._updateIdentifiers(row, ui._totalForms);
        row.insertAfter(ui.getRow(ui._totalForms));
        ui._totalForms = index;
        $.grappelli.widgets.trigger('nodeInserted', {node: row});
//      $.grappelli.widgets.each(function(widgetName, elements) {
//          if (elements.length > 0) {
//              //elements[widgetName]();
//          }
//      }, row);
        //$.grappelli.widgets.call(row, 'destroy', ['gDateField'])
//        $.grappelli.widgets.init(row, ['gDateField', 'gRelated', 'gAutocomplete'])
        return row;
    },

    addFormRow: function() {
        var ui = this;
        var newRow = ui._newRow();
        // initialize within the row scope the plugins 
        // that can't rely on jQuery.fn.live
        //$.grappelli.widgets.init(['gRelated'], newRow);
    },
    
    getRow: function(index) {
        var ui = this;
        return ui.element.find('.items > .module').eq(index - 1);
    },

    _create: function(){
        var ui = this;

        ui._isTabular    = ui.element.hasClass('tabular');
        ui._isStacked    = !ui._isTabular;
        ui._totalForms   = parseInt(ui.element.find('input[name$=-TOTAL_FORMS]').val(), 10);
        ui._createialForms = parseInt(ui.element.find('input[name$=-INITIAL_FORMS]').val(), 10);

        ui = $.extend(ui, $.grappelli[ui._isTabular && 'gInlineTabularBase' || 'gInlineStackedBase']);

        ui.dom = {
            addHandler: ui.element.find('.ui-add-handler'),
        };

        ui.dom.addHandler.bind('click', function(e){
            ui.addFormRow();
        });

        ui._templateRow = ui.getRow(ui._totalForms).clone(false);

        /*
        $.grappelli.widgets.init([], row);
        // Prevent fields of inserted rows from triggering errors if un-edited
        ui.element.parents('form').bind('submit.gInlineGroup', function(){
            ui.element.find('.inline-related:not(.has_original):not(.has_modifications) div.order :text').val('');
        });
        
        /// ADD HANDLER
        ui.element.find('a.ui-add-handler').bind('click.gInlineGroup', function(e){
            var container = $(this).parents('div.inline-group');
            var lastitem  = container.find('div.inline-related:last');
            var newitem   = lastitem.clone(true).appendTo(container.find('div.items:first'));
            var count     = parseInt(container.find('div.inline-related').length, 10);
            var header    = newitem.find('h3:first');
            e.preventDefault();
            // update new item's header (inline-stacked only)
            if (header.get(0) && container.hasClass('inline-stacked')) {
                header.html("<b>" + $.trim(header.text()).replace(/(\d+)$/, count) + "</b>");
            }
            else {
                header.remove(); // fix layout bug in inline-tabular
            }
            
            /// set TOTAL_FORMS to number of items
            container.find('input[id*="TOTAL_FORMS"]').val(count);
            
            ui._createializeItem(newitem, count);
            return false;
        });
        
        /// DELETEHANDLER
        ui.element.find('a.deletelink').bind("click.gInlineGroup", function() {
            var cp = $(this).prev(':checkbox');
            cp.attr('checked', !cp.attr('checked'));
            $(this).parents('div.inline-related').toggleClass('predelete');
            return false;
        });
        
        // Autodiscover if sortable
        if (ui.element.find('.order').get(0)) {
            ui._makeSortable();
        }
        
        ui.element.find('.ui-add-handler').bind('click.gInlineGroup', function(){
            ui._refreshOrder();
        });
        
        ui._refreshOrder();
        */
    },
    /*
    _createializeitem: function(el, count){
        
        /// replace ids, names, hrefs & fors ...
        el.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
            var $el = $(this);
            $.each(['id', 'name', 'for', 'href'], function(i, k){
                if ($el.attr(k)) {
                    $el.attr(k, $el.attr(k).replace(/-\d+-/g, '-'+  (count - 1) +'-'));
                }
            });
        });
        
        // destroy and re-initialize datepicker (for some reason .datepicker('destroy') doesn't seem to work..)
        el.find('.vdatefield').unbind().removeclass('hasdatepicker').val('')
            .next().remove().end().end()
            .find('.vtimefield').unbind().val('').next().remove();
        
        // date-/timefield
        el.find('.vdatefield').gdatefield();
        el.find('.vtimefield').gtimefield();
        
        /// remove error-lists and error-classes
        el.find('ul.errorlist').remove().end()
            .find('.errors, .error').removeclass("errors error");
        
        /// tinymce
        el.find('span.mceeditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            el.find('#' + id).css('display', '');
            tinymce.execcommand("mceaddcontrol", true, id);
        });
        
        el.find(':input').val('').end() // clear all form-fields (within form-cells)
            .find("strong").text('');     // clear related/generic lookups
        
        // little trick to prevent validation on un-edited fields
        el.find('input, textarea').bind('keypress.ginlinegroup', function(){
              el.addclass('has_modifications');
          }).end()
          .find('select, :radio, :checkbox').bind('keypress.ginlinegroup', function(){
              el.addclass('has_modifications');
          });
          
        return el;
    },
    */
    /*
    _makeSortable: function() {
        var ui   = this;
        var grip = $('<span class="ui-icon ui-icon-grip-dotted-vertical" />');
        //ui.element.find('.order').hide();
        if (ui.element.hasClass('inline-stacked')) {
            grip.prependTo(ui.element.find('.items .inline-related h3:first-child'));
        }
        else if (ui.element.hasClass('inline-tabular')) {
            grip.prependTo(ui.element.find('.items div.inline-item-tools'));
        }
        ui.element.find('.items')
            .sortable({
            axis: 'y',
            cursor: 'move',
            forcePlaceholderSize: true,
            helper: 'clone',
            opacity: 0.7,
            items: '.inline-related',
            appendTo: ui.element.find('.items'),
            update: function(e, inst){
                ui._refreshOrder();
            }
        });
    },
    
    _refreshOrder: function() {
        var index = 1;
        var ui = this;
        ui.element.find('.order input[type=text]').each(function(){
            $(this).val(index);
            index++;
            
            if (!$(this).parents('.inline-related').hasClass('has_original')) {
                var tools = $(this).parents('.module').find('ul.inline-item-tools');
                if (tools.get(0)) {
                    if (!tools.find('.deletelink').get(0)) {
                        $('<li><a title="Delete Item" class="deletelink" href="#"/></li>').appendTo(tools)
                            .find('a').bind('click.grappelli', function(){
                                $(this).parents('.inline-related').remove();
                                return false;
                            });
                    }
                }
            }
        });
    }
    */
});

// INLINE STACKED 

$.widget('ui.gInlineStacked', {

    options: {
        autoSelector: '.inline-stacked',
        collapsible: true
    },

    _create: function(){
        var ui = this;
        // FIELDSETS WITHIN STACKED INLINES
        /* OBSOLETE ?
        ui.element.find('.inline-related').find('fieldset[class*="collapse-closed"]')
            .addClass("collapsed").find('h4:first').addClass("collapse-toggle").end()
            .find('fieldset[class*="collapse-open"] h4:first').addClass("collapse-toggle")
            .bind("click", function(e){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
        });
        */
    }
});

// INLINE TABULAR

$.widget('ui.gInlineTabular', {

    options: {
        autoSelector: '.inline-tabular'
    },
    _create: function(){
    /*
        var ui = this;
        
        ui.element.find('.inline-related h3:first').remove(); // fix layout bug
        
        /// add predelete class (only necessary in case of errors)
        ui.element.find('input[name*="DELETE"]:checked').each(function(i) {
            $(this).parents('div.inline-related').addClass('predelete');
        });
        
        /// OPEN TABULARINLINE WITH ERRORS (onload)
        ui.element.filter('.inline-tabular').find('div[class*="error"]:first').each(function(i) {
            $(this).parents('div.inline-tabular').removeClass("collapsed");
        });
        */
    }
});

})(jQuery);
