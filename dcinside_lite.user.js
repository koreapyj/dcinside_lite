// ==UserScript==
// @name           dcinside_lite
// @namespace      http://kasugano.tistory.com
// @version        15009
// @date           2015.08.02
// @author         축 -> 하루카나소라
// @description    디시인사이드 갤러리를 깔끔하게 볼 수 있고, 몇 가지 유용한 기능도 사용할 수 있습니다.
// @include        http://gall.dcinside.com/*
// @include        http://gall.dcgame.in/*
// @include        http://job.dcinside.com/*
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function() {
	var R_VERSION = "15009";	// 실제 버전
	var VERSION = "15002";		// 설정 내용 버전
	var P = {
	version : "",

	filter : 1,
	blockN : 1,
	blockNA : 1,
	blockNR : 0,
	allowStyle : 1,
	showLabel : 1,
	blockAN : "",
	allowAN : "",
	blockAT : "",
	allowAT : "",
	blockCN : "",
	allowCN : "",
	blockCT : "",
	allowCT : "",

	modTitle : 0,
	listTitle : "{G} - {P} 페이지",
	articleTitle : "{T} ({W}) - {G}",
	header : 1,
	title : 1,
	sidebar : 1,
	pageWidth : 1200,
	wide : 0,
	wideWidth : 900,
	listNumber : 1,
	listDate : 1,
	listCount : 1,
	listRecom : 1,
	listComment : 0,
	listTime : 1,
	menuList : "즐겨찾기||갤로그/구분선/이미지/베스트/개념글/구분선/설정/로그인",
	menuPos : "left",
	best : 1,
	linkList : "게시판@47\n김유식@yusik",

	page : 0,
	pageCount : 5,
	layerImage : 1,
	layerText : 1,
	layerComment : 1,
	layerThumb : 1,
	layerLink : 1,
	layerReply : 1,
	layerSingle : 1,
	layerResize : 1,
	albumInfScrl : 1,
	albumRealtime : 1,
	albumFullsize : 1,
	thumbWidth : 640,
	thumbHeight : 480,
	hide : 1,
	hideImg : 0,
	hideMov : 0,
	autoForm : 0,
	updUse : 1,
	updDev : 0,
	autoName : "",
	autoPassword : "",
	longExpires : 0,

	commentColor : 1,
	commentColorType : "gc",
	syncStore : 1,
	fontList : "Segoe UI, Meiryo UI, Malgun Gothic, Dotum, sans-serif"
	};

	// 기본 함수 및 상수, 변수
	var BROWSER = {};
	if(navigator.userAgent.indexOf("Firefox") !== -1) {
		BROWSER.firefox = true;
	} else if(navigator.userAgent.indexOf("Chrome") !== -1) {
		BROWSER.chrome = true;
		if(typeof chrome !=="undefined") {
			BROWSER.chrome = {};
			BROWSER.chrome.google=true;
			if(chrome.storage)
				BROWSER.chrome.storage=true;
		}
	} else if(navigator.userAgent.indexOf("Opera") !== -1) {
		BROWSER.opera = true;
	} else if(navigator.userAgent.indexOf("Trident") !== -1) {
		BROWSER.msie = true;
	} else if(navigator.userAgent.indexOf("iPhone") !== -1) {
		BROWSER.chrome = true;
		BROWSER.iphone = true;
		P.menuPos = 'top';
		P.header = P.sidebar = P.best = 0;
	} else if(navigator.userAgent.indexOf("AppleWebKit") !== -1) {
		BROWSER.chrome = true;
	} else {
		BROWSER = false;
		alert("디시라이트가 지원하지 않는 브라우저입니다.\n\n - 브라우저 타입이 지정되지 않음");
	}

	if (localStorage){
		BROWSER.localStorage = true; 
	}else{
		alert("디시라이트가 지원하지 않는 브라우저입니다.\n\n - 로컬 스토리지에 접근할 수 없거나 브라우저가 지원하지 않음");
	}

	var MODE = {};
	location.pathnameN = location.pathname.replace(/\/+$/, '');
	switch(location.pathnameN) {
	/*	case "/board/write":
			MODE.gall = true;
			MODE.write = true;
			break;
		case "/board/view":
			MODE.gall = true;
			MODE.article = true;
			break;
		case "/board/comment_view":
			MODE.gall = true;
			MODE.comment = true;
			break;*/
		case "/board/lists":
			MODE.gall = true;
			MODE.list = true;
			break;
		case "/singo/singo_write":
		case "/singo/singo_nonmember":
			MODE.gall = true;
			MODE.singo= true;
			document.title = "신고 게시물";
			break;
		case "/list.php":
			if(parseQuery(location.search).no)
				location.replace("http://"+location.innerhost+"/board/view/"+location.search);
			else
				location.replace("http://"+location.innerhost+"/board/lists/"+location.search);
			MODE = false;
			break;
		case "/options.html":
			if(location.protocol==="chrome-extension:") {
				MODE.settings=true;
				if(location.search=="?v2")
					MODE.settingsv2=true;
			}
			break;
		default:
			MODE = false;
			break;
	}

	if(location.host == "gallog.dcinside.com")
		MODE = false;

	if(parseQuery(location.search)["s_keyword"]) {
		MODE.search = true;
	}

	if(MODE!=false && MODE.gall) {
		var WINDOW = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
		var SCROLL = BROWSER.firefox || BROWSER.opera ? document.documentElement : document.body;
		var _ID = parseQuery(location.search).id; // 갤러리 id
		var _GID = $('#favorite_gallog_img')?$('#favorite_gallog_img').href.match(/http:\/\/gallog\.dcinside\.com\/(.+)$/):null; // 로그인 상태
			_GID = (_GID!=null?_GID[1]:false);
		var _RECOMM = (parseQuery(location.search).recommend==undefined?0:parseQuery(location.search).recommend); // 개념글
		if(MODE.write || MODE.singo || !$('.gallery_title embed'))
			GALLERY = document.title.replace(/ 갤러리$/,"");
		else
			GALLERY = decodeURIComponent($('.gallery_title embed').getAttribute("flashvars").match(/gallery_title=([^&]+)&/)[1]); // 갤러리(한글)
		var PAGE = Number(parseQuery(location.search).page) || 1;
	}

	var addStyle = typeof GM_addStyle!=='undefined'?GM_addStyle:
		function(css) {
			var parent = document.head || document.documentElement;
			var style = document.createElement("style");
			style.type = "text/css";
			var textNode = document.createTextNode(css);
			style.appendChild(textNode);
//			parent.insertBefore(style, document.head.childNodes[0]);
			parent.appendChild(style);
		};

	String.prototype.toDomElement = function () {
		var wrapper = document.createElement('div');
		wrapper.innerHTML = this;
		var df= document.createDocumentFragment();
		df.appendChild(wrapper);
	//	for (var i = 0; i < wrapper.children.length; i += 1) { df.appendChild(wrapper.children[i]); };
		return df;
	};

	var formWalk = function(form) {
		var data='';
		for(var i=(target=form.querySelectorAll('input,textarea')).length;i--;) {
			if(!target[i].name)continue;
			data+=encodeURIComponent(target[i].name) + '=' + encodeURIComponent(target[i].value) + '&';
		}
		return data;
	};

	var xmlhttpRequest = typeof GM_xmlhttpRequest!=='undefined'?GM_xmlhttpRequest:
		function(details) {
			var xmlhttp = new XMLHttpRequest();
			var binary = false;
			xmlhttp.ontimeout = function() { details.ontimeout(); };
			xmlhttp.onreadystatechange = function() {
				var responseState = {
					responseXML:(xmlhttp.readyState===4 ? xmlhttp.responseXML : ""),
					responseText:(xmlhttp.readyState===4 ? xmlhttp.responseText : ""),
					readyState:xmlhttp.readyState,
					responseHeaders:(xmlhttp.readyState===4 ? xmlhttp.getAllResponseHeaders() : ""),
					status:(xmlhttp.readyState===4 ? xmlhttp.status : 0),
					statusText:(xmlhttp.readyState===4 ? xmlhttp.statusText : "")
				};
				if(details.onreadystatechange) {
					details.onreadystatechange(responseState);
				}
				if(xmlhttp.readyState===4) {
					if(details.onload && xmlhttp.status>=200 && xmlhttp.status<300) {
						details.onload(responseState);
					}
					if(details.onerror && (xmlhttp.status<200 || xmlhttp.status>=300)) {
						details.onerror(responseState);
					}
				}
			};
			try {
				xmlhttp.open(details.method, details.url);
			} catch(e) {
				if( details.onerror ) {
					details.onerror({responseXML:"",responseText:"",readyState:4,responseHeaders:"",status:403,statusText:"Forbidden"});
				}
				return;
			}
			if(details.headers) {
				for(var prop in details.headers) {
					if(details.headers.hasOwnProperty(prop)) {
						xmlhttp.setRequestHeader(prop, details.headers[prop]);
						if(prop.toLowerCase() == 'content-type' && details.headers[prop].match(/multipart\/form-data/)) {
							binary = true;
						}
					}
				}
			}
			if(binary && typeof(details.data)!=="undefined")
				xmlhttp.sendAsBinary(details.data);
			else
				xmlhttp.send( (typeof(details.data)!=="undefined")?details.data:null );
		};

	function softLoad(url) {
		p_url = parseQuery(url);
		if(history.pushState && MODE.list) {
			history.pushState(location.toString(), '로드 중...', url);
			SCROLL.scrollTop = 0;

			if(p_url.id!=_ID) {
				_ID = p_url.id;
			}

			for(var i=0,l=P.page?P.pageCount:1;i<l;i+=1) {
				pageLoad(i);
			}
		}
		else
			location.href=url;
	}

	function setValue(name,value,type) {
		if(BROWSER.chrome && BROWSER.chrome.storage && P.syncStore) {
			chrome.storage.sync.set(JSON.parse('{"' + name + '":' + JSON.stringify(value) + '}'));
			return;
		}else if(BROWSER.localStorage && type === undefined) {
			if(typeof value === "boolean") {
				value = Number(value);
			}
			P[name] = value;
			localStorage.setItem(name, value);
			return;
		}

		if(typeof value === "boolean") {
			value = Number(value);
		}
		P[name] = value;

		var cookie = [];
		for(var i in P) {
			if(P.hasOwnProperty(i)) {
				cookie.push(i+"\b"+P[i]);
			}
		}
		cookie = escape(cookie.join("\b"));
		if(type=='text')
			return cookie;
		if(cookie.length > 4083) {
			alert("저장할 수 있는 값의 길이를 " + (cookie.length - 4083) + "자 초과하였습니다.");
			return;
		}
		document.cookie = "dcinsidelitesetting=" + cookie + ";expires=" + (new Date((new Date()).getTime() + 31536000000)).toGMTString() + ";path=/;";
	}
	var eRemove = BROWSER.firefox ?
		function(elem,type) { // firefox 에서는 removeAttribute로만 삭제 가능, elem.onclick = null 은 에러 발생
			elem.removeAttribute(type);
		}
		: function(elem,type) { // opera 에서는 removeAttribute로는 삭제 불가, chrome 는 둘다 가능
			elem[type] = null;
		};

	Array.prototype.contains = function(needle) {
		for(var i=0; i < this.length; i++) if(this[i] === needle) return true;
		return false;
	}

	function $(id,multi) {return (multi?document.querySelectorAll(id):document.querySelector(id));};
	function $id(id) {return document.getElementById(id);}
	function cElement(tag,insert,property,func) {
		var _DIRECT = ["className", "innerHTML", "textContent"];
		var element;
		if(!tag)
			element= document.createTextNode(property);
		else
			element= document.createElement(tag);
		if(insert) {
			var parent;
			var before = null;
			if(insert.constructor === Array) {
				var target = insert[1];
				if(typeof target === "number") {
					parent = insert[0];
					before = parent.childNodes[target];
				} else {
					before = insert[0];
					parent = before.parentNode;
					if(target === "next") {
						before = before.nextSibling;
					}
				}
			} else {
				parent = insert;
			}
			parent.insertBefore(element,before);
		}
		if(!tag)
			return element;
		if(property) {
			if(typeof property === "object") {
				for(var i in property) {
					if(property.hasOwnProperty(i)) {
						if(_DIRECT.contains(i))
							element[i] = property[i];
						else
							element.setAttribute(i, property[i]);
					}
				}
			} else {
				element.textContent = property;
			}
		}
		if(func) {
			element.addEventListener("click",func,false);
		}
		return element;
	}
	function simpleRequest(url,callback,method,headers,data,error) {
		var details = {method:method?method:"GET",url:url,timeout:3000,ontimeout:function() { console.log('Timeout! Retry...'); simpleRequest(url,callback,method,headers,data); }};
		if(callback) {
			details.onload = function(response){callback(response);};
		}
		if(headers) {
			details.headers = headers;
		}
		if(data) {
			details.data = data;
		}
		if(error) {
			details.onerror = error;
		}
		xmlhttpRequest(details);
	}
	function ePrevent(e) {
		e.stopPropagation();
		e.preventDefault();
	}
	function removeEventListenerAll(elem) {
		elem.parentNode.replaceChild(elem.cloneNode(true), elem);
	}
	function cSearch(elem,search) {
		return (new RegExp("(?:^|\\s+)"+search+"(?:\\s+|$)","")).test(elem.className);
	}
	function cAdd(elem,add) { // 다중 추가는 안함
		if(!cSearch(elem,add)) {
			elem.className += " " + add;
		}
	}
	function cRemove(elem,remove) {
		elem.className = elem.className.replace((new RegExp("(?:^|\\s+)"+remove+"(?:\\s+|$)","g"))," ");
	}
	function cSwitch(elem,remove,add) {
		cRemove(elem,remove);
		cAdd(elem,add);
	}
	function cToggle(elem,toggle) {
		if(cSearch(elem,toggle)) {
			cRemove(elem,toggle);
		} else {
			cAdd(elem,toggle);
		}
	}
	function ipColorize(ip) {
		var ipN = /(\d+)\.(\d+)/g.exec(ip);
		return "hsl(" + Math.floor(Math.abs(Math.sin(ipN[1]))*360) + "," + Math.floor(Math.abs(Math.sin(ipN[2]))*100) + "%," + (P.commentColorType=="bg"?"80%":"40%") + ")";
	}
	function parseQuery(str) {
		str = str.substr(str.indexOf("?")+1);
		str = str.split("&");
		var query = {};
		var split;
		for(var i=0,l=str.length ; i<l ; i+=1) {
			split = str[i].split("=");
			query[split[0]] = split[1];
		}
		return query;
	}
	function getScript(name) {
		var value;
		if(BROWSER.firefox || BROWSER.opera) {
			value = WINDOW[name];
		} else if(BROWSER.chrome){
			var div = document.createElement("div");
			div.style.cssText = "width:0 ; height:0 ; position:absolute ; overflow:hidden ; top:"+document.body.scrollTop+"px";
			div.innerHTML = "<input onfocus='this.value="+name+";' />";
			var input = div.firstChild;
			document.body.appendChild(div);
			input.focus();
			value = input.value;
			document.body.removeChild(div);
		}
		return value;
	}
	function getImgs(elem) {
		var preImgs = elem.getElementsByTagName("img");
		var imgs = [];
		var img;
		for(var i=0,l=preImgs.length ; i<l ; i+=1) {
			img = preImgs[i];
			if(img.src.indexOf("http://zzbang.dcinside.com/")===-1 && img.src.indexOf("http://wstatic.dcinside.com/")===-1) {
				imgs.push(img);
			}
		}
		return imgs;
	}
	function autoLink(o) {
		if(!o) {
			return;
		}
		var next = o.nextSibling;
		if(o.nodeType === 3) {
			var parent = o.parentNode;
			var value = o.nodeValue;
			var regexp = /(?:http|https|ftp|magnet):[^\s'"]+/ig;
			var index = 0;
			var exec;
			while( (exec=regexp.exec(value)) ) {
				if(index !== exec.index) {
					parent.insertBefore(document.createTextNode(value.substring(index,exec.index)),o);
				}
				cElement("a",[o,"prev"],{href:exec,target:"_blank",textContent:exec});
				index = regexp.lastIndex;
			}
			if(index !== 0) {
				if(index !== value.length) {
					parent.insertBefore(document.createTextNode(value.substr(index)),o);
				}
				parent.removeChild(o);
			}
		} else if(o.nodeType === 1 && o.nodeName !== "A") {
			autoLink(o.firstChild);
		}
		autoLink(next);
	}

	function getHost() {
		return window.location.toString().split('/')[2];
	}

	function removeElement(e) {
		return e.parentNode.removeChild(e);
	}

	var BASE64 = { // base64 (data:image/png;base64,)
		hideImg : "iVBORw0KGgoAAAANSUhEUgAAABkAAAAOCAYAAADaOrdAAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwMi8wNC8xMB87UF8AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAAeUlEQVQ4jdWUQQrAMAgE19K36pviZ9uTEESTluqhe8wio2sSAoAxxoUmiQhRJ8B0ZAYzg5lLIGdmqGoJIITM3c+gaCrzVx4QxKWq6RR27uFWE/khpEPpTt4oi7gUsrsky8Vb3jv5xfuaz4/RNxI19o+dPImTgP4P8gZSi0Fd9LSJoQAAAABJRU5ErkJggg==",
		hideMov : "iVBORw0KGgoAAAANSUhEUgAAABkAAAAOCAYAAADaOrdAAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwMi8wNC8xMB87UF8AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAAa0lEQVQ4je2UXQrAIAyDv46d1Z5JL7s9FYq2sME6GCwgaH9IY1AB6L0fFEFVRSoJDFs1wWsk+xxorS1FY4wl52O2j86QKLGiqNlWNEyGb3jiVUVX9QjJFSzGZ5h98BNbLlIB8D/GWxCo/yBPUnI0t18AzcEAAAAASUVORK5CYII=",
		hideOff : "iVBORw0KGgoAAAANSUhEUgAAABkAAAAOCAYAAADaOrdAAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwMi8wNC8xMB87UF8AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAAwUlEQVQ4jb2Uyw2DQAxEnxcoCdEENXDEtORC4EBngIRzIiKQ8Akk77Q7lj0jr7QCUJaliwi/wMwkVlUvioI0TUmS5Lbh4zjSNA2AB4Asy241AAghkOc5ALGIEEXR4WZVfZ7NbFcHiM+kU9XVgC1902Qr1TesTJap5obzu5m91Ob6rsk7psZlgE/6knDE5Cp/MVmta7nrOx6eqqr8V/R976rqwd1p25ZhGK4nntF1HXVdAyAAqupTcfoo3f1d72nMTB7e0azZRgjcWAAAAABJRU5ErkJggg==",
		viewAll : "iVBORw0KGgoAAAANSUhEUgAAAB4AAAARCAYAAADKZhx3AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNAay06AAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDUvMTCnhzc6AAAA6klEQVRIib2VQQqEMAxFU/FGTXpSV+48godwl+uICsKfxaDUErU6Og8EU2yTfPPVERF57+Gco3+hqo5EBG3bYpomvM08z6jrGswMF0JA13VUluVaETOTqm7ipOLddWtvHBMRhRCoBLBJeiCPeUga51Lc2hXBzOuVrh9hthp3Z3WZPmsVc8a5xjfYm4GYXanTbpdDLEktqeMCTETkdRuliAiyhytneHLe7UJW4njQnuJnO72WOB6wJ7vOstOTEl9KvPfdju8t71p2GoZh3YymaTCO4+s26vseVVV9/07eeyqKAteEug8AUlX3AQ6usNTFNBFLAAAAAElFTkSuQmCC",
		hideAll : "iVBORw0KGgoAAAANSUhEUgAAAB4AAAARCAYAAADKZhx3AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNAay06AAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDUvMTCnhzc6AAAA5UlEQVRIicWVMQ6DMAxFnSg3ip2TMrFxBA7B5usgQEL6HVoQRKEkLbRviozg2992MERE3nsYY+hXqKohEUHbtpimCXczzzPqugYzw4QQ0HUdOefWjJiZVHV3ZuZtxuuzd7FtfEsIgRyAnegbe3YJpQSXc0os5lAxzryElBPZwkfW5ZBTsS3+6kWcN/fFUnnc5yWeisXxHSJy+xrFiAiyrY57nep9yTxkCad2+Vv+NlynwvHFcFXVWVN9pcVFwkerknt/bxmGYX0ZTdNgHMfb16jve1RV9fw7ee/JWosyoz4HAKmqeQBQB60uBTy2vgAAAABJRU5ErkJggg==",
		bestIcon : "iVBORw0KGgoAAAANSUhEUgAAAAIAAAADAQMAAACDJEzCAAAAA3NCSVQICAjb4U/gAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADA0LzA4LzEwNj3a3QAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNAay06AAAAAOSURBVAiZY3BgaGBwAAADBgEB/Jz9DgAAAABJRU5ErkJggg==",
		dialogClose :
		"iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAAUklEQVR4XqXPYQrAIAhAYW/gXd8NJxTopVqsGEhtf+L9/ERU2k/HSMFQpKcYJeNFI9Be0LCMij8cYyjj5EHIivGBkwLfrbX3IF8PqumVmnDpEG+eDsKibPG2JwAAAABJRU5ErkJggg==",
		dialogClose_H :
		"iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAAnUlEQVR4XoWQQQ6CQAxFewjkJkMCyXgJPMk7AiYczyBeZEAX6AKctGIaN+bt+trk9wtGQc/IkhnoKGxqqiWxOSZalapWFZ6VrIUDExsN0a5JRBq9LoVOR0eEQMoEhKizXhhsn0p1sCWVo7CwOf1RytPL8CPvwuBUoHL6ugeK30CVD1TqK7V/hdpe+VNChhOzV8xWny/+xosHF8578W/Hmc1OOC3wmwAAAABJRU5ErkJggg==",
		transparentBg :
		"iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAABGdBTUEAALGPC/xhBQAAAAZQTFRF8PDwAAAAfqfmLAAAAAJ0Uk5TzAAR3FV6AAAAFElEQVQI12NgsP/AQAz+f4CBGAwAJIIdTTn0+w0AAAAASUVORK5CYII=",

		viewerPrev :
		"R0lGODdhHgAeAMIAAP///wAAAMzMzJmZmWZmZjMzM////////ywAAAAAHgAeAAADXQi63P4wyulGoViNwPPcXOc9YBgIY1OGaLqsXOsC8DlrZnzTuX3XMletRyzyisikIMksDptJAAFKDeCqzFdPwO16v19GbafNkRVT83l8TpvOx/c6F/yx4Lg6fj9LAAA7",
		viewerNext :
		"R0lGODdhHgAeAMIAAP///wAAAMzMzJmZmTMzM2ZmZv///////ywAAAAAHgAeAAADWgi63P4wyhlFGDQDG66WXOd9kChi5GN2RaquqMuso7zQsQ3gjOD/wCBwwFPQjshicpnEMJ84qLQTmi6d1quu2smluDUX2Esab2mCM0xtIqfWuls33iC46XhXAgA7",
		viewerZoomin :
		"R0lGODdhHgAeAIAAAP///wAAACwAAAAAHgAeAAACQYSPEMubD1FrsabJrFY4bNt5XxSOZGdCZXqhrOS+xlqF9o3n+s73/g8MCoc8DU12fCVZy1TT9BxFP9NN1RhDZiEFADs=",
		viewerZoomout :
		"R0lGODdhHgAeAIAAAP///wAAACwAAAAAHgAeAAACKYSPqcvtD6OctNqLs968pwCG4kiW5omm6sq27gvH8nx69o3n+s73flcAADs=",
		viewerRotateL :
		"R0lGODdhHgAeAMIAAP///wAAADMzM8zMzGZmZpmZmf///////ywAAAAAHgAeAAADgwi63P4wyukGESEHUQatWhgK3gdgYpoRn+pmwvTOMYSmAnG5LJiWjILqgZMUgynKj0EQASPCUIFx23wGop4iaxLlZplJNQCIqmqSsaI5VI4WbA1aFtIC4nOJOTNF5o1OFSYAR4NISYZrYxp2Jlguf1eQiQuPXJQKljBPlI8cnJihogsJADs=",
		viewerRotateR :
		"R0lGODdhHgAeAMIAAP///wAAADMzM8zMzGZmZpmZmf///////ywAAAAAHgAeAAADggi63P4wyqlGESEHQQZ1A6aNmvcBBKlqwieu8PTCMZSuHDGP7bMWoJWJsQtIio2BiqICLgokp0Q5IjBumtOsp1h+sBkGiQuhacAbSlED9E5gVhTp1HxGtWwGdXQCZKQLSCdDej99D2gscYcKaxmEh46Qh4kBk4chJJeMFiKbjKChJwkAOw==",
		viewerClose :
		"R0lGODdhHgAeAIAAAP///wAAACwAAAAAHgAeAAACOoSPqcvtD6OcJtiLs85o+2914IiJJGmeYKp61AvHMttqdF0e+HfvQb+bCYdEIM5YQ7aUKuapCI1KKQUAOw==",
	};

	// 환경 설정
	var SET = {
	call : function() {
		if(!$id("DCL_set_wrap")) {
			var dclset={};

			if(!MODE.settingsv2) {
				addStyle(
					"div.DCL_set_wrap { top: 50%; left: 50%; margin-top: -330px; margin-left: -320px; width: 640px; height: 660px; }" +
					"div.DCL_set_wrap > div.body { overflow-y: scroll; height:570px; }" +

					"div.DCL_set_wrap button, " +
					"div.DCL_set_wrap input[type=button], " +
					"div.DCL_set_wrap select, " +
					"div.DCL_set_wrap input[type=submit] { padding: 2px 15px; border-radius: 2px; background-image: linear-gradient(0deg, #dedede, #ededed); box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.75); border: 1px solid rgba(0, 0, 0, 0.25); text-shadow: 0 1px 0 rgb(240, 240, 240); color: #444; outline: none; margin: 0 4px 0 0; }" +

					"div.DCL_set_wrap input[type=text]," +
					"div.DCL_set_wrap input[type=number] { border: 1px solid #CCC; cursor: auto; outline: none; border-radius: 2px; padding: 2px 5px; margin: 0 4px 0 0; }" +

					"div.DCL_set_wrap button:hover, " +
					"div.DCL_set_wrap input[type=button]:hover, " +
					"div.DCL_set_wrap select:hover, " +
					"div.DCL_set_wrap input[type=submit]:hover, " +
					"div.DCL_set_wrap input[type=text]:hover, " +
					"div.DCL_set_wrap input[type=number]:hover { border: 1px solid rgba(0, 0, 0, 0.45); }" +

					"div.DCL_set_wrap button:focus, " +
					"div.DCL_set_wrap input[type=button]:focus, " +
					"div.DCL_set_wrap select:focus, " +
					"div.DCL_set_wrap input[type=submit]:focus, " +
					"div.DCL_set_wrap input[type=text]:focus," +
					"div.DCL_set_wrap input[type=number]:focus { border: 1px solid #09E; }" +
					""
				);
				dclset.bg = cElement("div", document.body, {id:"DCL_set_bg"}, SET.close);
				dclset.wrap = cElement("div", document.body, {id:"DCL_set_wrap", className:"DCL_set_wrap"});
				dclset.head = cElement("div", dclset.wrap, {className:"head"});
					cElement("button", dclset.head, {textContent:"닫기"}, SET.close);
					cElement("h2", dclset.head, {textContent:"디시라이트 설정"});
			}
			else {
				addStyle(
					"html,body { margin: 0px; overflow: hidden; }" +
					"div#DCL_set:before { margin-top: 10px; content: ''; display: block; }" +
					"div.DCL_set_wrap { position: static; top: auto; left: auto; margin: 0; padding: 0; width: 640px; height: 540px; box-shadow: none; border-radius: 0px; }" +
					"div.DCL_set_wrap > div.body { overflow-y: scroll; height: 500px; }" +
					"div.DCL_set_wrap select { padding-right: 20px; }" + 

					"div.DCL_set_wrap button, " +
					"div.DCL_set_wrap input[type=button], " +
					"div.DCL_set_wrap select, " +
					"div.DCL_set_wrap input[type=submit] { padding: 2px 15px; margin: 0 4px 0 0; }" +

					"div.DCL_set_wrap input[type=text]," +
					"div.DCL_set_wrap input[type=number] { padding: 2px 5px; margin: 0 4px 0 0; }" +
					""
				);
				dclset.wrap = cElement("div", document.body, {id:"DCL_set_wrap", className:"DCL_set_wrap"});
			}
				addStyle(
					"div#DCL_set_bg { position: fixed; left: 0; right: 0; bottom: 0; top: 0; background-color: white; opacity: .6; z-index: 101; }" +
					"div.DCL_set_wrap,"+
					"div.DCL_set_mdi { box-shadow: 0 4px 23px 5px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0,0,0,0.15); border-radius: 3px; background-color:rgba(255,255,255,.9); }" +
					"div.DCL_set_wrap {z-index: 102; position: fixed; }" +

					"div.DCL_set_wrap > div.head > button," +
					"div.DCL_set_mdi > div.head > button {height: 14px; width: 14px; float: right; border: 0; border-radius: 7px; margin: 10px 10px; font-size: 0px; background:url('data:image/png;base64,"+BASE64.dialogClose+"'); padding: 0; box-shadow: none; text-shadow: none; }" +
					"div.DCL_set_wrap > div.head > button:hover," +
					"div.DCL_set_mdi > div.head > button:hover{ background:url('data:image/png;base64,"+BASE64.dialogClose_H+"'); }" + 
					"div.DCL_set_wrap > div.head > h2," +
					"div.DCL_set_mdi > div.head > h2{ padding:10px 20px; font-weight: normal; font-size: 120%;}" +

					"div.DCL_set_wrap * { cursor: default; margin:0 ; padding:0 ; font-size: 12px; line-height:1.6em ; font-family: " + P.fontList + "; vertical-align:middle}" +
					"div.DCL_set_wrap textarea { border: 1px solid #CCC; cursor: auto; font-family: monospace; outline: none; }" +

					"div.DCL_set_wrap > div.foot > input[type=submit]," +
					"div.DCL_set_mdi > div.foot > input[type=submit] { float: right; margin: 10px 15px; }" +
					"div.DCL_set_wrap ::selection { background: inherit; }" +

					"div#DCL_set_mdibg { z-index: 103; position: fixed; left: 0; right: 0; bottom: 0; top: 0; background-color: white; opacity: .6; }" +
					"div.DCL_set_mdi { z-index: 104; position: fixed; top: 50%; left: 50%; margin-top: -173px; margin-left: -270px; height: 346px; width: 540px; display: none; }" +
					"div.DCL_set_mdi > div.body { height:257px; padding: 0 20px; overflow: hidden; }" +
					"div.DCL_set_mdi > div.body div#linkList { height: 100%; width: 100% }" +
					"div.DCL_set_mdi > div.body div#linkList > textarea { height: 198px; width: 100%; border-radius: 2px 0 0 2px; }" +
					"div.DCL_set_mdi > div.filter div[id^=textbox] { height: 190px; }" +
					"div.DCL_set_mdi > div.filter div[id^=textbox] > textarea { overflow-y: scroll; height: 100%; width: 249px; resize: none; }" +
					"div.DCL_set_mdi > div.filter div[id^=textbox] > textarea:first-of-type { width:50%; box-sizing: border-box; border-radius: 2px 0 0 2px; }" +
					"div.DCL_set_mdi > div.filter div[id^=textbox] > textarea:nth-of-type(2) { border-left: none; border-radius: 0 2px 2px 0; }" +
					"div.DCL_set_mdi > div.filter div#textboxAT," +
					"div.DCL_set_mdi > div.filter div#textboxCN," +
					"div.DCL_set_mdi > div.filter div#textboxCT { display: none; }" +
					"div.DCL_set_mdi > div.filter div#info { height: 20px; }" +
					"div.DCL_set_mdi > div.filter div#info > span { display: inline-block; font-weight: bold; width: 50%; }" +
					"div.DCL_set_mdi > div.tooltip { display: none; position: absolute; z-index: 1; background-color: white; padding: 10px 20px; border-radius: 3px; box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 4px 0px; }" +
					"div.DCL_set_mdi > div.tooltip:before { content: ''; position: absolute; left: 18px; top: -10px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 10px solid rgba(0, 0, 0, 0.1); z-index: 0; }" +
					"div.DCL_set_mdi > div.tooltip > div:first-of-type { position: absolute; left: 19px; top: -9px; width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent; border-bottom: 9px solid white; z-index: 1; }" +
					"div.DCL_set_mdi > div.tooltip .bold { font-weight: bold; }" +

					"div#DCL_set > div { margin: 0 20px 10px 20px; }" +
					"div#DCL_set > div > h3 { font-size: 120%; font-weight: normal; }" +
					"div#DCL_set > div ul > li { padding: 5px 0 5px 28px; }" +
					"div#DCL_set > div ul > li.info + li { padding-top: 0; }" +
					"div#DCL_set > div ul > li.disabled { color: gray; }" +

					"div#DCL_set > div input[type=text]::-webkit-input-placeholder, " +
					"div#DCL_set > div input[type=text]:-moz-placeholder { color:black; }" +
					"div#DCL_set > div input[type=text].number { text-align: right; }" +
						
					"div#DCL_set > div:first-of-type > ul:first-of-type.disabled { height: 55px; overflow: hidden; }" +
					"div#DCL_set > div a { cursor: auto; text-decoration: underline; color: blue; }" +
					"div#DCL_set > div div.small { font-size: 10px; }" +
					"div#DCL_set > div div.br { font-size: 10px; margin-top: 12px; }" +
					"div#DCL_set > div div.copyable { cursor:auto; }" +
					"div#DCL_set > div div.copyable::selection," +
					"div#DCL_set > div input::selection," +
					"div#DCL_set > div textarea::selection" + "{ background: #0BF; color: white; }" +
					"");

			dclset.body = cElement("div", dclset.wrap, {id:"DCL_set", className:"body"});
			dclset.body.mdibg = cElement("div", dclset.body, {id:"DCL_set_mdibg"});
			dclset.body.mdibg.style.display="none";

			dclset.body.filter = cElement("div", dclset.body);
			cElement("h3", dclset.body.filter, "필터");
			dclset.body.filter.innerList = cElement("ul", dclset.body.filter);
				dclset.body.filter.innerList.info = cElement("li", dclset.body.filter.innerList, {textContent:"미리 설정한 조건에 맞는 게시물을 보이지 않게 할 수 있습니다.", className:"info"});
				dclset.body.filter.innerList.filter = cElement("li", dclset.body.filter.innerList);
				cElement("input", dclset.body.filter.innerList.filter, {type:"checkbox", id:"DCL_filter"});
				cElement("label", dclset.body.filter.innerList.filter, {"for":"DCL_filter",textContent:"필터 사용"});
				
				dclset.body.filter.innerList.blockN = cElement("li", dclset.body.filter.innerList);
				cElement("input", dclset.body.filter.innerList.blockN, {type:"checkbox", id:"DCL_blockN"});
				cElement("label", dclset.body.filter.innerList.blockN, {"for":"DCL_blockN",textContent:"공지 차단"});
					dclset.body.filter.innerList.blockN.innerList = cElement("ul", dclset.body.filter.innerList.blockN);
					dclset.body.filter.innerList.blockN.innerList.blockNA = cElement("li", dclset.body.filter.innerList.blockN.innerList);
					cElement("input", dclset.body.filter.innerList.blockN.innerList.blockNA, {type:"checkbox", id:"DCL_blockNA"});
					cElement("label", dclset.body.filter.innerList.blockN.innerList.blockNA, {"for":"DCL_blockNA",textContent:"운영자 공지만 차단"});
					dclset.body.filter.innerList.blockN.innerList.blockNR = cElement("li", dclset.body.filter.innerList.blockN.innerList);
					cElement("input", dclset.body.filter.innerList.blockN.innerList.blockNR, {type:"text", placeholder:"0", class:"number", id:"DCL_blockNR","size":"2"});
					cElement("label", dclset.body.filter.innerList.blockN.innerList.blockNR, {"for":"DCL_blockNR",textContent:"일 이내 공지 표시"});
					
				dclset.body.filter.innerList.allowStyle = cElement("li", dclset.body.filter.innerList);
				cElement("input", dclset.body.filter.innerList.allowStyle, {type:"checkbox", id:"DCL_allowStyle"});
				cElement("label", dclset.body.filter.innerList.allowStyle, {"for":"DCL_allowStyle",textContent:"예외 단어 강조"});
				dclset.body.filter.innerList.showLabel = cElement("li", dclset.body.filter.innerList);
				cElement("input", dclset.body.filter.innerList.showLabel, {type:"checkbox", id:"DCL_showLabel"});
				cElement("label", dclset.body.filter.innerList.showLabel, {"for":"DCL_showLabel",textContent:"차단된 사용자 표시"});
				dclset.body.filter.innerList.filterPattern = cElement("li", dclset.body.filter.innerList);
				cElement("input", dclset.body.filter.innerList.filterPattern, {type:"button", value:"필터 패턴 관리..."}, function() { dclset.body.filter.mdiwrap.style.display=dclset.body.mdibg.style.display="block"; });

				dclset.body.filter.mdiwrap = cElement("div", dclset.body.filter, {className:"DCL_set_mdi"});
				dclset.body.filter.mdihead = cElement("div", dclset.body.filter.mdiwrap, {className:"head"});
					cElement("button", dclset.body.filter.mdihead, {textContent:"닫기"}, function() { dclset.body.filter.mdiwrap.style.display=dclset.body.mdibg.style.display="none"; });
					cElement("h2", dclset.body.filter.mdihead, {textContent:"필터 패턴 관리"});
				dclset.body.filter.mdibody = cElement("div", dclset.body.filter.mdiwrap, {className:"body filter"});
				dclset.body.filter.mdibody.selector = cElement("select", cElement("div", dclset.body.filter.mdibody));
					cElement("option", dclset.body.filter.mdibody.selector, {value:"0",textContent:"게시물 작성자"});
					cElement("option", dclset.body.filter.mdibody.selector, {value:"1",textContent:"게시물 제목"});
					cElement("option", dclset.body.filter.mdibody.selector, {value:"2",textContent:"댓글 작성자"});
					cElement("option", dclset.body.filter.mdibody.selector, {value:"3",textContent:"댓글 내용"});
					dclset.body.filter.mdibody.info = cElement("div", dclset.body.filter.mdibody, {id:"info"});
					cElement("span", dclset.body.filter.mdibody.info, "차단");
					cElement("span", dclset.body.filter.mdibody.info, "허용");
					dclset.body.filter.mdibody.textbox=new Array();
					dclset.body.filter.mdibody.textbox[0] = cElement("div", dclset.body.filter.mdibody, {id:"textboxAN"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[0], {id:"DCL_blockAN"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[0], {id:"DCL_allowAN"});
					dclset.body.filter.mdibody.textbox[1] = cElement("div", dclset.body.filter.mdibody, {id:"textboxAT"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[1], {id:"DCL_blockAT"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[1], {id:"DCL_allowAT"});
					dclset.body.filter.mdibody.textbox[2] = cElement("div", dclset.body.filter.mdibody, {id:"textboxCN"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[2], {id:"DCL_blockCN"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[2], {id:"DCL_allowCN"});
					dclset.body.filter.mdibody.textbox[3] = cElement("div", dclset.body.filter.mdibody, {id:"textboxCT"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[3], {id:"DCL_blockCT"});
					cElement("textarea", dclset.body.filter.mdibody.textbox[3], {id:"DCL_allowCT"});
					dclset.body.filter.mdibody.help = cElement("div", dclset.body.filter.mdibody);
					dclset.body.filter.mdibody.help.button = cElement("a", dclset.body.filter.mdibody.help, {href:"",textContent:"도움말..."},ePrevent);
					dclset.body.filter.mdibody.help.button.addEventListener("mousemove", function() { dclset.body.filter.tooltip.style.display="block"; });
					dclset.body.filter.mdibody.help.button.addEventListener("mouseout", function() { dclset.body.filter.tooltip.style.display=""; });
				dclset.body.filter.tooltip = cElement("div", dclset.body.filter.mdiwrap, {className:"tooltip",style:"left: 10px; margin-top: 5px;"});
					cElement("div", dclset.body.filter.tooltip);
					cElement("div", dclset.body.filter.tooltip, {className:"bold",textContent:"특수 패턴 문자"});
					cElement("div", dclset.body.filter.tooltip, {textContent:"\\ : 이스케이프 문자"});
					cElement("div", dclset.body.filter.tooltip, {textContent:"* : 와일드카드 (0문자 이상)"});
					cElement("div", dclset.body.filter.tooltip, {textContent:"+ : 와일드카드 (1문자 이상)"});
					cElement("div", dclset.body.filter.tooltip, {textContent:"? : 와일드카드 (0문자 또는 1문자)"});
					cElement("div", dclset.body.filter.tooltip, {textContent:"#(null) : 비회원"});
					cElement("div", dclset.body.filter.tooltip, {textContent:"#갤로그ID : 특정 갤로거"});
				dclset.body.filter.mdifoot = cElement("div", dclset.body.filter.mdiwrap, {className:"foot"});
					cElement("input", dclset.body.filter.mdifoot, {type:"submit", value:"닫기"}, function() { dclset.body.filter.mdiwrap.style.display=dclset.body.mdibg.style.display="none"; });

				dclset.body.filter.mdibody.selector.addEventListener("change", function() {
					for(i=0;dclset.body.filter.mdibody.textbox[i];i++) {
						if(i==dclset.body.filter.mdibody.selector.value)
							dclset.body.filter.mdibody.textbox[i].style.display="block";
						else
							dclset.body.filter.mdibody.textbox[i].style.display="none";
					}
				});
			dclset.body.layout = cElement("div", dclset.body);
			cElement("h3", dclset.body.layout, "레이아웃 변경");
			dclset.body.layout.innerList = cElement("ul", dclset.body.layout);
				dclset.body.layout.innerList.info = cElement("li", dclset.body.layout.innerList);
				cElement("div", dclset.body.layout.innerList.info, "페이지 레이아웃을 변형해서 목록을 보기 쉽게 합니다.");
				dclset.body.layout.innerList.pageWidth = cElement("li", dclset.body.layout.innerList);
				cElement("label", dclset.body.layout.innerList.pageWidth, {"for":"DCL_pageWidth", textContent:"페이지 폭"});
				cElement("input", dclset.body.layout.innerList.pageWidth, {type:"text", id:"DCL_pageWidth", className:"number", size:"4"});
				cElement(null, dclset.body.layout.innerList.pageWidth, "px");
				dclset.body.layout.innerList.header = cElement("li", dclset.body.layout.innerList);
				cElement("input", dclset.body.layout.innerList.header, {type:"checkbox", id:"DCL_header"});
				cElement("label", dclset.body.layout.innerList.header, {"for":"DCL_header",textContent:"상단 메뉴 표시"});
				dclset.body.layout.innerList.kanban = cElement("li", dclset.body.layout.innerList);
				cElement("input", dclset.body.layout.innerList.kanban, {type:"checkbox", id:"DCL_title"});
				cElement("label", dclset.body.layout.innerList.kanban, {"for":"DCL_title",textContent:"갤러리 타이틀 표시"});
				dclset.body.layout.innerList.sidebar = cElement("li", dclset.body.layout.innerList);
				cElement("input", dclset.body.layout.innerList.sidebar, {type:"checkbox", id:"DCL_sidebar"});
				cElement("label", dclset.body.layout.innerList.sidebar, {"for":"DCL_sidebar",textContent:"사이드바 표시"});
				dclset.body.layout.innerList.best = cElement("li", dclset.body.layout.innerList);
				cElement("input", dclset.body.layout.innerList.best, {type:"checkbox", id:"DCL_best"});
				cElement("label", dclset.body.layout.innerList.best, {"for":"DCL_best",textContent:"갤러리 박스 표시"});

			dclset.body.wideLayout = cElement("div", dclset.body);
			cElement("h3", dclset.body.wideLayout, "와이드 레이아웃");
			dclset.body.wideLayout.innerList = cElement("ul", dclset.body.wideLayout);
			dclset.body.wideLayout.innerList.info = cElement("li", dclset.body.wideLayout.innerList);
			cElement("div", dclset.body.wideLayout.innerList.info, "본문 영역을 오른쪽에 표시하여 화면을 넓게 사용합니다.");
			dclset.body.wideLayout.innerList.wide = cElement("li", dclset.body.wideLayout.innerList);
			cElement("input", dclset.body.wideLayout.innerList.wide, {type:"checkbox", id:"DCL_wide"});
			cElement("label", dclset.body.wideLayout.innerList.wide, {"for":"DCL_wide",textContent:"와이드 레이아웃 사용"});
			dclset.body.wideLayout.innerList.wideWidth = cElement("li", dclset.body.wideLayout.innerList);
			cElement("label", dclset.body.wideLayout.innerList.wideWidth, {"for":"DCL_wideWidth", textContent:"본문 폭"});
			cElement("input", dclset.body.wideLayout.innerList.wideWidth, {type:"text", id:"DCL_wideWidth", className:"number", size:"4"});
			cElement(null, dclset.body.wideLayout.innerList.wideWidth, "px");

			dclset.body.pageTitle = cElement("div", dclset.body);
			cElement("h3", dclset.body.pageTitle, "페이지 제목 변경");
			dclset.body.pageTitle.innerList = cElement("ul", dclset.body.pageTitle);
				dclset.body.pageTitle.innerList.info = cElement("li", dclset.body.pageTitle.innerList);
				cElement("div", dclset.body.pageTitle.innerList.info, "페이지 제목을 변경합니다.");
				cElement("div", dclset.body.pageTitle.innerList.info, "{G} : 갤러리 이름 {P} : 페이지 {T} : 게시물 제목 {W} : 작성자");
				dclset.body.pageTitle.innerList.modTitle = cElement("li", dclset.body.pageTitle.innerList);
				cElement("input", dclset.body.pageTitle.innerList.modTitle, {type:"checkbox", id:"DCL_modTitle"});
				cElement("label", dclset.body.pageTitle.innerList.modTitle, {"for":"DCL_modTitle",textContent:"페이지 제목 변경"});
				dclset.body.pageTitle.innerList.modTitle.innerList = cElement("ul", dclset.body.pageTitle.innerList.modTitle);
					dclset.body.pageTitle.innerList.modTitle.innerList.listTitle = cElement("li", dclset.body.pageTitle.innerList.modTitle.innerList);
					cElement("label", dclset.body.pageTitle.innerList.modTitle.innerList.listTitle, {"for":"DCL_listTitle",textContent:"목록"});
					cElement("input", dclset.body.pageTitle.innerList.modTitle.innerList.listTitle, {type:"text", id:"DCL_listTitle", placeholder:"{G} - {P} 페이지"});
					dclset.body.pageTitle.innerList.modTitle.innerList.articleTitle = cElement("li", dclset.body.pageTitle.innerList.modTitle.innerList);
					cElement("label", dclset.body.pageTitle.innerList.modTitle.innerList.articleTitle, {"for":"DCL_articleTitle",textContent:"본문"});
					cElement("input", dclset.body.pageTitle.innerList.modTitle.innerList.articleTitle, {type:"text", id:"DCL_articleTitle", placeholder:"{T} ({W}) - {G} 페이지"});

			dclset.body.listSet = cElement("div", dclset.body);
			cElement("h3", dclset.body.listSet, "목록 양식");
			dclset.body.listSet.innerList = cElement("ul", dclset.body.listSet);
				dclset.body.listSet.innerList.info = cElement("li", dclset.body.listSet.innerList);
				cElement("div", dclset.body.listSet.innerList.info, "목록에 표시할 항목을 선택합니다.");
				dclset.body.listSet.innerList.listNumber = cElement("li", dclset.body.listSet.innerList);
				cElement("input", dclset.body.listSet.innerList.listNumber, {type:"checkbox", id:"DCL_listNumber"});
				cElement("label", dclset.body.listSet.innerList.listNumber, {"for":"DCL_listNumber",textContent:"게시물 번호"});
				dclset.body.listSet.innerList.listDate = cElement("li", dclset.body.listSet.innerList);
				cElement("input", dclset.body.listSet.innerList.listDate, {type:"checkbox", id:"DCL_listDate"});
				cElement("label", dclset.body.listSet.innerList.listDate, {"for":"DCL_listDate",textContent:"날짜"});
				dclset.body.listSet.innerList.listTime = cElement("li", dclset.body.listSet.innerList);
				cElement("input", dclset.body.listSet.innerList.listTime, {type:"checkbox", id:"DCL_listTime"});
				cElement("label", dclset.body.listSet.innerList.listTime, {"for":"DCL_listTime",textContent:"날짜 옆에 시간도 표시"});
				dclset.body.listSet.innerList.listCount = cElement("li", dclset.body.listSet.innerList);
				cElement("input", dclset.body.listSet.innerList.listCount, {type:"checkbox", id:"DCL_listCount"});
				cElement("label", dclset.body.listSet.innerList.listCount, {"for":"DCL_listCount",textContent:"조회수"});
				dclset.body.listSet.innerList.listRecom = cElement("li", dclset.body.listSet.innerList);
				cElement("input", dclset.body.listSet.innerList.listRecom, {type:"checkbox", id:"DCL_listRecom"});
				cElement("label", dclset.body.listSet.innerList.listRecom, {"for":"DCL_listRecom",textContent:"추천수"});
				dclset.body.listSet.innerList.listComment = cElement("li", dclset.body.listSet.innerList);
				cElement("input", dclset.body.listSet.innerList.listComment, {type:"checkbox", id:"DCL_listComment"});
				cElement("label", dclset.body.listSet.innerList.listComment, {"for":"DCL_listComment",textContent:"댓글이 없을 때도 댓글 수를 표시"});

			dclset.body.commentSet = cElement("div", dclset.body);
			cElement("h3", dclset.body.commentSet, "댓글");
			dclset.body.commentSet.innerList = cElement("ul", dclset.body.commentSet);
				//dclset.body.commentSet.innerList.info = cElement("li", dclset.body.commentSet.innerList);
				//cElement("div", dclset.body.commentSet.innerList.info, "댓글과 관련된 설정");  commentColorType
				dclset.body.commentSet.innerList.commentColor = cElement("li", dclset.body.commentSet.innerList);
				cElement("input", dclset.body.commentSet.innerList.commentColor, {type:"checkbox", id:"DCL_commentColor"});
				cElement("label", dclset.body.commentSet.innerList.commentColor, {"for":"DCL_commentColor",textContent:"유동닉 색상 사용"});
				dclset.body.commentSet.innerList.commentColorType = cElement("li", dclset.body.commentSet.innerList);
				cElement("label", dclset.body.commentSet.innerList.commentColorType, {"for":"DCL_commentColorType", textContent:"변경할 색상: "});
				dclset.body.commentSet.innerList.commentColorType.selector = cElement("select", dclset.body.commentSet.innerList.commentColorType, {id:"DCL_commentColorType"});
					cElement("option", dclset.body.commentSet.innerList.commentColorType.selector, {id:"DCL_commentColorForg",value:"fg",textContent:"글자색"});
					cElement("option", dclset.body.commentSet.innerList.commentColorType.selector, {id:"DCL_commentColorBacg",value:"bg",textContent:"배경색"});
					cElement("option", dclset.body.commentSet.innerList.commentColorType.selector, {id:"DCL_commentColorGcon",value:"gc",textContent:"갤러콘"});

			dclset.body.menuSet = cElement("div", dclset.body);
			cElement("h3", dclset.body.menuSet, "메뉴");
			dclset.body.menuSet.innerList = cElement("ul", dclset.body.menuSet);
				dclset.body.menuSet.innerList.info = cElement("li", dclset.body.menuSet.innerList);
				cElement("div", dclset.body.menuSet.innerList.info, "메뉴의 위치와 표시할 항목을 선택하고 순서를 바꿉니다.");
				dclset.body.menuSet.innerList.menu = cElement("li", dclset.body.menuSet.innerList);
				dclset.body.menuSet.innerList.menu.selector = cElement("select", dclset.body.menuSet.innerList.menu, {id:"DCL_menuPos"});
					cElement("option", dclset.body.menuSet.innerList.menu.selector, {id:"DCL_menuPosTop",value:"top",textContent:"위쪽"});
					cElement("option", dclset.body.menuSet.innerList.menu.selector, {id:"DCL_menuPosLeft",value:"left",textContent:"왼쪽"});
				cElement("input", dclset.body.menuSet.innerList.menu, {type:"text", id:"DCL_menuList", "size":"23"});
				cElement("input", dclset.body.menuSet.innerList.menu, {type:"button", value:"즐겨찾기 링크 관리..."}, function() { dclset.body.menuSet.mdiwrap.style.display=dclset.body.mdibg.style.display="block"; });
				
				dclset.body.menuSet.mdiwrap = cElement("div", dclset.body.menuSet, {className:"DCL_set_mdi"});
				dclset.body.menuSet.mdihead = cElement("div", dclset.body.menuSet.mdiwrap, {className:"head"});
					cElement("button", dclset.body.menuSet.mdihead, {textContent:"닫기"}, function() { dclset.body.menuSet.mdiwrap.style.display=dclset.body.mdibg.style.display="none"; });
					cElement("h2", dclset.body.menuSet.mdihead, {textContent:"즐겨찾기 링크 관리"});
				dclset.body.menuSet.mdibody = cElement("div", dclset.body.menuSet.mdiwrap, {className:"body"});
					dclset.body.menuSet.mdibody.info = cElement("div", dclset.body.menuSet.mdibody);
					cElement("label", dclset.body.menuSet.mdibody.info, {for:"DCL_linkList", innerHTML:"자주 가는 갤러리나 웹 사이트를 등록하여 메뉴에 링크를 생성합니다.<br />표시 이름@갤러리 주소 or http:// 주소<br />표시 이름@@갤러리 주소 or http:// 주소 (새 창에 열기)"});
					dclset.body.menuSet.mdibody.linkList = cElement("div", dclset.body.menuSet.mdibody, {id:"linkList"});
					cElement("textarea", dclset.body.menuSet.mdibody.linkList, {id:"DCL_linkList"});
				dclset.body.menuSet.mdifoot = cElement("div", dclset.body.menuSet.mdiwrap, {className:"foot"});
					cElement("input", dclset.body.menuSet.mdifoot, {type:"submit", value:"닫기"}, function() { dclset.body.menuSet.mdiwrap.style.display=dclset.body.mdibg.style.display="none"; });

				dclset.body.menuSet.innerList.info = cElement("li", dclset.body.menuSet.innerList);
				cElement("div", dclset.body.menuSet.innerList.info, {className:"small", textContent:"/로 구분해서 입력하고, 메뉴를 위쪽으로 설정한 경우 |로 구분해서 순서대로 좌측 메뉴, 우측 메뉴, 프로필 메뉴를 입력합니다."});
				cElement("div", dclset.body.menuSet.innerList.info, {className:"small copyable", textContent:"설정 : 디시라이트 설정 버튼 / 로그인 : 로그인/아웃 버튼 / 갤로그 : 갤로그 버튼 / 갤러리 : 갤러리 메뉴 토글 / 목록 : 다중 목록 토글 / 와이드 : 와이드 모드 토글 / 상단 : 상단 기본 메뉴 토글 / 타이틀 : 갤러리 타이틀 토글 / 박스 : 갤러리 박스 토글 / 이미지 : 이미지 모아보기 / 베스트 : 일간 베스트 게시물 보기 / 개념글 : 개념글 보기 / 즐겨찾기 : 즐겨찾기 링크 / 현재갤 : 현재 갤러리 링크 / 구분선 : 구분선"});
				cElement("div", dclset.body.menuSet.innerList.info, {className:"small", textContent:"즐겨찾기 링크는 따로따로 입력할 수도 있습니다."});
				cElement("div", dclset.body.menuSet.innerList.info, {className:"small", textContent:"예) 미연시/게시판/김유식"});

			dclset.body.multiPage = cElement("div", dclset.body);
			cElement("h3", dclset.body.multiPage, "멀티 페이지");
			dclset.body.multiPage.innerList = cElement("ul", dclset.body.multiPage);
				dclset.body.multiPage.innerList.info = cElement("li", dclset.body.multiPage.innerList);
				cElement("div", dclset.body.multiPage.innerList.info, "한번에 여러 페이지를 로드합니다.");
				dclset.body.multiPage.innerList.page = cElement("li", dclset.body.multiPage.innerList);
				cElement("input", dclset.body.multiPage.innerList.page, {type:"checkbox", id:"DCL_page"});
				cElement("label", dclset.body.multiPage.innerList.page, {"for":"DCL_page",textContent:"멀티 페이지 사용"});
				dclset.body.multiPage.innerList.pageCount = cElement("li", dclset.body.multiPage.innerList);
				cElement("label", dclset.body.multiPage.innerList.pageCount, {"for":"DCL_pageCount",textContent:"한 번에 "});
				cElement("input", dclset.body.multiPage.innerList.pageCount, {type:"text", className:"number", size:"2", id:"DCL_pageCount"});
				cElement(null, dclset.body.multiPage.innerList.pageCount, "페이지 로드");
				
			dclset.body.easyView = cElement("div", dclset.body);
			cElement("h3", dclset.body.easyView, "바로보기");
			dclset.body.easyView.innerList = cElement("ul", dclset.body.easyView);
				dclset.body.easyView.innerList.info = cElement("li", dclset.body.easyView.innerList);
				cElement("div", dclset.body.easyView.innerList.info, "게시물 리스트에서 페이지 이동 없이 본문을 봅니다.");
				dclset.body.easyView.innerList.layerLink = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerLink, {type:"checkbox", id:"DCL_layerLink"});
				cElement("label", dclset.body.easyView.innerList.layerLink, {"for":"DCL_layerLink",textContent:"바로보기 사용 (링크 연결)"});
				dclset.body.easyView.innerList.layerReply = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerReply, {type:"checkbox", id:"DCL_layerReply"});
				cElement("label", dclset.body.easyView.innerList.layerReply, {"for":"DCL_layerReply",textContent:"댓글 링크 연결"});
				dclset.body.easyView.innerList.layerSingle = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerSingle, {type:"checkbox", id:"DCL_layerSingle"});
				cElement("label", dclset.body.easyView.innerList.layerSingle, {"for":"DCL_layerSingle",textContent:"단독 레이어 사용"});
				dclset.body.easyView.innerList.layerResize = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerResize, {type:"checkbox", id:"DCL_layerResize"});
				cElement("label", dclset.body.easyView.innerList.layerResize, {"for":"DCL_layerResize",textContent:"높이 자동 조절"});
				dclset.body.easyView.innerList.layerImage = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerImage, {type:"checkbox", id:"DCL_layerImage"});
				cElement("label", dclset.body.easyView.innerList.layerImage, {"for":"DCL_layerImage",textContent:"이미지"});
				dclset.body.easyView.innerList.layerThumb = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerThumb, {type:"checkbox", id:"DCL_layerThumb"});
				cElement("label", dclset.body.easyView.innerList.layerThumb, {"for":"DCL_layerThumb",textContent:"이미지 섬네일화"});
				dclset.body.easyView.innerList.layerText = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerText, {type:"checkbox", id:"DCL_layerText"});
				cElement("label", dclset.body.easyView.innerList.layerText, {"for":"DCL_layerText",textContent:"본문"});
				dclset.body.easyView.innerList.layerComment = cElement("li", dclset.body.easyView.innerList);
				cElement("input", dclset.body.easyView.innerList.layerComment, {type:"checkbox", id:"DCL_layerComment"});
				cElement("label", dclset.body.easyView.innerList.layerComment, {"for":"DCL_layerComment",textContent:"댓글"});
				
			dclset.body.Album = cElement("div", dclset.body);
			cElement("h3", dclset.body.Album, "이미지 모아보기");
			dclset.body.Album.innerList = cElement("ul", dclset.body.Album);
				dclset.body.Album.innerList.info = cElement("li", dclset.body.Album.innerList);
				cElement("div", dclset.body.Album.innerList.info, "게시판의 이미지를 모아 봅니다.");
				dclset.body.Album.innerList.albumInfScrl = cElement("li", dclset.body.Album.innerList);
				cElement("input", dclset.body.Album.innerList.albumInfScrl, {type:"checkbox", id:"DCL_albumInfScrl"});
				cElement("label", dclset.body.Album.innerList.albumInfScrl, {"for":"DCL_albumInfScrl",textContent:"무한 스크롤"});
				dclset.body.Album.innerList.albumFullsize = cElement("li", dclset.body.Album.innerList);
				cElement("input", dclset.body.Album.innerList.albumFullsize, {type:"checkbox", id:"DCL_albumFullsize"});
				cElement("label", dclset.body.Album.innerList.albumFullsize, {"for":"DCL_albumFullsize",textContent:"풀 사이즈 이미지 표시"});
				dclset.body.Album.innerList.albumRealtime = cElement("li", dclset.body.Album.innerList);
				cElement("input", dclset.body.Album.innerList.albumRealtime, {type:"checkbox", id:"DCL_albumRealtime"});
				cElement("label", dclset.body.Album.innerList.albumRealtime, {"for":"DCL_albumRealtime",textContent:"읽으면서 표시"});
				dclset.body.Album.innerList.thumb = cElement("li", dclset.body.Album.innerList);
				cElement(null, dclset.body.Album.innerList.thumb, "섬네일 크기 ");
				cElement("input", dclset.body.Album.innerList.thumb, {type:"text", className:"number", size:"3", id:"DCL_thumbWidth"});
				cElement(null, dclset.body.Album.innerList.thumb, "× ");
				cElement("input", dclset.body.Album.innerList.thumb, {type:"text", className:"number", size:"3", id:"DCL_thumbHeight"});
				
			dclset.body.blockContent = cElement("div", dclset.body);
			cElement("h3", dclset.body.blockContent, "컨텐츠 차단");
			dclset.body.blockContent.innerList = cElement("ul", dclset.body.blockContent);
				dclset.body.blockContent.innerList.info = cElement("li", dclset.body.blockContent.innerList);
				cElement("div", dclset.body.blockContent.innerList.info, "게시물의 이미지나 동영상 등을 미리 차단합니다.");
				dclset.body.blockContent.innerList.hide = cElement("li", dclset.body.blockContent.innerList);
				cElement("input", dclset.body.blockContent.innerList.hide, {type:"checkbox", id:"DCL_hide"});
				cElement("label", dclset.body.blockContent.innerList.hide, {"for":"DCL_hide",textContent:"컨텐츠 차단 사용"});
				dclset.body.blockContent.innerList.hideImg = cElement("li", dclset.body.blockContent.innerList);
				cElement("input", dclset.body.blockContent.innerList.hideImg, {type:"checkbox", id:"DCL_hideImg"});
				cElement("label", dclset.body.blockContent.innerList.hideImg, {"for":"DCL_hideImg",textContent:"이미지 차단"});
				dclset.body.blockContent.innerList.hideMov = cElement("li", dclset.body.blockContent.innerList);
				cElement("input", dclset.body.blockContent.innerList.hideMov, {type:"checkbox", id:"DCL_hideMov"});
				cElement("label", dclset.body.blockContent.innerList.hideMov, {"for":"DCL_hideMov",textContent:"동영상 차단"});
				dclset.body.blockContent.innerList.info.keyCmd = cElement("li", dclset.body.blockContent.innerList);
				cElement("div", dclset.body.blockContent.innerList.info.keyCmd, {className:"small", textContent:"Delete/Esc : 전체 차단"});
				cElement("div", dclset.body.blockContent.innerList.info.keyCmd, {className:"small", textContent:"Insert/~ : 전체 차단해제"});
				
			dclset.body.autoForm = cElement("div", dclset.body);
			cElement("h3", dclset.body.autoForm, "자동입력");
			dclset.body.autoForm.innerList = cElement("ul", dclset.body.autoForm);
				dclset.body.autoForm.innerList.info = cElement("li", dclset.body.autoForm.innerList);
				cElement("div", dclset.body.autoForm.innerList.info, "로그인하지 않은 상태에서 글을 쓸 때 입력 폼을 자동으로 채웁니다.");
				dclset.body.autoForm.innerList.autoForm = cElement("li", dclset.body.autoForm.innerList);
				cElement("input", dclset.body.autoForm.innerList.autoForm, {type:"checkbox", id:"DCL_autoForm"});
				cElement("label", dclset.body.autoForm.innerList.autoForm, {"for":"DCL_autoForm",textContent:"자동입력 사용"});
				dclset.body.autoForm.innerList.autoNamePw = cElement("li", dclset.body.autoForm.innerList);
				cElement("label", dclset.body.autoForm.innerList.autoNamePw, {"for":"DCL_autoName",textContent:"이름 "});
				cElement("input", dclset.body.autoForm.innerList.autoNamePw, {type:"text", size:"6", id:"DCL_autoName"});
				cElement("label", dclset.body.autoForm.innerList.autoNamePw, {"for":"DCL_autoPassword",textContent:"비밀번호 "});
				cElement("input", dclset.body.autoForm.innerList.autoNamePw, {type:"text", size:"6", id:"DCL_autoPassword"});
				
			dclset.body.setEtc = cElement("div", dclset.body);
			cElement("h3", dclset.body.setEtc, "로그인 및 쿠키");
			dclset.body.setEtc.innerList = cElement("ul", dclset.body.setEtc);
				dclset.body.setEtc.innerList.longExpires = cElement("li", dclset.body.setEtc.innerList);
				cElement("input", dclset.body.setEtc.innerList.longExpires, {type:"checkbox", id:"DCL_longExpires"});
				cElement("label", dclset.body.setEtc.innerList.longExpires, {"for":"DCL_longExpires",textContent:"브라우저를 닫아도 로그인을 유지"});
				dclset.body.setEtc.innerList.cookieDelete = cElement("li", dclset.body.setEtc.innerList);
				cElement("input", dclset.body.setEtc.innerList.cookieDelete, {type:"button", value:"로그인 쿠키 초기화"}, cookieDelete);

			dclset.body.dclInfo = cElement("div", dclset.body);
			cElement("h3", dclset.body.dclInfo, "DCinside Lite r"+R_VERSION);
			dclset.body.dclInfo.innerList = cElement("ul", dclset.body.dclInfo);
				dclset.body.dclInfo.innerList.updUse = cElement("li", dclset.body.dclInfo.innerList);
				cElement("input", dclset.body.dclInfo.innerList.updUse, {type:"checkbox", id:"DCL_updUse"});
				cElement("label", dclset.body.dclInfo.innerList.updUse, {"for":"DCL_updUse",textContent:"업데이트 알림"});
				dclset.body.dclInfo.innerList.syncStore = cElement("li", dclset.body.dclInfo.innerList);
				cElement("input", dclset.body.dclInfo.innerList.syncStore, {type:"checkbox", id:"DCL_syncStore"});
				cElement("label", dclset.body.dclInfo.innerList.syncStore, {"for":"DCL_syncStore",textContent:"Google Sync 저장소 사용"});

				dclset.body.dclInfo.innerList.info = cElement("li", dclset.body.dclInfo.innerList);
				dclset.body.dclInfo.innerList.info.copyright = cElement("div", dclset.body.dclInfo.innerList.info);
				cElement(null, dclset.body.dclInfo.innerList.info.copyright, "제작 : ");
				cElement("a", dclset.body.dclInfo.innerList.info.copyright, {href:"http://gallog.dcinside.com/hkyuwon", target:"_blank", textContent:"디시인사이드 고정닉 축"});
				dclset.body.dclInfo.innerList.info.kasugano = cElement("div", dclset.body.dclInfo.innerList.info);
				cElement(null, dclset.body.dclInfo.innerList.info.kasugano, "수정 : ");
				cElement("a", dclset.body.dclInfo.innerList.info.kasugano, {href:"http://kasugano.tistory.com/", target:"_blank", textContent:"디시인사이드 고정닉 하루카나소라"});
				dclset.body.dclInfo.innerList.info.github = cElement("div", dclset.body.dclInfo.innerList.info);
				cElement("a", dclset.body.dclInfo.innerList.info.github, {href:"https://github.com/koreapyj/dcinside_lite", target:"_blank", textContent:"GitHub 페이지"});
				cElement("div", dclset.body.dclInfo.innerList.info, {className:"small br", textContent:"이 스크립트는 자유 소프트웨어 라이센스를 따르지 않습니다. 이 스크립트의 저작권은 디시인사이드 고정닉 축에게 있습니다. 이 스크립트는 원 저작자의 허락을 받지 않고 수정되었으며, 원 저작자의 문제 제기시 배포는 중단됩니다. 이 스크립트의 버전 1.5.5 이후 변경사항은 Public Domain으로 배포됩니다."});

			dclset.foot = cElement("div", dclset.wrap, {className:"foot"});
				cElement("input", dclset.foot, {type:"submit", value:"완료"}, SET.save);

			$id("DCL_syncStore").disabled = !(BROWSER.chrome && BROWSER.chrome.storage);
			dclset.body.dclInfo.innerList.syncStore.className = $id("DCL_syncStore").disabled?"disabled":null;
		}


		$id("DCL_set_wrap").style.display = "block";
		if(!MODE.settingsv2) {
			$id("DCL_set_bg").style.display = "block";
			document.body.style.overflow = "hidden";
			$id("DCL_set").scrollTop=0;
		}

		var input,value;
		for(var i in P) {
			if(P.hasOwnProperty(i)) {
				input = $id("DCL_" + i);
				if(!input)
					input = cElement("input", dclset.body, {type:"hidden", id:"DCL_"+i});
				value = P[i];
				if(input.type === "checkbox") {
					input.checked = value;
				} else {
					input.value = value;
				}
			}
		}
	},
	load : function(nochrome) {
		var num = ["filter","blockN","blockNA","blockNR","allowStyle","showLabel","modTitle","header","title","sidebar","pageWidth","wide","wideWidth","listNumber","listDate","listCount","listRecom","listComment","listTime","best","page","pageCount","layerImage","layerText","layerComment","layerThumb","layerLink","layerReply","layerSingle","layerResize","albumInfScrl","albumRealtime","albumFullsize","thumbWidth","thumbHeight","hide","hideImg","hideMov","autoForm","updUse","updDev","longExpires","commentColor","syncStore","layoutEnabled"];
		if(BROWSER.chrome && BROWSER.chrome.storage && nochrome!==true) {
			chrome.storage.sync.get(null,function(items) {
				for(key in items) {
					if(P.version != "" && P.version < 15001 && key == "menuList")
						continue;
					if(P.hasOwnProperty(key)) {
						if(items[key]=="undefined" || typeof(items[key])=="undefined") {
							P[key]="";
							continue;
						}
						P[key] = items[key];
					}
				}
				for(i=0,l=num.length ; i<l ; i+=1) {
					P[num[i]] = Number(P[num[i]]);
				}
				
				if(P.version === "")
					return SET.load(true);
				
				P.syncStore = 1;
				if(localStorage['version'])
					localStorage.clear();
				
				if(BROWSER.chrome && !BROWSER.chrome.google)
					SET.update();
				if(P.version !== VERSION) {
					alert("처음 사용하셨거나 업데이트 되었습니다.\n메뉴의 [설정] 버튼을 눌러 설정을 확인하세요.\n\n설정을 완료하면 이 알림창은 나타나지 않습니다.\n\n※광고가 게시물을 가리는 경우 애드블록을 사용하세요.");
					addStyle("li#DCL_setBtn {color:#c00 !important ; font-weight:bold !important ; text-decoration:blink}");
				}

				DCINSIDE_LITE();
			});
			return;
		}

		if(BROWSER.localStorage && !BROWSER.dataMigration) {
			for(var i = 0; i < localStorage.length; i++)
			{
				key = localStorage.key(i);
				if(P.version != "" && P.version < 15001 && key == "menuList")
					continue;
				if(P.hasOwnProperty(key)) {
					if(localStorage[key]=="undefined" || typeof(localStorage[key])=="undefined") {
						P[key]=""
						continue;
					}
					P[key] = localStorage[key];
				}
			}
			for(i=0,l=num.length ; i<l ; i+=1) {
				P[num[i]] = Number(P[num[i]]);
			}

		} else {
			var cookie = /(?:^|; )dcinsidelitesetting=([^;]*)/.exec(document.cookie);
			if(cookie) {
				cookie = unescape(cookie[1]).split("\b");
				for(var i=0,l=cookie.length ; i<l ; i+=2) {
					if(P.version != "" && P.version < 15001 && cookie[i] == "menuList")
						continue;
					if(P.hasOwnProperty(cookie[i])) {
						P[cookie[i]] = cookie[i+1];
					}
				} // boolean 이나 number 을 형변환
				for(i=0,l=num.length ; i<l ; i+=1) {
					P[num[i]] = Number(P[num[i]]);
				}
			}

			if(BROWSER.dataMigration)
			{
				SET.call();
				SET.save();
				location.reload();
				return ;
			}
		}
		P.syncStore = 0;
		if(BROWSER.chrome && !BROWSER.chrome.google)
			SET.update();
		if(P.version !== VERSION) {
			alert("처음 사용하셨거나 업데이트 되었습니다.\n메뉴의 [설정] 버튼을 눌러 설정을 확인하세요.\n\n설정을 완료하면 이 알림창은 나타나지 않습니다.\n\n※광고가 게시물을 가리는 경우 애드블록을 사용하세요.");
			addStyle("li#DCL_setBtn {color:#c00 !important ; font-weight:bold !important ; text-decoration:blink}");
		}

		DCINSIDE_LITE();
	},
	update : function() {
		if(P.updUse && !BROWSER.msie) {
			simpleRequest(
				"https://lite.dcmys.jp/updatec"+(P["updDev"]==1?'_unstable':'') + "?v=" + time(),
				function(response) {
					nVer = parseInt(response.responseText.split('<>')[0]);
					if(response.responseText.split('<>')[1]!=undefined) {
						nVerDesc = response.responseText.split('<>')[1];
						nVerDesc = nVerDesc.replace(/<br>/gi, "\n");
						dText = "\n\n이 업데이트의 변경 사항\n" + nVerDesc + "\n";
					}
					if(R_VERSION < nVer) {
						if(confirm("새 버전이 있습니다(" + nVer + ")" + dText + "\n업데이트하시겠습니까?")) {
							document.body.innerHTML = '<form action="https://github.com/koreapyj/dcinside_lite/releases/download/' + nVer + '/dcinside_lite.zip" method="get"><div style="margin: 10px;">업데이트를 진행할 경우 이 버전으로 돌아올 수 없습니다. 계속하시겠습니까?<br /><input type="submit" style="padding-left: 5px; padding-right: 5px; margin: 3px; border: 2px solid black;" value="예" onclick="alert(\'새 버전 설치 후 새로고침하면 설치가 완료됩니다.\');" /><input type="button" style="padding-left: 6px; padding-right: 6px; padding-top: 1px; padding-bottom: 1px; margin: 2px; border: 1px solid black;" value="아니오" /></div></form>';
						}
					}
				}
			);
		}
	},
	save : function() {
		var input;
		var dataStr='';

		if(!$id("DCL_menuList").value.match(/설정/))
			return alert("메뉴 항목에 [설정] 버튼이 없으므로 설정을 저장할 수 없습니다.");

		P.syncStore = $id("DCL_syncStore").checked;

		if(BROWSER.chrome && BROWSER.chrome.storage) {
			if(!P.syncStore)
				chrome.storage.sync.clear();
			else
				localStorage.clear();
		}
		for(var i in P) {
			if(P.hasOwnProperty(i)) {
				input = $id("DCL_" + i);
				if(input.nodeName === "INPUT") {
					if(input.type === "checkbox") {
						setValue(i,input.checked);
						dataStr+=i+'='+Number(input.checked)+'&';
					} else if(cSearch(input,"DCL_number")) {
						setValue(i,Number(input.value));
						dataStr+=i+'='+Number(input.value)+'&';
					} else {
						setValue(i,input.value);
						dataStr+=i+'='+encodeURIComponent(input.value)+'&';
					}
				} else if(input.nodeName === "SELECT") {
					setValue(i,input.value);
					dataStr+=i+'='+encodeURIComponent(input.value)+'&';
				} else if(input.nodeName === "TEXTAREA") {
					value = input.value.replace(/^(?:\r?\n)+|(?:\r?\n)+$|(?:\r?\n)+(?=\r?\n)|\r/g,"");
					setValue(i,value);
					dataStr+=i+'='+encodeURIComponent(value)+'&';
				}
			}
		}
		setValue("version",VERSION);
		if(BROWSER.dataMigration)
			document.cookie = "dcinsidelitesetting=;path=/;";
		
		if(MODE.settings)
			window.close();
		else
			location.reload();
		return;
	},
	reset : function() {
		if(!confirm("설정을 초기화하겠습니까?")) {
			return;
		}
		if(BROWSER.localStorage) {
			for(var i = localStorage.length -1; i > -1; i--)
				localStorage.removeItem(localStorage.key(i));
		}
		else if(BROWSER.firefox) {
			var listValues = GM_listValues();
			for(var i=0,l=listValues.length ; i<l ; i+=1) {
				GM_deleteValue(listValues[i]);
			}
		} else {
			document.cookie = "dcinsidelitesetting=;path=/;";
		}
		location.reload();
	},
	close : function() {
		$id("DCL_set_wrap").style.display = "none";
		$id("DCL_set_bg").style.display = "none";
		document.body.style.overflow = "auto";
	}

	};

	function titleFunc() {
		if(P.modTitle) {
			var title,titleP,titleT,titleW;
			if(MODE.write) {
				title = P.listTitle;
				titleP = "글쓰기";
				titleT = "";
				titleW = "";
			} else if(MODE.list) {
				title = P.listTitle;
				titleP = PAGE + (P.page&&P.pageCount>1?"~"+P.pageCount:"");
				titleT = "";
				titleW = "";
			} else {
				title = P.articleTitle;
				titleP = "";
				titleT = document.title.substr(0, document.title.lastIndexOf(' - '));//$id("titleShare").textContent.replace(/^\s+|\s+$/g,"");
				titleW = document.getElementsByName('author')[0].content; //$id("titleShare").parentNode.parentNode.rows[MODE.article?0:2].cells[2].textContent.replace(/^\s+|\s+$/g,"");
			}
			document.title = title.replace(/\{G\}/g,GALLERY).replace(/\{P\}/g,titleP).replace(/\{T\}/g,titleT).replace(/\{W\}/g,titleW);
		}
	}

	// 기능 사용 버튼 추가
	function menuFunc() {
		var css =
			"div#DCL_menuDiv {position:relative; margin:0 auto; z-index:100}" +
			"div#DCL_menuWrap {position: fixed; background-color:#fff ; z-index:100}" +
			"li.DCL_menuOn {color:#000 !important}"+
			".hidden {display:none;}";
		
		if(P.menuPos === "top") {
			css +=
				"html > body { padding-top: 46px; max-width:"+P.pageWidth+"px; width: 100%; }" +
				"div#DCL_menuDiv {font-family: " + P.fontList + "; top: 0; left: 0; right: 0; width: auto; height: 46px; background: white; border-bottom: 1px solid rgba(0,0,0,0.15); position: fixed;}" +
				"div#DCL_menuDiv a {text-decoration: none;}" +
				"div#DCL_menuWrap {position: relative; margin: 0 auto; border: 0; background: transparent; max-width:"+P.pageWidth+"px; width: 100%; height: 46px;}" +
				"div#DCL_menuWrap:before {content: 'DCinside Lite r" + R_VERSION + "'; display: block; position: absolute; z-index: -1; left: 0; right: 0; margin: 0 auto; text-align: center; color: black; line-height: 46px; opacity: .15;}" +
				"h2#DCL_menuTitle {float: right; height: 46px;}" +
				"h2#DCL_menuTitle > img.DCL_profileImage {display: block; box-sizing: border-box; margin-top: 3px; width: 40px; height: 40px; border: 2px solid white; border-radius: 20px; transition: all .15s;}" +
				"h2#DCL_menuTitle:hover > img.DCL_profileImage {border-color: #5b7ce5;}" +
				"h2#DCL_menuTitle > a," +
				"h2#DCL_menuTitle > em {display: none;}" +
				"ul.DCL_menuUl {overflow: hidden;}" +
				"ul#DCL_menuUlLeft {float: left;}" +
				"ul#DCL_menuUlRight {float: right;}" +
				"ul#DCL_menuUlSub {position: absolute; top: 50px; right: -10px; background: white; padding: 10px 0; border-radius: 5px; box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 4px 0px; width: 180px; overflow: visible; display: none;}" +
				"ul#DCL_menuUlSub:hover {display: block;}" +
				"ul#DCL_menuUlSub:before {content: ''; position: absolute; right: 103px; top: -10px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 10px solid rgba(0, 0, 0, 0.1); z-index: 0;}" +
				"ul#DCL_menuUlSub > li:first-of-type {position: absolute; right: 104px; top: -9px; width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent; border-bottom: 9px solid white; z-index: 1;}" +
				"ul#DCL_menuUlSub > li:not(:first-of-type) > a {display: block; padding: 5px 20px;}" +
				"ul#DCL_menuUlSub > li:not(:first-of-type) > a.DCL_menuSep {font-size: 0; cursor: default; border-bottom: 1px solid #eee; height: 0; padding: 5px 0 0 0; margin: 0 0 5px 0;}" +
				"ul#DCL_menuUlSub > li:not(:first-of-type) > a.DCL_profile {font-size: 14px;}" +
				"ul#DCL_menuUlSub > li:not(:first-of-type) > a.DCL_profile > em {color: #aaa; font-size: 12px; display: block;}" +
				"ul#DCL_menuUlSub > li:not(:first-of-type):hover > a:not(.DCL_menuSep)," +
				"ul#DCL_menuUlSub > li:not(:first-of-type):hover > a.DCL_profile > em{background-color: #5b7ce5; color: white;}" +

				"ul.DCL_menuUl > li {display: block; float: left; height: 46px; line-height: 46px; font-size: 13px;}" +
				"ul.DCL_menuUl > li > a {display: block; height: 46px; padding: 0px 14px; border-bottom: 4px solid #5b7ce5; transition: all .15s ease-in-out;}" +
				"ul.DCL_menuUl > li > a:hover {color: #5b7ce5;}" +
				"ul.DCL_menuUl > li > a:hover," +
				"ul.DCL_menuUl > li > a.DCL_linkThis {height: 42px;}" +
				"ul.DCL_menuUl > li > a.DCL_menuSep {display: none;}" +
				
				"div#DCL_writeBtn { float: right; margin: 7px 0 7px 15px; }" +
				"div#DCL_writeBtn > a { padding: 8px 15px; display: inline-block; background-color: #5b7ce5; background-image: linear-gradient(0deg,#5b7ce5,#6987e8); border: 1px solid #2049cf; color: white; border-radius: 3px; box-sizing: border-box; }" +
				"";
		} else {
			css +=
				"html > body {padding-left: 190px; padding-right: 10px;}" +
				"div#DCL_menuDiv {font-family: " + P.fontList + ";}" +
				"div#DCL_menuWrap {top: 0; left: 0; bottom: 0; background-color: white; width: 180px; margin-left: 0px; box-shadow: 0 2px 10px rgba(0,0,0,.2); color: black;}" +
				"ul.DCL_menuUl {border-color: #ddd; border-style: solid; border-width: 0; border-bottom: 1px dotted #ddd;}" +
				"ul.DCL_menuUl > li {}" +
				"ul.DCL_menuUl > li > a {display: block; line-height: 15px; padding: 10px 20px; font-size: 12px; text-align: left; cursor: pointer; white-space: nowrap; box-sizing: border-box; text-decoration: none;}" +
				"ul.DCL_menuUl > li > a:hover {background: #eee;}" +
				"ul.DCL_menuUl > li > a.DCL_menuSep {font-size: 0; height: 0; padding: 0; border-bottom: 1px dotted #ddd;}" +
				"ul.DCL_menuUl > li > a.DCL_linkThis {position: relative; font-weight: bold;}" +
				"ul.DCL_menuUl > li > a.DCL_linkThis:after {display: block; content: '›'; float: right; font-weight: normal; font-size: 15px; position: absolute; right: 20px; top: 0; line-height: 35px;}" +
	//			"div#DCL_menuWrap:after {content: 'DCinside Lite r" + R_VERSION + "'; display: block; line-height: 15px; padding: 10px 20px; font-size: 12px; text-align: left; cursor: default; white-space: nowrap; color: #aaa;}" +
				"h2#DCL_menuTitle:before {content: ''; display: block; position: fixed; top: 0; left: 0; width: inherit; height: inherit; background-color: #E7E7EA; background-image: url('http://zzbang.dcinside.com/" + _ID + "_temp.jpg'); background-position: center; background-size: cover; z-index: -1;}" +
				"h2#DCL_menuTitle {box-sizing: border-box; padding: 55px 10px 0 20px; text-align: left; width: inherit; height: 95px; cursor: default; font-size: 15px; font-weight: normal; color: white; background-image: linear-gradient(rgba(0,0,0,.0),rgba(0,0,0,.9)); background-size: 100% 60%; background-repeat: no-repeat; background-position: bottom; z-index: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;}" +
				"h2#DCL_menuTitle > img.DCL_profileImage {float: left; width: 40px; height: 40px; margin-right: 7px; background-size: cover; border: 2px solid white; border-radius: 20px; box-sizing: border-box; margin-top: -7px; margin: -7px 7px 0 -10px;}" +
				"h2#DCL_menuTitle > a {color: inherit; font-size: 15px; cursor: pointer; text-decoration: none;}" +
				"h2#DCL_menuTitle > a:hover {text-decoration: underline;}" +
				"h2#DCL_menuTitle > a > img.userType {margin-left: 3px;}" +
				"h2#DCL_menuTitle > em {display: block; font-size: 12px; font-weight: normal; color: #ccc;}" +
				"ul#DCL_menuUl:after {content: ''; display: block; clear: both; width: 0; height: 0; overflow: hidden;}" +
				"ul#DCL_linkUl {border-top: 1px dotted #ddd;}" +

				"div#DCL_writeBtn { display: none; }" +
				"";
		}

		if(MODE.list) {
			css += ''
					+ ".btn_voice_ps{display:inline-block;position:relative;width:166px;height:20px;z-index:0;background:url(http://wstatic.dcinside.com/gallery/images/voice/btn_voice_web.gif) 0 0 no-repeat;}"
					+ ".btn_voice_ps a.btn_voice_play{display:inline-block;background:url(http://wstatic.dcinside.com/gallery/images/voice/icon_play.gif) 12px 5px no-repeat;color:#5964f4;width:141px;height:20px;line-height:20px;text-align:left;padding-left:25px;font-size:11px;font-family:Dotum,'돋움';text-decoration:none;}"
					+ ".btn_voice_ps a.btn_voice_stop{display:inline-block;background:url(http://wstatic.dcinside.com/gallery/images/voice/icon_stop.gif) 12px 6px no-repeat;color:#666666;width:141px;height:20px;line-height:20px;text-align:left;padding-left:25px;font-size:11px;font-family:Dotum,'돋움';text-decoration:none;}"
					+ ".btn_voice_ps a.btn_voice_stop span{margin-left:40px}"
					+ ".btn_voice_ps a.btn_voice_play span{margin-left:40px}"
					+ ".btn_voice_info{display:inline-block;width:25px;height:20px;position:absolute;top:0;right:0;background:url(http://wstatic.dcinside.com/gallery/images/voice/icon_info.gif) center center no-repeat}"
					+ "#dgn_voice_pop_info{position:absolute;z-index:9999;top:50%;left:" + (document.body.offsetWidth / 2 - 167) + "px;font-size:12px;font-family:Dotum,'돋움'}"
					+ "#dgn_voice_pop_info div,#dgn_voice_pop_info p{margin:0;padding:0}"
					+ "#dgn_voice_pop_info .pop_info_top{display:block;width:335px;height:15px;background:url(http://wstatic.dcinside.com/gallery/images/voice/bg_voice_top.png) 0 bottom no-repeat;_background:none; _filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='http://wstatic.dcinside.com/gallery/images/voice/bg_voice_top.png', sizingMethod='crop');}"
					+ "#dgn_voice_pop_info .pop_info_con{display:block;width:335px;background:url(http://wstatic.dcinside.com/gallery/images/voice/bg_voice_center.png) ;_background:none; _filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='http://wstatic.dcinside.com/gallery/images/voice/bg_voice_center.png', sizingMethod='crop');background-repeat: 0 repeat-y}"
					+ "#dgn_voice_pop_info .pop_info_bottom{display:block;width:335px;height:19px;background:url(http://wstatic.dcinside.com/gallery/images/voice/bg_voice_bottom.png) 0 0 no-repeat;_background:none; _filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='http://wstatic.dcinside.com/gallery/images/voice/bg_voice_bottom.png', sizingMethod='crop');}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_1{position:relative;margin:0px 18px;padding:3px 0 6px 0;border-bottom:1px solid #d9d9d9;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_1 span{background:url(http://wstatic.dcinside.com/gallery/images/voice/icon_info1.gif) 0 center no-repeat;padding:2px 0 0px 20px}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_1 span img{vertical-align:middle}"
					+ "#dgn_voice_pop_info .pop_info_con .btn_close{position:absolute;top:0px;right:5px;*top:3px;_right:20px;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_2{position:relative;margin:0px 18px;padding:10px 0 6px 0;font-size:11px;color:#3f3f3f;line-height:16px}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_2 p{text-decoration:underline;color:#707070;margin:5px 0;font-size:11px;letter-spacing:0}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_2 p a{color:#707070;text-decoration:underline;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3{position:relative;margin:0px 18px;padding:10px;background:#f2f2f2;font-size:11px;color:#3f3f3f;line-height:16px}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 p{color:#4a65ef;font-size:11px;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 .voice_url{margin-top:3px;font-size:12px}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 .voice_url span{padding-left:5px;color:#4c4c4c;font-size:12px}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 .voice_url a{color:#4c4c4c;font-size:12px;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 .voice_txt{position:relative;margin-top:8px;width:200px;font-size:12px;height:70px;color:#817f7f;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 .voice_txt span{font-size:12px;}"
					+ "#dgn_voice_pop_info .pop_info_con .ibox_3 .voice_qr{position:absolute;top:50px;right:10px;_right:25px;}"
					+ ''
		}
		addStyle(css);

		var menuDiv = cElement("div",[document.body,0],{id:"DCL_menuDiv"});
		var menuWrap = cElement("div",menuDiv,{id:"DCL_menuWrap"});
		var funcList = {
			login : function(){location.href="http://dcid.dcinside.com/join/log"+(_GID?"out":"in")+".php?s_url="+encodeURIComponent(location.href);},
			gallog : function(e) {
						if(!_GID) {
							ePrevent(e);
							if(confirm("로그인을 하지 않은 상태입니다.\n로그인 하시겠습니까?")) {
								location.href = "http://dcid.dcinside.com/join/login.php?s_url="+encodeURIComponent(location.href);
							}
						}
					},
			page : function() {
						setValue("page",!P.page);
						cToggle(this,"DCL_menuOn");
						var list_table = $id("list_table");
						var tbody = list_table.tBodies;
						if(P.page) {
							pageFunc();
						} else {
							for(var i=tbody.length-1 ; i>0 ; i-=1) {
								Layer.close(i);
								list_table.removeChild(tbody[i]);
							}
						}
					},
			wide : function() {
						setValue("wide",!P.wide);
						cToggle(this,"DCL_menuOn");
						wideFunc();
					},
			header : function() {
						setValue("header",!P.header);
						cToggle(this,"DCL_menuOn");
						$id("dgn_header_gall").style.display = P.header?"block":"none";
					},
			title : function() {
						setValue("title",!P.title);
						cToggle(this,"DCL_menuOn");
						$(".gallery_title").style.display = P.title?"block":"none";
					},
			best : function() {
						setValue("best",!P.best);
						cToggle(this,"DCL_menuOn");
						$(".gallery_box").style.display = P.best?"block":"none";
					},
			album : function(){Album(PAGE);},
			ilbeview : function(){
						softLoad("/board/lists/?id="+_ID+"&exception_mode=best");
					},
			favview : function(){
						softLoad("/board/lists/?id="+_ID+"&exception_mode=recommend");
					},
			refresh : function(){
						softLoad("/board/lists/?id="+_ID);
					},
			menutoggle : function(){
						if($id("DCL_menuUlSub").style.display!=="block")
							$id("DCL_menuUlSub").style.display="block";
						else
							$id("DCL_menuUlSub").style.display=null;
					},
			menuclose : function(e){
						if(e.target === $("h2#DCL_menuTitle > img.DCL_profileImage"))
							return funcList.menutoggle();
						$id("DCL_menuUlSub").style.display=null;
					}
		};
		
//		cElement('a',cElement("div",menuWrap,{id:"DCL_writeBtn"}),{href:'/board/write/?id='+_ID,textContent:'글쓰기'},function(e) { openSimpleWriteForm(); e.preventDefault(); });
		var profileH2=cElement("h2",menuWrap,{id:"DCL_menuTitle",textContent:GALLERY.replace(/\(.+?\)/,'')+" 갤러리"},funcList.refresh);

		// 즐겨찾기 링크 정리
		var linkList = new Array();
		if(P.linkList) {
			var regexp = /(?:(\[현재갤\])|([^@]+)(@{1,2})((http:\/\/)?.+))(?:\n|$)/ig;
			var exec,href,className,li,a,g_flg=new Array();
			while( (exec=regexp.exec(P.linkList)) ) {
				switch(exec[1]) {
					case '[현재갤]':
						if(g_flg[_ID])
							break;
						linkList[GALLERY] = {};
						linkList[GALLERY].href = "/board/lists/?id=" + _ID;
						linkList[GALLERY].className = "DCL_linkThis";
						break;
					default:
						linkList[exec[2]] = {};
						if(exec[5]) {
							linkList[exec[2]].href = exec[4];
							linkList[exec[2]].className = "DCL_linkHttp";
						} else {
							linkList[exec[2]].href = "/board/lists/?id=" + exec[4];
							linkList[exec[2]].className = exec[4]===_ID?"DCL_linkThis":"";
							g_flg[exec[4]]=true;
						}
						linkList[exec[2]].target = exec[3].length === 2?"_blank":"";
				}
			}
		}

		var menuList = P.menuList.split("|");
		var menuUlId = ["menuUlLeft","menuUlRight","menuUlSub"];

		for(var mlc=0;mlc<menuList.length && mlc < 3;mlc+=1) {
			if(menuList[mlc]=='')
				continue;
			var menuUl = cElement("ul",menuWrap,{id:"DCL_"+menuUlId[mlc]});
			if(P.menuPos!=="top" || menuUlId[mlc]!=="menuUlSub")
				menuUl.className="DCL_menuUl";
			else
				cElement("li",menuUl);
			menuList[mlc] = menuList[mlc].split("/");
			for(var j=0,l=menuList[mlc].length ; j<l ; j+=1) {
				var flag = menuList[mlc][j];
				if(flag === "설정") {
					cElement("a",cElement("li",menuUl),{textContent:"설정",id:"DCL_setBtn"},SET.call);
				} else if(flag === "로그인") {
					cElement("a",cElement("li",menuUl),{textContent:_GID?"로그아웃":"로그인",className:"DCL_menuOn"},funcList.login);
				} else if(flag === "갤로그") {
					cElement("a",cElement("li",menuUl),{textContent:"갤로그",id:"DCL_profile",href:_GID?"//gallog.dcinside.com/"+_GID:'',target:"_blank"},funcList.gallog);
				} else if(flag === "갤러리") {
					cElement("a",cElement("li",menuUl),{textContent:"갤러리",href:"//gall.dcinside.com/",target:"_blank"});
				} else if(flag === "목록") {
					cElement("a",cElement("li",menuUl),{textContent:"멀티 페이지",className:P.page?"DCL_menuOn":""},funcList.page);
				} else if(flag === "와이드") {
					cElement("a",cElement("li",menuUl),{textContent:"와이드 레이아웃",className:P.wide?"DCL_menuOn":""},funcList.wide);
				} else if(flag === "상단") {
					cElement("a",cElement("li",menuUl),{textContent:"상단 메뉴",className:P.header?"DCL_menuOn":""},funcList.header);
				} else if(flag === "타이틀") {
					cElement("a",cElement("li",menuUl),{textContent:"갤러리 타이틀",className:P.title?"DCL_menuOn":""},funcList.title);
				} else if(flag === "박스") {
					cElement("a",cElement("li",menuUl),{textContent:"갤러리 박스",className:P.best?"DCL_menuOn":""},funcList.best);
				} else if(flag === "이미지") {
					cElement("a",cElement("li",menuUl),"이미지 모아보기",funcList.album);
				} else if(flag === "베스트") {
					cElement("a",cElement("li",menuUl),"일간베스트",funcList.ilbeview);
				} else if(flag === "개념글") {
					cElement("a",cElement("li",menuUl),"개념글",funcList.favview);
				} else if(flag === "즐겨찾기") {
					for(flag in linkList) {
						if(typeof linkList[flag].href === "undefined")
							continue;
						var link = cElement("a",cElement("li",menuUl),{href:linkList[flag].href,target:linkList[flag].target,className:linkList[flag].className,textContent:flag});
						if(linkList[flag].className!="DCL_linkHttp")
							link.addEventListener("click",function(e){ePrevent(e); $("a.DCL_linkThis").className=''; this.className="DCL_linkThis"; softLoad(this.href);});
					}
				} else if(flag === "구분선") {
					cElement("a",cElement("li",menuUl),{textContent:"구분선",className:"DCL_menuSep"});
				} else if(typeof linkList[flag] !== "undefined"){
					var link = cElement("a",cElement("li",menuUl),{href:linkList[flag].href,target:linkList[flag].target,className:linkList[flag].className,textContent:flag});
					if(linkList[flag].className == "DCL_linkThis")
						link.addEventListener("click",function(e){ePrevent(e); softLoad(this.href);});
				}
			}
		}
		
		var target = $('span.f_l > a',1);
		for(i=target.length;i--;) {
			target[i].addEventListener("click", function(e) { ePrevent(e); softLoad(this.href); });
		}

		if(P.menuPos === "top") {
			$id("DCL_menuTitle").textContent = "";
			$id("DCL_menuTitle").removeEventListener("click",funcList.refresh);
			cElement("img",[$id("DCL_menuTitle"),0],{src:"http://dcimg1.dcinside.com/glogProfileView.php?gid=26b2c223e4c221ac3e&type=main&mode=GL&dummyCode=242872037",className:"DCL_profileImage",alt:"프로필"});
		}

		if(_GID) {
			simpleRequest("http://gallog.dcinside.com/" + _GID, function(e) {
				var gallogHtml = e.responseText;
				var nick = gallogHtml.match(/id='pfNickView'>(.+?)<\/span>/)[1];
				if(isFNick = nick.match(/<U>(.+?)<\/U>/)) {
					nick = isFNick[1];
					isFNick = true;
				}
				var pfImg = gallogHtml.match(/<img src="([^"]+)" width="[^"]+" id="ProfileImg"/)[1];
				var bgImg = gallogHtml.match(/background-image:url\('([^ ]+) \?>'\);"><\/div>/)[1];
				$id("DCL_menuTitle").textContent = "";
				cElement("img",[$id("DCL_menuTitle"),0],{src:pfImg,className:"DCL_profileImage",alt:"프로필"});
				var glog = cElement("a",$id("DCL_menuTitle"),{href:"//gallog.dcinside.com/" + _GID,target:"_blank",textContent:nick});
				cElement("img",glog,{src:isFNick?"//wstatic.dcinside.com/gallery/skin/gallog/g_fix.gif":"http://wstatic.dcinside.com/gallery/skin/gallog/g_default.gif",className:"userType"});
				cElement("em",$id("DCL_menuTitle"),_GID);
				if(bgImg) addStyle("h2#DCL_menuTitle:before {background-image: url('" + bgImg + "') !important;}");
				$id("DCL_menuTitle").removeEventListener("click",funcList.refresh);

				if(P.menuPos === "top" && $id("DCL_profile")) {
					$id("DCL_profile").className = "DCL_profile";
					$id("DCL_profile").textContent = nick;
					cElement("img",$id("DCL_profile"),{src:isFNick?"//wstatic.dcinside.com/gallery/skin/gallog/g_fix.gif":"http://wstatic.dcinside.com/gallery/skin/gallog/g_default.gif",className:"userType"});
					cElement("em",$id("DCL_profile"),"갤로그 가기");
				}
			},null,null,null,function(e) {/*
				$id("DCL_menuTitle").textContent = "";
				$id("DCL_menuTitle").removeEventListener("click",funcList.refresh);
				cElement("img",[$id("DCL_menuTitle"),0],{src:"http://dcimg1.dcinside.com/glogProfileView.php?gid=26b2c223e4c221ac3e&type=main&mode=GL&dummyCode=242872037",className:"DCL_profileImage",alt:"프로필"});*/
			});
		}

		if(P.menuPos === "top" && $id("DCL_menuUlSub")) {
			document.body.addEventListener("click",funcList.menuclose);
		}

		addStyle(''
					+ 'form#DCL_writeForm input { -webkit-appearance: none; border-radius: 0; }'
					+ 'form#DCL_writeForm { position: fixed; width: 640px; height: 480px; max-width: 100%; max-height: 100%; background-color: white; box-shadow: 0 0 3px black; bottom: 60px; right: 30px; z-index: 120; padding-top: 111px; padding-bottom: 41px; box-sizing: border-box; }'
					+ 'form#DCL_writeForm * { font-family: "Segoe UI", "Meiryo UI", "Malgun Gothic", "Dotum", sans-serif; }'

					+ '@media (max-width: 670px) {'
						+ 'form#DCL_writeForm { right: 0; }'
					+ '}'

					+ '@media (max-height: 605px) {'
						+ 'form#DCL_writeForm { bottom: 0; }'
					+ '}'

					+ 'div#DCL_writeFormTitle { background-color: #444; color: white; font-size: 15px; font-weight: normal; padding: 10px; }'
					+ 'div#DCL_writeFormTitle:after { content: ""; display: block; clear: both; }'
					+ 'div#DCL_writeFormTitle > h1 { float: left; font-size: 15px; font-weight: normal; margin: 0 5px; }'
					+ 'div#DCL_writeFormTitle > ul { list-style-type: none; float: right; }'
					+ 'div#DCL_writeFormTitle > ul > li > a { padding: 0; color: white; display: block; }'

					+ 'div#DCL_writeInfoDiv { position: absolute; top: 0; left: 0; right: 0; }'
					+ 'div#DCL_writeInfoDiv > div[name="name"] { font-weight: bold; }'
					+ 'div#DCL_writeInfoDiv > input,'
					+ 'div#DCL_writeInfoDiv > div[name="name"] { display: block; width: 100%; border: 0; border-bottom: 1px solid #aaa; padding: 10px; font-size: 13px; height: 38px; box-sizing: border-box; }'
					+ 'div#DCL_writeInfoDiv > input[name="name"] { border-right: 1px solid #aaa; }'
					+ 'div#DCL_writeInfoDiv > input[name="name"],'
					+ 'div#DCL_writeInfoDiv > input[name="password"] { float: left; width: 50%; }'

					+ 'form#DCL_writeForm > textarea,'
					+ 'form#DCL_writeForm > div.textarea { width: 100%; height: 100%; padding: 10px; border: 0; font-size: 13px; font-weight: normal; box-sizing: border-box; resize: none; overflow-y: scroll; }'
					+ 'form#DCL_writeForm > textarea { display: none; }'

					+ 'div#DCL_writeBottomDiv { position: absolute; bottom: 0; left: 0; right: 0; height: 41px; border-top: 1px solid #aaa; background-color: #eee; padding: 3px; box-sizing: border-box; }'
					+ 'div#DCL_writeBottomDiv > input[type="button"],'
					+ 'div#DCL_writeBottomDiv > input[type="submit"] { font-size: 13px; line-height: 20px; padding: 3px 20px; border-radius: 3px; margin: 3px; background-color: white; background-image: linear-gradient(0deg,#eee,#fff); border: 1px solid #aaa; }'
					+ 'div#DCL_writeBottomDiv > input[type="submit"] { background-color: #5b7ce5; background-image: linear-gradient(0deg,#5b7ce5,#6987e8); border: 1px solid #2049cf; color: white; }'
					+ 'div#DCL_writeBottomDiv > input[type="submit"]:disabled { background-color: #889fec; background-image: linear-gradient(0deg,#889fec,#95aaee); border-color: #7b95ea; }'
					+ 'div#DCL_writeBottomDiv > a { font-weight: normal; color: blue; font-size: 12px; line-height: 20px; margin: 3px; padding: 3px; display: inline-block; float: right; }'

					+ 'div#DCL_writeBottomDiv > ul { display: inline-block; height: 28px; margin: 3px; }'
					+ 'div#DCL_writeBottomDiv > ul > li { display: inline-block; }'
					+ 'div#DCL_writeBottomDiv > ul > li > a { cursor: default; height: 26px; width: 26px; border: 1px solid transparent; border-radius: 3px; line-height: 26px; text-align: center; font-size: 16px; display: inline-block; padding: 0; font-weight: normal; text-decoration: none; }'

					+ 'div#DCL_writeBottomDiv > ul > li > a:hover { border-color: #aaa; background-image: linear-gradient(0deg,#eee,#fff); }'

					+ 'div#DCL_writeBottomDiv > ul > li > a.DCL_editor_bold { font-weight: bold; }'
					+ 'div#DCL_writeBottomDiv > ul > li > a.DCL_editor_italic { font-style: italic; }'
					+ 'div#DCL_writeBottomDiv > ul > li > a.DCL_editor_strike { text-decoration: line-through; }'
					+ 'div#DCL_writeBottomDiv > ul > li > a.DCL_editor_underline { text-decoration: underline; }'

					+ 'div.DCL_dropzoneDiv { pointer-events: none; position: absolute; top: 35px; bottom: 0; left: 0; right: 0; background-color: rgba(128,128,128,.5); visibility: hidden; }'
					+ 'div.DCL_dropzoneDiv > span { position: relative; display: block; height: 100%; width: 100%; text-align: center; color: white; font-size: 30px; text-shadow: -1px -1px 0 #777,1px -1px 0 #777,-1px 1px 0 #777,1px 1px 0 #777; }'
					+ 'div.DCL_dropzoneDiv > span:before { content: "여기에 사진을 끌어놓으세요"; display: inline-block; position: relative; top: 50%; transform: translateY(-50%); }'
					+ 'div.DCL_dropzoneDiv > span:after { display: inline-block; content: ""; position: absolute; border: 10px dashed white; top: 30px; left: 30px; right: 30px; bottom: 30px; }'
			);
/*
		// 간단 글쓰기 폼
		if($('span.f_r > a')) {
			$('span.f_r > a').addEventListener('click', function(e) {
				openSimpleWriteForm();
				e.preventDefault();
			});
		}*/
	}

	function openSimpleWriteForm() {
		simpleRequest('/board/write/?id=' + _ID, function(e) {
			function uploadCallback(e) {
				console.log(JSON.parse(e.responseText));
				var r = JSON.parse(e.responseText)['files'];
				writeForm.imgHtml='';
				for(i=0;i<r.length;i++) {
					if(!r[i].url)
						continue;
					writeForm.imgHtml+='<img src="' + r[i].url + '" class="txc-image" />\n';
					cElement('input',writeForm,{name:'file_write['+(writeForm.fileIdx++)+'][file_no]',value:r[i].file_temp_no});
				}
				writeForm.querySelector('div.textarea').innerHTML = writeForm.imgHtml + writeForm.querySelector('div.textarea').innerHTML;
				$('div#DCL_writeBottomDiv input[type="submit"]').disabled=null;
			}

			if(writeForm = $('form#DCL_writeForm')) removeElement(writeForm);
			var writeBody = e.responseText.match(/(<div id="dgn_gallery_wrap"[\s\S]*)<\/body>/)[1].toDomElement();
			var writeForm = cElement('form',[document.body,0],{id:'DCL_writeForm',action:'http://gall.dcinside.com/forms/article_submit',method:'post'/*,enctype:'multipart/form-data'*/});
			writeForm.fileIdx = 0;
			var writeInfoDiv = cElement('div',writeForm,{id:'DCL_writeInfoDiv'});
				var writeFormTitle = cElement('div',writeInfoDiv,{id:'DCL_writeFormTitle'});
					cElement('h1',writeFormTitle,{textContent:'간단 글쓰기'});
					var writeFormButtons = cElement('ul',writeFormTitle);
						cElement('a',cElement('li',writeFormButtons),{textContent:'×'},function(){ if(confirm('작성하신 내용이 손실됩니다.\n\n계속하시겠습니까?')) removeElement(writeForm); });
				
				if(_GID) {
					cElement('div',writeInfoDiv,{textContent:_GID,name:'name'});
				} else {
					cElement('input',writeInfoDiv,{type:'text',name:'name',placeholder:'닉네임',required:'required'});
					cElement('input',writeInfoDiv,{type:'password',name:'password',placeholder:'비밀번호',required:'required'});
				}
				cElement('input',writeInfoDiv,{type:'text',name:'subject',placeholder:'제목',required:'required'}).focus();
				for(var i=(target = writeBody.querySelector('form#write').querySelectorAll('input[type="hidden"]')).length;i--;) {
					cElement('input',writeInfoDiv,{type:'hidden',name:target[i].name,value:target[i].value});
				}
				
			cElement('textarea',writeForm,{name:'memo',required:'required'});
			writeFormEditor = cElement('div',writeForm,{className:'textarea','contenteditable':'true'});
			
			var writeBottomDiv = cElement('div',writeForm,{id:'DCL_writeBottomDiv'});
				cElement('input',writeBottomDiv,{type:'submit',value:'작성'},function(e){
					e.preventDefault();
					this.disabled='disabled';
					simpleRequest("/block/block",
						function(r) {
							if(writeForm.querySelector('input[name="block_key"]'))
								writeForm.querySelector('input[name="block_key"]').value = r.responseText;
							else
								cElement('input',writeInfoDiv,{type:'hidden',name:'block_key',value:r.responseText});
	/*						if(writeForm.imgHtml)
								writeForm.querySelector('textarea').value = writeForm.imgHtml + writeForm.querySelector('textarea').value;
							writeForm.querySelector('textarea').value = writeForm.querySelector('textarea').value.replace(/\n/g,'<br>');
							writeForm.querySelector('textarea').value = writeForm.querySelector('textarea').value.replace(/ /g,'&nbsp;');*/
							writeForm.querySelector('textarea').value = writeForm.querySelector('div.textarea').innerHTML;
							var data = formWalk(writeForm);
							data = data.slice(0,data.length-1);
							bfloc = location.toString();
							history.pushState(bfloc, '로드 중...', 'http://'+location.innerhost+'/board/write/?id='+_ID);
							simpleRequest('/forms/article_submit',function(r) {
								history.pushState(bfloc, bfloc, bfloc);
								if((reply = r.responseText.split('||')).length>1) {
									if(reply[0] == 'true') {
										softLoad('/board/view/?id='+_ID+'&no='+reply[1]);
										removeElement(writeForm);
									}
									else
										alert(reply[1]);
								}
								else
									alert(r.responseText);
							},'POST',{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},data);
						},
						"POST",{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},
							''
						+ 'ci_t=' + writeForm.querySelector('input[name="ci_t"]').value + '&'
						+ 'id=' + writeForm.querySelector('input[name="id"]').value + '&'
						+ 'block_key=' + writeForm.querySelector('input[name="block_key"]').value
					);
				});
				var writeToolbox = cElement('ul',writeBottomDiv);
					cElement('a',cElement('li',writeToolbox),{title:'굵게',textContent:'B',className:'DCL_editor_bold'});
					cElement('a',cElement('li',writeToolbox),{title:'기울임',textContent:'I',className:'DCL_editor_italic'});
					cElement('a',cElement('li',writeToolbox),{title:'취소선',textContent:'S',className:'DCL_editor_strike'});
					cElement('a',cElement('li',writeToolbox),{title:'밑줄',textContent:'U',className:'DCL_editor_underline'});

					cElement('a',cElement('li',writeToolbox),{title:'파일 열기',textContent:'File'},function() {$('input#DCL_fileSelectDlg').click();});

				cElement('a',writeBottomDiv,{href:'/board/write/?id='+_ID,textContent:'기본 글쓰기 화면 열기',target:'_blank'});

			var fileSelectDlg = cElement('input',writeForm,{type:'file',id:'DCL_fileSelectDlg','multiple':'multiple'})
			fileSelectDlg.style.display='none';
			fileSelectDlg.addEventListener('change',function(e) {
				$('div#DCL_writeBottomDiv input[type="submit"]').disabled='disabled';
				fileUpload(e.target.files,writeForm.querySelector('input[name="r_key"]')?writeForm.querySelector('input[name="r_key"]').value:null,uploadCallback);
			});
			
			var dropzoneDiv = cElement('div',writeForm,{className:'DCL_dropzoneDiv'});
			cElement('span', dropzoneDiv);

			writeForm.addEventListener("dragover", function(e) {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
				dropzoneDiv.style.visibility = 'visible';
			});
			writeForm.addEventListener("dragleave", function(e) {
				dropzoneDiv.style.visibility = null;
			});
			writeForm.addEventListener("drop", function(e) {
				e.stopPropagation();
				e.preventDefault();
				dropzoneDiv.style.visibility = null;

				if(e.dataTransfer.files.length>0) {
					$('div#DCL_writeBottomDiv input[type="submit"]').disabled='disabled';
					fileUpload(e.dataTransfer.files,writeForm.querySelector('input[name="r_key"]')?writeForm.querySelector('input[name="r_key"]').value:null,uploadCallback);
				}
			});
		});

		function fileUpload(files,r_key,callback) {
			function filePush(f) {
				_this.segments[this.idx]+=f.target.result + '\r\n';
				_this.now--;
				isDone();
			}

			function isDone() {
				if(_this.now>0) return;
				done();
			}

			function done() {
				console.log(_this.segments);
				bfloc = location.toString();
				history.pushState(bfloc, '로드 중...', 'http://gall.dcinside.com/upload/image?xssDomain=dcinside.com');
				simpleRequest('http://upimg.dcinside.com/upimg_file.php?id='+_ID,function(e) { history.pushState(bfloc, bfloc, bfloc); return callback(e); },'POST',{'Accept':'application/json, text/javascript, */*; q=0.01','Content-Type':'multipart/form-data; boundary='+_this.boundary},"--" + _this.boundary + "\r\n" + _this.segments.join("--" + _this.boundary + "\r\n") + "--" + _this.boundary + "--\r\n");
			}

			var _this = this;
			this.now = 0;
			this.boundary = "----DCLiteFormBoundary" + Date.now().toString(16);
			this.segments = [];
			this.segments.push('Content-Disposition: form-data; name="r_key"\r\n\r\n'+r_key+'\r\n');

			for(i=files.length;i--;) {
				f = files[i];
				reader = new FileReader();
				reader.idx = this.segments.length;
				reader.onload = filePush;
				this.segments.push('Content-Disposition: form-data; name="files[]"; filename="' + f.name.replace(/[\s\=\\"]/g,'\\$0') + '"\r\nContent-Type: ' + f.type + '\r\n\r\n');
				this.now++;
				reader.readAsBinaryString(f);
			}
		}
	}

	function wideFunc() {
		cToggle(document.body,"DCL_wideOn");
		if(MODE.write) {
			return;
		} else if(!wideFunc.init) {
			wideFunc.init = true;
			addStyle("body.DCL_wideOn {padding-right:"+P.wideWidth+"px}");

			if(MODE.article || MODE.comment) {
				addStyle(
					"div#DCL_wideDiv {width:"+P.pageWidth+"px ; margin:0 auto}" +
					"div#DCL_wideDiv > table, div#DCL_wideDiv > table:nth-of-type(2)>tbody>tr>td>table:nth-of-type(3)>tbody>tr:nth-of-type(2)>td>table {width:"+P.pageWidth+"px !important}" +
					"body.DCL_wideOn > div#DCL_wideDiv {height:0}" +
					"body.DCL_wideOn > div#DCL_wideDiv > table {margin-left:"+P.pageWidth+"px ; width:"+P.wideWidth+"px !important}" +
					"body.DCL_wideOn > div#DCL_wideDiv #bgRelaBig * {max-width:"+P.wideWidth+"px !important}" +
					"body.DCL_wideOn > div#DCL_wideDiv > table:nth-of-type(2)>tbody>tr>td>table:nth-of-type(3)>tbody>tr:nth-of-type(2)>td>table {width:"+P.wideWidth+"px !important}" +
					"body.DCL_wideOn > br {display:none}"
				);

				var table = $("body > table:not(#TB,1)");
				var div = cElement("div",[table[0],"prev"],{id:"DCL_wideDiv"});
				for(var i=0,l=table.length ; i<l ; i+=1) {
					div.appendChild(table[i]);
				}
			}
		}
	}

	// 목록에 적용
	function listFunc(p) {
		var tbody = $id("list_table").tBodies[p];
		var rows = tbody.rows;

		tbody.setAttribute("DCL_tbody",p);
		cElement("div",rows[0].cells[0],{id:'dgn_voice_pop_info',className:"hidden",innerHTML:'<div class="pop_info_top"></div><div class="pop_info_con"><div class="ibox_1"><span><img src="http://wstatic.dcinside.com/gallery/images/voice/title_voice.gif" alt="보이스 리플이란?"/></span><a onclick="javascript:vr_guide_closed();" class="btn_close" style="cursor:pointer;"><img src="http://wstatic.dcinside.com/gallery/images/voice/btn_delete_pop.gif" alt="닫기 버튼 "></a></div><div class="ibox_2">보이스 리플이란?  갤러리 게시물에 일반 텍스트 형태가 아닌 <b>음성</b>으로 리플을 등록할 수 있는 기능 입니다. <p>보이스 리플 등록은 스마트폰 전용 어플리케이션을 설치하신후 모바일웹(m.dcinside.com)을 통해 등록 할 수 있습니다.</p></div><div class="ibox_3"><p>[전용 어플리케이션 다운 안내]</p><div class="voice_url"><b>접속 URL</b><span><a href="http://dcinside.com/voice_guide.html">http://dcinside.com/voice_guide.html</a></span></div><div class="voice_txt" ><span>※스마트폰 브라우저 주소창에 위 주소를 입력 또는 우측 qr코드를 스캔해 다운 받을 수 있습니다. </span> </div><img src="http://wstatic.dcinside.com/gallery/images/voice/qrcode_voice.gif" alt="qr code" class="voice_qr"></div></div><div class="pop_info_bottom"></div>'});
		var tbodyBtn = cElement("p",rows[0].cells[0],{className:"DCL_tbodyBtn"});
		cElement("span",tbodyBtn,(p+PAGE)+" 페이지",function(){pageLoad(p);});
		cElement("span",tbodyBtn,"글닫기",function(){Layer.close(p);});

		var a = tbody.querySelectorAll("tr > td:nth-of-type(3) a");
		for(var i=0,l=a.length ; i<l ; i+=1) {
			a[i].href = a[i].href.replace(/([?&]page=)\d+/,"$1"+PAGE);
		}
		
		if(P.listTime) {
			var dates = tbody.getElementsByClassName('t_date');
			for(i=0,l=dates.length;i<l;i++) {
				if(dates[i].title!='') {
					dates[i].textContent = dates[i].title;
					dates[i].title=null;
				}
			}
		}

		var pager = $id('dgn_btn_paging').children;
		for(i=0,l=pager.length;i<l;i++) {
			pager[i].addEventListener("click",function(e) { ePrevent(e); softLoad(this.href); },false);
		}

		removeEventListenerAll($id("search_input"), $id("search_btn"));
		$id("search_input").addEventListener("keypress",function(e) { if(e.keyCode == 13) doSearch(e); });
		$id("search_btn").addEventListener("click",doSearch);
	}

	function doSearch(e) {
		ePrevent(e);
		softLoad("/board/lists/?id=" + _ID + "&s_type=" + $id("search_type").value + "&s_keyword=" + $id("search_input").value);
	}

	// 다중 목록
	function pageFunc(mode) {
		if( P.pageCount < 2) {
			return;
		}

		var list = $id("dgn_btn_paging").getElementsByClassName("on")[0].nextElementSibling;
		for(var i=1,l=P.pageCount ; i<l ; i+=1) { // 페이징 목록에 다중 목록 스타일 추가
			cAdd(list,"DCL_pageLink");
			list = list.nextElementSibling;
			if(!mode) {
				cElement("tbody",$id("list_table"),{innerHTML:"<tr><td colspan='6' class='DCL_tbodyTitle'></td></tr>",className:"list_tbody"});
				pageLoad(i);
			}
		}
	}

	// 목록 데이터 로드
	function pageLoad(p) {
		Layer.close(p);
		var tbody = $id("list_table").tBodies[p];
		var cell = tbody.rows[0].cells[0];

		var exception_mode=parseQuery(location.search).exception_mode;
		var s_type=parseQuery(location.search).s_type;
		var s_keyword=parseQuery(location.search).s_keyword;
		var search_pos=parseQuery(location.search).search_pos;
		if(parseQuery(location.search).page)
			PAGE=parseInt(parseQuery(location.search).page);
		else
			PAGE=1;
		
		var buttons = $('div.btn_bottom a[href^="/board/"], div.btn_bottom a[href^="http://gall.dcinside.com/board/"]',1);
		for(i=buttons.length;i--;) {
			buttons[i].href = buttons[i].href.replace(/([?&]id=)[^&]+/,'$1'+_ID);
		}

		cell.innerHTML = "<span class='DCL_tbodyLoad'>읽는 중... ("+(p+PAGE)+" 페이지)</span>";
		
		simpleRequest("/board/lists/?id="+_ID+"&page="+(p+PAGE)+(s_type!=null?'&s_type='+s_type:'')+(s_keyword!=null?'&s_keyword='+s_keyword:'')+(exception_mode!=null?'&exception_mode='+exception_mode:'')+(search_pos!=null?'&search_pos='+search_pos:''),
			function(response) {
				var text = response.responseText;
				var startPos = text.indexOf("<tr onmouseover=\"this.style.backgroundColor='#eae9f7'\" onmouseout=\"this.style.backgroundColor=''\" class=\"tb\">");
				var html = text.substring(startPos,text.indexOf("</tbody>"));
				if(html) {
					if((g_title=text.match(/gallery_title2\.swf".+"gallery_title=" \+ encodeURIComponent\('([^']+)'\)/)) && g_title[1]) {
						$('.gallery_name').textContent = GALLERY = document.title = g_title[1];
						titleFunc();
					}
					tbody.innerHTML = "<tr><td colspan='6' class='DCL_tbodyTitle'></td></tr>" + (startPos!="-1"?html:'');
					if(p===0) {
						$id('dgn_btn_paging').innerHTML = text.replace(/\n/g, '').match(/<!-- btn_paging -->[^<]+<div id=\"dgn_btn_paging\">(.*)<\/div>[^<]+<!-- \/\/btn_paging -->/)[1];
						if(P.page)
							pageFunc(true);
					}

					listFunc(p);
					Layer.add(p);
					if(P.filter) {
						Filter.article(tbody);
					}
					if(typeof s_keyword == "undefined")
						$id("search_input").value = '';
				} else {
					cell.innerHTML = "";
					cElement("span",cell,{textContent:"읽기 실패 ("+(p+PAGE)+" 페이지)",className:"DCL_tbodyLoad"},function(){pageLoad(p);});
				}
			}
		);
	}

	// 필터 ; 차단 or 강조
	var Filter = {

	init : function() {
		Filter.inited = true;

		var bN = P.blockN;
		var bAN = P.blockAN;
		var bAT = P.blockAT;
		var aAN = P.allowAN;
		var aAT = P.allowAT;
		var bA = bAN || bAT || aAN || aAT;
		Filter.bN = bN;
		Filter.bA = bA;

		if(bN || bA) {
			addStyle(
				"tr.DCL_blockArticle {display:none}" +
				"tr.DCL_blockArticle td.DCL_nameMatch, tr.DCL_blockArticle span.DCL_titleMatch {color:#c00}" +
				"tr.DCL_blockArticleAtAll {display:none}" +
				"tbody.DCL_showArticle > tr.DCL_blockArticle {display:table-row ; background-color:#eee}" +
				"tbody.DCL_showArticle > tr.DCL_blockArticle+tr {display:table-row}" +
				"p.DCL_blockArticleP {float:right}" +
				"p.DCL_blockArticleP > span {margin-right:10px ; font:8pt 돋움}" +
				"p.DCL_blockArticleP > span.DCL_blockTotal {font-weight:bold ; font-size:9pt ; cursor:pointer}"
			);
			if(P.allowStyle) {
				addStyle("tr.DCL_allowArticle td.DCL_nameMatch, tr.DCL_allowArticle span.DCL_titleMatch {font-weight:bold !important ; color:#36c !important");
			}

			Filter.bNA = P.blockNA;
			if(P.blockNR) {
				var date = new Date();
				date.setDate(date.getDate()-P.blockNR);
				Filter.bNR = date.getFullYear() + "/" + (100+date.getMonth()+1).toString(10).substr(1) + "/" + (100+date.getDate()).toString(10).substr(1);
			} else {
				Filter.bNR = false;
			}
			bAN = Filter.name(bAN);
			Filter.bAN = bAN[0];
			Filter.bANid = bAN[1];
			Filter.bAT = Filter.title(bAT);
			aAN = Filter.name(aAN);
			Filter.aAN = aAN[0];
			Filter.aANid = aAN[1];
			Filter.aAT = Filter.title(aAT);
		}

		var bCN = P.blockCN;
		var bCT = P.blockCT;
		var aCN = P.allowCN;
		var aCT = P.allowCT;
		var bC = bCN || bCT || aCN || aCT;
		Filter.bC = bC;

		if(bC) {
			addStyle(
				"tr.DCL_blockComment {display:none}" +
				"tr.DCL_blockComment td.DCL_nameMatch, tr.DCL_blockComment span.DCL_titleMatch {color:#c00 !important}" +
				"table.DCL_showComment tr.DCL_blockComment {display:table-row ; background-color:#f0f0f0}" +
				"p.DCL_blockCommentP {margin:5px 0 ; padding:3px ; ; background-color:#e9e9e9 ; text-align:right}" +
				"p.DCL_blockCommentP > span {margin-right:10px ; font:8pt 돋움}" +
				"p.DCL_blockCommentP > span.DCL_blockTotal {font-weight:bold ; font-size:9pt ; cursor:pointer}" +
				".comment-table > tr:empty {display:none}"
			);
			if(P.allowStyle) {
				addStyle("tr.DCL_allowComment td.DCL_nameMatch, tr.DCL_allowComment span.DCL_titleMatch {font-weight:bold !important ; color:#36c !important");
			}

			bCN = Filter.name(bCN);
			Filter.bCN = bCN[0];
			Filter.bCNid = bCN[1];
			Filter.bCT = Filter.title(bCT);
			aCN = Filter.name(aCN);
			Filter.aCN = aCN[0];
			Filter.aCNid = aCN[1];
			Filter.aCT = Filter.title(aCT);
		}
	},
	name : function(value) {
		if(value===null)
			return '';
		value = value.split("\n");
		var normal = [];
		var id = [];
		var name;
		for(var i=0,l=value.length ; i<l ; i+=1) {
			name = value[i];
			if(name !== "") {
				if(name.charAt(0) === "#") {
					id.push(name);
				} else {
					normal.push(name);
				}
			}
		}
		normal = normal.length ? (new RegExp("^("+normal.join("\n").replace(/([\/()\[\]{}.|$\^])/g,"\\$1").replace(/\n/g,"|").replace(/\\\\/g,"[backslash]").replace(/([^\\]|^)([*+?])/g,"$1.$2").replace(/\[backslash\]/g,"\\\\")+")$")) : null;
		id = id.length ? (new RegExp("^("+id.join("\n").replace(/([\/()\[\]{}.|$\^])/g,"\\$1").replace(/\n/g,"|").replace(/\\\\/g,"[backslash]").replace(/([^\\]|^)([*+?])/g,"$1.$2").replace(/\[backslash\]/g,"\\\\").replace(/\\\(null\\\)/g,"")+")$")) : null;
		return [normal,id];
	},
	title : function(value) {
		return value ? (new RegExp(("("+value.replace(/([\/()\[\]{}?+.|$\^])/g,"\\$1").replace(/\n/g,"|")+")").replace(/</g,"&lt;").replace(/>/g,"&gt;"),"g")) : null;
	},
	article : function(tbody) {
		if(!Filter.inited) {
			Filter.init();
		}
		if(!Filter.bN && !Filter.bA) {
			return;
		}

		var rows = tbody.rows;
		var noticeCnt = 0;
		var articleCnt = 0;
		var titleCnt = 0;
		var blockCnt = {};

		var i=1,l=rows.length;
		if(Filter.bN) {
			var bNA = Filter.bNA;
			var bNR = Filter.bNR;
			for( ; rows[i].cells[0].textContent.indexOf("공지") !== -1 ; i++) {
				if( (!bNR || rows[i].cells[3].textContent.replace(/^\s+|\s+$/g,"") <= bNR) && (!bNA || rows[i].cells[2].textContent.replace(/^\s+|\s+$/g,"") === "운영자") ) {
					cAdd(rows[i],"DCL_blockArticle");
					noticeCnt += 1;
				}
			}
		}

		if(Filter.bA) {
			var bAN = Filter.bAN;
			var bANid = Filter.bANid;
			var bAT = Filter.bAT;
			var aAN = Filter.aAN;
			var aANid = Filter.aANid;
			var aAT = Filter.aAT;
			var cells,name,idC,title,titleC;
			for( ; i<l ; i++) {
				cells = rows[i].cells;
				name = cells[2].getAttribute('user_name');
				idC =  "#" + cells[2].getAttribute('user_id');
				title = cells[1].children[1];
				titleC = title.innerHTML;

				if(aAN && aAN.test(name) || aANid && idC && aANid.test(idC)) {
					cAdd(rows[i],"DCL_allowArticle");
					cAdd(cells[2],"DCL_nameMatch");
				} else if(aAT && aAT.test(titleC)) {
					cAdd(rows[i],"DCL_allowArticle");
					title.innerHTML = titleC.replace(aAT,"<span class='DCL_titleMatch'>$1</span>");
				} else if(bAN && bAN.test(name) || bANid && idC && bANid.test(idC)) {
					if(P.showLabel)
						cAdd(rows[i],"DCL_blockArticle");
					else
						cAdd(rows[i],"DCL_blockArticleAtAll");
					cAdd(cells[2],"DCL_nameMatch");
					articleCnt += 1;
					if(blockCnt[name]) {
						blockCnt[name] += 1;
					} else {
						blockCnt[name] = 1;
					}
				} else if(bAT && bAT.test(titleC)) {
					cAdd(rows[i],"DCL_blockArticle");
					title.innerHTML = titleC.replace(bAT,"<span class='DCL_titleMatch'>$1</span>");
					articleCnt += 1;
					titleCnt += 1;
				}
			}
		}

		if(noticeCnt || (articleCnt && P.showLabel)) {
			var p = cElement("p",rows[0].cells[0],{className:"DCL_blockArticleP"});

			if(noticeCnt) {
				cElement("span",p,"공지("+noticeCnt+")");
			}
			if(articleCnt && P.showLabel) {
				for(i in blockCnt) {
					if(blockCnt.hasOwnProperty(i)) {
						cElement("span",p,i+"("+blockCnt[i]+")");
					}
				}
			}
			if(titleCnt) {
				cElement("span",p,"제목("+titleCnt+")");
			}

			cElement("span",p,{className:"DCL_blockTotal",textContent:"전체["+(noticeCnt+(P.showLabel?articleCnt:0))+"]"},function(){cToggle(tbody,"DCL_showArticle");});
		}
	},
	comment : function(table) {
		if(!Filter.inited) {
			Filter.init();
		}
		if(!Filter.bC) {
			return;
		}

		var bCN = Filter.bCN;
		var bCNid = Filter.bCNid;
		var bCT = Filter.bCT;
		var aCN = Filter.aCN;
		var aCNid = Filter.aCNid;
		var aCT = Filter.aCT;

		var rows = table.rows;
		var commentCnt = 0;
		var titleCnt = 0;
		var blockCnt = {};

		var cells,name,idC,title,titleC;
		var fMode = MODE.article || MODE.comment;
		for(var i=0,l=rows.length ; i<l ; i+=(fMode?4:1)) {
			cells = rows[i].cells;
			name = cells[0].getAttribute('user_name');
			idC =  "#" + cells[0].getAttribute('user_id');
			title = cells[1].getElementsByTagName("div")[0] || cells[1];
			titleC = title.textContent.replace(/</g,"&lt;").replace(/>/g,"&gt;");
			if(aCN && aCN.test(name) || aCNid && idC && aCNid.test(idC)) {
				cAdd(rows[i],"DCL_allowComment");
				cAdd(cells[0],"DCL_nameMatch");
			} else if(aCT && aCT.test(titleC)) {
				cAdd(rows[i],"DCL_allowComment");
				title.removeChild(title.firstChild);
				cElement("span",[title,0],{innerHTML:titleC.replace(aCT,"<span class='DCL_titleMatch'>$1</span>")});
			} else if(bCN && bCN.test(name) || bCNid && idC && bCNid.test(idC)) {
				cAdd(rows[i],"DCL_blockComment");
				if(fMode) {
					cAdd(rows[i+1],"DCL_blockComment");
					cAdd(rows[i+2],"DCL_blockComment");
					cAdd(rows[i+3],"DCL_blockComment");
				}
				cAdd(cells[0],"DCL_nameMatch");
				commentCnt += 1;
				if(blockCnt[name]) {
					blockCnt[name] += 1;
				} else {
					blockCnt[name] = 1;
				}
			} else if(bCT && bCT.test(titleC)) {
				cAdd(rows[i],"DCL_blockComment");
				title.removeChild(title.firstChild);
				cElement("span",[title,0],{innerHTML:titleC.replace(bCT,"<span class='DCL_titleMatch'>$1</span>")});
				commentCnt += 1;
				titleCnt += 1;
			}
		}

		var p = table.nextElementSibling;
		if(p && cSearch(p,"DCL_blockCommentP")) {
			p.parentNode.removeChild(p);
		}
		if(titleCnt || (commentCnt && P.showLabel)) {
			p = cElement("p",[table,"next"],{className:"DCL_blockCommentP"});

			for(i in blockCnt) {
				if(blockCnt.hasOwnProperty(i) && P.showLabel) {
					cElement("span",p,i+"("+blockCnt[i]+")");
				}
			}
			if(titleCnt) {
				cElement("span",p,"내용("+titleCnt+")");
			}

			cElement("span",p,{className:"DCL_blockTotal",textContent:"전체["+(P.showLabel?commentCnt:titleCnt)+"]"},function(){cToggle(table,"DCL_showComment");});
		}
	}
	};

	// 게시물 바로보기
	function Layer(t,r,mode) {
		if(!Layer.inited) {
			Layer.init();
			Layer.inited = true;
		}

		var tbody = $id("list_table").tBodies[t];
		this.row = tbody.rows[r];
		cAdd(this.row,"DCL_layerTr");
		
		this.div = cElement("div",cElement('td', cElement('tr', [tbody.rows[r],"next"]), {colSpan:6}),{className:"DCL_layerDiv"});

		this.mode = mode?mode:"normal";
		this.t = t;
		this.r = r;
		this.no = parseQuery(this.row.cells[1].children[1].href).no;
		this.viewer = new Viewer();

		this.call();
	}
	Layer.init = function() {
		var width = P.pageWidth;
		var css =
			"tr.DCL_layerTr > td {border-width:2px 0 1px ; border-style:solid ; border-color:#000}" +
			"tr.DCL_layerTr > td" + (P.listNumber?":first-child":":nth-child(2)") + " {border-left-width:2px ; border-radius:5px 0 0 0}" +
			"tr.DCL_layerTr > td:nth-child("+(P.listRecom?"6":P.listCount?"5":P.listDate?"4":"3")+") {border-right-width:2px ; border-radius:0 5px 0 0}" +
			"tr.DCL_layerTr + tr > td {border-style:solid; background:none; border-width:0 2px 2px 2px !important; border-radius:0 0 5px 5px; text-align: left !important;}" +

			"div.DCL_layerDiv {position:relative ; width: 100%; padding: 0; border-bottom:0; word-wrap:break-word; overflow:auto; }" +
			".con_substance > *," +
			"#dgn_gallery_left .list_table .list_tbody td > div table td {font-family: Gulim, sans-serif; font-size: 13px; line-height: 24px; color: #1e1e1e; font-weight: normal; border:0; text-align: left;}" +

			"p.DCL_layerTop {font:8pt Tahoma,돋움 ; color:#666; padding: 3px}" +
			"p.DCL_layerTop:not(:only-child) {border-bottom:1px solid #666 ; padding-bottom:2px}" +
			"p.DCL_layerBottom {border-top:1px solid #666 ; padding: 3px ; font:8pt Tahoma,돋움 ; color:#666}" +
			"a.DCL_layerBtn {margin-right:5px ; cursor:pointer; text-decoration:none; color:#666;}" +
			"a.DCL_layerBtn:hover {color:#000}" +
			"span.DCL_layerBtn {margin-right:5px ; cursor:pointer;}" +
			"span.DCL_layerBtn:hover {color:#000}" +
			"span.DCL_layerLoad {color:#999 ; text-decoration:blink}" +
			"span.DCL_layerData {margin-left:5px ; color:#333}" +
			"span.DCL_layerFile {margin-left:5px ; color:#333}" +
			"span.DCL_layerFile > a {display:none ; margin-left:5px ; color:#999 ; text-decoration:underline}" +
			"span.DCL_layerFile:hover > a {display:inline}" +
			"span.DCL_layerFile > a:hover {color:#000}" +

			"div.DCL_layerContent {margin:5px 0}" +
			"ul.DCL_layerImage {margin-bottom:5px}" +
			"ul.DCL_layerFlash iframe {border: 0}" +
			"ul.DCL_layerFlash > li {margin-bottom:5px}" +
			"div.DCL_layerText * {max-width:"+(width-40)+"px}" + // scroll20 + td10 + layerDiv10
			"div.DCL_layerText > .con_substance { padding: 0 10px; font-size: 10pt; font-family: 굴림; }" +

			"table.DCL_layerComment {width:100% ; margin-top:5px ; border-collapse:collapse ; table-layout:fixed; text-align: left !important;}" +
			"table.DCL_layerComment > caption {border-top:1px solid #999 ; border-bottom:1px solid #999 ; padding:2px 5px ; font:10pt 돋움 ; background-color:#eee !important; text-align:left; visibility:visible; width:auto; height:auto;}" +
			"table.DCL_layerComment tr:hover {background-color:#f0f0f0}" +
			"table.DCL_layerComment td { height: auto; vertical-align: middle !important;}" +
			"table.DCL_layerComment td:first-child { padding-left: 5px; }" +
			"table.DCL_layerComment td:last-child { padding-right: 5px; }" +
			"table.DCL_layerComment td {border-bottom:1px solid #ccc !important; text-align: left !important;}" +
			"table.DCL_layerComment td.com_name {width:120px; font:10pt 굴림 !important;}" +
			"table.DCL_layerComment td.com_text {width:auto; font:10pt 굴림 !important; line-height: 22px !important;}" +
			"table.DCL_layerComment td.com_chat {width:10px}" +
			"table.DCL_layerComment td.com_ip {width:110px; font:8pt Tahoma !important;}" +
			"table.DCL_layerComment td.com_btn {width:12px}" +
			"table.DCL_layerComment td.com_btn > img {cursor:pointer}" +
			"table.DCL_layerComment span.line {display:none}" +
			"table.DCL_layerComment span.num2 {margin-left:1em ; font:8pt Tahoma ; color:#999}" +

			"div.DCL_layerContent + p.DCL_replyP {border-top:1px solid #666 ; padding-top:5px}" +
			"p.DCL_replyP {position:relative ; margin:5px 0 ; padding:"+(_GID?"0 45px 0 5px":"0 122px 0 105px")+"}" +
			"p.DCL_replyP > input {height:16px ; border:1px solid #999}" +
			"p.DCL_replyP > input:focus {background-color:#f5f5f5 ; border:1px solid #666}" +
			"input.DCL_replyName {position:absolute ; bottom:0 ; left:0 ; width:100px}" +
			"input.DCL_replyMemo2 {position:relative ; width:100%}" +
			"input.DCL_replyPassword {position:absolute ; bottom:0 ; right:40px ; width:75px}" +
			"input.DCL_replySubmit {position: absolute; bottom: 0; right: 5px; width:35px ; height:20px !important ; font:8pt 돋움; padding: 0;}" +

			"tr.DCL_layerActive > td, tr.DCL_layerActive+tr > td { border-bottom-color: #333 !important; }" +
			"";

		if(P.layerThumb) {
			var tw = P.thumbWidth;
			var th = P.thumbHeight;
			css +=
				"div.DCL_layerContent img {max-width:" + tw + "px; max-height:" + th + "px}" +
				"ul.DCL_layerImage > li {float:left ; width:" + tw + "px ; height:" + th + "px ; margin:5px ; background-color:#f5f5f5 ; border:1px solid #999"+(BROWSER.opera?"":" ; text-align:center")+"}" + // opera 버그
				"ul.DCL_layerImage > li > img {background-color:#fff}" +
				"ul.DCL_layerImage:after {content:'' ; display:block ; clear:both ; width:0 ; height:0 ; overflow:hidden}";
		} else {
			css +=
				"ul.DCL_layerImage > li {margin-bottom:10px}" +
				"ul.DCL_layerImage > li > img {max-width:"+(width-42)+"px ; border:1px solid #999}"; // scroll20 + td10 + layerDiv10 + border2
		}

		if(MODE.list) {
			css +=
				"body.DCL_wideOn tr.DCL_layerActive > td {height:"+(BROWSER.chrome?44:50)+"px ; border-width:2px 0 ; border-style:solid ; border-radius:0 ; background-color:#f5f5f5}" +
				"body.DCL_wideOn tr.DCL_layerActive > td:first-child {border-left-width:2px ; border-radius:5px 0 0 5px}" +
				"body.DCL_wideOn tr.DCL_layerActive + tr > td {border-width:0 ; height:0}"+
				"body.DCL_wideOn div.DCL_layerActive {position:absolute ; margin:-50px 0 0 "+(width-5)+"px ; width:"+(P.wideWidth-20)+"px ; min-height:50px ; "+(P.layerResize?"max-height:"+(document.documentElement.clientHeight-10)+"px ; ":"") + "padding:3px 8px ; border:2px solid #333 ; border-radius:0 5px 5px 5px}" +
				"body.DCL_wideOn div.DCL_layerActive ul.DCL_layerImage > li > img {max-width:"+(P.wideWidth-42)+"px}" + // scroll20 + layerDiv20 + border2
				"body.DCL_wideOn div.DCL_layerActive div.DCL_layerText * {max-width:"+(P.wideWidth-40)+"px}"; // scroll20 + layerDiv20
		}

		if(P.layerResize) {
			var resize = document.documentElement.clientHeight-(P.menuPos==="top"?46:0);
			css += "div.DCL_layerDiv {max-height:"+(resize-34)+"px}";
			if(MODE.list) {
				css += "body.DCL_wideOn div.DCL_layerActive {max-height:"+(resize-10)+"px}";
			}
		}

		addStyle(css);
	};

	Layer.list = {};
	Layer.add = function(t) {
		if(!Layer.list[t]) {
			Layer.list[t] = {};
		}
		var rows = $id("list_table").tBodies[t].rows;
		var img,a,link;
		for(var i=1,l=rows.length ; i<l ; i++) {
			targetA=rows[i].cells[1].children;
			if(!targetA[1])
				cElement('a', rows[i].cells[1], {href:targetA[0].href.replace("view", "comment_view")},Layer.toggle); //
			cElement('a', [rows[i].cells[1],0], {href:targetA[0].href,className:targetA[0].className,innerHTML:"&nbsp;"}); 
			targetA[1].className = "";

			img = targetA[0];
			a = targetA[1];
			comment = targetA[2];
			if(P.layerLink) {
				img.addEventListener("click",Layer.link,false);
				a.addEventListener("click",Layer.toggle,false);
			} else {
				img.addEventListener("click",Layer.toggle,false);
			}
			comment.addEventListener("click",Layer.toggle,false);
			if(P.layerReply && (link=rows[i].cells[2].getElementsByTagName("a")[1])) {
				link.addEventListener("click",Layer.toggle,false);
			}
		}
	};
	Layer.toggle = function(e) {
		ePrevent(e);

		var target = e.currentTarget;
		var row = target.parentNode.parentNode;
		var mode;
		if(target.href.match(/comment_view/)===null) {
			mode = "normal";
		} else {
	//		row = row.parentNode;
			mode = "comment";
		}

		var t = row.parentNode.getAttribute("DCL_tbody");
		var r = row.sectionRowIndex;
		var layer = Layer.list[t][r];
		if(layer) {
			if(layer.mode === mode) {
				layer.close();
			} else {
				layer.close();
				Layer.create(t,r,mode);
			}
		} else {
			Layer.create(t,r,mode);
		}
	};
	Layer.link = function(e) {
		location.href = e.target.nextElementSibling.href;
	};
	Layer.create = function(t,r,mode) {
		Layer.list[t][r] = new Layer(t,r,mode);
	};
	Layer.close = function(t) {
		var layers = Layer.list[t];
		for(var i in layers) {
			if(layers.hasOwnProperty(i)) {
				layers[i].close();
			}
		}
	};

	Layer.prototype.call = function() {
		var layer = this;
		var div = this.div;
		var row = this.row;
		var viewer = this.viewer;
		viewer.clear();

		div.innerHTML = "";
		var btns = cElement("p",div,{className:"DCL_layerTop"});
		cElement("span",btns,{textContent:"닫기",className:"DCL_layerBtn"},function(){layer.close();});
		var loadSpan = cElement("span",btns,{className:"DCL_layerLoad",textContent:"읽는 중..."});

		var now = Layer.now;
		if(now && now !== this) {
			var offset = row.getBoundingClientRect().top;
			if(P.layerSingle) {
				now.close();
			} else {
				now.blur();
			}
			SCROLL.scrollTop += row.getBoundingClientRect().top - offset;
		}
		cAdd(row,"DCL_layerActive");
		cAdd(div,"DCL_layerActive");
		cAdd(document.body,"DCL_layerOn");
		Layer.now = this;
		
		var topMenu = document.createDocumentFragment(); { // 레이어 상단 메뉴
			var topBtn = cElement("p",topMenu,{className:"DCL_layerTop"});
			cElement("span",topBtn,{textContent:"닫기",className:"DCL_layerBtn"},function(){layer.close();});
			cElement("span",topBtn,{textContent:"새로고침",className:"DCL_layerBtn"},function(){layer.call();});
		}

		var bottomMenu = document.createDocumentFragment(),bottomBtn; { // 레이어 하단 메뉴
			bottomBtn = cElement("p",bottomMenu,{className:"DCL_layerBottom"});
			cElement("span",bottomBtn,{textContent:"닫기",className:"DCL_layerBtn"},function(){layer.close();});
			cElement("span",bottomBtn,{textContent:"새로고침",className:"DCL_layerBtn"},function(){layer.call();});
			cElement("a",bottomBtn,{textContent:"신고",href:"/singo/singo_write/?id=singo&singourl="+encodeURIComponent('http://'+location.host+'/board/view/?id='+_ID+"&no="+layer.no)+"&gallname="+encodeURIComponent(GALLERY),target:"_blank",className:"DCL_layerBtn"});
			cElement("a",bottomBtn,{textContent:"수정",href:"/board/modify/?id="+_ID+"&no="+layer.no+"&s_url="+encodeURIComponent('/list.php?id='+_ID),className:"DCL_layerBtn",target:"_blank"});
			cElement("a",bottomBtn,{textContent:"삭제",href:"/board/delete/?id="+_ID+"&no="+layer.no+"&s_url="+encodeURIComponent('/list.php?id='+_ID),className:"DCL_layerBtn"},function(e) {
				e.preventDefault();
				simpleRequest('/board/delete/?id='+_ID+'&no='+layer.no, function(r) {
					var rBody = r.responseText.match(/(<div id="dgn_gallery_wrap"[\s\S]*)(\<\!\-\- \/\/dgn_gallery_wrap \-\-\>|<\/body>)/)[1].toDomElement();

					if(delForm = rBody.querySelector('form#delete')) {
						if(!confirm('삭제된 게시물은 복구할 수 없습니다.\n\n게시물을 삭제하시겠습니까?'))
							return;
						simpleRequest('/forms/delete_submit',function(r) {
								if((reply = r.responseText.split('||')).length>1) {
									if(reply[0] == 'true')
										softLoad('/board/lists/?id='+_ID);
									else
										alert(reply[1]);
								}
								else
									alert(r.responseText);
							},'POST',{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},formWalk(delForm));
					} else if(delForm = rBody.querySelector('form#password_confirm')) {
						if(!(delForm.querySelector('input[name="password"]').value=prompt('삭제된 게시물은 복구할 수 없습니다.\n\n게시물을 삭제하려면 비밀번호를 입력해 주세요.')))
							return;
						
						simpleRequest('/forms/delete_password_submit',function(r) {
								if((reply = r.responseText.split('||')).length>1) {
									if(reply[0] == 'true') {
										cElement('input',delForm,{type:'hidden',name:'key',value:reply[1]});
										simpleRequest('/forms/delete_submit',function(r) {
											if((reply = r.responseText.split('||')).length>1) {
												if(reply[0] == 'true')
													softLoad('/board/lists/?id='+_ID);
												else
													alert(reply[1]);
											}
											else
												alert(r.responseText);
										},'POST',{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},formWalk(delForm));
									}
									else
										alert(reply[1]);
								}
								else
									alert(r.responseText);
							},'POST',{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},formWalk(delForm));
					}
				});
			});
			cElement("span",bottomBtn,{className:"DCL_layerLoad"});
		}
		var docFrag = document.createDocumentFragment();
		var commFrag = document.createDocumentFragment();
		var readytogo = (layer.mode!=='comment'?(P.layerComment?2:1):1);
		if(layer.mode!=='comment') {
			simpleRequest("/board/view/?id="+_ID+"&no="+this.no,
				function(response) {
					if(!Layer.list[layer.t][layer.r]) {
						return;
					}
					readytogo--;
					var text = response.responseText.replace(/^\s+/,"");
					if(text.substr(0,9) === "<!DOCTYPE") {
						text = text.substring(text.indexOf("<!-- dgn_content_de  -->"),text.lastIndexOf("<!-- //dgn_content_de -->"));

						var imgHTML = text.substring(text.indexOf("<div class=\"s_write\">"),text.indexOf("<!-- //con_substance -->"));
						if(!imgHTML) { // 삭제된 게시물
							loadSpan.textContent = "삭제된 글입니다.";
							return;
						}

						if(layer.mode === "normal" && (P.layerText || P.layerImage)) {
							var contentDiv = cElement("div",docFrag,{className:"DCL_layerContent"});

							if(P.layerImage) {/*
								var imgReg = /src=[\"\']*(http:\/\/[a-z0-9]+.dcinside.com\/viewimage\.php\?[^\"\' ]+)/g;
								var imgExec = imgReg.exec(imgHTML);
								if(imgExec) {
									var imgUl = cElement("ul",contentDiv,{className:"DCL_layerImage"});
									var imgLi;
									var img,src;
									do {
										src = imgExec[1] || imgExec[2];
										imgLi = cElement("li",imgUl);
										img = cElement("img",imgLi,{src:src});
										viewer.add(src,img);
									} while( (imgExec=imgReg.exec(imgHTML)) );

								}*/

								var flashReg = /src=\'(http:\/\/mediafile\.dcinside\.com[^\']+)|insertFlash\(\"(http:\/\/flvs\.daum\.net[^\"]+)\", (\d+), (\d+)/g;
								var flashExec = flashReg.exec(imgHTML);
								var iframeReg = /width=\"(\d+)\"[^>]+height=\"(\d+)\"[^>]+src=\"(http:\/\/videofarm\.daum\.net[^\"]+)\"/g;
								var iframeExec = iframeReg.exec(imgHTML);
								if(flashExec || iframeExec) {
									var flashUl = cElement("ul",contentDiv,{className:"DCL_layerFlash"});
									if(flashExec) {
										var flashLi;
										do {
											flashLi = cElement("li",flashUl);
											cElement("object",flashLi,{type:"application/x-shockwave-flash",data:flashExec[1]||flashExec[2],width:flashExec[3]||400,height:flashExec[4]||300});
										} while( (flashExec=flashReg.exec(imgHTML)) );
									}
									if(iframeExec) {
										var iframeLi;
										do {
											flashLi = cElement("li",flashUl);
											cElement("iframe",flashLi,{src:iframeExec[3],width:iframeExec[1]||400,height:iframeExec[2]});
										} while( (iframeExec=iframeReg.exec(imgHTML)) );
									}
								}
							}

							if(P.layerText) {
								var bfloc = document.location.toString();
		//						history.pushState(bfloc, '로드 중...', 'http://'+location.innerhost+'/board/view/?id='+_ID+'&no='+Layer.now.no);
								var DivHtml = text.substring(text.indexOf("<!-- con_substance -->"),text.lastIndexOf('<!-- //con_substance -->'));
								DivHtml= DivHtml.replace(/(<|<\/)(iframe|script)[^>]+>/g, "");

								var textDiv = cElement("div",contentDiv,{className:"DCL_layerText",innerHTML:DivHtml});
								var textImgs = getImgs(textDiv);
								var textImg;
								var imagePopUrl = "http://image.dcinside.com/viewimagePop.php";
								for(var i=0,l=textImgs.length ; i<l ; i+=1) {
									textImg = textImgs[i];

									if(P.albumFullsize)
										textImg.src=textImg.src.replace(/http:\/\/dcimg1\.dcinside\.com\/viewimage\.php(.+)$/g, "http://image.dcinside.com/viewimage.php$1");
									if(textImg.getAttribute('onclick')) {
										origUrl = textImg.getAttribute('onclick').match(/http:\/\/image\.dcinside\.com[^,\'\"\s]+/)[0];
									}
									else if(textImg.parentNode.getAttribute('onclick')) {
										origUrl = textImg.parentNode.getAttribute('onclick').match(/http:\/\/image\.dcinside\.com[^,\'\"\s]+/)[0];
									}
									else
										origUrl = ' ';

									if(textImg.parentNode.tagName=="A") {
										nImg = cElement("img", [textImg.parentNode,"next"], {src:textImg.src});
										textImg.parentNode.parentNode.removeChild(textImg.parentNode);
										textImg = nImg;
									}
									else {
										nImg = cElement("img", [textImg,"next"], {src:textImg.src});
										textImg.parentNode.removeChild(textImg);
										textImg = nImg;
									}

									textImg.removeAttribute("width");
									textImg.removeAttribute("height");
									textImg.removeAttribute("href");
									textImg.removeAttribute("onclick");
									eRemove(textImg,"onclick");

									if(origUrl.substr(0, imagePopUrl.length) === imagePopUrl)
										viewer.add(origUrl.replace("viewimagePop.php", "viewimage.php"),textImg);
									else
										viewer.add(textImg.src,textImg);
								}
								autoLink(textDiv);
		//						history.pushState(bfloc, bfloc, bfloc);
							}

							if(P.hide) {
								Hide.apply(contentDiv);
							}
						}
				//		var ipReg = /(?:IP Address : (\d+\.\d+\.\*\*\*\.\*\*\*))?<br \/>(\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}) <br \/>/g;
						var ipReg = /<li class="li_ip">[\s\n]*(\d+\.\d+)(\.\*\.\*)[\s\n]*<\/li>/g;
						var dateReg = /<li><b>(\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2})<\/b><\/li>/g;
						var ipExec,ip,time;
						while( (ipExec=ipReg.exec(text)) ) {
							ip = ipExec[1]+'.***.***';//+ipExec[2];
						}
						while( (ipExec=dateReg.exec(text)) ) {
							time = ipExec[1];
						}
						
						cElement("span",topBtn,{textContent:"[시간 "+time+(ip?" / IP "+ip:"")+"]",className:"DCL_layerData"});

						var fileReg = /\t<ul class="appending_file"[^>]+>(.+)<\/ul>/m;
						var file = fileReg.exec(response.responseText.replace(/\n/g,''));
						if(file) {
							file = file[1].split("</li><li");
							fileReg = /<a.*href=\"(.+)\".*>(.+)?<\/a>/;
							var fileExec;
							var fileHTML = "";
							var attachviewer = new Viewer();
							l=file.length;
							attach = cElement("span",topBtn,{className:"DCL_layerFile",textContent:"첨부파일("+l+")"});
							for(var i=0; i<l ; i+=1) {
								fileExec = fileReg.exec(file[i]);
								attachviewer.add(fileExec[1], cElement("a",attach,{href:fileExec[1],textContent:fileExec[2]||"　"}));
		//						fileHTML += "<a href='"+fileExec[1]+"'>"+fileExec[2]+"</a>";
							}
						}
						if(readytogo>0) return;
						div.innerHTML = "";
						div.appendChild(topMenu);
						div.appendChild(docFrag);
						div.appendChild(commFrag);
						div.appendChild(bottomMenu);
						if(Layer.now === layer)layer.focus();
					} else { // 로드 에러
						cElement("span",[btns,1],{textContent:"새로고침",className:"DCL_layerBtn"},function(){layer.call();});
						loadSpan.textContent = "읽기 실패";
					}
				}
			);
		}
		
		if(P.layerComment || layer.mode === "comment") {
			var commentTable = cElement("table",commFrag,{className:"DCL_layerComment"});

			var replyP = cElement("p",[commentTable,"next"],{className:"DCL_replyP"});
			var rMemo = cElement("input",replyP,{type:"text",className:"DCL_replyMemo2"});
			rMemo.addEventListener("keypress",function(e){if(e.keyCode===13){layer.reply();}},false);
			layer.rMemo = rMemo;
			if(!_GID) {
				var rName = cElement("input",[replyP,0],{type:"text",className:"DCL_replyName"}); // name
				var rPassword = cElement("input",replyP,{type:"password",className:"DCL_replyPassword"}); // password
				rPassword.addEventListener("keypress",function(e){if(e.keyCode===13){layer.reply();}},false);
				if(P.autoForm) {
					rName.value = P.autoName;
					rPassword.value = P.autoPassword;
				}
			}
			cElement("input",replyP,{type:"button",className:"DCL_replySubmit",value:"확인"},function(){layer.reply();});
			cElement("span",topBtn,{textContent:"댓글",className:"DCL_layerBtn"},function(){rMemo.focus();});

			var bfloc = document.location.toString();
			simpleRequest('/comment/view', 
				function(response) {
					readytogo--;
					commentText=response.responseText.replace(/<\/td><tr>/g, '</td></tr>');
					var ci = commentText.lastIndexOf("<table class=\"gallery_re_contents\">");
					var si = commentText.indexOf("<tr class=\"reply_line\">",ci);
					var ei = commentText.indexOf("</table>",ci);

					if(si > -1 && ei > -1 && si < ei) {
						var proc = document.createDocumentFragment();
						var procTable = cElement("table",proc,{innerHTML:commentText.substring(si,ei)});
						var caption = cElement("caption",commentTable);
						var rows = procTable.rows;
						var lc = 4;
						var btn,onclick;
						var name,cc=0;
						var reg1 = /del_comment_orgin\(\'([^\']+)\',\'[^\']+\',\'[^\']+\',\'\',\'([^\']+)\'\);/;
						var reg2 = /del_comment\(\'([^\']+)\',\'[^\']+\',\'[^\']+\',\'\'\);/;
						var reg3 = /nomember_comment\((\d+)\);/;
						var pwreg = "\"></input>[^<]*<a href=\"javascript:;\" onClick=\"javascript:re_delete\\((\\d+),\\d+,'[^']+',\\d+,'([^']+)'\\);";
						var delExec;
						for(var i=0,l=rows.length ; i<l ; i+=3) {
							ip=null;
							var ipReg = /(\d+\.\d+)(\.\*\.\*)/g;
							if(rows[i].cells[1].getElementsByClassName('etc_ip')[0]){
								while( (ipExec=ipReg.exec(rows[i].cells[1].getElementsByClassName('etc_ip')[0].textContent)) ) {
									ip = ipExec[1]+'.***.***';//+ipExec[2];
								}
								rows[i].cells[1].getElementsByClassName('etc_ip')[0].textContent='';
							}									
							if( (delbox=rows[i].cells[3].children[0]) && (onclick=delbox.getAttribute("href")) ) {
								delbox = delbox.children[0];
								if( delExec=reg3.exec(onclick) ) {
									delExec=(new RegExp("re_password_" + delExec[1]+pwreg)).exec(response.responseText);
									delbox.setAttribute("DCL_del_password",1);
								}
								else if( !(delExec=reg1.exec(onclick)) && !(delExec=reg2.exec(onclick)) ) {
									console.log('삭제 버튼 없음');
								}
								delbox.addEventListener("click",function(e){ layer.delComment(e);});
								delbox.setAttribute("DCL_del_no",delExec[1]);
								delbox.setAttribute("DCL_del_orgin",delExec[2]?delExec[2]:null);
							}
							else { delbox=null; }

							name	= rows[i].cells[0].innerHTML;
							value	= rows[i].cells[1].innerHTML;
							date	= rows[i].cells[2].textContent;
							ktr = cElement('tr', commentTable);
							tnm = cElement('td', ktr, {innerHTML:name,className:'com_name','user_name':rows[i].cells[0].getAttribute('user_name'),'user_id':rows[i].cells[0].getAttribute('user_id')});
							cElement('em', cElement('td', ktr, {innerHTML:value,className:'com_text'}), {textContent:ip});
							cElement('td', ktr, {innerHTML:date,className:'com_ip'});
							btn = cElement('td', ktr, {className:'com_btn'});
							if(delbox)btn.appendChild(delbox);

							if (ip && P.commentColor) {
								var color = ipColorize(ip);
								if (P.commentColorType=="bg")
									ktr.style.backgroundColor = color;
								else if(P.commentColorType=="fg")
									tnm.style.color = color;
								else if(P.commentColorType=="gc")
									cElement('span', tnm, "■").style.color = color;
							}
						}
						l/=3;
						if(P.filter) {
							Filter.comment(commentTable);
						}
						caption.textContent = "[댓글 " + l + "개]";
						layer.row.cells[1].children[2].children[0].textContent = "["+l+"]";
					} else {
						layer.row.cells[1].children[2].textContent = "";
					}
					if(Layer.now === layer) {
						layer.focus();
					}
					if(readytogo>0) return;
					div.innerHTML = "";
					div.appendChild(topMenu);
					div.appendChild(docFrag);
					div.appendChild(commFrag);
					div.appendChild(bottomMenu);
					if(Layer.now === layer)layer.focus();
				},
				"POST", 
				{"Accept":"text/html","Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},'id='+_ID+'&no='+Layer.now.no+'&comment_page=1&ci_t='+csrf_token());
		}
	};
	Layer.prototype.focus = function() {
		var top = this.row.getBoundingClientRect().top - (P.menuPos==="top"?22:0);
		var bottom = this.div.getBoundingClientRect().bottom;
		var height = document.documentElement.clientHeight;
		if(top<0 || bottom-top>height) { // layer 의 top 이 현재 화면 영역 위로 올라간 경우
			SCROLL.scrollTop += top;
		} else if(bottom > height) { // layer 의 bottom 이 현재 화면 영역 아래로 내려간 경우
			SCROLL.scrollTop += bottom - height;
		}
	};
	Layer.prototype.blur = function() {
		if(Layer.now !== this) {
			return;
		}
		cRemove(this.row,"DCL_layerActive");
		cRemove(this.div,"DCL_layerActive");
		Layer.now = null;
		cRemove(document.body,"DCL_layerOn");
	};
	Layer.prototype.close = function() {
		this.blur();
		cRemove(this.row,"DCL_layerTr");
		this.div.parentNode.parentNode.removeChild(this.div.parentNode);
		delete Layer.list[this.t][this.r];
	};
	Layer.prototype.reply = function(){
		var memo = this.rMemo;
		if(!memo.value) {
			alert("댓글 내용을 입력하세요.");
			memo.focus();
			return;
		}
		var data = "id="+_ID+"&no="+this.no+"&memo="+encodeURIComponent(memo.value)+'&ci_t='+csrf_token();
		if(!_GID) {
			var rName = memo.previousSibling;
			var rPassword = memo.nextSibling;
			if(!rName.value) {
				alert("이름을 입력하세요.");
				rName.focus();
				return;
			}
			if(!rPassword.value) {
				alert("비밀번호를 입력하세요.");
				rPassword.focus();
				return;
			}
			data += "&name="+encodeURIComponent(rName.value)+"&password="+encodeURIComponent(rPassword.value);
		}

		this.div.lastChild.lastChild.textContent = "댓글 등록 중...";
		var layer = this;

		var bfloc = document.location.toString();
		history.pushState(bfloc, '로드 중...', 'http://'+location.innerhost+'/board/view/?id='+_ID+'&no='+Layer.now.no);		//리퍼러로 갑질할때 대비용
		simpleRequest("/forms/comment_submit",
			function(response) {
				layer.div.lastChild.lastChild.textContent = "";
				if(response.status != 200) {
					alert("댓글 등록 중 오류가 발생했습니다.\n\n" + response.statusText);
					return;
				}

				var res = /^([^|]+)\|\|(.+)$/.exec(response.responseText);
				if(!res) {
					layer.call();
					return;
				}
				if(res[1] === "false") {
					alert("댓글 등록 중 오류가 발생했습니다.\n\n" + res[2]);
					return;
				}
				layer.call();
			},
			"POST",
			{"Accept":"text/html","Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest","Referer":'http://'+location.innerhost+'/board/view/?id='+_ID+'&no='+Layer.now.no},
			data
		);
		history.pushState(bfloc, bfloc, bfloc);
	};
	Layer.prototype.delComment = function(e) {
		var btn = e.target;
		var password = null;
		if(btn.getAttribute("DCL_del_password")) {
			password = prompt("비밀번호를 입력하세요.","");
			if(!password) {
				return;
			}
		}
		if(!confirm("댓글을 삭제하겠습니까?")) {
			return;
		}

		this.div.lastChild.lastChild.textContent = "댓글 삭제 중...";
		var layer = this;
		var data = "ci_t=" + csrf_token() + "&id=" + _ID + "&no=" + Layer.now.no + "&p_no=" + Layer.now.no + "&re_no=" + btn.getAttribute("DCL_del_no") + "&orgin_no=" + btn.getAttribute("DCL_del_orgin") + "&password=" + password;

		simpleRequest(
			"/forms/comment_delete_submit",
			function(response) {
				layer.div.lastChild.lastChild.textContent = "";
				if(response.status != 200) {
					alert("댓글 삭제 중 오류가 발생했습니다.\n\n" + response.statusText);
					return;
				}

				var res = /^([^|]+)\|\|(.+)$/.exec(response.responseText);
				if(!res) {
					layer.call();
					return;
				}
				if(res[1] === "false") {
					alert("댓글 삭제 중 오류가 발생했습니다.\n\n" + res[2]);
					return;
				}
				layer.call();
			},
			"POST",
			{"Accept":"text/html","Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"},
			data
		);
	};

	// 이미지 뷰어
	function Viewer() {
		this.list = [];
	}
	Viewer.init = function() {
		var box,img,btn,indexSpan,ratioSpan;
		var index,height,width,x,y,ratio,moved,downed,wheeled;
		var open,load,error,close,down,up,contextmenu,move,remove,key,wheel,fit,zoom,position;

		open = function(i) {
			var list = Viewer.list;
			if(i < 0) {
				i = 0;
			} else if(i > list.length-1) {
				i = list.length - 1;
			}
			if(i === index) {
				return;
			}
			Viewer.on = true;
			index = i;
			indexSpan.textContent = "[" + (index+1) + "/" + (list.length) + "]";
			height=width=x=y=ratio=deg=0;
			box.style.display = "block";
			imgbox.style.visibility = "hidden";
			img.style.transform="rotate(0deg)";
			img.removeAttribute("width");
			img.removeAttribute("height");
			img.src = list[i];
			box.style.cursor = "progress";
		};
		load = function() {
			height = img.height;
			width = img.width;
			indexSpan.textContent = "[" + (index+1) + "/" + (Viewer.list.length) + "]"
			sizeSpan.textContent = width + "x" + height;
			addrSpan.href = img.src;
			addrSpan.textContent = img.src.toString().substr(7,20)+"...";
			fit();
			imgbox.style.visibility = "visible";
			box.style.cursor = "crosshair";
		};
		error = function() {
			indexSpan.textContent = "[" + (index+1) + "/" + (Viewer.list.length) + "]";
			box.style.cursor = "not-allowed";
		};
		close = function() {
			box.style.display = "none";
			img.src = "";
			index = null;
			moved = false;
			downed = false;
			wheeled = false;
			Viewer.on = false;
			cRemove(document.body,"DCL_hideMovAll");
			remove();
		};
		down = function(e) {
			if(e.button !== 0) {
				return;
			}
			moved = false;
			downed = true;
			wheeled = false;
			if(e.target.parentNode.id === "DCL_viewerImg") {
				x = e.clientX;
				y = e.clientY;
				document.addEventListener("mousemove",move,false);
				document.addEventListener("mouseout",remove,false);
			}
			ePrevent(e);
		};
		up = function(e) {
			if(e.button === 2 && e.target.parentNode.id !== "DCL_viewerImg" && e.target.tagName !== "A") {
				zoom(1);
			}
			if(e.button === 0 && !moved && !wheeled) {
	//			close();
			}
			moved = false;
			downed = false;
			wheeled = false;
			remove();
		};
		contextmenu = function(e) {
			if(e.target.tagName !== "A" && e.target.parentNode.id !== "DCL_viewerImg") {
				ePrevent(e);
			}
		};
		move = function(e) {
			position(imgbox.getBoundingClientRect().left+e.clientX-x,imgbox.getBoundingClientRect().top+e.clientY-y);
			x = e.clientX;
			y = e.clientY;
			moved = true;
		};
		remove = function() {
			document.removeEventListener("mousemove",move,false);
			document.removeEventListener("mouseout",remove,false);
		};
		key = function(e) {
			if(!Viewer.on) {
				return;
			}
			var code = e.keyCode;
			var rect = imgbox.getBoundingClientRect();
			var width = document.documentElement.clientWidth;
			var height = document.documentElement.clientHeight;
			if(code === 8 || code === 33 || code === 37 || code === 38) { // 다음 이미지
				open(index-1);
			} else if(code === 34 ||code === 39 || code === 40) { // 이전 이미지
				open(index+1);
			} else if(code === 36) { // home
				open(0);
			} else if(code === 35) { // end
				open(Viewer.list.length - 1);
			} else if(code === 13) { // enter
				//nothing to do
				return;
			} else if(code === 107 || code === 187) { // +
				zoom("+");
			} else if(code === 109 || code === 189) { // -
				zoom("-");
			} else if(code === 27) { // esc
				close();
			} else {
				return;
			}
			ePrevent(e);
		};
		wheel = function(e) {
			wheeled = true;
			var up = e.detail<0 || e.wheelDelta>0; // FF&Opera<0,Chrome>0

			if(e.altKey || downed) {
				var r = ratio;
				if(up) {
					r = (Math.floor(ratio*10)+1)/10;
				} else {
					r = (Math.ceil(ratio*10)-1)/10;
				}
				zoom(r);
				remove();
			} else {
				if(up) {
					open(index-1);
				} else {
					open(index+1);
				}
			}
			ePrevent(e);
		};
		fit = function() {
			var ch = document.documentElement.clientHeight;
			var cw = document.documentElement.clientWidth;
			zoom(Math.min(1,ch/height,cw/width));
			position((cw-width*ratio)/2,(ch-height*ratio)/2);
		};
		zoom = function(r) {
			if(r === "+") {
				r = (Math.floor(ratio*10)+1)/10;
			} else if(r === "-") {
				r = (Math.ceil(ratio*10)-1)/10;
			}
			if(r < 0.1) {
				r = 0.1;
			} else if(r > 3) {
				r = 3;
			}
			if(r === ratio) {
				return;
			}
			ratio = r;

			var rect = imgbox.getBoundingClientRect();
			var x_ = rect.left + rect.width/2 - width*ratio/2;
			var y_ = rect.top + rect.height/2 - height*ratio/2;
			img.height = Math.round(height*ratio);
			img.width = Math.round(width*ratio);
			ratioSpan.textContent = "확대/축소: " + Math.round(ratio*100) + "%";
			position(x_,y_);
		};
		rotate = function(r) {
			if(r === "r") {
				deg = (deg+90+360)%360;
			} else if(r === "l") {
				deg = (deg-90+360)%360;
			}
			img.style.transform="rotate(" + deg + "deg)";/*
			var irect = img.getBoundingClientRect();

			var rect = imgbox.getBoundingClientRect();
			var x_ = rect.left + rect.width/2 - irect.width/2;
			var y_ = rect.top + rect.height/2 - irect.height/2;
			imgbox.style.height = irect.height + "px";
			imgbox.style.width = irect.width + "px";
			position(x_,y_);*/
		};
		position = function(x_,y_) {
			var rect = imgbox.getBoundingClientRect();
			var mw = document.documentElement.clientWidth - rect.width;
			var mh = document.documentElement.clientHeight - rect.height;
			if(x_ !== false) {
				if(0 > mw) {
					if(x_ < mw) {
						x_ = mw;
					} else if(x_ > 0) {
						x_ = 0;
					}
				} else {
					if(x_ > mw) {
						x_ = mw;
					} else if(x_ < 0) {
						x_ = 0;
					}
				}
				imgbox.style.left = Math.round(x_) + "px";
			}

			if(y_ !== false) {
				if(0 > mh) {
					if(y_ < mh) {
						y_ = mh;
					} else if(y_ > 0) {
						y_ = 0;
					}
				} else {
					if(y_ > mh) {
						y_ = mh;
					} else if(y_ < 0) {
						y_ = 0;
					}
				}
				imgbox.style.top = Math.round(y_) + "px";
			}
		};

		addStyle(
			"div#DCL_viewerDiv {position:fixed; overflow:hidden ; top:0 ; left:0 ; width:100% ; height:100% ; z-index:102 ; display:none}" +
			"div#DCL_viewerBack {position:fixed; top:0 ; left:0 ; width:100% ; height:100% ; background-color:#000 ; opacity:0.8}" +
			"div#DCL_viewerImg {position:absolute; display: inline-block; }" +
			"div#DCL_viewerImg > img { cursor:all-scroll; }" +
			"div#DCL_viewerBtn {position:absolute; bottom: 0px; left: 0px; right: 0px; }" +
			"div#DCL_viewerBtn > div { opacity: .9; transition: opacity .15s ease-in-out; margin: 0 auto 20px auto; text-align: center; background-color: #292929; width: 408px; height: 72px; border-radius: 36px; cursor: default; overflow: hidden; box-shadow: 0 0 50px black; background-image: linear-gradient(0deg, #222, #333); }" +
			"div#DCL_viewerBtn > div > span:first-of-type { margin-left: 16px; }" +
			"div#DCL_viewerBtn > div > span:last-of-type { margin-right: 16px; }" +
			"div#DCL_viewerBtn > div > span { float: left; margin: 16px 8px; width: 40px; height: 40px; background-color: white; border-radius: 20px; background-repeat: no-repeat; background-position: center; color: transparent; background-size: 25px; opacity: 0.5; }" +
			"div#DCL_viewerBtn > div > span:hover { opacity: 1; }" +
			"div#DCL_viewerExif { opacity: .9; transition: opacity .15s ease-in-out; position: absolute; top: 20px; left: 20px; cursor: default; }" +
			"div#DCL_viewerExif > span { font-family: " + P.fontList + "; font-size: 12pt; color: white; text-shadow:0px 0px 10px #000; display: block; }" +
			"div#DCL_viewerExif > span > a { font-family: " + P.fontList + "; font-size: 12pt; color: white; cursor: pointer; }" +
			"div#DCL_viewerBtnBack, div#DCL_viewerBtnForward {position: absolute; top: 50%; height: 100px; line-height: 100px; font-size: 70px; font-family: Tahoma; z-index: 9999989999; background-color: white; color: black; opacity: 0.5; padding: 5px 10px 15px 10px; margin-top: -50px; cursor: pointer}" +
			"div#DCL_viewerBtnBack {left: 0;  border-radius: 0 10px 10px 0;}" +
			"div#DCL_viewerBtnForward {right: 0; border-radius: 10px 0 0 10px;}" +
			"body.DCL_hideMovAll object, body.DCL_hideMovAll embed {visibility:hidden}" // 이미지 뷰어 사용시 object 가 가리는 것 방지 (일일이 wmode 를 부여할 수는 없음)
		);

		document.addEventListener("keydown",key,false);

		box = cElement("div",document.body,{id:"DCL_viewerDiv"});
		box.addEventListener("mousedown",down,false);
		box.addEventListener("mouseup",up,false);
		box.addEventListener("DOMMouseScroll",wheel,false);
		box.addEventListener("mousewheel",wheel,false);
		box.addEventListener("contextmenu",contextmenu,false);
		box.addEventListener("click",ePrevent,false);

		cElement("div",box,{id:"DCL_viewerBack"},close);

		imgbox = cElement("div",box,{id:"DCL_viewerImg"});
		img = cElement("img",imgbox);
		img.addEventListener("load",load,false);
		img.addEventListener("error",error,false);
		img.addEventListener("dragstart",ePrevent,false);

		btnct = cElement("div",box,{id:"DCL_viewerBtn"});
		btnct.addEventListener("mousedown",ePrevent,false); // drag 방지
		btnct.addEventListener("mouseup",ePrevent,false); // 닫기 방지
		btn = cElement("div",btnct);
		btn.addEventListener("mouseover",function() { exif.style.opacity = btn.style.opacity = 0.9; },false);
		btn.addEventListener("mouseout",function() { exif.style.opacity = btn.style.opacity = 0; },false);

		cElement("span",btn,{textContent:"이전",style:"background-image: url('data:image/gif;base64," + BASE64.viewerPrev + "');"},function(){open(index-1);});
		cElement("span",btn,{textContent:"다음",style:"background-image: url('data:image/gif;base64," + BASE64.viewerNext + "');"},function(){open(index+1);});
		cElement("span",btn,{textContent:"확대",style:"background-image: url('data:image/gif;base64," + BASE64.viewerZoomin + "');"},function(){zoom("+");});
		cElement("span",btn,{textContent:"축소",style:"background-image: url('data:image/gif;base64," + BASE64.viewerZoomout + "');"},function(){zoom("-");});
		cElement("span",btn,{textContent:"왼쪽으로 회전",style:"background-image: url('data:image/gif;base64," + BASE64.viewerRotateL + "');"},function(){rotate("l");});
		cElement("span",btn,{textContent:"오른쪽으로 회전",style:"background-image: url('data:image/gif;base64," + BASE64.viewerRotateR + "');"},function(){rotate("r");});
	//	cElement("span",btn,"원본",function(){zoom(1);});
	//	cElement("span",btn,"창맞춤",fit);
		cElement("span",btn,{textContent:"닫기",style:"background-image: url('data:image/gif;base64," + BASE64.viewerClose + "');"},close);

		exif = cElement("div", box, {id:"DCL_viewerExif"});
		exif.addEventListener("mouseover",function() { exif.style.opacity = btn.style.opacity = 0.9; },false);
		exif.addEventListener("mouseout",function() { exif.style.opacity = btn.style.opacity = 0; },false);
		urlSpan = cElement("span",exif, "파일 주소: ");
		addrSpan = cElement("a", urlSpan, {target:"_blank"});
		indexSpan = cElement("span",urlSpan,"[0/0]");
		ratioSpan = cElement("span",exif,"확대/축소: 100%");
		infoSpan = cElement("span",exif,"이미지 정보: ");
		sizeSpan = cElement("span",infoSpan,"로드 중...");

		backbtn = cElement("div",box,{id:"DCL_viewerBtnBack",textContent:"‹"},function(){open(index-1);});
		fwdbtn  = cElement("div",box,{id:"DCL_viewerBtnForward",textContent:"›"},function(){open(index+1);});

		Viewer.open = open;
		Viewer.inited = true;

	};
	Viewer.prototype.add = function(src,obj) {
		var i = this.list.length;
	//	현재의 과학기술로는 URL 분석이 불가능하여 주석을 걸어 둔다. 2013년 8월 8일.
		if(P.albumFullsize)
			src = src.replace(/http:\/\/dcimg1\.dcinside\.com\/viewimage\.php(.+)$/g, "http://image.dcinside.com/viewimage.php$1");
		this.list[i] = src;
		cAdd(obj,"DCL_viewerItem");
		obj.addEventListener("click",ePrevent,false);
		obj.addEventListener("click",function(instance){return function(){instance.run(i);};}(this),false);
	};
	Viewer.prototype.run = function(i) {
		if(!Viewer.inited) {
			Viewer.init();
		}
		cAdd(document.body,"DCL_hideMovAll");
		Viewer.on = true;
		Viewer.list = this.list;
		Viewer.open(i);
	};
	Viewer.prototype.clear = function() {
		this.list.length = 0;
	};

	// 이미지 모아보기
	function Album(page, more) {
		if(!Album.inited) {
			Album.init();
		}

		Album.on = true;
		Album.complete = false;
		Album.finish = false;
		Album.page = page;
		document.body.style.overflow = "hidden";
		cAdd(document.body,"DCL_hideMovAll");
		$id("DCL_albumDiv").style.display = "block";
		$id("DCL_albumLoad").textContent = "읽는 중...";
		if(!more) {
			Album.count = 0;
			Album.align.last=-1;
			Album.viewer.clear();
			$id("DCL_albumUl").innerHTML = "";
		}

		var albumPage = $id("DCL_albumPage");
		albumPage.innerHTML = "";
		var p = (Math.ceil(page/10)-1)*10+1;
		if(p>10) {
			cElement("span",albumPage,"다음",function(i){return function(){Album(i);};}(p-1));
		}
		for(var l=p+10 ; p<l ; p+=1) {
			cElement("span",albumPage,{textContent:p,className:(p===page?"DCL_albumNow":"")},function(i){return function(){Album(i);};}(p));
		}
		cElement("span",albumPage,"이전",function(i){return function(){Album(i);};}(p));

		Album.display();
	}
	Album.init = function() {
		var width = P.thumbWidth;
		var height = P.thumbHeight;
		var cols = Math.floor(document.documentElement.clientWidth/(width+20));
		Album.cssWidth = document.documentElement.clientWidth-120;

		addStyle(
			"div#DCL_albumDiv {position:fixed ; overflow:hidden ; top:0 ; left:0 ; width:100% ; height:100% ; z-index:101}" +
			"div#DCL_albumBack {position:absolute; top:0; width:100%; height:100%; background-color:#000 ; opacity:0.6}" +
			"div#DCL_albumWrap {position:absolute; top: 30px; bottom: 0px; width:100%; overflow:auto;}" +
			"p#DCL_albumP {overflow:hidden; height:25px; padding-top: 5px; font: 15px " + P.fontList + "; color:#fff ; background-color:#333; position: fixed; top: 0px; left: 0px; right: 0px; z-index: 1;}" +
			"span.DCL_albumBtn {margin-left:10px ; cursor:pointer}" +
			"span#DCL_albumPage {margin-left:15px}" +
			"span#DCL_albumPage > span {margin:5px ; cursor:pointer}" +
			"span#DCL_albumPage > span.DCL_albumNow {font-size: 21px; line-height: 15px; }" +
			"span#DCL_albumLoad {margin-left:20px}" +
			"ul#DCL_albumUl {position:relative ; overflow:auto ; width:" + Album.cssWidth + "px ; margin:10px auto}" +
			"ul#DCL_albumUl > li { position: relative; float:left; margin:5px; border: none; display:none; overflow: hidden; }" +
			"ul#DCL_albumUl > li.DCL_albumDC { border-color:#000; }" +
			"ul#DCL_albumUl > li.DCL_albumLink { border-color:#999; }" +
			"ul#DCL_albumUl img { background-color:#fff}" +
			"ul#DCL_albumUl p { position:absolute; padding: 5px; overflow:hidden; bottom: -1px; left:0; right:0; height:40px; line-height: 15px; background-image: linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,1)); box-shadow: 0 0 1px black; display:none; text-align: center; }" +
			"ul#DCL_albumUl > li:hover p { display: block; }" +
			"ul#DCL_albumUl span {color: #DDD; display: block; height: 15px; overflow: hidden; min-width: 250px; }" +
			"ul#DCL_albumUl span.author{font-weight: bold;}" +
			"ul#DCL_albumUl a { display: inline-block; height: 100%; text-align: left; }"
		);

		Album.on = false; // 앨범 상태 여부
		Album.complete = false; // 렌더링 여부 ; 연결이 여러개이므로 다른 연결에 의해 렌더링(display)이 시작되었는지 체크
		Album.finish = false;
		Album.page = 0; // 현재 페이지
		Album.count = 0; // 이미지 개수

		Album.pData = {}; // 페이지별 이미지가 포함된 글의 번호
		Album.aData = {}; // 글의 데이터
		Album.rData = {}; // 재시도 내역

		Album.viewer = new Viewer();
		Album.inited = true;
		Album.align.last=-1;

		var div = cElement("div",document.body,{id:"DCL_albumDiv"});
		cElement("div",div,{id:"DCL_albumBack"});
		var wrap = cElement("div",div,{id:"DCL_albumWrap"});
		var albumP = cElement("p",wrap,{id:"DCL_albumP"});
		cElement("span",albumP,{textContent:"닫기",className:"DCL_albumBtn"},Album.close);
		cElement("span",albumP,{textContent:"새로고침",className:"DCL_albumBtn"},Album.reload);
		cElement("span",albumP,{id:"DCL_albumPage"});
		cElement("span",albumP,{id:"DCL_albumLoad"});
		cElement("ul",wrap,{id:"DCL_albumUl"});
		
		if(P.albumInfScrl) {
			wrap.addEventListener("scroll", function() {
				if(!Album.complete || !Album.finish)
					return;
				if(wrap.scrollHeight - wrap.clientHeight < wrap.scrollTop + wrap.clientHeight/2) {
					Album(Album.page+1, true);
				}
			});
		}
	};
	Album.display = function(disp) {
		if(!Album.on || Album.complete) {
			return;
		}

		var albumLoad = $id("DCL_albumLoad");
		var pData = Album.pData[Album.page];
		if(pData) {
			var no;
			var load = 0;
			for(var i=0,l=pData.length ; i<l ; i+=1) {
				no = pData[i];
				if(Album.aData.hasOwnProperty(no) && Album.aData[no].status) {
					load += 1;
				} else {
					Album.aCall(no);
				}
			}
			//albumLoad.textContent = "글 읽는 중... (" + Math.floor(load*100/l) + "%)";
			if(load < l) {
				albumLoad.textContent = "글 읽는 중... (" + (l-load) + "개 남음)";
				return;
			}
		} else {
			albumLoad.textContent = "목록 읽는 중...";
			Album.pCall(Album.page);
			return;
		}

		Album.complete = true;
		albumLoad.textContent = "읽기 완료.";

		var fragment = $id("DCL_albumUl");
		if(!disp || (disp && !P.albumRealtime)) {
			Album.loadedCnt=0;
			var data,imgs,li,img,p;
			for(var i=0,l=pData.length ; i<l ; i+=1) {
				data = Album.aData[pData[i]];
				imgs = data.imgs;
				for(var j=imgs.length ; j-- ; ) {
					if(imgs[j][1]!=null) {
						thumb = imgs[j][0];
						orig = imgs[j][1];
					}
					else
						orig = thumb = imgs[j][0];

					if(/\.dcinside\.com/.test(orig))
						type="DC";
					else
						type="Link";

					Album.count += 1;
					li = cElement("li",fragment,{className:"DCL_album"+type});
					img = cElement("img",li,{alt:data.title+" ("+(j+1)+")",src:thumb});
					img.addEventListener("load", function(e) {
						Album.loadedCnt=(Album.loadedCnt || 0) + 1;
						if(Album.loadedCnt==Album.count) {
							Album.align();
						}
					});
					img.addEventListener("error", function(e) {
						Album.count--;
						removeElement(this.parentNode);
						if(Album.loadedCnt==Album.count) {
							Album.align();
						}
					});
					Album.viewer.add(orig,img);
					
					p = cElement("p",li);
					ah=cElement("a",p,{href:"/board/view/?id="+_ID+"&no="+data.no,target:"_blank"});
					cElement("span",ah,{textContent:data.name,className:"author"});
					cElement("span",ah,{textContent:data.title});
				}
			}
		}
		Album.align();
		albumLoad.textContent = "로드 완료 (" + Album.count + " 개 로드됨)";
		Album.finish=true;
		if(disp && P.albumInfScrl) {
			var wrap = $id('DCL_albumWrap');

			if(wrap.scrollHeight - wrap.clientHeight < wrap.scrollTop + wrap.clientHeight/2) {
				Album(Album.page+1, true);
			}
		}
	};
	Album.align = function() {
		var target = $id("DCL_albumUl").childNodes;
		var _width  = Album.cssWidth;
		var _max_height = P.thumbHeight; // 구분선 20px
		var wsum = 0;
		if(typeof Album.align.last==="undefined") Album.align.last = -1;
		
		for(i=Album.align.last+1;i<target.length;i++) {
			img = target[i].firstChild;
			img.style.maxWidth=img.style.maxHeight=null;
			img.realWidth  =img.width;
			img.realHeight =img.height;
			wsum += img.realWidth/img.realHeight; // 높이를 1로 두었을 때 너비
			if(_max_height >= (_width-(i-Album.align.last+1)*10)/wsum) {
				for(k=Album.align.last+1;k<=i;k++) {
					kimg = target[k].firstChild;
					kimg.style.height = ((_width-(i-Album.align.last+1)*10)/wsum) + "px";
					kimg.parentNode.style.display= "inline-block";
				}
				Album.align.last = i;
				wsum = 0;
			}
		}
		for(k=Album.align.last+1;wsum && k<=i;k++) {
			if(!target[k])
				continue;
			kimg = target[k].firstChild;
			kimg.style.height = _max_height + "px";
			kimg.parentNode.style.display= "inline-block";
		}
	}
	Album.pCall = function(page) {
		if(Album.pData.hasOwnProperty(page)) {
			return;
		}

		var exception_mode=parseQuery(location.search).exception_mode;
		var s_type=parseQuery(location.search).s_type;
		var s_keyword=parseQuery(location.search).s_keyword;
		var search_pos=parseQuery(location.search).search_pos;
		simpleRequest("/board/lists/?id="+_ID+"&page="+page+(s_type!=null?'&s_type='+s_type:'')+(s_keyword!=null?'&s_keyword='+s_keyword:'')+(exception_mode!=null?'&exception_mode='+exception_mode:'')+(search_pos!=null?'&search_pos='+search_pos:''),
			function(response) {
				var text = response.responseText.replace(/^\s+/,"");
				if(text.substr(0,9) === "<!DOCTYPE") {
					var regexp = new RegExp("class=\"t_subject\"><a href=\"/board/view/[^\"]+no=([0-9]+)[^\"]+\" class=\"icon_pic_n\"","g");
					var exec;
					Album.pData[page] = [];
					while( (exec=regexp.exec(text)) ) {
						var no = exec[1];
						Album.pData[page].push(no);
						if(!Album.aData.hasOwnProperty(no)) {
							Album.aCall(no);
						}
					}
					$id("DCL_albumLoad").textContent = "준비 중...";
					Album.display(true);
				} else { // 응답을 못받았을 경우(과다 사용자)
					$id("DCL_albumLoad").textContent = "읽기 실패";
				}
			}
		);
	};
	Album.aCall = function(no) {
		if(Album.aData.hasOwnProperty(no)) {
			return;
		}
		Album.aData[no] = {status:false};

		simpleRequest("/board/view/?id="+_ID+"&no="+no,
			function(response) {
				var text = response.responseText.replace(/^\s+/,"");
				if(text.substr(0,9) === "<!DOCTYPE") {
					var data = Album.aData[no];
					data.no = no;
					var tagStartsFrom=text.search(/<span class=\"user_layer\"/);
					data.name=/user_name=\"([^\"]+)\"/.exec(text.substring(tagStartsFrom,tagStartsFrom+500));
					data.isdisplayed = false;
					if(data.name===null) {
						Album.rData[no] = (Album.rData[no] || 0) + 1;
						if(Album.rData[no] < 3) {
							Album.aCall(no); // 2번 이내의 경우 재호출(리턴)
							return;
						} else {
							delete Album.rData[no];
							Album.aData[no].status = true; // 3번째는 뛰어넘기
							return;
						}
					}
					data.name = data.name[1];
					try{
						var titleTagStartsFrom=text.search(/<dl class=\"wt_subject\"/);
						var mobileImgTag="<span style='display: inline-block;vertical-align: middle;margin: -4px 0 0 2px;'><img src='http://wstatic.dcinside.com/gallery/images/mobile_icon_1.gif' border='0'></span>";
						var extracted=/<dd>(.+?)<\/dd>/.exec(text.substring(titleTagStartsFrom,titleTagStartsFrom+300))[1];
						if(extracted.indexOf(mobileImgTag)!=-1) extracted=extracted.replace(mobileImgTag,'');
						data.title=extracted;
					} catch(err) {
						data.title = null;
					}
					data.imgs = [];
					data.status = true;
					delete Album.rData[no];

					var html,regexp,exec;
					if( (html=text.substring(text.indexOf("<!-- con_substance -->"),text.indexOf("<!-- //con_substance -->"))) ) {
						regexp = /(|onClick=\"javascript:window\.open\(\'(http:\/\/image\.dcinside\.com\/viewimagePop\.php[^\']+)\'[^\"]+\">)<img[^>]*src=[\'\">\s]?([^\'\" >]+)[\'\">\s]?/mig;
						while( (exec=regexp.exec(html)) ) {
							if(typeof exec[2]!="undefined")
								exec[2] = exec[2].replace("viewimagePop.php", "viewimage.php");
							if(!(/wstatic\.dcinside\.com|images\/g_fix\.gif|dc2\.dcinside\.com/.test(exec[3]))) {
								full = (typeof exec[2]!="undefined"?exec[2]:null)
								data.imgs.push([exec[3].replace(/&amp;/g,"&"),full]);
							}
						}
					}
					if(P.albumRealtime) {
						var fragment = $id("DCL_albumUl");
						var data,imgs,li,img,p;
						imgs = data.imgs;
						for(var j=imgs.length ; j-- ; ) {
							if(imgs[j][1]!=null) {
								thumb = imgs[j][0];
								orig = imgs[j][1];
							}
							else
								orig = thumb = imgs[j][0];

							if(/\.dcinside\.com/.test(orig))
								type="DC";
							else
								type="Link";

							Album.count += 1;
							li = cElement("li",fragment,{className:"DCL_album"+type});
							img = cElement("img",li,{alt:data.title+" ("+(j+1)+")",src:thumb});
							img.addEventListener("load", function(e) {
								Album.loadedCnt=(Album.loadedCnt || 0) + 1;
								if(Album.loadedCnt==Album.count) {
									Album.align();
								}
							});
							img.addEventListener("error", function(e) {
								Album.count--;
								removeElement(this.parentNode);
								if(Album.loadedCnt==Album.count) {
									Album.align();
								}
							});
							Album.viewer.add(orig,img);
							
							p = cElement("p",li);
							ah=cElement("a",p,{href:"/board/view/?id="+_ID+"&no="+data.no,target:"_blank"});
							cElement("span",ah,{textContent:data.name,className:"author"});
							cElement("span",ah,{textContent:data.title});
						}
					}
				} else { // 응답을 못받았을 경우
					Album.rData[no] = (Album.rData[no] || 0) + 1;
					if(Album.rData[no] < 3) {
						Album.aCall(no); // 2번 이내의 경우 재호출(리턴)
						return;
					} else {
						delete Album.rData[no];
						Album.aData[no].status = true; // 3번째는 뛰어넘기
					}
				}

				Album.display(true);
			}
		);
	};
	Album.reload = function() {
		Album.pData = {};
		Album.aData = {};
		Album.rData = {};
		Album(Album.page);
	};
	Album.close = function() {
		$id("DCL_albumDiv").style.display = "none";
		$id("DCL_albumLoad").textContent = "";
		$id("DCL_albumUl").innerHTML = "";
		Album.on = false;
		cRemove(document.body,"DCL_hideMovAll");
		document.body.style.overflow = "auto";
	};

	// 이미지 & 동영상 차단
	var Hide = {

	apply : function(obj) {
		if(!Hide.init) {
			addStyle(
				"span.DCL_hideImgBtn, span.DCL_hideMovBtn {position:absolute ; width:25px ; height:14px ; cursor:pointer ; opacity:0.8 ; z-index:100}" +
				"span.DCL_hideImgBtn:hover, span.DCL_hideMovBtn:hover {opacity:1 !important}" +
				"span.DCL_hideImgBtn {background-image:url('data:image/png;base64,"+BASE64.hideImg+"')}" +
				"span.DCL_hideMovBtn {background-image:url('data:image/png;base64,"+BASE64.hideMov+"')}" +
				"span.DCL_hideOff {background-image:url('data:image/png;base64,"+BASE64.hideOff+"')}" +

				"span.DCL_hideImgBtn {visibility:hidden ; margin-left:-25px}" +
				".DCL_hideImg:hover + span.DCL_hideImgBtn {visibility:visible}" +
				"span.DCL_hideImgBtn:hover {visibility:visible}" +
				".DCL_hideImg.DCL_hideOn {visibility:hidden}" +
				"span.DCL_hideImgBtn.DCL_hideOn {visibility:visible}" +

				"span.DCL_hideMovBtn {opacity:0.5 ; margin:-14px 0 0 -25px}" +
				"a + span.DCL_hideMovBtn.DCL_hideOff {margin-left:-60px}" +
				".DCL_hideMov:hover + span.DCL_hideMovBtn {opacity:0.8}" +
				".DCL_hideMov:hover + a + a + span.DCL_hideMovBtn {opacity:0.8}" +
				".DCL_hideMov.DCL_hideOn {display:none}" +
				"span.DCL_hideMovBtn.DCL_hideOn {opacity:0.8 ; position:relative ; display:block ; margin:0}" +

	//			"p.DCL_hideBtns {margin-bottom:10px}" +
				"p.DCL_hideBtns > span {display:inline-block ; width:30px ; height:17px ; margin:3px ; cursor:pointer ; opacity:0.5}" +
				"span.DCL_viewAll {background-image:url('data:image/png;base64,"+BASE64.viewAll+"')}" +
				"span.DCL_hideAll {background-image:url('data:image/png;base64,"+BASE64.hideAll+"')}" +
				"p.DCL_hideBtns > span:hover {opacity:1}"
			);
			document.addEventListener("keydown",Hide.keydown,false);
			Hide.init = true;
		}

		var btns = [];
		var index = Hide.list.length;
		Hide.list[index] = btns;
		var i,l,btn,className;

		var imgs = getImgs(obj);
		if(imgs.length) {
			if(P.hideImg) {
				className = "DCL_hideOn";
			} else {
				className = "DCL_hideOff";
			}
			var img;
			for(i=0,l=imgs.length ; i<l ; i+=1) {
				img = imgs[i];
				cAdd(img,"DCL_hideImg "+className);
				btn = cElement("span",[img,"next"],{className:"DCL_hideImgBtn "+className},Hide.receive);
				btns.push(btn);
			}
		}

		var movies = [];
		var objects = obj.getElementsByTagName("object");
		for(i=0,l=objects.length ; i<l ; i+=1) {
			if(objects[i].id !== "mx") { // 기본 플래쉬 광고 예외
				movies.push(objects[i]);
			}
		}
		var embeds = obj.getElementsByTagName("embed");
		for(i=0,l=embeds.length ; i<l ; i+=1) {
			if(embeds[i].parentNode.nodeName !== "OBJECT") {
				movies.push(embeds[i]);
			}
		}
		if(movies.length) {
			if(P.hideMov) {
				className = "DCL_hideOn";
			} else {
				className = "DCL_hideOff";
			}
			var movie,next;
			for(i=0,l=movies.length ; i<l ; i+=1) {
				movie = movies[i];
				cAdd(movie,"DCL_hideMov "+className);
				btn = cElement("span",null,{className:"DCL_hideMovBtn "+className},Hide.receive);
				btns.push(btn);

				next = movie.nextSibling;
				while(next && next.nodeName==="A" && getComputedStyle(next,null).getPropertyValue("-moz-binding").indexOf("chrome://adblockplus/") !== -1) { // Firefox 에서 Adblock Plus 차단 버튼(탭)을 사용하는 경우
					next = next.nextSibling;
				}
				movie.parentNode.insertBefore(btn,next);
			}
		}

		if(btns.length) { // 버튼 넣기
			var allP = cElement("p",[obj,0],{className:"DCL_hideBtns"});
			cElement("span",allP,{className:"DCL_viewAll"},function(){Hide.all(index,true);});
			cElement("span",allP,{className:"DCL_hideAll"},function(){Hide.all(index,false);});
		}
	},
	list : [],
	keydown : function(e) {
		var tag = e.target.nodeName;
		if(tag === "INPUT" || tag === "TEXTAREA" || Viewer.on || Album.on) {
			return;
		}
		var code = e.keyCode;
		var flag = (code===45||code===192)?true : (code===46||code===27)?false : null;
		if(flag !== null) {
			for(var i=0,l=Hide.list.length ; i<l ; i+=1) {
				Hide.all(i,flag);
			}
			ePrevent(e);
		}
	},
	all : function(index,flag) {
		var btns = Hide.list[index];
		for(var i=0,l=btns.length ; i<l ; i+=1) {
			Hide.toggle(btns[i],flag);
		}
	},
	receive : function(e) {
		ePrevent(e);
		var btn = e.target;
		Hide.toggle(btn,cSearch(btn,"DCL_hideOn"));
	},
	toggle : function(btn,flag) {
		if(flag === cSearch(btn,"DCL_hideOff")) {
			return;
		}
		var obj = btn.previousSibling;
		while(obj && obj.nodeName==="A" && getComputedStyle(obj,null).getPropertyValue("-moz-binding").indexOf("chrome://adblockplus/") !== -1) {
			obj = obj.previousSibling;
		}

		if(flag) {
			cSwitch(obj,"DCL_hideOn","DCL_hideOff");
			cSwitch(btn,"DCL_hideOn","DCL_hideOff");
		} else {
			cSwitch(obj,"DCL_hideOff","DCL_hideOn");
			cSwitch(btn,"DCL_hideOff","DCL_hideOn");
		}
	}

	};

	function LongCookie() {
		var expires = new Date();
		var domain = location.host.substr(location.host.indexOf('.'));
		var cookie = /(?:^|; )PHPSESSID=([^;]*)/.exec(document.cookie);
		expires.setDate( expires.getDate() + 30 );
		document.cookie = 'PHPSESSID='+cookie[1]+'; path=/; domain='+domain+'; expires='+expires.toGMTString()+';';
	}

	function csrf_token() {
		return document.cookie.match(/ci_c=([^;]+)(;|$)/)[1];
	}

	function cookieDelete() {
		var expires = new Date();
		var domain = location.host.substr(location.host.indexOf('.'));
		var cookie = /(?:^|; )PHPSESSID=([^;]*)/.exec(document.cookie);
		expires.setDate( expires.getDate() - 1 );
		document.cookie = 'PHPSESSID=; path=/; domain='+domain+'; expires='+expires.toGMTString()+';';
		document.cookie = 'PHPSESSID=; path=/; domain='+location.host+'; expires='+expires.toGMTString()+';';
		alert('초기화되었습니다.');
		location.reload();
	}

	function shortkey(e) {
		if(e.target.tagName != "BODY")
			return;

		console.log(e); 
		// . => 190
		// n =>  78
		// r =>  82

		if(e.keyCode == 190) {
			ePrevent(e);
			pageLoad(parseInt($('p.DCL_tbodyBtn').firstChild.textContent)-1);
		} else if(e.keyCode == 78) {
			location.href = "/board/write/?id=" + _ID;
		}
	}

	// 실제 실행
	function DCINSIDE_LITE() {
		if(BROWSER.iphone)
			cElement('meta',document.head,{'name':'viewport','content':'width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1'});
		if(MODE.settings)
			return SET.call();
		addStyle(
			'* { -webkit-text-size-adjust: none; }' +
			".banner_box, #dgn_footer, #dgn_gallery_right_detail { display:none !important; }" +
			"#dgn_gallery_right { " + (P.sidebar?'':'display:none !important; ') + "background-color: #F4F4F4; position: absolute; right: 0; }" +
			'#dgn_gallery_detail, .gallery_re_contents, #dgn_gallery_left .gallery_box, .re_gall_box_5, #dgn_gallery_list, .re_gall_box_5, .re_input { width: 100% !important; }' +
			"#dgn_gallery_left { width: 100% !important; box-sizing: border-box; "+(P.sidebar?"padding-right: 260px; ":"float: none; ")+"}" +
			'.menu_bg iframe, #dgn_globalmenu { width: 100% !important;}' +
			'#dgn_globalmenu .menu_bg > div { position: static !important; }' +
			'#dgn_gallery_left .gallery_box { box-sizing: border-box; }' +
			'.re_textarea { width: '+(P.pageWidth-350)+'px !important;}' +

			'#dgn_gallery_detail { position: static; margin: 20px 0 0 0; }' +
			'.appending_file { width:'+(P.pageWidth-10)+'px !important; }' +
			'.resize_bar > div { left: 50px !important; }' +

			"#dgn_gallery_left .gallery_title { display: " + (P.title?"block":"none") + "; height: 37px !important; }" +
			"#dgn_gallery_left .gallery_title > h1 { top: 0px !important; }" +
			"#dgn_gallery_left .gallery_title > h1 > embed { display: none; }" +
			"#dgn_gallery_left .gallery_title > h1 > a { font-family: " + P.fontList + "; letter-spacing: -1px; font-size: 22px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 12px; }" +
			"#dgn_gallery_left .gallery_title > h1 > a > span { text-shadow: 0 0 1px; }" +
			"#dgn_gallery_left .gallery_title > h1 > a > span.gallery_str { color: #5B79C9; }" +
			"#dgn_gallery_left .gallery_box { display: " + (P.best?"block":"none") + "; " + (P.title?"":"top: 0px !important;") + "}" +
			"#dgn_gallery_left .gallery_box {position: static !important; margin-bottom: 10px; "+(!MODE.list?'':'height: 175px !important;')+"}" +
			"#dgn_gallery_left .gallery_list {position: static !important; padding: 0 !important;}" +
			"#dgn_gallery_left .list_table {margin-top: 0px;}" +
			"#dgn_gallery_left .con_lately :after {clear:both; content: \" \";}" +
			"#dgn_gallery_left .select_div { width: 100% !important; margin: 0 auto !important; }" +
			"#dgn_gallery_left .select_div ul { z-index: 1000; }" +

			"#dgn_popup_4 { top: 0px !important; }" +
			"#dgn_gallery_write { top: 0px !important; }" +

			"#dgn_header_gall, #dgn_gallery_wrap, #dgn_gallery_write {width:100% !important; margin: 0 auto !important; background: none !important;}" +
			".con_substance *, #writeForm * { max-width: 100%; }" +

			"#dgn_content_write .write_gall_box_1:after { clear: both; content: ' '; display: block; }" +

			".con_substance {word-wrap:break-word}" +
			".con_substance > span div[id^='dc_imgFree_'] {display:none !important}" +
			".con_substance div[id^='dc_image_'] {top:auto !important; left:3px !important; bottom:25px}" +
			".con_substance img[id^='paranimg_m_'] {border:none !important}" +
			".re_gall_box_1 .con_substance .DCL_viewerItem {margin-left: -10px;}" +

			"#list_table {table-layout:fixed; clear:both; font-family: Tahoma, sans-serif; border-collapse: separate; border-spacing: 0; }" +
			"#list_table > * > tr > td," +
			"#list_table > * > tr > th {overflow:hidden; height: 26px !important; vertical-align: middle; }" +
			"#list_table > * > tr > td.t_date { line-height: normal !important; }" +
			"#list_table > colgroup > col:nth-child(1) {width:"+(P.listNumber?72:0)+"px;}" +
			"#list_table > colgroup > col:nth-child(2) {width:100%;}" +
			"#list_table > colgroup > col:nth-child(3) {width:125px;}" +
			"#list_table > colgroup > col:nth-child(4) {width:"+(P.listDate?110:0)+"px;}" +
			"#list_table > colgroup > col:nth-child(5) {width:"+(P.listCount?35:0)+"px;}" +
			"#list_table > colgroup > col:nth-child(6) {width:"+(P.listRecom?35:0)+"px;}" +
			"#list_table .list_tbody .tb td { padding-top: 3px; padding-bottom: 0; }" +
			"#list_table .list_tbody > tr > td > a:first-child { padding: 0 !important; width: 23px !important; text-decoration: none; }" +
			"#list_table .list_tbody > tr.tb:hover { background-color: #eae9f7; }" +

			"#reply1 {width:auto !important}" +
			"table.comment-table {table-layout:fixed; text-align: left !important;}" +
			"table.comment-table > colgroup {display:none}" +
			"table.comment-table td {line-height: 22px;}" +
			"table.comment-table td.com_name {width:120px}" +
			"table.comment-table td.com_text {width:auto; text-align: left !important;}" +
			"table.comment-table td.com_chat {width:10px}" +
			"table.comment-table td.com_ip {width:110px ; font:8pt Tahoma}" +
			"table.comment-table td.com_btn {width:12px}" +
			"td.com_text > div {display:inline}" +
			"td.com_text > em {color: #999; font-size: 11px !important; border-left: 0px solid #999; padding-left: 3px; margin-left: 1px;}" +

			"#soea_areast { margin-left: "+(0-(P.pageWidth/2+150))+"px !important; }" +
			".ad_left_wing_list_top, " +
			".ad_left_wing_con_top { left: -150px !important; }" +

			".best_img, .hit_img, .issue_img, .con_img { background-color: white; background-image: url('data:image/png;base64,"+BASE64.transparentBg+"'); text-align: center; display: table-cell; vertical-align: middle; }" +
			".best_img img { width: auto; height: auto; max-width: 123px; max-height: 92px; }" + 
			".hit_img img { width: auto; height: auto; max-width: 220px; max-height: 120px; }" + 
			".issue_img img { width: auto !important; height: auto !important; max-width: 105px; max-height: 67px; }" + 
			".con_img img { width: auto; height: auto; max-width: 85px; max-height: 60px; }" + 

			// 로딩 오류시
			"#dgn_wrap {width:100% !important;}" +
			"#testDiv > table[width='200'], #right_div {display:none}" +
			"a[href^='javascript:mobile_direct'] { display: none; }"
			);

		addStyle(
			"td.DCL_tbodyTitle {text-align: left !important; padding: 0; background-color:#eee ; border-top:1px solid #dbdbdb}" +
			"td.DCL_tbodyTitle > p:after {content:'' ; display:block ; clear:both ; width:0 ; height:0 ; overflow:hidden}" +
			"p.DCL_tbodyBtn {float:left; margin-top:0;margin-bottom:0;}" +
			"p.DCL_tbodyBtn > span {font:9pt Tahoma,돋움 ; color:#333 ; margin:5px ; cursor:pointer}" +
			"a.DCL_pageLink {color:#fa0 !important}" +
			"span.DCL_tbodyLoad {margin:5px ; font:9pt Tahoma,돋움}" +

			"p#DCL_writeBtn {text-align:left}" +
			"p#DCL_writeBtn > span {border:1px solid #bbb ; border-radius:3px ; padding:2px 7px 3px ; font:8pt Tahoma,돋움 ; background-color:#f9f9f9 ; cursor:pointer}" +

			".DCL_viewerItem {cursor:pointer}"
			);

		if(P.listComment) {
			addStyle("#list_table > tbody > tr > td:nth-of-type(3) > font > a:empty:after {content:'[0]'}");
		}

		// 쿠키 연장
		if(P.longExpires)
			LongCookie();

		// body에 클래스 추가
		if(!P.header && $id("dgn_header_gall")!==null) {
			$id("dgn_header_gall").style.display = "none";
		}

		if(P.wide) {
			wideFunc();
		}
		// 브라우저 타이틀 변경
		titleFunc();

		// 메뉴 생성
		menuFunc();

		if($('#dgn_gallery_left .gallery_title > h1')) {
			$('#dgn_gallery_left .gallery_title > h1').innerHTML = '';
			var title = cElement('a', $('#dgn_gallery_left .gallery_title > h1'), {href:"/board/lists/?id="+_ID}, function(e) { ePrevent(e); softLoad("/board/lists/?id="+_ID); });
			cElement('span', title, {textContent:GALLERY,className:"gallery_name"});
			cElement(null, title, " ");
			cElement('span', title, {textContent:"갤러리",className:"gallery_str"});
		}

		// 글쓰기 모드
		if(MODE.write) {
			if($id("edit_buts")!==null) {
				var editTd = $id("edit_buts").parentNode.parentNode.lastElementChild;
				editTd.innerHTML = "";
				var editP = cElement("p",editTd,{id:"DCL_writeBtn"});
			}
			var editVisual = $id("editVisual");
			var editNomal = $id("editNomal");

			// 자동입력
			if(P.autoForm) {
				var autoName = $id("name");
				var autoPassword = $id("password");
				if(autoName) {
					autoName.value = P.autoName;
					autoName.style.background = "#FAFFBD";
					autoName.addEventListener("keydown", function() { this.style.background = ""; });
				}
				if(autoPassword) {
					autoPassword.value = P.autoPassword;
					autoPassword.style.background = "#FAFFBD";
					autoPassword.addEventListener("keydown", function() { this.style.background = ""; });
				}
			}
			
			if(_ID!='singo') {
				// 글제목 길이 제한 없애기
				$id("subject").removeAttribute("maxLength");
			}

			// 페이지를 벗어날 때 확인
			window.addEventListener("beforeunload",
				function(e) {
					if($id("zb_waiting").style.visibility !== "visible") {
						ePrevent(e);
						return "현재 페이지에서 나가시겠습니까?";
					}
				},
			false);

		} else if(MODE.singo) {
			// 자동입력
			if(P.autoForm) {
				var autoName = $id("nonmember_id");
				var autoPassword = $id("nonmember_password");
				if(autoName) {
					autoName.value = P.autoName;
					autoName.style.background = "#FAFFBD";
					autoName.addEventListener("keydown", function() { this.style.background = ""; });
				}
				if(autoPassword) {
					autoPassword.value = P.autoPassword;
					autoPassword.style.background = "#FAFFBD";
					autoPassword.addEventListener("keydown", function() { this.style.background = ""; });
				}
			}

			if(parseQuery(location.search).gallname && parseQuery(location.search).singourl) {
				$id('singo_gallery').value = decodeURIComponent(parseQuery(location.search).gallname);
				$id('singo_url').value = decodeURIComponent(parseQuery(location.search).singourl);
				$id('singo_menu').focus();
			}
			else
				$id('singo_gallery').focus();
		} else {
			// 글쓰기 이외 모드

			// 본문보기 모드
			if(MODE.article) {
				var bgRelaBig = $(".s_write");

				// 본문 내 이미지 작업
				var articleImgs = getImgs(bgRelaBig);
				if(articleImgs.length) {
					var viewer = new Viewer();
					var img;
					for(var i=0,l=articleImgs.length ; i<l ; i+=1) {
						regexp = /javascript:window\.open\(\'(http:\/\/image\.dcinside\.com\/viewimagePop\.php[^\',]+)/;
						img = articleImgs[i];


						if(P.albumFullsize)
							img.src=img.src.replace(/http:\/\/dcimg1\.dcinside\.com\/viewimage\.php(.+)$/g, "http://image.dcinside.com/viewimage.php$1");
						if(img.parentNode.getAttribute("onclick") && (vtarget = img.parentNode.getAttribute("onclick").match(regexp))) {
							vtarget=vtarget[1].replace("viewimagePop.php", "viewimage.php");
						}
						else if(img.getAttribute("onclick") && (vtarget = img.getAttribute("onclick").match(regexp))) {
							vtarget=vtarget[1].replace("viewimagePop.php", "viewimage.php");
						}
						else
							vtarget = img.src;

						if(img.parentNode.tagName=="A") {
							nImg = cElement("img", [img.parentNode,"next"], {src:img.src});
							img.parentNode.parentNode.removeChild(img.parentNode);
							img = nImg;
						}
						else {
							nImg = cElement("img", [img,"next"], {src:img.src});
							img.parentNode.removeChild(img);
							img = nImg;
						}

						img.removeAttribute("href");
						img.removeAttribute("onclick");
						eRemove(img,"onclick");
						eRemove(img,"onload");
						img.removeAttribute("width");
						img.removeAttribute("height");

						viewer.add(vtarget,img);
					}
				}

				if(P.hide) {
					Hide.apply(bgRelaBig);
				}
				autoLink(bgRelaBig);
			}
			
			if(MODE.list) {
				ilbeView();
				document.addEventListener("keydown",shortkey,false);
			}

			// 코멘트가 있는 경우
			if(MODE.article || MODE.comment) {
				if(P.autoForm) {
					var autoName = $id("name");
					var autoPassword = $id("password");
					var autoMemo = $id("memo");
					if(autoName) {
						autoName.value = P.autoName;
						autoName.style.background = "";
					}
					if(autoPassword) {
						autoPassword.value = P.autoPassword;
						autoPassword.style.background = "";
					}
					if(autoMemo) {
						autoMemo.value = "";
						autoMemo.style.background = "";
					}
				}
			}

			var list_table = $("thead.list_thead").parentNode;
			var thead = $("thead.list_thead");

			if($("tbody.list_tbody")===null) {
				var tbody = cElement("tbody",[thead,"next"],{className:'list_tbody'});
				tbody.innerHTML=thead.innerHTML;
				thead.innerHTML="";
				thead.appendChild(tbody.rows[0]);
			}
			else
				var tbody = $("tbody.list_tbody");

			for(i=tbody.childNodes.length-1;i--;) {
				if(tbody.childNodes[i].tagName !=="TR") {
					continue;
				}
				tbody.childNodes[i].removeAttribute("onmouseover");
				tbody.childNodes[i].removeAttribute("onmouseout");
				tbody.childNodes[i].removeAttribute("style");
			}
			var tbody_h = tbody.innerHTML;
			tbody.innerHTML = '';
			tbody.innerHTML = tbody_h;
			
			var tr = cElement("tr",[tbody,0]);
			list_table.id = "list_table";
			cElement("td",tr,{className:"DCL_tbodyTitle",colSpan:"6"});

			listFunc(0);
			Layer.add(0);

			if(P.page) {
				pageFunc();
			}

			// 필터
			if(P.filter) {
				Filter.article($id("list_table").tBodies[0]);
				if(MODE.article || MODE.comment) {
					var com_tab = $id("gallery_re_contents");
					Filter.comment(com_tab);
					var com_tab_timer;
					com_tab.addEventListener("DOMNodeInserted",function(){clearTimeout(com_tab_timer);com_tab_timer=setTimeout(function(){Filter.comment(com_tab);},100);},false);
				}
			}
		}

		Layer.init();

		addStyle(	'@media screen and (max-width: ' + (P.sidebar?'960px':'700px') + ') {'
							+ '#dgn_globalmenu { position: static; }'
							+ '#dgn_globalmenu .top_ad_box,'
							+ '#dgn_gall_top .top_m,'
							+ '#dgn_gall_top .top_banner { display: none; }'
							+ '#dgn_gall_top .top_search { position: static; }'
							+ '#dgn_gall_top .top_box { position: static; width: 100%; padding-top: 18px; padding-bottom: 10px; height: auto; }'
							+ '#dgn_gall_top .top_box > * { float: left; margin: 0 10px; }'
							+ '#dgn_gall_top_wrap.glist #dgn_gall_top { height: auto; }'
							+ '#dgn_gall_top .top_box:after { content: ""; display: block; clear: both; }'
							+ 'div#DCL_menuWrap:before { display: none; }'
							+ 'div.list_table { border: none !important; }'
							+ '#list_table,'
							+ '#list_table > tbody { display: block; }'
							+ '#list_table > thead,'
							+ '#list_table > colgroup { display: none; }'
							+ '#list_table > tbody > tr:first-of-type:after { content: ""; display: block; clear: both; }'
							+ '#list_table > tbody > tr:first-of-type > td { display: block; padding: 5px; }'
							+ '#list_table > tbody > tr:first-of-type > td:after { content: ""; display: block; clear: both; }'
							+ '#list_table > tbody > tr { display: block; }'
							+ '#list_table > tbody > tr.DCL_blockArticle { display: none; }'
							+ '#list_table > tbody > tr > td { display: block; height: initial !important; }'
							+ '#list_table > tbody > tr > td:nth-of-type(3) { border-right: 1px solid #ddd; border-left: 1px solid #ddd; padding: 0 7px !important; }'
							+ '#list_table > tbody > tr.tb > td:nth-of-type(5),'
							+ '#list_table > tbody > tr.tb > td:nth-of-type(6) { display: none; }'
							+ '#list_table > tbody > tr > td:nth-of-type(2) { font-size: 16px !important; }'
							+ '#list_table > tbody > tr.tb { padding: 10px; border-bottom: 1px solid #ddd; }'
							+ '#list_table > tbody > tr.tb > td { display: inline; border-bottom: none !important; padding: 0; margin: 0; line-height: initial !important; }'
							+ '#list_table > tbody > tr.tb > td:first-of-type { display: none; }'
							+ 'div.DCL_layerDiv { max-height: none !important; }'
							+ 'div.DCL_layerActive,'
							+ 'tr.DCL_layerActive > td,'
							+ 'tr.DCL_layerActive+tr > td { border-top: none; }'
							+ 'tr.DCL_layerTr > td { border-top: none !important; }'
							+ 'tr.DCL_layerActive { border-top: 2px solid black; }'
							+ 'tr.DCL_layerActive { border-left: 2px solid black; border-right: 2px solid black; box-sizing: border-box; border-top-left-radius: 5px; border-top-right-radius: 5px; }'
							+ 'table.DCL_layerComment { display: block; }'
							+ 'table.DCL_layerComment > caption { display: block; font: inherit; }'
							+ 'table.DCL_layerComment > tr { display: block; border-bottom: 1px solid #ddd; position: relative; padding: 10px 28px 25px 10px; }'
							+ 'table.DCL_layerComment > tr > td { display: inline; border-bottom: none !important; height: auto !important; }'
							+ 'table.DCL_layerComment > tr > td:nth-of-type(1) { position: absolute; bottom: 5px; left: 5px; }'
							+ 'table.DCL_layerComment > tr > td:nth-of-type(3) { position: absolute; bottom: 5px; right: 0px; }'
							+ 'table.DCL_layerComment > tr > td:nth-of-type(4) { position: absolute; top: 10px; right: 5px; }'

							+ 'div.DCL_layerContent img { max-width: 100% !important; }'

							+ 'div#dgn_gallery_left { padding-right: 0; }'
							+ 'div#dgn_gallery_left .bottom_search { max-width: 100%; overflow: hidden; }'

							+ 'div#dgn_gallery_right { position: static; float: none; width: 100%; }'
							+ 'div#dgn_gallery_right .box_con .con_concept li { text-align: left; }'
							+ 'div#dgn_gallery_right > * { width: 250px; display: block; margin: 0 auto; }'

							+ '#dgn_gallery_left .bottom_search { padding-bottom: 102px !important; }'
							+ '#dgn_gallery_left .bottom_search * { max-width: 100%; }'
							+ '#dgn_gallery_left .bottom_search .box_select { position: relative; box-sizing: border-box; padding: 0 46px 0 30% !important; margin: 0 !important; min-height: 27px; border: 3px solid #607ee9; }'
							+ '#dgn_gallery_left .bottom_search .box_select span { display: block; }'
							+ '#dgn_gallery_left .bottom_search .box_select span.btn_down { position: absolute; left: 0; width: 30%; }'
							+ '#dgn_gallery_left .bottom_search .s_b_box { background-color: transparent; padding-right: 46px; box-sizing: border-box; }'
							+ '#dgn_gallery_left .bottom_search .s_b_btn { position: absolute; right: 0; }'
							+ '#dgn_gallery_left .bottom_search .s_b_box .box_select .btn_down a { width: 100%; background-position: right 10px center; box-sizing: border-box; }'
							+ '#dgn_gallery_left .select_div ul { width: 90px !important; left: 2px !important; }'
						+ '}'

						+ '@media screen and (max-width: 640px), screen and (max-height: 660px) {'
							+ 'div.DCL_set_wrap { top: 0; left: 0; margin: 0; width: 100%; height: 100%; overflow-y: scroll; }'
							+ 'div.DCL_set_wrap > div.body { height: auto; overflow-y: auto; }'
							+ 'div.DCL_set_wrap > div.foot > input[type="submit"] { position: absolute; top: 0; right: 0; }'
							+ 'div.DCL_set_wrap > div.head > button { position: absolute; left: 0; top: 5px; }'
							+ 'div.DCL_set_mdi { top: 40px; left: 0; margin: 0; width: 100%; }'
							+ 'div.DCL_set_wrap > div.head > h2 { text-align: center; }'
						+ '}'
						+ '');
	}

	function ilbeView() {
		// 일베 이미지 뷰어 등록
		if($('.best_img img',1).length<1) {
			setTimeout(ilbeView, 100);
			return;
		}
		var ilbeImg = $('.best_img img, .hit_img img, .issue_img img, .con_img img',1);
		var viewer = new Viewer();
		for(i=ilbeImg.length;ilbeImg[--i];) {
			viewer.add(ilbeImg[i].src,ilbeImg[i]);
		}
	}

	function time() {
		var dVal = new Date();
		return parseInt(dVal.getTime()/1000);
	}

	// 실행 ; 미지원 브라우저, 알 수 없는 상태, 내부 iframe 에서는 실행 안함
	if(BROWSER && MODE && !$id('DCL_menuDiv')) {
		location.innerhost = location.host;
		if(window === window.top) {
			SET.load();
		}
	}
})();
