
/**
 * 资源加载器
 * @date 2019-07-25
 */
var ResLoader = cc.Class({
    extends: cc.Component,

    ctor: function(){
    },

    /**
     * 描述
     * @date 2019-07-25
     * @param {resources子目录名} name
     */
    init: function(name) { 
        this.name = name;
        this.basePath = name;
        this.resCacheList = {};
    },

// ----------------------------------加载本地resources目录资源--------------------------------

    // 加载单张图片SpriteFrame
    loadSprite: function(atlasName, spName, complete)
    {
        var loadPath = this.basePath + "/" + AppConst.PathCfg.SpriteAtlasDirName + "/" + atlasName + "/" + spName;
        var res = cc.loader.getRes(loadPath);
        if (res){
            if (complete){
                complete(res);
            }
        }else{
            var self = this;
            cc.loader.loadRes(loadPath, cc.SpriteFrame, function(error, SpriteFrame)
            {
                if(error) {
                    cc.log("LoadSprite:失败 路径", loadPath);
                    return;
                }
                if(complete){
                    complete(SpriteFrame);
                    self.addResCache(loadPath, cc.SpriteFrame);
                }
            });
        }
    },

    // 从图集加载资源
    loadSpriteFromAtlas: function(atlasName, spName, complete){
        this.loadAtlas(atlasName, function(atlas){
            var spriteFrame = atlas.getSpriteFrame(spName);
            if(complete){
                complete(spriteFrame);
            }
        })
    },

    // 加载图集中所有资源
    loadSpritesFromAtlas: function(atlasName, complete){
        this.loadAtlas(atlasName, function(atlas){
            var spriteFrames = atlas.getSpriteFrames();
            if(complete){
                complete(spriteFrames);
            }
        })
    },

    // 加载Prefab
    loadPrefab: function(name, complete)
    {
        var loadPath = this.basePath + "/" + AppConst.PathCfg.PrefabsDirName + "/" + name;
        var res = cc.loader.getRes(loadPath);
        if (res){
            if (complete){
                complete(res);
            }
        }else{
            var self = this;
            cc.loader.loadRes(loadPath, cc.Prefab, function(error, Prefab)
            {
                if(error) {
                    cc.log("loadPrefab:失败 路径", loadPath);
                    return;
                }
                if(complete){
                    complete(Prefab);
                    self.addResCache(loadPath, cc.Prefab);
                }
            });
        }
    },

    // 加载SpriteAtlas
    loadAtlas: function(name, complete)
    {
        var loadPath = this.basePath + "/" + AppConst.PathCfg.SpriteAtlasDirName + "/" + name + "/" + name;
        var res = cc.loader.getRes(loadPath);
        if (res){
            if (complete){
                complete(res);
            }
        }else{
            var self = this;
            cc.loader.loadRes(loadPath, cc.SpriteAtlas, function(error, SpriteAtlas)
            {
                if(error) {
                    cc.log("loadAtlas:失败 路径", loadPath);
                    return;
                }
                if(complete) {
                    complete(SpriteAtlas);
                    self.addResCache(loadPath, cc.SpriteAtlas);
                }
            });
        }
    },

    // 加载AudioClip
    loadAudioClip: function(name, complete)
    {
        var loadPath = this.basePath + "/" + AppConst.PathCfg.SoundsDirName + "/" + name;
        var res = cc.loader.getRes(loadPath);
        if (res){
            if (complete){
                complete(res);
            }
        }else{
            var self = this;
            cc.loader.loadRes(loadPath, cc.AudioClip, function(error, AudioClip)
            {
                if(error) {
                    cc.log("loadAudioClip:失败 路径", loadPath);
                    return;
                }
                if(complete) {
                    complete(AudioClip);
                    self.addResCache(loadPath, cc.AudioClip);
                }
            });
        }
    },

    loadJsonFile: function (loadPath, complete) {
        var res = cc.loader.getRes(loadPath);
        if (res){
            if (complete){
                complete(res);
            }
        }else{
            var self = this;
            cc.loader.loadRes(loadPath, cc.JsonAsset, function(error, JsonFile)
            {
                if(error) {
                    cc.log("loadJsonFile:失败 路径", loadPath);
                    return;
                }
                if(complete) {
                    complete(JsonFile);
                    self.addResCache(loadPath, cc.JsonAsset);
                }
            });
        }
    },

    // 加载整个目录下的所有资源
    // path:文件目录
    loadResDir: function(path, complete)
    {
        cc.loader.loadResDir(path, function(error, assets)
        {
            if(error) {
                cc.log("LoadResDir:", error);
                return;
            }
            if(complete) {
                complete(assets);
            }
        });
    },

    // 加载整个目录下的所有相同类型资源 并返回他们的路径
    // path:文件目录
    // type:资源类型(如：cc.SpriteFrame)
    loadResDir: function(path, type, complete)
    {
        cc.loader.loadResDir(path, function(error, assets, paths)
        {
            if(error) {
                cc.log("LoadResDir:", error);
                return;
            }
            if(complete) {
                complete(assets, paths);
            }
        });
    },
    
    // 加载TTFFont
    loadFont: function(name, complete)
    {
        var res = cc.loader.getRes(name);
        if (res){
            if (complete){
                complete(res);
            }
        }else{
            var self = this;
            cc.loader.loadRes(name, cc.TTFFont, function(error, TTFFont)
            {
                if(error) {
                    cc.log("loadFont:失败 路径", name);
                    return;
                }
                if(complete) {
                    complete(TTFFont);
                    self.addResCache(name, cc.AudioClip);
                }
            });
        }
    },

    //查找资源
    findResCache: function (path) {
        let index = this.resCacheList.find(path);
        if (index == -1){
            return null;
        }
        return this.resCacheList[index];
    },

    //添加资源缓存列表
    addResCache: function(_path, _type)
    {
        this.resCacheList[_path] = _type;
    },
    
    //释放动态资源缓存(释放当前资源及其引用计数为-1的资源)
    releaseRes: function(){
        let ks = Object.keys(this.resCacheList);
        for (let i = 0; i < ks.length; i++) {
            // cc.loader.releaseRes(ks[i], this.resCacheList[ks[i]]);
            cc.loader.setAutoRelease(ks[i], false);
            var deps = cc.loader.getDependsRecursively(ks[i]);
            var res = cc.loader.getRes(ks[i]);
            var index = deps.indexOf(res._uuid);
            cc.log("释放资源:",ks[i], index);
            if (index !== -1)
                deps.splice(index, 1);
            cc.loader.release(deps);
        }
        this.resCacheList = {};
    },

});
 
module.exports = ResLoader;