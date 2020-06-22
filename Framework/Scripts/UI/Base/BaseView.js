
/* 界面组织层级构造
baseNode:界面根节点
    mask:遮罩节点
    content:界面容器节点
        sprite:界面元素等等 */

var BaseView = cc.Class({
    extends: cc.Component,

    // 构造函数
    ctor: function () {
        // 层级类型
        this.viewType = ViewType.BASE;
        // mask cc.Node
        this.mask = null;
        // content cc.Node
        this.content = null;
        // 是否有遮罩
        this.hasMask = true;
        // 是否点击mask关闭
        this.touchMaskClose = true;
        // 是否需要弹窗动画
        this.isOpenAni = false;
        // 关闭后界面是否需要销毁
        this.needDestroy = false;
        // 动画时间
        this.duringAni = 0.2;
        // 界面关闭回调
        this.closeCallBack = null;
        // 界面是否已打开
        this.isOpen = false;
    },

    onLoad() {
        if(!this.mask && this.hasMask){
            this.mask = this.node.getChildByName("mask");
            if(this.mask){
                var blockEvent = this.mask.getComponent(cc.BlockInputEvents);
                if(!blockEvent){
                    this.mask.addComponent(cc.BlockInputEvents);
                }
            }
        }
        if(!this.content){
            this.content = this.node.getChildByName("content");
            if(this.content){
                var blockEvent = this.content.getComponent(cc.BlockInputEvents);
                if(!blockEvent){
                    this.content.addComponent(cc.BlockInputEvents);
                }
            }
        }
        cc.log("BaseView.onLoad");
        this.registMaskEvent();
    },

    // 注册mask点击事件
    registMaskEvent: function(){
        if(this.hasMask)
        {
            if(this.mask != null && this.touchMaskClose)
            {
                this.mask.on(cc.Node.EventType.TOUCH_END, this.onClickMask, this);
            }
        }
    },

    onClickMask: function () {
        if(this.touchMaskClose){
            this.onClose();
        }
    },

    onClose: function(){
        SoundManager.playButtonSound();
        this.close();
    },

    // 设置mask节点
    setMask: function(mask) {
        this.mask = mask;
    },

    // 设置界面容器节点
    setContent: function(content) {
        this.content = content;
    },

    // 界面隐藏
    close: function() {
        if(!this.node.active){
            return;
        }
        this.setActive(false);
        if(this.needDestroy){
            this.node.destroy();
        }
    },

    // 界面显示
    open: function(data) {
        this.setData(data);
        cc.log("open:",this.node.name, data);
        if(this.isOpen){
            return;
        }
        this.setActive(true);
        if(this.isOpenAni){
            if(this.content instanceof cc.Node){
                this.content.setScale(0.7);
                var scaleNormal = cc.scaleTo(0.1, 1);
                this.content.runAction(scaleNormal);
            }
        }
    },

    setActive: function(active){
        this.node.active = active;
        this.isOpen = active;
        if(!active){
            if(this.closeCallBack){
                this.closeCallBack();
            }
        }
        else  //设置同级最前方
        {
            let index = this.node.parent.childrenCount - 1;
            this.node.setSiblingIndex(index);
        }
    },

    setContentPos: function(x, y){
        if(this.content){
            this.content.setPosition(x, y);
        }
    },

    // 设置数据/回调 等
    setData: function(data){
    },

    findObj: function(path){
        
    },

    onDestroy: function(){
        EventCustom.off(this.node);
    },
});

module.exports = BaseView;
