// 独立界面管理器
// 功能：公用界面打开\关闭\创建
var ViewManager = cc.Class({
    extends: cc.Component,
    statics:{
        _instance: null,
    },

    ctor: function(){
        // 同时有且只能存在一个的界面
        this.views = {};
        // 同时存在多个的通用弹窗界面
        this.dialogs = [];
        this.dlgName = "CommonDlg";
    },

    // 打开一个公用界面
    open: function(viewName, data){
        if(this.views[viewName]){
            if(!this.views[viewName].isOpen){
                if(this.views[viewName].open){
                    this.views[viewName].open(data);
                }else{
                    cc.log(viewName,"open未实现");
                }
            }else{
                if(this.views[viewName].setData){
                    this.views[viewName].setData(data);
                }
            }
        }else{
            this.createViewByName(viewName, data);
        }
    },

    // 关闭一个公用界面
    close: function(viewName){
        if(this.views[viewName]){
            if(this.views[viewName].isOpen){
                this.views[viewName].close();
            }
        }
    },

    // 打开一个弹窗
    openDlg: function(data){
        var count = this.dialogs.length;
        cc.log("openDlg:", count);
        if(count > 0){
            this.dialogs[count - 1].open(data);
        }else{
            this.createDlg(data);
        }
    },

    // 关闭一个弹窗
    closeDlg: function(callBack){
        var count = this.dialogs.length;
        if(count > 0){
            this.dialogs[count - 1].close(callBack);
            this.popDlg();
        }
    },

    // 往顶部添加一个弹窗
    pushDlg: function(view){
        this.dialogs.push(view);
    },
    // 从顶部删除一个弹窗
    popDlg: function(){
        this.dialogs.pop();
        var count = this.dialogs.length;
        cc.log("openDlg:popDlg", count);
    },

    // 显示loading
    showLoading: function(timeout){
        var loadingLayer = this.getViewParentByType(ViewType.LOADING);
        var loadingView = loadingLayer.getChildByName(ViewNames.LoadingView);
        if(!loadingView){
            delete this.views[ViewNames.LoadingView];
            //防止loading界面意外销毁导致再次打开出错
        }
        this.open(ViewNames.LoadingView, timeout);
    },

    // 隐藏loading
    hideLoading: function(){
        this.close(ViewNames.LoadingView);
    },

    // 显示通用提示
    showCommonTips: function(msg){
        this.open(ViewNames.CommonTips, msg);
    },

    addView: function(view){
        var viewName = view.node.name;
        if(!this.views[viewName]){
            this.views[viewName] = view;
        }
    },

    removeView: function(view){
        var viewName = view.name;
        if(this.views[viewName]){
            delete this.views[viewName];
        }
    },

    createViewByName: function(viewName, data){
        cc.log("loadPrefab:", viewName);
        ResManager.loadPrefab(viewName, (prefab) => {
            var viewNode = cc.instantiate(prefab);
            var view = viewNode.getComponent(viewName);
            if(!view){
                view = viewNode.addComponent(viewName);
            }
            var parent = this.getViewParentByType(view.viewType);
            viewNode.parent = parent;
            view.open(data);
            this.addView(view);
        });
    },

    createDlg: function(data){
        cc.log("loadPrefab:", this.dlgName);
        ResManager.loadPrefab(this.dlgName, (prefab) => {
            var dlgNode = cc.instantiate(prefab);
            var view = dlgNode.getComponent(this.dlgName);
            if(!view){
                view = dlgNode.addComponent(this.dlgName);
            }
            var parent = this.getViewParentByType(view.viewType);
            dlgNode.parent = parent;
            view.open(data);
            this.pushDlg(view);
        });
    },

    getViewParentByType: function(viewType){
        var canvasNode = cc.find("Canvas");
        var parent = canvasNode.getChildByName(viewType);
        if(!parent){
            parent = canvasNode;
        }
        return parent;
    },

    getViewByName: function(viewName){
        return this.views[viewName];
    }, 
});

ViewManager._instance = null;
 
ViewManager.getInstance = function(){
    if(!ViewManager._instance){
        ViewManager._instance = new ViewManager();
    }
    return ViewManager._instance;
};
 
module.exports = ViewManager;