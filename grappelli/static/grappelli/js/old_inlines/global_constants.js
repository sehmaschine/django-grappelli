(function(window, $){
    "use strict"
    var data = $('#grapelli-global-constants').data();
    window.__admin_media_prefix__ = data.adminMediaPrefix;
    window.__admin_utc_offset = data.adminUtcOffset;
    window.grappelli = {}
    window.ADMIN_URL = data.adminUrl;
    window.MODEL_URL_ARRAY = data.modelUrlArray;
    window.DATE_FORMAT = data.dateFormat;
    window.TIME_FORMAT = data.timeFormat;
    window.DATETIME_FORMAT = data.dateTimeFormat;
})(window, grp.jQuery);
