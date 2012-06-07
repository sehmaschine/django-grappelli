/**
 * GRAPPELLI UTILS
 * functions needed for Grappelli
 */
 
var django = {
    "jQuery": jQuery.noConflict(true)
};

(function($) {
	// set jQuery UI datepicker defaults
	$.datepicker.regional['us'] = {
        closeText : gettext('Done'),
        prevText : gettext('Prev'),
        nextText : gettext('Next'),
        currentText : gettext('Today'),
        monthNames : [gettext('January'), gettext('February'), gettext('March'), gettext('April'), gettext('May'), gettext('June'), gettext('July'), gettext('August'), gettext('September'), gettext('October'), gettext('November'), gettext('December')],
        monthNamesShort : [gettext('Jan'), gettext('Feb'), gettext('Mar'), gettext('Apr'), gettext('May'), gettext('Jun'), gettext('Jul'), gettext('Aug'), gettext('Sep'), gettext('Oct'), gettext('Nov'), gettext('Dec')],
        dayNames : [gettext('Sunday'), gettext('Monday'), gettext('Tuesday'), gettext('Wednesday'), gettext('Thursday'), gettext('Friday'), gettext('Saturday')],
        dayNamesShort : [gettext('Sun'), gettext('Mon'), gettext('Tue'), gettext('Wed'), gettext('Thu'), gettext('Fri'), gettext('Sat')],
        dayNamesMin : [gettext('Su'), gettext('Mo'), gettext('Tu'), gettext('We'), gettext('Th'), gettext('Fr'), gettext('Sa')],
        weekHeader : gettext('Wk'),
        dateFormat : gettext('yy-mm-dd'),
        firstDay : gettext('7'),
        isRTL : false,
        showMonthAfterYear : false,
        yearSuffix : ''
    };
    $.datepicker.setDefaults($.datepicker.regional['us']);
    
    // dateformat
    grappelli.getFormat = function(type) {
        if (type == "date") {
            var format = DATE_FORMAT.toLowerCase().replace(/%\w/g, function(str) {
                str = str.replace(/%/, '');
                return str + str;
            });
            return format;
        }
    };
    
    // datepicker, timepicker init
    grappelli.initDateAndTimePicker = function() {
        
        // HACK: get rid of text after DateField (hardcoded in django.admin)
        $('p.datetime').each(function() {
            var text = $(this).html();
            text = text.replace(/^\w*: /, "");
            text = text.replace(/<br>.*: /, "<br>");
            $(this).html(text);
        });
        
        var options = {
            //appendText: '(mm/dd/yyyy)',
            showOn: 'button',
            buttonImageOnly: false,
            buttonText: '',
            dateFormat: grappelli.getFormat('date'),
            showButtonPanel: true,
            showAnim: '',
            // HACK: sets the current instance to a global var.
            // needed to actually select today if the today-button is clicked.
            // see onClick handler for ".ui-datepicker-current"
            beforeShow: function(year, month, inst) {
                grappelli.datepicker_instance = this;
            }
        };
        var dateFields = $("input[class*='vDateField']:not([id*='__prefix__'])");
        dateFields.datepicker(options);
        
        if (typeof IS_POPUP != "undefined" && IS_POPUP) {
            dateFields.datepicker('disable');
        }
        
        // HACK: adds an event listener to the today button of datepicker
        // if clicked today gets selected and datepicker hides.
        // use live() because couldn't find hook after datepicker generates it's complete dom.
        $(".ui-datepicker-current").live('click', function() {
            $.datepicker._selectDate(grappelli.datepicker_instance);
            grappelli.datepicker_instance = null;
        });
        
        // init timepicker
        $("input[class*='vTimeField']:not([id*='__prefix__'])").grp_timepicker();
    };
    
    // changelist: filter
    grappelli.initFilter = function() {
        $("a.toggle-filters").click(function() {
            $(".filter-pulldown").toggle();
            $("#filters").toggleClass("open");
        });
        $(".filter_choice").change(function(){
            location.href = $(this).val();
        });
    };
    
    // changelist: searchbar
    grappelli.initSearchbar = function() {
        var searchbar = $("input#searchbar");
        searchbar.focus();
    };
    
    grappelli.updateSelectFilter = function(form) {
        if (typeof SelectFilter != "undefined"){
            form.find(".selectfilter").each(function(index, value){
                var namearr = value.name.split('-');
                SelectFilter.init(value.id, namearr[namearr.length-1], false, "{% admin_media_prefix %}");
            });
            form.find(".selectfilterstacked").each(function(index, value){
                var namearr = value.name.split('-');
                SelectFilter.init(value.id, namearr[namearr.length-1], true, "{% admin_media_prefix %}");
            });
        }
    };
    
    grappelli.reinitDateTimeFields = function(form) {
        form.find(".vDateField").datepicker({
            showOn: 'button',
            buttonImageOnly: false,
            buttonText: '',
            dateFormat: grappelli.getFormat('date')
        });
        form.find(".vTimeField").grp_timepicker();
    };
    
    // autocomplete helpers
    grappelli.get_app_label = function(elem) {
        var link = elem.next("a");
        if (link.length > 0) {
            var url = link.attr('href').split('/');
            return url[url.length-3];
        }
        return false;
    };
    grappelli.get_model_name = function(elem) {
        var link = elem.next("a");
        if (link.length > 0) {
            var url = link.attr('href').split('/');
            return url[url.length-2];
        }
        return false;
    };
    grappelli.get_query_string = function(elem) {
        var link = elem.next("a");
        if (link.length > 0) {
            var url = link.attr('href').split('/');
            return url[url.length-1].replace('?', '');
        }
        return false;
    };
    
})(django.jQuery);

