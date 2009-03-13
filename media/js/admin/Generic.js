var ADMIN_MEDIA_URL = '/admin/media/';
var CHAR_MAX_LENGTH = 30;

function GenericObject(i, objectIdEl) {
    this.objectIdEl = objectIdEl;
    this.contentTypeEl;
    
    this.contentTypeId; // Store the id of the content_type we want to look up
    this.objectId; // Store the id of the object (object_id) we want to look up
    
    // The lookup link
    this.lookupLink = $('<a class="related-lookup"></a>');
    this.lookupLink.click(function() {
        if (self.contentTypeEl.value) {
            self.showRelatedObjectLookupPopup(this);
        }
        return false;
    });
    this.lookupLink.attr('id', 'lookup_'+this.objectIdEl.id);
    
    // The inline text element to store the display of the actual object
    this.lookupText = $('<strong style="margin-left: 5px"></strong>');
    
    var self = this;
    this.__init__ = function() {
        // sets the associated content_type element
        vars = this.objectIdEl.id.split('-');   // should return 3 items: ["id_ingredientlist_set", "2", "content_type"]
        
        if (vars.length==1) { //not an inline edit
            id = '#id_content_type';
        } else {
            id = '#' + vars[0] + '-' + vars[1] + '-content_type';
        }
        this.contentTypeEl = $(id)[0];
        
        if (this.contentTypeEl.value) {
            this.contentTypeId = this.contentTypeEl.value;  // If the content_type has an initial value, now is a good time to set it
            this.lookupLink.attr('href', '/admin/' + MODEL_URL_ARRAY[this.contentTypeEl.value] + '/');
            
            if (this.objectIdEl.value) {
                this.objectId = this.objectIdEl.value;
                this.updateObjectIdEl();
            }
        }
        
        $(this.contentTypeEl).change(function() {
            self.contentTypeId = this.value;    // Set our objectId when the content_type is changed
            self.lookupLink.attr('href', '/admin/' + MODEL_URL_ARRAY[this.value] + '/');
        });
        
        // Add the lookup icon
        $(this.objectIdEl).after(this.lookupText).after(this.lookupLink);
        
        // Bind to the onchange of the object_id input.
        // Unfortunatley this doesn't fire when the popup window closes, so we have another method below
        $(this.objectIdEl).change(function(){
            // Now we need to politely ask the server to give us some info on this content_type, object_id combo
            self.objectId = this.value;
            self.updateObjectIdEl();
        }).focus(function(){ // Temporary fix for Safari...
            self.objectId = this.value;
            self.updateObjectIdEl();
        });
    };
    
    this.updateObjectIdEl = function() {
        // Call the server for an update, but only if everything is good to go
        if (this.objectIdEl.value && this.contentTypeId) {
            self.lookupText.text('loading...');
            $.getJSON('/admin/obj_lookup/', {object_id: this.objectIdEl.value, content_type: this.contentTypeId},
                function(data) {
                    item = data[0];
                    self.lookupText.text(''); // Clear out the `loading...` text
                    if (item.objectText) {
                        if (item.objectText.length > CHAR_MAX_LENGTH) {
                            self.lookupText.text(item.objectText.substr(0, CHAR_MAX_LENGTH) + " ...");
                        } else {
                            self.lookupText.text(item.objectText);
                        }
                    }
            });
        }
    };
    
    this.showRelatedObjectLookupPopup = function(triggeringLink) {
        // A copy of Django's showRelatedObjectLookupPopup, but we need to capture the window.onunload
        
        var name = triggeringLink.id.replace(/^lookup_/, '');
        // IE doesn't like periods in the window name, so convert temporarily.
        name = name.replace(/\./g, '___');
        var href;
        if (triggeringLink.href.search(/\?/) >= 0) {
            href = triggeringLink.href + '&pop=1';
        } else {
            href = triggeringLink.href + '?pop=1';
        }
        win = window.open(href, name, 'height=500,width=800,resizable=yes,scrollbars=yes');
        
        // TODO: This apparently doesn't work in safari...
        $(win).bind('beforeunload', function() {
            // This complicated guy is needed because when the window is 'unloaded' the value selected isn't
            // inserted in the object_id field quite yet, so we set a small delay--setTimeout is a pain...
            function timedReset(me) {
                var me = me;
                this.update = function(){
                    me.updateObjectIdEl();
                };
                this.go = function() {
                    setTimeout(this.update, 200);
                }
            };
            updater = new timedReset(self);
            updater.go();
        });
        
        win.focus();
        return false;
    }
    
    // Run initialization and return
    this.__init__();
    
    return {
        objectIdEl: this.objectIdEl,
        contentTypeEl: this.contentTypeEl,
        lookupIcon: this.lookupIcon,
        lookupText: this.lookupText,
        lookupLink: this.lookupLink,
        updateObjectIdEl: this.updateObjectIdEl,
        showRelatedObjectLookupPopup: this.showRelatedObjectLookupPopup
    }
};

// Go for it!
$(document).ready(function(){
    $("[id$='object_id']").each(GenericObject);
});

