
var HttpHelper =  cc.Class({

    ctor: function(){
        this.textures ={}; //图片缓存
    },
    
    httpGet:function (url , callBack, errorBack) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                cc.log('收到http消息 地址=>',url,'消息=>',response);
                if(callBack != undefined)
                {
                    callBack(response);
                }
            }else{
                if(errorBack != undefined){
                    errorBack(xhr);
                }
            }
        };
        xhr.timeout = AppConst.HttpTimeout;
        xhr.open("GET", url, true);
        xhr.send();
    },

    httpPost:function (url ,params, callBack, errorBack) {
        try
        {
            let para = "";
            let flag = false;
            for (let [key,val] of Object.entries(params)) {
                if(!flag)
                {
                    flag = true;
                }
                else
                {
                    para += "&";
                }
                para += key +"="+val;
            }

            Log.log("请求httpPost=>",url,para);


            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                //  Log.log("xhr.readyState",xhr.readyState,xhr.status);
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    var response = xhr.responseText;
                    Log.log('收到http消息 地址=>',url,params,'消息=>',response);
                    if(callBack != undefined)
                    {
                        callBack(response);
                    }
                }else{
                    if(errorBack != undefined){
                        errorBack(xhr);
                        Log.log('http=>错误',url,params,'消息=>',xhr);
                    }
                }
            };
            xhr.timeout = AppConst.HttpTimeout;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            // xhr.setRequestHeader("Content-Type","application/json");

            xhr.send(para);
        }
        catch (e) {
            Log.warn("http出错",e);
        }

    },

    /**
     * 下载图片
     * @param url
     * @param sprite
     */
    downloadTexture:function (url,sprite) {

        if(this.textures[url])
        {
            sprite.spriteFrame = this.textures[url];
            return;
        }
        if (!url) return;

        let self = this;
        var loadCom = function (err, img) {
            if (err) return;

            let spriteFrame = new cc.SpriteFrame(img);
            self.textures[url]= spriteFrame;
            sprite.spriteFrame = spriteFrame;

        };
        cc.loader.load({url: url, type: 'png'}, null, loadCom);
    },
    /**
     * 清理图片缓存
     * @param url
     */
    cleanTextureCache:function(url)
    {
        if(this.textures[url])
        {
           this.textures[url] = null;
        }
    },

});

HttpHelper._instance = null;
HttpHelper.Instance = function () {
    if(!HttpHelper._instance){
        HttpHelper._instance = new HttpHelper();
    }
    return HttpHelper._instance;
}

module.exports = HttpHelper;