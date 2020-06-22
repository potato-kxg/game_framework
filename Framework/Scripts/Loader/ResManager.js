
/**
 * 资源加载器管理、
 * 管理多个ResLoader,一个子游戏能依赖多个资源包
 * @date 2019-07-25
 */

var ResLoader = require("ResLoader");

var ResManager = cc.Class({
    extends: cc.Component,

    statics:{
        _instance: null,
    },

    ctor: function(){
        this.loaders = {};
        this.netResLoader = new ResLoader();
        this.netResLoader.init("netRes");
    },

    loadSprite: function(atlasName, spName, complete){
        for (var key in this.loaders) {
            cc.log("loadSprite:", key);
            if(this.loaders[key]){
                this.loaders[key].loadSprite(atlasName, spName, function(sprite){
                    if(complete){
                        complete(sprite);
                    }
                });
            }
        }
    },

    loadSpriteFromAtlas: function(atlasName, spName, complete){
        for (var key in this.loaders) {
            if(this.loaders[key]){
                this.loaders[key].loadSpriteFromAtlas(atlasName, spName, function(sprite){
                    if(complete){
                        complete(sprite);
                    }
                });
            }
        }
    },

    loadSpritesFromAtlas: function(atlasName, complete){
        for (var key in this.loaders) {
            if(this.loaders[key]){
                this.loaders[key].loadSpritesFromAtlas(atlasName, function(sprites){
                    if(complete){
                        complete(sprites);
                    }
                });
            }
        }
    },

    loadPrefab: function(name, complete){
        for (var key in this.loaders) {
            if(this.loaders[key]){
                this.loaders[key].loadPrefab(name, function(prefab){
                    if(complete){
                        complete(prefab);
                    }
                });
            }
        }
    },

    loadAtlas: function(name, complete){
        for (var key in this.loaders) {
            if(this.loaders[key]){
                this.loaders[key].loadAtlas(name, function(atlas){
                    if(complete){
                        complete(atlas);
                    }
                });
            }
        }
    },

    loadAudioClip: function(name, complete){
        for (var key in this.loaders) {
            if(this.loaders[key]){
                this.loaders[key].loadAudioClip(name, function(clip){
                    if(complete){
                        complete(clip);
                    }
                });
            }
        }
    },

    loadFont: function(name, complete){
        for (var key in this.loaders) {
            if(this.loaders[key]){
                this.loaders[key].loadFont(name, function(font){
                    if(complete){
                        complete(font);
                    }
                });
            }
        }
    },

    // 加载一个资源模块下一个文件夹下的所有资源
    // 例：加载common/SpriteAtlas目录, loadResDir("common", "SpriteAtlas", "cc.SpriteFrame", function)
    loadResDir: function(basePath, dirName, complete)
    {
        if(this.loaders[basePath]){
            var path = basePath+"/"+dirName;
            this.loaders.loadResDir(path, function(assets){
                if(complete){
                    complete(assets);
                }
            });
        }
    },

    // 加载一个资源模块下一个文件夹下的所有相同类型资源
    // 例：加载common/SpriteAtlas目录, loadResDir("common", "SpriteAtlas", function)
    loadResDirByType: function(basePath, dirName, type, complete)
    {
        if(this.loaders[basePath]){
            var path = basePath+"/"+dirName;
            this.loaders.loadResDir(path, type, function(assets, paths){
                if(complete){
                    complete(assets, paths);
                }
            });
        }
    },

    // 添加资源目录依赖
    addDepend: function(name){
        var loader = new ResLoader();
        loader.init(name);
        this.addLoader(name, loader);
    },

    addLoader: function(name, loader){
        if(this.loaders[name]){
            cc.log(name,"loader已经存在");
            return;
        }
        this.loaders[name] = loader;
    },

    removeLoader: function(name){
        if(this.loaders[name]){
            delete this.loaders[name];
        }
    },

    //清除资源引用、释放动态资源
    clearDepends: function()
    {
        for(var name in this.loaders)
        {
            this.loaders[name].releaseRes();
            this.removeLoader(name);
        }
        delete this.netResLoader;
    },
// ----------------------------------加载服务器资源--------------------------------

    // 带资源后缀加载
    // url:http://127.0.0.1:6080/bg.mp3
    downloadAsset: function(url, complete)
    {
        let frame = this.netResLoader.findResCache(url)
        if(frame){
            if(complete){
                complete(frame);
            }
            return;
        }

        cc.loader.load(url, function(error, asset)
        {
            if(error) {
                cc.log("DownloadAsset:url=", url);
                return;
            }
            this.netResLoader.addResCache(url, asset);
        if(complete){
            complete(asset);
        }
    });
    },

    // 不带资源后缀加载
    // url:http://127.0.0.1:6080/bg
    // type: "mp3"/"json" 或 "mydata"自定义文件类型
    downloadAsset: function(url, type, complete)
    {
        let path = url + "." + type;
        let frame = this.netResLoader.findResCache(path)
        if(frame){
            if(complete){
                complete(frame);
            }
            return;
        }

        cc.loader.load({url, type}, function(error, asset)
        {
            if(error) {
                cc.log("DownloadAsset:url=", url);
                return;
            }
            this.netResLoader.addResCache(path, asset);
            if(complete){
                complete(asset);
            }
        });
    },

});

ResManager._instance = null;
 
ResManager.getInstance = function(){
    if(!ResManager._instance){
        ResManager._instance = new ResManager();
    }
    return ResManager._instance;
};

module.exports = ResManager;

