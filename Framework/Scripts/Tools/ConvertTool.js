
// var JSBI = require("jsbi");

/**
 * 处理基本数据转换的类
 * @type {null}
 */
var ConvertTool = {
    /**
     * 字符串转byte[]
     * @param str
     * @returns {any[]}
     */
    stringToByte:function(str , limit) {
        var bytes = new Array();

        let realLength = 0;

        var len, c;
        len = str.length;
        for(var i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if(c >= 0x010000 && c <= 0x10FFFF) {
                bytes.push(((c >> 18) & 0x07) | 0xF0);
                bytes.push(((c >> 12) & 0x3F) | 0x80);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);

                realLength +=4;
            } else if(c >= 0x000800 && c <= 0x00FFFF) {
                bytes.push(((c >> 12) & 0x0F) | 0xE0);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);

                realLength +=3;
            } else if(c >= 0x000080 && c <= 0x0007FF) {
                bytes.push(((c >> 6) & 0x1F) | 0xC0);
                bytes.push((c & 0x3F) | 0x80);
                realLength +=2;
            } else {
                bytes.push(c & 0xFF);
                realLength ++;
            }
        }

        if(limit != undefined)//有限定
        {
            if(limit <= realLength)
            {
                return bytes.slice(0,limit);
            }
            else
            {
                let need = limit - realLength;
                for (let i = 0; i < need; i ++)
                {
                    bytes.push(0);
                }
            }
        }
        else
        {
            Log.log("没有定义限定");
        }

        return bytes;


    },


    /**
     * byte[]转字符串
     * @param arr
     * @returns {string|string|string}
     */
    byteToString:function(arr) {
        if (typeof arr === 'string') {
            return arr;
        }
        var str = '',
            _arr = arr;
        for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for (var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
        return str;

    },


    /**
     * 字符串转byte[] Unicode
     * @param str
     * @param limit
     * @returns {any[]}
     */
    stringToByteUnicode:function(str , limit)
    {
        var bytes = new Array();

        let realLength = 0;

        var len, c;
        len = str.length;
        for(var i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            // if(c < 0xff)
            // {
            //     bytes.push(c);
            //     realLength++;
            // }
            // else
            // {
                bytes.push(c & 0xFF);
                bytes.push((c >> 8) & 0xFF); //这个是高位(01)
                realLength += 2;
            // }
        }

        if(limit != undefined)//有限定
        {
            if(limit *2  <= realLength) //乘以2是因为unicode两个字节
            {
                return bytes.slice(0,limit * 2);
            }
            else
            {
                let need = limit *2  - realLength;
                for (let i = 0; i < need; i ++)
                {
                    bytes.push(0);
                }
                // Log.log(bytes.length);
                // Log.log("限定长度",limit,"真实长度",realLength);
            }
        }
        else
        {
            Log.log("没有定义限定");
        }

        return bytes;
    },



    /**
     * byte[]转字符串 Unicode
     * @param arr
     * @returns {string|string|string}
     */
    byteToStringUnicode:function(arr) {
        if (typeof arr === 'string') {
            return arr;
        }
        var str = '',
            _arr = arr;

        let highNum = 0;//高位
        let lowNum = 0;//低位
        for (var i = 0; i < _arr.length; i+=2)
        {
            highNum = _arr[i +1];
            lowNum = _arr[i];
            if(highNum != 0)
            {
                str += String.fromCharCode((highNum << 8) + _arr[i]);
            }
            else if(lowNum != 0)
            {
                str += String.fromCharCode(lowNum);
            }
        }
        return str.trim();
    },
    /**
     * short转bytes
     * @param sho
     * @returns {any[]}
     */
    shortToBytes:function(sho)
    {
        var bytes = new Array();
        bytes.push(sho & 0xFF);
        bytes.push((sho >> 8) & 0xFF); //这个是高位(01)
        return bytes;
    },

    /**
     * int转bytes
     * @param value
     * @returns {any[]}
     */
    // intToBytes:function(value)
    // {
    //     var bytes = new Array();
    //     bytes.push(value & 0xFF);
    //     bytes.push((value >> 8) & 0xFF);
    //     bytes.push((value >> 16) & 0xFF);
    //     bytes.push((value >> 24) & 0xFF); //这个是高位(01)
    //     return bytes;
    // },
    
    intToBytes:function(value)
    {
        var bytes = new Array();
        bytes.push((value >> 24) & 0xFF); //这个是高位(01)
        bytes.push((value >> 16) & 0xFF);
        bytes.push((value >> 8) & 0xFF);
        bytes.push(value & 0xFF);
        return bytes;
    },
    /**
     * long转bytes
     * @param value
     * @returns {any[]}
     */
    longToBytes:function(value)
    {
        var bytes = new Array();
        // for (let i = 0; i < 8;i ++)//很多浏览器不支持Bigint，所以换jsbi
        // {
        //     let big = (BigInt (value) >> BigInt( i *8)) & BigInt( 0xFF);
        //     bytes.push( Number (big) );
        // }

        //暂时去掉JSBI支持
        // for (let i = 0; i < 8;i ++)
        // {
        //     let res = JSBI.BigInt(value);
        //     let offset = JSBI.BigInt(i *8);
        //     let ff = JSBI.BigInt(0xff);
        //    // let big = (BigInt (value) >> BigInt( i *8)) & BigInt( 0xFF);
        //     let big = JSBI.bitwiseAnd(JSBI.signedRightShift(res,offset), ff);
        //     bytes.push( Number (big) );
        // }
        return bytes;
    },


    bytesToLong:function(bytes)
    {
        let result = 0;

        for (let i = 0;i < 8; i ++)
        {
            result += (bytes[i]&0xff) << (i*8);
        }
        return result;
    },

    /**
     *  游戏内金币字符串转化成int
     * @param value
     * @returns {number}
     */
    gold_tToLong:function( value)
    {
        return parseInt(parseFloat(value)* 100);
    },

    /**
     * 金币转string,小数点两位
     * @param value
     */
    goldToString:function(value)
    {
       // return Math.floor(value * 100)/100;
        return value.toFixed(2);
    },

    /**
     * 这种方式支持更大精度
     * @param value
     * @returns {number}
     */
    goldToStringForSlider:function(value)
    {
         return Math.floor(value * 100)/100;
       // return value.toFixed(2);
    },


    /**
     * 对象序列化（因为json不支持long）
     * @param data
     */
    dataToString:function(data)
    {
        let self = this;
        var result = "{";
        for (let [key,val] of Object.entries(data))
        {
            if(val != null) //有值
            {
                if(typeof (val) === "object")
                {
                    if(val[0] ===undefined)//说明不是对象数组
                    {
                        result += "\"" + key + "\"" +":"+ self.dataToString(val);
                    }
                    else
                    {
                        let length = val.length;
                        var arrValue = "";
                        for(let i = 0;i < length; i ++)
                        {
                            arrValue += self.dataToString(val[i]) + ",";
                        }

                        arrValue = arrValue.slice(0,arrValue.length-1);
                        arrValue +="],";
                        result += "\"" + key + "\"" +":["+arrValue;
                    }
                }
                else
                {
                    if(typeof (val) === "string") //字符串类型有冒号
                    {
                        result += this.makeJson(key,val);
                    }
                    else
                    {
                        result += this.makeDataJson(key,val);
                    }
                }
            }

        }

        if(result.endsWith(','))
        {
            result = result.slice(0,result.length-1);
        }

        result += "}";
        return result;
    },


    makeJson:function(key ,val)
    {
        return  "\"" + key + "\"" +":"+ "\"" + val + "\"" +",";
    },

    makeDataJson:function(key ,val)
    {
        return  "\"" + key + "\"" +":"+  val +",";
    },


    /**
     * 协议命令字
     * @param main
     * @param sub
     * @returns {string}
     */
    createCmd:function (main,sub) {
        return main + "_" + sub;
    }

};

module.exports = ConvertTool;


