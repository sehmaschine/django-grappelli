(function($, opener){
    "use strict";
    var data = $('#grapelli-popup-response-constants').data();
    opener.dismissAddAnotherPopup(window, data.pkValue, data.obj);
})(grp.jQuery, opener);
