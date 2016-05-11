(function(){
	'use strict';

	var Util = (function(){
		var perfix = 'h5_';
		// localStorage getItem
		var StorageGetter = function(key) {
			return localStorage.getItem(perfix + key);
		};
		// localStorage setItem
		var StorageSetter = function(key, val){
			return localStorage.setItem(perfix + key, val);
		};

		var GetJsonp = function(url, callback){
			// 使用jquery.jsonp.js
			return $.jsonp({
				url: url,
				cache: true,
				callback: 'duokan_fiction_chapter', // callback为项目约定的callback
				success: function(result) {
					//debugger
					var data = $.base64.decode(result); // 使用jquery.base64.js解密
					var json = decodeURIComponent(escape(data)); // 解码
					callback(json);
				}
			});
		};

		return {
			GetJsonp: GetJsonp,
			StorageGetter: StorageGetter,
			StorageSetter: StorageSetter
		};
	})();

	// Dom节点缓存
	var Dom = {
		top_nav: $('#top_nav'),
		bottom_nav: $('.bottom_nav'),
		fiction_container: $('#fiction_container'),
		font_container: $('#font_container'),
		font_button: $('#font_button'),
		bk_container: $('#bk_container'),
		night_button: $('#night_button')
	};

	var Win = $(window);
	var Doc = $(document);
	var Body = $('body');

	// 字号设置
	var InitFontSize = Util.StorageGetter('font_size'); // 获取存储的fontsize
	InitFontSize = parseInt(InitFontSize); //获取的是字符串，这里需要转换为整型
	if ( !InitFontSize ) { //如果不存在则赋初始值
		InitFontSize = 14;
	}
	Dom.fiction_container.css('font-size', InitFontSize);
	console.log(InitFontSize + '字号');


	// 是否夜间模式
	var NightNode = false;

	//字体和背景的颜色表
	var colorArr = [{
		value: '#f7eee5',
		name: '米白',
		fontColor: '',
		id: 'font_mb'
	}, {
		value: '#e9dfc7',
		name: '纸张',
		font: '',
		id: 'font_normal'
	}, {
		value: '#a4a4a4',
		name: '浅灰',
		fontColor: '',
		id: 'font_qh'
	}, {
		value: '#cdefce',
		name: '护眼',
		fontColor: '',
		id: 'font_hy'
	}, {
		value: '#283548',
		name: '灰蓝',
		fontColor: '#7685a2',
		id: 'font_hl'
	}, {
		value: '#0f1410',
		name: '夜间',
		fontColor: '#4e534f',
		id: "font_night"
	}];
	// 循环插入背景色设置圆圈
	for (var i = 0, colorArrLength = colorArr.length; i < colorArrLength; i++) {
		Dom.bk_container.append('<div class="bk-container" id="' + colorArr[i].id + '"' + 'data-font-color="' + colorArr[i].fontColor + '"' + 'data-bg-color="' + colorArr[i].value + '"' + 'style="background-color:' + colorArr[i].value + '"><span style="display:none;">' + colorArr[i].name + '</span></div>');
	}

	var b_color = Util.StorageGetter('bg_color'); // 获取存储的背景颜色
	var f_color = Util.StorageGetter('font_color'); // 获取存储的字体颜色

	if ( b_color ) {
		Body.css('background-color', b_color);
	}
	if ( f_color ) {
		Dom.fiction_container.css('color', f_color);
	}




	function main() {
		// 入口函数
		var readerModel = ReaderModel();
		readerModel.init();
		EventHanlder();
	}

	function ReaderModel() {
		// todo 实现数据交互

		var Chapter_id;
		var init = function(){
			getFictionInfo(function(){
				getCurChapterContent(Chapter_id, function(){

				});
			});
		};
		// 获取章节信息
		var getFictionInfo = function(callback) {
			$.get('data/chapter.json', function(data){
				// 获取章节信息后做什么
				Chapter_id = data.chapters[1].chapter_id;
				if (callback) {
					callback();
				} // 等同于callback && callback();
			}, 'json');
		};

		// 获取当前章节内容
		var getCurChapterContent = function(chapter_id, data, callback) {
			$.get('data/data' + Chapter_id + '.json', function(data){
				// 判断状态结果
				if ( data.result === 0 ) { // 项目约定 data.result === 0 表示成功
					var data_url = data.jsonp;
					Util.GetJsonp(data_url, function(data){
						if (callback) {
							callback(data);
						} // 等同于callback && callback(data);
					});
				}
			}, 'json');
		};

		return {
			init: init
		};
	}

	function ReaderBaseFrame() {
		// todo 实现UI结构或交互
	}

	function EventHanlder() {
		// todo 绑定事件交互
		// 点击中间区域显示顶部和底部
		$('#action_mid').click(function(){
			if ( Dom.top_nav.css('display') == 'none' && Dom.bottom_nav.css('display') == 'none' ) {
				Dom.top_nav.show();
				Dom.bottom_nav.show();
			} else {
				Dom.top_nav.hide();
				Dom.bottom_nav.hide();
				Dom.font_container.hide();
				Dom.font_button.removeClass('current');
			}
		});
		// 滚动隐藏顶部和底部
		Win.scroll(function(){
			Dom.top_nav.hide();
			Dom.bottom_nav.hide();
			Dom.font_container.hide();
			Dom.font_button.removeClass('current');
		});


		// 字体背景设置界面显示
		Dom.font_button.click(function(){
			$(this).toggleClass('current');
			if ( Dom.font_container.css('display') == 'none' ) {
				Dom.font_container.show();
			} else {
				Dom.font_container.hide();
			}
		});

		// 字号放大
		$('#large_font').click(function(){
			if ( InitFontSize >= 20 ) {
				return;
			}
			InitFontSize += 1;
			Dom.fiction_container.css('font-size', InitFontSize);

			Util.StorageSetter('font_size', InitFontSize);
		});
		// 字号缩小
		$('#small_font').click(function(){
			console.log(InitFontSize);
			if ( InitFontSize <= 14 ) {
				return;
			}
			InitFontSize -= 1;
			Dom.fiction_container.css('font-size', InitFontSize);
			Util.StorageSetter('font_size', InitFontSize);
		});


		// 背景切换
		Dom.bk_container.delegate('.bk-container', 'click', function(){
			var font_color = $(this).data('font-color');
			var bg_color = $(this).data('bg-color');

			$(this).siblings().removeClass('current');
			$(this).addClass('current');

			if (!font_color) {
				font_color = '#000';
			}

			$('body').css('background-color', bg_color);
			$('.m-read-content').css('color', font_color);

			//设置背景/字体颜色localStorage
			Util.StorageSetter('font_color', font_color);
			Util.StorageSetter('bg_color', bg_color);

			// 夜间模式
			if ( font_color == '#4e534f' ) {
				NightNode = true;
				$('#day_icon').show();
				$('#night_icon').hide();
			} else {
				NightNode = false;
				$('#day_icon').hide();
				$('#night_icon').show();
			}
		});


		// 白天/夜晚
		Dom.night_button.click(function(){
			//console.log('ddd');
			if ( NightNode ) {
				$('#day_icon').hide();
				$('#night_icon').show();
				$('#font_normal').trigger('click');
				NightNode = false;
			} else {
				$('#day_icon').show();
				$('#night_icon').hide();
				$('#font_night').trigger('click');
				NightNode = true;
			}
		});


	}

	// 调用入口函数
	main();

})();
