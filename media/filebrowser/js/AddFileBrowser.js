var FileBrowser = {
    // this is set automatically
    admin_media_prefix: '',
    // change this
    thumb_prefix: 'thumb_',
    no_thumb: 'filebrowser/img/no_thumb.gif',
    
    init: function() {
        // Deduce admin_media_prefix by looking at the <script>s in the
        // current document and finding the URL of *this* module.
        var scripts = document.getElementsByTagName('script');
        for (var i=0; i<scripts.length; i++) {
            if (scripts[i].src.match(/AddFileBrowser/)) {
                var idx = scripts[i].src.indexOf('filebrowser/js/AddFileBrowser');
                FileBrowser.admin_media_prefix = scripts[i].src.substring(0, idx);
                break;
            }
        }
    },
    // show FileBrowser
    show: function(id, path) {
        var href = path + "?pop=1";
        var id2=String(id).split(".").join("___");
        FBWindow = window.open(href, String(id2), 'height=600,width=840,resizable=yes,scrollbars=yes');
        FBWindow.focus();
    }
}

addEvent(window, 'load', FileBrowser.init);

