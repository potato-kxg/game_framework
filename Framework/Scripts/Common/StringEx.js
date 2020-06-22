//获取字符数组 
String.prototype.toCharArray = function() {
    return this.split("");
}
//获取N个相同的字符串 
String.prototype.repeat = function(num) {
    var tmpArr = [];
    for ( var i = 0; i < num; i++)
        tmpArr.push(this);
    return tmpArr.join("");
}
//逆序 
String.prototype.reverse = function() {
    return this.split("").reverse().join("");
}
//测试是否是数字 
String.prototype.isNumeric = function() {
    var tmpFloat = parseFloat(this);
    if (isNaN(tmpFloat))
        return false;
    var tmpLen = this.length - tmpFloat.toString().length;
    return tmpFloat + "0".repeat(tmpLen) == this;
}
//测试是否是整数 
String.prototype.isInt = function() {
    if (this == "NaN")
        return false;
    return this == parseInt(this).toString();
}
// 合并多个空白为一个空白 
String.prototype.resetBlank = function() {
    return this.replace(/s+/g, " ");
}
// 保留数字 
String.prototype.getNum = function() {
    return this.replace(/[^d]/g, "");
}
// 保留字母 
String.prototype.getEn = function() {
    return this.replace(/[^A-Za-z]/g, "");
}
// 保留中文 
String.prototype.getCn = function() {
    return this.replace(/[^u4e00-u9fa5uf900-ufa2d]/g, "");
}
// 得到字节长度 
String.prototype.getRealLength = function() {
    return this.replace(/[^x00-xff]/g, "--").length;
}
// 从左截取指定长度的字串 
String.prototype.left = function(n) {
    return this.slice(0, n);
}
// 从右截取指定长度的字串 
String.prototype.right = function(n) {
    return this.slice(this.length - n);
}
// HTML编码 
String.prototype.HTMLEncode = function() {
    var re = this;
    var q1 = [ /x26/g, /x3C/g, /x3E/g, /x20/g ];
    var q2 = [ "&", "<", ">", " " ];
    for ( var i = 0; i < q1.length; i++)
        re = re.replace(q1[i], q2[i]);
    return re;
}
// Unicode转化 
String.prototype.ascW = function() {
    var strText = "";
    for ( var i = 0; i < this.length; i++)
        strText += "&#" + this.charCodeAt(i) + ";";
    return strText;
}

/* 格式化字符串 {0}{1}
var template1="我是{0}，今年{1}了";
var result1=template1.format("loogn",22);
var template2="我是{name}，今年{age}了";
var result2=template2.format({name:"loogn",age:22});
 */
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

// 判断是不是数字和字母组合
String.prototype.isNumberAndLetter = function() {
   var reg = "^[0-9a-zA-Z]{6,16}$"; 
   var re = new RegExp(reg); 
   if (re.test(this)) { 
       return true; 
   }else{ 
      return false; 
   }
}

// 字符是否在a-b区间
String.prototype.isInAmong = function(a, b) {
    if(this.length >= a && this.length <= b){
        return true;
    }else{
        return false;
    }
}

 // 判断是否为手机号
String.prototype.isPoneAvailable = function () {
    var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!reg.test(this)) {
        return false;
    } else {
        return true;
    }
}

// 判断是否为电话号码
String.prototype.isTelAvailable = function () {
    var reg = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
    if (!reg.test(this)) {
        return false;
    } else {
        return true;
    }
}