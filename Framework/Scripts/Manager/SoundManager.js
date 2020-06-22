
/**
 * 声音管理
 * @date 2019-07-25
 */

var SoundManager = cc.Class({
    extends: cc.Component,

    properties: {
    },

    ctor: function(){
        this.allSource = [];
        // Log.log("SoundManager:ctor");
        this.soundType = {
            // 背景声音
            backSound: 0,
            // UI声音
            uiSound: 1,
            // 牌声音
            paiSound: 2,
            // 特效声音
            effectSound: 3,
            // 角色声音
            personSound: 4,
            // 聊天短语声音
            chatSound: 5,
            // 操作
            operateSound: 6,
            // 道具
            propSound: 7,
            // 牌桌
            deskSound: 8,
            // 麻将碰撞
            mjSound: 9,
            // 同时播放多音效
            effectSound1: 10,
            effectSound2: 11,
            effectSound3: 12,
            effectSound4: 13,
            effectSound5: 14,
            effectSound6: 15,
            effectSound7: 16,
            effectSound8: 17,
        };
        //背景声音开关
        this.backSoundEnable = true;
        //其他声音开关
        this.otherSoundEnable = true;
        //当前音效大小
        this.currSoundEffectVal = 1;
    },

    statics:{
        _instance: null,
    },

    onLoad () {
        var soundNames = ["backSound","uiSound","paiSound","effectSound","personSound","chatSound","operateSound","propSound","deskSound","mjSound",
            "effectSoundOne","effectSoundTwo","effectSoundThree","effectSoundFour","effectSoundFive","effectSoundSix","effectSoundSeven","effectSoundEight"];

        for(var i = 0 ; i < soundNames.length; i++)
        {
            var soundNode = new cc.Node();
            soundNode.name = soundNames[i];
            this.allSource[i] = soundNode.addComponent(cc.AudioSource);
            this.node.addChild(soundNode);
        }
    },

    start () {
        if(cc.sys.localStorage.getItem(AppConst.LocalKey.isOpenBackGroundKey)){
            this.backSoundEnable = cc.sys.localStorage.getItem(AppConst.LocalKey.isOpenBackGroundKey) != 0;
        }else{
            cc.sys.localStorage.setItem(AppConst.LocalKey.isOpenBackGroundKey, 1)
            cc.sys.localStorage.setItem(AppConst.LocalKey.backGroundKey, this.currSoundEffectVal)
        };

        if(cc.sys.localStorage.getItem(AppConst.LocalKey.isOpenSoundEffectKey)){
            this.otherSoundEnable = cc.sys.localStorage.getItem(AppConst.LocalKey.isOpenSoundEffectKey) != 0
        }else{
            cc.sys.localStorage.setItem(AppConst.LocalKey.isOpenSoundEffectKey, 1)
            cc.sys.localStorage.setItem(AppConst.LocalKey.soundEffectKey, this.currSoundEffectVal)
        };

        this.setBackSoundEnable(this.backSoundEnable)
        this.setOtherSoundEnable(this.otherSoundEnable);
    },

    //-@param name string @名称
    //-@param type number @声音类型   1 背景音乐 >2音效
    //-@param isMale number @声音   1 男同胞 ,2 女同胞
    //@param isOverlap boolean @是否可允许声音重叠 
    playSound: function(name, type = 1, isMale = 0, isOverlap = false){
        if(name == null || name == ""){
            cc.log("声音名称不能为空");
            return;
        }
        var clip = undefined;
        var clipPath = undefined;
        var source = this.allSource[type];
        if(source){
            if(isMale == 1)
            {
                clipPath = "male/" + name;
            }else if(isMale == 2){
                clipPath = "female/" + name;
            }else{
                clipPath = name;
            }
            ResManager.loadAudioClip(clipPath, (clipAsset)=>{
                clip = clipAsset;
                if(clip){
                    source.loop = type == 0;
                    if(isOverlap){
                        cc.audioEngine.play(clip, type == 0, this.currSoundEffectVal);
                    }else{
                        source.clip = clip;
                        source.play();
                    }
                }else{
                    cc.log("不存在clip,路径不对");
                }
            })
        }else{
            cc.log("不存在clip,类型不对");
        }
    },

    playBgSound: function(name){
        cc.log("playBgSound",this.allSource[0],this.soundType.backSound);
        this.playSound(name, this.soundType.backSound);
    },

    stopBgSound: function(){
        var source = this.allSource[this.soundType.backSound];
        source:stop();
    },

    playButtonSound: function(){
        this.playSound("button", this.soundType.uiSound);
    },

    // 牌
    playPaiSound: function(name, male){
        this.playSound(name, this.soundType.paiSound, male);
    },

    // 特效
    playEffectSou: function(name){
        this.playSound(name, this.soundType.effectSound);
    },
    
    // 麻将牌桌
    playDeskSound: function(name){
        this.playSound(name, this.soundType.deskSound);
    },
    
    // 麻将碰撞
    playMahjongSound: function(name){
        this.playSound(name, this.soundType.mjSound);
    },
    
    // 操作
    playOperateSound: function(name, male){
        this.playSound(name, this.soundType.operateSound, male)
    },
    
    // 道具
    playPropSound: function(name){
        this.playSound(name, this.soundType.propSound);
    },

    // 同时要播放很多声音
    //@param site int @座位号 0-7
    playEffectSounds: function(name, male, site){
        if (site > 6){
            return;
        }
        this.soundNameType = "effectSound"  + (site + 1);
        this.playSound(name, this.soundType[this.soundNameType], male);
    },

    // 同时播放多个音效
    //@param isOverlap boolean @声音是否重叠
    playOneShot: function(name, male,isOverlap){
        this.playSound(name, this.soundType.uiSound, male, isOverlap);
    },

    //@param type number @类型
    //@param On_Off boolean @是否打开
    //@param value number @值
    setSoundValue: function(type, On_Off){
        if (type == 0){
            var value = On_Off ? 1:0;
            this.setSoundVal(true, value);
        }else if(type == 1) {
            var value = On_Off ? 1:0;
            this.setSoundVal(false, value);
        }
    },

    //设置背景声音或 其他声音的大小
    setSoundVal: function(isBack, val){
        cc.log("setSoundVal",isBack, val);
        if(isBack){
            this.allSource[0].volume = val;
        }else{
            for(var i = 1; i < this.allSource.length; i++){
                this.allSource[i].volume = val;
            }
        }
    },

    playEffect: function(name, isMale){
        this.playOneShot(name, isMale, true);
    },

    setOtherSoundEnable: function(value) {
        this.otherSoundEnable = value;
        var saveValue = value ? 1 : 0;
        cc.sys.localStorage.setItem(AppConst.LocalKey.isOpenSoundEffectKey, saveValue)
        this.setSoundValue(1, value);
    },

    setBackSoundEnable: function(value) {
        this.backSoundEnable = value;
        var saveValue = value ? 1 : 0;
        cc.sys.localStorage.setItem(AppConst.LocalKey.isOpenBackGroundKey, saveValue)
        this.setSoundValue(0, value);
    },

    getBackSoundEnable: function(){
        var value = cc.sys.localStorage.getItem(AppConst.LocalKey.isOpenBackGroundKey);
        return value == 1;
    },

    getEffectSoundEnable: function(){
        return cc.sys.localStorage.getItem(AppConst.LocalKey.isOpenSoundEffectKey) == 1;
    },
    
});

module.exports = SoundManager;