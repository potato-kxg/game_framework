var BufferData = require("BufferData");

var BaseProxy = cc.Class({
    ctor: function(){
        this.client = null;
    },

    init: function(client ){
        this.client = client;
        this.network = client.network;

        if(this.initPushCallback){
            this.initPushCallback();
        }else{
            Log.log("这个类没有监听initPushCallback");
        }
    },

    initPushCallback: function () {

    },

    //     /**
    //  * 创建消息buffer
    //  * @param main
    //  * @param sub
    //  */
    // createBufferData:function (main,sub) {
    //     let req = new BufferData();
    //     req.init(main,sub);
    //     return req;
    // },
});

module.exports = BaseProxy;
