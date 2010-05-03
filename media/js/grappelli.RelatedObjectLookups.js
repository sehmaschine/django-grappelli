
var CHAR_MAX_LENGTH = 30;

function dismissRelatedLookupPopup(win, chosenId) {
    var name = windowname_to_id(win.name);
    var elem = document.getElementById(name);
    if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
        elem.value += ',' + chosenId;
    } else {
        document.getElementById(name).value = chosenId;
    }
    //grappelli custom
    document.getElementById(name).focus();
    // end
    win.close();
}

(function($) {
    function RelatedLookup(obj) {
        // check if val isn't empty string or the same value as before
        if (obj.val() == "" || obj.val() == obj.data('old_val')) return;
        obj.data('old_val', obj.val());
        
        var link = obj.next();
        var text = obj.next().next();
        var app_label = link.attr('href').split('/')[2];
        var model_name= link.attr('href').split('/')[3];
        
        text.text('loading ...');
        
        // get object
        $.get('/grappelli/lookup/related/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
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
    }

    function M2MLookup(obj) {
        // check if val isn't empty string or the same value as before
        if (obj.val() == "" || obj.val() == obj.data('old_val')) return;
        obj.data('old_val', obj.val());
        
        var link = obj.next();
        var text = obj.next().next();
        var app_label = link.attr('href').split('/')[2];
        var model_name= link.attr('href').split('/')[3];

        text.text('loading ...');

        // get object
        $.get('/grappelli/lookup/m2m/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
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
    }

    function GenericLookup(obj) {
        // check if val isn't empty string or the same value as before
        if (obj.val() == "" || obj.val() == obj.data('old_val')) return;
        obj.data('old_val', obj.val());
        
        var link = obj.next();
        var text = obj.next().next();
        var app_label = link.attr('href').split('/')[2];
        var model_name= link.attr('href').split('/')[3];

        text.text('loading ...');

        // get object
        $.get('/grappelli/lookup/related/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
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
    }

    function RelatedHandler(obj) {
        // related lookup handler
        obj.bind("change", function() {
            RelatedLookup($(this));
        });
        obj.bind("focus", function() {
            RelatedLookup($(this));
        });
        
        obj.bind("keyup", function() {
            RelatedLookup($(this));
        });
        obj.bind("blur", function() {
            RelatedLookup($(this));
        });
    }

    function M2MHandler(obj) {
        // related lookup handler
        obj.bind("change", function() {
            M2MLookup($(this));
        });
        obj.bind("focus", function() {
            M2MLookup($(this));
        });
        obj.bind("keyup", function() {
            M2MLookup($(this));
        });
        obj.bind("blur", function() {
            M2MLookup($(this));
        });
    }

    function InitObjectID(obj) {
        obj.each(function() {
            var ct = $(this).closest('div[class*="object_id"]').prev().find(':input[name*="content_type"]').val();
            if (ct) {
                var lookupLink = $('<a class="related-lookup">&nbsp;&nbsp;</a>');
                lookupLink.attr('id', 'lookup_'+this.id);
                lookupLink.attr('href', ADMIN_URL + MODEL_URL_ARRAY[ct] + '/?t=id');
                lookupLink.attr('onClick', 'return showRelatedObjectLookupPopup(this);');
                var lookupText = '<strong>&nbsp;</strong>';
                $(this).after(lookupText).after(lookupLink);
                if ($(this).val() != "") {
                    var lookupText = GenericLookup($(this));
                }
            }
        });
    }

    function InitContentType(obj) {
        obj.bind("change", function() {
            if ($(this).val()) {
                var href = ADMIN_URL + MODEL_URL_ARRAY[$(this).val()] + "/?t=id";
                var lookupLink = $(this).closest('div[class*="content_type"]').next().find('a.related-lookup');
                var obj_id = $(this).closest('div[class*="content_type"]').next().find('input[name*="object_id"]');
                if (lookupLink.attr('href')) {
                    lookupLink.attr('href', href);
                } else {
                    var lookupLink = $('<a class="related-lookup">&nbsp;&nbsp;</a>');
                    lookupLink.attr('id', 'lookup_'+obj_id.attr('id'));
                    lookupLink.attr('href', ADMIN_URL + MODEL_URL_ARRAY[$(this).val()] + '/?t=id');
                    lookupLink.attr('onClick', 'return showRelatedObjectLookupPopup(this);');
                    var lookupText = '<strong>&nbsp;</strong>';
                    $(this).closest('div[class*="content_type"]').next().find('input[name*="object_id"]').after(lookupText).after(lookupLink);
                }
            } else {
                $(this).closest('div[class*="content_type"]').next().find('input[name*="object_id"]').val('');
                $(this).closest('div[class*="content_type"]').next().find('a.related-lookup').remove();
                $(this).closest('div[class*="content_type"]').next().find('strong').remove();
            }
        });
    }

    function GenericHandler(obj) {
        // related lookup handler
        obj.bind("change", function() {
            GenericLookup($(this));
        });
        obj.bind("focus", function() {
            GenericLookup($(this));
        });
        obj.bind("keyup", function() {
            GenericLookup($(this));
        });
    }
    $(document).ready(function() {
        // change related-lookups in order to get the right URL.
        $('a.related-lookup').each(function() {
           href = $(this).attr('href').replace('../../../', ADMIN_URL);
           $(this).attr('href', href);
        });

        // related lookup setup
        $("input.vForeignKeyRawIdAdminField").each(function() {
            // insert empty text-elements after all empty foreignkeys
            if ($(this).val() == "") {
                $(this).next().after('&nbsp;<strong></strong>');
            }
        });

        // m2m lookup setup
        $("input.vManyToManyRawIdAdminField").each(function() {
            // insert empty text-elements after all m2m fields
            $(this).next().after('&nbsp;<strong>&nbsp;</strong>');
            M2MLookup($(this));
        });

        RelatedHandler($("input.vForeignKeyRawIdAdminField"));
        M2MHandler($("input.vManyToManyRawIdAdminField"));

        InitObjectID($('input[name*="object_id"]'));
        InitContentType($(':input[name*="content_type"]'));
        GenericHandler($('input[name*="object_id"]'));
    });
})(jQuery.noConflict());
