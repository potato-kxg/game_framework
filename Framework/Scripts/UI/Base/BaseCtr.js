// 用于注册界面

var BaseCtr = cc.Class({
    ctor: function(){
        this.moduleName = ""
        this.view = null;
        this.data = null;
        this.proxy = null;
    },

    init: function(client, openData){
        this.client = client;
        this.viewName = this.moduleName + "View";
        this.proxyName = this.moduleName + "Proxy";
        this.dataName = this.moduleName + "Data";

        this.createView(openData);
    },

    createView: function(openData){
        try {
            var px = require(this.proxyName);
            if(px){
                this.proxy = new px();
                this.proxy.init(this.client);
            }
        } catch (error) {
            cc.log("未找到"+this.proxyName);
        }

        // try {
        //     var dt = require(this.dataName);
        //     if(dt){
        //         this.data = new dt();
        //     }
        // } catch (error) {
        //     cc.log("未找到"+this.dataName);
        // }
        
        ResManager.loadPrefab(this.viewName, (prefab) => {
            var viewNode = cc.instantiate(prefab);
            viewNode.name = this.viewName;
            viewNode.active = false;
            this.view = viewNode.getComponent(this.viewName);
            if(!this.view){
                this.view = viewNode.addComponent(this.viewName);
            }
            var viewType = this.view.viewType;
            var parent = this.client.layerNodes[viewType];
            viewNode.setParent(parent);
            this.view.open(openData);
        });
    },
});

module.exports = BaseCtr;

