
var gFaceListBaseOptions = {
    initial_data: {"1": "test1.com", "2": "test2.com", "3": "test3.com"},
    related_url: '../../../sites/site/',
    autocomplete: {
        backend:     '/grappelli/autocomplete/sites/site/name,domain/',
        listFormat:  '{id:d} xxx {label:s}',
        inputFormat: '{label:s}'
    }
};


module("Basic requirements");
var methods = ['wm', 'unescapeHTML', 'ui'];

test("Checking presence of jQuery required methods", methods.length, function() {
    for (var x=0;x<methods.length;x++) {
        var m = methods[x];
        ok(typeof(jQuery[m]) != 'undefined', 'Method "'+ m +'" exists.');
    }
});

module("jQuery.gFacelist.js", {
    setup: function(){
        fltest = $('#m2m_test');
        fltest.gFacelist(gFaceListBaseOptions);
    },
    teardown: function(){
        fltest.gFacelist('destroy');
    }
});

// --


test("Initialization", 4, function() {    

    ok(fltest.next().hasClass('ui-gFacelist-wrapper'), 
       'Plugin initialization');

    ok(fltest.next().find('.ui-gFacelist-item').length == 3, 
       'Initial data is loaded');

    var i1 = fltest.next().find('.ui-gFacelist-item').eq(0);
    var i2 = fltest.next().find('.ui-gFacelist-item').eq(1);
    var i3 = fltest.next().find('.ui-gFacelist-item').eq(2);
    ok(i1.text() == 'test1.com' && i2.text() == 'test2.com' && i3.text() == 'test3.com',
        'Data integrity');
        
    i3.trigger($.Event({type: 'click'}));
    ok(fltest.next().find('.ui-gFacelist-item').length == 2, 
       'Item gets removed when clicked');
});

