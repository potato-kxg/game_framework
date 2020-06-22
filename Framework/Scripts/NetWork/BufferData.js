var ConvertTool = require("ConvertTool");

var BufferData = cc.Class({

    ctor: function () {
        // this.lengthMap = {};//储存对象数组的长度
        this.temp = new Array(); //缓存
        this.sendView = null;
        this.buffer = null;
        this.headSize = 8;
        this.msgId = 0;
        this.deskId = 0;
    },

    /**
     * 反序列化初始化
     * @param data||ArrayBuffer
     */
    outit:function(data){
        this.buffer = data;
        //解析消息头10字节
        this.sendView = new DataView(data);
        this.pos = 0;
        let length = this.sendView.getUint16(this.pos);
        this.dataSize = length - this.headSize;
        this.pos += 2;
        this.msgId = this.sendView.getInt32(this.pos);
        this.pos += 4;
        this.deskId = this.sendView.getInt32(this.pos);
        this.pos += 4;
        Log.log("收到消息头:",this.msgId, " deskId:", this.deskId, " dataSize:",this.dataSize, " length:",length);
    },

    setKeyLength:function(key, value){
        // this.lengthMap[key] = value;
    },

    /**
     * 获取需要发送的数据
     * @returns {ArrayBuffer}
     */
    sendData:function(_msgId, encodeObj, _destid=0){
        let buf = encodeObj.toArrayBuffer();
        buf = new Uint8Array(buf);
        let bufSize = buf.length;
        let totalSize = this.headSize + bufSize;

        let bufHead = new Array();
        let bytes = ConvertTool.intToBytes(_msgId);
        this.pushToArray(bytes,bufHead);
        bytes = ConvertTool.intToBytes(_destid);
        this.pushToArray(bytes,bufHead);
        let datas = new Uint8Array(totalSize);
        //插入消息头8字节
        for (var i = 0; i < bufSize; i++) {
            datas[i+this.headSize] = buf[i];
        }
        datas.set(bufHead);
        this.dataSize = datas.length;
        return datas;
    },

    Decode(_pbname) {
        let pbNameObj = _pbname.split(".")
        let _buffer = new Uint8Array(this.buffer, this.pos);
        var data = pb[pbNameObj[0]][pbNameObj[1]].decode(_buffer.buffer);
        Log.log("收到消息Decode：",JSON.stringify(data));
        return data;
    },

    toBytes:function(){
        let bytes = new Uint8Array(this.buffer);
        return  bytes;
    },

    pushToArray:function(arr,target){
        let length = arr.length;
        for (let i =0; i< length; i ++){
            target.push(arr[i]);
        }
    },

//----------用于自定义收发数据流----------------------
    /**
     * push一个数组到缓存
     * @param arr
     * @constructor
     */
    // pushToTemp:function(arr)
    // {
    //     let length = arr.length;
    //     for (let i =0; i< length; i ++)
    //     {
    //         this.temp.push(arr[i]);
    //     }
    // },

    // setByte :function (value) {
    //     this.temp.push(value);
    // },
    // setUshort :function (value) {
    //     let bytes = ConvertTool.shortToBytes(value);
    //     this.pushToTemp(bytes);

    // },
    // setShort :function (value) {
    //     let bytes = ConvertTool.shortToBytes(value);
    //     this.pushToTemp(bytes);
    // },
    // setUint :function (value) {
    //     let bytes = ConvertTool.intToBytes(value);
    //     this.pushToTemp(bytes);
    // },
    // setInt :function (value) {
    //     let bytes = ConvertTool.intToBytes(value);
    //     this.pushToTemp(bytes);
    // },
    // setUlong :function (value) {
    //     let bytes = ConvertTool.longToBytes(value);
    //     this.pushToTemp(bytes);
    // },
    // setLong :function (value) {
    //     let bytes = ConvertTool.longToBytes(value);
    //    // Log.log("这个long",bytes);
    //     this.pushToTemp(bytes);
    // },
    // setString :function (size,value) {
    //     var bytes = ConvertTool.stringToByteUnicode(value,size);
    //     this.pushToTemp(bytes);
    // },
});

module.exports = BufferData;