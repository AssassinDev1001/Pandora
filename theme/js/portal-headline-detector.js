
/*-------------------- loader detector -----------------------*/
function detectLoader(showDialog, detectorSwf) {
	
	var browser = {
		opera: (/Opera/.test(navigator.userAgent) ? true : false)
	};
	
    function playUrl(a) {
        var regexp = /download_((\d+\.)?\d+)/i;
        var download_id = (regexp.exec(a.className) || [])[1];
        return download_id ? 'mailrugames://play/' + download_id : undefined;
    }

    window.detectorReady = function() { 
        var detector = document.getElementById('MAgentDetector');
        if (detector) {
            detector.doDetect(2000);
        }
    };

    window.detectCompleteCallback = function(version) { 
        rewriteLinks(version > 0) 
    };
	
	window.rewriteLinks = function(loader_found) {
		var a = document.getElementsByTagName('a');
		for (var i = 0; i < a.length; i++) {
			var p_url = playUrl(a[i]);
			if (!p_url) continue;
			var play_url = p_url;
			var download_url = a[i].getAttribute('href');
			if (loader_found) {
				a[i].setAttribute('href', play_url);
				a[i].removeAttribute('target');
			} else {
				a[i].onclick = function(event) {
					event.preventDefault();
					showDialog(play_url, download_url);
				}
			}
		}
    	}

    function openOpera() {
		var a = document.getElementsByTagName('a');
		var b = document.getElementsByTagName('body')[0];
		for (var i = 0; i < a.length; i++) {
			var play_url = playUrl(a[i]);
			var download_url = a[i].getAttribute('href');
			if (!play_url) continue;
			a[i].onclick = function(event) {
				var ifr = document.createElement('iframe');
				ifr.style.display = 'none';
				b.appendChild(ifr);
				try {
					ifr.contentWindow.location = play_url;
					setTimeout(function() {
						try {
							ifr.title = ifr.contentWindow.location;
						} catch(e) {
							showDialog(play_url, download_url);
						}
					}, 0);
				} catch(e) {
					showDialog(play_url, download_url);
				}
				event.preventDefault();
			}
		}
    }

    if (browser.opera) {
        openOpera();
    } else {
		var div = document.createElement('div');
		div.setAttribute('id', 'MAgentDetectorContainer');
		var object = '<object height="1" width="1" type="application/x-shockwave-flash" id="MAgentDetector" data="'+detectorSwf+'">';
		object += '<param name="movie" value="'+detectorSwf+'" />';
		object += '<param name="play" value="true" />';
		object += '<param name="loop" value="false" />';
		object += '<param name="quality" value="high" />';
		object += '<param name="bgcolor" value="#eceeef" />';
		object += '<param name="allowScriptAccess" value="always" />';
		object += '<param name="menu" value="false" />';
		object += '</object>';
		div.innerHTML = object;
		document.getElementsByTagName('body')[0].appendChild(div);
    }

};

/*
     FILE ARCHIVED ON 14:31:00 Dec 15, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:09:59 Aug 01, 2018.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 52.323 (3)
  esindex: 0.007
  captures_list: 68.077
  CDXLines.iter: 9.961 (3)
  PetaboxLoader3.datanode: 55.94 (4)
  exclusion.robots: 0.149
  exclusion.robots.policy: 0.138
  RedisCDXSource: 1.672
  PetaboxLoader3.resolve: 562.439
  load_resource: 893.035
*/