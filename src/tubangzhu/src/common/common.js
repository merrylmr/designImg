import $ from 'jquery'
import Vue from 'vue'
var comm = {
    vue: null,
    getImageURL(sourceURL, type) {
        /*let format = sourceURL.split('.');
        return sourceURL + '.w' + type + '.' + format[format.length - 1];*/
        return sourceURL + "?x-oss-process=style/thumb" + type;
    },
    setCookie(name, val, day) {
        var exp = new Date();
        exp.setDate(exp.getDate() + day);
        document.cookie = name + "=" + encodeURI(val) + ";expires=" + exp.toGMTString() + '; path=/';
    },
    getCookie(name) {
        var arr,
            reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return decodeURI(arr[2]);
        else
            return null;
    },
    //保留小数
    fixNumber(num, fix) {
        return parseFloat(num.toFixed(fix));
    },
    //根据id列表对对象进行重新排序
    sortArrayByList(array, list) {

        var tempArr = [];
        for (var i in list) {
            for (var a in array) {
                if (array[a].id == list[i]) {
                    tempArr.push(array[a]);
                    break;
                }
            }
        }
        return tempArr;
    },
    //上传文件
    uploadFile(params) {
        let defaultParams = {
            url: params.url || '',
            min: params.min || 0,
            max: params.max || 1 * 1024 * 1024,
            success: params.success || null,
            error: params.error || null,
            process: params.process || null,
        }
        //判断是否登录
        if (comm.vue.$store.state.editor.loginMode != 'c_logged' && comm.vue.$store.state.editor.loginMode != 'logged') {
            defaultParams.error({
                code: 'no-login',
                message: '请登录后上传'
            });
            return;
        }
        //创建临时的upload组件
        let temp_id = 'temp_upload_' + comm.getNewID();
        $('#app').append(`<form id="${temp_id}"><input type="file"/></form>`)
        var xhrOnProgress = function (fun) {
            xhrOnProgress.onprogress = fun; //绑定监听
            //使用闭包实现监听绑
            return function () {
                //通过$.ajaxSettings.xhr();获得XMLHttpRequest对象
                var xhr = $.ajaxSettings.xhr();
                //判断监听函数是否为函数
                if (typeof xhrOnProgress.onprogress !== 'function')
                    return xhr;
                //如果有监听函数并且xhr对象支持绑定时就把监听函数绑定上去
                if (xhrOnProgress.onprogress && xhr.upload) {
                    xhr.upload.onprogress = xhrOnProgress.onprogress;
                }
                return xhr;
            }
        }
        //注册file的change事件
        $('#' + temp_id + ' input').on("change", () => {

            var file = $('#' + temp_id + ' input')[0];
            if (file.size < defaultParams.max) {
                let formData = new FormData();

                formData.append('file', file.files[0]);
                formData.append('name', file.files[0].name);
                $.ajax({
                    url: params.url,
                    type: "POST",
                    data: formData,
                    dataType: 'json',
                    async: true,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        if (data.code == -1) {
                            defaultParams.success(data)
                        } else {
                            defaultParams.error(data)
                        }

                        $('#' + temp_id).remove();
                    },
                    error: function (data) {
                        defaultParams.error(data)
                        $('#' + temp_id).remove();
                    },
                    xhr: xhrOnProgress(function (e) {
                        var percent = e.loaded / e.total;
                        if (defaultParams.process != null) {
                            defaultParams.process(percent);
                        }

                    })

                });
            } else {
                // 分块上传
                let unitSize = defaultParams.max,
                    loadedData = 0,
                    total = Math.ceil(file.size / unitSize);
                var i = 0;
                chunkAjax(i);

                function chunkAjax(i) {
                    var start = i * unitSize,
                        end = Math.min(file.size, start + unitSize);
                    var form = new FormData();
                    form.append("file", file.slice(start, end));
                    form.append("name", file.name);
                    form.append("chunk", i); //当前是第几片（坑死我了）
                    form.append("chunks", total); //总片数
                    $.ajax({
                        url: params.url,
                        type: "POST",
                        data: form,
                        dataType: "json",
                        async: true,
                        processData: false,
                        contentType: false,
                        success: function (data) {
                            i++;
                            if (i < total) {
                                chunkAjax(i);
                                defaultParams.process(i / total)
                            } else {
                                defaultParams.success(data)
                                $('#' + temp_id).remove();
                            }
                        },
                        error: function (data) {
                            defaultParams.error(data)
                            $('#' + temp_id).remove();
                        }
                    });
                }
            }

        });
        //唤起上传窗口
        $('#' + temp_id + ' input')[0].click();
    },
    getDivtext: function (node) {
        if (document.body.createTextRange) {
            var range = document
                .body
                .createTextRange();
            range.moveToElementText(node);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    },
    stringifyDom: function (dom) {
        var serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    },
    //在数组内搜索指定属性,的值,并返回数组成员对象
    findArrayIndex: function (arr, name, val) {
        //console.log('在', arr, '搜索', name, '为', val);
        for (var i = 0; i < arr.length; i++) {
            //console.log('对比', arr[i][name], '与', val);
            if (arr[i][name] == val) {
                return i;
            }
        }
        return -1;
    },
    //创建随机请求ID
    getNewID() {

        var len = 10;
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
        var maxPos = chars.length;
        var pwd = '';
        for (var i = 0; i < len; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },
    getBoundBox: function (selectData, editData) {
        var bbox = {};
        if (selectData.length == 1) { //选中一个
            var options = editData[selectData[0]].options,
                rectState = $('.canvas')[0].getBoundingClientRect();

            bbox.width = options.width;
            bbox.height = options.height;
            bbox.left = options.left + rectState.left;
            bbox.top = options.top + rectState.top;
            bbox.rotate = options.rotate;
        } else { //多选
            var rects = [],
                l = [],
                t = [],
                r = [],
                b = [];
            selectData.forEach(function (index) {
                rects.push($('.canvas').find('.svg-son').eq(index)[0].getBoundingClientRect());
            })
            rects.forEach(function (rect) {
                l.push(rect.left);
                t.push(rect.top);
                r.push(rect.right);
                b.push(rect.bottom);
            })
            bbox.left = Math
                .min
                .apply(null, l);
            bbox.top = Math
                .min
                .apply(null, t);
            bbox.right = Math
                .max
                .apply(null, r);
            bbox.bottom = Math
                .max
                .apply(null, b);
            bbox.height = bbox.bottom - bbox.top;
            bbox.width = bbox.right - bbox.left;
            bbox.rotate = 0;
        }
        return bbox;
    },
    //交换数组元素(主要用于图层操作)
    swapArrayItems: function (arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    },
    //转换hsl到rgb
    hslToRgb: function (h, s, l) {
        var r,
            g,
            b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ?
                l * (1 + s) :
                l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [
            r * 255,
            g * 255,
            b * 255
        ];
    },
    //rgb转hex
    rgbToHex: function (r, g, b) {
        var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1);
        return hex;
    },
    //hex转rgb
    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ] :
            null;
    },
    //rgb转hsl
    rgbToHsl(r, g, b) {
        r /= 255,
            g /= 255,
            b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h,
            s,
            l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ?
                d / (2 - max - min) :
                d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ?
                        6 :
                        0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    },
    //约等于 num1 浮动值,num2固定值 range 浮动范围
    approximate(num1, num2, range) {

        for (var i = 0; i < range; i++) {

            if (num1 + i == num2) {

                return true;
            }
            if (num1 - i == num2) {
                return true;
            }
        }

        return false;
    },
    //转换font-Family到a1 12..
    getFontFamilyName: function (font) {
        //转换为小写
        font = font.toLowerCase();
        font = font.replace(new RegExp("'", 'gm'), '');
        var _exFamily = [
            "microsoftyahei",
            "fzltcxhjw--gb1-0",
            "fzlthjw--gb1-0",
            "fzltchjw--gb1-0",
            "lisu",
            "fzdhtjw--gb1-0",
            "fzbsjw--gb1-0",
            "fzbwksjw--gb1-0",
            "fzxkjw--gb1-0",
            "fzkatjw--gb1-0",
            "fzktjw--gb1-0",
            "fzlbjw--gb1-0",
            "fzlsjw--gb1-0",
            "fzqtjw--gb1-0",
            "fzssjw--gb1-0",
            "fzstjw--gb1-0",
            "fzwbjw--gb1-0",
            "fzxshjw--gb1-0",
            "fzy4jw--gb1-0",
            "fzy3jw--gb1-0",
            "fzy1jw--gb1-0",
            "fzxbsjw--gb1-0",
            "fzzzhongjw--gb1-0",
            "fzzhjw--gb1-0",
            "fzcqjw--gb1-0",
            "fzzyjw--gb1-0",
            "arialmt",
            "bookmanoldstyle",
            "dorovarflf-carolus",
            "century",
            "compactabt-bold",
            "copperplategothicbt-roman",
            "creampuff",
            "diskusd-medi",
            "embassybt-regular",
            "engraversgothicbt-regular"
        ];
        var _cssFamily = [
            "a1",
            "a9",
            "a25",
            "a26",
            "a2",
            "a3",
            "a4",
            "a5",
            "a6",
            "a7",
            "a8",
            "a10",
            "a11",
            "a12",
            "a13",
            "a14",
            "a15",
            "a16",
            "a17",
            "a18",
            "a19",
            "a20",
            "a21",
            "a22",
            "a23",
            "a24",
            "c1",
            "c2",
            "c3",
            "c4",
            "c7",
            "c8",
            "c9",
            "c10",
            "c11",
            "c12"
        ];
        for (var i = 0; i < _exFamily.length; i++) {
            if (font == _exFamily[i]) {
                return _cssFamily[i]
            }
        }
        console.warn('转换fontFamily失败,无法找到字体:', font);
    },
    //pt转px @ptnum:pt数
    "pt2px": function (ptnum, userDPI, tplDPI) {
        //userDPI[0] = 72;
        var px = ptnum * userDPI[0] / 72 * (tplDPI / userDPI[0]);
        console.log('pt2px', 'px', ptnum, 'userDPI', userDPI, 'tplDPI', tplDPI)
        return Math.round(px);
    },
    //px转pt @pxnum:px数
    "px2pt": function (pxnum, userDPI, tplDPI) {
        var pt = pxnum / userDPI[0] * 72 * (userDPI[0] / tplDPI);
        return Math.round(pt);
    },
    //格式化elementObject
    "formatElementData": function (eleArr, docEditConfig) {

        for (var i = 0; i < eleArr.length; i++) {
            eleArr[i] = this.formatElement(eleArr[i], docEditConfig);
        }
        return eleArr;
    },
    "formatElement": function (item, docEditConfig) {
        //转换edit_config
        item.index = this.int(item.index);
        item.edit_config.flipX = this.bool(item.edit_config.flipX);
        item.edit_config.flipY = this.bool(item.edit_config.flipY);
        item.edit_config.lock = this.bool(item.edit_config.lock);
        item.edit_config.visible = true;
        item.edit_config.height = this.float(item.edit_config.height);
        item.edit_config.left = this.float(item.edit_config.left);
        item.edit_config.height = this.float(item.edit_config.height);
        item.edit_config.left = this.float(item.edit_config.left);
        item.edit_config.opacity = this.float(item.edit_config.opacity);
        item.edit_config.originalHeight = this.float(item.edit_config.originalHeight);
        item.edit_config.originalWidth = this.float(item.edit_config.originalWidth);
        item.edit_config.rotateX = this.float(item.edit_config.rotateX);
        item.edit_config.rotateY = this.float(item.edit_config.rotateY);
        item.edit_config.rotation = this.float(item.edit_config.rotation);
        item.edit_config.top = this.float(item.edit_config.top);
        item.edit_config.width = this.float(item.edit_config.width);
        item.edit_config.index = this.int(item.edit_config.index);
        if (item.edit_config.style == undefined) {
            if (docEditConfig.unit == 'mm') {
                item.edit_config.style = {
                    shadow: {
                        use: false,
                        opacity: 40,
                        distance: 2,
                        strength: 5
                    }
                }
            } else {
                item.edit_config.style = {
                    shadow: {
                        use: false,
                        opacity: 40,
                        distance: 2,
                        strength: 2
                    }
                }
            }

        } else {
            item.edit_config.style.shadow.use = this.bool(item.edit_config.style.shadow.use);
            item.edit_config.style.shadow.opacity = this.float(item.edit_config.style.shadow.opacity);
            item.edit_config.style.shadow.distance = this.float(item.edit_config.style.shadow.distance);
            item.edit_config.style.shadow.strength = this.float(item.edit_config.style.shadow.strength);
        }
        //转换edit_data(不同类型进行不同转换)

        switch (item.type) {
            case 'svg':
                //处理svg保存时带ai原始数据问题
                if (item.edit_data.svg.indexOf('i:extraneous="self"') != -1) {

                    var $svg = $(item.edit_data.svg);
                    var newSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3' +
                        '.org/1999/xlink" width="' + $svg.attr('width') + '" height="' + $svg.attr('height') + '" viewBox="' + $svg.attr('viewBox') + '">' + $svg
                        .find('switch g')
                        .html() + '</svg>';
                    item.edit_data.svg = newSvg;
                }
                break;
            case 'image':
                item.edit_data.clip.left = this.float(item.edit_data.clip.left);
                item.edit_data.clip.top = this.float(item.edit_data.clip.top);
                item.edit_data.clip.width = this.float(item.edit_data.clip.width);
                item.edit_data.clip.height = this.float(item.edit_data.clip.height);
                if (item.edit_data.radius == undefined) {
                    item.edit_data.radius = 0
                }
                break;
            case 'container':

                for (var b in item.edit_data.clipImg) {
                    item.edit_data.clipImg[b].width = this.float(item.edit_data.clipImg[b].width);
                    item.edit_data.clipImg[b].height = this.float(item.edit_data.clipImg[b].height);
                    item.edit_data.clipImg[b].rotation = this.float(item.edit_data.clipImg[b].rotation);
                    item.edit_data.clipImg[b].rotateX = this.float(item.edit_data.clipImg[b].rotateX);
                    item.edit_data.clipImg[b].rotateY = this.float(item.edit_data.clipImg[b].rotateY);
                    item.edit_data.clipImg[b].left = this.float(item.edit_data.clipImg[b].left);
                    item.edit_data.clipImg[b].top = this.float(item.edit_data.clipImg[b].top);
                }

                if (item.edit_data.color == undefined) {
                    var colorObjArr = [];
                    var $svgData = $(item.edit_data.svg);
                    $svgData
                        .find('*[fill]')
                        .each(function () {
                            //查找父级,一直到顶层,查找ID是否有NO的
                            var $parentNode = $(this);
                            var ignoreColor = false;
                            while ($parentNode.get(0).nodeName != 'svg') {
                                $parentNode = $parentNode.parent();
                                if ($parentNode.length == 0) {
                                    break;
                                }
                                if ($parentNode.attr('id') == 'NO') {
                                    ignoreColor = true;
                                    $(this).attr('data-ignoreColor', '');
                                }
                            }
                            if (ignoreColor == false) {
                                //获取当前dom填充色
                                var fill = $(this).attr('fill');
                                //判断是否是过渡色
                                if (fill.indexOf('url') == -1 && fill.indexOf('#') != -1) {
                                    //判断是否已存在
                                    var find = false;
                                    for (var i = 0; i < colorObjArr.length; i++) {
                                        if (fill == colorObjArr[i].oldColor) {
                                            find = true;
                                            break;
                                        }
                                    }
                                    if (find == false) {
                                        colorObjArr.push({
                                            oldColor: fill,
                                            newColor: fill
                                        })
                                    }
                                }
                            }
                        });

                    //分析svg内的所有stroke属性
                    $svgData
                        .find('*[stroke]')
                        .each(function () {
                            //查找父级,一直到顶层,查找ID是否有NO的
                            var $parentNode = $(this);
                            var ignoreColor = false;
                            while ($parentNode.get(0).nodeName != 'svg') {
                                $parentNode = $parentNode.parent();
                                if ($parentNode.length == 0) {
                                    break;
                                }
                                if ($parentNode.attr('id') == 'NO') {
                                    ignoreColor = true;
                                    $(this).attr('data-ignoreColor', '');
                                }
                            }
                            if (ignoreColor == false) {
                                //获取当前dom填充色
                                var fill = $(this).attr('stroke');
                                //判断是否是过渡色
                                if (fill.indexOf('url') == -1 && fill.indexOf('#') != -1) {
                                    //判断是否已存在
                                    var find = false;
                                    for (var i = 0; i < colorObjArr.length; i++) {
                                        if (fill == colorObjArr[i].oldColor) {
                                            find = true;
                                            break;
                                        }
                                    }
                                    if (find == false) {
                                        colorObjArr.push({
                                            oldColor: fill,
                                            newColor: fill
                                        })
                                    }
                                }
                            }
                        });

                    item.edit_data.color = colorObjArr;
                }
                if (item.edit_data.filter == undefined) {
                    item.edit_data.filter = {
                        //亮度
                        bright: 0,
                        //对比度
                        contrast: 0,
                        //饱和度
                        saturation: 0,
                        //色相
                        hue: 0,
                        //模糊
                        blur: 0,
                        //负片冲印
                        film: 0
                    };
                }
                //item.edit_data.loading=false

                break;
            case 'groupText':
                for (var a = 0; a < item.edit_data.text.length; a++) {
                    var textItem = item.edit_data.text[a];

                    textItem.boxRect.left = this.float(textItem.boxRect.left);
                    textItem.boxRect.top = this.float(textItem.boxRect.top);
                    textItem.boxRect.width = this.float(textItem.boxRect.width);
                    textItem.boxRect.height = this.float(textItem.boxRect.height);
                    textItem.fontSize = this.float(textItem.fontSize);
                    textItem.id = this.float(textItem.id);

                    textItem.resultRect.left = this.float(textItem.resultRect.left);
                    textItem.resultRect.top = this.float(textItem.resultRect.top);

                    textItem.resultRect.width = this.float(textItem.resultRect.width);
                    textItem.resultRect.height = this.float(textItem.resultRect.height);

                }
                item.addSnap = true;
            case 'grid':
                item.edit_data.scaleH = this.bool(item.edit_data.scaleH);
                item.edit_data.scaleV = this.bool(item.edit_data.scaleV);
                break;
            case 'text':
                item.addSnap = true;
                if (item.edit_data.editAreaWidth == undefined) {
                    item.edit_data.editAreaWidth = parseFloat($(item.edit_data.svg).attr('width')) + 50;
                }
                if (item.edit_data.textJson) {
                    for (var line = 0; line < item.edit_data.textJson.length; line++) {
                        item.edit_data.textJson[line].lineHeight = this.float(item.edit_data.textJson[line].lineHeight);
                        for (var char = 0; char < item.edit_data.textJson[line].text.length; char++) {
                            item.edit_data.textJson[line].text[char].letterSpacing = this.float(item.edit_data.textJson[line].text[char].letterSpacing);

                            if (item.edit_data.textJson[line].text[char].bold == undefined) {
                                item.edit_data.textJson[line].text[char].bold = 0
                            } else {
                                item.edit_data.textJson[line].text[char].bold = this.bool(item.edit_data.textJson[line].text[char].bold)
                            }

                            if (item.edit_data.textJson[line].text[char].underline == undefined) {
                                item.edit_data.textJson[line].text[char].underline = 0
                            } else {
                                item.edit_data.textJson[line].text[char].underline = this.bool(item.edit_data.textJson[line].text[char].underline)
                            }
                        }
                    }
                }
                if (item.edit_data.radian != undefined) {
                    delete item.edit_data.radian;
                }
                if (item.edit_data.textRadian == undefined) {
                    item.edit_data.textRadian = 0
                    item.edit_data.textRadianLetterSpacing = 100;
                }
                if (item.edit_data.editAreaWidth == undefined) {
                    var addWidth = 50;
                    if (docEditConfig.unit == "mm") {
                        //毫米

                        addWidth = docEditConfig.width;
                    }
                    item.edit_data.editAreaWidth = item.edit_config.width + addWidth;
                }
                break;
            case 'interaction':
                //2018/1/17 后新增inputText颜色,兼容旧文件
                if (item.edit_data.module == 'form' && item.edit_data.data.color.inputText == undefined) {
                    item.edit_data.data.color.inputText = item.edit_data.data.color.text;
                }
                break;
        }
        return item;
    },
    //文本转换布尔值
    "bool": function (str) {

        if (typeof str == 'boolean') {
            return str;
        }
        if (str == 'true') {
            return true;
        } else if (str == 'false') {
            return false;
        } else if (str == '1') {
            return true;
        } else if (str == '0') {
            return false;
        }
    },
    //文本转换数值
    'float': function (str) {

        if (typeof str == 'number') {
            return str;
        }
        return parseFloat(str)
    },
    //文本转数值
    'int': function (str) {

        if (typeof str == 'number') {
            return str;
        }
        return parseInt(str)
    },
    //字符串去掉html标签，将粘贴入的\t替换为1个空格，并对换行符进行统一处理 @type:加解密类型 @str:待处理字符串
    "processStr": function (type, str) {
        str = str.replace(/\n+$|<br\s*\/?>+$/g, ""); //去掉末尾的换行符
        var _split = "<br>";
        if (type == "e") {
            //将&amp;替换成&
            str = str.replace(/&amp;/g, "&");
            //将&gt;替换成>
            str = str.replace(/&gt;/g, ">");
            //将&lt;替换成<
            str = str.replace(/&lt;/g, "<");
            var _reg = /<div[^>]*?>/gi;
            if (str.search(_reg) != -1) {
                str = str
                    .replace(_reg, '')
                    .replace(/<\/div>/gi, "\n")
                    .replace(/\t/g, "    ")
                    .replace(/<br\s*\/?>/gi, "\n");
            } else {
                str = str
                    .replace(/\t/g, "    ")
                    .replace(/<br\s*\/?>/gi, "\n");
            }
            //去掉所有html标签
            str = str.replace(/<[^><]+>/g, "");
            //再将临时\n换行符转换为统一的<br>
            str = str.replace(/\n/g, _split);
            return str;
        } else if (type == "d") { //老版统一换行符转为新的统一的<br>
            return str.replace(/@@##@&&@@/gi, "<br>");
        } else {
            return str;
        }
        return str;
    },
    //鼠标是否经过box
    'mouseoverBox': function (x, y, box) {
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
            return true;
        } else {
            return false;
        }
    },
    //获取滤镜文本
    'getFilterHtml': function (item) {
        var filterString = '';
        //饱和度
        if (item.saturation != 0) {
            var i = (item.saturation / 100) + 1;
            filterString = filterString + '<feColorMatrix in="SourceGraphic" type="saturate" values="' + i + '"></feColorMatrix>';
        }
        //亮度-0.5 - 0.5
        if (item.bright != 0) {
            var value = (item.bright * 0.5) / 100;
            filterString = filterString + '<feComponentTransfer><feFuncR type="linear" intercept="' + value + '" slope="1"/><feFuncG type="linear" intercept="' + value + '" slope="1"/><feFuncB type="linear" intercept="' + value + '" slope="1"/></feComponentTransfer>'
        }
        //对比度0.4-2
        if (item.contrast != 0) {
            var value = (item.contrast * (item.contrast > 1 ?
                1 / 0.6 :
                1) + 100) / 100;
            var value2 = -(0.5 * value) + 0.5;
            filterString = filterString + '<feComponentTransfer color-interpolation-filters="sRGB"><feFuncR type="linear" s' +
                'lope="' + value + '" intercept="' + value2 + '"></feFuncR><feFuncG type="linear" slope="' + value + '" intercept="' + value2 + '"></feFuncG><feFuncB type="linear" slope="' + value + '" intercept="' + value2 + '"></feFuncB></feComponentTransfer>'
        }

        //模糊
        if (item.blur != 0) {
            if (item.blur > 0) {
                //模糊
                filterString = filterString + '<feGaussianBlur stdDeviation="' + (item.blur) + '" class="blur"></feGaussianBlur>';
            } else {
                //锐化
                var e = item.blur;
                e *= -1;
                e = e / 100 * 4;
                e = [
                    0, -e,
                    0, -e,
                    4 * e + 1, -e,
                    0, -e,
                    0
                ];
                filterString = filterString + '<feConvolveMatrix order="3" kernelMatrix="' + e.join(' ') + '" class="sharpen"></feConvolveMatrix>';
            }
        }

        //色调
        if (item.hue != 0) {
            function r(t) {
                t = t - (200 / 7);
                if (0 > t) {
                    t = 200 + t;
                }
                t = n(360 * t / 200, 100, 50);
                return {
                    color: {
                        r: t[0],
                        g: t[1],
                        b: t[2]
                    },
                    Dm: 7
                };
            }

            function n(t, e, r) {
                t = t / 360;
                e = e / 100;
                r = r / 100;
                if (0 == e) {
                    r = e = t = r;
                } else {
                    if (0.5 > r) {
                        n = r * (1 + e)
                    } else {
                        n = r + e - r * e
                    }
                    var s = 2 * r - n;
                    r = i(s, n, t + 1 / 3);
                    e = i(s, n, t);
                    t = i(s, n, t - 1 / 3);
                }
                return [
                    Math.round(255 * r),
                    Math.round(255 * e),
                    Math.round(255 * t)
                ]
            }

            function i(t, e, r) {
                if (0 > r) {
                    return r += 1;
                } else {
                    if (r > 1) {
                        --r;
                    }
                    if (1 / 6 > r) {
                        return t + 6 * (e - t) * r;
                    } else {
                        if (0.5 > r) {
                            return e
                        } else {
                            if (2 / 3 > r) {
                                return t + (e - t) * (2 / 3 - r) * 6;
                            } else {
                                return t;
                            }
                        }
                    }

                }

            }
            var e = r(item.hue);
            var n = {
                r: e.color.r / 255,
                g: e.color.g / 255,
                b: e.color.b / 255
            };
            var i = e.Dm / 100 * 2;
            filterString = filterString + '<feComponentTransfer color-interpolation-filters="sRGB"><feFuncR type="linear" s' +
                'lope="' + (1 - i) + '" intercept="' + (n.r * i) + '"></feFuncR><feFuncG type="linear" slope="' + (1 - i) + '" intercept="' + (n.g * i) + '"></feFuncG><feFuncB type="linear" slope="' + (1 - i) + '" intercept="' + (n.b * i) + '"></feFuncB></feComponentTransfer>';
        }

        //负片冲印
        if (item.film != 0) {
            function s(t) {
                if (t > 0) {
                    var n = [];
                    var i = [];
                    var r = [];

                    var n_arr = [0, 0.2, 0, -.1, 0];
                    var i_arr = [0, 0.1, 0, -.1, 0];
                    var r_arr = [0.2, 0, 0.2];

                    for (var z in n_arr) {
                        n.push(parseFloat((n_arr[z] * t / 100).toFixed(2)))
                    }
                    for (var z in i_arr) {
                        i.push(parseFloat((i_arr[z] * t / 100).toFixed(2)))
                    }
                    for (var z in r_arr) {
                        r.push(parseFloat((r_arr[z] * t / 100).toFixed(2)))
                    }

                    return {
                        red: [
                            [
                                0, 0
                            ],
                            [
                                .3, .3 - n[1]
                            ],
                            [
                                .7, .7 - n[3]
                            ],
                            [1, 1]
                        ],
                        green: [
                            [
                                0, 0
                            ],
                            [
                                .25, .25 - i[1]
                            ],
                            [
                                .75, .75 - i[3]
                            ],
                            [1, 1]
                        ],
                        blue: [
                            [
                                0, r[0]
                            ],
                            [
                                0 + 2 / 3 * .5,
                                r[0] + 2 / 3 * (.5 - r[0])
                            ],
                            [
                                1 + 2 / 3 * -.5,
                                1 - r[2] + 2 / 3 * (.5 - (1 - r[2]))
                            ],
                            [
                                1, 1 - r[2]
                            ]
                        ]
                    }
                }
                var n = [];
                var i = [];
                var r = [];

                var n_arr = [0, .2, .5, -.05];
                var i_arr = [0, -.15, 0, 0];
                var r_arr = [0, -.01, 0, .3];

                for (var z in n_arr) {
                    n.push(parseFloat((n_arr[z] * t / -100).toFixed(2)))
                }
                for (var z in i_arr) {
                    i.push(parseFloat((i_arr[z] * t / -100).toFixed(2)))
                }
                for (var z in r_arr) {
                    r.push(parseFloat((r_arr[z] * t / -100).toFixed(2)))
                }
                return {
                    red: [
                        [
                            0, 0
                        ],
                        [
                            .3, .3 - n[1]
                        ],
                        [
                            .7, .7 - n[2]
                        ],
                        [
                            .95, .95 - n[3]
                        ]
                    ],
                    green: [
                        [
                            0, 0
                        ],
                        [
                            .25, .25 - i[1]
                        ],
                        [
                            .6, .6
                        ],
                        [1, 1]
                    ],
                    blue: [
                        [
                            0, 0
                        ],
                        [
                            .3, .3 - r[1]
                        ],
                        [
                            .5, .5
                        ],
                        [
                            1, 1 - r[3]
                        ]
                    ]
                }
            }

            function a(t, e, r, n) {
                function i(t, e) {
                    var r = t * t;
                    var n = 1 - t;
                    var i = n * n;
                    return e[0] * i * n + 3 * e[1] * i * t + 3 * e[2] * n * r + e[3] * r * t
                }
                for (var s, a, o = 0, c = []; 1 > o;) {
                    s = i(o, [t.x, e.x, r.x, n.x]);
                    a = i(o, [t.y, e.y, r.y, n.y]);
                    c.push({
                        x: s,
                        y: a
                    });
                    o = o + 5e-5;
                }

                var u = [{
                    x: t.x,
                    y: t.y
                }]
                var l = .05
                var f = null;
                c.forEach(function (t) {
                    if (f !== null && t.x > l) {
                        u.push(f);
                        l = l + 0.05;
                    }
                    f = t;
                });
                u.push({
                    x: n.x,
                    y: n.y
                });
                return u
            }
            var t = s(item.film);
            var r = {
                r: t.red,
                g: t.green,
                b: t.blue
            };
            var n = null;
            var flimFilter = '';
            ["r", "g", "b"].forEach(function (t) {
                var type = t;
                t = r[t];
                var arr = a({
                    x: t[0][0],
                    y: t[0][1]
                }, {
                    x: t[1][0],
                    y: t[1][1]
                }, {
                    x: t[2][0],
                    y: t[2][1]
                }, {
                    x: t[3][0],
                    y: t[3][1]
                });
                var arrb = [];
                for (var i in arr) {
                    arrb.push(arr[i].y);
                }
                t = arrb;
                flimFilter = flimFilter + '<feFunc' + type.toUpperCase() + ' type="table" tableValues="' + t.join(" ") + '"></feFunc' + type.toUpperCase() + '>';
            });

            filterString = filterString + '<feComponentTransfer color-interpolation-filters="sRGB">' + flimFilter + '</feComponentTransfer>';

        }

        return filterString;
    },
    'getQueryString': function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window
            .location
            .search
            .substr(1)
            .match(reg); //获取url中"?"符后的字符串并正则匹配
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ?
            "" :
            context;
    },
    /*获取样式*/
    "getStyle": function (row_index, col_index, total_row, total_col, style_data) {
        //console.warn('正在获取样式:' + row_index + "," + col_index);
        var temp_arr = [];
        var default_style = {};
        //遍历所有样式,过滤出当前行列可用的样式
        for (var i = 0; i < style_data.length; i++) {
            var hit_style = 0;
            for (var a = 0; a < style_data[i].rule.length; a++) {
                var item = style_data[i].rule[a];

                //判断是否为指定行
                if (item[0] == "row_index" && item[1] == row_index) {

                    hit_style++;

                    //console.log('row_index 规则符合,当前hit_style', hit_style);
                }
                //判断为最后一行
                if (item[0] == "row_final" && row_index == total_row - 1) {
                    hit_style++;
                }

                //判断是否为指定列
                if (item[0] == "col_index" && item[1] == col_index) {
                    hit_style++;

                    //console.log('col_index 规则符合,当前hit_style', hit_style);
                }

                //判断为最后一列
                if (item[0] == "col_final" && col_index == total_col - 1) {
                    hit_style++;
                }
                //判断是否为奇数行或奇数列
                if (item[0] == "row_odd" && row_index % 2 != 0) {
                    hit_style++;

                    //console.log('奇数行 规则符合,当前hit_style', hit_style);

                }
                if (item[0] == "col_odd" && col_index % 2 != 0) {
                    hit_style++
                    //console.log('奇数列 规则符合,当前hit_style', hit_style);

                }
                //判断是否为偶数行或偶数列
                if (item[0] == "row_even" && row_index % 2 == 0) {
                    hit_style++

                    //console.log('偶数行 规则符合,当前hit_style', hit_style);

                }
                if (item[0] == "col_even" && col_index % 2 == 0) {
                    hit_style++

                    //console.log('偶数列 规则符合,当前hit_style', hit_style);

                }

                //判断是否为默认样式
                if (item[0] == "default") {
                    default_style = style_data[i];

                    //console.log('默认样式 加入');
                }
            }
            if (hit_style == style_data[i].rule.length) {
                //console.log('规则全部触发,满足条件')
                temp_arr.push(style_data[i]);
            }
        }
        if (temp_arr.length > 0) {
            //console.warn('找到专属样式');
            return temp_arr[temp_arr.length - 1];
        } else {
            //console.warn('返回默认样式');
            return default_style;
        }

    },
    //计算二次贝塞尔插值
    "QuadBezierCurve": function (p0, p1, p2, t) {
        var current = 0;
        var InvT = 1 - t;
        var InvT_2 = InvT * InvT;
        var T2 = t * t;
        current = InvT_2 * p0;
        current += 2 * InvT * t * p1;
        current += T2 * p2;
        return current;
    },
    "getQuadBezierPoints": function (p0_x, p0_y, p1_x, p1_y, p2_x, p2_y) {
        var resultArr = [];
        var step_num = 0.001

        for (var t = 0; t <= 1; t += step_num) {
            //Calculate the new position
            var current_x = this.QuadBezierCurve(p0_x, p1_x, p2_x, t);
            var current_y = this.QuadBezierCurve(p0_y, p1_y, p2_y, t);
            resultArr.push({
                x: current_x,
                y: current_y
            });
        }
        return resultArr;
    },
    //计算三次贝塞尔插值
    "CubicBezierCurve": function (p0, p1, p2, p3, t) {
        var current = 0;
        var InvT = 1 - t;
        var InvT_2 = InvT * InvT;
        var InvT_3 = InvT_2 * InvT;
        var T2 = t * t;
        var T3 = T2 * t;
        current += InvT_3 * p0;
        current += 3 * InvT_2 * t * p1;
        current += 3 * InvT * T2 * p2;
        current += T3 * p3;
        return current;
    },
    "getCubicBezierCurvePoints": function (p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
        var resultArr = [];
        var step_num = 0.001
        for (var t = 0; t <= 1; t += step_num) {
            //Calculate the new position
            var current_x = this.CubicBezierCurve(p0_x, p1_x, p2_x, p3_x, t);
            var current_y = this.CubicBezierCurve(p0_y, p1_y, p2_y, p3_y, t);
            resultArr.push({
                x: current_x,
                y: current_y
            });
        }
        return resultArr;
    },
    //获取绕指定点旋转后坐标(三次贝塞尔使用)
    "rotatePoint": function (p, pCenter, angel) {
        var l = ((angel * Math.PI) / 180);

        var cosv = Math.cos(l);
        var sinv = Math.sin(l);

        var newX = ((p.x - pCenter.x) * cosv - (p.y - pCenter.y) * sinv + pCenter.x);
        var newY = ((p.x - pCenter.x) * sinv + (p.y - pCenter.y) * cosv + pCenter.y);
        return {
            x: newX,
            y: newY
        }
    },
    //获取两个坐标形成的角度
    "getAngle": function (px, py, mx, my) { //获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
        var x = Math.abs(px - mx);
        var y = Math.abs(py - my);
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var cos = y / z;
        var radina = Math.acos(cos); //用反三角函数求弧度
        var angle = Math.floor(180 / (Math.PI / radina)); //将弧度转换成角度

        if (mx > px && my > py) { //鼠标在第四象限
            angle = 180 - angle;
        }

        if (mx == px && my > py) { //鼠标在y轴负方向上
            angle = 180;
        }

        if (mx > px && my == py) { //鼠标在x轴正方向上
            angle = 90;
        }

        if (mx < px && my > py) { //鼠标在第三象限
            angle = 180 + angle;
        }

        if (mx < px && my == py) { //鼠标在x轴负方向
            angle = 270;
        }

        if (mx < px && my < py) { //鼠标在第二象限
            angle = 360 - angle;
        }

        return angle;
    },
    //计算两点间的距离
    "distance": function (x1, y1, x2, y2) {
        var calX = x2 - x1;
        var calY = y2 - y1;
        return Math.pow((calX * calX + calY * calY), 0.5);
    },

    //字体列表数据
    fontList: [
        [
            "d6", "微软雅黑"
        ],
        [
            "d31", "方正书宋"
        ],
        [
            "d32", "方正仿宋"
        ],
        [
            "d33", "方正楷体"
        ],

        [
            'g6', '方正准圆', true
        ],
        [
            'g7', '方正北魏楷书', true
        ],
        [
            'g8', '方正卡通', true
        ],
        [
            'g9', '方正彩云', true
        ],
        [
            'g10', '方正综艺', true
        ],
        [
            'g11', '方正胖娃', true
        ],
        [
            'g12', '方正行楷', true
        ],
        [
            'g13', '方正静蕾', true
        ],
        [
            'g4', '方正兰亭超细黑', true
        ],
        [
            'g2', '方正兰亭刊黑', true
        ],

        [
            'g5', '方正兰亭黑', true
        ],
        [
            'g1', '方正兰亭中黑', true
        ],

        [
            'g3', '方正兰亭特黑', true
        ],

        [
            "d18", "思源超细黑"
        ],

        [
            "d17", "思源细黑"
        ],

        [
            "d8", "思源刊黑"
        ],

        [
            "d7", "思源中黑"
        ],

        [
            "d16", "思源粗黑"
        ],

        [
            "d15", "思源特黑"
        ],

        [
            "d13", "思源宋体超细黑"
        ],
        [
            "d10", "思源宋体刊黑"
        ],
        [
            "d9", "思源宋体中黑"
        ],
        [
            "d11", "思源宋体特黑"
        ], , [
            'g15', '造字工房佳黑', true
        ],
        [
            'g16', '造字工房力黑', true
        ],
        [
            'g17', '造字工房尚黑', true
        ],
        [
            'g18', '造字工房形黑', true
        ],
        [
            'g19', '造字工房情书', true
        ],
        [
            'g20', '造字工房雅圆', true
        ],
        [
            'g14', '禹卫书法行书', true
        ],
        [
            "d34", "站酷快乐体"
        ],
        [
            "d35", "站酷酷黑"
        ],
        [
            "d36", "站酷高端黑体"
        ],
        [
            "d39", "本墨陈黑"
        ],

        [
            "d1", "奇思悠然体"
        ],
        [
            "d2", "奇思源黑 Light"
        ],
        [
            "d3", "奇思粗萌体"
        ],
        [
            "d4", "字体管家夜茴体"
        ],
        [
            "d5", "庞门正道标题体"
        ],
        [
            "d20", "文泉驿微米黑"
        ],
        [
            "d21", "新蒂下午茶基本版"
        ],
        [
            "d22", "新蒂剪纸体"
        ],
        [
            "d23", "新蒂小丸子体"
        ],
        [
            "d24", "新蒂泡芙体"
        ],
        [
            "d25", "新蒂绿豆体"
        ],
        [
            "d26", "新蒂赵孟頫体"
        ],
        [
            "d27", "新蒂金钟体"
        ],
        [
            "d28", "新蒂雪山体"
        ],
        [
            "d29", "新蒂黑板报体"
        ],
        [
            "d30", "新蒂黑板报底字"
        ],
        [
            "f11", "Arial"
        ],
        [
            "f1", "2Dumb"
        ],
        [
            "f2", "3Dumb"
        ],
        [
            "f3", "Abril Fatface"
        ],
        [
            "f4", "ACaslonPro"
        ],
        [
            "f5", "adele"
        ],
        [
            "f6", "Aeron"
        ],
        [
            "f7", "ALEO"
        ],
        [
            "f8", "Aliquam"
        ],
        [
            "f9", "AliquamREG"
        ],
        [
            "f10", "Amatic"
        ],

        [
            "f12", "Arual"
        ],
        [
            "f13", "ATCKrueger Bold"
        ],
        [
            "f14", "AVGARDN"
        ],
        [
            "f15", "Beatrixe normal"
        ],
        [
            "f16", "BigStem Light"
        ],
        [
            "f17", "Bird House Script"
        ],
        [
            "f18", "Buinton"
        ],
        [
            "f19", "Buket Fat Basic"
        ],
        [
            "f20", "Buket Sans Basic"
        ],
        [
            "f21", "Clearlight"
        ],
        [
            "f22", "Compctab"
        ],
        [
            "f23", "Courier"
        ],
        [
            "f24", "eurostile Regular"
        ],
        [
            "f25", "Hochstadt Serif"
        ],
        [
            "f26", "Laskar Regular"
        ],
        [
            "f27", "Oyko Medium"
        ],
        [
            "f28", "RakerStencil Medium"
        ],
        [
            "f29", "TrajanPro"
        ],
        [
            "f30", "TT Chocolates Black"
        ],
        [
            "f31", "Unintended"
        ],
        [
            "f32", "YellowJelly"
        ],
        ["f33", "Zephan"]
    ]

};
export default comm


// WEBPACK FOOTER //
// ./src/common/common.js