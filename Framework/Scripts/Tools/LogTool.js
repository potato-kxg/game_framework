var OPENLOGFLAG = true;


/**
 * 处理日志
 * @type {null}
 */
var LogTool = cc.Class({
    ctor: function () {

    },

    /**
     * 时间
     * @returns {string}
     */
    getDateString : function () {
        var d = new Date();
        var str = d.getHours();
        var timeStr = "";
        timeStr += (str.length==1? "0"+str : str) + ":";
        str = d.getMinutes();
        timeStr += (str.length==1? "0"+str : str) + ":";
        str = d.getSeconds();
        timeStr += (str.length==1? "0"+str : str) + ":";
        str = d.getMilliseconds();
        if( str.length==1 ) str = "00"+str;
        if( str.length==2 ) str = "0"+str;
        timeStr += str;

        timeStr = "[" + timeStr + "]";
        return timeStr;
    },

/**
 * 堆栈
 * @param index
 * @returns {string}
 */
    stack : function (index) {
        var e = new Error();
        var lines = e.stack.split("\n");
        lines.shift();
        var result = [];
        lines.forEach(function (line) {
            line = line.substring(7);
            var lineBreak = line.split(" ");
            if (lineBreak.length<2) {
                result.push(lineBreak[0]);
            } else {
                result.push({[lineBreak[0]] : lineBreak[1]});
            }
        });

        var list = [];
        if(index < result.length-1){
            for(var a in result[index]){
                list.push(a);
            }
        }

        var splitList = list[0].split(".");
        return (splitList[0] + ".js->" + splitList[1] + ": ");
    },

    log : function(){
        if(AppConst.LOG_LEVER == 0){return;}
        var backLog = cc.log || cc.log || log;

        if(OPENLOGFLAG){
            backLog.call(this,this.getDateString(),cc.js.formatStr.apply(cc,arguments));
        }
    },
    warn : function(){
        if(AppConst.LOG_LEVER < 2){return;}
        var backLog = cc.log || cc.log || log;

        if(OPENLOGFLAG){
            backLog.call(this,this.getDateString(),cc.js.formatStr.apply(cc,arguments),"color:#ee7700;");
        }
    },

    //输出对象/数组
    dump: function (name, obj) {
        if(AppConst.LOG_LEVER > 2){
            var backLog = cc.log || cc.log || log;
            backLog(name, JSON.stringify(obj));
        }
    }

});

LogTool._instance = null;
LogTool.Instance = function () {
    if(!LogTool._instance){
        LogTool._instance = new LogTool();
    }
    return LogTool._instance;
}



module.exports = LogTool;
