//游戏通用接口

let GameUtils = {
//-----------------------------------数据处理相关--------------------------------
    /**
     * 判断该数据是否有效 
     * undefined， null， ''， NaN，false，0，[]，{} ，空白字符串，都返回true，否则返回false
     * @param value
     * @returns {boolean}
     */
    isEmpty: function(v) {
	    switch (typeof v) {
	    case 'undefined':
	        return true;
	    case 'string':
	        if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
	        break;
	    case 'boolean':
	        if (!v) return true;
	        break;
	    case 'number':
	        if (0 === v || isNaN(v)) return true;
	        break;
	    case 'object':
	        if (null === v || v.length === 0) return true;
	        for (var i in v) {
	            return false;
	        }
	        return true;
	    }
	    return false;
	},

	 /**
     * 获取当前页面参数(比如推广码),格式  tag=1&user=admin
     * @param name
     * @returns {string|null}
     */
    getUrlString : function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);

        if (r !== null) {
            return unescape(r[2]);
        }
        return null;
	},
	
	// 定义一个深拷贝函数  接收目标target参数
	deepClone: function(target) {
		// 定义一个变量
		let result;
		// 如果当前需要深拷贝的是一个对象的话
		if (typeof target === 'object') {
		// 如果是一个数组的话
			if (Array.isArray(target)) {
				result = []; // 将result赋值为一个数组，并且执行遍历
				for (let i in target) {
					// 递归克隆数组中的每一项
					result.push(this.deepClone(target[i]))
				}
			// 判断如果当前的值是null的话；直接赋值为null
			} else if(target===null) {
				result = null;
			// 判断如果当前的值是一个RegExp对象的话，直接赋值    
			} else if(target.constructor===RegExp){
				result = target;
			}else {
			// 否则是普通对象，直接for in循环，递归赋值对象的所有值
				result = {};
				for (let i in target) {
					result[i] = this.deepClone(target[i]);
				}
			}
		// 如果不是对象的话，就是基本数据类型，那么直接赋值
		} else {
			result = target;
		}
		// 返回最终结果
		return result;
	},
//-----------------------------------日期相关--------------------------------

    /**
     * 格式化时间戳
     * @param  {string|时间戳}
     * @param  {string|分隔符1}
     * @param  {string|分隔符2}
     * @return {string|2020-1-1 12:12:12}
     */
    formatTime: function(timestamp, arg1, arg2){
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var str1 = arg1 ? arg1 : "-";
        var str2 = arg2 ? arg2 : ":";
        var Y = date.getFullYear() + str1;
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + str1;
        var D = date.getDate() + ' ';
        var h = date.getHours() + str2;
        var m = date.getMinutes() + str2;
        var s = date.getSeconds();
        return Y+M+D+h+m+s;
    },
    
//-----------------------------------UI相关--------------------------------
    //将像素坐标转化为瓦片坐标，posInPixel：目标节点的position
	getTilePos: function (posInPixel) {
	    var mapSize = this.map.node.getContentSize();
	    var tileSize = this.map.getTileSize();
	    var x = Math.floor(posInPixel.x / tileSize.width);
	    var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
	    return cc.p(x, y);
	},

	//创建spine动画
	//parm.path: 动画文件路径
	//parm.parent: 父节点
	//parm.pos: 位置 cc.v2(x, y)
	//parm.loop：是否循环
	//parm.outoClear: 是否自动删除
	//parm.complete: 播放完成回调
	//parm.loadComplete: 加载完成回调
	createSpAni: function (parm) {
		cc.loader.loadRes(parm.path, sp.SkeletonData, function(error, spData){
			if(error) {
				cc.log("加载动画失败", parm.path);
				return;
			}
			if(parm.parent){
				let nodeNew = new cc.Node();
				nodeNew.name = "spNode"
				let spCmpt =nodeNew.addComponent(sp.Skeleton);
				parm.parent.addChild(nodeNew);
				spCmpt.skeletonData = spData;
				spCmpt.premultipliedAlpha = false;
				spCmpt.setSkin("default");
				spCmpt.setAnimation(0, "animation", parm.loop);
				if(parm.pos){
					nodeNew.setPosition(parm.pos);
				};
				if(parm.loadComplete){
					parm.loadComplete(spCmpt);
				}
				if(parm.outoClear && !parm.loop){
					spCmpt.setCompleteListener( ()=> {
						if(parm.complete){
							parm.complete(spCmpt)
						};
						nodeNew.destroy();
					});
				};
			};
		});
	},

	//根据颜色闪烁
	//node: 播放动画的节点
	//color: cc3b
	//time: 闪烁次数
	//interval: 闪烁间隔
	blinkByColor: function (node, color, time = 3, interval = 0.2) {
		let curColor = new cc.Color(255,255,255);
		node.color = curColor;
		let tint = cc.tintTo(interval, color.r, color.g, color.b);
		let tint1 = cc.tintTo(interval, curColor.r, curColor.g, curColor.b);
		let delay = cc.delayTime(interval);
		var rep = cc.repeat(cc.sequence(tint, delay, tint1), time);
		node.runAction(rep);
	},

	//节点矩阵是否相交
	contain: function (node1, node2) {
        let rect1 = node1.getBoundingBoxToWorld();
		let rect2 = node2.getBoundingBoxToWorld();
		return rect1.intersects(rect2);
	},

	//获取节点矩阵相交部分
	intersectionNode: function (node1, node2) {
        let rect1 = node1.getBoundingBoxToWorld();
		let rect2 = node2.getBoundingBoxToWorld();
		var intersection = new cc.Rect();
		rect1.intersection(intersection, rect2);
		return intersection;
	},

	//获取矩阵相交部分
	intersection: function (rect1, rect2) {
		var intersection = new cc.Rect();
		rect1.intersection(intersection, rect2);
		return intersection;
	},

//-----------------------------------平台相关--------------------------------
	//复制到剪切板
	copy: function (input) {
		const el = document.createElement('textarea');
		el.value = input;
		el.setAttribute('readonly', '');
		el.style.contain = 'strict';
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		el.style.fontSize = '12pt'; // Prevent zooming on iOS

		const selection = getSelection();
		var originalRange = false;
		if (selection.rangeCount > 0) {
		    originalRange = selection.getRangeAt(0);
		}
		document.body.appendChild(el);
		el.select();
		el.selectionStart = 0;
		el.selectionEnd = input.length;

		var success = false;
		try {
		    success = document.execCommand('copy');

		} catch (err) {}

		document.body.removeChild(el);

		if (originalRange) {
		    selection.removeAllRanges();
		    selection.addRange(originalRange);
		}
	    ViewManager.showCommonTips("复制\""+ input + "\"成功");
	},
};

module.exports = GameUtils;