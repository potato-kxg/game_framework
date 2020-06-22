
/**
 * 游戏场景管理
 * @date 2019-07-25
 */

var SceneManager = cc.Class({
    extends: cc.Component,

    ctor: function(){
        // 当前游戏实例
        this.currentGame = undefined;
    },

    statics:{
        _instance: null,
    },

    // 直接加载并切换场景
    // onLaunched:启动后在场景中调用的函数
    loadScene: function(sceneName, onLaunched){
        cc.director.loadScene(sceneName, onLaunched)
    },

    // 预加载场景 无论加载是否完成都可以调用LoadScene切换场景
    // onProgress(completedCount, totalCount):加载进程更改时调用
    //      completedCount:已完成项的数目 
    //      totalCount：总数量
    // onLaunched:加载完成调用
    preloadScene: function(sceneName, onProgress, onLaunched){

        // if(onProgress === undefined && onLaunched === undefined)
        // {
        //
        // }

        cc.director.preloadScene(sceneName, onProgress, onLaunched)
    },

    // 获取当前逻辑场景
    getScene: function(){
        return cc.director.getScene();
    },

    // 设置当前游戏实例
    setCurrentGame: function(game){
        this.currentGame = game;
    },

    // 获取当前游戏实例
    getCurrentGame: function(){
        return this.currentGame;
    },

    clearCurrentGame: function(){
        this.currentGame = undefined;
    },
});

SceneManager._instance = null;
 
SceneManager.getInstance = function(){
    if(!SceneManager._instance){
        SceneManager._instance = new SceneManager();
    }
    return SceneManager._instance;
};
 
module.exports = SceneManager;