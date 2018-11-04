var mailru = mailru || {};
mailru.api || (function() {
	var api;
	api = {
		isApp: false,
		app_id: -1,
		session: false,
		inited: false,
		_init: function(isConnect) {
			isConnect = isConnect || false;

			this.intercom.init(isConnect);

			if (mailru.isIE)
				mailru.utils.addHandler(window, 'load', function() {
					mailru.connect.initButton();
				});
			else
				mailru.connect.initButton();
			mailru.inited = true;

			var css = '' +
                    '#flash-transport-container {height: 0; font-size: 0;}' +
					'.mrc__translayer {filter: progid:DXImageTransform.Microsoft.Alpha(opacity=70); -moz-opacity: 0.7; -khtml-opacity: 0.7; opacity: 0.7; background: #FFF url(http://img6.imgsmail.ru/r/my/preloader_circle_32.gif) no-repeat center center; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 999999; display: none}\n' +
					'.mrc__translayer_on iframe {visibility: hidden}';
			if (mailru.isIE || mailru.isOpera) {
				css += '.mrc__translayer_on object {visibility: hidden}\n';
			}

			var head = document.getElementsByTagName('head')[0],
					style = document.createElement('style'),
					rules = document.createTextNode(css);

			style.type = 'text/css';
			if (style.styleSheet)
				style.styleSheet.cssText = rules.nodeValue;
			else style.appendChild(rules);
			head.appendChild(style);
		},
		def: {
			DOMAIN: (function() {
				try {
					return document.URL.match(/(?:https?:\/\/)?([^\/\?#]+)/i)[1];
				} catch(e) {
					(new Image()).src = 'https://web.archive.org/web/20160709221024/http://gstat.imgsmail.ru/gstat?api.param4=1&rnd=' + Math.random();
					try {
						return document.domain;
					} catch(e) {
						return '';
					}
				}
			})(),
			API_URL: 'https://web.archive.org/web/20160709221024/http://www.appsmail.ru/platform/api',
			PROXY_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/proxy?',
			CONNECT_FORM_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/connect?',
			CONNECT_LOGOUT_URL: 'https://web.archive.org/web/20160709221024/https://auth.mail.ru/cgi-bin/logout?app=1',

			CONNECT_OAUTH: 'https://web.archive.org/web/20160709221024/https://connect.mail.ru/oauth/authorize?',
			CONNECT_XDM_HELPER: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/xdm.html',

            WIDGET_URL: 'https://web.archive.org/web/20160709221024/http://my.mail.ru/cgi-bin/connect/api/',
            DIALOG_URL: 'https://web.archive.org/web/20160709221024/http://my.mail.ru/cgi-bin/connect/api/',

			PLUGIN_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/',
			EMAIL: {
				BUTTON_URL: 'https://web.archive.org/web/20160709221024/http://my.mail.ru/cgi-bin/connect/plugin/email?layout=button&'
			},

			LIKE: {
				BUTTON_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/share_button?',
				UBER_BUTTON_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/share_button?uber-share=1&',
                CAPTCHA_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/share?layout=captcha&',
                COMMENT_URL: 'https://web.archive.org/web/20160709221024/http://connect.mail.ru/share_comment?'
			},

			PERMISSION_URL: 'https://web.archive.org/web/20160709221024/http://my.mail.ru/cgi-bin/connect/permissions?',

			CONNECT_COOKIE: 'mrc',
            PARTNER_ID_COOKIE: 'partner_id',
			CONNECT_BUTTON_BG_URL: 'https://web.archive.org/web/20160709221024/http://img4.imgsmail.ru/r/my/app/connect/connect-button.png',

			FLASH_TRANSPORT_URL: 'https://web.archive.org/web/20160709221024/http://img.imgsmail.ru/r/my/app/flash_lc.swf',
			SESSION_REFRESH_EVERY: 60 * 60 * 1000
		},

		batcher: {
			isBatching: false,
			_batchlist: [],
			start: function() {
				this.isBatching = true;
			},

			/**
			 * Batchable GET request
			 * @param {String} method					API method name
			 * @param {Hash} params (optional)			API mathod arguments
			 * @param {Function} callback (optional)	Callback for result
			 * @return {undefined}
			 */
			reqest: function(method, params, callback) {

				callback = callback || function() {
				};

				var cbid = mailru.callbacks.add(callback);

				params = params || {};
				params.method = method;

				params.app_id = mailru.app_id;
				params.cb = 'mailru.callbacks[' + cbid + ']';
				params.session_key = mailru.session.session_key || '';
				params = mailru.utils.sign(params);

				if (this.isBatching) {
					this._batchlist.push(params);
				} else {
					mailru.utils.apiOverJSONP(params);
                }
			},
			exec: function() {
				if (this.isBatching) {
					this.isBatching = false;

					var len = this._batchlist.length, batch = {};
					for (var i = len; i--;)
						batch['request' + i] = mailru.utils.makeGet(this._batchlist[i]);

					batch.method = 'batcher';

					batch.app_id = mailru.app_id;
					batch.session_key = mailru.session.session_key || '';
					batch = mailru.utils.sign(batch);
					mailru.utils.apiOverJSONP(mailru.utils.sign(batch));
					this._batchlist = {};
				}
			}
		},

		utils: {
			uniqid: function() {
				return Math.round(Math.random(+new Date() + Math.random()) * 10000000);
			},
			apiOverJSONP: function(params, base) {
				base = base || mailru.def.API_URL;
				var url = base + (base.indexOf('?') == -1 ? '?' : '&') + mailru.utils.makeGet(params);
				with (document.getElementsByTagName('head')[0].appendChild(document.createElement('script'))) {
					type = 'text/javascript';
					src = url;
				}
			},
			utcDate: function(){
				return parseInt(new Date().getTime()/1000);
			},
			requestOverProxy: function(params, base) {
				if (mailru.intercomType == 'flash') {
					if (!mailru.intercom.flash.flashReady) {
						mailru.events.listen(mailru.common.events.transportReady, function() {
							mailru.utils.requestOverProxy(params, base);
						});
						return false;
					}
					params.fcid = mailru.intercom.flash.params.fcid;
					params.app_id = mailru.app_id;
				}


                base = base || mailru.def.PROXY_URL;

                params.host = 'http://' + mailru.def.DOMAIN;
				var url = base + mailru.utils.makeGet(params);
				if (mailru.isApp && mailru.intercomType == 'xdm') {
					var rop = new mrcXDM.Socket({
						windowName: true,
						isHost: true,
						remote: url + '&appProxy=1',
						onMessage: function(message) {
							mailru.intercom.receiver(message);

						}
					});
				} else {
					var ifr = document.createElement('iframe');
					with (ifr) {
						src = url;
						style.border = '0';
						style.position = 'absolute';
						style.left = '-10000px';
						style.top = '-10000px';
						style.height = '0';
					}
					document.body.insertBefore(ifr, document.body.getElementsByTagName('*')[0]);
				}
			},
			makeGet: function(hash) {
				var r = [];
				for (var k in hash) {
					if (!hash.hasOwnProperty(k)) continue;
					r[r.length] = k + '=' + encodeURIComponent(hash[k]);
				}
				return r.join('&');
			},
			parseGet: function (str) {
				var p = str.split('&'), r = {}, di;
				for (var i = p.length; i--;) {
					di = p[i].indexOf('=');
					try {
						r[p[i].substr(0, di)] = decodeURIComponent(p[i].substr(di + 1));
					} catch(e) {
					}
				}
				return r;
			},
			toArray: function(likeArr) {
				var r = [], l = likeArr.length;
				for (var i = l; i--;) {
					r[i] = likeArr[i];
				}
				return r;
			},
			fromJSON: function(str) {
				if (str == undefined || str.replace(/\s+/, '') == '')
					return undefined;

				try {
					return ( new Function('return ' + str + ';') )();
				} catch(e) {
					return str;
				}
			},

			foreach: function(arr, cb) {
				if (arr.length !== undefined) {
					for (var i = 0; i < arr.length; i++) {
						cb(arr[i], i);
					}
				} else {
					for (var k in arr) {
						if (arr.hasOwnProperty(k)) {
							cb(arr[k], k);
						}
					}
				}
			},

			/**
			 * Set cookie
			 * @param {Hash} opt		Hash like {
			 *								 name: '',		// Required
			 *								 value: '',		// Required, will be escaped
			 *								 domain: '',		// document.location.host by default
			 *								 path: '',		// "/" by default
			 *								 secure: '',
			 *								 expires: '',	// End of session
			 *							 }
			 * @return {undefined}
			 */
			setCookie: function(opt) {

				if (!opt || !opt.name)
					return false;

				opt.domain = opt.domain || mailru.def.DOMAIN;
				opt.path = opt.path || '/';

				document.cookie = opt.name + "=" + escape(opt.value) +
					((opt.expires) ? "; expires=" + (new Date(opt.expires)).toUTCString() : "") +
					((opt.path) ? "; path=" + opt.path : "") +
					((opt.domain) ? "; domain=." + opt.domain : "") +
					((opt.secure) ? "; secure" : "");
			},
			getCookie: function(name) {
				var value;
				if (value = document.cookie.match((new RegExp('(^|;\\s*)' + name + '=([^;]+)(;|$)'))))
					return unescape(value[2]);

				return undefined;
			},
			addHandler: function(obj, name, cb) {
				if (obj.addEventListener) {
					obj.addEventListener(name, cb, false);
				} else if (obj.attachEvent) {
					obj.attachEvent('on' + name, cb);
				}
			},
			mixin: function(dst, src, no_override) {
				for (var k in src) {
					if (src.hasOwnProperty(k) && (!no_override || !dst[k])) {
						dst[k] = src[k];
					}
				}
			},
			extend: function(dst, src) {
				var o = {};
				for (var p in src) {
					if (src.hasOwnProperty(p) && typeof o[p] === 'undefined' && p != 0) {
						if (dst.hasOwnProperty(p))
							mailru.utils.extend(dst[p], src[p]);
						else
							dst[p] = src[p];
					}
				}
			},
			sign: function(hash) {

				var arr = [], params = [], res = '';
				for (var k in hash) {
					if (hash.hasOwnProperty(k)) {
						arr[arr.length] = k;
					}
				}
				arr = arr.sort();
				for (var i = 0; i < arr.length; i++) {
					params += arr[i] + '=' + hash[arr[i]];
				}
				hash['sig'] = mailru.utils.md5('' + mailru.session.vid + params + mailru.private_key);
				return hash;
			},
			css: {
				getStyle: function(el, styleProp) {
					var x = typeof el === 'string' ? document.getElementById(el) : el,
							y = null;

					if (x.currentStyle)
						y = x.currentStyle[styleProp];
					else if (window.getComputedStyle)
						y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
					return y;
				}
			},
			md5: function (string) {

				function RotateLeft(lValue, iShiftBits) {
					return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
				}

				function AddUnsigned(lX, lY) {
					var lX4,lY4,lX8,lY8,lResult;
					lX8 = (lX & 0x80000000);
					lY8 = (lY & 0x80000000);
					lX4 = (lX & 0x40000000);
					lY4 = (lY & 0x40000000);
					lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
					if (lX4 & lY4) {
						return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
					}
					if (lX4 | lY4) {
						if (lResult & 0x40000000) {
							return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
						} else {
							return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
						}
					} else {
						return (lResult ^ lX8 ^ lY8);
					}
				}

				function F(x, y, z) {
					return (x & y) | ((~x) & z);
				}

				function G(x, y, z) {
					return (x & z) | (y & (~z));
				}

				function H(x, y, z) {
					return (x ^ y ^ z);
				}

				function I(x, y, z) {
					return (y ^ (x | (~z)));
				}

				function FF(a, b, c, d, x, s, ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				}

				function GG(a, b, c, d, x, s, ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				}

				function HH(a, b, c, d, x, s, ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				}

				function II(a, b, c, d, x, s, ac) {
					a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
					return AddUnsigned(RotateLeft(a, s), b);
				}

				function ConvertToWordArray(string) {
					var lWordCount;
					var lMessageLength = string.length;
					var lNumberOfWords_temp1 = lMessageLength + 8;
					var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
					var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
					var lWordArray = Array(lNumberOfWords - 1);
					var lBytePosition = 0;
					var lByteCount = 0;
					while (lByteCount < lMessageLength) {
						lWordCount = (lByteCount - (lByteCount % 4)) / 4;
						lBytePosition = (lByteCount % 4) * 8;
						lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
						lByteCount++;
					}
					lWordCount = (lByteCount - (lByteCount % 4)) / 4;
					lBytePosition = (lByteCount % 4) * 8;
					lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
					lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
					lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
					return lWordArray;
				}

				function WordToHex(lValue) {
					var WordToHexValue = "",WordToHexValue_temp = "",lByte,lCount;
					for (lCount = 0; lCount <= 3; lCount++) {
						lByte = (lValue >>> (lCount * 8)) & 255;
						WordToHexValue_temp = "0" + lByte.toString(16);
						WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
					}
					return WordToHexValue;
				}

				function Utf8Encode(string) {
					string = string.replace(/\r\n/g, "\n");
					var utftext = "";

					for (var n = 0; n < string.length; n++) {

						var c = string.charCodeAt(n);

						if (c < 128) {
							utftext += String.fromCharCode(c);
						}
						else if ((c > 127) && (c < 2048)) {
							utftext += String.fromCharCode((c >> 6) | 192);
							utftext += String.fromCharCode((c & 63) | 128);
						}
						else {
							utftext += String.fromCharCode((c >> 12) | 224);
							utftext += String.fromCharCode(((c >> 6) & 63) | 128);
							utftext += String.fromCharCode((c & 63) | 128);
						}

					}

					return utftext;
				}

				var x = Array();
				var k,AA,BB,CC,DD,a,b,c,d;
				var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
				var S21 = 5, S22 = 9 , S23 = 14, S24 = 20;
				var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
				var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

				string = Utf8Encode(string);

				x = ConvertToWordArray(string);

				a = 0x67452301;
				b = 0xEFCDAB89;
				c = 0x98BADCFE;
				d = 0x10325476;

				for (k = 0; k < x.length; k += 16) {
					AA = a;
					BB = b;
					CC = c;
					DD = d;
					a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
					d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
					c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
					b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
					a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
					d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
					c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
					b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
					a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
					d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
					c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
					b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
					a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
					d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
					c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
					b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
					a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
					d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
					c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
					b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
					a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
					d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
					c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
					b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
					a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
					d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
					c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
					b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
					a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
					d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
					c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
					b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
					a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
					d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
					c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
					b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
					a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
					d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
					c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
					b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
					a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
					d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
					c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
					b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
					a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
					d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
					c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
					b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
					a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
					d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
					c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
					b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
					a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
					d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
					c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
					b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
					a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
					d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
					c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
					b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
					a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
					d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
					c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
					b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
					a = AddUnsigned(a, AA);
					b = AddUnsigned(b, BB);
					c = AddUnsigned(c, CC);
					d = AddUnsigned(d, DD);
				}

				var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

				return temp.toLowerCase();
			}
		},

		intercom: {
			_chunkBuff: [],
			_chunkLen: 0,
			_chunkTimeout: null,
			_chunkFinished: function() {
			},
			init: function(isConnect) {
				this.wrp = this[mailru.intercomType];
				this.wrp.init(isConnect);
			},

			/**
			 * Intercom receiver
			 * @param {String} params
			 * @return {undefined}
			 */
			receiver: function(params) {
				params = mailru.utils.parseGet(params);
				if (params.result) {
					if (+params.rt) {
						params.res_hash = mailru.utils.parseGet(params.result);
					} else {
						params.res_hash = mailru.utils.fromJSON(params.result);
					}
				}
				params.res_hash = params.res_hash || {};
				if (params.res_hash.error && params.res_hash.error.error_code == 102 && mailru.session) {
					mailru.events.notify(mailru.connect.events.logout);
				}
				if (params.event) {
					mailru.events.notify(params.event, params.res_hash, params.result);
				} else if (params.cbid && mailru.callbacks[params.cbid]) {
					if (params.chunk) {
						if (!this._chunkBuff.length) {
							this._chunkLen = params.len;
							this._chunkFinished = (function(cbid) {
								return function() {

									for (var i = 0; i < mailru.intercom._chunkLen; i++) {
										if (!mailru.intercom._chunkBuff[i]) {
											//debugger;
										}
									}


									mailru.callbacks[cbid]({result: mailru.intercom._chunkBuff.join('')});
									mailru.intercom._chunkBuff = [];
									mailru.intercom._chunkLen = 0;
									mailru.intercom._chunkFinished = function() {
									};
								}
							})(params.cbid)
						}

						window.clearTimeout(this._chunkTimeout);
						this._chunkTimeout = window.setTimeout(this._chunkFinished, 3000);

						this._chunkBuff[+params.index] = params.res_hash.result;
						this._chunkLen--;
						if (!this._chunkLen) {
							window.clearTimeout(this._chunkTimeout);
							this._chunkFinished();
						}
					} else {
						mailru.callbacks[params.cbid](params.res_hash, params.result);
					}
				}
			},

			/**
			 * @private
			 */
			_makeRequest: function(method, params, callback) {
				params = params || {};
				params.method = method;
				params.resource = 'app';
				callback && (params.cbid = mailru.callbacks.add(callback));
				return params;
			},

			/**
			 * Intercom wrapper interface
			 */
			wrp: {
				init: function() {
				},

				/**
				 * request
				 * @param {String} method							Mail.ru API method name
				 * @param {Hash} params (optional)					Arguments
				 * @param {Function} callback (optional)			Accept result
				 * @return {undefined}
				 */
				request: function(method, params, callback) {
				}
			},

			/**
			 * Wrappers implementation
			 */
			hash: {
				init: function() {

				},
				request: function(method, params, callback) {
					params = mailru.intercom._makeRequest(method, params, callback);

					mailru.utils.requestOverProxy(params, mailru.def.PROXY_URL);
				}
			},
			event: {
				init: function() {

					mailru.utils.addHandler(window, 'message', function(ev) {
						mailru.intercom.receiver(ev.data);
					});
				},
				request: function(method, params, callback) {
					params = mailru.intercom._makeRequest(method, params, callback);

					parent.postMessage(mailru.utils.makeGet(params), '*');
				}
			},
			flash: {
				transport: "",
				params: {},
				toSend: [],
				flashReady: false,
				insertFlash: function() {
					mailru.intercom.flash.transport = document.createElement('div');
					document.body.insertBefore(mailru.intercom.flash.transport, document.body.getElementsByTagName('*')[0]);
					mailru.intercom.flash.transport.id = 'flash-transport-container';
					mailru.intercom.flash.transport.innerHTML = '' +
							'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="https://web.archive.org/web/20160709221024/http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="api-lcwrapper" height="1" width="1" type="application/x-shockwave-flash" data="' + mailru.def.FLASH_TRANSPORT_URL + '">' +
							'<param value="always" name="allowScriptAccess"/>' +
							'<param value="' + mailru.def.FLASH_TRANSPORT_URL + '" name="movie"/>' +
							'<param value="' + mailru.intercom.flash.vars + '" name="FlashVars"/>' +
							'</object>';
				},
				init: function(isConnect) {
					if (document.URL.match(/\?(.*)/))
						mailru.intercom.flash.params.fcid = mailru.utils.parseGet(document.URL.match(/\?(.*)/)[0])['fcid'];

					if (!mailru.intercom.flash.params.fcid || typeof mailru.intercom.flash.params.fcid === 'undefined')
						mailru.intercom.flash.params.fcid = mailru.utils.parseGet(window.name)['fcid'];

					if (!mailru.intercom.flash.params.fcid || typeof mailru.intercom.flash.params.fcid === 'undefined')
						mailru.intercom.flash.params.fcid = mailru.utils.uniqid();

					mailru.intercom.flash.vars = mailru.utils.makeGet({
						CBReceive: 'mailru.intercom.flash.receive',
						CBReady: 'mailru.intercom.flash.ready',
						listenTo: 'api',
						connectTo: 'server',
						cid: mailru.intercom.flash.params.fcid,
						host: mailru.def.DOMAIN,
						role: 'server',
						noOpposite: +!!isConnect
					});

					mailru.intercom.flash.insertFlash();

				},
				request: function(method, params, callback) {
					params = mailru.utils.makeGet(mailru.intercom._makeRequest(method, params, callback));
					var t = document.getElementById('api-lcwrapper');
					if (t && t.send) {
						t.send(params);
					} else {
						mailru.intercom.flash.toSend.push(params);
						mailru.events.listen(mailru.common.events.transportReady, function() {
							for (var i = mailru.intercom.flash.toSend.length - 1; i >= 0; i--)
								document.getElementById('api-lcwrapper').send(mailru.intercom.flash.toSend[i]);
						});
					}
					t = null;
				},
				receive: function(params) {
					mailru.intercom.receiver(params);
				},
				ready : function() {
					if (navigator.appName.indexOf("Microsoft") != -1) {
						mailru.intercom.flash.transport = window['api-lcwrapper'];
					} else {
						mailru.intercom.flash.transport = document['api-lcwrapper'];
					}

					mailru.intercom.flash.flashReady = true;
					mailru.events.notify(mailru.common.events.transportReady);
				}
			}
		},

		callbacks: {
			add: function(callback) {
				var cbid = mailru.utils.uniqid();

				mailru.callbacks[cbid] = function() {
					delete mailru.callbacks[cbid];

					if (callback) {
						callback.apply(window, arguments);
					}
				}
				return cbid;
			}
		},

		events: {
			_listentrs: {},
			_hidHash: {},
			listen: function(event, callback) {
				event = mailru.events._alias[event] || event;

				this._listentrs[event] = this._listentrs[event] || {
					index: -1,
					list: {}
				};
				var index = ++this._listentrs[event].index;
				this._listentrs[event].list[index] = callback;
				var hid = mailru.utils.uniqid();
				this._hidHash[hid] = [event, index];
				return hid;
			},
			remove: function(hid) {
				if (this._hidHash[hid]) {
					delete this._listentrs[this._hidHash[hid][0]].list[this._hidHash[hid][1]];
				}
			},
			notify: function(event) {
				if (event != 'event') {
					var args = mailru.utils.toArray(arguments);
					args.unshift('event');
					this.notify.apply(this, args);
				}
				var len, cbs;
				args = mailru.utils.toArray(arguments).splice(1, arguments.length);
				if (this._listentrs[event] && this._listentrs[event].index != -1){
					mailru.utils.foreach(this._listentrs[event].list, function(cb) {
						cb.apply(window, args);
					});
				}
			},
			_alias : {
				'stream.post' : 'common.streamPublish',
				'mailru.common.events.streamPublish' : 'common.streamPublish',
				'message.post' : 'common.sendMessage',
				'guestbook.post' : 'common.guestbookPublish',
				'mailru.common.events.guestbookPublish' : 'common.guestbookPublish',

				'common.upload' : mailru.isApp ? 'common.upload' : 'common.uploadPhoto',
				'mailru.common.events.upload' : 'common.upload',
                'mailru.common.events.uploadAvatar' : 'common.uploadAvatar',

				'mailru.app.events.friendsInvitation' : 'common.friendsInvitation',
                'mailru.app.events.friendsRequest' : 'common.friendsRequest',
				'mailru.common.events.createAlbum' : 'common.createAlbum',
				'mailru.common.events.friends.add' : 'common.friends.add',
				'mailru.app.events.incomingPayment' : 'app.incomingPayment',
				'mailru.app.events.paymentDialogStatus' : 'app.paymentDialogStatus',
				'mailru.app.events.hash.read' : 'app.hash.read',
                'mailru.app.events.scrollTo' : 'app.scrollY'
			}
		},

		common: {
			email: {
				getUnreadCount: function(callback) {
					mailru.batcher.reqest('email.getUnreadCount', {
						uid: mailru.session.vid || ''
					}, callback);
				}
			},
			messages: {
				getUnreadCount: function(callback) {
					mailru.batcher.reqest('messages.getUnreadCount', {}, callback);
				},
				getThreadsList: function(callback, params) {
					params = params || {};
					mailru.batcher.reqest('messages.getThreadsList', {
						offset: params.offset || 0,
						limit: params.limit || 10
					}, callback);
				},
				getThread: function(callback, uid, params) {
					params = params || {};
					mailru.batcher.reqest('messages.getThread', {
						uid: uid || mailru.session.vid || '',
						offset: params.offset || 0,
						limit: params.limit || 10
					}, callback);
				},
				send: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					if(!params.uid){
						throw new Error('No recepient UID');
					}

					if (mailru.isApp) {
						params.session_key = mailru.session.session_key;
						params.appid = mailru.app_id;
						mailru.intercom.wrp.request('showSendMessageDialog', params);
					}
					else {
						var wid = mailru.utils.modal.open(mailru.def.DIALOG_URL + 'send_message?', {
							url: params,
							type: 'modal'
						});
					}
				}
			},
			users: {
				requirePermissions: function(permission) {
					if (typeof permission == 'function') {
						permission = arguments[1];
					}
					mailru.common.users.requirePermission(permission);
				},
				requirePermission: function(permission) {
					if (typeof permission == 'function') {
						permission = arguments[1];
					}
					mailru.events.notify(mailru.common.events.permissionsChange, {status: 'closed'});
				},
				getInfo: function(callback, uids) {
					if (typeof uids === 'string' || typeof uids === 'number') {
						if (arguments.length > 2) {
							uids = arguments.splice(3, arguments.length);
						}
						else {
							uids = [uids];
						}
					}
					if (typeof uids === 'undefined' || uids.length == 0) {
						var uids = [mailru.session.vid]
					}

					mailru.batcher.reqest('users.getInfo', {
						uids: uids.join(',')
					}, callback);
				},
				getPermissions: function() {
				},
				hasAppPermission: function(callback, ext_perm, uid) {
					mailru.batcher.reqest('users.hasAppPermission', {
						uid: uid || mailru.session.vid || '',
						ext_perm: ext_perm
					}, callback);
				},
                getBalance: function(callback, uid){
                    mailru.batcher.reqest('users.getBalance', {
                        uid: uid || mailru.session.vid
                    }, callback);
                }
			},
			stream: {
				publish: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					var tmpParams = {posttitle: (params.title ? params.title : ''), apptext: (params.text ? params.text : ''), pic: (params.img_url ? params.img_url : (params.imgURL ? params.imgURL : ''))};
					tmpParams.id = 'stream-publish';

					params.action_links = params.action_links ? params.action_links : (params.actionLinks ? params.actionLinks : false);
					if (params.action_links) {
						for (var i = 1; i <= params.action_links.length; i++) {
							tmpParams['link_' + i + '_text'] = params.action_links[i - 1].text;
							tmpParams['link_' + i + '_href'] = params.action_links[i - 1].href;
						}
					}
					if (mailru.isApp) {
						tmpParams.session_key = mailru.session.session_key;
						tmpParams.appid = mailru.app_id;
						mailru.intercom.wrp.request('showStreamPublish', tmpParams);
					}
					else {
						tmpParams.url = tmpParams;
						tmpParams.type = 'modal';
						var wid = mailru.utils.modal.open(mailru.def.DIALOG_URL + 'stream_publish?', tmpParams);
					}
				},
				post: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					mailru.common.stream.publish(params);
				},
				get: function(callback, params) {
					params = params || {};
					mailru.batcher.reqest('stream.get', {
						offset: params.offset || 0,
						limit: params.limit || 10,
						filter_app: params.filter_app || ''
					}, callback);
				},
				getByAuthor: function(callback, uid, params) {
					params = params || {};
					mailru.batcher.reqest('stream.getByAuthor', {
						uid: uid || mailru.session.vid,
						offset: params.offset || 0,
						limit: params.limit || 10,
						filter_app: params.filter_app || ''
					}, callback);
				}
			},
			guestbook: {
				publish: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					if (typeof params.uid === 'undefined') {
						params.uid = mailru.session.vid;
					}
					var tmpParams = {url: {uid: params.uid.toString(), title: (params.title ? params.title : ''), text: (params.text ? params.text : ''), img: (params.img_url ? params.img_url : (params.imgURL ? params.imgURL : ''))}, type: 'modal'};
					tmpParams.id = 'guestbook-publish';

					params.action_links = params.action_links ? params.action_links : (params.actionLinks ? params.actionLinks : false);
					if (params.action_links) {
						for (var i = 1; i <= params.action_links.length; i++) {
							try {
								tmpParams.url['link_' + i + '_text'] = params.action_links[i - 1].text;
								tmpParams.url['link_' + i + '_href'] = params.action_links[i - 1].href;
							} catch(e) {
							}
						}
					}
					if (mailru.isApp) {
						mailru.intercom.wrp.request('showGuestbookPublish', {
							app_id: mailru.app_id,
							text: tmpParams.url.text,
							title: tmpParams.url.title,
							img: tmpParams.url.img,
							uid: tmpParams.url.uid,
							link_1_text: tmpParams.url.link_1_text || '',
							link_1_href: tmpParams.url.link_1_href || '',
							link_2_text: tmpParams.url.link_2_text || '',
							link_2_href: tmpParams.url.link_2_href || '',
							session_key: mailru.session.session_key
						});
					}
					else {
						var wid = mailru.utils.modal.open(mailru.def.DIALOG_URL + 'publish_guestbook?', tmpParams);
					}
				},
				post: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					params.text = params.text || params.description;
					if (params.description)
						delete params.description;

					mailru.common.guestbook.publish(params);
				},
				get: function(callback, uid, params) {
					params = params || {};
					mailru.batcher.reqest('guestbook.get', {
						uid: uid || mailru.session.vid || '',
						offset: params.offset || 0,
						limit: params.limit || 10
					}, callback);
				}
			},
			photos: {
				getAlbums: function(callback, uid) {
					mailru.batcher.reqest('photos.getAlbums', {
						uid: uid || mailru.session.vid || ''
					}, callback);
				},
				get: function(callback, aid, pids) {
					mailru.batcher.reqest('photos.get', {
						pids: pids || '',
						aid: aid
					}, callback);
				},
				createAlbum: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					params.toSend = {url: {album_name: params.name}, type: 'modal'};
					params = params.toSend;
					params.id = "create-album";
					if (mailru.isApp) {
						mailru.intercom.wrp.request('showAlbumCreation', {
							app_id: mailru.app_id,
							album_name: params.url.album_name,
							session_key: mailru.session.session_key
						});
					}
					else {
						var wid = mailru.utils.modal.open(mailru.def.WIDGET_URL + 'create_album?', params);
					}
				},
				upload: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}

					params.img = params.img || params.url;
					params.toSend = {url: {img: params.img, aid: params.aid, set_as_cover : params.set_as_cover || false, title: params.title || params.name || '', desc: params.description || params.desc || '', category: params.theme || params.category || '', tags: params.tags || ''}, type: 'modal'};
					params = params.toSend;
					params.id = "upload-photo";

                    if (mailru.isApp) {
						mailru.intercom.wrp.request('showPhotoUpload', {
							app_id: mailru.app_id,
							img: params.url.img,
							aid: params.url.aid,
							title: params.url.title || '',
							desc: params.url.desc || '',
							category: params.url.category || '',
							tags: params.url.tags || '',
							set_as_cover: params.url.set_as_cover || '',
							session_key: mailru.session.session_key
						});
					}
					else {
						var wid = mailru.utils.modal.open(mailru.def.WIDGET_URL + 'upload_photo?', params);
					}
				},
                uploadAvatar: function (params) {

                    var options = {
                        app_id: mailru.app_id,
                        session_key: mailru.session.session_key
                    };

                    if (typeof params == 'function') {
                        params = arguments[1];
                    }

                    if (typeof params.url !== 'undefined') {
                        options.img_url = params.url;
                    } else {
                        options.pid = params.pid;
                    }

                    if (mailru.isApp) {
                        mailru.intercom.wrp.request('showSetAvatar', options);
                    }
                    else {
                        var wid = mailru.utils.modal.open(mailru.def.WIDGET_URL + 'avatar_set?', {type: 'modal', url: options});
                    }
                }
			},
			audio: {
				search: function(callback, query, offset, limit) {
					if (typeof query === 'undefined') {
						throw new Error('audio search failed:\nno QUERY');
						return false;
					}
					mailru.batcher.reqest('audio.search', {
						query: query,
						offset: offset || 0,
						limit: limit || 10
					}, callback);
				},
				link: function(callback, mid) {
					if (typeof mid === 'undefined') {
						throw new Error('get audio link failed:\nno MID');
						return false;
					}
					mailru.batcher.reqest('audio.link', {
						mid: mid
					}, callback);
				},
				get: function(callback, uid, mid) {
					mailru.batcher.reqest('audio.get', {
						uid: uid || mailru.session.vid || '',
						mid: mid || ''
					}, callback);
				}
			},
			friends: {
				add: function(uid) {
					if (typeof uid == 'function') {
						uid = arguments[1];
					}
					var params = {url: {uid: uid}, type: 'modal'};
					if (mailru.isApp) {
						mailru.intercom.wrp.request('showAddFriend', {
							app_id: mailru.app_id,
							uid: uid,
							session_key: mailru.session.session_key
						});
					}
					else {
						var wid = mailru.utils.modal.open(mailru.def.WIDGET_URL + 'add_friend?', params);
					}
				},
				getFiltered: function(callback, uid, offset) {
					mailru.batcher.reqest('friends.get', {
						uid: uid || mailru.session.vid || '',
						offset: offset || 0
					}, callback);
				},
				getExtended: function(callback, uid, offset) {
					mailru.batcher.reqest('friends.get', {
						uid: uid || mailru.session.vid || '',
						ext: 1,
						offset: offset || 0
					}, callback);
				},
				getAppUsers: function(callback, ext, uid, offset) {
					mailru.batcher.reqest('friends.getAppUsers', {
						uid: uid || mailru.session.vid || '',
						ext: +!!ext,
						offset: offset || 0
					}, callback);
				},
				getInvitationsCount: function(callback) {
					mailru.batcher.reqest('friends.getInvitationsCount', {
						uid: mailru.session.vid || ''
					}, callback);
				}
			},
            payments: {
                showDialog: function(params) {
                    if (typeof params == 'function') {
                        params = arguments[1];
                    }
                    params.app_id = mailru.app_id;



                    if (mailru.isApp) {
                        mailru.intercom.wrp.request('showPaymentDialog', params);
                    } else {

                        params.window_id = mailru.window_id;
                        params.mailiki_price *= 100;
                        params.url = params;
                        params.type = 'modal';
                        params.style = {
                            width: '675px'
                        };

                        if (!mailru.session) {
                            throw new Error('No user session');
                        }

                        mailru.connect.activePaymentWindow = mailru.utils.modal.open(mailru.def.DIALOG_URL + 'payment_dialog?', params);
                    }
                }
            },

			events: {
				permissionChanged: 'common.permissionChanged',
				permissionsChange: 'common.permissionChanged',
				friendsInvitation: 'common.friendsInvitation',
				message: {
					send: 'common.sendMessage'
				},
				streamPublish: 'common.streamPublish',
				modalWindow: 'common.modalWindow',
				requireWidgetPermissions: 'common.requireWidgetPermissions',
				createAlbum: 'common.createAlbum',
				upload: 'common.upload',
				uploadAvatar: 'common.uploadAvatar',
				guestbookPublish: 'common.guestbookPublish',
				transportReady: 'common.transportReady',
				friends: {
					add: 'common.friends.add'
				},
                paymentDialogStatus: 'common.paymentDialogStatus'
			}
		},

		app: {
			init: function(private_key) {
				mailru.isApp = true;

				if (!mailru.inited)
					mailru._init();
				mailru.utils.extend(mailru.app, mailru.common);
				private_key && (mailru.private_key = private_key);
				var session, sessionstr = (document.URL.match(/\?(.*)/) || [0,''])[1];
				session = mailru.utils.parseGet(sessionstr);

				if (!session.app_id || !session.session_key) {
					sessionstr = mailru.utils.getCookie(mailru.def.CONNECT_COOKIE) || '';
					if (sessionstr == '')
						sessionstr = mailru.utils.parseGet(window.name)['cookie'];
					session = mailru.utils.parseGet(sessionstr);
				}
				if (!session.app_id) {
					throw new Error('API INIT FAILED:\nno APP ID');
				}
				if (!session.session_key) {
					throw new Error('API INIT FAILED:\nno No SESSION KEY');
				}
				mailru.app_id = session.app_id;

				mailru.app._dispatchSession(session, sessionstr);

			},
			users: {
				requireInstallation: function(params) {
					mailru.events.notify(mailru.app.events.applicationInstallation, {status: 'success'});
				},
				isAppUser: function(callback, uid) {
					mailru.batcher.reqest('users.isAppUser', {
						uid: uid || mailru.session.vid || ''
					}, callback);
				},
				review: function() {
					mailru.intercom.wrp.request('showReviewDialog', {app_id: mailru.app_id});
				},
				events: {
					getNewCount: function(callback, uid){
						mailru.batcher.reqest('events.getNewCount', {
							uid: uid || mailru.session.vid || ''
						}, callback);
					}
				}
			},
			widget: {
				set: function(){
					mailru.events.notify(mailru.app.events.widget.set, {status: 'closed'});
                    return false;
				}
			},
			    friends: {
				invite: function(params) {
					params = params || {};
					if (typeof params == 'function') {
						params = arguments[1] || {};
					}
					params.text = params.text || '';
					mailru.intercom.wrp.request('showInviteFriendsDialog', {app_id: mailru.app_id, text: params.text});
				},

                request: function(params) {
                    params = params || {};
                    if (typeof params == 'function') {
                        params = arguments[1] || {};
                    }
                    if(!params.text || !params.image_url){
                        throw new Error('Missing required params: ' + (params.text ? '' : 'text\n') + (params.image_url ? '' : 'image_url\n'));
                        return false;
                    }
                    if(params.friends instanceof Array){
                        params.friends = params.friends.join(',');
                    }
                    mailru.intercom.wrp.request('showRequestFriendsDialog', {
                        app_id: mailru.app_id,
                        text: params.text,
                        image_url: params.image_url,
                        friends: params.friends || false,
                        hash: params.hash || false
                    });
                }
			},
			payments: {
				showDialog: function(params) {
                    if (typeof params == 'function') {
                        params = arguments[1];
                    }
                    mailru.common.payments.showDialog.call(mailru, params);
				},
				openDialog: function(params) {
                    if (typeof params == 'function') {
                        params = arguments[1];
                    }
					mailru.common.payments.showDialog.call(mailru, params);
				}
			},

			setLocation: function() {
			},
			getLocation: function() {
			},
			resizeWindow: function() {
			},
			scrollWindow: function() {
			},
			setTitle: function(params) {
				if (typeof params == 'function') {
					params = arguments[1];
				}
				mailru.app.utils.setTitle(params);
			},
			utils: {
                getScrollY: function(params){
                    "use strict";

                    mailru.intercom.wrp.request('scrollTo');
                },
                setScrollY: function(params) {
                    "use strict";

                    if (typeof params === 'function') {
                        params.scroll = arguments[1];
                    } else if (typeof scroll !== 'undefined'){
                        params.scroll = scroll;
                    }

                    mailru.intercom.wrp.request('scrollTo', params);
                },
				setTitle: function(params){
					if (typeof params == 'function') {
						params = arguments[1];
					}
					if (params != null && params !== 'undefined')
						mailru.intercom.wrp.request('setTitle', {app_id: mailru.app_id, title:  params});
				},
				setHeight: function(params) {
					if (typeof params == 'function') {
						params = arguments[1];
					}
					if (params)
						mailru.intercom.wrp.request('setIframeHeight', {app_id: mailru.app_id, height:  params});
				},
				hash: {
					write: function(params) {
						if (typeof params == 'function') {
							params = arguments[1];
						}
						if (typeof params === 'undefined') return false;
						mailru.intercom.wrp.request('writeHash', {hash: params});
					},
					read: function() {
	                   var wn = mailru.utils.parseGet(window.name),
	                       h = wn.fast_hash;

                        if (h) {
		                   mailru.app.utils.hash._fastHash = h;
		                   delete wn.fast_hash;
		                   window.name = mailru.utils.makeGet(wn);
						mailru.app.utils.hash._initRead();
	                   } else {
		                    mailru.app.utils.hash._initRead();
						mailru.intercom.wrp.request('readHash');
		               }
					},
					_initRead: function() {
                        function processHash (d){
							var hash = '';
							if (typeof d === 'string')
								hash = d;
							else
                                hash = d.hash

	                        hash = mailru.utils.parseGet(hash);
							mailru.events.notify('app.hash.read', hash);
							mailru.events.notify('app.readHash', hash);
                        }

	                    if(mailru.app.utils.hash._inited && !mailru.app.utils.hash._fastHash) return false;

	                    if(mailru.app.utils.hash._fastHash) {
		                    processHash(mailru.app.utils.hash._fastHash);
		                    mailru.app.utils.hash._fastHash = false;
	                    }
                        mailru.events.listen(mailru.app.events.appReadHash, function(d){
	                    	processHash(d);
						});
						mailru.app.utils.hash._inited = true;

					},
					_inited: false,
					_fastHash: false
				},
				scrollTo: function (scroll) {
                    var params = {};

					if (typeof scroll === 'function') {
						params.scroll = arguments[1];
					} else if (typeof scroll !== 'undefined'){
                        params.scroll = scroll;
					}

					mailru.intercom.wrp.request('scrollTo', params);
				}
			},
			/**
			 * Application events namespace
			 */
			events: {
				windowBlur: 'app.windowBlur',
				windowFocus: 'app.windowFocus',
				locationChange: 'app.locationChange',
				windowResize: 'app.windowResize',
				applicationInstallation: 'app.applicationInstallation',
				friendsInvitation: 'app.friendsInvitation',
                friendsRequest: 'app.friendsRequest',
				applicationSettingsStatus: 'app.settings',
				applicationReviewStatus: 'app.review',
				incomingPayment: 'app.incomingPayment',
				requireInstallation: 'app.requireInstallation',
				appReadHash: 'app.appReadHash',
				readHash: 'app.readHash',
                scrollTo: 'app.scrollTo',
				hash: {
					read : 'app.hash.read'
				},
				like: 'app.like',
				widget: {
					set: 'app.widget.set'
				},
				paymentDialogStatus: 'app.paymentDialogStatus'
			},

			getLoginStatus: function(callback) {
				mailru.utils.requestOverProxy({
					resource: 'getLoginStatus',
					app_id: mailru.app_id,
					cbid: mailru.callbacks.add(function(session, sessionstr) {
						mailru.app._dispatchSession(session, sessionstr);
						callback && callback(session, sessionstr);
					})
				});
			},

			/**
			 * @private
			 */
			_dispatchSession: function(session, sessionstr) {
				if (!session.session_expire && session.exp) {
					session.session_expire = session.exp;
				}

				if (!session.session_expire) {
					session.session_expire = mailru.def.SESSION_REFRESH_EVERY;
				}

				mailru.session = session;
				mailru.app._prolongSession(session);
				var c = mailru.utils.parseGet(window.name);
				c.cookie = sessionstr;
				window.name = mailru.utils.makeGet(c);
				mailru.utils.setCookie({
					name: mailru.def.CONNECT_COOKIE,
					value: sessionstr
				});

			},

			/**
			 * @private
			 */
			_clearSession: function() {
				mailru.session = false;
				window.clearTimeout(mailru.app._prolongSessionTmr);
			},
			/**
			 * @private
			 */
			_prolongSessionTmr: null,

			/**
			 * @private
			 */
			_prolongSession: function(session) {
				window.clearTimeout(mailru.app._prolongSessionTmr);
				mailru.app._prolongSessionTmr = window.setTimeout(function() {
					mailru.app.getLoginStatus();
				}, mailru.def.SESSION_REFRESH_EVERY);
			}
		},

		connect: {
			init: function(app_id, private_key, isGame) {
				if (!app_id) {
					throw new Error('API INIT FAILED:\nno APP ID');
				}
				if (!private_key) {
					throw new Error('API INIT FAILED:\n�o PRIVATE KEY');
				}
				
                mailru.isGame = isGame || false;

                app_id && (mailru.app_id = app_id);

                mailru.partner_id = mailru.utils.getCookie(mailru.def.PARTNER_ID_COOKIE);

                if (!mailru.inited)
					mailru._init(1);
				mailru.utils.extend(mailru.connect, mailru.common);

				private_key && (mailru.private_key = private_key);

				mailru.events.listen(mailru.connect.events.loginOAuth, mailru.connect._dispatchSession);
				mailru.events.listen(mailru.connect.events.logout, mailru.connect._clearSession);
				mailru.events.listen(mailru.connect.events.loginFail, mailru.connect.loginFail);

				var session, sessionstr = mailru.utils.getCookie(mailru.def.CONNECT_COOKIE);
				sessionstr && (session = mailru.utils.parseGet(sessionstr));
				if (!sessionstr) {
					mailru.connect.getLoginStatus();
				} else if (session && session.is_app_user) {
					mailru.connect._dispatchSession(session, sessionstr);
				}



				mailru.events.listen(mailru.common.events.streamPublish, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});
				mailru.events.listen(mailru.common.events.guestbookPublish, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});

				mailru.events.listen(mailru.common.events.friends.add, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});

				mailru.events.listen(mailru.common.events.upload, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});

                mailru.events.listen(mailru.common.events.uploadAvatar, function(d) {
                    if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
                        mailru.utils.modal.close(d.wid);
                });

				mailru.events.listen(mailru.common.events.permissionChanged, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});

				mailru.events.listen(mailru.common.events.createAlbum, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});
				mailru.events.listen(mailru.common.events.message.send, function(d) {
					if (d !== undefined && d.wid && d.wid !== 'undefined' && d.wid !== 'opened')
						mailru.utils.modal.close(d.wid);
				});
                mailru.events.listen(mailru.common.events.paymentDialogStatus, function(d) {
                    if (d !== undefined && d.wid && d.wid !== 'undefined' && d.status !== 'opened')
                        mailru.utils.modal.close(d.wid);
                });

                mailru.events.listen(mailru.app.events.incomingPayment, function() {
                    setTimeout(function () {
                        mailru.utils.modal.close(mailru.connect.activePaymentWindow);
                    }, 3000);

                });
			},
			initButton: function() {
				var a = document.getElementsByTagName('a'), al = a.length, ai = 0, ca = null, r = '',
						CONNECT_BUTTON_URL = 'https://web.archive.org/web/20160709221024/http://img4.imgsmail.ru/r/my/app/connect/connect-button.png';
				for (0; ai < al; ai++) {
					if (a[ai].className.indexOf('mrc__connectButton') != -1) {
						ca = a[ai];
						ca.innerHTML = '';
						with (ca.style) {
							background = 'url(' + mailru.def.CONNECT_BUTTON_BG_URL + ') no-repeat';
							display = 'inline-block';
							width = '115px';
							height = '18px';
						}

						if (mailru.intercom.flash.params && mailru.intercom.flash.params.fcid) {
							var fcid = mailru.intercom.flash.params.fcid;
						} else {
							fcid = mailru.utils.parseGet((document.URL.match(/\?(.*)/) || [''])[0]).fcid;
						}

						ca.href = 'javascript:void(0);';
						ca.onclick = function(e) {
                            mailru.connect.login();
							return false;
						};
					}
				}
			},
			/**
			 * Show Mail.ru Connect dialog. Fires mailru.connect.events.login event on success, pass session details
			 * @return {undefined}
			 */
			login: function(scope) {
				if (mailru.session && mailru.session.is_app_user) {
					mailru.events.notify(mailru.connect.events.login, mailru.session, mailru.utils.getCookie(mailru.def.CONNECT_COOKIE));
				} else {
					var popupParams = {
						app_id: mailru.app_id,
						host: 'http://' + mailru.def.DOMAIN
					}
					if (mailru.intercomType == 'flash') {
						popupParams.fcid = mailru.intercom.flash.params.fcid;
					}

					var scope = scope || '';
					try {
						scope = scope.join().match(/\w*/g).join(' ');
					} catch(e) {
						scope = scope.match(/\w*/g).join(' ')
					}

					var url = mailru.def.CONNECT_OAUTH + 'client_id=' + mailru.app_id + '&response_type=token&display=popup&redirect_uri=' + encodeURIComponent(mailru.def.PROXY_URL + 'app_id=' + mailru.app_id + '&login=1' + (popupParams.fcid ? '&fcid=' + popupParams.fcid : '') + (popupParams.host ? '&host=' + popupParams.host : '')) + '&' + mailru.utils.makeGet(popupParams) + '&' + mailru.utils.makeGet({scope: scope}) + (mailru.partner_id ? '&site_id=' + encodeURIComponent(mailru.partner_id) : '') + (mailru.isGame ? '&game=1' : '');

					var w = window.open(url, 'mrc_login', 'width=445, height=400, status=0, scrollbars=0, menubar=0, toolbar=0, resizable=1');
					if (mailru.isOpera) {
						window.onfocus = function() {
							if (!mailru.session.login) {
								window.onfocus = null;
								mailru.events.notify(mailru.connect.events.loginFail);
							}
						};
					} else {
						if (typeof w !== 'undefined' && w != null) {

							var tmr = setInterval(function() {
								if (w.closed) {
									clearInterval(tmr);
								}
							}, 500)
						} else {
							if (!mailru.session.login) mailru.events.notify(mailru.connect.events.loginFail);
						}
					}

				}
			},

			/**
			 * User logout. Fires mailru.connect.events.logout event on success
			 * @return {undefined}
			 */
			logout: function() {
				mailru.utils.apiOverJSONP(mailru.utils.sign({
					cb: 'mailru.callbacks[' + mailru.callbacks.add(function(data) {
						if (data.result) {
							mailru.events.notify(mailru.connect.events.logout);
						}
					}) + ']',
					app_id: mailru.app_id
				}), mailru.def.CONNECT_LOGOUT_URL);
			},

			loginFail: function() {

			},

			/**
			 * Get login status
			 * @param {Function} callback (optional)				Accept session details
			 * @return {undefined}
			 */
			getLoginStatus: function(callback) {
				if (typeof callback != 'function')
					callback = false;
				mailru.utils.requestOverProxy({
					resource: 'getLoginStatus',
					app_id: mailru.app_id,
					cbid: mailru.callbacks.add(function(session, sessionstr) {
						mailru.connect._dispatchSession(session, sessionstr);
						callback && callback(session, sessionstr);
					})
				});
			},

			events: {
				login: 'connect.login',
				loginOAuth: 'connect.loginOAuth',
				logout: 'connect.logout',
				loginFail: 'connect.loginFail'
			},

			/**
			 * @private
			 */
			_dispatchSession: function(session, sessionstr, is_app) {
				if (session.access_token) {
					mailru.connect.getLoginStatus(function() {
						mailru.events.notify(mailru.connect.events.login, mailru.session, mailru.utils.getCookie(mailru.def.CONNECT_COOKIE));
					});
					return false;
				}

                mailru.session = session;

                if (mailru.isGame && mailru.session.window_id && !mailru.cometInited && mailru.session && mailru.session.is_app_user) {
                    mailru.cometInited = true;
                    mailru.utils.requestOverProxy({
                        comet: 1,
                        app_id: mailru.app_id,
                        window_id: mailru.session.window_id
                    });
                }

				if (session.is_app_user == 0 && !is_app) {
					mailru.connect._clearSession();
				} else {
					mailru.connect._prolongSession(session);
				}



				mailru.utils.setCookie({
					name: mailru.def.CONNECT_COOKIE,
					value: sessionstr
				});
			},

			/**
			 * @private
			 */
			_clearSession: function() {
				mailru.session = false;
				window.clearTimeout(mailru.connect._prolongSessionTmr);
				mailru.utils.setCookie({
					name: mailru.def.CONNECT_COOKIE,
					expires: -1,
					value: ''
				});
			},
			/**
			 * @private
			 */
			_prolongSessionTmr: null,

			/**
			 * @private
			 */
			_prolongSession: function(session) {
				window.clearTimeout(mailru.connect._prolongSessionTmr);

				mailru.connect._prolongSessionTmr = window.setTimeout(function() {
					mailru.connect.getLoginStatus();
				}, mailru.def.SESSION_REFRESH_EVERY);
			}
		},

		utils2: {
			modal: {
				open: function(url, params) {
					if (params.type && params.type == 'modal') {
						if (mailru.utils.modal._windows.length && mailru.utils.modal._windows.length > 0) {
							params.wid = params.wid || mailru.utils.uniqid();
							mailru.utils.modal.queue.add(url, params);
							return params.wid;
						}
					}
					var wid = params.wid || mailru.utils.uniqid();

					mailru.utils.modal._windows[wid] = document.createElement('iframe');

					!params && (params = {});
					!params.id && (params.id = wid);
					!params.name && (params.name = params.id);
					!params.url && (params.url = {});
					params.url.wid = wid;
                    params.url.type = params.type;
					mailru.app_id != -1 && (params.url.appid = mailru.app_id);
					params.url.app_id = mailru.app_id;
					mailru.session.session_key && (params.url.session_key = mailru.session.session_key);
					if (mailru.intercomType == 'flash') {
                        params.url.fcid = mailru.intercom.flash.params.fcid;
                    }

					params.url.host = 'http://' + mailru.def.DOMAIN;
					url += mailru.utils.makeGet(params.url);
					mailru.utils.modal._windows[wid].frameBorder = '0';
					mailru.utils.modal._windows[wid].style.height = 0;
					mailru.utils.modal._windows[wid].allowtransparency = "true";
					mailru.utils.modal._windows[wid].scrolling = 'no';
					params.type && (mailru.utils.modal._windows[wid].modalType = params.type);
					if (params.style) {
						for (var st in params.style) {
							mailru.utils.modal._windows[wid].style[st] = params.style[st];
						}
					} else {
                        params.style = {};
                    }
					if (!mailru.utils.modal._tanslayer) {
						mailru.utils.modal._tanslayer = document.createElement('div');
					}

					if (params.type && params.type == 'modal') {
						mailru.utils.modal._windows.length++;

						with (mailru.utils.modal._tanslayer) {
							style.display = 'block';
							className = 'mrc__translayer';
						}
					}
					mailru.utils.modal._windows[wid].src = url;

					switch (params.type) {
						case 'modal' :
							document.body.appendChild(mailru.utils.modal._windows[wid]);

							if (!mailru.utils.modal._tanslayer)
								mailru.utils.modal._tanslayer = document.createElement('div');
							with (mailru.utils.modal._tanslayer) {
								className = 'mrc__translayer';
								style.display = 'block';
							}

							if (!mailru.isIE || !mailru.isOpera)
								mailru.utils.modal._flashArray = document.getElementsByTagName('object');
							if (!mailru.utils.modal._tanslayer.appended) {
								document.body.appendChild(mailru.utils.modal._tanslayer);
								mailru.utils.modal._tanslayer.appended = true;
							}

							break;
						case 'insertable' :
							mailru.utils.modal._windows[wid].setAttribute('allowTransparency', true);
							if (params.insertOptions.insertAfter) {
								params.place = params.place.nextSibling;
							}
							if (params.insertOptions.position) {
								with (mailru.utils.modal._windows[wid].style) {
									position = "absolute";
									left = params.insertOptions.position.left + "px";
									top = params.insertOptions.position.top + "px"
								}
							}
							if (params.insertOptions.body) {
								document.body.appendChild(mailru.utils.modal._windows[wid]);
							} else {
								if (params.insertOptions.wrap) {
									var wrp = document.createElement('span');
									wrp.setAttribute('style', 'position: relative; left: 0; top: 0; margin: 0; padding: 0; visibility: visible;');
									wrp.appendChild(mailru.utils.modal._windows[wid]);
									params.place.parentNode.insertBefore(wrp, params.place);
								}
								else {
									params.place.parentNode.insertBefore(mailru.utils.modal._windows[wid], params.place);
								}
							}
							if (!params.insertOptions.noreplace)
								params.place.style.display = 'none';
							break;
					}
					with (mailru.utils.modal._windows[wid]) {
						type = params.type;
						//src = url;
						name = params.name;
						id = params.id;
						if (params.type == 'modal') {
							style.width = params.style.width || '515px';
							style.height = '0';
							style.marginLeft = '-10000px';
							style.top = '50%';
							style.left = '50%';
							style.position = 'absolute';
							style.zIndex = '999999999';
						}
						if (params.type == 'insertable') {
							style.backgroundColor = 'transparent';
							if (params.url.width) {
								params.url.width = params.url.width.toString();
								switch (params.url.width.replace(/\d*/gim, '')) {
									case "em":
										params.url.width = params.url.width.replace(/\D*/gim, '') + 'em';
										break;
									case "px":
										params.url.width = params.url.width.replace(/\D*/gim, '') + 'px';
										break;
									case "%":
										params.url.width = params.url.width.replace(/\D*/gim, '') + '%';
										break;

									default: params.url.width = params.url.width.replace(/\D*/gim, '') + 'px';

								}
								style.width = params.url.width;
							}


							style.height = params.url.height + 'px' || '';

						}
						style.border = 'solid #FFFF00 0px';
					}

					mailru.events.listen(mailru.common.events.modalWindow, function(d) {
						mailru.utils.modal.resize(d.wid, d.modalWindowWidth, d.modalWindowHeight);
					})
					return wid;
				},
				close: function(wid) {
					if (typeof mailru.utils.modal._windows[wid] === 'undefined')
						return false;
					if (mailru.utils.modal._tanslayer)
						mailru.utils.modal._tanslayer.style.display = 'none';

					document.body.className = document.body.className.replace('mrc__translayer_on', '');
					if (!mailru.isIE && !mailru.isOpera) {
						for (var i = 0; i < mailru.utils.modal._flashArray.length; i++) {
							mailru.utils.modal._flashArray[i].style.zIndex = mailru.utils.modal._flashArray[i].originalZIndex;
							if (mailru.utils.modal._flashArray[i].noWmode) {
								for (var j = 0; j < mailru.utils.modal._flashArray[i].childNodes.length; j++) {
									if (mailru.utils.modal._flashArray[i].childNodes[j].value == 'opaque') {
										mailru.utils.modal._flashArray[i].removeChild(mailru.utils.modal._flashArray[i].childNodes[j]);
									}
								}
							}
						}
					}
					if (typeof wid !== 'undefined' && typeof mailru.utils.modal._windows[wid] !== 'undefined' && mailru.utils.modal._windows[wid].parentNode != null) {
						mailru.utils.modal._windows[wid].parentNode.removeChild(mailru.utils.modal._windows[wid]);
						if (mailru.utils.modal._windows[wid].modalType && mailru.utils.modal._windows[wid].modalType == 'modal')
							mailru.utils.modal._windows.length--;
						delete mailru.utils.modal._windows[wid];

						var queueModal = mailru.utils.modal.queue.get();
						if (typeof queueModal !== 'undefined')
							mailru.utils.modal.open(queueModal.url, queueModal.params);
					}
				},
				resize: function(wid, w, h) {
					if (typeof wid !== 'undefined' && typeof mailru.utils.modal._windows[wid] !== 'undefined') {
						if (mailru.utils.modal._windows[wid].type == 'modal') {
							for (var i = 0; i < mailru.utils.modal._flashArray.length; i++) {
								if (!mailru.isIE && !mailru.isOpera) {
									if (mailru.utils.modal._flashArray[i].innerHTML.indexOf('wmode') == -1) {
										mailru.utils.modal._flashArray[i].noWmode = true;
										mailru.utils.modal._flashArray[i].paramWmode = '<param name="wmode" value="opaque" />';
										mailru.utils.modal._flashArray[i].innerHTML += mailru.utils.modal._flashArray[i].paramWmode;
										mailru.utils.modal._flashArray[i].originalPosition = mailru.utils.getStyle(mailru.utils.modal._flashArray[i], 'position');
										if (mailru.utils.modal._flashArray[i].originalPosition !== 'static') {
											mailru.utils.modal._flashArray[i].originalZIndex = mailru.utils.getStyle(mailru.utils.modal._flashArray[i], 'zIndex');
											mailru.utils.modal._flashArray[i].style.zIndex = '1';
										}
										else {
											mailru.utils.modal._flashArray[i].style.position = 'relative';
										}
									}
								}
							}
							document.body.setAttribute('class', document.body.getAttribute('className') || '' + ' mrc__translayer_on');
							mailru.utils.modal._tanslayer.style.display = 'block';
						}
						setTimeout(function() {
                            if (!mailru.utils.modal._windows[wid]) return;
							with (mailru.utils.modal._windows[wid]) {

								frameborder = '0';
								if (w && w !== 'false') {
									style.width = parseInt(w) + 'px';
									if (mailru.utils.modal._windows[wid].modalType && mailru.utils.modal._windows[wid].modalType == 'modal')
										style.marginLeft = '-' + parseInt(w) / 2 + 'px';
								}
								if (h)
									style.height = parseInt(h) + 'px';
								style.borderStyle = "none";

								if (!mailru.isApp)
									style.display = 'block';

								if (type == 'modal') {
									style.top = mailru.utils.modal._getScrollTop() + mailru.utils.modal._getWindowSize() / 2 - h / 2 + 'px';
									style.visibility = 'visible';
								}
							}
						}, 5)
					}
					return true;
				},
				_getScrollTop: function() {
					return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
				},
				_getWindowSize: function() {
					return typeof window.innerHeight == 'number' ? window.innerHeight : (document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ? document.documentElement.clientHeight : (document.body && ( document.body.clientWidth || document.body.clientHeight ? document.body.clientHeight : null))));
				},
				_translayer: null,
				_flashArray: [],
				_windows: {
					length: 0
				},
				queue: {
					elements: null,
					add: function(url, params) {
						if (!this.elements)
							this.elements = [];
						this.elements.push({url: url, params: params});
						this.length = this.elements.length;
					},
					get: function() {
						if (this.length) {
							this.length--;
							var el = this.elements[0] || false;
							this.elements = this.elements.slice(1);
							return el;
						}
					},
					length: 0
				}
			},
			window: {
				_getBody: function(w) {
					if (!w)
						w = window;
					return w.document.body;
				},
				_getDocumentWidth: function(w) {
					if (!w)
						w = window;
					if (mailru.isIE)
						return mailru.utils.window._getBody(w).scrollWidth;
					if (mailru.isOpera)
						return w.document.body.style.pixelWidth;
					return w.document.width;
				},
				_getDocumentHeight: function(w) {
					if (!w)
						w = window;
					if (mailru.isIE)
						return mailru.utils.window._getBody(w).scrollHeight;
					if (mailru.isOpera)
						return w.document.body.style.pixelHeight;
					return w.document.height;
				},
				_getClientWidth: function() {
					return document.compatMode == 'CSS1Compat' && !window.opera ? document.documentElement.clientWidth : document.body.clientWidth;
				},
				_getClientHeight: function() {
					return document.compatMode == 'CSS1Compat' && !window.opera ? document.documentElement.clientHeight : document.body.clientHeight;
				},
				_getPosition: function(el) {
					function getOffsetRect(el) {
						var box = el.getBoundingClientRect()
						var body = document.body
						var docElem = document.documentElement
						var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
						var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
						var clientTop = docElem.clientTop || body.clientTop || 0
						var clientLeft = docElem.clientLeft || body.clientLeft || 0
						var top = box.top + scrollTop - clientTop
						var left = box.left + scrollLeft - clientLeft

						return { top: Math.round(top), left: Math.round(left) }
					}

					function getOffsetSum(el) {
						var top = 0, left = 0;
						while (el) {
							top = top + parseInt(el.offsetTop);
							left = left + parseInt(el.offsetLeft);
							el = el.offsetParent;
						}

						return {top: top, left: left}
					}

					if (el.getBoundingClientRect) {
						return getOffsetRect(el)
					} else {
						return getOffsetSum(el)
					}
				}
			}
		},
		plugin: {
            inited: false,
			elements: {},
			init: function() {
				if (!mailru.inited)
					mailru._init(1);
                if(!mailru.plugin.inited){
                    mailru.events.listen(mailru.plugin.events.closeLikeComment, function(result) {
                        if (result.share)
                            mailru.utils.modal.close(mailru.plugin._like.buttonsWithComment[result.wid]);
                        else
                            mailru.utils.modal.close(result.wid);
                    });
                    
                    mailru.events.listen(mailru.plugin.events.unliked, function(result) {
                        mailru.plugin._like.closeAllComments();
                    });
                    mailru.events.listen(mailru.plugin.events.liked, function(result) {
                        mailru.plugin._like.closeAllComments(function() {
                            if(!result.noComment)
                                mailru.plugin._like.Comment(result);
                        });
                    });
                    mailru.events.listen(mailru.plugin.events.like.rlOK, function(result) {
                        mailru.plugin._like.closeAllComments(function() {
                            mailru.plugin._like.Comment(result);
                        });
                    });
                    mailru.events.listen(mailru.plugin.events.like.rl, function(result) {
                        mailru.plugin._like.rl(result);
                    });
                    mailru.events.listen(mailru.plugin.events.errorMessage, function(result) {
                        mailru.plugin._like.closeAllComments(function() {
                            mailru.plugin._like.errorMessage(result.wid, result.errorType, result.buttonType);
                        });

                    });
                    mailru.events.listen(mailru.plugin.events.like.comment, function(result) {
                        mailru.plugin._like.closeAllComments(function() {
                            mailru.plugin._like.Comment(result);
                        });

                    });
                    mailru.utils.addHandler(document.body, 'click', function(event) {
                        event = event || window.event;
                        var trg = event.target || event.srcElement;

                        for (var id in mailru.plugin._like.buttonsWithComment) {
                            if (trg.id != mailru.plugin._like.buttonsWithComment[id])
                                mailru.utils.modal.close(mailru.plugin._like.buttonsWithComment[id]);
                        }
                    });
                    mailru.events.listen(mailru.plugin.events.email.redirect, function(result) {
                        mailru.plugin.email.redirectTo(result.url);
                    });

                    mailru.plugin.inited = true;
                }
				if (mailru.isIE) {
					if (document.attachEvent) (function() {
						try {
							document.documentElement.doScroll("left");
						} catch(e) {
							setTimeout(arguments.callee, 0);
							return;
						}
						mailru.plugin.find();
					})();
					return false;
				}
				else {
					mailru.plugin.find();
				}
			},
			find: function() {
				var a = document.getElementsByTagName('a'), al = a.length, ca = null;
				for (var i = 0; i < al; i++) {
					if (typeof a[i] !== 'undefined' && a[i].className.indexOf('mrc__plugin') != -1 && !a[i].processed) {
						ca = a[i];
						ca.type = (ca.className.match(/^[mrc__Plugin_]\w*/gim))[0];
						ca.type = (ca.type != null ? ca.type.replace('mrc__plugin_', '') : null);
						ca.params = false;
						if (ca.getAttribute('data-mrc-config')) {
							try {
								ca.params = ca.getAttribute('data-mrc-config').length != 0 ? eval('(' + ca.getAttribute('data-mrc-config').replace(new RegExp("\\n", "g"), '') + ')') : false;
							} catch(e) {
								ca.params = false;
							}
						}
						if (!ca.params) {
							try {
								ca.params = ca.rel.length != 0 ? eval('(' + ca.rel.replace(new RegExp("\\n", "g"), '') + ')') : {};
							} catch(e) {
								ca.params = {};
							}
						}
						if (!ca.params.domain)
							ca.params.domain = document.domain;

						ca.type != null ? (mailru.plugin.insert(ca)) : '';
					}
				}
			},
			insert: function(element) {
				element.insertOptions = {};
				var url = mailru.def.PLUGIN_URL + element.type + '?';
				switch (element.type) {
					case 'like_button': mailru.plugin._like.Button(element); url = mailru.def.LIKE.BUTTON_URL; break;
					case 'uber_like_button':
                        mailru.plugin._like.Button(element);
                        element.params.cp = 1;
                        url = mailru.def.LIKE.UBER_BUTTON_URL;
                        break;
					case 'email_button': url = mailru.def.EMAIL.BUTTON_URL; break;
				}
				var wid = 0;
				wid = mailru.utils.modal.open(url, {type: 'insertable', place: element, url:  element.params, insertOptions: element.insertOptions, wid: mailru.utils.uniqid()});

				element.processed = true;
				mailru.plugin.elements[wid] = element.params;
			},
			events: {
				liked: 'plugin.liked',
				unliked: 'plugin.unliked',
				likeCommented: 'plugin.likeCommented',
				closeLikeComment: 'plugin.closeComment',
				errorMessage: 'plugin.errorMessage',
				like: {
					liked: 'plugin.like.liked',
					unliked: 'plugin.like.unliked',
					commented: 'plugin.like.Commented',
					closeComment: 'plugin.like.closeComment',
					errorMessage: 'plugin.like.errorMessage',
					rl: 'plugin.like.rl',
					rlOK: 'plugin.like.rlOK',
					comment: 'plugin.like.comment'
				},
				email: {
					data: 'plugin.email.data',
					redirect: 'plugin.email.redirect'
				}
			},
			_like: {
				buttonsWithComment: {},
				Button: function(element) {
					var buttonID = mailru.utils.uniqid(),
						params = mailru.utils.parseGet((element.getAttribute('href').match(/\?(.*)/) || [0,''])[1]);


					params.title && (element.params.title = params.title);
					params.desc && (element.params.desc = params.desc);
					params.description && (element.params.desc = params.description);
					params.image_url && (element.params.imageurl = params.image_url);
					params.imageurl && (element.params.imageurl = params.imageurl);
					params.share_url && (element.params.url = params.share_url);
					params.url && (element.params.url = params.url);
					if (!element.params.url || !element.params.url.length || (element.getAttribute('href').indexOf('share_url=') == -1 && element.getAttribute('href').indexOf('url=') == -1 ))
						element.params.url = document.location.href;
					else {
						if (element.params.url.indexOf('http://') == -1)
							element.params.url = 'http://' + element.params.url;
						element.params.url = unescape(element.params.url);
					}

					params.swfurl && (element.params.video = params.swfurl);
					params.width && (element.params.vwidth = params.width);
					params.height && (element.params.vheight = params.height);
					params.screenshot && (element.params.imageurl = params.screenshot);

					element.params.buttonID = buttonID;
					element.params.faces_count = 10;

                    element.params.sz = element.params.height = (element.params.sz || element.params.size) || 21;
                    element.params.st = (element.params.st || element.params.style) || 'oval';

                    if(element.params.tp || element.params.type) {
                        element.params.tp = element.params.tp || element.params.type;
                    }

                    if(params.share_remote){
                        element.params.su = params.share_remote;
                    }

                    if((element.params.sz > 12 && element.params.sz < 70) && element.params.vt || element.params.vertical && !element.params.nc){
                        element.params.vt = 1;
                        element.params.height *= 3;
                    }

                    element.params.width = element.params.width || '100%';

					element.insertOptions.wrap = true;
					element.params.caption = element.innerHTML;
					if (mailru.isIE) {
						element.params.desc && (element.params.desc = element.params.desc.substr(0, 200));
						element.params.title && (element.params.title = element.params.title.substr(0, 100));
					}
				},
				Comment: function(result) {
                    if(typeof result === 'undefined')
                        return false;

                    var id = result.wid,
                        hid = result.history_id,
                        type = result.type,
                        ok_uid = result.OK_uid,
                        elementType = result.buttonType,
                        offset = result.offset || 0,
                        crosspost = result.crosspost || false,
                        checkCrosspost = result.checkCrosspost || false,
                        avatar = result.avatar || false,
                        buttonFrame = document.getElementById(id);


                    if(crosspost)
                        return false;
                    
					if (!id || (!hid && (typeof type === 'undefined' || type != 'ok')) || id === 'undefined' || (type == "ok" && typeof ok_uid === 'undefined')) return false;
					elementType = elementType || '';
					type = type || '';
					avatar = avatar || '';
					var insertOptions = {
						noreplace: true,
						position: mailru.utils.window._getPosition(buttonFrame),
						body: true
					};

					offset && (insertOptions.position.left += +offset);

					var style = {
						position: 'absolute',
						display: 'block',
						zIndex: '1000',
						overflow: 'auto',
						margin: parseInt(buttonFrame.style.height) + 'px 0 0'
					};

					var url = mailru.def.LIKE.COMMENT_URL + 'buttonID=' + id + '&';
					if(elementType == 'uber-share'){
						url += 'uber-share=1&';
					}

                    if(!!~buttonFrame.src.indexOf('&type=small')){
                        url += 'small=1&';
                    }

                    if(!!~buttonFrame.src.indexOf('&nt=1')){
                        url += 'super-small=1&';
                    }

					var data = {};
					if(type == 'ok'){
						data = {wid: mailru.plugin._like.buttonsWithComment[id], type: 'insertable', place: buttonFrame, insertOptions: insertOptions, url: {ok_uid: ok_uid}, style: style};
						url += 'soc=ok&avatar=' + encodeURIComponent(avatar) + '&';
					} else {
						data = {wid: mailru.plugin._like.buttonsWithComment[id], type: 'insertable', place: buttonFrame, insertOptions: insertOptions, url: {history_id: hid}, style: style};
					}

                    if(checkCrosspost){
                        url += 'checkCrosspost=1&';
                    }

					mailru.plugin._like.buttonsWithComment[id] = mailru.utils.uniqid();
					mailru.utils.modal.open(url, data);
				},
				closeAllComments: function(cb) {
					for (var cid in mailru.plugin._like.buttonsWithComment) {
						mailru.utils.modal.close(mailru.plugin._like.buttonsWithComment[cid]);
					}
					if (typeof cb == 'function')
						cb();
				},
				errorMessage: function(id, error, elementType) {
					elementType = elementType || '';

                    var buttonFrame = document.getElementById(id);
					var insertOptions = {
						noreplace: true,
						position: mailru.utils.window._getPosition(buttonFrame),
						body: true
					};

					var style = {
						position: 'absolute',
						display: 'block',
						zIndex: '1000',
						overflow: 'auto',
						margin: parseInt(buttonFrame.style.height) + 'px 0 0'
					};

					var url = mailru.def.LIKE.COMMENT_URL;
					if(elementType == 'uber-share'){
						url += 'uber-share=1&';
					}

					mailru.plugin._like.buttonsWithComment[id] = mailru.utils.uniqid();
					mailru.utils.modal.open(url, {wid: mailru.plugin._like.buttonsWithComment[id], type: 'insertable', place: buttonFrame, insertOptions: insertOptions, url: {error_type: error}, style: style});
				},
				rl: function(result) {
                    var id = result.wid || false,
					    elementType = result.buttonType || '';
					if (!id || id === 'undefined')
						return false;

                    var buttonFrame = document.getElementById(id);
					var insertOptions = {
						noreplace: true,
						position: mailru.utils.window._getPosition(buttonFrame),
						body: true
					};

					var style = {
						position: 'absolute',
						display: 'block',
						zIndex: '1000',
						overflow: 'auto',
						margin: parseInt(buttonFrame.style.height) + 'px 0 0'
					};
					var url = mailru.plugin.elements[id];
					delete url.height;
					delete url.app_id;
					delete url.wid;
					delete url.height;
					delete url.width;
					url.like_id = id;
                    url.buttonID = id;
					url.rl = 1;

					var rl_url = mailru.def.LIKE.CAPTCHA_URL;
					if(elementType == 'uber-share'){
						rl_url += 'uber-share=1&';
					}

					mailru.plugin._like.buttonsWithComment[id] = mailru.utils.uniqid();
					mailru.utils.modal.open(rl_url, {wid: mailru.plugin._like.buttonsWithComment[id], type: 'insertable', place: buttonFrame, insertOptions: insertOptions, url: url, style: style});
				}
			},

			email: {
				redirectTo: function(url) {
					url && (document.location = url);
				}
			}

		}
	};

	api.utils.mixin(mailru, api, 1);
	api.utils.mixin(mailru.utils, mailru.utils2);
}());

mailru.loader && mailru.loader.onready('api');
/*
     FILE ARCHIVED ON 22:10:24 Jul 09, 2016 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:10:15 Aug 01, 2018.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 86.788 (3)
  esindex: 0.01
  captures_list: 104.021
  CDXLines.iter: 12.236 (3)
  PetaboxLoader3.datanode: 53.485 (4)
  exclusion.robots: 0.224
  exclusion.robots.policy: 0.208
  RedisCDXSource: 0.982
  PetaboxLoader3.resolve: 1708.707
  load_resource: 1736.394
*/