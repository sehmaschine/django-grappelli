$.popup = function(name, href, options) {
    var arr = [];
    var opt = $.extend({width:  600, height: 920, resizable: true, scrollbars: true}, options);
    $.each(opt, function(k, v){ arr.push(k +'='+ v); });
    var win  = window.open(href, name, arr.join(','));
    win.name = name;
    win.focus();
    return win;
};

$.widget('ui.gRelated', {
    _url: function(k) {
        return this.options.get_url(k);
    },
    _browse: function(link) {
        var link = $(link);
        var name = link.data('id').replace(/\./g, '___'); // IE doesn't like periods in the window name, so convert temporarily.
        var href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        this._win = $.popup(name, href, {
                    height: 600 , width: 920, resizable: true, scrollbars: true});
        return false;
    },
    _init: function(){
        var ui = this;

        ui.dom = {
            object_id:    ui.element,
            content_type: $('#'+ ui.element.attr('id').replace('object_id', 'content_type')),
        };

        ui.dom.content_type.bind('change.gRelated', function() {
            var $el = $(this);
            var href = ui._url($el.val());
            if ($el.val()) {
                var link = ui.dom.object_id.next('.related-lookup');
                if (link.get(0)) {
                    link.attr('href', href);
                }
                else {
                    $('<a class="related-lookup">&nbsp;&nbsp;</a>')
                        .insertAfter(ui.dom.object_id)
                        .after('<strong>&nbsp;</strong>')
                        .bind('click.gRelated', function(e){
                            e.preventDefault();
                            return ui._browse(this);
                        })
                        .data('id', ui.dom.object_id.attr('id'))
                        .attr({
                            id: 'lookup_'+ ui.dom.object_id.attr('id'),
                            href: href,
                        });
                }
            } 
            else {
                ui.dom.object_id.val('');
                ui.dom.object_id.parent().find('.related-lookup, strong').remove();
            }
        });

        
//      $('input.vForeignKeyRawIdAdminField')
//          .bind('change.gRelated', function(e) { ui._relatedLookup(e, this); })
//          .bind('focus.gRelated',  function(e) { ui._relatedLookup(e, this); });

//      $('input.vManyToManyRawIdAdminField')
//          .bind('change.gRelated', function(e) { ui._relatedLookup(e, this); })
//          .bind('focus.gRelated',  function(e) { ui._m2mLookup(e, this); });
        //InitObjectID($('input[name*="object_id"]'));
        //InitContentType($(':input[name*="content_type"]'));
        //GenericLookup($('input[name*="object_id"]'));
    },
    _relatedLookup: function(obj){
        var link = obj.next();
        var text = obj.next().next();
        var app_label = link.attr('href').split('/')[2];
        var model_name= link.attr('href').split('/')[3];
        
        text.text('loading ...');
        
        // get object
        $.get(ui.options.url, {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
            var item = data;
            text.text('');
            if (item) {
                if (item.length > CHAR_MAX_LENGTH) {
                    text.text(decodeURI(item.substr(0, CHAR_MAX_LENGTH) + " ..."));
                } else {
                    text.text(decodeURI(item));
                }
            }
        });
    },
    _m2mLookup: function(obj){},
});

$.ui.gRelated.defaults = {
    url: '/grappelli/related_lookup/',
    get_url: function(k) {
        return MODEL_URL_ARRAY[k] && ADMIN_URL + MODEL_URL_ARRAY[k]  +'/?t=id' || '';
    }
};


function dismissRelatedLookupPopup(win, id) {
    var el = $('#'+ win.name.replace(/___/g, '.'));
    el.val((el.hasClass('vManyToManyRawIdAdminField') && el.val())? el.val() += ',' + id: id).focus();
    win.close();
}
