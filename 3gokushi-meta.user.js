// ==UserScript==
// @name           3gokushi-meta
// @description    ブラウザ三国志を変態させるツール
// @version        0.0.0.1
// @namespace      3gokushi-meta
// @include        http://*.3gokushi.jp/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// -website        https://github.com/moonlit-g/3gokushi-meta
// -updateURL      https://raw.githubusercontent.com/moonlit-g/3gokushi-meta/master/3gokushi-meta.meta.js
// ==/UserScript==


//■■■■■■■■■■■■■■■■■■■

//■ プロトタイプ

//. String.prototype
$.extend(String.prototype,{toInt:function(){return parseInt(this.replace(/,/g,""),10)},toFloat:function(){return parseFloat(this.replace(/,/g,""))},repeat:function(num){var str=this,result="";for(;num>0;num>>>=1,str+=str)if(num&1)result+=str;return result},getTime:function(){if(!/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(this))throw new Error("Invalid string");var date=this.replace(/-/g,"/");return~~((new Date(date)).getTime()/1E3)}});
//. Number.prototype
$.extend(Number.prototype,{toInt:function(){return this},toFloat:function(){return this},toRound:function(decimal){decimal=decimal===undefined?0:decimal;var num=Math.pow(10,decimal);return Math.round(this*num)/num},toFloor:function(decimal){decimal=decimal===undefined?0:decimal;var num=Math.pow(10,decimal);return Math.floor(this*num)/num},toFormatNumber:function(decimal,replaceNaN){decimal=decimal===undefined?0:decimal;if(isNaN(this))return replaceNaN||"";var num=this.toFloor(decimal),result=new String(num);while(result!=(result=result.replace(/^(-?\d+)(\d{3})/,"$1,$2")));if(decimal>0&&num%1==0)result+="."+"0".repeat(decimal);return result},toFormatDate:function(format){var date=new Date(this*1E3);return date.toFormatDate(format)},toFormatTime:function(format){format=format||"hh:mi:ss";var h,m,s;if(this<=0)h=m=s=0;else h=Math.floor(this/3600),m=Math.floor((this-h*3600)/60),s=Math.floor(this-h*3600-m*60);if(h>=100)format=format.replace("hh",h);else format=format.replace("hh",("00"+h).substr(-2));format=format.replace("mi",("00"+m).substr(-2));format=format.replace("ss",("00"+s).substr(-2));return format}});
//. Date.prototype
$.extend(Date.prototype,{toFormatDate:function(format){format=format||"yyyy/mm/dd hh:mi:ss";format=format.replace("yyyy",this.getFullYear());format=format.replace("mm",this.getMonth()+1);format=format.replace("dd",this.getDate());format=format.replace("hh",("00"+this.getHours()).substr(-2));format=format.replace("mi",("00"+this.getMinutes()).substr(-2));format=format.replace("ss",("00"+this.getSeconds()).substr(-2));return format}});
//. Array.prototype
$.extend(Array.prototype,{unique:function(){var result=[],temp={};for(var i=0,len=this.length;i<len;i++)if(!temp[this[i]]){temp[this[i]]=true;result.push(this[i])}return result}});

//. remoeve Array.toJSON
// → https://gist.github.com/moonlit-g/394abb62c3460363d0aa
(function(){window.Array&&window.Array.prototype.toJSON&&delete window.Array.prototype.toJSON})();


(function($) {

	//. autoPager
	(function($) {
		var $window = $(window),
			$document = $(document),
			fetchPage = {},
			nextPage, container, defaults = {
				next: '',
				contants: '',
				container: '',
				load: function(page) {
					return $.get(page)
				},
				loaded: function(html) {},
				ended: function() {}
			},
			options = $.extend({}, defaults);
		$.autoPager = function(_options) {
			options = $.extend({}, defaults, _options);
			nextPage = getNext(document);
			container = $(options.container);
			if (container.length != 0) {
				$window.scroll(pageScroll)
			}
			return this
		};
		$.extend($.autoPager, {});

		function getNext(html) {
			var nextPage;
			if ($.isFunction(options.next)) {
				nextPage = options.next(html)
			} else {
				nextPage = $(html).find(options.next).attr('href')
			}
			return nextPage
		}

		function pageScroll() {
			var containerBottom = container.offset().top + container.height(),
				documentBottm = $document.scrollTop() + $window.height();
			if (containerBottom < documentBottm) {
				pageLoad()
			}
		};

		function pageLoad() {
			if (nextPage == undefined) {
				return
			}
			if (fetchPage[nextPage]) {
				return
			}
			fetchPage[nextPage] = true;
			var jqXhr = options.load(nextPage);
			jqXhr.pipe(function(html) {
				nextPage = getNext(html);
				options.loaded(html);
				if (!nextPage) {
					options.ended()
				}
				pageScroll()
			})
		}
	})(jQuery);

	//. keybind
	// https://github.com/pd/jquery.keybind
	(function($){$.fn.extend({keybind:function(seq,handler){var data=this.data("keybind");if(!data){data={bindings:{}};this.data("keybind",data).bind({keypress:keypressHandler,keydown:keydownHandler})}if(typeof seq==="object")$.each(seq,function(s,h){attachBinding(data.bindings,seqChords(s),h)});else attachBinding(data.bindings,seqChords(seq),handler);return this},keyunbind:function(seq,handler){var data=this.data("keybind");if(handler!==undefined)data.bindings[seq]=$.grep(data.bindings[seq],function(h){return h!==handler});else delete data.bindings[seq];return this},keyunbindAll:function(){$(this).removeData("keybind").unbind({keypress:keypressHandler,keydown:keydownHandler});return this}});function keypressHandler(event){var data=$(this).data("keybind"),desc=keyDescription(event);if(shouldTriggerOnKeydown(desc,event))return true;return triggerHandlers(data.bindings,desc,event)}function keydownHandler(event){var data=$(this).data("keybind"),desc=keyDescription(event);if(!shouldTriggerOnKeydown(desc,event))return true;return triggerHandlers(data.bindings,desc,event)}function attachBinding(bindings,chords,handler){var chord=chords.shift(),entry=bindings[chord];if(entry){if(chords.length>0&&entry.length!==undefined)throw"Keybinding would be shadowed by pre-existing keybinding";if(chords.length===0&&entry.length===undefined)throw"Keybinding would shadow pre-existing keybinding"}else if(chords.length>0)bindings[chord]=entry={};else bindings[chord]=entry=[];if(chords.length===0)entry.push(handler);else attachBinding(entry,chords,handler)}function triggerHandlers(bindings,desc,event){var handlers=bindings[desc.name],retVal=true;if(handlers===undefined)return retVal;$.each(handlers,function(i,fn){if(fn(desc,event)===false)retVal=false});return retVal}function seqChords(seq){return seq.split(/\s+/)}function shouldTriggerOnKeydown(desc,event){if(desc.ctrl||desc.meta||desc.alt)return true;if(desc.charCode>=37&&desc.charCode<=40||event.type==="keypress"&&desc.keyCode>=37&&desc.keyCode<=40)return false;if(desc.keyCode===189||desc.keyCode===187)return true;if(desc.charCode===45||desc.keyCode===45)return true;if(desc.charCode===95||desc.keyCode===95)return true;if(desc.charCode===61||desc.keyCode===61||desc.charCode===43||desc.keyCode===43)return true;if(desc.keyCode in _specialKeys)return true;return false}function keyDescription(event){var desc={};if(event.ctrlKey)desc.ctrl=true;if(event.altKey)desc.alt=true;if(event.originalEvent.metaKey)desc.meta=true;if(event.shiftKey)desc.shift=true;desc.keyCode=realKeyCode(desc,event);desc.charCode=event.charCode;desc.name=keyName(desc,event);return desc}function realKeyCode(desc,event){var keyCode=event.keyCode;if(keyCode in _funkyKeyCodes)keyCode=_funkyKeyCodes[keyCode];return keyCode}function keyName(desc,event){var name,mods="";if(desc.ctrl)mods+="C-";if(desc.alt)mods+="A-";if(desc.meta)mods+="M-";if(event.type==="keydown"){var keyCode=desc.keyCode;if(keyCode in _specialKeys)name=_specialKeys[keyCode];else name=String.fromCharCode(keyCode).toLowerCase();if(desc.shift&&name in _shiftedKeys)name=_shiftedKeys[name];else if(desc.shift)mods+="S-"}else if(event.type==="keypress")name=String.fromCharCode(desc.charCode||desc.keyCode);else throw"could prolly support keyup but explicitly don't right now";return mods+name}var _specialKeys={8:"Backspace",9:"Tab",13:"Enter",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",45:"Insert",46:"Del",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",187:"=",189:"-"},_funkyKeyCodes={109:189},_shiftedKeys={"1":"!","2":"@","3":"#","4":"$","5":"%","6":"^","7":"&","8":"*","9":"(","0":")","=":"+","-":"_"}})(jQuery);

	//■ MetaStorage
	var MetaStorage=(function(){var storageList={},storagePrefix='IM.',eventListener=new Object(),propNames='expires'.split(' ');function MetaStorage(name){var storageName=storagePrefix+name,storage,storageArea;storageArea=MetaStorage.keys[storageName];if(!storageArea){throw new Error('「'+storageName+'」このストレージ名は存在しません。');}storage=storageList[storageName];if(storage==undefined){storage=new Storage(storageArea,storageName);loadData.call(storage);storageList[storageName]=storage}return storage}$.extend(MetaStorage,{keys:{},registerStorageName:function(storageName){storageName=storagePrefix+storageName;MetaStorage.keys[storageName]='local'},registerSessionName:function(storageName){storageName=storagePrefix+storageName;MetaStorage.keys[storageName]='session'},clearAll:function(){$.each(MetaStorage.keys,function(key,value){localStorage.removeItem(key)});storageList={}},import:function(string){var importData=JSON.parse(string),keys=MetaStorage.keys;this.clearAll();$.each(importData,function(key,value){if(keys[key]){localStorage.setItem(key,importData[key])}})},export:function(){var exportData={};$.each(MetaStorage.keys,function(key,value){var stringData=localStorage.getItem(key);if(stringData){exportData[value]=stringData}});return JSON.stringify(exportData)},change:function(name,callback){var storageName=storagePrefix+name;$(eventListener).on(storageName,callback)}});function Storage(storageArea,storageName){this.storageArea=storageArea;this.storageName=storageName;this.data={};return this}$.extend(Storage.prototype,{clear:function(){this.data={};clearData.call(this)},get:function(key){return this.data[key]},set:function(key,value){this.data[key]=value;saveData.call(this)},remove:function(key){delete this.data[key];saveData.call(this)},begin:function(){this.transaction=true;this.tranData=$.extend({},this.data)},commit:function(){var trans=this.transaction;delete this.transaction;delete this.tranData;if(trans){saveData.call(this)}},rollback:function(){delete this.transaction;this.data=this.tranData;delete this.tranData},toJSON:function(){return JSON.stringify(this.data)}});function loadData(){this.data=load(this.storageArea,this.storageName)}function saveData(){if(this.transaction){return}save(this.storageArea,this.storageName,this.data)}function clearData(){var storageArea;if(this.transaction){return}if(this.storageArea=='local'){storageArea=localStorage}else if(this.storageArea=='session'){storageArea=sessionStorage}storageArea.removeItem(this.storageName)}function load(storageArea,storageName){var parseData={},stringData,storage;if(storageArea=='local'){storage=localStorage}else if(storageArea=='session'){storage=sessionStorage}stringData=storage.getItem(storageName);if(stringData){try{parseData=JSON.parse(stringData)}catch(e){}}return parseData}function save(storageArea,storageName,data){var stringData=JSON.stringify(data),storage;if(storageArea=='local'){storage=localStorage}else if(storageArea=='session'){storage=sessionStorage}if($.isEmptyObject(data)){storage.removeItem(storageName)}else{storage.setItem(storageName,stringData)}}$(window).on('storage',function(event){var storageName=event.originalEvent.key,storage;if(!MetaStorage.keys[storageName]){return}storage=storageList[storageName];if(storage!==undefined){loadData.call(storage)}$(eventListener).trigger(storageName,event)});return MetaStorage})();

	'VILLAGE UNION_TABLE'.split(' ').forEach(function( value ) {
		MetaStorage.registerStorageName( value );
	});

	//■ Env
	var Env = (function() {
		// var storage = MetaStorage('ENVIRONMENT'),
		// 	$server = $('#server_time'),
		// 	$war = $('.situationWorldTable'),
		// 	world = ( location.hostname.match(/(.\d{3})/) || [] )[1],
		// 	start = ( document.cookie.match( new RegExp( world + '_st=(\\d+)' ) ) || [] )[1],
		// 	login = false, season, newseason, chapter, war, server_time, local_time, timeDiff, endtime;

		// //storageから取得
		// endtime = storage.get('endtime');
		// season  = storage.get('season');
		// chapter = storage.get('chapter');

		// if ( $server.length == 0 ) {
		// 	timeDiff = 0;
		// }
		// else {
		// 	//鯖との時差取得
		// 	server_time = new Date( $server.text().replace(/-/g, '/') ).getTime(),
		// 	local_time = new Date().getTime();

		// 	timeDiff = ( server_time - local_time );
		// }

		// if ( world && start ) {
		// 	login = true;

		// 	//クッキーから取得
		// 	newseason = ( document.cookie.match( new RegExp( world + '_s=(\\d+)' ) ) || [] )[1];
		// 	chapter = ( document.cookie.match( new RegExp( world + '_c=(\\d+)' ) ) || [] )[1];

		// 	//鯖との時差も含めてタイムアウト時間を設定（カウントダウンで鯖時間を使用する為）
		// 	endtime = start.toInt() + (3 * 60 * 60) + Math.floor( timeDiff / 1000 );
		// 	newseason = newseason.toInt();
		// 	chapter = chapter.toInt();

		// 	storage.begin();
		// 	storage.set( 'endtime', endtime );
		// 	storage.set( 'season', newseason );
		// 	storage.set( 'chapter', chapter );
		// 	storage.commit();

		// 	document.cookie = world + '_st=0; expires=Fri, 31-Dec-1999 23:59:59 GMT; domain=.sengokuixa.jp; path=/;';
		// 	document.cookie = world + '_s=0; expires=Fri, 31-Dec-1999 23:59:59 GMT; domain=.sengokuixa.jp; path=/;';
		// 	document.cookie = world + '_c=0; expires=Fri, 31-Dec-1999 23:59:59 GMT; domain=.sengokuixa.jp; path=/;';

		// 	if ( newseason !== season ) {
		// 		//期が変わった場合
		// 		'VILLAGE FACILITY ALLIANCE COUNTDOWN UNIT_STATUS USER_FALL USER_INFO FAVORITE_UNIT'.split(' ').forEach(function( value ) {
		// 			MetaStorage( value ).clear();
		// 		});
		// 		'1 2 3 4 5 6 7 8 9 10 11 12 20 21'.split(' ').forEach(function( value ) {
		// 			MetaStorage( 'COORD.' + value ).clear();
		// 		});

		// 		season = newseason;
		// 	}
		// }

		// if ( $war.find('IMG[src$="icon_warnow_new.png"]').length > 0 ) {
		// 	war = 2;
		// }
		// else if ( $war.find('IMG[src$="icon_warnow.png"]').length > 0 ) {
		// 	war = 1;
		// }
		// else {
		// 	war = 0;
		// }

		// if ( login && war == 0 ) {
		// 	MetaStorage('USER_FALL').clear();
		// 	MetaStorage('USER_INFO').clear();
		// }

		return {
			// 	//. loginProcess
			// 	loginProcess: login,

			// 	//. world - 鯖
			// 	world: world,

			// 	//. season - 期
			// 	season: season,

			// 	//. chapter - 章
			// 	chapter: chapter,

			// 	//. war - 合戦 0:無し 1:通常合戦 2:新合戦
			// 	war: war,

			// 	//. timeDiff - 鯖との時差
			// 	timeDiff: timeDiff,

			//. path - アクセスパス
			path: location.pathname.match(/[^\/]+(?=(\/|\.))/g) || [],

			//. externalFilePath - 外部ファイルへのパス
			externalFilePath: (function() {
				var href = $('LINK[type="image/x-icon"][href^="/"]').attr('href') || '';
				href = href.match(/^.+(?=\/)/) || '';
				return href;
			})(),

			// 	//. loginState - ログイン状態
			// 	loginState: (function() {
			// 		var path = location.pathname;

			// 		if ( $('#lordName').length == 1 ) { return 1; }
			// 		if ( path == '/world/select_world.php' ) { return 0; }
			// 		if ( path == '/user/first_login.php' ) { return 0; }
			// 		if ( path == '/false/login_sessionout.php' ) { return -1; }
			// 		if ( path == '/maintenance/' ) { return -1; }

			// 		return -1;
			// 	})(),

			// 	//. endtime - タイムアウト期限
			// 	endtime: endtime,

			//. ajax - 一部のajax通信の判定に使用
			ajax: false,

			// セッションID
			ssid: ( document.cookie.match(/SSID=(\S+)/) || [] )[1],
		};
	})();

	//■ Util
	var Util = {
		//. keyBindCallback
		keyBindCallback: function( callback ) {
			return function( key, event ) {
				var tag = event.target.tagName.toUpperCase();

				if ( tag == 'INPUT' || tag == 'TEXTAREA' ) {
					return true;
				}

				if ( $.isFunction( callback ) ) {
					return callback.call( null, key, event );
				}
			}
		},

		//. keyBindCommon
		keyBindCommon: function() {
			$(document).keybind({
				'?': Util.keyBindCallback(function() {
					Util.showHelp();
				}),
				'v': Util.keyBindCallback(function() {
					location.href = '/village.php';
				}),
				'm': Util.keyBindCallback(function() {
					location.href = '/map.php';
				}),
				'c': Util.keyBindCallback(function() {
					location.href = '/card/deck.php';
				}),
				'r': Util.keyBindCallback(function() {
					location.href = '/report/list.php';
				}),
				'i': Util.keyBindCallback(function() {
					location.href = '/message/inbox.php';
				}),
				'f': Util.keyBindCallback(function() {
					location.href = '/facility/unit_status.php';
				}),
				'd': Util.keyBindCallback(function() {
					location.href = '/card/domestic_setting.php';
				}),
				'u': Util.keyBindCallback(function() {
					location.href = '/union/index.php';
				}),
				't': Util.keyBindCallback(function() {
					location.href = '/card/trade.php';
				}),
				'^': Util.keyBindCallback(function() {
					Data.skillTableUpdate();
				}),
				'1': Util.keyBindCallback(function() {
					location.href='/card/deck.php?l=#file-1';
				}),
				'2': Util.keyBindCallback(function() {
					location.href='/card/deck.php?l=1#file-1';
				}),
				'3': Util.keyBindCallback(function() {
					location.href='/card/deck.php?l=2#file-1';
				}),
				'4': Util.keyBindCallback(function() {
					location.href='/card/deck.php?l=3#file-1';
				}),
				'5': Util.keyBindCallback(function() {
					location.href='/card/deck.php?l=4#file-1';
				}),
				'6': Util.keyBindCallback(function() {
					location.href='/card/deck.php?l=5#file-1';
				}),
				'e': Util.keyBindCallback(function() {
					var $curr, $next, href;

					if ( location.pathname == '/map.php' ) { return; }

					$curr = $('#imi_basename .on');
					$next = $curr.next();
					if ( $next.length == 0 ) { $next = $curr.parent().children('LI').first(); }

					href = $next.find('A').attr('href');
					if ( href ) { location.href = href; }
				}),

				'q': Util.keyBindCallback(function() {
					var $curr, $prev, href;

					if ( location.pathname == '/map.php' ) { return; }

					$curr = $('#imi_basename .on');
					$prev = $curr.prev();
					if ( $prev.length == 0 ) { $prev = $curr.parent().children('LI').last(); }

					href = $prev.find('A').attr('href');
					if ( href ) { location.href = href; }
				}),

			// 	'A-1': Util.keyBindCallback(function() {
			// 		if ( location.pathname == '/card/deck.php' ) { return; }
			// 		if ( Deck.dialog.opened ) {
			// 			$('#imi_unit_tab LI').eq( 0 ).trigger('click');
			// 		}
			// 		else {
			// 			Deck.dialog( null, null, null, null, 0 );
			// 		}
			// 	}),

			// 	'A-2': Util.keyBindCallback(function() {
			// 		if ( location.pathname == '/card/deck.php' ) { return; }
			// 		if ( Deck.dialog.opened ) {
			// 			$('#imi_unit_tab LI').eq( 1 ).trigger('click');
			// 		}
			// 		else {
			// 			Deck.dialog( null, null, null, null, 1 );
			// 		}
			// 	}),

			// 	'A-3': Util.keyBindCallback(function() {
			// 		if ( location.pathname == '/card/deck.php' ) { return; }
			// 		if ( Deck.dialog.opened ) {
			// 			$('#imi_unit_tab LI').eq( 2 ).trigger('click');
			// 		}
			// 		else {
			// 			Deck.dialog( null, null, null, null, 2 );
			// 		}
			// 	}),

			// 	'A-4': Util.keyBindCallback(function() {
			// 		if ( location.pathname == '/card/deck.php' ) { return; }
			// 		if ( Deck.dialog.opened ) {
			// 			$('#imi_unit_tab LI').eq( 3 ).trigger('click');
			// 		}
			// 		else {
			// 			Deck.dialog( null, null, null, null, 3 );
			// 		}
			// 	}),

			// 	'A-5': Util.keyBindCallback(function() {
			// 		if ( location.pathname == '/card/deck.php' ) { return; }
			// 		if ( Deck.dialog.opened ) {
			// 			$('#imi_unit_tab LI').eq( 4 ).trigger('click');
			// 		}
			// 		else {
			// 			Deck.dialog( null, null, null, null, 4 );
			// 		}
			// 	}),

			// 	'u': Util.keyBindCallback(function() {
			// 		location.href = '/union/index.php';
			// 	}),

			// 	'l': Util.keyBindCallback(function() {
			// 		location.href = '/senkuji/senkuji.php';
			// 	}),
				
			// 	'c': Util.keyBindCallback(function() {
			// 		location.href = '/alliance/chat_view.php?pager_select=100';
			// 	}),

			// 	'b': Util.keyBindCallback(function() {
			// 		location.href = '/bbs/topic_view.php';
			// 	}),

			// 	'r': Util.keyBindCallback(function() {
			// 		location.href = '/report/list.php';
			// 	}),

			// 	'i': Util.keyBindCallback(function() {
			// 		location.href = '/message/inbox.php';
			// 	}),

			// 	'f': Util.keyBindCallback(function() {
			// 		location.href = '/facility/set_unit_list.php?show_num=100';
			// 	}),

			// 	':': Util.keyBindCallback(function() {
			// 		$.noop();
			// 	}),
			});
		},

		//. keyBindPager
		keyBindPager: function() {
			var in_process = false;

			$(document).keybind({
				'a': Util.keyBindCallback(function() {
					var $a = $('UL.pager LI:first A:last');

					if ( $a.length == 1 && !in_process ) {
						in_process = true;
						location.href = $a.attr('href');
					}

					return false;
				}),

				'd': Util.keyBindCallback(function() {
					var $a = $('UL.pager LI:last A:first');

					if ( $a.length == 1 && !in_process ) {
						in_process = true;
						location.href = $a.attr('href');
					}

					return false;
				})
			});
		},

		//. keyBindMap
		keyBindMap: function() {
			$(document).keybind({
				// 'w': Util.keyBindCallback(function() {
				// 	$('#ig_cur01_w').click();
				// }),

				// 'd': Util.keyBindCallback(function() {
				// 	$('#ig_cur02_w').click();
				// }),

				// 's': Util.keyBindCallback(function() {
				// 	$('#ig_cur03_w').click();
				// }),

				// 'a': Util.keyBindCallback(function() {
				// 	$('#ig_cur04_w').click();
				// }),

				// 'z': Util.keyBindCallback(function() {
				// 	$('#imi_map_zoom').click();
				// }),

				// 'e': Util.keyBindCallback(function() {
				// 	var $curr, $next, village;

				// 	$curr = $('#imi_basename .imc_selected');
				// 	if ( $curr.length == 0 ) { $curr = $('#imi_basename .on'); }

				// 	{
				// 		$next = $curr.next();
				// 		if ( $next.length == 0 ) { $next = $curr.parent().children('LI').first(); }
				// 		village = Util.getVillageByName( $next.children().first().text() );
				// 	} while( !village );

				// 	$curr.removeClass('imc_selected');
				// 	$next.addClass('imc_selected');
				// 	Map.move( village.x, village.y, village.country );
				// }),

				// 'q': Util.keyBindCallback(function() {
				// 	var $curr, $prev, village;

				// 	$curr = $('#imi_basename .imc_selected');
				// 	if ( $curr.length == 0 ) { $curr = $('#imi_basename .on'); }

				// 	{
				// 		$prev = $curr.prev();
				// 		if ( $prev.length == 0 ) { $prev = $curr.parent().children('LI').last(); }
				// 		village = Util.getVillageByName( $prev.children().first().text() );
				// 	} while( !village );

				// 	$curr.removeClass('imc_selected');
				// 	$prev.addClass('imc_selected');
				// 	Map.move( village.x, village.y, village.country );
				// })
			});
		},

		//. showHelp
		showHelp: function() {
			if( $('#keyboardHelp').size() != 0 ) { return; }

			let style =
				'div.kbdtitle { font-family:MeiryoKe_PGothic,"Helvetica Neue",Arial,Helvetica,"Lucida Grande","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3",Meiryo,メイリオ,"Meiryo UI",sans-serif; font-size:16px; margin-bottom: 1em;}' +
				'div.kbd { font-family:MeiryoKe_PGothic,"Helvetica Neue",Arial,Helvetica,"Lucida Grande","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3",Meiryo,メイリオ,"Meiryo UI",sans-serif; font-size:14px; float: left; width: 50%; }' +
				'span.kbd { font-size: 1em; margin: 0; }' +
				'dt.kbd { width: 6em; height: 0; text-align: right; margin-top: 0.5em; font: inherit; }' +
				'dd.kbd { margin-left: 7em; }';
			GM_addStyle( style );

			let html =
				'<div class="kbdtitle">キーボードショートカット一覧</div>' +
				'<div class="kbd">' +
					'<span class="kbd">各画面共通</span>' +
					'<dl>' +
						'<dt class="kbd">v</dt>' + '<dd class="kbd">拠点画面へ移動</dd>' +
						'<dt class="kbd">m</dt>' + '<dd class="kbd">地図画面へ移動</dd>' +
						'<dt class="kbd">c</dt>' + '<dd class="kbd">デッキへ移動</dd>' +
							'<dt class="kbd">f</dt>' + '<dd class="kbd">兵士管理画面へ移動</dd>' +
							'<dt class="kbd">d</dt>' + '<dd class="kbd">内政画面へ移動</dd>' +
							'<dt class="kbd">u</dt>' + '<dd class="kbd">カード合成画面へ移動</dd>' +
							'<dt class="kbd">t</dt>' + '<dd class="kbd">トレード画面へ移動</dd>' +
						'<dt class="kbd">r</dt>' + '<dd class="kbd">報告書一覧へ移動</dd>' +
						'<dt class="kbd">i</dt>' + '<dd class="kbd">受信箱へ移動</dd>' +
						'<br/>' +
						'<dt class="kbd">1</dt>' + '<dd class="kbd">ファイル「すべて」へ移動</dd>' +
						'<dt class="kbd">2</dt>' + '<dd class="kbd">ファイル「ラベル1」へ移動</dd>' +
						'<dt class="kbd">3</dt>' + '<dd class="kbd">ファイル「ラベル2」へ移動</dd>' +
						'<dt class="kbd">4</dt>' + '<dd class="kbd">ファイル「ラベル3」へ移動</dd>' +
						'<dt class="kbd">5</dt>' + '<dd class="kbd">ファイル「ラベル4」へ移動</dd>' +
						'<dt class="kbd">6</dt>' + '<dd class="kbd">ファイル「ラベル5」へ移動</dd>' +
						'<br/>' +
						'<dt class="kbd">?</dt>' + '<dd class="kbd">キーボードショートカット一覧(この画面)を開く</dd>' +
					'</dl>' +
				'</div>' +
				'<div class="kbd">' +
					'<span class="kbd">内政画面</span>' +
					'<dl>' +
						'<dt class="kbd">e</dt>' + '<dd class="kbd">次の拠点を選択する</dd>' +
						'<dt class="kbd">q</dt>' + '<dd class="kbd">前の拠点を選択する</dd>' +
					'</dl>' +
					'<br/>' +
					'<span class="kbd">地図画面</span>' +
					'<dl>' +
						'<dt class="kbd">w</dt>' + '<dd class="kbd">北に１画面分移動する</dd>' +
						'<dt class="kbd">s</dt>' + '<dd class="kbd">南に１画面分移動する</dd>' +
						'<dt class="kbd">a</dt>' + '<dd class="kbd">西に１画面分移動する</dd>' +
						'<dt class="kbd">d</dt>' + '<dd class="kbd">東に１画面分移動する</dd>' +
						'<dt class="kbd">e</dt>' + '<dd class="kbd">次の拠点を中心に表示する</dd>' +
						'<dt class="kbd">q</dt>' + '<dd class="kbd">前の拠点を中心に表示する</dd>' +
						'<dt class="kbd">z</dt>' + '<dd class="kbd">ミニマップを拡大表示する</dd>' +
					'</dl>' +
					'<br/>' +
					'<span class="kbd">ページャー</span>' +
					'<dl>' +
						'<dt class="kbd">e</dt>' + '<dd class="kbd">前のページを表示する</dd>' +
						'<dt class="kbd">q</dt>' + '<dd class="kbd">次のページを表示する</dd>' +
					'</dl>' +
					'<br/>' +
					'<span class="kbd">件名選択</span>' +
					'<dl>' +
						'<dt class="kbd">w</dt>' + '<dd class="kbd">前の項目を表示する</dd>' +
						'<dt class="kbd">s</dt>' + '<dd class="kbd">次の項目を選択する</dd>' +
					'</dl>' +
				'</div>';
			$('<div id="keyboardHelp" class="keyboardHelp" style="display:none">' + html + '</div>').appendTo('body');
			$('<a id="keyboardHelpAnchor" href="#TB_inline?inlineId=keyboardHelp&width=940&height=595&top=5" class="thickbox"></a>').appendTo('body');
			$('#keyboardHelpAnchor').click();
		},

		//. enter
		enter: function() {
			$(this).addClass('imc_current');
			$(this).find('*').addClass('imc_current');
		},
		//. leave
		leave: function() {
			$(this).removeClass('imc_current');
			$(this).find('*').removeClass('imc_current');
		},
		//. enter_g .. 武将リスト用
		enter_g: function() {
			$(this).addClass('imc_current');
			$(this).find('TD:not(.skill,.use,.disuse,.passive,.recovery)').addClass('imc_current');
		},
		//. leave_g .. 武将リスト用
		leave_g: function() {
			$(this).removeClass('imc_current');
			$(this).find('TD:not(.skill,.use,.disuse,.passive,.recovery)').removeClass('imc_current');
		},

		//. tb_init
		tb_init: unsafeWindow.tb_init = function( a ) {
			$( document ).on('click', a, function () {
				var c = this.title || this.name || null;
				var b = this.href || this.alt;
				var d = this.rel || false;

				Util.tb_show( c, b, d );

				this.blur();
				return false;
			});
		},

		//. tb_show
		tb_show: function( j, b, h ) {
			var $tb, margintop;

			unsafeWindow.tb_show( j, b, h );

			//カードウィンドウチェック
			if ( b.indexOf('cardWindow') == -1 ) { return; }

			$tb = $('#TB_ajaxContent');

			//微調整
			$tb.css({ height: 'auto' });
			margintop = -Math.floor( $('#TB_window').height() / 2 - 20 );
			if ( margintop < -350 ) { margintop = -350; }
			$('#TB_window').css({ marginTop: margintop });

			if ( $tb.find('.imc_table').length > 0 ) { return; }

			var $cardDetails = $tb.find('.cardWrapper2col:first');
			var [dummy, key] = $cardDetails.find('.skillName1').text().match(/(\S+)\s?LV\d+/);
			var table = Data.skillTable[key];

			$('div.card').css('margin', '0 0 10px');

			// // ラベル
			// var html1 = '' +
			// 	'<div id="imi_card_command">' +
			// 		'<ul>' +
			// 		'<li>' + + '</li>' +
			// 		'</ul>' +
			// 	'</div>' +
			// 	'';
			// $cardDetails.prepend( html1 );

			// // 回復予定
			// if ($tb.find('.kaifuku_cnt').length > 0) {
			// 	var html = '' +
			// 		'<div id="recovery">' +
			// 			'<table class="imc_table" style="margin: 0px; clear:both">' +
			// 			'<tr style="background-color: rgb(238, 238, 238);">' +
			// 			'<th width="15%">討伐ゲージ</th>' +
			// 			'<th width="15%">HP</th>' +
			// 			'<th width="15%">' + $tb.find('.kaifuku_cnt b:eq(2)').text() + '</th>' +
			// 			'<th width="15%">' + $tb.find('.kaifuku_cnt b:eq(3)').text() + '</th>' +
			// 			'<th width="15%">' + $tb.find('.kaifuku_cnt b:eq(4)').text() + '</th>' +
			// 			'<th width="15%">' + $tb.find('.kaifuku_cnt b:eq(5)').text() + '</th>' +
			// 			'</tr>' +
			// 			'<tr>' +
			// 			'<td>' + $tb.find('.kaifuku_cnt p:eq(0)').text() + '</td>' +
			// 			'<td>' + $tb.find('.kaifuku_cnt p:eq(1)').text() + '</td>' +
			// 			'<td>' + $tb.find('.kaifuku_cnt p:eq(2)').text() + '</td>' +
			// 			'<td>' + $tb.find('.kaifuku_cnt p:eq(3)').text() + '</td>' +
			// 			'<td>' + $tb.find('.kaifuku_cnt p:eq(4)').text() + '</td>' +
			// 			'</tr>' +
			// 			'</table>' +
			// 		'</div>';
			// 	$cardDetails.append(html);
			// }

			// 合成テーブル
			var html = '' +
				'<div id="skillTable">' +
					'<table class="imc_table" style="width: 100%; margin: 0px; clear:both">' +
					'<tr style="background-color: rgb(238, 238, 238);">' +
					'<th width="25%">中確率</th>' +
					'<th width="25%">低確率</th>' +
					'<th width="25%">極低確率</th>' +
					'<th width="25%">隠し</th>' +
					'</tr>' +
					'<tr>';
					for (var j = 0; j < table.length; j++) {
						html += '<td>' + table[j] + '</td>';
					}
					html += '</tr>' +
					'</table>' +
				'</div>';
			$cardDetails.append(html);

			margintop = -Math.floor( $('#TB_window').height() / 2 - 20 );
			if ( margintop < -350 ) { margintop = -350; }
			$('#TB_window').css({ marginTop: margintop });

			$tb.find('IMG[src$="nouryoku_title_white.png"]').parent().remove();
			$tb.find('#trade_btn').css('padding-bottom', '10px');
			$tb.find('#table_posi').css('background-color', '#000');
		},

		//. getVillageByName
		getVillageByName: function( name ) {
			var list = MetaStorage('VILLAGE').get('list') || [];

			for ( var i = 0, len = list.length; i < len; i++ ) {
				if ( list[ i ].name != name ) { continue; }

				return list[ i ];
			}

			//キャッシュで見つからない場合は最新情報取得
			list = Util.getVillageList();

			for ( var i = 0, len = list.length; i < len; i++ ) {
				if ( list[ i ].name != name ) { continue; }

				return list[ i ];
			}

			return null;
		},

		//. getVillageById
		getVillageById: function( id ) {
			var list = MetaStorage('VILLAGE').get('list') || [];

			for ( var i = 0, len = list.length; i < len; i++ ) {
				if ( list[ i ].id != id ) { continue; }

				return list[ i ];
			}

			//キャッシュで見つからない場合は最新情報取得
			list = Util.getVillageList();

			for ( var i = 0, len = list.length; i < len; i++ ) {
				if ( list[ i ].id != id ) { continue; }

				return list[ i ];
			}

			return null;
		},

		//. getVillageByCoord
		getVillageByCoord: function( x, y, country ) {
			var list = MetaStorage('VILLAGE').get('list') || [];

			for ( var i = 0, len = list.length; i < len; i++ ) {
				if ( list[ i ].x != x ) { continue; }
				if ( list[ i ].y != y ) { continue; }
				if ( list[ i ].country != country ) { continue; }

				return list[ i ];
			}

			//キャッシュで見つからない場合は最新情報取得
			list = Util.getVillageList();

			for ( var i = 0, len = list.length; i < len; i++ ) {
				if ( list[ i ].x != x ) { continue; }
				if ( list[ i ].y != y ) { continue; }
				if ( list[ i ].country != country ) { continue; }

				return list[ i ];
			}

			return null;
		},

		//. getVillageList
		getVillageList: function() {
			var list = [];

			$.ajax({ type: 'get', url: '/user/', async: false })
			.done(function( html ) {
				var $html = $(html),
					$table = $html.find('TABLE.commonTables');

				$table.find('TR:gt(17)').each( function() {
					var $this = $(this);
					if( !$.isNumeric( $this.find('TD:eq(2)').text() ) ) { return true; }

					var $a    = $this.find('A'),
						name  = $a.eq( 0 ).text().trim(),
						id    = $a.eq( 0 ).attr('href').match(/village_id=(\d+)/)[ 1 ],
						point = $this.find('TD:eq( 1 )').text().match(/(-?\d+),(-?\d+)/),
						x     = point[ 1 ].toInt(),
						y     = point[ 2 ].toInt();

					list.push({ id: id, name: name, x: x, y: y });
				});

				MetaStorage('VILLAGE').set('list', list);
			});

			return list;
		},

		//. getVillageCurrent
		getVillageCurrent: function() {
			var name = $('#imi_basename .imc_basename .on > SPAN').text();

			return Util.getVillageByName( name );
		},

	};

	//■ Data
	var Data = {
		//. style
		style: '' +

		/* ajax用 */
		'.imc_ajax_load { position: fixed; top: 0px; left: 0px; padding: 2px; background-color: #fff; border-right: solid 3px #999; border-bottom: solid 3px #999; border-bottom-right-radius: 5px; z-index: 3001; }' +

		/* お知らせダイアログ用 */
		'.imc_dialog { position: fixed; top: 145px; left: 0px; width: 100%; height: 0px; z-index: 3000; }' +
		'.imc_dialog_content { min-width: 300px; font-size: 1.2em; color: Black; font-weight: bold; text-align: center; padding: 10px 20px; margin: 3px auto; border-radius: 10px; }' +
		'.imc_dialog_content { box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(255, 255, 255, 0.7), 3px 3px 4px rgba(0, 0, 0, 0.7); }' +
		'.imc_dialog_content UL { display: inline-block; }' +
		'.imc_dialog_content LI { text-align: left; }' +
		'.imc_dialog_content.imc_infomation { border: solid 2px #06f; background-color: #eff; }' +
		'.imc_dialog_content.imc_alert { border: solid 2px #c00; background-color: #fee; }' +

		/* overlay用 z-index: 2000 */
		'#imi_overlay { position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 2000; }' +
		'#imi_overlay .imc_overlay { position: absolute; width: 100%; height: 100%; background-color: #000; opacity: 0.75; }' +

		/* ダイアログメッセージ用 */
		'#imi_dialog_container { position: relative; margin: auto; width: 500px; height: auto; background-color: #f1f0dc; border: solid 2px #666; overflow: hidden; }' +
		'#imi_dialog_container .imc_dialog_header { background-color: #ccc; padding: 8px; font-weight: bold; }' +
		'#imi_dialog_container .imc_dialog_body { margin: 8px 0px 8px 8px; padding-right: 8px; font-size: 12px; height: 200px; overflow: auto; }' +
		'#imi_dialog_container .imc_dialog_footer { margin: 5px; padding: 5px 10px; border-top: solid 1px black; text-align: right; }' +
		'#imi_dialog_container .imc_message { margin: 4px; }' +
		'#imi_dialog_container BUTTON { margin-left: 8px; padding: 5px; min-width: 60px; border: solid 1px #999; border-radius: 3px; cursor: pointer; color: #000; background: -moz-linear-gradient(top, #fff, #ccc); box-shadow: 1px 1px 2px #ccc; }' +
		'#imi_dialog_container BUTTON:hover { background: -moz-linear-gradient(bottom, #fff, #ccc); }' +
		'#imi_dialog_container BUTTON:active { border-style: inset; }' +
		'#imi_dialog_container BUTTON:disabled { color: #666; border-style: solid; background: none; background-color: #ccc; cursor: default; }' +

		/* コンテキストメニュー用 z-index: 9999 */
		'.imc_menulist { position: absolute; padding: 2px; min-width: 120px; font-size: 12px; color: #fff; background: #000; border: solid 1px #b8860b; z-index: 9999; -moz-user-select: none; }' +
		'.imc_menutitle { background: -moz-linear-gradient(left, #a82, #420); color: #eee; margin: 2px -2px 2px -2px; padding: 4px 8px; white-space: nowrap; font-size: 13px; font-weight: bold; min-width: 120px; }' +
		'.imc_menulist > .imc_menutitle:first-child { margin: -2px -2px 2px -2px; }' +
		'.imc_menuitem { margin: 0px; padding: 4px 20px 4px 8px; white-space: nowrap; cursor: pointer; border-radius: 2px; }' +
		'.imc_separater { border-top: groove 2px #ffffff; margin: 3px 5px; cursor: default; }' +
		'.imc_nothing { margin: 0px; padding: 3px 8px; color: #666; cursor: default; }' +
		'.imc_menuitem:hover { color: #000; background: #ccc; }' +
		'.imc_menuitem > .imc_submenu { visibility: hidden; }' +
		'.imc_menuitem:hover > .imc_submenu { visibility: visible; }' +
		'.imc_submenu { position: absolute; left: 100%; margin: -7px 0px 0px -2px; }' +
		'.imc_submenu_mark { position: absolute; left: 100%; margin-left: -10px; font-size: 14px; }' +

		/* 下部表示欄 z-index: 99 */
		'#imi_bottom_container { position: fixed; bottom: 0px; left: 0px; width: 100%; height: auto; border-bottom: solid 2px #000; z-index: 99; }' +
		'#imi_bottom_container .imc_overlay { position: absolute; width: 100%; height: 100%; background-color: #000; opacity: 0.75; }' +
		
		/* カーソル行用 */
		'.imc_current { background-color: #f9dea1 !important; }' +

		/* テーブルスタイル */
		'.imc_table { border-collapse: collapse; border: solid 1px #76601D; }' +
		'.imc_table TH { padding: 5px 6px; text-align: center; vertical-align: middle; border-bottom: dotted 1px #76601D; border-left: solid 1px #76601D; color: #300; font-weight: bold; background-color: #E0DCC1; }' +
		'.imc_table TD { padding: 4px 5px; text-align: center; vertical-align: middle; border-bottom: dotted 1px #76601D; border-left: solid 1px #76601D; }' +
		'.imc_table.td_right TD { text-align: right; }' +

		'#TB_window .imc_table { background-color: #fff; color: #000; }' +

		'',

		//. images
		images: {
			ajax_load: "data:image/gif;base64,R0lGODlhIAAgAPUAAP%2F%2F%2FwAAAPr6%2BsTExOjo6PDw8NDQ0H5%2Bfpqamvb29ubm5vz8%2FJKSkoaGhuLi4ri4uKCgoOzs7K6urtzc3D4%2BPlZWVmBgYHx8fKioqO7u7kpKSmxsbAwMDAAAAM7OzsjIyNjY2CwsLF5eXh4eHkxMTLCwsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2FhpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgkFjgcR3HJJE4SxEGnMygKmkwJxRKdVocFBRRLfFAoj6GUOhQoFAVysULRjNdfQFghLxrODEJ4Qm5ifUUXZwQAgwBvEXIGBkUEZxuMXgAJb1dECWMABAcHDEpDEGcTBQMDBQtvcW0RbwuECKMHELEJF5NFCxm1AAt7cH4NuAOdcsURy0QCD7gYfcWgTQUQB6Zkr66HoeDCSwIF5ucFz3IC7O0CC6zx8YuHhW%2F3CvLyfPX4%2BOXozKnDssBdu3G%2FxIHTpGAgOUPrZimAJCfDPYfDin2TQ%2BxeBnWbHi37SC4YIYkQhdy7FvLdpwWvjA0JyU%2FISyIx4xS6sgfkNS4me2rtVKkgw0JCb8YMZdjwqMQ2nIY8BbcUQNVCP7G4MQq1KRivR7tiDEuEFrggACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCQmNBpCcckkEgREA4ViKA6azM8BEZ1Wh6LOBls0HA5fgJQ6HHQ6InKRcWhA1d5hqMMpyIkOZw9Ca18Qbwd%2FRRhnfoUABRwdI3IESkQFZxB4bAdvV0YJQwkDAx9%2BbWcECQYGCQ5vFEQCEQoKC0ILHqUDBncCGA5LBiHCAAsFtgqoQwS8Aw64f8m2EXdFCxO8INPKomQCBgPMWAvL0n%2Fff%2BjYAu7vAuxy8O%2FmyvfX8%2Ff7%2FArq%2Bv0W0HMnr9zAeE0KJlQkJIGCfE0E%2BPtDq9qfDMogDkGmrIBCbNQUZIDosNq1kUsEZJBW0dY%2Fb0ZsLViQIMFMW%2BRKKgjFzp4fNokPIdki%2BY8JNVxA79jKwHAI0G9JGw5tCqDWTiFRhVhtmhVA16cMJTJ1OnVIMo1cy1KVI5NhEAAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgkChqNQnHJJCYWRMfh4CgamkzFwBOdVocNCgNbJAwGhKGUOjRQKA1y8XOGAtZfgIWiSciJBWcTQnhCD28Qf0UgZwJ3XgAJGhQVcgKORmdXhRBvV0QMY0ILCgoRmIRnCQIODgIEbxtEJSMdHZ8AGaUKBXYLIEpFExZpAG62HRRFArsKfn8FIsgjiUwJu8FkJLYcB9lMCwUKqFgGHSJ5cnZ%2FuEULl%2FCX63%2Fx8KTNu%2BRkzPj9zc%2F0%2FCl4V0%2FAPDIE6x0csrBJwybX9DFhBhCLgAilIvzRVUriKHGlev0JtyuDvmsZUZlcIiCDnYu7KsZ0UmrBggRP7n1DqcDJEzciOgHwcwTyZEUmIKEMFVIqgyIjpZ4tjdTxqRCMPYVMBYDV6tavUZ8yczpkKwBxHsVWtaqo5tMgACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCQuBgNBcck0FgvIQtHRZCYUGSJ0IB2WDo9qUaBQKIXbLsBxOJTExUh5mB4iDo0zXEhWJNBRQgZtA3tPZQsAdQINBwxwAnpCC2VSdQNtVEQSEkOUChGSVwoLCwUFpm0QRAMVFBQTQxllCqh0kkIECF0TG68UG2O0foYJDb8VYVa0alUXrxoQf1WmZnsTFA0EhgCJhrFMC5Hjkd57W0jpDsPDuFUDHfHyHRzstNN78PPxHOLk5dwcpBuoaYk5OAfhXHG3hAy%2BKgLkgNozqwzDbgWYJQyXsUwGXKNA6fnYMIO3iPeIpBwyqlSCBKUqEQk5E6YRmX2UdAT5kEnHKkQ5hXjkNqTPtKAARl1sIrGoxSFNuSEFMNWoVCxEpiqyRlQY165wEHELAgAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgsKhSLonJJTBIFR0GxwFwmFJlnlAgaTKpFqEIqFJMBhcEABC5GjkPz0KN2tsvHBH4sJKgdd1NHSXILah9tAmdCC0dUcg5qVEQfiIxHEYtXSACKnWoGXAwHBwRDGUcKBXYFi0IJHmQEEKQHEGGpCnp3AiW1DKFWqZNgGKQNA65FCwV8bQQHJcRtds9MC4rZitVgCQbf4AYEubnKTAYU6eoUGuSpu3fo6%2Bka2NrbgQAE4eCmS9xVAOW7Yq7IgA4Hpi0R8EZBhDshOnTgcOtfM0cAlTigILFDiAFFNjk8k0GZgAxOBozouIHIOyKbFixIkECmIyIHOEiEWbPJTTQ5FxcVOMCgzUVCWwAcyZJvzy45ADYVZNIwTlIAVfNB7XRVDLxEWLQ4E9JsKq%2BrTdsMyhcEACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuicklMEgVHQVHKVCYUmWeUWFAkqtOtEKqgAsgFcDFyHJLNmbZa6x2Lyd8595h8C48RagJmQgtHaX5XZUYKQ4YKEYSKfVKPaUMZHwMDeQBxh04ABYSFGU4JBpsDBmFHdXMLIKofBEyKCpdgspsOoUsLXaRLCQMgwky%2BYJ1FC4POg8lVAg7U1Q5drtnHSw4H3t8HDdnZy2Dd4N4Nzc%2FQeqLW1bnM7rXuV9tEBhQQ5UoCbJDmWKBAQcMDZNhwRVNCYANBChZYEbkVCZOwASEcCDFQ4SEDIq6WTVqQIMECBx06iCACQQPBiSabHDqzRUTKARMhSFCDrc%2BWNQIcOoRw5%2BZIHj8ADqSEQBQAwKKLhIzowEEeGKQ0owIYkPKjHihZoBKi0KFE01b4zg7h4y4IACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuicklMEgVHQVHKVCYUmWeUWFAkqtOtEKqgAsgFcDFyHJLNmbZa6x2Lyd8595h8C48RagJmQgtHaX5XZUUJeQCGChGEin1SkGlubEhDcYdOAAWEhRlOC12HYUd1eqeRokOKCphgrY5MpotqhgWfunqPt4PCg71gpgXIyWSqqq9MBQPR0tHMzM5L0NPSC8PCxVUCyeLX38%2B%2FAFfXRA4HA%2BpjmoFqCAcHDQa3rbxzBRD1BwgcMFIlidMrAxYICHHA4N8DIqpsUWJ3wAEBChQaEBnQoB6RRr0uARjQocMAAA0w4nMz4IOaU0lImkSngYKFc3ZWyTwJAALGK4fnNA3ZOaQCBQ22wPgRQlSIAYwSfkHJMrQkTyEbKFzFydQq15ccOAjUEwQAIfkECQoAAAAsAAAAACAAIAAABv9AgHBILCoUi6JySUwSBUdBUcpUJhSZZ5RYUCSq060QqqACyAVwMXIcks2ZtlrrHYvJ3zn3mHwLjxFqAmZCC0dpfldlRQl5AIYKEYSKfVKQaW5sSENxh04ABYSFGU4LXYdhR3V6p5GiQ4oKmGCtjkymi2qGBZ%2B6eo%2B3g8KDvYLDxKrJuXNkys6qr0zNygvHxL%2FV1sVD29K%2FAFfRRQUDDt1PmoFqHgPtBLetvMwG7QMes0KxkkIFIQNKDhBgKvCh3gQiqmxt6NDBAAEIEAgUOHCgBBEH9Yg06uWAIQUABihQMACgBEUHTRwoUEOBIcqQI880OIDgm5ABDA8IgUkSwAAyij1%2FjejAARPPIQwONBCnBAJDCEOOCnFA8cOvEh1CEJEqBMIBEDaLcA3LJIEGDe%2F0BAEAIfkECQoAAAAsAAAAACAAIAAABv9AgHBILCoUi6JySUwSBUdBUcpUJhSZZ5RYUCSq060QqqACyAVwMXIcks2ZtlrrHYvJ3zn3mHwLjxFqAmZCC0dpfldlRQl5AIYKEYSKfVKQaW5sSENxh04ABYSFGU4LXYdhR3V6p5GiQ4oKmGCtjkymi2qGBZ%2B6eo%2B3g8KDvYLDxKrJuXNkys6qr0zNygvHxL%2FV1sVDDti%2FBQccA8yrYBAjHR0jc53LRQYU6R0UBnO4RxmiG%2FIjJUIJFuoVKeCBigBN5QCk43BgFgMKFCYUGDAgFEUQRGIRYbCh2xACEDcAcHDgQDcQFGf9s7VkA0QCI0t2W0DRw68h8ChAEELSJE8xijBvVqCgIU9PjwA%2BUNzG5AHEB9xkDpk4QMGvARQsEDlKxMCALDeLcA0rqEEDlWCCAAAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgsKhSLonJJTBIFR0FRylQmFJlnlFhQJKrTrRCqoALIBXAxchySzZm2Wusdi8nfOfeYfAuPEWoCZkILR2l%2BV2VFCXkAhgoRhIp9UpBpbmxIQ3GHTgAFhIUZTgtdh2FHdXqnkaJDigqYYK2OTKaLaoYFn7p6j0wOA8PEAw6%2FZ4PKUhwdzs8dEL9kqqrN0M7SetTVCsLFw8d6C8vKvUQEv%2BdVCRAaBnNQtkwPFRQUFXOduUoTG%2FcUNkyYg%2BtIBlEMAFYYMAaBuCekxmhaJeSeBgiOHhw4QECAAwcCLhGJRUQCg3RDCmyUVmBYmlOiGqmBsPGlyz9YkAlxsJEhqCubABS9AsPgQAMqLQfM0oTMwEZ4QpLOwvMLxAEEXIBG5aczqtaut4YNXRIEACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuicklMEgVHQVHKVCYUmWeUWFAkqtOtEKqgAsgFcDFyHJLNmbZa6x2Lyd8595h8C48RahAQRQtHaX5XZUUJeQAGHR0jA0SKfVKGCmlubEhCBSGRHSQOQwVmQwsZTgtdh0UQHKIHm2quChGophuiJHO3jkwOFB2UaoYFTnMGegDKRQQG0tMGBM1nAtnaABoU3t8UD81kR%2BUK3eDe4nrk5grR1NLWegva9s9czfhVAgMNpWqgBGNigMGBAwzmxBGjhACEgwcgzAPTqlwGXQ8gMgAhZIGHWm5WjelUZ8jBBgPMTBgwIMGCRgsygVSkgMiHByD7DWDmx5WuMkZqDLCU4gfAq2sACrAEWFSRLjUfWDopCqDTNQIsJ1LF0yzDAA90UHV5eo0qUjB8mgUBACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuickk0FIiCo6A4ZSoZnRBUSiwoEtYipNOBDKOKKgD9DBNHHU4brc4c3cUBeSOk949geEQUZA5rXABHEW4PD0UOZBSHaQAJiEMJgQATFBQVBkQHZKACUwtHbX0RR0mVFp0UFwRCBSQDSgsZrQteqEUPGrAQmmG9ChFqRAkMsBd4xsRLBBsUoG6nBa14E4IA2kUFDuLjDql4peilAA0H7e4H1udH8%2FPs7%2B3xbmj0qOTj5mEWpEP3DUq3glYWOBgAcEmUaNI%2BDBjwAY%2BdS0USGJg4wABEXMYyJNvE8UOGISKVCNClah4xjg60WUKyINOCUwrMzVRARMGENWQ4n%2FjpNTKTm15J%2FCTK2e0MoD%2BUKmHEs4onVDVVmyqdpAbNR4cKTjqNSots07EjzzJh1S0IADsAAAAAAAAAAAA%3D",
			map_resource_barren: '',
			map_resource_wood  : '',
			map_resource_stone : '',
			map_resource_iron  : '',
			map_resource_rice  : '',
			map_resource_wsi   : '',
			map_resource_wsir  : '',
		},

		//. sounds
		sounds: {},

		//. skillTable
		skillTable: (function() {
			return MetaStorage('UNION_TABLE').data;
		})(),

		skillTableUpdate: function() {
			var storage = MetaStorage('UNION_TABLE');

			this.getSkillTable()
			.done(function(data, textStatus, jqXHR) {
				if (jqXHR.getResponseHeader('Etag') == MetaStorage('UNION_TABLE').get('Etag')) {
					Display.info('変更はありません。');
				} else {
					data['Etag'] = jqXHR.getResponseHeader('Etag');
					storage.begin();
					storage.data = data;
					storage.commit();
					Display.info('更新しました。');
				}
			})
			.fail(function(data, textStatus, jqXHR) {
				// Display.alert('エラーが発生しました。しばらくたってから実行してください。');
				$.noop;
			});
		},

		// GitHubリポジトリから合成表を取得する
		getSkillTable: function() {
			// Cross-Origin Resource Sharingについてはこのあたりを参考
			// https://developer.mozilla.org/ja/docs/HTTP_access_control
			
			// 今後何か増えるかもしれないので
			var URL_CORS = {
				'skillTable': 'https://api.github.com/repos/moonlit-g/3gokushi-meta/contents/skillTable.json',
			};

			return $.ajax( URL_CORS['skillTable'], {
				type      : 'GET',
				cache     : true,
				ifModified: true,
				headers: {
					'Accept': 'application/vnd.github.v3.raw+json',
				},
			});
		},
	};

	//■ Display
	var Display = (function() {

		var $sysmessage;

		function Dialog( options ) {
			var $overlay = $('<div id="imi_overlay"><div class="imc_overlay" /><div id="imi_dialog_container" /></div>'),
				$container = $overlay.find('#imi_dialog_container'),
				self = this,
				$body, $footer;

			options = $.extend( { width: 500, height: 200, top: '25%' }, options );

			$overlay.appendTo('BODY');

			if ( options.title ) {
				$container.append('<div class="imc_dialog_header">' + options.title + '</div>');
			}

			$body = $('<div class="imc_dialog_body" />');
			$container.append( $body );

			if ( options.content ) {
				$body.append( options.content );
			}

			if ( options.buttons ) {
				$footer = $('<div class="imc_dialog_footer" />');
				$.each( options.buttons, function( key, callback ) {
					$footer.append(
						$('<button/>').text( key ).click(function() {
							if ( !$(this).attr('disabled') ) { callback.call( self ); }
						})
						);
				});
				$container.append( $footer );
				this.buttons = $footer.find('BUTTON');
			}

			$container.css('top', options.top);
			$container.css('width', options.width);
			$body.css('height', options.height);

			this.append = function() {
				$body.append( arguments[ 0 ] );
			}

			this.message = function( text ) {
				var $div = $('<div class="imc_message">' + text + '</div>');

				$body.append( $div );
				$div.get( 0 ).scrollIntoView();

				return this;
			}

			this.close = function() {
				$overlay.remove();
			}

			return this;
		}

		function show( msg, sound, timeout, cssClass ) {
			if ( !$sysmessage ) {
				$sysmessage = $('<div class="imc_dialog" />').appendTo( document.body );
			}

			var $span = $('<span/>').addClass('imc_dialog_content').addClass( cssClass ).html( msg ).appendTo( document.body );
			$span.width( $span.outerWidth() ).css('display', 'block').appendTo( $sysmessage );

			timeout = timeout || 3000;
			window.setTimeout(function() { remove( $span ); }, timeout);

			if ( sound && Data.sounds.info ) {
				var audio = new Audio( Data.sounds.info );
				audio.volume = 0.6;
				audio.play();
			}
		}

		function remove( $span ) {
			$span.remove();

			if ( $sysmessage.children().length == 0 ) {
				$sysmessage.remove();
				$sysmessage = null;
			}
		}

		//. return
		return {
			info: function( msg, sound, timeout ) {
				show( msg, sound, timeout, 'imc_infomation' );
			},
			alert: function( msg, sound, timeout ) {
				sound = ( sound === undefined ) ? true : sound;
				show( msg, sound, timeout, 'imc_alert' );
			},
			dialog: function( options ) {
				return new Dialog( options );
			}
		}
	})();

	//■ Map
	var Map = {

		//. info
		info: {},

		//. baseList
		baseList: [],

		//. analyzedData
		analyzedData: [],

		//. init
		init: function() {
			// Map.info = Map.mapInfo();
		},

		//. setup
		setup: function() {
			Map.analyze();
			Map.npcPower();
			Map.coordList(Map.info.country);

		// 	$('#ig_mapbox')
		// 		.on('contextmenu', '#mapOverlayMap AREA', function() {
		// 			if (!$('#imi_rclick_link').attr('checked')) {
		// 				return;
		// 			}

		// 			var idx = $(this).attr('idx').toInt(),
		// 				data = Map.analyzedData[idx];

		// 			if (data.user != '' && data.npc == '') {
		// 				Map.contextmenu.userProfile.call(this);
		// 			}
		// 		});

		// 	$('#mapOverlayMap > AREA').contextMenu(Map.contextmenu, true);
		// 	$('#imi_base_list TR').contextMenu(Map.contextmenu, true);

		// 	$('#imi_base_list, #imi_coord_list')
		// 		.on('mouseenter', 'TR', Map.enterRow)
		// 		.on('mouseleave', 'TR', Map.leaveRow);

		// 	$(window).on('popstate', function() {
		// 		Map.moveUrl(location.href);
		// 	});

		// 	if (Map.info.isBattleMap) {
		// 		Util.getBaseList(Map.info.country).
		// 		pipe(function(list) {
		// 			Map.baseList = list;
		// 			Map.fortressLink2();
		// 			MiniMap.showBasePoint('fortress', list);
		// 		})
		// 	} else {
		// 		Map.fortressLink();
		// 	}
		},
	};

	//■ Page
	var Page = function() {
		var path = arguments[0],
			key = '/' + path.join('/'),
			actionList = Page.actionList,
			extentionList = Page.extentionList,
			action;

		console.log(path);
		// if ( Env.loginState == -1 ) {
		// 	return new Page.noaction();
		// }
		// else if ( Env.loginState == 0 ) {
		// 	action = new Page.action();
		// }
		// else {
		// 	action = new Page.pageaction();
		// }
		action = new Page.pageaction();

		if (actionList[key]) {
			$.extend(action, actionList[key]);
		}

		if (extentionList[key]) {
			action.callbacks = extentionList[key];
		}

		return action;
	};
	//. Page
	$.extend(Page, {

		//.. actionList
		actionList: {},

		//.. extentionList
		extentionList: {},

		//.. registerAction
		registerAction: function() {
			var args = Array.prototype.slice.call(arguments),
				obj = args.pop(),
				key = '/' + args.join('/'),
				list = this.actionList;

			if (list[key]) {
				$.extend(list[key], obj);
			} else {
				list[key] = obj;
			}
		},

		//.. getAction
		getAction: function() {
			var args = Array.prototype.slice.call(arguments),
				action = args.pop(),
				key = '/' + args.join('/'),
				list = this.actionList;

			if (list[key] && list[key][action]) {
				return list[key][action];
			} else {
				return $.noop;
			}
		},

		//.. registerExtention
		registerExtention: function() {
			var args = Array.prototype.slice.call(arguments),
				obj = args.pop(),
				list = this.extentionList;

			if (!$.isFunction(obj)) {
				return;
			}

			args.forEach(function(key) {
				var callbacks;

				if (list[key]) {
					callbacks = list[key];
				} else {
					list[key] = callbacks = $.Callbacks();
				}

				callbacks.add(obj);
			});
		},

		//.. form
		form: function(action, data, new_tab) {
			var $form = $('<form/>');

			$form.css('display', 'none').attr({
				action: action,
				method: 'post'
			});
			if (new_tab) {
				$form.attr('target', '_blank');
			}

			$.each(data, function(key, value) {
				if ($.isArray(value)) {
					$.each(value, function(idx, value2) {
						value2 = (value2 === null || value2 === undefined) ? '' : value2;
						$form.append($('<input/>').attr({
							name: key,
							value: value2
						}));
					})
				} else {
					value = (value === null || value === undefined) ? '' : value;
					$form.append($('<input/>').attr({
						name: key,
						value: value
					}));
				}
			});

			$form.appendTo(document.body).submit();
			$form.remove();
		},

		//.. ajax
		ajax: function(url, options) {
			return $.ajax(url, options)
				.pipe(function(html) {
					var $html = $(html);

					if ($html.find('img[alt="セッションタイムアウト"]').length > 0) {
						Display.alert('セッションタイムアウトしました。');
						return $.Deferred().reject();
					} else if (html.indexOf('<title>メンテナンス中') >= 0) {
						Display.alert('メンテナンス中です。');
						return $.Deferred().reject();
					}

					['TABLE.stateTable', '#chatComment', '#chatComment_i', '#chatComment_g', '#chatComment_s5_h'].forEach(function(selecter) {
						var $elem = $html.find(selecter);
						if ($elem.length == 0) {
							return;
						}
						$(selecter).replaceWith($elem);
					});
					$('#commentBox').trigger('update');

					return html;
				});
		},

		//.. get
		get: function(url, data) {
			return Page.ajax(url, {
				type: 'get',
				data: data
			});
		},

		//.. post
		post: function(url, data) {
			return Page.ajax(url, {
				type: 'post',
				data: data
			});
		},

		//.. move
		move: function(url) {
			window.setTimeout(function() {
				location.href = url;
			}, 1000);
		},

		//.. action
		action: function() {},

		//.. pageaction
		pageaction: function() {},

		//.. noaction
		noaction: function() {}
	});
	//. Page.action.prototype
	$.extend(Page.action.prototype, {

		//.. execute
		execute: function() {
			this.addStyle();
			this.main();
		},

		//.. addStyle
		addStyle: function() {
			var style = Data.style;

			if (this.style) {
				style += this.style;
			}

			GM_addStyle(style);
		},

		//.. main
		main: function() {}
	});
	//. Page.pageaction.prototype
	$.extend(Page.pageaction.prototype, {
		//.. execute
		execute: function() {
			this.addStyle();
			this.ajaxLoadingIcon();
			this.changeTitle();
			this.changeStatusBar();
			this.changeSideBar();
			this.changeChatLink();
			this.createCoordLink();
			this.switchCardParameter();
			this.showTimeoutTimer();

			this.changeLink();

			SideBar.init();

			this.main();
			if ( this.callbacks ) {
				this.callbacks.fire();
			}

			this.escapeSpecialCharacters();
			this.createPulldownMenu();

			Util.keyBindCommon();
			SideBar.setup();
		},

		//.. addStyle
		addStyle: function() {
			var style = Data.style;

			if (this.style) {
				style += this.style;
			}

			GM_addStyle(style);
		},

		//.. ajaxLoadingIcon
		ajaxLoadingIcon: function() {
			$(document)
			.on('ajaxStart', function() {
				if( $('#imi_ajax_load').length == 0 ) {
					$('body').append('<span id="imi_ajax_load" class="imc_ajax_load" style="display: none;"><img src="' + Data.images.ajax_load + '"></span>');
				}
				$('#imi_ajax_load').show();
			})
			.on('ajaxStop', function() {
				$('#imi_ajax_load').hide();
			});

		},

		//.. changeLink
		changeLink: function() {
			$()

		},

		//.. changeTitle
		changeTitle: function() {
			// if ( Env.world ) {
			// 	$('TITLE').text( '【' + Env.world + '】' + $('TITLE').text() );
			// }
		},

		//.. changeStatusBar
		changeStatusBar: function() {
			// $('#status').prependTo('#header');
			// $('#status_left').css('width', '100%');

			// var resource = Util.getResource(),
			// 	production = Util.getProduction(),
			// 	max = $('#wood_max').text().toInt(),
			// 	money_b = $('.money_b').text(),
			// 	money_c = $('.money_c').text(),
			// 	fame = $('#status_left LI').eq( 4 ).text(),
			// 	rate = [], period = [];

			// for ( var i = 0, len = resource.length; i < len; i++ ) {
			// 	rate[ i ] = Math.floor( resource[ i ] / max * 100 ) + '%';
			// 	period[ i ] = ( max - resource[ i ] ) / production[ i ];

			// 	if ( period[ i ] < 3 ) {
			// 		period[ i ] = 'imc_overflow';
			// 	}
			// 	else if ( period[ i ] < 8 ) {
			// 		period[ i ] = 'imc_alert';
			// 	}
			// 	else {
			// 		period[ i ] = '';
			// 	}
			// }

			// html = '' +
			// '<ul>' +
			// '<li><img align="middle" src="' + Data.images.icon_wood +'" alt="木" title="木">&nbsp;<span class="imc_outer_bar ' + period[ 0 ] + '"><span style="width: ' + rate[ 0 ] + '" class="imc_inner_bar imc_wood"><span class="imc_bar_contents"><span id="wood">' + resource[ 0 ].toFormatNumber() + '</span><span style="display:none;">&nbsp;/&nbsp;</span><span id="wood_max" style="display:none;">' + max + '</span></span></span></span></li>' +
			// '<li><img align="middle" src="' + Data.images.icon_wool +'" alt="綿" title="綿">&nbsp;<span class="imc_outer_bar ' + period[ 1 ] + '"><span style="width: ' + rate[ 1 ] + '" class="imc_inner_bar imc_stone"><span class="imc_bar_contents"><span id="stone">' + resource[ 1 ].toFormatNumber() + '</span><span style="display:none;">&nbsp;/&nbsp;</span><span id="stone_max" style="display:none;">' + max + '</span></span></span></span></li>' +
			// '<li><img align="middle" src="' + Data.images.icon_iron +'" alt="鉄" title="鉄">&nbsp;<span class="imc_outer_bar ' + period[ 2 ] + '"><span style="width: ' + rate[ 2 ] + '" class="imc_inner_bar imc_iron"><span class="imc_bar_contents"><span id="iron">' + resource[ 2 ].toFormatNumber() + '</span><span style="display:none;">&nbsp;/&nbsp;</span><span id="iron_max" style="display:none;">' + max + '</span></span></span></span></li>' +
			// '<li><img align="middle" src="' + Data.images.icon_rice +'" alt="糧" title="糧">&nbsp;<span class="imc_outer_bar ' + period[ 3 ] + '"><span style="width: ' + rate[ 3 ] + '" class="imc_inner_bar imc_rice"><span class="imc_bar_contents"><span id="rice">' + resource[ 3 ].toFormatNumber() + '</span><span style="display:none;">&nbsp;/&nbsp;</span><span id="rice_max" style="display:none;">' + max + '</span></span></span></span></li>' +
			// '<li><img align="middle" src="' + Data.images.icon_gran +'" alt="蔵" title="蔵"><span id="wood_max">' + max.toFormatNumber() + '</span></li>' +
			// '<li><img align="middle" src="' + Data.images.icon_fame +'" alt="名声" title="名声"><span>' + fame + '</span></li>' +
			// '<li class="sep">' +
			// 	'<span class="money_b">' + money_b + '</span>' +
			// 	'<span class="money_c" style="position: relative;">' + money_c +
			// 	'<ul class="imc_pulldown">' +
			// 	'<li class="imc_pulldown_item"><a href="/cp/purchase_cp.php">金を購入</a></li>' +
			// 	'<li class="imc_pulldown_item"><a href="/cp/item_list.php">便利機能</a></li>' +
			// 	'</span>' +
			// 	'</ul>' +
			// '</li>' +
			// // '<li class="sep">' +
			// // 	// enemy = MetaStorage('UNIT_STATUS').get('敵襲') || [],
			// // 	'<a href="/facility/unit_status.php?dmo=enemy">敵襲</a>' +
			// // '</li>' +
			// '<li class="sep">' +
			// '<a href="/facility/unit_status.php?dmo=all">全部隊</a>' +
			// '<span>&nbsp;</span>' +
			// '<span style="position: relative;">' +
			// '<a href="/facility/set_unit_list.php?show_num=100">全編成</a>' +
			// '<ul class="imc_pulldown">' +
			// '<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=1">【第一組】</a></li>' +
			// '<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=2">【第二組】</a></li>' +
			// '<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=3">【第三組】</a></li>' +
			// '<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=4">【第四組】</a></li>' +
			// '<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=5">【未設定】</a></li>' +
			// '</ul>' +
			// '</span>' +
			// 	GoldMine.getMenuText() +
			// '</li>' +
			// '<li class="sep">' +
			// 	'<span style="position: relative;">' +
			// 	'<span id="imi_knightErrant" data-state="wait">修行</span>' +
			// 	// '<ul class="imc_pulldown">' +
			// 	// 	'<li class="imc_pulldown_item"><a href="javascript:void(0)">設定</a></li>' +
			// 	// '</ul>' +
			// 	'</span>' +
			// '</li>' +
			// '</ul>';

			// $('#status_left').html( html );

			// // 金山メニューのイベント登録
			// GoldMine.setEvent();
			// // 修行のイベント登録
			// KnightErrant.setEvent();

			// //IXA占い
			// $('#status .rightF')
			// .children('P')
			// 	.filter(':even').remove().end()
			// .css('padding', '0px').end()
			// .appendTo('#status_left')
			// .wrapAll('<a href="/user/uranai/uranai.php"/>');
		},

		//.. changeSideBar
		changeSideBar: function() {
			var $sideBar  = $('#sidebar'),
				$commands = $sideBar.children('UL:first'),
				$world    = $('#navi01 .world');

			// $commands.clone().css({'z-index':8000}).hide().appendTo( $world );
			// $commands.hide();

			// $world
			// .on('click', function() {
			// 	$(this).children('UL').toggle();
			// });

			// var $sideboxtop_div = $('#sideboxTop > DIV.sideBox'),
			// 	$sidebottom = $('#sideboxBottom'),
			// 	$sidebottom_div = $sidebottom.children('DIV.sideBox'),
			// 	$kin_div  = $sideboxtop_div.eq( 0 ).addClass('last'),
			// 	$card_div = $sideboxtop_div.eq( 1 ),
			// 	$joutai_div = $sideboxtop_div.eq( 2 ),
			// 	$seisan_div = $sidebottom_div.eq( 0 ),
			// 	$kyoten_div = $sidebottom_div.eq( 1 ),
			// 	$houkoku_div = $sidebottom_div.eq( 2 ).removeClass('last');

			// //二重カウントダウン防止
			// $houkoku_div.find('SCRIPT').remove();
			// $sidebottom.prepend( $houkoku_div ).append( $card_div, $seisan_div, $kin_div );

			// //生産量合計
			// var production = Util.getProduction();
			// $seisan_div.find('UL.side_make LI').each(function( idx ) {
			// 	$(this).after('<li style="padding-left: 25px; color: #0c0;">=' + production[ idx ] + '</li>');
			// });

			// $card_div.find('A')
			// .eq( 1 ).attr('href', '/card/trade.php?t=name&k=&s=no&o=a').end()
			// .eq( 3 ).attr('href', '/card/card_album.php?rarity_type=3').end();

			// //合戦ボタン削除
			// $('.situationWorldTable').has('A[href="/war/war_situation.php"]').remove();
			// $('.situationWorldTable').has('A[href="/country/all.php"]').remove();
			// //占いボタン削除
			// $('.situationBtnTable').has('A[href="/user/uranai/uranai.php"]').remove();
			// // 状態タイトルの消去
			// $joutai_div.children('.sideBoxHead').css({ height: '25px' }).empty().append( $('.stateTable') );

			// // 銅銭、金、購入、便利機能の削除 → ステータスバーで表示
			// $kin_div.remove();

			// // 各メニューのトグル
			// $('.sideBox h3').click( function() {
			// 	Display.info( $(this).find('img').attr('alt') );
			// 	//console.log( $(this).find('img').attr('alt') );
			// 	$(this).closest('.sideBox').find('.sideBoxInner').toggle();
			// 	// 拠点用
			// 	$(this).closest('.sideBox').find('.sideBoxHead').has('h4').toggle();
			// });
			// // トグル状態を記憶して、次回の初期値にする
		},

		//.. changeChatLink
		changeChatLink: function() {
			// $('#header DIV.commentbtn2 A:eq(1)').attr('href', '/alliance/chat_view.php?pager_select=100');
		},

		//.. createCoordLink
		createCoordLink: function() {
			// var coordReg = /-?\d{1,3}[，,.]\s*-?\d{1,3}/g,
			// 	pointReg = /-?\d{1,3}/g,
			// 	point, html;

			// $('#commentBox')
			// .on('update', function() {
			// 	$('#commentBody TD.msg > SPAN').each(function() {
			// 		var $this = $(this),
			// 			text = $this.text(),
			// 			array = text.match( coordReg );

			// 		if ( !array ) { return; }

			// 		for ( var i = 0, len = array.length; i < len; i++ ) {
			// 			point = array[ i ].match( pointReg );
			// 			html = '<span class="ime_coord imc_coord" x="' + point[0] + '" y="' + point[1] + '">' + array[ i ] + '</span>';
			// 			text = text.replace( array[ i ], html );
			// 			$this.html( text );
			// 		}
			// 	});
			// })
			// .trigger('update');

			// $('.ime_coord').live('click', function() {
			// 	var $this = $(this),
			// 		x = $this.attr('x'),
			// 		y = $this.attr('y'),
			// 		c = $this.attr('c') || '';

			// 		Map.move( x, y, c );
			// })
			// .live('mouseenter', function() {
			// 	var $this = $(this),
			// 		x = $this.attr('x'),
			// 		y = $this.attr('y'),
			// 		areaid = 'imi_area_' + x + '_' + y;

			// 	MiniMap.showPointer( x.toInt(), y.toInt() );
			// 	$('#' + areaid).mouseover();
			// })
			// .live('mouseleave', function() {
			// 	var $this = $(this),
			// 		x = $this.attr('x'),
			// 		y = $this.attr('y'),
			// 		areaid = 'imi_area_' + x + '_' + y;

			// 	MiniMap.showPointer();
			// 	$('#' + areaid).mouseout();
			// });
		},

		//.. switchCardParameter
		switchCardParameter: function() {
			// $('#TB_ajaxContent .ig_card_cardStatusFront').live('click', function() {
			// 	var $elem = $(this).find('.ig_card_parameta, .parameta_area, .ig_card_frame'),
			// 		len = $elem.filter(':visible').length;

			// 	if ( len == 3 ) {
			// 		$elem.filter('.ig_card_parameta, .parameta_area').hide();
			// 	}
			// 	else if ( len == 1 ) {
			// 		$elem.filter('.ig_card_frame').hide();
			// 	}
			// 	else {
			// 		$elem.show();
			// 	}
			// });
		},

		//.. showTimeoutTimer
		showTimeoutTimer: function() {
			// var html;

			// if ( !Env.endtime ) { return; }

			// html = '' +
			// '【' + ( Env.season || '?' ) + '期 ' + ( Env.chapter || '?' ) + '章】 ' +
			// 'タイムアウトまで <span class="imc_countdown_display" />';

			// $('#lordSiteArea').empty()
			// .addClass('imc_countdown')
			// .data({ endtime: Env.endtime, alert: 300, alertevent: 'sessionalert' })
			// .append( html );
		},

		//.. escapeSpecialCharacters
		escapeSpecialCharacters: function() {
			//特殊文字
			var SpecialCharacters = '&shy;/&zwnj;/&zwj;/&lrm;/&rlm;/&#8203;',
				sc = SpecialCharacters.split('/'),
				sclist = $('<div/>').html(SpecialCharacters).html().split('/');

			$('A[href^="/user/"]').each(escape);
			$('A[href^="/alliance/info.php"]').each(escape);
			$('A[href^="/land.php"]').each(escape);

			function escape() {
				var $this = $(this),
					text = $this.text();

				if ($this.has('IMG, .img_face').length > 0) {
					return;
				}

				for (var i = 0; i < sclist.length; i++) {
					text = text.replace(sclist[i], sc[i], 'g');
				}

				if (text == '') {
					text = '(未設定)';
				}

				$this.text(text);
			}
		},

		//.. createPulldownMenu
		createPulldownMenu: function() {},

		//.. main
		main: function() {}
	});
	//. Page.noaction.prototype
	$.extend(Page.noaction.prototype, {

		//.. execute
		execute: function() {}
	});

	//■ Deck
	var Deck = function() {};
	//. Deck
	$.extend( Deck, {
		//.. analyzedData
		analyzedData: {},
	});

	//■ Unit

	//■ Card
	var Card = function(element) {
		this.analyzeType = 'Large';

		this.analyze(element);
		// this.power();
	}
	$.extend(Card, {
		EXHIBITED: -2,  // 出品中
		DISABLED : -1,  // 不可
		WAIT     :  0,  // 待機
		SELECTED :  1,  // 選択中?
		UNSET    :  2,  // 解除?
		UNIT     :  3,  // デッキセット中?
		ACTION   :  4,  // 行動中?
	});
	$.extend(Card.prototype, {
		//.. status
		analyzeType: '',
		layoutType : '',

		status: 0,
		idx: 0,
		element: null,

		//.. parameter
		rarerity: '', cost: 0.0, name: '', level: 0, solType: '', cardNo: 0,
		hp: 0, atk: 0, int: 0.0, wdef: 0, sdef: 0, bdef: 0, rdef: 0, wdef: 0, speed: 0,
		score: 0, expNow: 0, expNext: 0, battleGage: 0, base: 0,
		status: '', cardId: 0, illust: '',
		lvup: 0, gounit: 0,
		skillList: [],

		//.. analyze
		analyze: function(element) {
			if( this.analyzeType == 'Large' ) {
				this.analyzeLarge( element );
			}
			else if( this.analyzeType == 'Unit' ) {
				this.analyzeUnit( element );
			}
			else if( this.analyzeType == 'Small' ) {
				this.analyzeSmall( element );
			}
		},
		analyzeLarge: function(element) {
			var $elem = $(element);
			// 速度に問題があれば children('SPAN') で順番に
			this.rarerity = $elem.find('.rarerity img').attr('alt');
			this.cost     = $elem.find('.cost').text();
			this.name     = $elem.find('div.name > span.name').text();
			this.level    = $elem.find('.level span').text();
			this.solType  = $elem.find('.soltype img').attr('alt');
			this.cardNo   = $elem.find('.cardno').text();
			this.hp       = $elem.find('.status_hp > .value').text().match(/(\d+)\/\d+/)[1] || 0;
			this.atk      = $elem.find('.status_att').text().toInt();
			this.int      = $elem.find('.status_int').text().toFloat();
			this.wdef     = $elem.find('.status_wdef').text().toInt();  // 歩防
			this.sdef     = $elem.find('.status_sdef').text().toInt();  // 槍防
			this.bdef     = $elem.find('.status_bdef').text().toInt();  // 弓防
			this.rdef     = $elem.find('.status_rdef').text().toInt();  // 馬防
			this.adef     = ( this.wdef + this.sdef + this.bdef + this.rdef ) / 4; // 防御平均
			this.speed    = $elem.find('.status_speed').text().toFloat(); // 移速
			this.score    = $elem.find('.score').text().match(/:(\d+)/)[1] || 0;
			this.expNow   = $elem.find('.ex_now').text().match(/:(\d+)/)[1] || 0;
			this.expNext  = $elem.find('.ex_next').text().match(/:([\d|\-]+)/)[1] || 0;

			skilllist = [];
			$elem.find('.back_skill LI').each(function() {
				skilllist.push({
					name    : $(this).find('.skill_name').text(),
					desc    : $(this).find('.skill1,.skill2,.skill3,.skill4').text(),
					recovery: $(this).find('.skill-kaifuku').length,  // 回復中
					passive : $(this).find('.skill_name.red').length, // パッシブ
				});
			});
			this.skillList = skilllist;

			this.illust = $elem.find('.illust').attr('src');
		},
		analyzeUnit: function(element) {
			var $elem = $(element),
				$card = $elem,
				text, array;

			this.analyzeLarge( $card );

			this.battleGage = $elem.find('.control .gage img').attr('alt').toInt();
			this.base       = $elem.find('.control dl dd:eq(1) a').attr('href').match(/village_id=(\d+)/)[1] || 0;
			this.status     = $elem.find('.control dl dd:eq(2)').text();
				// 出兵中[(座標)]
				// 内政セット済み
				// 待機中

			// カードID
			text = $elem.find('.control .btn_deck_set').attr('onclick');
			if( text != undefined ) {
				array = text.match(/operationExecution\(.*,\s?(\d+),.*\)/);
				if( array != null ) { this.cardId = array[1].toInt(); }
			}
		},
		analyzeSmall: function(element) {
			var $elem = $(element),
				$card = $elem.children('[id^=cardWindow_]'),
				array;

			this.analyzeLarge( $card );

			this.lvup = $elem.find('.levelup').length;

			// デッキセットボタンの判定
			this.gounit = $elem.find('.set').length;
			// $elem.find('.aboutdeck').length;

			// 討伐ゲージ
			array = $elem.text().match(/討伐\s*(\d+)/);
			if( array != null ) { this.battleGage = array[1].toInt(); }
			// 振り直し
			// 保護
			// ラベル
			// 破棄

			// status
		},
		analyzeList: function(element) {
			var $elem = $(element);
			var href = $elem.find('a[href*=inlineId').attr('href'),
				cwid = href.match(/inlieId=(cardWindow_\d+)/)[1] || '';

			var $cardWindow = $('#' + cwid);
			if ($cardWindow.length > 0) {
				analyzeLarge($cardWindow);
			}
		},

		//.. layouter
		layouter: function() {
			if ( this.layoutType == 'Unit' ) {
				this.layouterUnit();
			}
			else if ( this.layoutType == 'Small' ) {
				this.layouterSmall();
			}
			else if ( this.layoutType == 'Mini' ) {
				this.layouterMini();
			}
		},
		layouterUnit: function() {
			var $elem = this.element;

			// console.log( this );
		},
		layouterSmall: function() {
			var $elem = this.element,
				lvClass = ( this.level == 400 ) ? 'imc_lv imc_lvMax' : 'imc_lv',
				countryClass = '', html, html2;
			if( this.cardNo < 2000 ) {
				countryClass = 'imc_country_Shoku';
			}
			else if( this.cardNo < 3000 ) {
				countryClass = 'imc_country_Gi';
			}
			else if( this.cardNo < 4000 ) {
				countryClass = 'imc_country_Go';
			}
			else if( this.cardNo < 5000 ) {
				countryClass = 'imc_country_Hoka';
			}
			else if( this.cardNo < 10000 ) {
				countryClass = 'imc_country_Ha';
			}

			// ヘッダ部(名前|コスト|兵科|レベル)
			html = '' +
			'<div class="imc_deck_smallcard_title clearfix">' +
				'<span class="imc_cardname ' + countryClass + '">' + this.name + '</span>' +
				'<span class="imc_card_header">' +
					'<span>' + this.cost + '</span>' +
					'<span>｜' + this.solType + '</span>' + 
					'<span title="次レベルまで' + this.expNext + '">｜Lv&nbsp;</span>' + 
					'<span class="' + lvClass +'">' + this.level + '</span>' +
				'</span>' +
			'</div>';
			$elem.prepend( html );

			$elem.find('.statusDetail').removeClass('statusDetail').addClass('imc_statusDetail');

			$elem.find('.left').removeClass('left').addClass('imc_statusDetail_Left');
			// ステータス
			$elem.find('.right').removeClass('right').addClass('imc_statusDetail_Right')
			.html( this.layouterParam() + this.layouterSkill() + this.layouterStatus() );
			// 操作
			$elem.find('.otherDetail').remove();

			// 拠点情報取得
			var list = MetaStorage('VILLAGE').get('list') || [];

			html = '' +
			'<select id=selected_village[' + this.cardId + ']>' +
				// '<option></option>' +
			'</select>';
			html2 = '';
			for ( var i = 0, len = list.length; i < len; i++ ) {
				html2 += '<option value="' + list[i].id + '">' + list[i].name + '</option>';
			}
			$elem.append( html ).find('SELECT').append( html2 );
		},
		layoutMini: function() {
			var $elem = this.element,
				html;
		},
		layouterSp: function() {
			// var $elem = this.element,
			// 	html;

			// $elem.find('.illustMini IMG').addClass('smallcard_chara');

			// html = '' +
			// '<div class="imc_deck_smallcard_title clearfix">' +
			// 	'<span class="imc_cardname">' + this.name + '</span>' +
			// 	// '<span class="imc_card_header">' +
			// 	// 	'<span>' + this.cost + '</span>' +
			// 	// 	'<span>｜' + this.solType + '</span>' + 
			// 	// 	'<span>｜Lv　</span>' + 
			// 	// 	'<span class="imc_lv">' + this.level + '</span>' +
			// 	// '</span>' +
			// '</div>' +
			// // .statusDetail
			// '<div class="clearfix">' +
			// 	// .left
			// 	'<div class="ig_deck_smallcardimage">' +
			// 		'<div class="ig_deck_smallcardbox">' +
			// 			'<span class="imc_card_header">' +
			// 				'<span>' + this.cost + '</span>' +
			// 				'<span>｜' + this.solType.match(/(.)兵/)[1] + '</span>' + 
			// 				'<span>｜Lv</span>' + 
			// 				'<span class="imc_lv">' + this.level + '</span>' +
			// 			'</span>' +
			// 			this.layouterSkill() +
			// 			$elem.find('.illustMini').html() +
			// 		'</div>' +
			// 		this.layouterStatus() +
			// 	'</div>' +
			// 	// .right
			// 	// '<div class="ig_deck_smallcarddataarea">' +
			// 	// 	this.layouterHoge() +
			// 	// 	this.layouterParam() +
			// 	// '</div>' +
			// '</div>' +
			// '';

			// $elem.prepend( html );
			// $elem.find('.statusDetail').remove();
			// $elem.find('.otherDetail').remove();
			// // $elem.removeClass('cardStatusDetail').addClass('ig_deck_smallcardarea');
			// $elem.addClass('ig_deck_smallcardarea');
		},
		layouterMini: function() {
		},

		layouterSkill: function() {
			// var color_table = { '攻': '#058', '防': '#363', '速': '#535', '特': '#850' },
			var color_table = {},
				html;

			html = '<table class="imc_card_skill">';
			for( var i = 0; i < 4; i++ ) {
				let skill = this.skillList[i],
					classSkill = '';

				if( skill ) {
					if( skill.recovery ) {
						classSkill = 'used';
					}
					else if( skill.passive ) {
						classSkill = 'passive';
					}
					var name = '';
					var array = skill.name.match(/.*:(.*LV\d+)/);
					if( array != null ) {
						name = array[1];
					}
					html += 
					'<tr>' +
					'<th>技' + ( i + 1 ) + '</th>' +
					'<td class="' + classSkill + '">' + name + '</td>' +
					'</tr>';
				}
				else {
					html += '<tr>' +
					'<th>技' + ( i + 1 ) + '</th>' +
					'<td></td>' +
					'</tr>';
				}
			}
			html += '</table>';

			return html;
		},
		layouterHoge: function() {
			var html;

			html = '';

			return html;
		},
		layouterParam: function() {
			var html;

			html = '' +
			'<table class="imc_card_param">' +
				'<tr>' +
					'<th>攻撃</th><td>' + this.atk.toFormatNumber(0) + '</td>' +
					'<th>知力</th><td>' + this.int.toFormatNumber(2) + '</td>' +
				'</tr>' +
				'<tr>' +
					'<th></th><td></td>' +
					'<th>速度</th><td>' + this.speed.toFormatNumber(1) + '</td>' +
				'</tr>' +
				'<tr>' +
					'<th>歩防</th><td>' + this.wdef.toFormatNumber(0) + '</td>' +
					'<th>槍防</th><td>' + this.sdef.toFormatNumber(0) + '</td>' +
				'</tr>' +
				'<tr>' +
					'<th>弓防</th><td>' + this.bdef.toFormatNumber(0) + '</td>' +
					'<th>馬防</th><td>' + this.rdef.toFormatNumber(0) + '</td>' +
				'</tr>' +
			'</table>';

			return html;
		},
		layouterStatus: function() {
			var html, coverRate;

			html = '';

			//HPバー表示
			coverRate = ( 100 - Math.floor( this.hp / 100 * 100 )) + '%';
			html += '<div class="imc_bar_title">HP： ' + this.hp + ' / ' + 100 + '</div>' +
					'<div class="imc_bar_hp"><span class="imc_bar_inner" style="width: ' + coverRate + '" /></div>';
			//討伐ゲージ表示
			coverRate = ( 100 - Math.floor( this.battleGage / 300 * 100 )) + '%';
			html += '<div class="imc_bar_title">討伐ゲージ： ' + this.battleGage + '</div>' +
					'<div class="imc_bar_battle_gage"><span class="imc_bar_inner" style="width: ' + coverRate + '" /></div>';

			return html;
		},
	});
	
	//■ UnitCard
	var UnitCard = function( element ) {
		this.analyzeType = 'Unit';
		this.layoutType  = 'Unit';

		this.analyze( element );

		this.element = $( element );
		this.element.attr({ card_id: this.cardId });
		this.layouter();
	}
	$.extend(UnitCard, {
		//.. setup
		setup: function( $list ) {
			$list.each( function() {
				var card = new UnitCard( this );
				if( card.cardId ) {
					Deck.analyzedData[ card.cardId ] = card;
				}
			})
		}
	});
	$.extend(UnitCard.prototype, Card.prototype, {
		//.. clone
		clone: function() {
			// var $clone = this.element.clone().show();

			// $clone
			// .find('.imc_button_container, .ranklvup_m').remove().end()
			// .find('.smallcard_chara').unwrap().end();

			// return $clone;
		}
	});

	//■ SmallCard
	var SmallCard = function( element ) {
		this.analyzeType = 'Small';
		this.layoutType  = 'Small';

		this.analyze( element );

		this.element = $( element );
		this.element.attr({ card_id: this.cardId });
		this.layouter();
	}
	$.extend(SmallCard, {
		//.. setup
		setup: function( $list ) {
			$list.each( function() {
				var card = new SmallCard( this );
				if( card.cardId ) {
					Deck.analyzedData[ card.cardId ] = card;
				}
			})
		}
	});
	$.extend(SmallCard.prototype, Card.prototype, {
		//.. clone
		clone: function() {
			// var $clone = this.element.clone().show();

			// $clone
			// .find('.imc_button_container, .ranklvup_m').remove().end()
			// .find('.smallcard_chara').unwrap().end();

			// return $clone;
		}
	});

	//■ SideBar
	var SideBar = {
		//. init
		init: function() {
			$('#sidebar .basename')
			// .eq(0).addClass('imc_basename imc_home').end()
			// .eq(1).addClass('imc_basename imc_away').end()
			.addClass('imc_basename')
			.parent().attr('id', 'imi_basename');
		},

		//. setup
		setup: function() {
			// // カーソルとイベント発生箇所を「設定」のみに変更
			// $('<span style="float: right">設定</span>')
			// .appendTo($('#imi_basename .imc_home').prev().find('H4'))
			// .css({
			// 	cursor: 'pointer'
			// })
			// .on('click', function() {
			// 	var build = MetaStorage('SETTINGS').get('build') || 0,
			// 		html;

			// 	html = '' +
			// 		'<div>カウントダウン表示</div>' +
			// 		'<br/>' +
			// 		'<ul id="imi_setting_dialog">' +
			// 		'<li><label><input type="checkbox" value="8" ' + ((build & 0x08) ? 'checked' : '') + '> 敵襲</label></li>' +
			// 		'<li><label><input type="checkbox" value="4" ' + ((build & 0x04) ? 'checked' : '') + '> 部隊</label></li>' +
			// 		'<li><label><input type="checkbox" value="1" ' + ((build & 0x01) ? 'checked' : '') + '> 建設／研究</label></li>' +
			// 		'<li><label><input type="checkbox" value="2" ' + ((build & 0x02) ? 'checked' : '') + '> 訓練</label></li>' +
			// 		'</ul>';

			// 	Display.dialog({
			// 		title: 'サイドバー設定',
			// 		width: 200,
			// 		height: 100,
			// 		content: html,
			// 		buttons: {
			// 			'決定': function() {
			// 				var result = 0;

			// 				$('#imi_setting_dialog INPUT:checked').each(function() {
			// 					result += $(this).val().toInt();
			// 				});

			// 				MetaStorage('SETTINGS').set('build', result);

			// 				if ((build ^ result) & result & 0x04) {
			// 					Util.getUnitStatus();
			// 				} else {
			// 					$('#imi_basename').trigger('update');
			// 				}
			// 				this.close();
			// 			},
			// 			'キャンセル': function() {
			// 				this.close();
			// 			}
			// 		}
			// 	});
			// });

			// $('#imi_basename')
			// .on('update', function() {
			// 	var build = MetaStorage('SETTINGS').get('build') || 0;

			// 	$('#imi_basename LI.imc_enemy').removeClass('imc_enemy');
			// 	$('#imi_basename').find('.imc_other, .imc_side_countdown').remove();

			// 	if (build & 0x08) {
			// 		SideBar.countDown('敵襲');
			// 	}
			// 	if (build & 0x04) {
			// 		SideBar.countDown('部隊');
			// 	}
			// 	if (build & 0x01) {
			// 		SideBar.countDown('建設');
			// 	}
			// 	if (build & 0x01) {
			// 		SideBar.countDown('削除');
			// 	}
			// 	if (build & 0x02) {
			// 		SideBar.countDown('訓練');
			// 	}

			// 	Util.countDown();
			// })
			// .trigger('update');

			// $('#imi_basename .basename LI').contextMenu(SideBar.contextmenu, true);

			// if (Env.loginProcess) {
			// 	Util.getUnitStatusCD();
			// }

			// // サイドバーの状態を復元
			// var storage = MetaStorage('SIDEBAR');
			// $('.sideBox h3').each(function() {
			// 	let key = $(this).find('img').attr('alt');
			// 	let state = storage.get(key);
			// 	$(this).closest('.sideBox').find('.sideBoxInner').css('display', state);
			// 	$(this).closest('.sideBox').find('.sideBoxHead').has('h4').css('display', state);
			// })
			// // 各メニューのトグルイベント
			// $('.sideBox h3').click(function() {
			// 	let key = $(this).find('img').attr('alt');

			// 	$(this).closest('.sideBox').find('.sideBoxInner').toggle();
			// 	$(this).closest('.sideBox').find('.sideBoxHead').has('h4').toggle(); // 拠点用

			// 	storage.set(key, $(this).closest('.sideBox').find('.sideBoxInner').css('display'));
			// });
		},

		// //. countDown
		// countDown: function(type) {
		// 	var cd_list = SideBar.load(type),
		// 		date = Util.getServerTime(),
		// 		classlist = {
		// 			'攻撃': 'imc_attack',
		// 			'陣張': 'imc_camp',
		// 			'合流': 'imc_meeting',
		// 			'加勢': 'imc_backup',
		// 			'帰還': 'imc_return',
		// 			'探索': 'imc_dungeon',
		// 			'討伐': 'imc_dungeon',
		// 			'開拓': 'imc_develop',
		// 			'国移': 'imc_move',
		// 			'待機': 'imc_wait',
		// 			'加待': 'imc_backup_wait'
		// 		};

		// 	$.each(cd_list, function(key, list) {
		// 		var $base = $('#imi_basename LI > *').filter(function() {
		// 				return ($(this).text() == key);
		// 			}),
		// 			$other = $('.imc_other');

		// 		if ($base.length == 0) {
		// 			if ($other.length == 0) {
		// 				$other = $('<div class="imc_other">' +
		// 					'<div class="sideBoxHead"><h4>その他</h4></div>' +
		// 					'<div class="sideBoxInner basename"><ul /></div></div>');
		// 				$('#imi_basename .imc_basename').first().prev().before($other);
		// 			}

		// 			$base = $('<li><span>' + key + '</span></li>');
		// 			$other.find('UL').append($base);
		// 		} else {
		// 			$base = $base.parent();
		// 		}

		// 		list.sort(function(a, b) {
		// 			return (a[0] > b[0]);
		// 		});

		// 		for (var i = 0, len = list.length; i < len; i++) {
		// 			let [endtime, label, mode, ano, x, y, c] = list[i],
		// 			html, $div, finishevent, message, cssClass;

		// 			cssClass = classlist[mode] || '';
		// 			html = '<div class="imc_countdown imc_side_countdown"><span class="' + cssClass + '">' +
		// 				label + '</span>(<span class="imc_countdown_display" />)' +
		// 				'</div>';

		// 			$div = $(html);

		// 			if (type == '敵襲') {
		// 				$div.addClass('imc_enemy');
		// 				//				$base.addClass('imc_enemy');
		// 				finishevent = 'actionrefresh';
		// 			} else if (type == '部隊' && (mode == '待機' || mode == '加待')) {
		// 				$div.attr('ano', ano).addClass('imc_unit').removeClass('imc_countdown');
		// 				$div.find('.imc_countdown_display').removeAttr('class').text(' ' + mode + ' ');

		// 				if (mode == '加待') {
		// 					$base.children('SPAN').first().addClass('ime_coord imc_coord').attr({
		// 						x: x,
		// 						y: y,
		// 						c: c
		// 					});
		// 				}
		// 			} else if (type == '部隊' && location.pathname != '/map.php') {
		// 				$div.attr('ano', ano).addClass('imc_unit');
		// 				if (endtime <= date) {
		// 					$div.find('.imc_countdown_display').removeAttr('class').text('--:--:--');
		// 					endtime = date + 7;
		// 					finishevent = 'actionrefresh';
		// 				} else {
		// 					finishevent = 'actionfinish';
		// 				}
		// 				message = '・[' + label + ']部隊';
		// 			} else if (type == '部隊') {
		// 				$div.attr('ano', ano).addClass('imc_unit');
		// 				if (endtime <= date) {
		// 					$div.find('.imc_countdown_display').removeAttr('class').text('--:--:--');
		// 				}
		// 			} else if (type == '建設') {
		// 				finishevent = 'buildfinish';
		// 				message = '・' + key;
		// 			} else if (type == '削除') {
		// 				$div.addClass('imc_break');
		// 				finishevent = 'breakfinish';
		// 				message = '・' + key;
		// 			} else if (type == '訓練') {
		// 				finishevent = 'trainingfinish';
		// 				message = '・' + key;
		// 			}

		// 			$div.data({
		// 				endtime: endtime,
		// 				alert: 60,
		// 				finishevent: finishevent,
		// 				message: message
		// 			});
		// 			$base.append($div);
		// 		}
		// 	});
		// },

		// //. load
		// load: function(type) {
		// 	if (type == '部隊') {
		// 		return SideBar.loadUnit();
		// 	} else if (type == '敵襲') {
		// 		return SideBar.loadEnemy();
		// 	}

		// 	return SideBar.loadFacility(type);
		// },

		// //. loadUnit
		// loadUnit: function() {
		// 	var list = MetaStorage('UNIT_STATUS').get('部隊') || [],
		// 		result = {};

		// 	for (var i = 0, len = list.length; i < len; i++) {
		// 		let base = list[i],
		// 			basename = (base.mode == '加待') ? base.target : (base.base) ? base.base : '加勢専用';

		// 		if (!result[basename]) {
		// 			result[basename] = [];
		// 		}
		// 		result[basename].push([base.arrival, base.name, base.mode, i, base.ex, base.ey, base.ec]);
		// 	}

		// 	return result;
		// },

		// //. loadEnemy
		// loadEnemy: function() {
		// 	var list = MetaStorage('UNIT_STATUS').get('敵襲') || [],
		// 		now = Util.getServerTime(),
		// 		result = {};

		// 	//着弾時間が過去のものを除く
		// 	list = list.filter(function(value) {
		// 		return !(value.arrival < now);
		// 	});

		// 	for (var i = 0, len = list.length; i < len; i++) {
		// 		let base = list[i],
		// 			village;

		// 		if (base.type == '領地') {
		// 			continue;
		// 		}

		// 		village = Util.getVillageByCoord(base.ex, base.ey, base.ec);
		// 		if (!village) {
		// 			continue;
		// 		}

		// 		if (!result[village.name]) {
		// 			result[village.name] = [];
		// 		}
		// 		result[village.name].push([base.arrival, '■ 敵 襲 ■']);
		// 	}

		// 	return result;
		// },

		// //. loadFacility
		// loadFacility: function(type) {
		// 	var date = Util.getServerTime(),
		// 		data = MetaStorage('COUNTDOWN').get(type) || {},
		// 		baselist = BaseList.home_away(),
		// 		newdata = {},
		// 		result = {};

		// 	if (baselist.length == 0) {
		// 		return result;
		// 	}

		// 	//日時が現在時刻より過去の場合は削除する
		// 	$.each(baselist, function() {
		// 		var id = this.id;

		// 		if (!data[id]) {
		// 			return;
		// 		}

		// 		var newlist = [];
		// 		data[id].forEach(function(v) {
		// 			if (v[0] <= date) {
		// 				return;
		// 			}
		// 			newlist.push(v);
		// 		});

		// 		if (newlist.length > 0) {
		// 			newdata[id] = newlist;
		// 			result[this.name] = newlist;
		// 		}
		// 	});

		// 	MetaStorage('COUNTDOWN').set(type, newdata);

		// 	return result;
		// },

		// //. contextmenu
		// contextmenu: function() {
		// 	var $this = $(this),
		// 		name = $this.children('SPAN, A').text(),
		// 		other = $this.closest('.imc_other').length,
		// 		$units = $this.find('.imc_unit'),
		// 		menu = {},
		// 		village;

		// 	if (other) {
		// 		menu[name] = $.contextMenu.title;

		// 		var $coord = $this.find('.ime_coord');
		// 		if ($coord.length) {
		// 			var x = $coord.attr('x'),
		// 				y = $coord.attr('y'),
		// 				c = $coord.attr('c');

		// 			menu['地図表示'] = function() {
		// 				Map.move(x, y, c);
		// 			};
		// 			menu['合戦報告書【座標】'] = function() {
		// 				var search = 'm=&s=1&name=lord&word=&coord=map&x=' + x + '&y=' + y;
		// 				location.href = '/war/list.php?' + search;
		// 			};
		// 		}

		// 		if ($coord.length && $units.length) {
		// 			menu['セパレーター１'] = $.contextMenu.separator;
		// 		}

		// 		$units.each(function() {
		// 			var $this = $(this),
		// 				ano = $this.attr('ano'),
		// 				name = $this.find('SPAN').first().text();

		// 			if (location.pathname != '/card/deck.php') {
		// 				menu['[' + name + ']部隊'] = function() {
		// 					Deck.dialog(village, null, null, null, ano);
		// 				};
		// 			} else {
		// 				menu['[' + name + ']部隊'] = $.contextMenu.nothing;
		// 			}
		// 		});

		// 		return menu;
		// 	}

		// 	village = Util.getVillageByName(name);

		// 	if (village.fall) {
		// 		name = '【陥落】' + name;
		// 	}
		// 	menu[name] = $.contextMenu.title;

		// 	menu['地図表示'] = function() {
		// 		location.href = Util.getVillageChangeUrl(village.id, '/map.php');
		// 	};
		// 	if (village.type == '本領' || village.type == '所領') {
		// 		menu['内政実行'] = function() {
		// 			location.href = Util.getVillageChangeUrl(village.id, '/village.php');
		// 		};
		// 	} else {
		// 		var href = '/land.php?x=' + village.x + '&y=' + village.y + '&c=' + village.country;
		// 		menu['内政実行'] = function() {
		// 			location.href = Util.getVillageChangeUrl(village.id, href);
		// 		};
		// 	}
		// 	if (village.type == '本領' || village.type == '所領') {
		// 		menu['秘境探索'] = function() {
		// 			location.href = Util.getVillageChangeUrl(village.id, '/facility/dungeon.php');
		// 		};
		// 	}

		// 	menu['セパレーター１'] = $.contextMenu.separator;

		// 	if (location.pathname != '/card/deck.php') {
		// 		// 精鋭部隊取得
		// 		var elites = Elite.list();

		// 		menu['部隊作成'] = {
		// 			'【第一組】': function() {
		// 				Deck.dialog(village, null, 1);
		// 			},
		// 			'【第二組】': function() {
		// 				Deck.dialog(village, null, 2);
		// 			},
		// 			'【第三組】': function() {
		// 				Deck.dialog(village, null, 3);
		// 			},
		// 			'【第四組】': function() {
		// 				Deck.dialog(village, null, 4);
		// 			},
		// 			'【未設定】': function() {
		// 				Deck.dialog(village, null, 5);
		// 			},
		// 			'セパレーター': $.contextMenu.separator,
		// 			'【全武将】': function() {
		// 				Deck.dialog(village, null, 0);
		// 			}
		// 		};
		// 		menu['精鋭部隊'] = {};
		// 		// 精鋭部隊追加
		// 		for (let i = 0; i < elites.length; i++) {
		// 			let key = '【' + elites[i] + '】部隊',
		// 				val = i + 1;
		// 			menu['精鋭部隊'][key] = function() {
		// 				Elite.post(val, village.id);
		// 			};
		// 		}
		// 	} else {
		// 		menu['部隊作成【使用不可】'] = $.contextMenu.nothing;
		// 		menu['精鋭部隊【使用不可】'] = $.contextMenu.nothing;
		// 	}

		// 	if ($units.has('.imc_wait').length > 0) {
		// 		menu['拠点部隊解散'] = function() {
		// 			if (!window.confirm('この拠点の部隊を解散させます。\nよろしいですか？')) {
		// 				return;
		// 			}

		// 			Deck.breakUpAll(village.name)
		// 				.always(function(ol) {
		// 					Util.getUnitStatus();
		// 					if (ol && ol.close) {
		// 						ol.close();
		// 					}
		// 					if (location.pathname == '/facility/unit_status.php' ||
		// 						location.pathname == '/card/deck.php') {
		// 						location.reload();
		// 					}
		// 				});
		// 		};
		// 	} else {
		// 		menu['拠点部隊解散'] = $.contextMenu.nothing;
		// 	}

		// 	if ($units.length) {
		// 		menu['セパレーター２'] = $.contextMenu.separator;
		// 	}

		// 	$units.each(function() {
		// 		var $this = $(this),
		// 			ano = $this.attr('ano'),
		// 			name = $this.find('SPAN').first().text();

		// 		if (location.pathname != '/card/deck.php') {
		// 			menu['[' + name + ']部隊'] = {
		// 				'部隊編成': function() {
		// 					Deck.dialog(village, null, null, null, ano);
		// 				},
		// 				'セパレーター': $.contextMenu.separator,
		// 				'部隊解散': function() {
		// 					if (!window.confirm('[' + name + ']部隊を解散させます。\nよろしいですか？')) {
		// 						return;
		// 					}

		// 					Deck.breakUp(ano, name)
		// 						.always(function(ol) {
		// 							Util.getUnitStatus();
		// 							if (ol && ol.close) {
		// 								ol.close();
		// 							}
		// 						});
		// 				}
		// 			}
		// 		} else {
		// 			menu['[' + name + ']部隊'] = $.contextMenu.nothing;
		// 		}
		// 	});

		// 	menu['セパレーター３'] = $.contextMenu.separator;
		// 	menu['拠点名変更'] = function() {
		// 		Display.dialogRename(village);
		// 	};

		// 	return menu;
		// }
	};

	//■ StatusBar
	var StatusBar = {
		//. init
		init: function() {
			// $('#sidebar .basename')
			// // .eq(0).addClass('imc_basename imc_home').end()
			// // .eq(1).addClass('imc_basename imc_away').end()
			// .addClass('imc_basename')
			// .parent().attr('id', 'imi_basename');
		},
	}
	//■ /card/deck  .. デッキ画面
	Page.registerAction('card', 'deck', {
		style: '' + 

		'DIV.cardStatusDetail { width: 228px; height: 204px; padding: 3px 3px 0px 3px; display: inline; float: left; margin: 0px 0px 8px 3px; border: solid 1px #666; !important }' +
		'.cardStatusDetail.imc_selected { height: 203px; padding: 2px 2px 0px 2px; }' +
		
		// カードヘッダ(名前|コスト|兵科|レベル)
		'.imc_deck_smallcard_title { height: 17px; margin-bottom: 3px; }' +
		'SPAN.imc_cardname { display: block; float: left; line-height: 17px; }' +
		'.imc_country_Shoku { color: #090 }' +
		'.imc_country_Gi    { color: #009 }' +
		'.imc_country_Go    { color: #900 }' +
		'.imc_country_Hoka  { color: #666 }' +
		'.imc_country_Ha    { color: #990 }' +
		'SPAN.imc_card_header { float: right; line-height: 17px; margin-right: 5px; }' +
		'.imc_card_header SPAN { font-size: 10px; letter-spacing: -1px; line-height: 17px; }' +
		'.imc_card_header .imc_lv { margin-top: -1px; font-size: 12px; font-weight: bold; letter-spacing: 0px; }' +
		'.imc_card_header .imc_lvMax { color: #f36; }' +

		// イラスト
		'.imc_statusDetail_Left { float: left; height: 146px; position: relative; text-align: center; width: 85px; }' +
		'.imc_statusDetail .illustMini IMG { top:0; left: 0; position: absolute; }' +
		'.imc_statusDetail .set { top: 123px; position: absolute; }' +
		'.imc_statusDetail .levelup { height: 38px; left: 10px; position: absolute; top: 75px; width: 73px; }' +

		// ステータス
		// 'div.cardStatusDetail div.imc_statusDetail .imc_statusDetail_Right table, ' +
		// 'div.card-status-detail-label div.imc_statusDetail .imc_statusDetail_Right table ' +
		// '{ border: 0 none; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 143px; }' +

		// 'div.cardStatusDetail div.imc_statusDetail .imc_statusDetail_Right table.statusParameter1 th, ' +
		// 'div.card-status-detail-label div.imc_statusDetail .imc_statusDetail_Right table.statusParameter1 th { background: none repeat scroll 0 0 #FDFFCE; }' +

		// 'div.cardStatusDetail div.imc_statusDetail .imc_statusDetail_Right table th, '+
		// 'div.cardStatusDetail div.imc_statusDetail .imc_statusDetail_Right table td, '+
		// 'div.card-status-detail-label div.imc_statusDetail .imc_statusDetail_Right table th, ' +
		// 'div.card-status-detail-label div.imc_statusDetail .imc_statusDetail_Right table td { border-top: 1px dotted #CCCCCC; color: #000000; font-size: 10px; line-height: 11px; padding: 0 1px; white-space: nowrap;} ' +
		// 'div.cardStatusDetail div.imc_statusDetail .imc_statusDetail_Right table.statusParameter2 th, ' +
		// 'div.card-status-detail-label div.imc_statusDetail .imc_statusDetail_Right table.statusParameter2 th { background: none repeat scroll 0 0 #EAEAEA; }' +

		'DIV.cardStatusDetail DIV.imc_statusDetail DIV.imc_statusDetail_Right { float: right; width: 137px; margin: 0 3px 3px; !important;}' +
		// 'DIV.cardStatusDetail DIV.imc_statusDetail DIV.imc_statusDetail_Right TABLE { border: 1px dotted #fff; border-collapse: separate; border-spacing: 0; font-size: 9px; margin: 0 0 4px; padding: 0; width: 100%; !important; }' +
		'DIV.cardStatusDetail DIV.imc_statusDetail DIV.imc_statusDetail_Right TABLE { border: 1px dotted #000;  border-collapse: collapse; border-spacing: 0; font-size: 9px; margin-bottom: 4px; !important; }' +
		'DIV.imc_statusDetail DIV.imc_statusDetail_Right TABLE.imc_card_param { width: 100%; !important; }' +
		'.imc_card_param TH { text-align: left; background-color: #FDFFCE; }' +
		'DIV.imc_statusDetail DIV.imc_statusDetail_Right TABLE.imc_card_skill { width: 100%; !important; }' +
		'.imc_card_skill TH { text-align: left; background-color: #EAEAEA; }' +
		'.imc_statusDetail_Right TD { border-top: 1px dotted #CCC; text-align: right; padding: 0 1px; line-height: 10px; }' +

		// // '.cardStatusDetail { width: 229px; height: 216px; padding: 5px 5px 0px 8px; border: solid 1px #666; background: -moz-linear-gradient(top left, #444, #000); }' +
		// '.cardStatusDetail { font-size: 12px; width: 229px; }' + //height: 216px; padding: 5px 5px 0px 8px; border: solid 1px #666; }' +
		// '.cardStatusDetail.imc_selected { height: 215px; padding: 4px 4px 0px 7px; }' +
		// // '.cardStatusDetail.imc_selected { border: solid 2px #f80 !important; }' +
		// // '.cardStatusDetail { height: 180px; }' +
		// // '.cardStatusDetail .otherDetail { display: none; }' +
		// '.ig_deck_smallcardimage { float: left; padding-right: 2px; width: 85px; }' +
		// '.ig_deck_smallcardbox { height: 120px; position: relative; width: 85px; }' +
		// // '.ig_deck_smallcardimage { float: left; padding-right: 2px; width: 116px; }' +
		// // '.ig_deck_smallcardbox { height: 160px; position: relative; width: 116px; }' +
		// '.ig_deck_smallcarddataarea { float: right; margin-right: 4px; width: 126px; }' +
		// // '.ig_deck_smallcarddata { border-collapse: separate; border-left: 1px dotted #FFFFFF; border-spacing: 0; border-top: 1px dotted #FFFFFF; font-size: 10px; margin: 0 0 4px; padding: 0; width: 100%; }' +
		// '.ig_deck_smallcarddata { border-collapse: separate; border-left: 1px dotted #000; border-spacing: 0; border-top: 1px dotted #000; font-size: 10px; margin: 0 0 4px; padding: 0; width: 100%; max-width: 126px; }' +
		// '.smallcard_chara { left: 0; position: absolute; top: 0; }' +
		// // '.ig_deck_smallcarddata TH { border-bottom: 1px dotted #FFFFFF; border-right: 1px dotted #FFFFFF; color: #FFFF00; font-size: 10px; line-height: 1 !important; padding: 2px; }' +
		// // '.ig_deck_smallcarddata TD { border-bottom: 1px dotted #FFFFFF; border-right: 1px dotted #FFFFFF; color: #FFFFFF; font-size: 10px; line-height: 1 !important; padding: 2px; }' +
		// '.ig_deck_smallcarddata TH { border-bottom: 1px dotted #000; border-right: 1px dotted #000; color: #F0F; font-size: 10px; line-height: 1 !important; padding: 2px; }' +
		// '.ig_deck_smallcarddata TD { text-align: right; border-bottom: 1px dotted #000; border-right: 1px dotted #000; font-size: 10px; line-height: 1 !important; padding: 2px; }' +
		// // '.imc_card_skill .used { background: none repeat scroll 0 0 rgba(226,226,226,0.66); color: #999; }' +
		'.imc_card_skill .used { background-color: #E2E2E2; color: #999; }' +
		// // '.imc_card_skill .passive { background: none repeat scroll 0 0 rgba(255,255,255,0.66); color: #C00; }' +
		'.imc_card_skill .passive { color: #C00; }' +
		// '.imc_card_skill TD { font-size: 8px; }' +

		// /* デッキ用 */
		// '#ig_deckcost { top: 8px; left: 160px; }' +
		// '#ig_keikenup { top: 8px; left: 500px }' +
		// '#ig_deckheadmenubox { height: 80px; }' +
		// '#ig_bg_decksection1right { min-height: 400px; }' +
		// '#deck_skill_display { top: 188px; }' +
		// 'DIV.deck_select_lead { display: none; }' +

		// /* ユニットデータ表示用 */
		// '.imc_deck_unitdata { width: 114px; height: 18px; line-height: 18px; font-size: 13px; font-weight: bold; color: #300; padding-left: 95px; padding-bottom: 3px; border-bottom: dotted 1px #666; display: inline-block; }' +
		// '.imc_deck_unitdata_speed { width: 40px; height: 18px; line-height: 18px; font-size: 13px; font-weight: bold; color: #300; padding-left: 55px; padding-bottom: 3px; display: inline-block; }' +
		// '.ig_deck_unitdata_allcost { width: 40px; display: inline-block; }' +

		// /* 全部隊解散ボタン用 */
		// '#imi_unregist_all { cursor: pointer; }' +

		// /* 小カード用 */
		// '.ranklvup_m { top: -75px; width: 0px; }' +
		// '.ig_deck_smallcardimage .ranklvup_m .rankup_btn { width: 0px; }' +
		// '.ig_deck_smallcardimage .ranklvup_m .rankup_btn A { width: 40px; background-position: -75px 0px; }' +
		// '.ig_deck_smallcardimage .ranklvup_m .rankup_btn A:hover { width: 105px; background-position: -10px -25px; }' +
		// '.ig_deck_smallcardimage .ranklvup_m .levelup_btn { width: 0px; }' +
		// '.ig_deck_smallcardimage .ranklvup_m .levelup_btn A { width: 40px; background-position: -75px 0px; }' +
		// '.ig_deck_smallcardimage .ranklvup_m .levelup_btn A:hover { width: 105px; background-position: -10px -25px; }' +
		// '.imc_card_skill { position: relative; background-color:rgba(255,255,255,0.66); top: 68px; z-index: 4; }' +
		// // '.imc_card_skill { position: relative; top: 116px; background-color: #333; z-index: 4; }' +
		// // '.imc_card_skill { z-index: 4; }' +
		// '.imc_card_skill TABLE { margin-bottom: 0px; }' +
		// '.imc_card_skill TH { width: 20px; }' +
		// '.imc_card_status TH { width: 45px; }' +
		// '.imc_card_status .imc_solmax { background-color: #642; }' +
		// '.imc_card_status .imc_emphasis { background-color: #886; }' +
		// '.imc_card_status .imc_power { background-color: #246; }' +
		// '.imc_card_status .imc_power TD { text-align: right; padding-right: 5px; }' +
		/* HP・討伐ゲージ用バー */
		'.imc_bar_title { font-size: 9px; }' +
		'.imc_bar_battle_gage { width: 135px; height: 4px; border: solid 1px #c90; border-radius: 2px; background: -moz-linear-gradient(left, #cc0, #c60); margin-bottom: 1px; }' +
		'.imc_bar_hp          { width: 135px; height: 4px; border: solid 1px #696; border-radius: 2px; background: -moz-linear-gradient(left, #a60, #3a0); }' +
		'.imc_bar_inner { background-color: #000; float: right; height: 100%; display: inline-block; }' +
		// '.imc_recovery_time { width: 110px; height: 29px; line-height: 29px; text-align: center; float: right; }' +
		// // '#file-1 .ig_deck_smallcardarea { width: 219px; height: 216px; padding: 5px 5px 0px 8px; border: solid 1px #666; background: -moz-linear-gradient(top left, #444, #000); }' +
		// // '#file-1 .ig_deck_smallcardarea { width: 219px; height: 216px; padding: 5px 5px 0px 8px; display: inline; float: left; margin-bottom: 8px; margin-left: 6px; border: solid 1px #666; background: -moz-linear-gradient(top left, #444, #000); }' +
		// '#file-1 .ig_deck_smallcardarea { width: 217px; height: 216px; padding: 5px 5px 0px 8px; display: inline; float: left; margin-bottom: 8px; margin-left: 6px; border: solid 1px #666; }' +
		// '#file-1 .ig_deck_smallcardarea.imc_selected { height: 215px; padding: 4px 4px 0px 7px; }' +
		// '#file-1 .ig_deck_smallcardarea.imc_unit { border: solid 2px #999 !important; height: 215px; padding: 4px 4px 0px 7px; }' +
		// '#file-1 .ig_deck_smallcarddelete { display: none; }' +
		// '#file-1 .battlegage2 { display: none; }' +
		// // '#ig_deck_smallcardarea_out .ig_deck_smallcardarea { width: 229px; height: 216px; padding: 5px 5px 0px 8px; border: solid 1px #666; background: -moz-linear-gradient(top left, #444, #000); }' +
		// // '#ig_deck_smallcardarea_out .ig_deck_smallcardarea.imc_selected { height: 215px; padding: 4px 4px 0px 7px; }' +
		// // '#ig_deck_smallcardarea_out .ig_deck_smallcardarea.imc_unit { border: solid 2px #999 !important; height: 215px; padding: 4px 4px 0px 7px; }' +
		// // '#ig_deck_smallcardarea_out .ig_deck_smallcarddelete { display: none; }' +
		// // '#ig_deck_smallcardarea_out .battlegage2 { display: none; }' +
		/* カード選択時の枠色 */
		// '.imc_deck_mode .imc_selected { border: solid 2px #f80 !important; background: -moz-linear-gradient(top left, #654, #000) !important; }' +
		// '.imc_selected { border: solid 2px #f80 !important; }' +
		'.imc_selected { border: solid 2px #f80 !important; display: inline-block; position: relative; }' +
		'.imc_selected:after { content: ""; display: block; position: absolute; top: 0; left:0; width: 100%; height: 100%; background-color: #f80; opacity: 0.3; }' +
		// '.imc_union_mode .imc_selected { border: solid 2px #09c !important; background: -moz-linear-gradient(top left, #456, #000) !important; }' +
		// '.imc_union_keep_mode .imc_selected { border: solid 2px #4f0 !important; background: -moz-linear-gradient(top left, #456, #000) !important; }' +

		/* 下部表示欄 */
		// '.imc_contents { position: relative; width: 916px; padding: 0px 14px 0px 14px; margin: 7px auto; }' +
		// '.imc_contents { position: relative; width: 100%; padding: 0px 14px 0px 14px; margin: 7px auto; }' +
		'.imc_contents { position: relative; padding: 0px 14px 0px 14px; margin: 7px auto; }' +

		'#imi_card_assign { float: left; font-size: 24px; height: auto; text-align: center; margin: 0 8px 7px 0; border: solid 1px #666; padding: 0px 8px; color: #666; background-color: #000; cursor: pointer; }' +
		'#imi_card_assign:hover { background-color: #666; border-color: #fff; color: #fff; }' +
		'#imi_card_unset  { float: left; font-size: 24px; height: auto; text-align: center; margin: 0 8px 7px 0; padding: 0px 8px; border: solid 1px #666; color: #666; background-color: #000; cursor: pointer; }' +
		'#imi_card_unset:hover { background-color: #666; border-color: #fff; color: #fff; }' +
		// '#imi_village_info { float: right; margin-right: 16px; }' +
		// '#imi_village_info .deck_wide_select { padding-bottom: 0px; }' +

		// '#imi_deck_info { height: 20px; }' +
		// '#imi_deck_info LI { float: left; min-width: 60px; height: 20px; line-height: 20px; padding: 0px 6px; margin-right: 8px; background-color: #f1f0dc; border: solid 1px #f1f0dc; }' +
		// '#imi_deck_info .imc_info1 { width: 30px; text-align: right; font-weight: bold; display: inline-block; margin-right: 5px; }' +
		// '#imi_deck_info .imc_info1_free { width: 25px; text-align: right; display: inline-block; }' +
		// '#imi_deck_info .imc_info2 { width: 12px; text-align: right; font-weight: bold; display: inline-block; margin-right: 5px; }' +
		// '#imi_deck_info .imc_info2_free { width: 12px; text-align: right; display: inline-block; }' +
		// '#imi_deck_info .imc_info3,' +
		// '#imi_deck_info .imc_info4 { width: 45px; text-align: right; display: inline-block; }' +
		// '#imi_deck_info .imc_info5 { width: 30px; text-align: right; display: inline-block; }' +

		// '#imi_deck_info #imi_mode { width: 75px; text-align: center; font-weight: bold; background-color: #000; cursor: pointer; }' +
		// '#imi_deck_info #imi_mode.imc_deck_mode { border: solid 1px #f80; }' +
		// '#imi_deck_info #imi_mode.imc_deck_mode:after { content: "デッキモード"; color: #f80; }' +
		// '#imi_deck_info #imi_mode.imc_union_mode { border: solid 1px #09c; }' +
		// '#imi_deck_info #imi_mode.imc_union_mode:after { content: "合成モード"; color: #09c; }' +
		// '#imi_deck_info #imi_mode.imc_union_keep_mode { border: solid 1px #4f0; }' +
		// '#imi_deck_info #imi_mode.imc_union_keep_mode:after { content: "連続強化"; color: #4f0; }' +
		// '#imi_deck_info #imi_mode:hover { color: #fff; border-color: #fff; background-color: #666; }' +

		// '#imi_new_deck { float: right; margin-right: 16px; }' +
		// '#imi_new_deck LI { float: right; min-width: 44px; height: 20px; line-height: 20px; text-align: center; padding: 0px 8px; border: solid 1px #666; color: #666; background-color: #000; margin-left: 8px; cursor: pointer; }' +
		// '#imi_new_deck LI:hover { background-color: #666; border-color: #fff; color: #fff; }' +
		// '#imi_card_unset { background-image: url(' + Env.externalFilePath + '/img/card/common/btn_return.gif)}' +
		// '#imi_open.imc_is_open:after { content: "閉じる" }' +
		// '#imi_open.imc_is_close:after { content: "開く" }' +

		// /* デッキモード */
		// '#imi_card_container { display: none; position: relative; width: 998px; height: 200px; margin: 0px auto 5px auto; padding: 5px 0px; background-color: #000; border: solid 1px #970; overflow: hidden; }' +
		// '#imi_card_container .ig_deck_smallcardarea { width: 229px; height: 190px; margin-left: 5px; border: solid 1px #666; padding: 6px 4px 1px 8px; background: -moz-linear-gradient(top left, #444, #000); }' +
		// '#imi_card_container .ig_deck_smallcardarea.imc_unit { border: solid 2px #999; padding: 5px 3px 0px 7px; }' +
		// /* 合成モード */
		// '#imi_card_container1 { display: none; position: relative; width: 1000px; height: auto; margin: 0px auto 3px auto; background-color: #000; overflow: hidden; }' +
		// '#imi_card_container2 { display: inline-block; width: 254px; height: 200px; padding: 5px 0px; background-color: #000; border: solid 1px #970; overflow: hidden; }' +
		// '#imi_card_container2 .ig_deck_smallcardarea { height: 190px; border-bottom: solid 1px #666; }' +
		// '#imi_card_container3 { display: inline-block; width: 722px; height: 200px; margin-left: 16px; padding: 5px 0px; background-color: #000; border: solid 1px #970; overflow: hidden; }' +
		// '#imi_card_container3 .ig_deck_smallcardarea { height: 190px; width: 121px; border: solid 1px #666; background-position: -1px -1px; }' +
		// '#imi_card_container2:after { content: "　素材カード"; color: #999; font-size: 18px; line-height: 200px; }' +
		// '#imi_card_container3:after { content: "　追加素材カード"; color: #999; font-size: 18px; line-height: 200px; }' +

		// '.imc_command_selecter LI .imc_pulldown { position: absolute; margin: 0px -1px; padding: 2px; background-color: #000; border: solid 1px #fff; z-index: 2000; text-align: left; display: none; }' +
		// '.imc_command_selecter LI:hover .imc_pulldown { display: block; }' +
		// '.imc_command_selecter LI A.imc_pulldown_item { padding: 3px 0px; text-indent: 0px; width: 65px !important; height: 20px; line-height: 20px; text-align: center; color: #fff; background: #000 none; display: inline-block; }' +
		// '.imc_command_selecter LI A:hover { color: #fff; background-color: #666; }' +

		// /* ソート条件選択用 */
		// '#selectarea SELECT { margin-right: 8px; }' +
		// '#imi_order_open { color: #fff; padding: 3px 2px 2px 3px; border: solid 1px #666; border-radius: 3px; cursor: pointer; }' +
		// '#imi_order_open:hover { background-color: #09f; border-color: #069; }' +
		// '#imi_order_open.imc_is_open:after { content: "▲" }' +
		// '#imi_order_open.imc_is_close:after { content: "▼" }' +
		// '#imi_cardorder_list { position: relative; clear: both; left: 10px; padding: 10px; width: 727px; min-height: 35px; background-color: #F3F2DE; border-radius: 0px 0px 5px 5px; box-shadow: 5px 5px 5px rgba(0,0,0,0.8); z-index: 10; }' +
		// '#imi_cardorder_list LI { padding: 3px 5px; border-bottom: solid 1px #cc9; font-size: 12px; letter-spacing: 2px; }' +
		// '#imi_cardorder_list INPUT { width: 400px; }' +
		// '#imi_cardorder_list .imc_order_title { display: inline-block; margin-bottom: -2px; padding-top: 1px; width: 530px; text-align: left; cursor: default; white-space: nowrap; overflow: hidden; }' +
		// '#imi_cardorder_list .imc_command { display: inline-block; width: 186px; text-align: right; }' +
		// '#imi_cardorder_list .imc_command SPAN { margin: 0px 2px; padding: 2px 4px; border-radius: 5px; cursor: pointer; }' +
		// '#imi_cardorder_list .imc_command SPAN:hover { color: #fff; background-color: #09f; }' +
		'',

		main: function() {
			// // エラーが出るので塞いでおく
			// $('SELECT[id^=selected_village_]').each( function() {
			// 	var onchange = $(this).attr('onchange');
			// 	var modify = onchange.replace(/selected_village_back_(\d+)/, function( str, m ) {
			// 		// prototype.jsなのでid検索はそのまま
			// 		return 'selected_village_' + m;
			// 	});
			// 	$(this).attr('onchange', modify );
			// });

			this.autoPager();
			this.layouter();
			this.deckSelecter();
			// this.villageSelecter();
			// this.cardOrderSelecter();

			// $('#ig_deck_smallcardarea_out, #imi_mode').addClass('imc_deck_mode');
			
			// var cardList = [];
			// $('.cardColmn').each(function() {
			// 	cardList.push(new Card($(this)));
			// });

			// var $card_list = $('.cardStatusDetail')
			// .on('click', function() {
			// 	$(this).addClass('imc_selected');
			// });
			// .contextMenu( Deck.contextmenu, true );

			var $deck_list = $('.cardColmn');
			UnitCard.setup( $deck_list );

			// var $card_list = $('.cardStatusDetail')
			// .on('click', function() {
			// 	if( $(this).hasClass('imc_selected') ) {
			// 		$(this).removeClass('imc_selected');
			// 	}
			// 	else {
			// 		$(this).addClass('imc_selected');
			// 	}
			// });
			// var $card_list = $('.cardStatusDetail')
			// .on('click', Deck.addCard )
			// .contextMenu( Deck.contextmenu, true );
			var $card_list = $('.cardStatusDetail');
			$('#deck_file')
			.on('click', '.cardStatusDetail', function( eo ) {
				// 拠点選択はイベント対象外とする
				if( $(eo.target).is('SELECT,OPTION') ) return false;

				if( $(this).hasClass('imc_selected') ) {
					$(this).removeClass('imc_selected');
				}
				else {
					$(this).addClass('imc_selected');
				}
			});

			SmallCard.setup( $card_list );
			// Deck.updateDeckInfo();
			this.villageSelecter( $card_list );


		// //	$card_list.remove();
		// 	SmallCard.setup( $card_list );
		// 	Deck.updateDeckInfo();
		// //	Deck.update();

		// 	$.each( Soldier.typeKeys, function( type ) {
		// 		var $input = $( '#pool_unit_cnt_' + type );
		// 		if ( $input.length == 1 ) { pool[ type ] = $input.val().toInt(); }
		// 	});
		// 	Deck.poolSoldiers = { pool: pool };

		// 	var unit_num = 5 - unit_list.filter('.unset').length,
		// 		cache_num = MetaStorage('UNIT_STATUS').get('部隊').length;

		// 	if ( unit_num != cache_num ) {
		// 		Util.getUnitStatusCD();
		// 	}
		},

		//. autoPager
		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager:last'),
						// source = $pager.find('LI > :not("A"):last').parent().next('LI:has("A")').find('A').attr('href') || '',
						source = $pager.find('.last > A:first').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1].toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					return Page.get('/card/deck.php', {
						p: nextPage,
						l: $('#l').val(),
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.cardStatusDetail');

					SmallCard.setup( $card_list );
					self.villageSelecter( $card_list );
					$card_list.insertAfter('.cardStatusDetail:last');
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		//. layouter
		layouter: function() {
			var html;

			$('img[title="デッキ"]')
			.on('click', function() {
				$('#cardListDeck').toggle();
			});

			$( '<input type=button id=unset value="全て">')
			.appendTo('div#card_uraomote ul.tab')
			.on('click', function() {
				if ( !confirm('全てのカードをファイルに戻しますか') ) return;

				$(this).val('処理中');
				var dfd = [];
				$('#cardListDeck .control').each(function() {
					if (!/operationExecution[\D]*[0-9]*?[\D]*unset/.test($(this).html())) return true;

					var cid = $(this).html().match(/operationExecution[\D]*([0-9]*?)[\D]*unset/)[1];
					var postData = {
						mode: 'unset',
						target_card: cid,
						wild_card_flg: '',
						inc_point: '',
						btn_change_flg: '',
						l: '',
						ssid: Env.ssid,
					};

					dfd.push( $.post('/card/deck.php', postData) );
				});

				$.when.apply( $, dfd )
				.done(function( data ) {
					$(this).val('完了');
					setTimeout(function() {
						location.reload();
					}, 1000);
				});
			});

			$('<input type=button id=unset300 value="討伐300未満">')
			.appendTo('div#card_uraomote ul.tab')
			.on('click', function() {
				if ( !confirm('討伐300未満のカードをファイルに戻しますか') ) return;

				$(this).val('処理中');
				var dfd = [];
				$('#cardListDeck .control').each(function() {
					if (!/operationExecution[\D]*[0-9]*?[\D]*unset/.test($(this).html())) return true;
					if ($(this).find('.gageIn img').attr('alt') >= 300) return true;

					var cid = $(this).html().match(/operationExecution[\D]*([0-9]*?)[\D]*unset/)[1];
					var postData = {
						mode: 'unset',
						target_card: cid,
						wild_card_flg: '',
						inc_point: '',
						btn_change_flg: '',
						l: '',
						ssid: Env.ssid,
					};

					dfd.push( $.post('/card/deck.php', postData) );
				});

				$.when.apply( $, dfd )
				.done(function( data ) {
					$(this).val('完了');
					setTimeout(function() {
						location.reload();
					}, 1000);
				});
			});

			$('<input type=button id=unset82 value="HP82以上">')
			.appendTo('div#card_uraomote ul.tab')
			.on('click', function() {
				if ( !confirm('HP82以上のカードをファイルに戻しますか') ) return;

				$(this).val('処理中');
				var dfd = [];
				$('#cardListDeck .cardColmn').each(function() {
					if (!/operationExecution[\D]*[0-9]*?[\D]*unset/.test($(this).html())) return true;
					console.log( $(this).find('.status_hp .value').text() );
					console.log( $(this).find('.status_hp .value').text().match(/(\d+)\/\d+/)[1] );

					if ( $(this).find('.status_hp .value').text().match(/(\d+)\/\d+/)[1].toInt() < 82 ) return true;

					var cid = $(this).html().match(/operationExecution[\D]*([0-9]*?)[\D]*unset/)[1];
					var postData = {
						mode: 'unset',
						target_card: cid,
						wild_card_flg: '',
						inc_point: '',
						btn_change_flg: '',
						l: '',
						ssid: Env.ssid,
					};

					dfd.push( $.post('/card/deck.php', postData) );
				});

				$.when.apply( $, dfd )
				.done(function( data ) {
					$(this).val('完了');
					setTimeout(function() {
						location.reload();
					}, 1000);
				});
			});

			// デッキ拡張を非表示
			$('#extendbox').hide();

			//仮想デッキ用
			html = '' +
			'<div id="imi_bottom_container">' +
				'<div class="imc_overlay" />' +
				// '<div class="imc_contents">' +
				// 	'<ul id="imi_village_info" />' +
				// 	'<ul id="imi_deck_info">' +
				// 		'<li>コスト：<span class="imc_info1"></span>/<span class="imc_info1_free"></span></li>' +
				// 		'<li id="imi_mode"></li>' +
				// 	'</ul>' +
				// '</div>' +
				'<div class="imc_contents">' +
					'<li id="imi_card_assign">デッキにセットする</li>' +
					'<li id="imi_card_unset">ファイルに戻す</li>' +
					// '<ul id="imi_new_deck">' +
					// 	'<li id="imi_open" class="imc_is_close"></li>' +
					// 	'<li id="imi_card_assign">選択武将を部隊へ登録</li>' +
					// '</ul>' +
					// '<ul id="imi_command_selecter" class="imc_command_selecter" />' +
				'</div>' +
				// '<div id="imi_card_container" />' +
				// '<div id="imi_card_container1">' +
				// 	'<div id="imi_card_container2" />' +
				// 	'<div id="imi_card_container3" />' +
				// '</div>' +
			'</div>';

			$( html ).appendTo('BODY');

			$('#imi_bottom_container')
			.on( 'click', '#imi_mode', function() {
				console.log( $(this) );
				// var $this = $(this);

				// if ( $this.hasClass('imc_union_mode') ) {
				// 	$('#ig_deck_smallcardarea_out, #imi_mode').removeClass('imc_union_mode').addClass('imc_union_keep_mode');
				// }
				// else if ( $this.hasClass('imc_union_keep_mode') ) {
				// 	$('#ig_deck_smallcardarea_out, #imi_mode').removeClass('imc_union_keep_mode').addClass('imc_deck_mode');
				// }
				// else {
				// 	$('#ig_deck_smallcardarea_out, #imi_mode').removeClass('imc_deck_mode').addClass('imc_union_mode');
				// }

				// self.changeMode( true );
			})
			.on( 'click', '#imi_open', function() {
				var $this = $(this);

				if ( $this.hasClass('imc_is_close') ) {
					$this.removeClass('imc_is_close').addClass('imc_is_open');
				}
				else {
					$this.removeClass('imc_is_open').addClass('imc_is_close');
				}

				// self.changeMode( false );
			})
			.on( 'click', '#imi_card_assign', function() {
				// var village_id = $('#imi_select_village').val() || '';
				// 	brigade = $('#btn_category_elite LI[class$="_on"],#btn_category LI[class$="_on"]').attr('class').match(/0(\d)/)[ 1 ],
				// 	unit = Deck.currentUnit;

				// if ( village_id != '' ) {
				// 	unit.village = Util.getVillageById( village_id );
				// }
				// Deck.currentUnit.assignCard( Deck.newano )
				// .done(function() {
				// 	Page.move( '/card/deck.php?ano=' + Deck.newano + '&select_card_group=' + brigade );
				// });
				// http://s1.3gokushi.jp/card/deck.php
				// ?boost_card_flg=
				// &btn_change_flg=
				// &inc_point=
				// &l=3
				// &mode=set
				// &p=1
				// &selected_village%5B29010%5D=119032
				// &show_deck_card_count=15
				// &ssid=jqaonbk2td4nk5jat3fmtv98d6
				// &target_card=29010
				// &wild_card_flg=
				// var vid = $('#imi_select_village').val();
				var tasks = [];
				$('.imc_selected').each( function() {
					var cid = $(this).find('[id^=cardWindow_]').attr('id').match(/cardWindow_(\d+)/)[1],
						vid = $(this).find('[id^=selected_village]').val();

					var postData = {
						mode: 'set',
						ssid: Env.ssid,
						target_card: cid,
					};
					var s = 'selected_village['+cid+']';
					postData[s] = vid;
					tasks.push( $.post('/card/deck.php', postData ) );
				});

				$.when.apply($, tasks)
				.done( function() {
					location.reload();
				});
			})
			.on( 'update', '#imi_deck_info', function() {
				console.log( $(this) );
				// var unit = Deck.currentUnit,
				// 	speed = unit.speed,
				// 	time = ( speed == 0 ) ? 0 : Math.floor( 3600 / speed ),
				// 	dtitle = '破壊力：' + unit.des.toFormatNumber(),
				// 	stitle = time.toFormatTime() + '／距離';

				// $('.imc_info1').text( unit.cost.toFixed( 1 ) );
				// $('.imc_info1_free').text( Deck.freeCost.toFixed( 1 ) );
				// $('.imc_info2').text( unit.card );
				// $('.imc_info2_free').text( 4 );
				// $('.imc_info3').text( Math.floor( unit.atk ).toFormatNumber() ).parent().attr( 'title', dtitle );
				// $('.imc_info4').text( Math.floor( unit.def ).toFormatNumber() );
				// $('.imc_info5').text( speed.toRound( 1 ) ).parent().attr( 'title', stitle );

				// $('#imi_card_container').empty();
				// for ( var i = 0, len = unit.list.length; i < len; i++ ) {
				// 	$('#imi_card_container').append( unit.list[ i ].element );
				// }
				// for ( var i = 0, len = unit.assignList.length; i < len; i++ ) {
				// 	$('#imi_card_container').append( unit.assignList[ i ].clone() );
				// }
			});

			// フィルタとソート
			// Deck.commandMenu( $('#imi_command_selecter'), true );
		},

		//. deckSelecter
		deckSelecter: function() {
			// $('#ig_unitchoice').find('LI').each(function( idx ) {
			// 	var $this = $(this),
			// 		$a = $this.find('A');

			// 	if ( $this.filter(':contains("[---新規部隊を作成---]")').length == 1 ) {
			// 		$this.addClass('unset');
			// 	}

			// 	if ( $a.length == 0 ) { return; }

			// 	var brigade = $('#btn_category_elite LI[class$="_on"],#btn_category LI[class$="_on"]').attr('class').match(/0(\d)/)[ 1 ];
			// 	$a.attr('href', '/card/deck.php?ano=' + idx + '&select_card_group=' + brigade ).removeAttr('onClick');
			// });
		},

		//. villageSelecter
		villageSelecter: function( $card_list ) {
			var village = Util.getVillageCurrent();
			$card_list.find('[id^=selected_village_]').val( village.id );
			$card_list.find('OPTION[value='+village.id+']').prop('selected', true);
		},

		//. cardOrderSelecter
		// cardOrderSelecter: Page.getAction( 'facility', 'set_unit_list', 'cardOrderSelecter' ),

		//. changeMode
		changeMode: function( release ) {
			// var deck_mode = $('#imi_mode').hasClass('imc_deck_mode'),
			// 	open = $('#imi_open').hasClass('imc_is_open');

			// $('#imi_card_container').hide();
			// $('#imi_card_container1').hide();

			// if ( release ) {
			// 	//選択状態解除
			// 	$('#ig_deck_smallcardarea_out').find('.imc_selected').removeClass('imc_selected imc_added');
			// 	$('#imi_bottom_container').find('.ig_deck_smallcardarea').remove();

			// 	Deck.currentUnit.assignList = [];
			// 	Deck.currentUnit.update();
			// 	Deck.updateDeckInfo();
			// }

			// if ( deck_mode ) {
			// 	$('#imi_village_info').show();
			// 	$('#imi_card_assign').show();

			// 	if ( open ) {
			// 		$('#imi_card_container').show();
			// 	}
			// }
			// else {
			// 	$('#imi_village_info').hide();
			// 	$('#imi_card_assign').hide();

			// 	if ( open ) {
			// 		$('#imi_card_container1').show();
			// 	}
			// }
		},
	});

	//■ /union/index  .. カード合成
	Page.registerAction('union', 'index', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		//. autoPager
		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager:last'),
						source = $pager.find('LI > :not("A"):last').parent().next('LI:has("A")').find('A').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1]; //.toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					return Page.get('/union/index.php', {
						p: nextPage,
						l: $('#l').val(),
						label: $('INPUT[name=label]').val(),
						ssid : $('INPUT[name=ssid]').val(),
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.cardStatusDetail');

					$card_list.insertAfter('.cardStatusDetail:last');

					// self.layouter($card_list);
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		//. layouter
		layouter: function() {
			$('.information').hide();
		},
	});

	//■ /union/learn  .. カード合成 スキル習得
	Page.registerAction('union', 'learn', {
		main: function() {
			this.autoPager();
			this.layouter( $('.cardStatusDetail') );
		},

		//. autoPager
		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager:last'),
						source = $pager.find('LI > :not("A"):last').parent().next('LI:has("A")').find('A').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1].toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					return Page.get('/union/learn.php', {
						cid: $('INPUT[name=base_cid]').val(),
						p: nextPage,
						l: $('#l').val(),
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.cardStatusDetail');

					$card_list.insertAfter('.cardStatusDetail:last');

					self.layouter($card_list);
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		//. layouter
		layouter: function( $list ) {
		},
	});

	//■ /union/add_lv  .. カード合成 スキルレベルアップ
	Page.registerAction('union', 'add_lv', {
		style: '' +
		// '.useUnion { background: url("../img/union/btn_union_off.gif") no-repeat scroll left top rgba(0, 0, 0, 0); }' +
		/* カード選択時の枠色 */
		// '.imc_deck_mode .imc_selected { border: solid 2px #f80 !important; background: -moz-linear-gradient(top left, #654, #000) !important; }' +
		// '.imc_union_mode .imc_selected { border: solid 2px #09c !important; background: -moz-linear-gradient(top left, #456, #000) !important; }' +
		// '.imc_union_keep_mode .imc_selected { border: solid 2px #4f0 !important; background: -moz-linear-gradient(top left, #456, #000) !important; }' +
		'.cardStatusDetail.imc_selected { border: solid 2px #f80 !important; }' +
		/* 下部表示欄 */
		'.imc_contents { position: relative; width: 916px; padding: 0px 14px 0px 14px; margin: 7px auto; }' +

		'#imi_open.imc_is_open:after { content: "閉じる" }' +
		'#imi_open.imc_is_close:after { content: "開く" }' +
		'.cardStatusDetail { height: auto; }' +

		// '#imi_useUnion { background: url("../img/union/btn_union_off.gif") no-repeat scroll left top rgba(0, 0, 0, 0); }' +
		// '#imi_useUnion { text-align: center; }' +
		'#imi_useUnion { display: block; margin-left: auto; margin-right: auto; }' +
		'',

		main: function() {
			this.autoPager();
			this.layouter();

			var $card_list = $('.cardStatusDetail');
			$('#deck_file')
			.on('click', '.cardStatusDetail', function( eo ) {
				if( $(this).hasClass('imc_selected') ) {
					$(this).removeClass('imc_selected');
				}
				else {
					$(this).addClass('imc_selected');
				}
			});

			$(document)
			.on('click', '.cardStatusDetail', function() {
				$(this).addClass('imc_selected');
			});
		},

		//. autoPager
		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager:last'),
						source = $pager.find('LI > :not("A"):last').parent().next('LI:has("A")').find('A').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1].toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					var param =  {
						base_cid: $('INPUT[name=base_cid]').val(),
						added_cid: $('INPUT[name=added_cid]').val(),
						add_flg: $('INPUT[name=add_flg]').val(),
						new_cid: $('INPUT[name=new_cid]').val(),
						remove_cid: $('INPUT[name=remove_cid]').val(),
						material_cid: [],
						p: nextPage,
						l: $('#l').val(),
					};
					$('INPUT[name="material_cid[]"]').each( function() {
						param.material_cid.push( $(this).val() );
					});
					return Page.get('/union/add_lv.php', param);
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.cardStatusDetail');

					$card_list.insertAfter('.cardStatusDetail:last');

					// self.cardLayouter( $card_list );
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		//. layouter
		layouter: function() {
		// 	var $card_list = $('.cardStatusDetail');
		// 	this.cardLayouter( $card_lis

			//仮想デッキ用
			var html = '' +
			'<div id="imi_bottom_container">' +
				'<div class="imc_overlay" />' +
				'<div class="imc_contents">' +
					'<img id="imi_useUnion" src="../img/union/btn_union_off.gif">' +
				'</div>' +
			'</div>';
			$( html ).appendTo('BODY');

			$('#imi_useUnion')
			.on('click', function() {
				var $form = $('#union_data');

				var list = [];
				$('.cardStatusDetail.imc_selected').each( function() {
					var cid = $(this).find('[id^=cardWindow_]').attr('id').match(/cardWindow_(\d+)/)[1];
					if( $.isNumeric( cid ) ) {
						list.push( cid );
					}
				});
				$form.find('[name="material_cid[]"]').each( function() {
					var cid = $(this).val();
					if( $.isNumeric( cid ) ) {
						list.push( cid );
					}
				})

				if( list.length > 0 ) {
					var postData = {
						base_cid  : $form.find('#base_cid').val(),
						added_cid : $form.find('#added_cid').val(),
						add_flg   : 1,
						p         : $form.find('[name=p]').val(),
						label     : $form.find('[name=label]').val(),
						remove_cid: $form.find('#remove_cid').val(),
						new_cid   : list[0],
						'material_cid[]': [],
					}
					for( var i = 1, len = list.length; i < len; i++ ) {
						postData['material_cid[]'].push( list[i] );
					}
					$.post('/union/add_lv.php', postData )
					.done( function( html ) {
						$('#gray02Wrapper').replaceWith( $(html).find('#gray02Wrapper') );
					});
				}
			});
		},

		// //. cardLayouter
		// cardLayouter: function( $card_list ) {
		// 	// $card_list.each( function() {
		// 	// 	$(this).find('.control').hide();
		// 	// });
		// },t );
	});

	//■ /union/remove  .. カード合成 スキル削除
	Page.registerAction('union', 'remove', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		//. autoPager
		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager:last'),
						source = $pager.find('LI > :not("A"):last').parent().next('LI:has("A")').find('A').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1]; //.toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					return Page.get('/union/remove.php', {
						cid: $('INPUT[name=base_cid]').val(),
						p: nextPage,
						l: $('#l').val(),
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.cardStatusDetail');

					$card_list.insertAfter('.cardStatusDetail:last');

					// self.layouter($card_list);
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		//. layouter
		layouter: function() {
		},
	});

	//■ /facility/territory_status .. 領地管理
	Page.registerAction('facility', 'territory_status', {

		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.pager',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager'),
						source = $pager.find('LI.last A:first').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1]; //.toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					var s = location.search.match(/s=(\d+)/) || '',
						o = location.search.match(/o=(\d+)/) || '';

					return Page.get('/facility/territory_status.php', {
						p: nextPage,
						s: s ? s[1]: '',
						o: o ? o[1]: '',
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$teritories = $html.find('.commonTables TR:has("TD")');
					// 	$card_list = $html.find('.cardStatusDetail'),
					// 	loadedPage = $html.find('UL.pager LI :not("A")').text(); // 読み込んだページ

					// $card_list.insertAfter('.cardStatusDetail:last');

					// self.layouter($card_list);
					$teritories.appendTo('.commonTables TBODY');
					self.layouter();
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		layouter: function() {
			// 敵襲とか援軍で複数のcommonTablesができる...
			var $tr = $('.commonTables > TBODY > TR');

			// 0:見出し 1:謎の空行
			$tr.slice(2)
			// .hover( Util.enter, Util.leave )
			.each(function() {
				let $self = $(this),
					$td = $self.find('TD'),
					$name = $td.eq(0),
					$pos = $td.eq(1),
					rank, $lv = $td.eq(3),
					chuusei, wood, stone, iron, rice, remain,
					$act1 = $td.eq(10), // LVUP か 破棄中
					$act2; // 出兵いるか？

				// $selfだとtdのcssが勝ってるので$tdの色をいじる
				// 破棄中なら赤っぽく
				if ( /^破棄中.*/.test($act1.text())) {
					$td.css('backgroundColor', 'mistyrose');
				}
				// Lv2以上なら青っぽく
				else if( $lv.text() > 1 && $lv.text() < 5 ) {
					$td.css('backgroundColor', 'lightcyan');
				}
				else if( $lv.text() == 5 ) {
					$td.css('color', 'blue')
				}
				// 新領地なら灰色
				else if (/^新領地.*/.test($name.text())) {
					$td.css('backgroundColor', 'lightgray');
				}

				// 座標欄のリンクを変更
				var [dmy, x, y] = $pos.text().match(/(-?\d{1,3})[，,.]\s*(-?\d{1,3})/);
				$pos.find('a').attr('href', '/map.php?x=' + x + '&y=' + y);
			});
		},
	});

	//■ item .. アイテム
	Page.registerAction('item', {

		main: function() {
			this.autoPager();
			this.layouter();

			// 使用中の便利アイテム終了時間
			// storage('ITEM')
			var $tr = $('#itemExpirationTime TR ');
			$tr.each( function() {
				var itemName = $(this).find('.itemExpirationTime_name').text(),
					itemTime = $(this).find('.itemExpirationTime_time').text();
				
			});
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			// var stock =  $('.item_icon_stack').text();
			var self = this,
				$getCard = $('.iu_card aside .iu_open');

			$getCard.each( function() {
				var itemId = $(this).attr('onclick').match(/(\d+)/)[1];
				$(this).attr( 'onclick', '' ).data( 'iid', itemId );
			})
			.on( 'click', function() {
				var clickedElm = this;
				$.post('/item/index.php', { 
					item_id: $(this).data('iid'),
					ssid: Env.ssid
				})
				.done( function( html ) {
					console.log( 'finish' );
					// console.log( html );
					// $(clickedElm).closest('.iu_card').hide();
				});
			});


			// .click( function() {
			// 	console.log( $(this) );
			// 	console.log( $(this).attr('onclick') );
			// 	$(this).attr('onclick', '');
			// 	return false;
			// });
		},
	});
	Page.registerAction('item', 'index', {
		main     : Page.getAction('item', 'main'),
		autoPager: Page.getAction('item', 'autoPager'),
		layouter : Page.getAction('item', 'layouter'),
	});

	//■ /item/inbox .. アイテム受信箱
	Page.registerAction('item', 'inbox', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			$.noop;
		},
	});

	//■ /card/protection .. カード保護一括変更
	Page.registerAction('card', 'protection', {
		main: function() {
			// this.autoPager();
			this.layouter($('.cardStatusDetail'));
		},

		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager'),
						source = $pager.find('LI.last A:first').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1]; //.toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					return Page.get('/card/protection.php', {
						p: nextPage
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.cardStatusDetail'),
						loadedPage = $html.find('UL.pager LI :not("A")').text(); // 読み込んだページ

					$card_list.insertAfter('.cardStatusDetail:last');

					self.layouter($card_list);
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		layouter: function($cards) {
			var self = this;

			$cards.each(function() {
				var $this = $(this),
					$title = $this.find('.label-setting-card > h3');

				// 保護状態で色を変える
				if ($this.find('INPUT:checked').val() == 0) {
					$title.css('background-color', '#0093C7');
				} else {
					$title.css('background-color', '#C70093');
				}

				$this.find('INPUT')
				.change( function() {
					if ($(this).val() == 0) {
						$title.css('background-color', '#0093C7');
					} else {
						$title.css('background-color', '#C70093');
					}
					var postData = {
						ssid: Env.ssid,
					};
					postData[$(this).attr('name')] = $(this).val();
					console.log( postData );
					$.post('/card/protection.php', postData );
				});

				// @Todo:オートページャーのせいで
				// 決定ボタンが最後まで押せないのでどうにかする
			});

		},
	});

	//■ /card/protection .. カードラベル設定
	Page.registerAction('card', 'labeling', {
		main: function() {
			this.autoPager();
			this.layouter($('.card-status-detail-label,[id^=cardWindow_]'));
		},

		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.bottom',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager'),
						source = $pager.find('LI.last A:first').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1].toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					return Page.get('/card/labeling.php', {
						p: nextPage,
						l: $('#l').val(),
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$card_list = $html.find('.card-status-detail-label,[id^=cardWindow_]'),
						loadedPage = $html.find('UL.pager LI :not("A")').text(); // 読み込んだページ

					$card_list.insertAfter('[id^=cardWindow_]:last');

					self.layouter($card_list);
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		layouter: function($cards) {
			$cards.find('.label-setting-card INPUT')
			.on('change', function() {
				var $checked = $(this).closest('.label-setting-card').find(':checked');
				var postData = {
					ssid: Env.ssid,
				}
				postData[$checked.attr('name')] = $checked.val();
				$.post('/card/labeling.php', postData );
			});
			// var self = this;

			// $cards.each(function() {
			// 	var $this = $(this),
			// 		$title = $this.find('.label-setting-card > h3');

			// 	// ラベルごとに色を変える
			// 	if ($this.find('INPUT:checked').val() == 0) {
			// 		$title.css('background-color', '#0093C7');
			// 	} else {
			// 		$title.css('background-color', '#C70093');
			// 	}

			// 	$this.find('INPUT').change(function() {
			// 		if ($(this).val() == 0) {
			// 			$title.css('background-color', '#0093C7');
			// 		} else {
			// 			$title.css('background-color', '#C70093');
			// 		}
			// 	});

			// 	// @Todo:オートページャーのせいで
			// 	// 決定ボタンが最後まで押せないのでどうにかする
			// });
		},
	});

	//■ /card/domestic_setting .. 内政画面
	Page.registerAction('card', 'domestic_setting', {
		main: function() {
			this.layouter();
		},

		layouter: function() {
			// 内政元選択エリア / クリックエリア拡大
			$('FORM[name=send_soldier_sample] TD:has("INPUT")')
			.hover( Util.enter, Util.leave )
			.click(function(e) {
				var tagName = e.target.tagName.toUpperCase();
				if (tagName == 'INPUT') {
					return;
				}
				$(this).find('INPUT').click();
			});

			// 内政していないとき
			if( $('INPUT[name="mode"]').val() == 'domestic' ) {
				let selector = 'FORM[name="input_domestic"] .commonTables > TBODY > TR:last > TD';
				// 出兵中の武将はリストの末尾に移動
				$('.general:contains("出兵中")').appendTo( $(selector) );
				// ボタンは上記の処理をしてから末尾に移動
				$( selector + ' > DIV:last').appendTo( $(selector) );
			}
			// 内政中は .domesticBtnArea が存在
			//  (modeだとe_domesticとu_domesticの2つなので却下)
			else if( $('.domesticBtnArea').length > 0 ) {
				// 内政中の武将はリストの先頭に移動
				$('.general:contains("内政中")').prependTo( $('.domesticBtnArea FORM:first') )
				.find('TD:contains("内政中")').html('<button>解除</button>')
				.on('click', function() {
					// 解除パラメータを投入
					location.href = location.pathname + 
					'?mode=u_domestic&id=' + $('INPUT[name=domestic_id]').val();
					// イベントフローは停止
					return false;
				});
				// 出兵中の武将はリストの末尾に移動
				$('.general:contains("出兵中")').appendTo( $('.domesticBtnArea FORM:first') );
				// ボタンは上記の処理をしてから末尾に移動
				$('.domesticBtnArea FORM:first > LI').appendTo( $('.domesticBtnArea FORM:first') );
			}

			// 武将欄のクリック範囲拡大 & submit → 内政設定される
			$('.general')
			.hover( Util.enter_g, Util.leave_g )
			.click(function(e) {
				var tagName = e.target.tagName.toUpperCase();
				if (tagName == 'INPUT') {
					return;
				}
				if( $(this).has('INPUT').length > 0 ) {
					$(this).find('INPUT').click();
					$(this).closest('FORM').submit();
				}
			});
		},
	});

	//■ /card/event_battle_top .. レイド
	Page.registerAction('card', 'event_battle_top', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		//. autoPager
		autoPager: function() {
			var self = this;

			$.autoPager({
				container: '.pager',
				next: function(html) {
					var $html = $(html),
						$pager = $html.find('UL.pager:last'),
						source = $pager.find('LI.last A:first').attr('href') || '',
						match = source.match(/p=(\d+)/),
						nextPage;

					if (match) {
						nextPage = match[1].toInt();
					}
					return nextPage;
				},
				load: function(nextPage) {
					var s = location.search.match(/scope=(\d+)/) || '';
					return Page.get('/card/event_battle_top.php', {
						p: nextPage,
						scope: s[1],
					});
				},
				loaded: function(html) {
					var $html = $(html),
						$npc_list = $html.find('.npcBusho');

					$npc_list.insertAfter('.npcBusho:last');
					self.layouter();
				},
				ended: function() {
					Display.info('全ページ読み込み完了');
				}
			});
		},

		layouter: function() {
			// var s = location.search.match(/scope=(\d+)/) || '';
			// if( s[1] == 2 || s[1] == 3 ) {
			// 	// 同盟/全体のときに劉備を非表示
			// 	$('.npcBusho').has('IMG[src*=1035_BDo8ZB2M]').hide();
			// 	$('.npcBusho').has('IMG[src*=1062_VbBDhb2f]').hide();
			// 	$('.npcBusho').has('IMG[src*=1089_C161YG25]').hide();
			// 	$('.npcBusho').has('IMG[src*=1098_6M55M85K]').hide();
			// }
		},
	});

	//■ /facility/unit_status .. 兵士管理
	Page.registerAction('facility', 'unit_status', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			console.log('/facility/unit_status::layouter')
			// 選択中のタブ
			var selected = $('.ui-tabs-nav .ui-tabs-selected A').attr('href');

			// 情報表示エリア
			var $tables = $('#rotate .commonTables:visible[summary!="待機中の兵士"][summary!="敵襲"]');

			// 兵数欄の開閉
			$tables.each(function() {
				// $(this).find('TR TD.digit .commonTablesNoMG').hide();
				$('<span id=b3mi_>▼</span>').prependTo( $(this).find('TR TD.digit .commonTablesNoMG').hide().parent() )
				.on('click', function() {
					$(this).next().toggle();
					if ($(this).next(':visible').length) {
						$(this).text('▲');
					} else {
						$(this).text('▼');
					}
				});

			});
		},
	});

	//■ /facility/castle_send_troop.php .. 出兵画面
	Page.registerAction('facility', 'castle_send_troop', {
		style: '#imi_table_reserveAttack { height: 0px !important; }',

		main: function() {
			this.layouter();
		},

		layouter: function() {
			var self = this;

			// タイトルが(入力)
			if (/入力/.test($('title').text())) {
				// 兵士欄のトグル
				$('.innerTables').hide().closest('.commonTables').find('TH:first')
				.on('click', function() {
					$('.innerTables').toggle();
				});

				// 予約出兵を現在日時に
				var now = new Date();
				$('[name=res_y]').val(now.getFullYear());
				$('[name=res_m]').val(now.getMonth() + 1);
				$('[name=res_d]').val(now.getDate());
				$('[name=res_h]').val(now.getHours());
				$('[name=res_i1]').val(('0' + now.getMinutes()).slice(-2, -1));
				$('[name=res_i2]').val(('0' + now.getMinutes()).slice(-1));
				$('[name=res_s1]').val(('0' + now.getSeconds()).slice(-2, -1));
				$('[name=res_s2]').val(('0' + now.getSeconds()).slice(-1));

				// .commonTablesReserveAttack
				var reserve = $('.commonTablesReserveAttack TR:first TH:first').hide().text();
				$('<tr id="imi_table_reserveAttack"><th class="mainTtl" colspan="3">' + reserve + '</td></tr>').prependTo('.commonTablesReserveAttack');
				$('.commonTablesReserveAttack TR:not(TR:first)').hide();
				$('#imi_table_reserveAttack').click( function() {
					$(this).nextAll().toggle();
				});

				// 武将選択範囲の拡大
				$('.general')
				.hover( Util.enter_g, Util.leave_g )
				.click(function(e) {
					var tagName = e.target.tagName.toUpperCase();
					if (tagName == 'INPUT') {
						return;
					}
					if( $(this).has('INPUT').length > 0 ) {
						$(this).find('INPUT:first').click();
					}
				});
				$('.general .use')
				.hover( Util.enter, Util.leave )
				.click( function( e ) {
					var tagName = e.target.tagName.toUpperCase();
					if (tagName == 'INPUT') {
						return;
					}
					if( $(this).has('INPUT').length > 0 ) {
						$(this).find('INPUT:first').click();
					}
				});

				// 出兵中の武将はリストの最後に移動
				$('.general:contains("出兵中")').appendTo('.bushoList');

				// デフォで最初の武将を選択
				$('INPUT[name="unit_assign_card_id"]:first').attr('checked', true);
				// 使用頻度の高いスキルをチェック
				// 飛将: at026*
				// 神速劫略: at150*
				// 鬼神の鹵獲: at168*
				// 猛将の鹵獲: sa019*
				$('INPUT[name^="use_skill_id"][value^=at026],[value^=at168],[value^="sa019"],[value^="at134"],[value^="at144"],[value^="at150"]').attr('checked', true);

				// コントロールエリアを上に
				$('table.commonTablesReserveAttack').after($('div.controlArea').clone(true));

				// 単騎出撃
				$("<input id='drill' type='button' value='単騎'/>").appendTo($('div.controlArea'))
				.on('click', function () {
					var $general   = $('INPUT[name=unit_assign_card_id]:checked').closest('TABLE.general'),
						general_id = $('INPUT[name=unit_assign_card_id]:checked').val(),
						postData = {
							infantry_count      : '',
							large_infantry_count: '',
							shield_count        : '',
							heavy_shield_count  : '',
							spear_count         : '',
							halbert_count       : '',
							archer_count        : '',
							crossbow_count      : '',
							cavalry_count       : '',
							cavalry_guards_count: '',
							ram_count           : '',
							catapult_count      : '',
							scout_count         : '',
							cavalry_scout_count : '',
							radio_move_type     : parseInt($("INPUT[name='radio_move_type']:checked").val()),
							radio_reserve_type  : 0,
							card_id             : 204,
							show_beat_bandit_flg: '',
							village_name   : '',
							village_x_value: $("input[name=village_x_value]").val(),
							village_y_value: $("input[name=village_y_value]").val(),
							x: '',
							y: '',
							unit_assign_card_id: parseInt(general_id),
							btn_send: '出兵',
						};
					postData['use_skill_id[' + general_id + ']'] = $general.find('INPUT[id^="skill_radio_"]:checked').val();

					$.post( '/facility/castle_send_troop.php', postData )
					.done( function() {
						$.get( location.href )
						.done( function( html ) {
							$('.bushoList').replaceWith( $(html).find('.bushoList') );
							$('.general:contains("出兵中")').appendTo('.bushoList');
							$('INPUT[name="unit_assign_card_id"]:first').attr('checked', true);
							$('INPUT[name^="use_skill_id"][value^=at026],[value^=at168],[value^="sa019"],[value^="at134"],[value^="at144"],[value^="at150"]').attr('checked', true);
							// 武将選択範囲の拡大
							$('.general')
							.hover( Util.enter_g, Util.leave_g )
							.click(function(e) {
								var tagName = e.target.tagName.toUpperCase();
								if (tagName == 'INPUT') {
									return;
								}
								if( $(this).has('INPUT').length > 0 ) {
									$(this).find('INPUT:first').click();
								}
							});
						})
					});
				});

				// 一斉鹵獲
				$("<input type='button' value='一斉鹵獲'/>").appendTo($('div.controlArea'))
				.on('click', function() {
					var tasks = [];
					$.each( $('.general'), function() {
						// var postData = {
						// 		infantry_count      : '',
						// 		large_infantry_count: '',
						// 		shield_count        : '',
						// 		heavy_shield_count  : '',
						// 		spear_count         : '',
						// 		halbert_count       : '',
						// 		archer_count        : '',
						// 		crossbow_count      : '',
						// 		cavalry_count       : '',
						// 		cavalry_guards_count: '',
						// 		ram_count           : '',
						// 		catapult_count      : '',
						// 		scout_count         : '',
						// 		cavalry_scout_count : '',
						// 		radio_move_type     : parseInt($("INPUT[name='radio_move_type']:checked").val()),
						// 		radio_reserve_type  : 0,
						// 		card_id             : 204,
						// 		show_beat_bandit_flg: '',
						// 		village_name   : '',
						// 		village_x_value: $("input[name=village_x_value]").val(),
						// 		village_y_value: $("input[name=village_y_value]").val(),
						// 		x: '',
						// 		y: '',
						// 		// unit_assign_card_id: parseInt(general_id),
						// 		btn_send: '出兵',
						// 	},
						var gid = $(this).find('[name=unit_assign_card_id]').val();
						$.each( $(this).find('.use'), function() {
							if( /劉備の大徳|鬼神の鹵獲|猛将の鹵獲|神速劫略|迅速劫略/.test( $(this).text() ) ) {
								// postData['unit_assign_card_id'] = parseInt( gid );
								// postData['use_skill_id[' + gid + ']'] = $(this).find('INPUT[id^="skill_radio_"]').val();
								var postData = getPostData( gid, $(this).find('INPUT[id^="skill_radio_"]').val() );
								tasks.push( $.post( '/facility/castle_send_troop.php', postData ) );
							}
						});
					});

					$.when.apply( $, tasks )
					.done( function() {
						location.href = '/facility/unit_status.php';
					});
				});

				function getPostData( gid, sid ) {
					var postData = {
							infantry_count      : '',
							large_infantry_count: '',
							shield_count        : '',
							heavy_shield_count  : '',
							spear_count         : '',
							halbert_count       : '',
							archer_count        : '',
							crossbow_count      : '',
							cavalry_count       : '',
							cavalry_guards_count: '',
							ram_count           : '',
							catapult_count      : '',
							scout_count         : '',
							cavalry_scout_count : '',
							radio_move_type     : parseInt($("INPUT[name='radio_move_type']:checked").val()),
							radio_reserve_type  : 0,
							card_id             : 204,
							show_beat_bandit_flg: '',
							village_name   : '',
							village_x_value: $("input[name=village_x_value]").val(),
							village_y_value: $("input[name=village_y_value]").val(),
							x: '',
							y: '',
							unit_assign_card_id: parseInt(gid),
							btn_send: '出兵',
						};
					postData['use_skill_id[' + gid + ']'] = sid;

					return postData;
				}
			}
			// タイトルが(確認)
			else if (/確認/.test($('title').text())) {
				$('.fighting_units').hide();
			}
		},

		// Utilとの違いは`TH`を除外
		//. enter
		enter: function() {
			$(this).addClass('imc_current');
			$(this).find(':not("TH")').addClass('imc_current');
		},
		//. leave
		leave: function() {
			$(this).removeClass('imc_current');
			$(this).find(':not("TH")').removeClass('imc_current');
		},
	});

	//■ /report/list .. 報告書
	Page.registerAction('report', 'list', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			$.noop;
		},
	});

	//■ /card/allcaard_delete .. 武将カード一括破棄
	Page.registerAction('card', 'allcard_delete', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			// TD側のbackground-colorがぁ
			$('.tradeTables TR').slice(1)
				.hover(Util.enter, Util.leave)
				.click(function(e) {
					var tagName = e.target.tagName.toUpperCase();
					if (tagName == 'INPUT') {
						return;
					}
					let now = $(this).find('INPUT').prop('checked');
					$(this).find('INPUT').prop('checked', !now);
				});
		},
	});

	//■ /union/union_remove .. スキルレベルアップ
	Page.registerAction('union', 'union_lv', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			$('.choiceSkill TR.able:first INPUT').prop('checked', true);
			$('.choiceSkill TR.able')
			.hover(Util.enter, Util.leave)
			.click(function(e) {
				var tagName = e.target.tagName.toUpperCase();
				if (tagName == 'INPUT') {
					return;
				}
				$(this).find('INPUT').prop('checked', true);
			});
		},
	});

	//■ /union/union_remove .. スキル削除
	Page.registerAction('union', 'union_remove', {
		main: function() {
			this.autoPager();
			this.layouter();
		},

		autoPager: function() {
			$.noop;
		},

		layouter: function() {
			$('.choiceSkill TR.able')
				.hover(Util.enter, Util.leave)
				.click(function(e) {
					var tagName = e.target.tagName.toUpperCase();
					if (tagName == 'INPUT') {
						return;
					}
					$(this).find('INPUT').attr('checked', true);
				});
		},
	});

	//■ /alliance/info .. 同盟情報
	Page.registerAction('alliance', 'info', {
		main: function() {
			this.layouter();
		},

		layouter: function() {
			$.noop;
		},
	});

	//■ /alliance/alliance_skill ..同盟スキル
	Page.registerAction('alliance', 'alliance_skill', {
		style: '' +
			'.imc_heal { font-size: x-small; color: darkcyan; }' +
			'',

		main: function() {
			this.layouter();
		},

		layouter: function() {
			$('.commonTables').each(function() {
				var text = $(this).find('TR:first TD').text();
				console.log(text);
				if (/回復中/.test(text)) {
					let [dmy, hh, mi, ss] = text.match(/(\d{2}):(\d{2}):(\d{2})/);
					let ms = (parseInt(hh) * 3600 + parseInt(mi) * 60 + parseInt(ss)) * 1000;
					let now = new Date();
					now.setTime(now.getTime() + ms);

					$(this).find('TR:first TD')
						.append('<div class="imc_heal">(' + toFormatDate(now) + ')</div>');
				}
			});

			function toFormatDate(tm, format) {
				format = format || 'mm/dd hh:mi:ss';

				// format = format.replace('yyyy', tm.getFullYear() );
				format = format.replace('mm', tm.getMonth() + 1);
				format = format.replace('dd', tm.getDate());
				format = format.replace('hh', ('00' + tm.getHours()).substr(-2));
				format = format.replace('mi', ('00' + tm.getMinutes()).substr(-2));
				format = format.replace('ss', ('00' + tm.getSeconds()).substr(-2));

				return format;
			}
		},
	});

	//■ /land ..土地
	Page.registerAction('land', {
		main: function() {
			this.layouter();
			this.keyBind();
		},

		layouter: function() {
			$.noop;
		},

		keyBind: function() {
			var self = this,
				[dmy, x, y] = location.search.match(/x=(-?\d+)&y=(-?\d+)/);

			$(document).keybind({
				// ..中心に表示
				'C-m': Util.keyBindCallback(function() {
					location.href = '/map.php?x=' + x + '&y=' + y;
				}),
				// // ..出兵
				// '': Util.keyBindCallback(function() {
				// 	location.href = '/facility/castle_send_troop.php?x=' + x + '&y=' + y;
				// }),
				// // ..拠点化
				// '': Util.keyBindCallback(function() {
				// 	location.href = '/facility/select_type.php?x=' + x + '&y=' + y;
				// }),
				// // ..レベルアップ
				// 'l': Util.keyBindCallback(function() {
				// 	location.href = '/territory_proc.php?x=' + x + '&y=' + y + '&mode=lvup';
				// }),
				// ..破棄 および キャンセル
				'Del': Util.keyBindCallback(function() {
					if( $('FORM[name=remove]').length > 0 ) {
						$('FORM[name=remove]').submit();
					}
					else {
						location.href = '/territory_proc.php?x=' + x + '&y=' + y + '&mode=cancel';
					}
				}),
				// ..リネーム
				'F2': Util.keyBindCallback(function() {
					self.rename();
				}),
				// 'n': Util.keyBindCallback(function() {
				// 	location.href = '/village.php';
				// }),
			})
		},

		rename: function() {
			var [dmy, x, y] = location.search.match(/x=(-?\d+)&y=(-?\d+)/);
			var newName = window.prompt('領地名を入力してください', $('#basepoint .basename').text() );
			if( newName ) {
				var url = '/user/change/change.php';
				$.get( url )
				.done( function( html ) {
					var $form = $(html).find('FORM[name=input_user_profile]');
					var postData = {
						alliance: $form.find('INPUT[name=alliance]:checked').val(),
						comment : $form.find('TEXTAREA[name=comment]').text(),
						medal   : $form.find('TEXTAREA[name=medal]').text(),
						btn_send: '更新',
						ssid: Env.ssid,
					};
					$form.find('INPUT[name^=new_name]').each( function() {
						postData[$(this).attr('name')] = $(this).val();
					});
					var replaceItem =
						$(html).find('TD:contains("'+x+','+y+'")').prev().children('INPUT').attr('name');
					postData[replaceItem] = newName;

					$.post( url, postData )
					.done( function() {
						Display.info('変更しました');
						location.reload();
					});
				});
			}
		},
	});

	//■ /facility/facility ... 施設
	Page.registerAction('facility', 'facility', {
		main: function() {
			this.layouter();
		},

		layouter: function() {
			var self = this;
			
			$('.unit_value').attr('maxlength', 5);

			// 割引適用後の兵数を表示
			$('SPAN[onclick^=setObjectValue]').replaceWith( function() {
				var onclick = $(this).attr('onclick');
				var cost = $(this).closest('TR').prevAll('TR:has(".cost")').first().text();
				var [dmy, cw, cs, ci, cr ] =
					cost.match(/木\s*(\d+)\s*\|\s*石\s*(\d+)\s*\|\s*鉄\s*(\d+)\s*\|\s*糧\s*(\d+)/);
				var wood  = $('.resorces #wood').text();
				var stone = $('.resorces #stone').text();
				var iron  = $('.resorces #iron').text();
				var rice  = $('.resorces #rice').text();
				var count =
					Math.floor( Math.min( wood/(cw*90), stone/(cs*90), iron/(ci*90), rice/(cr*90) ) * 100 );
				// 宿舎の空きと比較が必要
				$(this).attr('onclick', $(this).attr('onclick').replace(/,\s*\'\d+\'/, ",'" + count + "'") );
				$(this).text( $(this).text().replace(/\d+/, count) );

				return $(this).get(0).outerHTML;
			});

			$('<input type=button value="1000体ずつ">').insertAfter('INPUT[value="確認"]')
			.click( function() {
				var button = this;
				var [dmy, x, y] = location.search.match(/x=(\d+)&y=(\d+)/);
				var uid =  $(this).siblings('INPUT[name^="create"]').attr('name').match(/create\[(\d+)\]/)[1] || '';
				var count =  $(this).siblings('INPUT[name^="unit_value"]').val();

				if( $.isNumeric( uid ) ) {
					var ol = Display.dialog();

					(function( param ) {
						var self = arguments.callee;
						var [ remain, ol ] = param;
						var c = ( remain - 1000 ) >= 1000 ? 1000: remain;
						if( c == 0 ) {
							if( ol && ol.close ) { ol.close(); }
							return $.Deferred().resolve();
						}
						ol.message( c + '体作成開始(残り:' + ( remain - c ) + '体)' );

						return $.post('/facility/facility.php', {
							x: x,
							y: y,
							count: c,
							unit_id: uid,
						})
						.then( function( html ) {
							return self.call( self, [ remain - c, ol ] );
						});
					})( [ count, ol ] )
					.done( function() {
						location.reload();
					});
				}
			});
		},
	});

	Page.registerAction('busyodas', 'busyodas', {
		main: function() {
			var remain = $('.busyodasCardInfo').find('STRONG:first').text().toInt();

			$('.busyodasCurrency')
			.on('click', function() {
				var count = $(this).find('DD').text().toInt(),
					$form = $(this).prev().find('FORM'),
					postData = {
						ssid    : $form.find('[name=ssid]').val(),
						send    : $form.find('[name=send]').val(),
						got_type: $form.find('[name=got_type]').val(),
						tab     : $form.find('[name=tab]').val(),
					},
					repeat = Math.min( remain, count );

				for( var i = 0; i < repeat; i++ ) {
					$.post('/busyodas/busyodas.php', postData );
				}
			});
		}
	});

	//■ /busyodas/busyodas_continuty_result .. ブショーダスを10回引いた結果
	Page.registerAction('busyodas', 'busyodas_continuty_result', {
		main: function() {
			this.layouter();
		},

		layouter: function() {
			// $('.commonTables > TBODY > TR')
			// .mouseover( function() {console.log( 'over' )} )
			// .mouseout( function() {console.log('out')} );
			// .mouseover( Util.enter )
			// .mouseout( Util.leave );
			// .hover( 
			// 	function() { console.log( 'enter' ); },
			// 	function() { console.log( 'leave' ); } );
			// 	// Util.enter, Util.leave );
		},
	});

	//■ /map ..土地
	Page.registerAction('map', {
		main: function() {
			this.layouter();
			this.keyBind();
		},

		layouter: function() {
			$.noop;
		},

		keyBind: function() {
			var self = this,
				[dmy, x, y] = location.search.match(/x=(-?\d+)&y=(-?\d+)/);

			$(document).keybind({
				// ..中心の土地を表示
				'C-m': Util.keyBindCallback(function() {
					location.href = '/land.php?x=' + x + '&y=' + y;
				}),
				// // ..出兵
				// '': Util.keyBindCallback(function() {
				// 	location.href = '/facility/castle_send_troop.php?x=' + x + '&y=' + y;
				// }),
				// // ..拠点化
				// '': Util.keyBindCallback(function() {
				// 	location.href = '/facility/select_type.php?x=' + x + '&y=' + y;
				// }),
				// // ..レベルアップ
				// 'l': Util.keyBindCallback(function() {
				// 	location.href = '/territory_proc.php?x=' + x + '&y=' + y + '&mode=lvup';
				// }),
				// ..破棄
				'Del': Util.keyBindCallback(function() {
					$.post('/territory_proc.php?x=' + x + '&y=' + y + '&mode=remove', { ssid: Env.ssid });
				}),
				// ..リネーム
				'F2': Util.keyBindCallback(function() {
					self.rename();
				}),
				// 'n': Util.keyBindCallback(function() {
				// 	location.href = '/village.php';
				// }),
			})
		},

		rename: function() {
			var [dmy, x, y] = location.search.match(/x=(-?\d+)&y=(-?\d+)/);
			var newName = window.prompt('領地名を入力してください', $('#basepoint .basename').text() );
			if( newName ) {
				var url = '/user/change/change.php';
				$.get( url )
				.done( function( html ) {
					var $form = $(html).find('FORM[name=input_user_profile]');
					var postData = {
						alliance: $form.find('INPUT[name=alliance]:checked').val(),
						comment : $form.find('TEXTAREA[name=comment]').text(),
						medal   : $form.find('TEXTAREA[name=medal]').text(),
						btn_send: '更新',
						ssid: Env.ssid,
					};
					$form.find('INPUT[name^=new_name]').each( function() {
						postData[$(this).attr('name')] = $(this).val();
					});
					var replaceItem =
						$(html).find('TD:contains("'+x+','+y+'")').prev().children('INPUT').attr('name');
					postData[replaceItem] = newName;

					$.post( url, postData )
					.done( function() {
						Display.info('変更しました');
						location.reload();
					});
				});
			}
		},
	});

	// /card/trade_card.php
	// /card/allcard_delete.php
	// http://s1.3gokushi.jp/union/union_lv.php
	// http://s1.3gokushi.jp/union/remove.php?cid=18017803
	// http://s1.3gokushi.jp/card/allcard_delete.php
	// http://s1.3gokushi.jp/card/labeling.php
	// /union/add_lv
	// http://s1.3gokushi.jp/alliance/info.php?id=1056

	// //■ Template
	// Page.registerAction('', '', {
	// 	main: function() {
	// 		this.autoPager();
	// 		this.layouter();
	// 	},

	// 	autoPager: function() {
	// 		$.noop;
	// 	},

	// 	layouter: function() {
	// 		$.noop;
	// 	},
	// });

	//■■■■■■■■■■■■■■■■■■■

	//■ 実行
	Page(Env.path).execute();

	//■■■■■■■■■■■■■■■■■■■

})(jQuery);