var CustomCheckbox = function(params){
	 var that = {};

	 var checkboxClick = function() {
		var checkedClass = "";
		var re = new RegExp("(^|\\s)checkbox_checked(\\s|$)");

		if(re.test(that.trigger.className)){
			var className = that.trigger.className.replace(re,'');
			that.trigger.className = className;
			that.checkbox.value = "";
		} else {
			that.trigger.className += " checkbox_checked";
			that.checkbox.value = that.value;
		}
		return false;
	}

	function checkboxKeyPress(event){
		var kC  = (window.event) ? window.event.keyCode : event.keyCode;
		if(kC == 32 || kC == 13){
			checkboxClick();
			return false;
		}
	}

	if (!params)
		return;
	if (!params.trigger || !document.getElementById(params.trigger))
		return;
	if (!params.checkbox || !document.getElementById(params.checkbox))
		return;

	that.trigger = document.getElementById(params.trigger);
	that.checkbox = document.getElementById(params.checkbox);
	that.value = params.value || '1';

	that.trigger.onkeydown = checkboxKeyPress;
	that.trigger.onclick = checkboxClick;
}

function rating (mark,act) {

	if (act == 1) {
		var rf = jQuery('#ratingform')[0];
		rf.action = rf.action+'?'+Math.random();
		rf.reiting.value = mark;
		rf.submit();
	} else if (act == 2) {
		var rv = jQuery('#ratingview')[0];
		var rs = jQuery('#ratingset')[0];
		rv.innerHTML = '<span class="label">Рейтинг:</span> <b>'+mark+'</b>';
		rs.style.display = 'none';
		rv.style.display = 'block';
	} else {
		var d = jQuery('#ratingset .rating_line')[0];
		d.style.width = (mark * 16)+'px';
	}

 return false;
}


jQuery.fn.accordion = function(options) {
	var list = jQuery(this);
	return this.each(function() {
		jQuery(this).find('dt').each(function(){
				var next = jQuery(this).find('+dd');
				if(next[0])
					jQuery(this).addClass('not_active');
		});
		
		jQuery(this).find('dd').hide();
		
		jQuery(this).find('dt a').click(function() {

			if (this.href.indexOf('#') == -1)
				return;
			var current = jQuery(this.parentNode.parentNode).find('dd:visible');
			var next = jQuery(this.parentNode).find('+dd');
			if(next[0] != current[0]) {
				current.slideUp();
				current.prev('dt').removeClass('active');
			} else {
				return false;
			}


			if (next.is(':visible')) {
				next.slideUp();
			} else {
				next.slideDown();
			}

			jQuery(this.parentNode).addClass('active');

			return false;
		});
		
		var subItemSelected = jQuery(this).find("dd > ul > li.selected");
		var titleIemSelected = jQuery(this).find('dt.active');
		if(subItemSelected[0]) {
			subItemSelected.parents('dd').show();
			subItemSelected.parents('dd').prev('dt').addClass('active');
		}
		if (titleIemSelected[0])
		{
			titleIemSelected.next('dd').show();
		}
	});
};
                                     

function gebi (elem)
{
 return document.getElementById(elem);
}



function customInputFile(file, file_wrapper){
	var that = this;

	var inputFileChange = function(){
		file = this.value;
		reWin = /.*\\(.*)/;
		var fileTitle = file.replace(reWin, "$1");
		reUnix = /.*\/(.*)/;
		fileTitle = fileTitle.replace(reUnix, "$1");

		var RegExExt =/.*\.(.*)/;
		var ext = fileTitle.replace(RegExExt, "$1");

		var pos;

		jQuery(that.file_wrapper).find('input').eq('1').val(fileTitle);

	}

	var inputFileMouseMove = function(e){
		if (typeof(e) == 'undefined') e = window.event;
		if (typeof e.pageY == 'undefined' &&  typeof e.clientX == 'number' && document.documentElement)
		{
			e.pageX = e.clientX + document.documentElement.scrollLeft;
			e.pageY = e.clientY + document.documentElement.scrollTop;
		};

		var ox = oy = 0;
		var elem = that.file_wrapper;

		if (elem.offsetParent)
		{
			ox = elem.offsetLeft;
			oy = elem.offsetTop;
			while (elem = elem.offsetParent)
			{
				ox += elem.offsetLeft;
				oy += elem.offsetTop;
			};
		};
		var x = e.pageX - ox;
		var y = e.pageY - oy;
		var w = that.file.offsetWidth;
		var h = that.file.offsetHeight;

		that.file.style.top	= y - (h / 2) + 'px';
		that.file.style.left = x - (w - 30) + 'px';
	}

	if (!file || !gebi(file))
		return;


	that.file = gebi(file);
	that.file_wrapper = jQuery(that.file).parents('.file_wrapper')[0];

	that.file_wrapper.onmousemove = inputFileMouseMove;
	that.file.onchange = inputFileChange;
}

jQuery(document).ready(function(){
		jQuery('#guide').accordion();
		
		if (jQuery("a[rel^='showPopup']")[0])
			jQuery("a[rel^='showPopup']").overlay({
				target: '#gallery',
				expose: '#000000'
			}).gallery({
				speed: '1500'
			});

})

function findPosY(obj) {
	var curtop = 0;
	while (obj.offsetParent) {
		curtop += obj.offsetTop;obj = obj.offsetParent;
	}
	return curtop;
}

function findPosX(obj) {
	var curleft = 0;
	while (obj) {
		curleft += obj.offsetLeft;obj = obj.offsetParent;
	}
	return curleft;
}

function artifactAlt(obj, evnt, show) {
	if (!obj) return;
	var div = gebi(obj.getAttribute('div_id'));
	if (!div) return;
	var act1 = obj.getAttribute('act1');
	var act2 = obj.getAttribute('act2');
	
	if (show == 2) {
		document.onmousemove=function(e) {artifactAlt(obj, e||event, 1)} 
		div.style.display = 'block';
		if (act1 || act2) {
			if (obj.tagName == 'IMAGE') {
				obj.src = ("images/itemact-"+ act1) + (act2 +".gif")
			} else {
				obj.style.backgroundImage = 'url(' + ("images/itemact-"+ act1) + (act2 +".gif") + ')'
			}
		}
	}
	
	if (!show) {
		if (act1 || act2) {
			if (obj.tagName == 'IMAGE') {
				obj.src = "images/d.gif"
			} else {
				obj.style.backgroundImage = 'url(' + "images/d.gif" + ')'
			}
		}
		div.style.display = 'none';
		document.onmousemove=function(){}
		return;
	}
	
	if (act1 || act2) {
		obj.style.cursor = 'default'
		obj.onclick = function(){showArtifactInfo(obj.getAttribute('aid'))}
		var coord = getCoords(obj)
		var cont = gebi("item_list")
		var rel_x = (ex + cont.scrollLeft - coord.l)
		if (rel_x >= 40) {
			var rel_y = (ey + cont.scrollTop - coord.t)
			if (act1 != 0 && rel_y < 20) {
				obj.onclick = function(){try{artifactAct(obj, act1)}catch(e){}}
				try{obj.style.cursor = 'hand'} catch(e){}
				try{obj.style.cursor = 'pointer'} catch(e){}
			}
			if (act2 != 0 && rel_y >= 40) {
				obj.onclick = function(){try{artifactAct(obj, act2)}catch(e){}}
				try{obj.style.cursor = 'hand'} catch(e){}
				try{obj.style.cursor = 'pointer'} catch(e){}
			}
		}
	}
	
  e = evnt || window.event;
	 
	if (e.pageX == null && e.clientX != null ) {
			var html = document.documentElement
			var body = document.body
	 
			e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0)
			e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0)
	}
	
	var objPosX = findPosX(div.offsetParent);
	var objPosY = findPosY(div.offsetParent);
	var shiftX = 7;
	
	var x = e.pageX - objPosX + shiftX;
	var y = e.pageY - objPosY;
	
	if (objPosX + div.offsetWidth + shiftX >  document.body.clientWidth) {
		x = e.pageX - div.offsetWidth - objPosX - shiftX;
	}
    

	div.style.left = x + 'px';
	div.style.top = y + 'px';
}

/*
     FILE ARCHIVED ON 05:44:46 Apr 11, 2012 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:10:00 Aug 01, 2018.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 36.898 (3)
  esindex: 0.008
  captures_list: 52.005
  CDXLines.iter: 11.22 (3)
  PetaboxLoader3.datanode: 110.687 (4)
  exclusion.robots: 0.182
  exclusion.robots.policy: 0.169
  RedisCDXSource: 0.756
  PetaboxLoader3.resolve: 824.621
  load_resource: 991.158
*/