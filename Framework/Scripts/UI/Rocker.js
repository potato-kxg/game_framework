// Rocker.js

cc.Class({
    extends: cc.Component,

    properties: {
        sceneNode: {    // 场景节点
            type: cc.Node,
            default: null,
        },

        joystick: { // 摇杆节点
            type: cc.Node,
            default: null,
        },

        Max_r: 100,    // 摇杆移动半径，根据自己美术资源进行调整

        isFixation: true, // 是否固定位置

        minTrigerDistance: 0.5, //触摸点离原点距离(最小触发更新距离)

        ouToHide: true, // 自动隐藏摇杆
    },

    registUpdatePos(_updaet){
    	this.updateBack = _updaet;
    },

    registUpdateDir(_updaet){
    	this.updateDirBack = _updaet;
    },

    onLoad() {
    	this.touchMoveDistance = 0;

        // 隐藏摇杆组件节点
        if(this.ouToHide){
        	this.node.active = false;
        }

        // 获取摇杆节点并初始化摇杆节点位置及角度
        this.joystick.setPosition(cc.v2(0, 0));
        this.dir = cc.v2(0, 0);

        // 注册父节点的 touch 监听事件
        this.sceneNode.on(cc.Node.EventType.TOUCH_START, this.cbTouchStart, this);
        this.sceneNode.on(cc.Node.EventType.TOUCH_MOVE, this.cbTouchMove, this);
        this.sceneNode.on(cc.Node.EventType.TOUCH_END, this.cbTouchEnd, this);
        this.sceneNode.on(cc.Node.EventType.TOUCH_CANCEL, this.cbTouchCancel, this);
    },

    update(dt) {
        if (this.dir.mag() < 0.5 || this.touchMoveDistance < this.minTrigerDistance) {
            return;
        }
        var dirct = this.getDirection();
        if(this.updateBack){
        	this.updateBack(dirct, dt);
        }
    },

    getAngle() {
        var r = Math.atan2(this.dir.y, this.dir.x);
        var degree = r * 180 / (Math.PI);
        return degree;
    },

    //获取四方向方位
    getDirection(){
    	var angle = this.getAngle();
    	if(angle >= 45 && angle < 135){
    		return "up";
    	}
    	if(angle >= 135 && angle <= 180 || angle >= -180 && angle < -135){
    		return "left";
    	}
    	if(angle >= -135 && angle < -45){
    		return "down";
    	}
    	return "right";
    },


    cbTouchStart(event) {
        let pos = event.getLocation();
        // 点击时显示摇杆组件节点并设置位置
        if(this.ouToHide){
        	this.node.active = true;
        }
        if(!this.isFixation){
	    	let rPos = this.sceneNode.convertToNodeSpaceAR(pos);    // 将世界坐标转化为场景节点的相对坐标
	        this.node.setPosition(rPos);
	        // 初始化摇杆节点位置及角度
	        this.joystick.setPosition(cc.v2(0, 0));
	        this.dir = cc.v2(0, 0);
        }else{
        	this.updateJoystick(pos);
        }
    },

    updateJoystick(pos){
        var jPos = this.node.convertToNodeSpaceAR(pos);    // 将世界坐标转化为摇杆组件节点的相对坐标

        // 获取摇杆的角度
        let len = jPos.mag();
        this.dir.x = jPos.x / len;
        this.dir.y = jPos.y / len;
		this.touchMoveDistance = len;
        // 设置摇杆的位置
        if (len > this.Max_r) {
            jPos.x = this.Max_r * jPos.x / len;
            jPos.y = this.Max_r * jPos.y / len;
        }
        this.joystick.setPosition(jPos);
        var dirct = this.getDirection();
        if(this.updateDirBack){
            this.updateDirBack(dirct);
        }
    },

    cbTouchMove(event) {
        var pos = event.getLocation();
        this.updateJoystick(pos);
    },

    cbTouchEnd(event) {
        // 初始化摇杆节点位置及角度
        this.joystick.setPosition(cc.v2(0, 0));
        this.dir = cc.v2(0, 0);
        if(this.ouToHide){
        	this.node.active = false;
        }
		this.touchMoveDistance = 0;
    },

    cbTouchCancel(event) {
        // 初始化摇杆节点位置及角度
        this.joystick.setPosition(cc.v2(0, 0));
        this.dir = cc.v2(0, 0);
        if(this.ouToHide){
        	this.node.active = false;
        }
    }
});
