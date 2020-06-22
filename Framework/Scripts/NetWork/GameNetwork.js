
"use strict";
let BufferData = require("BufferData");
let GameWebSocket = require("GameWebSocket");

let MAXSENDCOUNT = 10240;//最大发送数据
// 192.168.1.32  8550
let GAME_SERVER_URL = 'ws://192.168.1.32:8550';
// let GAME_SERVER_URL = 'ws://192.168.50.20:6302';

let GameNetwork = cc.Class({
    extends: cc.Component,

    ctor: function() {
        this._socket = null;
        this.pushResponseCallback = {};
        this.responseList = [];//接收消息列表
        this.selfClose = false;
        this._aotoReConnectTime = 0; //重连次数
    },

    init:function(_name){
        this.clientName = _name;  //当前连接服务名
        this.registerPushResponseCallback(MsgDef.hall.PONG, this.heartCallback.bind(this)); //心跳消息
    },

    /**
     * 设置服务监听(慎用，每个服务只能监听一次)
     * @param delegate
     */
    setDelegate: function (delegate) {
    },

    /**
     * 注册服务器主动推送的response 回调
     */
    registerPushResponseCallback : function(_msgName, callback){
        this.pushResponseCallback[_msgName] = callback;
    },

    /**
     * 判断socket已连接成功，可以通信
     * @returns {boolean}
     */
    isSocketOpened: function() {
        try{
         //   Log.log("socket状态", this._socket.getState());
            return (this._socket && this._socket.getState() === GameWebSocket.GameWebSocketState.OPEN);
        }
        catch (e) {
            return false;
        }
    },

    isSocketClosed: function () {
        return this._socket == null;
    },

    /**
     * 启动连接
     */
    connect: function () {
        let url = GAME_SERVER_URL;
        if(this._socket && this._socket.getState() === GameWebSocket.GameWebSocketState.CONNECTING){
            // Log.log("正在连接不用再连");
            return;
        }
        cc.log("webSocketUrls=" + url);
        this._socket = new GameWebSocket.GameWebSocket();
        this._socket.init(url, this);
        this._socket.connect();
    },

    /**
     * 主动关闭socket
     */
    closeConnect: function () {
        if(this._socket){
            this.selfClose = true;
            this._socket.close();
        }
    },

    onSocketOpen: function () {
        cc.log('Socket:onOpen');
    },

    onSocketError: function (error) {
        // Log.log('Socket:onError', JSON.stringify(error));
    },

    onSocketClosed: function (close) {
        // Log.log('Socket:onClose',JSON.stringify(close));
        if(!this.selfClose){
            this.reconnect();
        }else{
            Log.log("自己断的不需要重连");
        }

        if (this._socket) {
            this._socket.close();
        }
        this._socket = null;
    },

    onSocketMessage: function (msg) {
        if(msg.constructor == null){
            cc.log("服务器消息格式不支持");
            return;
        };
        //保存服務器消息
        this.responseList.push(msg);
        //逐條解析分發消息
        this.onGetResponse();
    },

    //解析分發消息
    onGetResponse:function(){
        let msgNum = this.responseList.length;
        if(msgNum > 0){
            let oneMsg = this.responseList.shift();
            let response = new BufferData();
            if(oneMsg.constructor.name === "ArrayBuffer"){
                response.outit(oneMsg);
                this.deserializeData(response);
                this.onGetResponse();
            }else if(oneMsg.constructor.name === "Blob"){
                let reader;
                if (typeof (FileReader) == "undefined") {
                    reader = new FileReaderSync();
                } else {
                    reader = new FileReader();
                }
                if (reader != null) {
                    let self = this;
                    reader.onload = function (e) {
                        // Log.log("读取Blob完毕","初始化");
                        response.outit(reader.result);
                        self.deserializeData(response);
                        self.onGetResponse();
                    }
                    reader.readAsArrayBuffer(oneMsg);
                }
            }
        }
    },

    //反序列化数据
    deserializeData:function(response){
        let msgId = response.msgId;
        let responceCmd = MsgDef.id_to_name[msgId];
        responceCmd = responceCmd[0]+"."+responceCmd[1];
        if(responceCmd != MsgDef.hall.PONG){
            Log.log(this.clientName,'收到消息', responceCmd, "ID:", msgId);
        }else{
             //心跳不打日志
        }
        var pushCallback = this.pushResponseCallback[responceCmd];
        if(pushCallback){
            if(response.dataSize > 0){
                let _data = response.Decode(responceCmd)
                pushCallback(_data);
            }else{
                pushCallback(response);
            }
        }else{
            Log.log('没有监听消息：',responceCmd, "ID:" ,msgId);
        }
    },

    /**
     * 断线重连
     */
    reconnect:function(){
        let self = this;
        let handle = function() {
            if(self.isSocketOpened()){
                self.unschedule(handle);
                return;
            }
            if(self._aotoReConnectTime >= AppConst.AutoReconnectTime){
                self.unschedule(handle);
                var data = {
                    msg: "服务器连接失败，请重试！",
                    type: 2,
                    sureCallBack: function () {
                        cc.log("sureCallBack");
                        self._aotoReConnectTime = 0;
                        self.reconnect();
                    },
                };
                ViewManager.openDlg(data);
                ViewManager.hideLoading();
                return;
            }
            ViewManager.showLoading(10);
            self._aotoReConnectTime = self._aotoReConnectTime + 1;
            cc.log("重连次数:",self._aotoReConnectTime);
            self.connect();
        };

        if(this.isSocketOpened()){
            this.unschedule(handle);
            ViewManager.hideLoading();
        }else{
            if(this._aotoReConnectTime == 0){
                handle();
                this.schedule(handle, AppConst.ReconnectTime, cc.macro.REPEAT_FOREVER, 0);
            }else{
                cc.log("正在重连中");
            };
        };
    },

    startSendHeart:function(){
        this.unschedule(this.sendHeart);
        this.schedule(this.sendHeart, AppConst.HeatTime);
    },

    /**
     * 心跳
     */
    sendHeart: function () {
        let self = this;
        if(!this.isSocketOpened()){
            Log.log("服务器断开不用发心跳了","sendHeart");
            this.unschedule(self.sendHeart);
            return;
        }
        this.sendRequest(MsgDef.hall.PING, {}, AppConst.NetworkFlag.Lobby);
    },

    /**
     * 心跳回调
     */
    heartCallback: function (response) {
         Log.log("收到心跳",this.clientName);
    },

    /**
     * 向服务器发送请求。
     * _pbname:协议名
     * _data:消息对象
     * _destid:
     */
    sendRequest: function (_pbname, dataObj, _destid = 0) {
        cc.log("sendRequest",this._socket);
        if(this._socket == null){
            this.reconnect();
            return;
        }

        let sendingCount = this._socket.getbufferAmount();
        if(sendingCount>= MAXSENDCOUNT){
            Log.log("正在发送的数据过大===============================>>>>>",sendingCount);
            return;
        }
        let bufData = new BufferData();
        let _msgId = MsgDef.name_to_id[_pbname];
        let binary = bufData.sendData(_msgId, dataObj, _destid);
        Log.log("发送消息:",_pbname , " msgId:" , _msgId, " size:", bufData.dataSize);
        this._socket.send(binary.buffer);
    },
});

//登录服
GameNetwork._loginNetInstance = null;
GameNetwork.LoginNet = function (_name) {
    if(!GameNetwork._loginNetInstance){
        GameNetwork._loginNetInstance = new GameNetwork();
    }
    GameNetwork._loginNetInstance.init(_name);

    return GameNetwork._loginNetInstance;
}

//游戏服
GameNetwork._gameNetInstance = null;
GameNetwork.GameNet = function (_name) {
    if(!GameNetwork._gameNetInstance){
        GameNetwork._gameNetInstance = new GameNetwork();
    }
    GameNetwork._gameNetInstance.init(_name);

    return GameNetwork._gameNetInstance;
}


module.exports = GameNetwork;