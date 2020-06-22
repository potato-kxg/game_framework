/**
 * @enum {number}
 */
var GameWebSocketState = cc.Enum({
    CONNECTING: 1,
    OPEN: 2,
    CLOSING: 3,
    CLOSED: 4
});

/**
 * @interface
 */
var GameWebSocketDelegate = cc.Class({

    onSocketOpen: function () {

    },

    /**
     * 收到了消息
     * @param {string|Uint8Array} data
     */
    onSocketMessage: function (data) {
        cc.log("收到消息", data);
    },

    onSocketError: function (event) {
        cc.log("连接出错",event);
    },

    /**
     * 连接关闭
     * @param {string} reason
     */
    onSocketClosed: function (close) {
        cc.log("连接关闭",close);
    }
});

/**
 * @interface
 */
var GameWebSocketInterface = cc.Class({

    connect: function () {

    },

    send: function () {

    },

    close: function () {

    },

    getState: function () {

    }
});

var GameWebSocket = cc.Class({
    extends: GameWebSocketInterface,

    properties: {

        /**
         * @type {String} 服务器地址
         */
        _address: null,

        /**
         * @type {GameWebSocketDelegate}
         */
        _delegate: null,

        /**
         * @type {WebSocket}
         */
        _webSocket: null,
    },

    /**
     * @param {string} address 服务器地址
     * @param {GameWebSocketDelegate} delegate 回调接口
     */
    init: function(address, delegate){
        this._address = address;
        this._delegate = delegate;
        this._webSocket = null;
    },

    connect: function () {
        Log.log('connect to '+ this._address);
        var ws = this._webSocket = new WebSocket(this._address);
        ws.binaryType = "arraybuffer";
        ws.onopen = this._delegate.onSocketOpen.bind(this._delegate);
        ws.onmessage = function (param) {
            cc.log("onmessage:",JSON.stringify(param));
            this._delegate.onSocketMessage(param.data);

        }.bind(this);

        ws.onerror = function (error) {
            cc.log("onerror:",JSON.stringify(error));
            this._delegate.onSocketError(error);
        }.bind(this);

        // function({code: Number, reason: String, wasClean: Boolean})}
        ws.onclose = function (error) {
            cc.log("onclose:",JSON.stringify(error));
            this._delegate.onSocketClosed(error);
        }.bind(this);
    },

    /**
     * 发送数据
     * @param {ArrayBuffer} Binary
     */
    send: function (Binary) {
        this._webSocket.send(Binary);
    },

    close: function () {
        if (!this._webSocket) {
            return;
        }

        try {
            this._webSocket.close();
            cc.log("socketClose-error");
        } catch (err) {
            cc.log('error while closing webSocket', err.toString());
        }
        this._webSocket = null;
    },


    getState: function () {
        if (this._webSocket)
        {
            switch(this._webSocket.readyState){
                case WebSocket.OPEN:
                    return GameWebSocketState.OPEN;
                case WebSocket.CONNECTING:
                    return GameWebSocketState.CONNECTING;
                case WebSocket.CLOSING:
                    return GameWebSocketState.CLOSING;
                case WebSocket.CLOSED:
                    return GameWebSocketState.CLOSED;
            }
        }
        return GameWebSocketState.CLOSED;
    },

    /**
     * websocket当前发送数据量
     * @returns {number}
     */
    getbufferAmount:function () {
        return this._webSocket.bufferedAmount;
    }

});

module.exports = {
    GameWebSocketState: GameWebSocketState,
    GameWebSocketDelegate: GameWebSocketDelegate,
    GameWebSocketInterface: GameWebSocketInterface,
    GameWebSocket: GameWebSocket
};