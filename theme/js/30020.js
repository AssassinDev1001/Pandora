partnerCounter = new Object();
partnerCounter.addNewCookie = false;
partnerCounter.parseUrl = function(urlToParse){
	//Thanks to http://blog.stevenlevithan.com/archives/parseuri
	var key = ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];
	var uri = {};
	var preParsed = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(urlToParse);
	var i = key.length;

	while (i--){
		uri[key[i]] = preParsed[i] || "";
	}

	uri['params'] = {};
	uri[key[12]].replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
		if ($1) uri['params'][decodeURIComponent($1)] = decodeURIComponent($2);
	});

	return uri;
}
partnerCounter.save = function (site_id) {
	var expiresDate = new Date();
	expiresDate.setTime(expiresDate.getTime() + 365 * 24 * 60 * 60 * 1000);
	if (site_id && site_id != 'null') {
		document.cookie = "partner_id=" + site_id + "; path=/; expires=" + expiresDate.toGMTString();
		if (true == partnerCounter.addNewCookie){
            expiresDate = new Date();
            expiresDate.setTime(expiresDate.getTime() + 24 * 60 * 60 * 1000);
            document.cookie = "mr1lad=" + site_id + "; path=/; expires=" + expiresDate.toGMTString() + "; domain=.mail.ru";
        }
	}
}
partnerCounter.load = function () {
	return this.getCookie("partner_id");
}
partnerCounter.getCookie = function (cookie_name) {
 	var prefix = cookie_name + "=";
	var offset = document.cookie.indexOf(prefix);
	if (offset == -1) return null;
	var end = document.cookie.indexOf(";", offset + prefix.length);
	if (end == -1) end = document.cookie.length;
	return unescape(document.cookie.substring(offset + prefix.length, end));
}
partnerCounter.run = function () {
	var site_id = '';

	if (location.search.search("site_id=") >= 0) {
		var prefix = "site_id=";
		var offset = location.search.indexOf(prefix);
		var end = location.search.indexOf("&", offset + prefix.length);
		if (end == -1) end = location.search.length;
		site_id = unescape(location.search.substring(offset + prefix.length, end));
		var site_keys = site_id.split('_');
		if (site_keys && site_keys[0] && site_keys[0].length >= 1 && site_keys[0].substr(0,1) != "p") {
			var program_type = parseInt(site_keys[0],10) ? parseInt(site_keys[0],10) : 1;
			var start_page = parseInt(site_keys[1],10) ? parseInt(site_keys[1],10) : 0;
			var program_id = parseInt(site_keys[2],10) ? parseInt(site_keys[2],10) : 0;
			var sub_id = parseInt(site_keys[3],10) ? parseInt(site_keys[3],10) : 0;
			var prx = site_keys[4] ? site_keys[4] : '';
			var sw = site_keys[5] ? site_keys[5] : '';
			site_id = program_type+'_'+start_page+'_'+program_id+'_'+sub_id+'_'+prx+'_'+sw;
		}
		if (location.search.search("&c=") >= 0) {
			document.createElement("img").src = "//web.archive.org/web/20170220222253/http://1link.mail.ru/hit?action=click_unique&pid=30020&site_id=" + escape(site_id) + "&rand=" + Math.random();
		}

		var locationParsed = this.parseUrl(window.location.toString());
		if (locationParsed.params.hasOwnProperty('olskip') && locationParsed.params['olskip'] == '1'){
			var hasCookie = this.load();
			if (hasCookie){
				site_id = hasCookie;
			}
		}

	} else {
		
		if (document.referrer.search(new RegExp("(yandex\.ru)|(yandex\.ua)|(yandex\.by)|(yandex\.kz)", "i")) >= 0) {
			site_id = "1_511_59564_0__";
			document.createElement("img").src = "//web.archive.org/web/20170220222253/http://1link.mail.ru/hit?action=click_unique&pid=30020&site_id=" + escape(site_id) + "&rand=" + Math.random();
		} else 
		if (document.referrer.search(new RegExp("(google\.ru)|(google\.com\.ua)|(google\.by)|(google\.by)|(google\.kz)", "i")) >= 0) {
			site_id = "1_511_59565_0__";
			document.createElement("img").src = "//web.archive.org/web/20170220222253/http://1link.mail.ru/hit?action=click_unique&pid=30020&site_id=" + escape(site_id) + "&rand=" + Math.random();
		} else 
		if (document.referrer.search(new RegExp("(go\.mail\.ru)", "i")) >= 0) {
			site_id = "1_511_59566_0__";
			document.createElement("img").src = "//web.archive.org/web/20170220222253/http://1link.mail.ru/hit?action=click_unique&pid=30020&site_id=" + escape(site_id) + "&rand=" + Math.random();
		} else {
			site_id = this.load();
		}
	}

	if (!site_id) {
		site_id = "1_511_60318_0__";
	}

	this.save(site_id);

}
/*
     FILE ARCHIVED ON 22:22:53 Feb 20, 2017 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:10:02 Aug 01, 2018.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 360.146 (3)
  esindex: 0.008
  captures_list: 378.852
  CDXLines.iter: 12.773 (3)
  PetaboxLoader3.datanode: 103.407 (4)
  exclusion.robots: 0.186
  exclusion.robots.policy: 0.175
  RedisCDXSource: 1.866
  PetaboxLoader3.resolve: 813.29 (2)
  load_resource: 599.806
*/