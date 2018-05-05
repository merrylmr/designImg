import Vue from 'vue'
import $ from 'jquery';
var dispatch = new Vue()
var textUrl = '/editor/getMaterial4/query/t-99-p-1.html';
var elementurl = {
	//我的素材
	'myel': '/editor/getUserMaterial4/query/s-101-p-1.html',
	'groupel': '/editor/getUserMaterial4/query/s-102-t-1-p-1.html',
	'groupLogo': '/editor/getUserMaterial4/query/s-103-t-1-p-1.html',
	'coopEl':'/editorApi/v1/main/material-list',
	// 节假日素材（unique）
	'holiday': '/editor/getMaterial4/query/t-50-c--p-1.html',
	//容器
	'contain': '/editor/getMaterial4/query/t-11-c--p-1.html', //t-1-c-''-p-
	//形状
	'shape': '/editor/getMaterial4/query/t-1-c--p-1.html',
	//元素
	'element': '/editor/getMaterial4/query/t-2-c--p-1.html',
	//标志
	'sign': '/editor/getMaterial4/query/t-3-c--p-1.html',
	//花纹
	'grain': '/editor/getMaterial4/query/t-4-c--p-1.html',
	//图片
	'pic': '/editor/getMaterial4/query/t-5-c--p-1.html',
	//条幅
	'scroll': '/editor/getMaterial4/query/t-6-c--p-1.html',
	//图标
	'icon': '/editor/getMaterial4/query/t-7-c--p-1.html',
	//插图
	'ai': '/editor/getMaterial4/query/t-8-c--p-1.html',
	//免扣素材
	'ps': '/editor/getMaterial4/query/t-12-c--p-1.html',
	//线条
	'line': '/editor/getMaterial4/query/t-13-c--p-1.html',
	//箭头
	'arrow': '/editor/getMaterial4/query/t-14-c--p-1.html',
	//表格
	'table': '/editor/getMaterial4/query/t-15-c--p-1.html',
};
var foldUrl = '/editor/getMemberGoodsFolder.html';
var backgroundUrl = '/editor/getMaterial4/query/t-98-p-1.html';
var searchUrl = '/editor/getMaterial4/query/k-key-p-1.html'
var socketConnect = '/api/connection/create?tpl_id=0&tpl_mode=3&user_id=0&user_mode=0';
var favMaterial = '/editor/saveMaterial.html';
var uploadedFileUrl = '/editor/getUserMaterial4/query/s-8-p-1.html';
//请求印刷地址
var printUrl = '/editorApi/member/submit-print';
// 请求分享地址
var shareUrl = '/editorApi/member/get-share-url';

dispatch.getSocketConnectId = function (func) {
	var url = socketConnect;
	this.$http.get(url).then(function (data) {
		func(data);
	})
}
dispatch.getTextList = function (page, func) {
	var url = textUrl.replace(/p-\d*/, 'p-' + page);
	this.$http.get(url).then(function (data) {
		if (data.data.length > 0) {
			loadImage(data.data).done(function (data) {
				func(data)
			})
		} else {
			func(data.data)
		}
	})
}
dispatch.getElementList = function (type, cate, times, func, id) {
	//商户自定义素材
	if(type=="coopEl"){
		var url = elementurl[type];
		this.$http.post(url, {
			coop_id: id,
			page:times+1
		})
		.then(function (data) {
			if (data.data.data.length > 0) {
				loadImage(data.data.data).done(function (val) {
					func(val)
				})
			} else {
				func(data.data)
			}
		})
		return;
	}
	//
	if (type == "search") {
		this.getSearchData(cate, times, func)
		return;
	}
	if (id) {
		var url = elementurl[type].replace(/t-\d*/, 't-' + id).replace(/c-\w*/, 'c-' + cate).replace(/p-\d*/, 'p-' + (times + 1));
	} else {
		if (type == 'line') {
			type = "arrow"
		}
		var url = elementurl[type].replace(/c-\w*/, 'c-' + cate).replace(/p-\d*/, 'p-' + (times + 1));
	}
	if (type == "table") {
		func([]);
		return
	}

	this.$http.get(url).then(function (data) {
		if (data.data.length > 0) {
			loadImage(data.data).done(function (data) {
				func(data)
			})
		} else {
			func(data.data)
		}
	})
}
//线条
dispatch.getLineData = function (func) {
	var url = elementurl.line
	this.$http.get(url).then(function (data) {
		if (data.data.length > 0) {
			for (var i = 0; i < data.data.length; i++) {
				var width = parseFloat(data.data[i].width),
					height = parseFloat(data.data[i].height);
				data.data[i].owidth = 263;
				data.data[i].oheight = 20 + 263 * height / width;
			};
			func(data.data)
		} else {
			func(data.data)
		}
	})
}
//表格
dispatch.getTableData = function (func) {
	var url = elementurl.table
	this.$http.get(url).then(function (data) {
		if (data.data.length > 0) {
			loadImage(data.data).done(function (data) {
				func(data)
			})
		} else {
			func(data.data)
		}
	})
}
dispatch.getBgList = function (page, func) {
	var url = backgroundUrl.replace(/p-\d*/, 'p-' + page);
	this.$http.get(url).then(function (data) {
		if (data.data.length > 0) {
			loadImage(data.data).done(function (data) {
				func(data)
			})
		} else {
			func(data.data)
		}
	})
}
//获取用户文件夹
dispatch.getFolder = function (func) {
	this.$http.get(foldUrl).then(function (data) {
		func(data.data)
	})
}
/*获取搜索列表数据
 *value 搜索关键字
 *page  请求的页数
 */
dispatch.getSearchData = function (keyword, page, func) {
	var url = searchUrl.replace(/k-\w*-p/, 'k-' + keyword + '-p').replace(/p-\d*/, 'p-' + page);
	this.$http.get(url).then(function (data) {
		if (data.data.length > 0) {
			loadImage(data.data).done(function (data) {
				func(data)
			})
		} else {
			func(data.data)
		}

	})
}
// 添加到素材
dispatch.favMaterial = function (data, func) {
	// this.$http.options.emulateJSON = false;
	// this.$http.post(favMaterial,data).then(function(data){
	// 	func(data.data)
	// })
	$.ajax({
		type: "POST",
		dataType: "json",
		url: favMaterial,
		data: data,
		success: function (data) {
			func(data)
		}
	})
}
//获取用户已上传的文件
dispatch.getUploadedFile = function (func) {
	this.$http.get(uploadedFileUrl).then(function (data) {
		if (data.data.length > 0) {
			loadImage(data.data).done(function (data) {
				func(data)
			})
		} else {
			func(data.data)
		}
	})
}
dispatch.getPrintUrl = function (func) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: printUrl,
		async: false,
		success: function (data) {
			func(data)
		}
	})
}

dispatch.getShareUrl = function (func, id) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: shareUrl,
		data: {
			tpl_id: id
		},
		success: function (data) {
			func(data)
		}
	})
}
dispatch.getPrintUrl = function (func, id) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: printUrl,
		data: {
			tpl_id: id
		},
		success: function (data) {
			func(data)
		}
	})
}
//模板（source）
dispatch.getRelatedTemplate = (type, func) => {
	$.get('/editorApi/v1/template/template-product-list', {
		product: type
	}, (data) => {
		func(data)
	})
}
dispatch.getFavTemplate = (page, func) => {
	$.get('/editorApi/v1/favorite/list-favorite', {
		page
	}, (data) => {
		func(data)
	})
}
dispatch.getTemplateDetail = (id, func) => {
	$.get('/editorApi/v1/template/template-product-info', {
		id
	}, (data) => {
		func(data)
	})
}
dispatch.getTags = function (payload) {
	var url = '/editorApi/v1/template/product-list/';
	this.$http.post(url, {
		tpl_id: payload.tpl_id
	}).then(function (data) {
		payload.success(data.data.data)
	})
}
// 获取组合瀑布流类数据
dispatch.getWaterfallData = function ({
	url,
	page,
	type
}) {
	return this.$http.post(url, {
		page,
		type
	}, {
		emulateJSON: true
	})
}
// 获取互动瀑布流类数据
dispatch.getActionData = function ({
	url,
	page
}) {
	var _url = url.replace(/p-\d*/, 'p-' + page);
	return this.$http.post(_url)
}


//图片预加载
function loadImage(data) {
	//预加载开始
	var imgObj = [],
		err = [],
		loadnum = 0;
	var cbic = function () {};
	for (let i in data) {
		imgObj[i] = new Image();
		imgObj[i].onload = function () {
			data[i].width = imgObj[i].width;
			data[i].height = imgObj[i].height;
			data[i].owidth = 84;
			data[i].oheight = imgObj[i].height * 84 / imgObj[i].width + 4;
			if (data[i].oheight < 20) {
				data[i].oheight = 20;
			}
			loadpost();
		}
		imgObj[i].onerror = function (e) {
			data[i].err = 1;
			loadpost();
		}
		imgObj[i].src = data[i].url;
	}

	function loadpost() {
		loadnum++;
		if (loadnum == data.length) {
			var _data = data.filter(item => {
				return !item.err
			})
			cbic(_data)
		}
	}
	return {
		done: function (func) {
			cbic = func || cbic
		}
	}
}

export default dispatch


// WEBPACK FOOTER //
// ./src/common/dispatch.js