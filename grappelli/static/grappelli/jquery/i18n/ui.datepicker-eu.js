/* Basque initialisation for the jQuery UI date picker plugin. */
/* Written by Unai Zalakain (unai at gisa-elkartea dot org). */
(function($){
	$.datepicker.regional['eu'] = {
		closeText: 'Itxi',
		prevText: '&#x3c;Aurr',
		nextText: 'Hurr&#x3e;',
		currentText: 'Gaur',
		monthNames: ['Urtarrilla','Otsaila','Martxoa','Apirila','Maiatza','Ekaina',
		'Uztaila','Abuztua','Iraila','Urria','Azaroa','Abendua'],
		monthNamesShort: ['Urt','Ots','Mar','Api','Mai','Eka',
		'Uzt','Abu','Ira','Urr','Aza','Abe'],
		dayNames: ['Igandea','Astelehena','Asteartea','Azteazkena','Osteguna',
        'Ostirala','Larunbata'],
		dayNamesShort: ['Iga','Al','Ar','Az','Og','Ol','Lar'],
		dayNamesMin: ['Ig','Al','Ar','Az','Os','Ol','Lr'],
		dateFormat: 'yy-mm-dd', firstDay: 1,
		isRTL: false};
	$.datepicker.setDefaults($.datepicker.regional['eu']);
})(grp.jQuery);
