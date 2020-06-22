/**
 * Scene适配
 * @type {null}
 */
cc.Class({
    extends: cc.Component,
    properties: {

    },

    onLoad() {
        cc.log('----SceneAdapt onLoad')
        cc.game.addPersistRootNode(this.node);
        cc.view.setResizeCallback(() => this.onResize());
        this.adapt();
        cc.find()
    },


    onResize() {
        // GameEvent.emit("View_RESIZE");
        this.adapt();
    },

    adapt() {
        let canvas = cc.director.getScene().getChildByName('Canvas').getComponent(cc.Canvas)
        // 实际屏幕比例
        let screenRatio = cc.winSize.width / cc.winSize.height;
        // // 设计比例
        let designRatio = canvas.designResolution.width / canvas.designResolution.height;
        //
        cc.log('----SceneAdapt adapt', cc.winSize.width, ',', cc.winSize.height, ',',
        canvas.designResolution.width, ',', canvas.designResolution.height)

        // 判断实际屏幕宽高比
        if (screenRatio <= 1.5) {
            // 此时屏幕高度大于宽度
            if (screenRatio <= designRatio) {
                this.setFitWidth();
            } else {
                // 此时实际屏幕比例大于设计比例
                // 为了保证纵向的游戏内容不受影响，应使用 fitHeight 模式
                this.setFitHeight();
            }
        } else {
            // 此时屏幕高度小于宽度
            this.setFitHeight();
        }
    },

    setFitHeight() {
        cc.log('---set 横批')
        let canvas = cc.director.getScene().getChildByName('Canvas').getComponent(cc.Canvas)
        canvas.fitHeight = true;
        canvas.fitWidth = false;
        // cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE)
    },

    setFitWidth() {
        cc.log('---set 书品')
        let canvas = cc.director.getScene().getChildByName('Canvas').getComponent(cc.Canvas)
        canvas.fitHeight = false;
        canvas.fitWidth = true;
        // cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT)
    },
});
