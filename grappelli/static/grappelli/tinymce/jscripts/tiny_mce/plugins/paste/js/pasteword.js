tinyMCEPopup.requireLangPack();

function saveContent() {
	var html = document.getElementById("frmData").contentWindow.document.body.innerHTML;

	if (html == ''){
		tinyMCEPopup.close();
		return false;
	}

	tinyMCEPopup.execCommand('mcePasteWord', false, html);
	tinyMCEPopup.close();
}

function onLoadInit() {
	tinyMCEPopup.resizeToInnerSize();

	// Fix for endless reloading in FF
	window.setTimeout(createIFrame, 10);
}

function createIFrame() {
	document.getElementById('iframecontainer').innerHTML = '<iframe id="frmData" name="frmData" class="sourceIframe" src="blank.htm" frameborder="0" dir="ltr" wrap="soft"></iframe>';
}

var wHeight=0, wWidth=0, owHeight=0, owWidth=0;

function initIframe(doc) {
	var dir = tinyMCEPopup.editor.settings.directionality;

	doc.body.dir = dir;

	// Remove Gecko spellchecking
	if (tinymce.isGecko)
		doc.body.spellcheck = tinyMCEPopup.getParam("gecko_spellcheck");

	resizeInputs();
}

function resizeInputs() {
	if (!tinymce.isIE) {
		wHeight = self.innerHeight - 120;
		wWidth = self.innerWidth - 42;
	} else {
		wHeight = document.body.clientHeight - 125;
		wWidth = document.body.clientWidth - 42;
	}

	var elm = document.getElementById('frmData');
	if (elm) {
		elm.style.height = Math.abs(wHeight) + 'px';
		elm.style.width  = Math.abs(wWidth) + 'px';
	}
}

tinyMCEPopup.onInit.add(onLoadInit);
