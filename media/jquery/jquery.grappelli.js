(function($){

    // INIT
    $(function(){
        // always focus first field of the form
        $('form .form-row:eq(0)').find('input, select, textarea, button').eq(0).focus();
        $('#searchbar').focus();
    });

})(jQuery);



