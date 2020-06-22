/*
游戏实例基类
实现游戏入口一些通用接口
管理游戏子界面
 */

var GameClient = cc.Class({
    extends: cc.Component,

    ctor: function(){
        this.layerNodes = {};
        // 界面Ctr实例
        this.viewCtrs = {};
        this.network = null;
    },

    // 场景主层级结构
    onLoad: function(){
        this.initLayers();
    },

    // 创建根层级结构
    initLayers: function(){
        for(var key in ViewType){
            var layerNode = new cc.Node();
            layerNode.name = ViewType[key];
            layerNode.setParent(this.node);
            layerNode.setContentSize(cc.winSize);
            this.layerNodes[ViewType[key]] = layerNode;
        }
    },

    setNetWork:function(flag, protocolName)
    {
        if(flag === AppConst.NetworkFlag.Login){
            this.network = LoginNet(protocolName);
        }else{
            //游戏服务器
            this.network = GameNet(protocolName);
        }
    },

    // 根据界面模块名获取对应ctr实例
    getCtr: function(viewName){
        var ctrName = viewName + "Ctr";
        if(this.viewCtrs[ctrName]){
            return this.viewCtrs[ctrName];
        }else{
            cc.log("没有找到",ctrName);
        }
    },

    // 根据界面模块名获取对应proxy实例
    getProxy: function(viewName){
        var ctrName = viewName + "Ctr";
        if(this.viewCtrs[ctrName]){
            if(this.viewCtrs[ctrName].proxy){
                return this.viewCtrs[ctrName].proxy;
            }else{
                cc.log("没有找到",viewName+"Proxy");
            }
        }
    },

    // 根据界面模块名获取对应data实例
    getData: function(viewName){
        var ctrName = viewName + "Ctr";
        if(this.viewCtrs[ctrName]){
            if(this.viewCtrs[ctrName].data){
                return this.viewCtrs[ctrName].data;
            }else{
                cc.log("没有找到",viewName+"Data");
            }
        }
    },

    // 根据名字打开相应界面
    open: function(viewName, data){
        var ctrName = viewName + "Ctr";
        if(this.viewCtrs[ctrName]){
            if(this.viewCtrs[ctrName].view){
                if(this.viewCtrs[ctrName].view.open){
                    if(!this.viewCtrs[ctrName].view.needDestroy){
                        this.viewCtrs[ctrName].view.open(data);
                        return;
                    }
                }else{
                    cc.log("请实现"+ viewName + "中的open方法");
                    return;
                }
            }else{
                return;
            }
        }
        try{
            var ctr = require(ctrName);
            if(ctr){
                var viewCtr = new ctr();
                viewCtr.init(this, data);
                this.viewCtrs[ctrName] = viewCtr;
            }else{
                cc.log(ctrName + "不存在");
            }
        }catch(err){
            cc.log(ctrName + "不存在");
        }
    },

    // 关闭一个界面
    close: function(viewName){
        var ctrName = viewName + "Ctr";
        if(this.viewCtrs[ctrName]){
            if(this.viewCtrs[ctrName].view){
                if(this.viewCtrs[ctrName].view.close){
                    this.viewCtrs[ctrName].view.close();
                    delete this.viewCtrs[ctrName];
                }else{
                    cc.log("请实现"+viewName+"中的close方法");
                }
            }
        }
    },

    onDestroy () {
        ResManager.clearDepends();
        SceneManager.clearCurrentGame();
    },

});

module.exports  = GameClient;