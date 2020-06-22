
/**
 * ��Դ������
 * @date 2019-07-25
 */
var ResLoader = cc.Class({
    extends: cc.Component,

    ctor: function(){
    },

    /**
     * ����
     * @date 2019-07-25
     * @param {resources��Ŀ¼��} name
     */
    init: function(name) { 
        this.name = name;
        this.basePath = name;
        this.resCacheList = {};
    },

// ----------------------------------���ر���resourcesĿ¼��Դ--------------------------------

    // ���ص���ͼƬSpriteFrame
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
                    cc.log("LoadSprite:ʧ�� ·��", loadPath);
                    return;
                }
                if(complete){
                    complete(SpriteFrame);
                    self.addResCache(loadPath, cc.SpriteFrame);
                }
            });
        }
    },

    // ��ͼ��������Դ
    loadSpriteFromAtlas: function(atlasName, spName, complete){
        this.loadAtlas(atlasName, function(atlas){
            var spriteFrame = atlas.getSpriteFrame(spName);
            if(complete){
                complete(spriteFrame);
            }
        })
    },

    // ����ͼ����������Դ
    loadSpritesFromAtlas: function(atlasName, complete){
        this.loadAtlas(atlasName, function(atlas){
            var spriteFrames = atlas.getSpriteFrames();
            if(complete){
                complete(spriteFrames);
            }
        })
    },

    // ����Prefab
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
                    cc.log("loadPrefab:ʧ�� ·��", loadPath);
                    return;
                }
                if(complete){
                    complete(Prefab);
                    self.addResCache(loadPath, cc.Prefab);
                }
            });
        }
    },

    // ����SpriteAtlas
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
                    cc.log("loadAtlas:ʧ�� ·��", loadPath);
                    return;
                }
                if(complete) {
                    complete(SpriteAtlas);
                    self.addResCache(loadPath, cc.SpriteAtlas);
                }
            });
        }
    },

    // ����AudioClip
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
                    cc.log("loadAudioClip:ʧ�� ·��", loadPath);
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
                    cc.log("loadJsonFile:ʧ�� ·��", loadPath);
                    return;
                }
                if(complete) {
                    complete(JsonFile);
                    self.addResCache(loadPath, cc.JsonAsset);
                }
            });
        }
    },

    // ��������Ŀ¼�µ�������Դ
    // path:�ļ�Ŀ¼
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

    // ��������Ŀ¼�µ�������ͬ������Դ ���������ǵ�·��
    // path:�ļ�Ŀ¼
    // type:��Դ����(�磺cc.SpriteFrame)
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
    
    // ����TTFFont
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
                    cc.log("loadFont:ʧ�� ·��", name);
                    return;
                }
                if(complete) {
                    complete(TTFFont);
                    self.addResCache(name, cc.AudioClip);
                }
            });
        }
    },

    //������Դ
    findResCache: function (path) {
        let index = this.resCacheList.find(path);
        if (index == -1){
            return null;
        }
        return this.resCacheList[index];
    },

    //�����Դ�����б�
    addResCache: function(_path, _type)
    {
        this.resCacheList[_path] = _type;
    },
    
    //�ͷŶ�̬��Դ����(�ͷŵ�ǰ��Դ�������ü���Ϊ-1����Դ)
    releaseRes: function(){
        let ks = Object.keys(this.resCacheList);
        for (let i = 0; i < ks.length; i++) {
            // cc.loader.releaseRes(ks[i], this.resCacheList[ks[i]]);
            cc.loader.setAutoRelease(ks[i], false);
            var deps = cc.loader.getDependsRecursively(ks[i]);
            var res = cc.loader.getRes(ks[i]);
            var index = deps.indexOf(res._uuid);
            cc.log("�ͷ���Դ:",ks[i], index);
            if (index !== -1)
                deps.splice(index, 1);
            cc.loader.release(deps);
        }
        this.resCacheList = {};
    },

});
 
module.exports = ResLoader;