(function($) {
    "use script";
    $(document).ready(function() {
        $("input").attr("autocomplete", "off");
        $('#select_all').click(function(){
            $("._fields").attr('checked', $(this).attr('checked'));
        });
    });
})(grp.jQuery);
