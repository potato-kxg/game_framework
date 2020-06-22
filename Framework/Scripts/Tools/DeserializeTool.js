
// this.UserTest ={//协议例子
//     userBagsLength:'int', //动态对象数组长度(必须以Length结尾)
//     sexs:'byte|3', //数值类型数组
//     nickName:'char|20',//字符串
//     id:'int',//数值类型
//
//     userBags: //对象数组
//         {
//             objs:'structs|userBagsLength', //对象数组长度("|"后面的字段必须和上面定义的相应字段相同，也可以是常量)
//             obj: {   //单个对象
//                 goodId:'int',
//                 goodName:'char|20'
//              }
//         },
//     myBag: //对象
//         {
//             goodId:'int',
//             goodName:'char|20'
//         }
// };

//解析用法
 //deserializeTool.deserializeData(this.UserTest,req);

var ConvertTool = require("ConvertTool");

/**
 * 定义的所有类型
 * @type {{byte: string}}
 */
var definetypes = {
    byte : 'byte',
    short : 'short',
    ushort : 'ushort',
    int : 'int',
    uint : 'uint',
    long : 'long',
    ulong : 'ulong',
};

var typeLength = {
    byte : 1,
    short : 2,
    int : 4,
    long : 8,
};

/**
 * 数据解析类
 * @type {null}
 */
var DeserializeTool = {

    deserializeData:function(obj ,buffer)
    {
       return  this.convertViewToData(buffer.pos , buffer.dataSize,obj,buffer);
    },


    /**
     * view转对象
     * @param offset  偏移
     * @param allSize 总大小
     * @param obj  当前层级对象结构
     * @param buffer BufferData
     * @returns {number[]} 返回值是对象或者对象数组
     */
    convertViewToData:function(offset,allSize, obj ,buffer)
    {
       // Log.log("准备解析",JSON.stringify(obj));
        if(buffer === undefined)//没有调用outit,异常
        {
            Log.warn("对象没有初始化");
            return undefined;
        }

        var objSize = this.getDataLength(obj,buffer);


       // Log.log("要解析的大小",objSize);


        if(allSize != objSize)
        {
            Log.log("这个长度可能不对",allSize ,objSize , JSON.stringify(obj));
        }

        if (allSize != objSize && allSize%objSize == 0)//说明是纯对象数组
        {
            cc.log("长度不等说明是纯数组",allSize,objSize);
            var pos = offset;

            let count = allSize/objSize;

            var result =[count];

            for(let i = 0;i < count; i ++)
            {
                result[i]  = this.getValuefromBytes(pos,objSize,obj,buffer);
                pos += objSize;
            }
            return result;

        }
        else
        {

            var result ={};
            var pos = offset;
            for (let [key,val] of Object.entries(obj))
            {
                var size = this.getDataLength(val , buffer);

                if(isNaN(size))
                {
                    Log.log("这个大小无效,一般出现在对象数组中的objs",val);
                   continue;
                }

                result[key] = this.getValuefromBytes(pos,size,val,buffer);

                if(key.endsWith("Length"))//说明这个字段是后面对象数组的长度
                {
                   // Log.log("找到一个长度key",key);
                    //buffer.lengthMap[key] = result[key];

                   // let tempKey = key;
                    buffer.setKeyLength(key,result[key]);
                }

                pos += size;
            }


            return result;
        }

    },
    /**
     * 从指定view读取数据
     * @param offset 偏移
     * @param size 需要解析的数据大小
     * @param data 解析成data的格式
     * @param buffer BufferData
     * @returns {bigint|*|string|*[]|number|*} 返回值可以是对象，对象数组，基本类型
     */
    getValuefromBytes:function(offset, size, data ,buffer)
    {
        if(typeof(data) === 'object')//说明是对象或者对象数组
        {
            var struct = this.GetStructsCount(data,buffer);

            if(struct.count === 0)//一个对象
            {
                Log.log("一个对象");
                let table = this.convertViewToData(offset, size, data,buffer);
                return table;
            }

            else if(struct.nums === undefined) //一维数组
            {
                let count = this.getDataLength(data,buffer)/size;
                 let onesize = size/count;
                return this.getOneObjArray(offset, onesize, data ,buffer, count);
            }
            else //说明是二维数组
            {
                let count = struct.count;
                let onesize = size/count;

                let chang = struct.nums[0];
                let kuan = struct.nums[1];

              //  Log.log("对象行列",chang,kuan,onesize,count,size);
                let result = [chang];
                for(let i = 0; i < chang; i ++)
                {
                    result[i]=this.getOneObjArray(offset + i*kuan*onesize,onesize, data ,buffer, kuan);
                }
                return result;
            }

        }

        if(data.startsWith(definetypes.byte))//byte,或者byte数组
        {
           return this.getBytes(offset,data,buffer);
        }
        else if(data.startsWith(definetypes.short))//short,或者short数组
        {
           return this.getShorts(offset,data,buffer);
        }
        else if(data.startsWith(definetypes.int))//int,或者int数组
        {
           return this.getInts(offset,data,buffer);
        }
        else if(data.startsWith(definetypes.long))//long,或者long数组
        {
           return this.getLongs(offset,data,buffer);
        }
        else //char[num]类型
        {
            var bytes = new Uint8Array(size);
            for(var i = 0; i < size; i++)
            {
                try  //防止他们有时候字符串长度有问题
                {
                    bytes[i] = buffer.sendView.getInt8(offset +i);
                }
                catch (e) {
                    break;
                }
            }
            return ConvertTool.byteToStringUnicode(bytes);
        }


    },


    /**
     * 获取对象数组的一个维
     * @param offset
     * @param size
     * @param data
     * @param buffer
     * @param structCount
     * @returns {*[]}
     */
    getOneObjArray:function(offset, onesize, data ,buffer,structCount)
    {
        let table = [structCount];

        for(let i = 0;i < structCount; i ++)
        {
           // Log.log("塞一维数组",onesize);
            table[i] = this.convertViewToData(offset, onesize, data.obj,buffer);
            offset += onesize;
        }
        return  table;
    },




    /**
     * 读取byte或byte数组
     * @param offset
     * @param data
     * @param buffer
     * @returns {*[]|number}
     */
    getBytes:function(offset,  data ,buffer)
    {

        if(data === definetypes.byte)
        {
            return buffer.sendView.getUint8(offset);
        }
        return  this.getArrays(offset,  data ,buffer, typeLength.byte);
    },

    getShorts:function(offset,  data ,buffer)
    {
        if(data === definetypes.short)
        {
            return buffer.sendView.getInt16(offset,true);
        }
        return  this.getArrays(offset,  data ,buffer, typeLength.short);
    },

    getInts:function(offset,  data ,buffer)
    {
        if(data === definetypes.int)
        {
            return buffer.sendView.getInt32(offset,true);
        }
        //int数组
        return  this.getArrays(offset,  data ,buffer, typeLength.int);

    },

    getLongs:function(offset,  data ,buffer)
    {

        if(data === definetypes.long)
        {
            return  this.getLong(offset ,buffer) ;
        }
        return  this.getArrays(offset,  data ,buffer, typeLength.long);
    },


    /**
     * 取一个long型
     * @param offset
     * @param buffer
     */
    getLong:function(offset ,buffer)
    {
        let bytes = [];
        for (let i = 0;i < 8; i ++)
        {
            bytes.push(buffer.sendView.getUint8(offset + i));
        }
        return ConvertTool.bytesToLong(bytes);

    },
    /**
     * 解析多维数组
     * @param offset
     * @param data
     * @param buffer
     * @param flag
     */
    getArrays:function(offset,  data ,buffer, flag)
    {
        var size = flag;//根据类型决定大小

        let struct = this.getArrayLength(data);

        if(struct.nums === undefined) //一维数组
        {
            let count = this.getDataLength(data)/size;
            return this.getOneArray(offset, buffer, flag , count);
        }
        else //说明是二维数组
        {
            let chang = struct.nums[0];
            let kuan = struct.nums[1];

           // Log.log("行列",chang,kuan);
            let result = [chang];
            for(let i = 0; i < chang; i ++)
            {
                result[i]=this.getOneArray(offset + i*kuan*flag, buffer, flag , kuan);
            }
            return result;
        }
    },

    /**
     * 得到当前维数组
     * @param offset
     * @param buffer
     * @param flag
     * @param count 当前维长度
     */
    getOneArray:function(offset,buffer, flag , count)
    {
        var size = flag;
        let array = [count];

        for (let i = 0; i < count; i ++)
        {
            if(flag === typeLength.byte)
            {
                array[i] = buffer.sendView.getUint8(offset + i*size) ;
            }
            else  if(flag === typeLength.short)
            {
                array[i] = buffer.sendView.getInt16(offset + i*size,true) ;
            }
            else  if(flag === typeLength.int)
            {
                array[i] = buffer.sendView.getInt32(offset + i*size,true) ;
            }
            else  if(flag === typeLength.long)
            {
                array[i] = this.getLong(offset + i*size,buffer) ;
            }
        }
        return  array;
    },


    /**
     * 获取字段长度
     * @param data
     * @returns {number}
     */
    getDataLength:function(data,buffer)
    {
        if(typeof(data) ==="object")
        {
            var structCount = this.GetStructsCount(data,buffer);
           // Log.log("得到对象数量",structCount.count,JSON.stringify(data));
            if(structCount.count == 0)//说明是一个对象
            {
                var size = 0;
                for (let val of Object.values(data)) {
                    let onesize = this.getDataLength(val,buffer);
                    if(onesize < Number.MAX_VALUE)
                    {
                       //  Log.log("每个对象的长度",onesize,val);

                        size += onesize;
                    }
                }
                return size;
            }
            else  //对象数组
            {
                return structCount.count * this.getDataLength(data.obj);
            }
        }

        if(data.startsWith(definetypes.byte))
        {
            if(data === definetypes.byte)
            {
                return 1;
            }
            return Number(data.split('|')[1]);
        }
        else if(data.startsWith(definetypes.short))
        {
            if(data === definetypes.short)
            {
                return 2;
            }
            return Number(data.split('|')[1]) *2;
        }
        else if(data.startsWith(definetypes.int))
        {
            if(data === definetypes.int)
            {
                return 4;
            }

            return this.getArrayLength(data).count *4;
        }
        else if(data.startsWith(definetypes.long))
        {
            if(data === definetypes.long)
            {
                return 8;
            }
            return Number(data.split('|')[1]) *8;
        }
        else if(data.startsWith('char')) //char|num类型
        {
            let chang = Number(data.toString().slice(5)) * 2;
            return chang;
        }
        else
        {
            return 0;
        }
    },
    /**
     * 获取基本类型多维数组总长度
     * @param data
     * @returns {string|number}
     */
    getArrayLength:function(data)
    {
        let nums = data.split('|');

        let result = {};

        if(nums.length - 1 == 1)
        {
            result.count = Number(nums[1]);

            return result;
        }
        else //最多二维数组,否则说明他设计有问题
        {
            let i = Number(nums[1]);
            let j = Number(nums[2]);

            result.count = i*j;
            result.nums = [];
            result.nums.push(i);
            result.nums.push(j);
            return result;
        }
    },



    /**
     * 获取对象数组数量,如果不是数组，则为0
     * @param data
     */
    GetStructsCount:function (data,buffer) {
        let result = {};

        if(data.objs === undefined )//没有这个字段就不是对象数组
        {
          //  Log.log("data.objs === undefined");

            result.count = 0;
            return result;
        }
        if(buffer === undefined)
        {
            Log.log("buffer === undefined");
            result.count = 0;
            return result;
        }

       // Log.log(data,"StructsCount");
        let nums = data.objs.split('|');

        if(nums.length - 1 == 1)//一维数组
        {
            let key = nums[1];

            //固定大小的对象数组
            if(key.isNumeric())
            {
                result.count = Number (key);
            }
            else //动态长度
            {
                result.count = buffer.lengthMap[key];
            }
            return result;
        }
        else //最多二维数组,否则说明他设计有问题(一定是固定长度)
        {
            let i = Number(nums[1]);
            let j = Number(nums[2]);

            result.count = i*j;
            result.nums = [];
            result.nums.push(i);
            result.nums.push(j);
            return result;
        }
    },
};

module.exports = DeserializeTool;