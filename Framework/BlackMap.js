var YMovieClip=cc.Class({
    extends: cc.Node,
    properties:{
        cFrame:0,
        currentFrame:{
            get:function(){
                return this.cFrame+1;
            }
        },
        totalFrame:{
            get:function(){
                return this.frameArr.length;
            }
        },
        isYMC:true,
        frameArr:[],
        imgNode:cc.Node,
        actionObj:null,
        eventObj:null,
        tagObj:null,
        stageNode:cc.Node,
        frameNode:cc.Node,
        spriteArr:[],
        currentArr:[],
        rect:cc.Rect,
        revise:false
    },
    Init:function(parentNode,nstr,fraArr,actObj,eveArr,rect,tObj,sprArr,rBo){
        this.revise=rBo;
        this.stopBo=false;
        this.offBo=false;//停止运行 最高权限 只有执行了stop()才能为true
        this.currActArr=null;
        this.name=nstr;
        this.frameArr=fraArr;
        this.actionObj=actObj;
        this.eventObj=eveArr;
        this.tagObj=tObj;
        this.spriteArr=sprArr;
        this.cFrame=0;
        this.rect=rect;
        this.eventFunObj={};
        this.currentArr=this.frameArr[this.cFrame];
        this.parent=parentNode; 
        
        this.frameNode=new cc.Node();
        this.frameNode.parent=this;
        this.frameNode.addComponent(cc.Sprite);
        this.frameNode.anchorX=0;
        this.frameNode.anchorY=1;
        this.anchorX=0;
        this.anchorY=1;
        
        this.setSprite();
    },
    Init2:function(rect,sprArr,rBo){
        this.revise=rBo;
        this.stopBo=false;
        this.offBo=false;//停止运行 最高权限 只有执行了stop()才能为true
        this.currActArr=null;
        this.spriteArr=sprArr;
        this.cFrame=0;
        this.rect=rect;
        this.eventFunObj={};
        this.currentArr=this.frameArr[this.cFrame];
        
        this.setSprite();
    },
    /***如果该帧上有事件类型但是无接收方法,那么就会执行ymc.dispatchEvent弹出事件***/
    /***也可以通过setEventFun和addEventFun为该帧上的事件类型增加方法，屏蔽弹出***/
    onEventFun:function(){
        if(this.EventFrame==this.cFrame){
            return;
        }
        this.EventFrame=this.cFrame;//上一次执行代码的帧
        if(this.eventObj[this.cFrame]!=null){
            for(let str in this.eventObj[this.cFrame]){
                if(this.eventObj[this.cFrame][str]!=null){
                    this.eventObj[this.cFrame][str]();
                }else{
                    this.dispatchEvent(new cc.Event.EventCustom(str,false));
                }
            }
        }
    },
    /********设置或更改已有的帧事件********/
    setEventFun:function(zhen2,typeStr,fun){
        let zhen=zhen2-1;
        if(this.eventObj[zhen]!=null){
            if(this.eventObj[zhen].hasOwnProperty(typeStr)){
                this.eventObj[zhen][typeStr]=fun;
            }
        }
    },
    /********添加的帧事件，如果已经存则会被覆盖********/
    addEventFun:function(zhen2,typeStr,fun){
        let zhen=zhen2-1;
        if(this.eventObj[zhen]==null){
            this.eventObj[zhen]={};
        }
        this.eventObj[zhen][typeStr]=fun;
    },
    /********清除某一帧上的某一事件********/
    deleteEventFun:function(zhen2,typeStr){
        let zhen=zhen2-1;
        if(this.eventObj[zhen]!=null){
            if(this.eventObj[zhen].hasOwnProperty(typeStr)){
                delete(this.eventObj[zhen][typeStr]);
            }
        }
    },
    /********清除某一帧上的所有事件********/
    deleteAllEventFun:function(zhen2){
        let zhen=zhen2-1;
        if(this.eventObj.hasOwnProperty(zhen)){
            delete(this.eventObj[zhen]);
        }
    },
    /*********设置帧参数：卸载时动画的帧，当前时间，卸载时间,暂时BO，停止Bo */
    setFrame:function(remFrame,cTim,tTim,sbo,oBo){
        this.stopBo=sbo;
        this.offBo=oBo;
        if(tTim==0||tTim==null){//如果是第一次加载，则什么都不做
            if(this.actionObj!=null){
                this.currActArr = this.actionObj[0];
                if(this.currActArr!=null){
                    if(this.currActArr[0] == 'stop'){
                        this.cFrame=0;
                        this.onHitComponent();
                        this.currentArr=this.frameArr[this.cFrame];
                        this.setActionObj(this.cFrame);
                        this.setSprite();
                        this.EventFrame=this.cFrame;
                        return;
                    }
                }
            }
        }
        if(sbo||oBo||this.totalFrame==1){
            if(this.totalFrame==1){
                this.cFrame=0;
            }else{
                this.cFrame=remFrame;
            }
            this.onHitComponent();
            this.currentArr=this.frameArr[this.cFrame];
            this.setActionObj(this.cFrame);
            this.setSprite();
            this.EventFrame=this.cFrame;
            return;
        }
        let xh=cTim-tTim;
        if(this.actionObj==null){
            let ys=xh % this.totalFrame;
            if(remFrame+ys>=this.totalFrame){
                this.cFrame=(remFrame+ys)-this.totalFrame;
            }else{
                this.cFrame=remFrame+ys;
            }
            this.onHitComponent();
            this.currentArr=this.frameArr[this.cFrame];
            this.setActionObj(this.cFrame);
            this.setSprite();
            this.onEventFun();
            return;
        }else{
            this.cFrame=remFrame;
            if(xh>=this.totalFrame*3&&xh>50){
                let zhenObj={};
                let zhenTim=tTim;
                let zhenArr=[];
                this.setActionObj(this.cFrame);
                for(let i=0;i<this.totalFrame*3;i++){
                    this.currentArr=this.frameArr[this.cFrame];
                    this.cFrame=this.addFrame();
                    zhenTim++;
                    zhenArr[zhenArr.length]=this.cFrame;
                    if(zhenObj[this.cFrame]==null){
                        zhenObj[this.cFrame]=1;
                    }else{
                        zhenObj[this.cFrame]++;
                        if(zhenObj[this.cFrame]>=3){//当一帧连着出现三次 那么应该是循环了
                            let arr=[];//用来记录每帧的位置和时间
                            for(let c=zhenArr.length-2;c>0;c--){//倒着检查 出循环点
                                arr.unshift(zhenArr[c]);
                                if(zhenArr[c]==this.cFrame){
                                    xh=cTim-zhenTim;
                                    let cy=xh % arr.length;
                                    this.cFrame=arr[cy];
                                    this.onHitComponent();
                                    this.currentArr=this.frameArr[this.cFrame];
                                    this.setActionObj(this.cFrame);
                                    this.setSprite();
                                    this.onEventFun();
                                    i=this.totalFrame*4;
                                    break;
                                }
                            }
                        }
                    }
                }
            }else{
                this.setActionObj(this.cFrame);
                for(let i=0;i<xh;i++){
                    this.cFrame=this.addFrame();
                }
                this.onHitComponent();
                this.currentArr=this.frameArr[this.cFrame];
                this.setActionObj(this.cFrame);
                this.setSprite();//
                this.onEventFun();
            }
        }
    },
    setActionObj:function(zhen){
        if(this.actionObj!=null){
            this.currActArr = this.actionObj[zhen];
        }
    },
    addFrame:function(){
        let zhen=this.cFrame;
        if(this.stopBo){
            if(zhen<0){
                zhen=0;
            }
            if(zhen>=this.totalFrame){
                zhen=0;
            }
            return zhen;
        }
        if(this.actionObj==null){
            zhen++;
        }else{
            if (this.currActArr!=null){
                if(this.currActArr[0] == 'gotoAndStop'){
                    if(zhen != this.currActArr[1]){
                        if(this.currActArr[1]< this.totalFrame){
                            zhen = this.currActArr[1]
                        }else{
                            this.currActArr[1] = this.totalFrame - 1;
                            zhen = this.currActArr[1];
                        }
                    }
                    this.stopBo = true;
                    this.currActArr = null;
                }else if(this.currActArr[0] == 'gotoAndPlay'){
                    if (zhen!= this.currActArr[1]){
                        if (this.currActArr[1] < this.totalFrame){
                            zhen = this.currActArr[1];
                        }else{
                            this.currActArr[1] = this.totalFrame - 1;
                            zhen = this.currActArr[1];
                        }
                    }
                    this.currActArr = null;
                    this.stopBo = false
                }else if(this.currActArr[0] == 'stop'){
                    this.stopBo = true;
                }else if(this.currActArr[0] == 'play'){
                    this.stopBo = false;
                    zhen++;
                }
            }else{
                zhen++;
            }
        }
        if(zhen>=this.frameArr.length){
            zhen=0;
        }
        this.setActionObj(zhen);
        return zhen;
    },
    removeThis:function(){
        let spr=this.frameNode.getComponent(cc.Sprite);
        spr.spriteFrame=null;
        this.parent=null;
        this.frameNode.parent=null;
        this.name='';
        this.frameArr=null;
        this.actionObj=null;
        this.eventObj=null;
        this.tagObj=null;
        this.spriteArr=null;
        this.cFrame=0;
        this.rect=null;
        this.frameNode.destroy();
        this.destroy();
    },
    gotoAndPlay:function(frame){
        if(frame!=null){
            if(typeof(frame)=='number'){
                if(frame % 1==0){
                    let f=frame-1;
                    if(f>-1&&f<this.totalFrame){
                        this.stopBo=false;
                        this.offBo=false;
                        this.cFrame=f;
                        this.onHitComponent();
                        this.setActionObj(this.cFrame);
                   }
                }
            }else{
                if(this.tagObj[frame]!=null){
                    this.stopBo=false;
                    this.offBo=false;
                    this.cFrame=this.tagObj[frame];
                    this.onHitComponent();
                    this.setActionObj(this.tagObj[frame]);
                }
            }
        }
    },
    gotoAndStop:function(frame){
        if(frame!=null){
            if(typeof(frame)=='number'){
                if(frame % 1==0){
                    let f=frame-1;
                    if(f>-1&&f<this.totalFrame){
                        this.stopBo=true;
                        this.offBo=false;
                        this.cFrame=f;
                        this.onHitComponent();
                        this.setActionObj(this.cFrame);
                    }
                }
            }else{
                if(this.tagObj[frame]!=null){
                    this.stopBo=true;
                    this.offBo=false;
                    this.cFrame=this.tagObj[frame];
                    this.onHitComponent();
                    this.setActionObj(this.tagObj[frame]);
                }
            }
        }
    },
    play:function(){
        this.stopBo=false;
        this.offBo=false;
        this.cFrame++;
        let zhen=this.cFrame+1;
        if(zhen<0){
            zhen=0;
        }
        if(zhen>=this.totalFrame){
            zhen=0;
        }
        this.cFrame=zhen;
        this.onHitComponent();
        this.setActionObj(this.cFrame);
    },
    stop:function(){
        this.offBo=true;
        this.stopBo=true;
    },
    getPraent:function(){
        if(this._y_parent!=null){
            return this._y_parent.parent;
        }else{
            return this.parent;
        }
    },
    getRect:function(){
        return this.rect;
    },
    setSprite:function(){
        let spr=this.frameNode.getComponent(cc.Sprite);
        if(this.currentArr.length>0){
            spr.spriteFrame=this.spriteArr[this.currentArr[0]][0][1]['Sprite']['spriteFrame'];
            this.frameNode.x=this.currentArr[1];
            this.frameNode.y=this.currentArr[2];
        }else{
            spr.spriteFrame=null;
        }
        if(this.revise){
             this.frameNode.width+=1;
             this.frameNode.height+=1;
         }
    },
    startYMC:function(){
        if(this.offBo){return;}
        this.cFrame=this.addFrame();
        this.onEventFun();
        this.onHitComponent();
        if(this.frameArr[this.cFrame]!=this.currentArr){
            this.currentArr=this.frameArr[this.cFrame];
            this.setSprite();
        }
    },
    onHitComponent:function(){
        if(this.pz!=null){
            for(let i=0;i<this.pz.length;i++){
                if(this.pz[i][1][this.cFrame]!=null){
                    if(!(this.pz[i][0].enabled)){this.pz[i][0].enabled=true;}
                    for(let str in this.pz[i][1][this.cFrame]){
                         this.pz[i][0][str]=this.pz[i][1][this.cFrame][str];
                    }
                }else{
                    if(this.pz[i][0].enabled){this.pz[i][0].enabled=false;}
                }
            }
        }
    },
    setLocationFun:function(X,Y){
        this.x=X;
        this.y=Y;
    }
})
cc.Class({
    extends: cc.Component,
 
    properties:{
         revise:{
            default:false,
            tooltip:'当出现透明缝隙时可以开启，该属性会造成所有图块增加一像素的距离，可能会出现衔接问题，所以未出现问题介意不要动'
        },
        //保存贴图的obj，格式为{IDStr：贴图}
        SpriteObj:{
            default:{},
            visible: false
        },
        //存放除不被记录外的所有Node｛唯一ID:[素材ID,x,y]｝
        nodeAllObj:{
            default:{},
            visible: false
        },
        ///存放所有地图信息的数组格式：
        ///[
        ///    0.素材数组=[贴图ID,x,y,[绘制的xy]]
        ///    1.IDNode对像={Node唯一ID：Node}
        ///    2.Node池数组=[]
        ///    3.上次使用池对像提取的时间
        ///]
        MapSprArr:{
            default:[],
            visible: false
        },
        ///保存图层信息的数组，格式为:
        ///[{LayerName：'',""Position:
        ///    {
        ///        x:{整数:{
        ///            y:{整数:[层ID(也是唯一ID)]}
        ///        }
        ///    }
        ///,LayerType:"地形"}]
        LayerArr:{
            default:[],
            visible: false
        },
        ///参数1-100
        FPS:{
            get: function () {
                if(this._FPS==null){
                    if(this.FPS2!=null){
                        this._FPS=this.FPS2;
                    }else{
                        this._FPS=25;
                    }
                }
                return this._FPS;
            },
            set: function (value) {
                if(typeof(value)=='number'){
                    let i=Math.floor(value);
                    if(i<=100&&i>=1){
                        if(this._FPS!=null){
                            if(this.timDelay!=null){this.unschedule(this.timerFun)};
                            this._FPS=i;
                            this.timDelay=1/this._FPS;
                            this.schedule(this.timerFun, this.timDelay);
                        }else{
                            this._FPS=i;
                        }
                    }
                }
            },
            visible: false
        },
        mapCameraNode: {
            get () {
                return this._mapCameraNode;
            },
            set (value) {
                if(this._mapCameraNode==value){return;}
                if(value==null){
                    if(this._mapCameraNode!=null){
                        this._mapCameraNode.off('position-changed', this.onMapCamera, this);
                    }
                }else{
                       value.on('position-changed', this.onMapCamera,this);
                }
                this._mapCameraNode=value;
            },
            visible: false
        },
        BGObj:{
            get () {
                return this._BGObj;
            },
            set (value) {
                this._BGObj=value;
            },
            visible: false
        }
    },



    /***********未声明但存在的对像********/
    ///var this.LoadBo=false;素材是否加载完成
    ///var this.LayerNodeArr=[];保存图层Node的数组
    ///var this.LayerNodeObj={};保存图层Node的obj，包含图层宽高
    ///var this.stageRectObj=new cc.Rect();上一次图层node的渲染矩形
    ///var this.stageNodeObj={Node唯一ID：Node};舞台上的Node
    ///var this.pointObj=cc.Vec2();主node或图层node上次移动的点
    ///var this.killArr=[];没有清除的图片ID
    ///var this.killSprArr=[];没有清除的Spr图片ID
    ///var this.mcAllObj={};记录所用的动画
    ///var this.timInt=0;//当前运行的时间
    ///var this.LocObj={};//上次渲染的图场位置
    ///var this.Loading(已加载的贴图数,总贴图数);//上次渲染的图场位置
    ///var this.layerRect={[实际像素rect，图层的块宽度，图层的块高度]}图层里实际node的宽高
    ///var this.flagPoint=cc.Vec2();零点坐标
    ///var this.Init();程序准备完成了执行
    ///this.FPS;帧频
    ///this.mapCameraNode;地图摄像机
    ///var this.timDelay;计时器每次执行的延迟
    ///this.ymcStageArr=[];舞台上的ymc动画
    ///this.MapMcArr={};舞吧上已经有的ymc ID
    ///this.ymcFrameObj={};动画清除时留下的当前帧以及地图运行的时间
    ///this.ymcTimInt=0;动画的时间
    ///this.ymcMapSprArr=[[动画名，动画上的属性]];
    ///this.onLoadYMovieClip(ymc,LayerName,bo:是否第一个加次载);//@public每次动画添加时调用
    ///this.onLoadSprite(node,LayerName);//@public每次图块添加时调用
    ///this.onLoadSpriteParent(node,LayerName,bo:是否第一个加次载);//@public每次组添加时调用
    ///this.killSprite(node,LayerName);//@public图块清除时调用
    ///this.killYMovieClip(node,LayerName);//@public动画清除时调用
    ///this.killSpriteParent(node,LayerName);//@public组清除时调用
    ///this.MapRect;//@public地图的矩形
    ///this.killFrameArr;//清除克隆贴图的frame
    ///this.showNodeObj;//显示在后台的对像Node
    ///this.mcPool;{ID:{timer:使用时间,pool:[]}}
    onLoad2: function () {
         this.LocObj={};
         this.timInt=0;//地图运行的时间，以秒为单位
         this.pointObj={};
         this.stageRectObj={};
         this.showNodeObj={};
         this.stageNodeObj={};
         this.LoadBo=false;
         this.onSrpiteFun();
         this.ymcStageArr=[];
         this.MapMcArr={};
         this.ymcFrameObj={};
         this.ymcTimInt=0;
         this.mcPool={};
         if(this.timDelay==null){
             this.timDelay=1/this.FPS;//每次执行的延迟
             this.schedule(this.timerFun, this.timDelay);
         }
    },
    timerFun:function(){
        this.timInt+=this.timDelay;
        for(let i=0;i<this.ymcStageArr.length;i++){
            this.ymcStageArr[i].startYMC();
        }
        this.ymcTimInt++;
    },
    /********设置Node坐标（X,Y）并刷新地图，可以设置为null********/
    //@public
    setLocationFun:function(x,y,nstr,bo)
    {
        if(!this.LoadBo){return;}
        if(nstr==null){nstr="this";}
        if(nstr!="this"){if(this.LayerNodeObj[nstr]==null){return;}}
        if(this.pointObj[nstr]==null){this.pointObj[nstr]=new cc.Vec2(this.node.x-1,this.node.y-1);}
        let n;
        if(nstr=="this"){n=this.node;}else{n=this.LayerNodeObj[nstr];}
        if(x!=null){n.x=x;}
        if(y!=null){n.y=y;}
        let tX=n.x;
        let tY=n.y;
        if(this._mapCameraNode!=null){
            tX+=this._mapCameraNode.x;
            tY+=this._mapCameraNode.y;
        }
        //查看负坐标
        if(this.pointObj[nstr].x!=tX||this.pointObj[nstr].y!=tY||bo)
        {
            let dian=n.parent.convertToWorldSpaceAR(cc.v2(n.x,n.y));      
            if(this._mapCameraNode==null){
                this.AddMapChildFun(new cc.Rect((cc.view.getVisibleOrigin().x-dian.x)/this.node.scaleX,(cc.view.getVisibleOrigin().y-dian.y)/this.node.scaleY,cc.view.getVisibleSize().width/this.node.scaleX,cc.view.getVisibleSize().height/this.node.scaleY),nstr);
            }else{
          
                this.AddMapChildFun(new cc.Rect((cc.view.getVisibleOrigin().x-dian.x+this._mapCameraNode.x)/this.node.scaleX,(cc.view.getVisibleOrigin().y-dian.y+this._mapCameraNode.y)/this.node.scaleY,cc.view.getVisibleSize().width/this.node.scaleX,cc.view.getVisibleSize().height/this.node.scaleY),nstr);
            }         
            this.pointObj[nstr].x=tX;
            this.pointObj[nstr].y=tY;
        }
        
    },
    onMapCamera:function(){//摄像机更改事件 
  
        this.setLocationFun();
    },
    /********以舞台坐标缩放地图*******/
    scaleFun:function(px,py,tx,ty){
        if(this.node.scaleX!=tx||this.node.scaleY!=ty){
            if(tx>=0.1||ty>=0.1){
                let p=cc.v2((px-this.node.x)/this.node.scaleX,(py-this.node.y)/this.node.scaleY)
                let p2=cc.v2(px-p.x,py-p.y);
                this.node.scaleX=tx;
                this.node.scaleY=ty;
                this.setLocationFun(p.x*(this.node.scaleX-1)*-1+p2.x,p.y*(this.node.scaleY-1)*-1+p2.y,'this',true)
            }
        }
    },
    //@public
     removeAll:function(){
        this.unschedule(this.timerFun);
        for(let i=0;i<this.LayerNodeArr.length;i++){
            this.LayerNodeArr[i].destroyAllChildren();
            this.LayerNodeArr[i].parent=null;
            this.LayerNodeArr[i].destroy();
        }
        for(let i=0;i<this.MapSprArr.length;i++){
            let arr=this.MapSprArr[i][2];
            for(let c=0;c<arr.length;c++){
                arr[c].destroy();
            }
        }
        for(let s in this.mcArr){
            let arr=this.mcArr[s]['pool'];
            for(let c=0;c<arr.length;c++){
                arr[c].removeThis();
            }
        }
        for(let s=0;s<this.killFrameArr.length;s++){
            this.killFrameArr[s].destroy();
        }
        if(this.killSprArr!=null){
            for(let i=0;i<this.killSprArr.length;i++){
                cc.loader.releaseRes(this.killSprArr[0], cc.SpriteFrame);
            }
        }
        for(let str in this.nodeParentObj){
            if(this.nodeParentObj[str][7]!=null){
                this.nodeParentObj[str][7].destroy();
            }
        }
        cc.loader.release(this.killArr);//释放贴图
        if(this.pathFind!=null){
            this.node.removeComponent(this.pathFind);//
        }
        if(this.BGObj!=null){
            if(this.BGObj["alt"]!=null){
                cc.loader.releaseRes(this.BGObj['path']+"/s");
                this.BGObj["alt"]=null
            }
            for(let str in this.BGObj['sprite']){
                cc.loader.releaseAsset(this.BGObj['sprite'][str]);
            }
            for(let i=0;i<this.BGObj['pool'].length;i++){
                this.BGObj['pool'][i].destroy();
            }
            if(this.BGNode!=null){
                this.BGNode.destroy();
                this.BGNode=null;
            }
        }
        if(this._mapCameraNode!=null){
            this._mapCameraNode.off('position-changed', this.onMapCamera, this);//销毁摄像机上的事件
        }
        this.BGObj=null;
        this.mcArr=null;
        this.pathFind=null;
        this.PathGridObj=null;
        this.killFrameArr=null;
        this.nodeParentObj=null;
        this.SpriteObj=null;
        this.MapSprArr=null;
        this.LayerArr=null;
        this.LayerNodeArr=null;
        this.LayerNodeObj=null;
        this.stageRectObj=null;
        this.stageNodeObj=null;
        this.showNodeObj=null;
        this.killArr=null;
        this.killSprArr=null;
        this.LocObj=null;
        this.Loading=null;
        this.layerRect=null;
        this.Init=null;
        this.onLoadYMovieClip=null;
        this.onLoadSprite=null;
        this.onLoadSpriteParent=null;
        this.killSprite=null;
        this.killSpriteParent=null;
        this.killYMovieClip=null;
        this.ymcAllObj=null;
        this.ymcStageArr=null;
        this.MapMcArr=null;
        this.ymcFrameObj=null;
        this.ymcMapSprArr=null;
     },
     /********返回图层实际对像的数据*******/
    //@public
     getLayerRectFun:function(str){
         if(str!=null){return this.layerRect[str][0];}
     },
    //@public
     getLayerNodeFun:function(str){
         if(str!=null){return this.LayerNodeObj[str];}
     },
     /******清除池中的node********/
    //@public
     killNodePool:function(timOrName){
         if(timOrName==null){return;}
         let bo=(timOrName.constructor==Number);
         for(let i=0;i<this.MapSprArr.length;i++){
             let arr=this.MapSprArr[i][2];
             if(bo){
                 let id=this.MapSprArr[i][3];
                 if(this.timInt-id>timOrName){
                     for(let c=0;c<arr.length;c++){
                         arr[i].destroy();
                     }
                     this.MapSprArr[i][2]=[];
                 }
             }else{
                 let id=this.MapSprArr[i][0];
                 if(id==timOrName){
                     for(let c=0;c<arr.length;c++){
                          arr[i].destroy();
                     }
                     this.MapSprArr[i][2]=[];
                 }
             }
         }
         for(let str in this.mcPool){
             let arr=this.mcPool[str]["pool"];
             if(bo){
                let t=this.mcPool[str]["timer"];
                if(this.timInt-t>timOrName){
                    for(let c=0;c<arr.length;c++){
                        arr[i].removeThis();
                    }
                    this.mcPool[str]["pool"]=[];
                }
            }else{
                if(this.mcPool[str]["name"]==timOrName){
                    for(let c=0;c<arr.length;c++){
                         arr[i].removeThis();
                    }
                    this.mcPool[str]["pool"]=[];
                }
            }
         }
     },
    /****public****更改替换所有图块*******/
    setSpriteFrame:function(path,name,frame){
        if(this.SpriteObj[path+'-'+name]!=null){
            let pa=this.SpriteObj[path+'-'+name];
            this.SpriteObj[path+'-'+name]=frame;
            for(let i=0;i<this.LayerNodeArr.length;i++){
                for(let l=0;l<this.LayerNodeArr[i].childrenCount;l++){
                    let n=this.LayerNodeArr[i].children[l];
                    let spr=n.getComponent(cc.Sprite);
                    if(spr!=null&&spr.spriteFrame==pa){
                        spr.spriteFrame=frame;
                    }
                }
            }
        }
    },
    LoadLength:function(){
       return this.MapObj['loadLen']
    },
    /********加载所有贴图********/
    onSrpiteFun: function () {
        this.killArr=[];
        this.killSprArr=[];
        this.killFrameArr=[];
        let loadInt=0;
        let loadLen=this.MapObj['loadLen'];
      
        let _this=this;
        if(this.BGObj!=null){
            loadLen++;
            cc.loader.loadRes(this.BGObj['path']+"/s", cc.SpriteAtlas, function (err, atlas) 
            {
                loadInt++;
                _this.BGObj["alt"]=atlas;
        
                if(_this.Loading!=null){_this.Loading(loadInt,loadLen);  }
                if(loadInt>=loadLen){_this.onLayerFun();}
            })
            if(loadLen==0){return;}
        }
        if(loadLen==0){
            this.onLayerFun();
            return;
        }
        let fraArr =  this.MapObj['fraArr'];
        let atlArr =  this.MapObj['atlArr'];
      
        let rArr=[];
      
        for(let str in fraArr)
        {
            cc.loader.loadRes(str, cc.SpriteFrame, function (err, spriteFrame) 
            {
                 let f=spriteFrame.clone();
                 _this.killFrameArr[_this.killFrameArr.length]=f;
                 _this.SpriteObj[str+'-'+fraArr[str]]=f;
                _this.killSprArr[_this.killSprArr.length]=[str,spriteFrame]
                f.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
                loadInt++;
                if(_this.Loading!=null){ _this.Loading(loadInt,loadLen);}
                if(loadInt>=loadLen){ _this.onLayerFun();}
            })
        }
        for(let str2 in atlArr)
        {
            cc.loader.loadRes(str2, cc.SpriteAtlas, function (err, atlas) 
            {
                 let deps = cc.loader.getDependsRecursively(atlas);
                 for(let i=0;i<atlArr[str2].length;i++)
                 {
                     let frame2 = atlas.getSpriteFrame(atlArr[str2][i]);
                     //let frame2=frame.clone();
                     _this.killFrameArr[_this.killFrameArr.length]=frame2; 
                     _this.SpriteObj[str2+'-'+atlArr[str2][i]]=frame2;
                    
                    //  if(window.FObj[str2]){
                    //      frame2.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
                    //  }
                     
                 }
                 for(let a=0;a<deps.length;a++){
                     //可否优化?
                     _this.killArr[_this.killArr.length]=deps[a];
                 }
                 loadInt++;
                 if(_this.Loading!=null){_this.Loading(loadInt,loadLen);}
                 if(loadInt>=loadLen){_this.onLayerFun();}
            })
        }
    //cc.loader.release(this.killArr);//释放贴图
    },
    addNode:function(obj,n){
        let newNode;
        if(n==null){
            newNode=new cc.Node();
        }else{
            newNode=n;
        }
        newNode.anchorX=0;
        newNode.anchorY=1;
        for(let str in obj){
            if(str=="Collider"||str=="PolygonCollider"){
                this.hitObject(newNode,this.getComponentType(str),obj[str]);
            }else if(str=="Sprite"||str=="Graphics"){
                let SprObj=obj[str];
                let spr=newNode.addComponent(this.getComponentType(str));
                for(let str2 in SprObj){
                    if(str=="Graphics"&&(str2=="rect")){
                        if(str2=="rect"){spr.rect(SprObj[str2].x,SprObj[str2].y,SprObj[str2].width,SprObj[str2].height);}
                    }else{
                        spr[str2]=SprObj[str2];
                    }
                }
               if(this.revise){
                   if(str=='Sprite'){
                       newNode.width+=1;
                       newNode.height+=1;;
                   }
               
}               if(str=="Graphics"){spr.fill();}
            }else{
                newNode[str]=obj[str];
            }
        }
        return newNode;
    },
    hitObject:function(newNode,type,arr){
        for(let i=0;i<arr.length;i++){
            let spr = newNode.addComponent(type);
            let obj=arr[i];
            if(obj['pz']!=null){
                if(newNode.pz==null){
                    newNode.pz=[];
                }
                newNode.pz[newNode.pz.length]=[spr,obj['pz']];
            }
            for(let str in obj){
                 spr[str]=obj[str];
            }
        }
    },
    getComponentType:function(str){
        if(str=="Sprite"){
            return cc.Sprite;
        }else if(str=="Graphics"){
            return cc.Graphics;
        }else if(str=="Collider"){
            return cc.BoxCollider;
        }else if(str=="PolygonCollider"){
            return cc.PolygonCollider;
        }
    },
    getBGNode:function(x,y){
        let str=this.BGObj["name"]+x+this.BGObj["pname"]+y;
        let n;
        if(this.BGObj['pool'].length>0){
            let l=this.BGObj['pool'].length-1
            n=this.BGObj['pool'][l];
            this.BGObj['pool'].splice(l,1);
        }else{
            n=new cc.Node();
            n.spr=n.addComponent(cc.Sprite);
            n.anchorX=0;
            n.anchorY=1;
        }
      
        if(this.BGObj['sprite'][str]!=null){
           
            n.spr.spriteFrame=this.BGObj['sprite'][str];
        }else{
            this.LoadMapBG(str);
            n.spr.spriteFrame=this.BGObj["alt"].getSpriteFrame(str);
            if(n.spr.spriteFrame==null){
                cc.log("找到空"+str);
            }
           
        }
    
        let nx=x*this.BGObj['width'];
        let ny=y*this.BGObj['height']*-1;
        n.x=nx;
        n.y=ny;
        n.width=this.BGObj['width'];
        n.height=this.BGObj['height'];
        n.parent=this.BGNode;
        this.BGObj["stageNode"][str]=n;
      
    },
    BGInit:function(){
        if(this.BGObj==null){return;}
        this.BGObj['rect']=new cc.Rect(this.BGObj['x'],this.BGObj['y'],this.BGObj['width']*this.BGObj['nx'],this.BGObj['height']*this.BGObj['ny']);
        this.BGObj['pool']=[];
        this.BGObj['sprite']={};
        this.BGObj["length"]=this.BGObj['nx']*this.BGObj['ny'];
        this.BGObj["loadArr"]=[];
        this.BGObj["loadObj"]={};
        this.BGObj["stageNode"]={};
        this.BGObj["rect2"]=null;
        this.BGObj["loadBo"]=false;
        this.BGNode=new cc.Node();
        this.BGNode.zIndex=-1;
        this.BGNode.x=this.BGObj['x'];
        this.BGNode.y=this.BGObj['y'];
        this.BGNode.parent=this.node;
        for(let w=0;w<this.BGObj['nx'];w++){
            for(let h=0;h<this.BGObj['ny'];h++){
                let str=this.BGObj["name"]+w+this.BGObj["pname"]+h;
                this.BGObj["loadArr"][this.BGObj["loadArr"].length]=str;
                this.BGObj["loadObj"][str]=false;
            }
        }
        this.LoadMapBG(null,true);
      
    },
    getBGID:function(){
        let id=this.BGObj["loadArr"].length-1
        let str=this.BGObj["loadArr"][id];
        this.BGObj["loadArr"].splice(id,1);
        return str;
    },
    LoadMapBG:function(str,bo){
        if(this.BGObj==null||this.BGObj["length"]==0){return;}
         let _this=this;
         if(bo){
             if(this.BGObj["loadArr"].length>0){
                str=this.getBGID();
                while(this.BGObj["stageNode"][str]!=null){
                    str=this.getBGID();;
                }
             }else{
                 return;
             }
         }
        if(!this.BGObj["loadObj"][str]){
            this.BGObj["loadObj"][str]=true;
        }else{
            return;
        }
        cc.loader.loadRes(this.BGObj['path']+"/"+str, cc.SpriteFrame, function (err, spriteFrame) 
                {
                    if(err){
                        return;
                    }
                    if(_this.BGObj==null){
                        cc.loader.releaseAsset(spriteFrame);
                        return;
                    }
                    _this.BGObj['sprite'][str]=spriteFrame;
                    if(_this.BGObj["stageNode"][str]!=null){
                        _this.BGObj["stageNode"][str].spr.spriteFrame=spriteFrame;
                    }
                    _this.BGObj["length"]--;
                    if(_this.BGObj["length"]==0){
                        cc.loader.releaseRes(_this.BGObj['path']+"/s");
                        _this.BGObj["alt"]=null;
                        this.BGObj["loadObj"]=null;
                    }else{
                        if(bo){
                            _this.LoadMapBG(null,true);
                        }
                    }
                    
                })
    },
    AddMapBG:function(rect){
    
        let pw=this.BGObj['width'];
        let ph=this.BGObj['height'];
        this.BGObj['rect'].x=0;
        this.BGObj['rect'].y=0;
 
        let intersection = new cc.Rect();
        this.BGObj['rect'].intersection(intersection,new cc.Rect(rect.x-this.BGNode.x,rect.y*-1-rect.height-this.BGNode.y*-1,rect.width,rect.height));
        let cx=Math.floor(intersection.x/pw );
        let cy=Math.floor(intersection.y/ph);
        let cw=Math.ceil((intersection.x+intersection.width)/pw);
        let ch=Math.ceil((intersection.y+intersection.height)/ph);
        if(cx<0){cx=0;}
        if(cy<0){cy=0;}
        if(cw>=this.BGObj['nx']){cw=this.BGObj['nx']-1;}
        if(ch>=this.BGObj['ny']){ch=this.BGObj['ny']-1;}
     
        if(this.BGObj["rect2"]!=null){
            let rArr=this.getHitRectObj(this.BGObj["rect2"],new cc.Rect(cx,cy,cw-cx,ch-cy));
            for(let o=0;o<rArr.length;o++){
                let cx2=rArr[o].x;
                let cy2=rArr[o].y;
                let cw2=rArr[o].width+rArr[o].x;
                let ch2=rArr[o].height+rArr[o].y;

                for(let x=cx2;x<cw2;x++){               
                    for(let y=cy2;y<ch2;y++){
                        let nx=x*pw;
                        let ny=y*ph*-1;
                        let str=this.BGObj["name"]+x+this.BGObj["pname"]+y;
                        if(this.BGObj["stageNode"][str]!=null){
                            this.BGObj["stageNode"][str].parent=null;
                            this.BGObj['pool'].push(this.BGObj["stageNode"][str]);
                            delete(this.BGObj["stageNode"][str]);
                        }
                    }
                }
            }
            if(intersection.width>0&&intersection.height>0){
                let rArr=this.getHitRectObj(new cc.Rect(cx,cy,cw-cx,ch-cy),this.BGObj["rect2"]);
                for(let o=0;o<rArr.length;o++){  
                    this.fBG(rArr[o].x,rArr[o].y,rArr[o].width+rArr[o].x,rArr[o].height+rArr[o].y);
                }
             }
        }else{
            this.fBG(cx,cy,cw,ch); 
        }
        if(this.BGNode.childrenCount>0){
            this.BGObj["rect2"]=new cc.Rect(cx,cy,cw-cx,ch-cy);
        }else{
            this.BGObj["rect2"]=null;
        }
        
    },
    fBG:function(cx,cy,cw,ch){
        for(let w=cx;w<=cw;w++){
            for(let h=cy;h<=ch;h++){
                this.getBGNode(w,h);
            }
        }
    },
    AddMapChildFun:function (rect,nstr) {
        if(this.BGObj!=null){
            this.AddMapBG(rect);
        }
        if(nstr!="this"){if(this.LayerNodeObj[nstr]==null){return;}}
        let jlObj={};
        for(let i=0;i<this.LayerArr.length;i++){
            if(nstr!="this"){if(this.LayerNodeArr[i].name!=nstr){continue;}}
            let n=this.LayerNodeArr[i];
            let pw=this.layerRect[n.name][1];
            let ph=this.layerRect[n.name][2];
            let cx=Math.floor(((rect.x+this.flagPoint.x)/pw ));
            let cy=Math.floor(((rect.y+this.flagPoint.y)/ph))+1;
            let cw=Math.ceil(((rect.x+this.flagPoint.x+rect.width-(cx*pw))/pw));
            let ch=Math.ceil(((rect.y+this.flagPoint.y+rect.height-(cy*ph))/ph))+1;
            let rArr=[];
            
            if(this.stageRectObj[n.name]!=null){
                let r2=this.stageRectObj[n.name];
                if(cx!=r2.x||cy!=r2.y||cw!=r2.width||ch!=r2.height){
                    rArr=this.getHitRectObj(new cc.Rect(cx,cy,cw,ch),r2);
                    if(this.LayerNodeArr[i].parent!=null){
                        this.removeNodeChildFun(this.getHitRectObj(r2,new cc.Rect(cx,cy,cw,ch)),new cc.Rect(cc.view.getVisibleOrigin().x,cc.view.getVisibleOrigin().y,cc.view.getVisibleSize().width,cc.view.getVisibleSize().height),n.name);
                        this.stageRectObj[n.name]=new cc.Rect(cx,cy,cw,ch);
                    }else{
                        this.removeNodeChildFun([r2],new cc.Rect(),n.name);
                        this.stageRectObj[n.name]=null;
                        continue;//不在舞台之中时，只删不加
                    }
                }else{
                    continue;//覆盖跳过
                }
            }else{
                    if(this.LayerNodeArr[i].parent!=null){
                        this.stageRectObj[n.name]=new cc.Rect(cx,cy,cw,ch);
                        rArr=[new cc.Rect(cx,cy,cw,ch)];
                    }else{
                        continue;//不在舞台之中时，空也不添加
                    }
            }
            for(let o=0;o<rArr.length;o++){
                cx=rArr[o].x;
                cy=rArr[o].y;
                cw=rArr[o].width;
                ch=rArr[o].height;
                let obj=this.LayerArr[i]["Position"];
                jlObj[this.LayerNodeArr[i].name]={};
                for(let w=0;w<cw;w++){
                    let nx=cx*pw+w*pw;
                    for(let h=0;h<ch;h++){
                        let ny=cy*ph+h*ph;
                        if(obj[nx+""]!=null){
                            if(obj[nx+""][ny+""]!=null){
                                jlObj[this.LayerNodeArr[i].name][nx+" + "+ny]=0;
                                let sxArr=obj[nx+""][ny+""];
                                for(let t=0;t<sxArr.length;t++){
                                    let id=sxArr[t];
                                    let larr=this.nodeAllObj[this.LayerNodeArr[i].name][id];
                                    this.addNodeChildFun(larr[0],(larr[1]-this.flagPoint.x),(larr[2]-this.flagPoint.y),i,id);
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    
    /*******返回两个rect相交之外的rect数组，最多返回四个***********/
    getHitRectObj:function(r1,r2){
        if((r1.x+r1.width)<=r2.x||(r2.x + r2.width)<=r1.x||(r1.y+r1.height)<=r2.y||(r2.y+r2.height)<=r1.y){//没有相交
            return [r1];
        }else{
            let arr=[];
            if(r1.x<r2.x){//左下
                let rzx=new cc.Rect(r1.x,r1.y,r2.x-r1.x,0);
                if(r2.y+r2.height<r1.y+r1.height){
                    rzx.height=r2.y+r2.height-r1.y;
                }else{
                    rzx.height=r1.height;
                }
                arr[arr.length]=rzx;
            }
            if(r1.y+r1.height>r2.y+r2.height){//左上
                let rzs=new cc.Rect(r1.x,r2.y+r2.height,0,r1.y+r1.height-(r2.y+r2.height));
                if(r2.x+r2.width<r1.x+r1.width){
                    rzs.width=(r2.x+r2.width)-r1.x;
                }else{
                    rzs.width=r1.width;
                }
                arr[arr.length]=rzs;
            }
            if(r1.y<r2.y){//右下
                let ryx=new cc.Rect(0,r1.y,0,r2.y-r1.y); 
                if(r2.x>r1.x){
                    ryx.x=r2.x;
                }else{
                    ryx.x=r1.x;
                }
                ryx.width=r1.x+r1.width-ryx.x;
                arr[arr.length]=ryx;
            }
            if(r1.x+r1.width>r2.x+r2.width){//右上
                let rys=new cc.Rect(r2.x+r2.width,0,r1.x+r1.width-(r2.x+r2.width),0);
                if(r2.y>r1.y){ 
                    rys.y=r2.y;
                }else{
                    rys.y=r1.y;
                }
                rys.height=r1.y+r1.height-rys.y;
                arr[arr.length]=rys;
            }
            return arr;
        }
    },

    addNodeChildFun:function(id,x,y,tcID,NodeID)
    {
        let r
        let pw=this.layerRect[this.LayerNodeArr[tcID].name][1];
        let ph=this.layerRect[this.LayerNodeArr[tcID].name][2];
        let mcBo=false;
        let lBo=false;
        let zNode=null;
        let parBo=false;
        if(typeof(id)=='number'){
            let arr=this.MapSprArr[id];
            if(arr[1][NodeID+'']!=null){
                return;
            }
            let nArr=arr[0];
            let newNode;
            if(arr[2].length>0){
                let l=arr[2].length-1
                newNode=arr[2][l];
                arr[2].splice(l,1);
                arr[3]=this.timInt;//重置池   
                newNode.x=x;
                newNode.y=y;
                newNode.zIndex=NodeID;
              //  newNode.parent=this.LayerNodeArr[tcID];
                arr[1][NodeID+'']=newNode;
            }else{
                if(nArr.length>=5){
                    newNode=this.addNode(this.extend({"name":nArr[0],"x":x,"y":y,"rotation":nArr[4],"zIndex":NodeID},nArr[1]));
                }else{
                    newNode=this.addNode(this.extend({"name":nArr[0],"x":x,"y":y,"zIndex":NodeID},nArr[1]));
                }  
                arr[1][NodeID+'']=newNode;
            }
            newNode.scaleX=1;
            newNode.scaleY=1;
            r=new cc.Rect(newNode.x,newNode.y,nArr[2],nArr[3]);
            if(nArr.length>=5||this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''].length>=4){
                    if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][0]!=null){r.x=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][0]-this.flagPoint.x;}
                    if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][1]!=null){r.y=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][1]-this.flagPoint.y;}
                    if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][2]!=null){newNode.opacity=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][2];}
                    if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][4]!=null){newNode.scaleX=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][4]}
                    if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][5]!=null){newNode.scaleY=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][5]}
                    if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][3]!=null){
                        parBo=true;
                        this.addNodeParent(newNode,this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][3],tcID);
                    }
            }
            newNode.color=new cc.Color(255,255,255);
            newNode.bID=[NodeID,this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''],r];
            zNode=newNode;
            if(!parBo){newNode.parent=this.LayerNodeArr[tcID]}
            this.showNodeObj[NodeID]=newNode;
        }else{
            if(this.MapMcArr[NodeID+'']!=null){
                return;
            }
            mcBo=true;
            let strID=this.ymcMapSprArr[id][0];
          
            if(this.mcPool[id]==null){
                this.mcPool[id]={};
                this.mcPool[id]["pool"]=[];
                this.mcPool[id]["name"]=strID;
            }
          
            this.mcPool[id]["timer"]=this.timInt;
            let ymc;
            let pbo=false;
         
            if(this.mcPool[id]["pool"].length<=0){
                ymc=new YMovieClip(); 
            }else{
                let l=this.mcPool[id]["pool"].length-1
                ymc=this.mcPool[id]["pool"][l];
                this.mcPool[id]["pool"].splice(l,1);
                pbo=true;
                
            
            }
    
            ymc.pid=id;
           
        
            let eObj={};
            for(let eStr in this.ymcAllObj[strID][2]){
               for(let vStr in this.ymcAllObj[strID][2][eStr]){
                   eObj[eStr]={};
                   eObj[eStr][vStr]=null;
               }
            }
            if(!pbo){
                ymc.Init(null,strID,this.ymcAllObj[strID][0],this.ymcAllObj[strID][1],eObj,this.ymcAllObj[strID][3],this.ymcAllObj[strID][4],this.MapSprArr,this.revise);
                this.addNode(this.ymcMapSprArr[id][1],ymc);
            }else{
                ymc.Init2(this.ymcAllObj[strID][3],this.MapSprArr,this.revise);
            }
            ymc.setLocationFun(x,y);
        
            if(this.ymcFrameObj[NodeID+'']==null){
                lBo=true;
                ymc.setFrame(0,this.ymcTimInt,0,false,false);
            }else{
                ymc.setFrame(this.ymcFrameObj[NodeID+''][0],this.ymcTimInt,this.ymcFrameObj[NodeID+''][1],this.ymcFrameObj[NodeID+''][2],this.ymcFrameObj[NodeID+''][3]);
            }
            this.ymcStageArr[this.ymcStageArr.length]=ymc;
            this.MapMcArr[NodeID+'']=ymc;
            ymc.zIndex=NodeID;
            r=new cc.Rect(ymc.x+ymc.getRect().x,ymc.y+ymc.getRect().y,ymc.getRect().width,ymc.getRect().height);
            id=ymc;
            if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''].length>=4){//动画暂时不支持旋转，所以理论上不用添加0和1
                if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][2]!=null){ymc.opacity=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][2];}
                if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][4]!=null){newNode.scaleX=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][4]}
                if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][5]!=null){newNode.scaleY=this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][5]}
                if(this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][3]!=null){
                    parBo=true;
                    this.addNodeParent(ymc,this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''][3][3],tcID);
                }
            }
            ymc.color=new cc.Color(255,255,255);
            ymc.bID=[NodeID,this.nodeAllObj[this.LayerNodeArr[tcID].name][NodeID+''],r];
            if(!parBo){ymc.parent=this.LayerNodeArr[tcID]}
            this.showNodeObj[NodeID]=ymc;
            zNode=ymc;
        
        }
        this.setStageNodeInfo(this.LayerNodeArr[tcID].name,NodeID,pw,ph,false);
        if(mcBo){
            if(this.onLoadYMovieClip!=null){
                this.onLoadYMovieClip(zNode,this.LayerNodeArr[tcID].name,lBo);
            }
        }else{
            if(this.onLoadSprite!=null){
                this.onLoadSprite(zNode,this.LayerNodeArr[tcID].name);
            }
        }
    },
    /*************组合多个Node********/
    addNodeParent:function(node,id,tcID){
        if(this.nodeParentObj[id]!=null){
            if(this.nodeParentObj[id][7]==null){
                let pnode=this.addNode(this.extend({'name':this.nodeParentObj[id][0],'x':this.nodeParentObj[id][1]-this.flagPoint.x,'y':this.nodeParentObj[id][2]-this.flagPoint.y,'zIndex':this.nodeParentObj[id][5]+0.5,'parent':this.LayerNodeArr[tcID],},this.nodeParentObj[id][6]));
                node._y_parent=pnode;
                node.parent=pnode;
                this.nodeParentObj[id][7]=pnode;
                node.x-=pnode.x;
                node.y-=pnode.y;
                pnode.zIndex=node.zIndex;
                if(this.onLoadSpriteParent!=null){
                    this.onLoadSpriteParent(pnode,this.LayerNodeArr[tcID].name,true);
                }
            }else{
                node._y_parent=this.nodeParentObj[id][7];
                node.parent=this.nodeParentObj[id][7];
                node.x-=this.nodeParentObj[id][7].x;
                node.y-=this.nodeParentObj[id][7].y;
                if(this.nodeParentObj[id][7].parent==null){
                    this.nodeParentObj[id][7].parent=this.LayerNodeArr[tcID];
                    this.nodeParentObj[id][7].zIndex=node.zIndex;
                    if(this.onLoadSpriteParent!=null){
                        this.onLoadSpriteParent(this.nodeParentObj[id][7],this.LayerNodeArr[tcID].name,false);
                    }
                }
            }
        }
        node._y_parID=id;
    },
    /****publice***设置更改动画帧*注意一旦用此方法，那么动画的onLoadYMovieClip中的是否第一次加载参数将为flash*****/
    setYMovieClipFrame:function(nodeID,frame,pBo){
         if(this.showNodeObj[nodeID]!=null){
             if(pBo){
                 if(this.showNodeObj[nodeID].gotoAndPlay!=null){
                    this.showNodeObj[nodeID].gotoAndPlay(frame);
                 }
             }else{
                 if(this.showNodeObj[nodeID].gotoAndStop!=null){
                    this.showNodeObj[nodeID].gotoAndStop(frame);
                 }
             }
         }else{
            if(typeof(frame)=='number'){
                if(frame>0){
                    frame-=1;
                }
            }else{
                for(let str in this.nodeAllObj){
                    if(this.nodeAllObj[str][nodeID]){
                        frame=this.ymcAllObj[this.ymcMapSprArr[this.nodeAllObj[str][nodeID][0]][0]][4][frame]; 
                        break;
                    }
                }
                if(frame==null){return;}

            }
            if(pBo){
                this.ymcFrameObj[nodeID]=[frame,this.ymcTimInt,false,false];
            }else{
                this.ymcFrameObj[nodeID]=[frame,this.ymcTimInt,true,true];
            }
         }
    },
    /*************清除组合的父级Node********/
    removeNodeParent:function(node,str){
        if(node._y_parent!=null){
            if(node._y_parent.childrenCount==0){
                 node._y_parent.parent=null;
                 if(this.killSpriteParent!=null){
                     this.onLoadSpriteParent(node._y_parent,str);
                 }
            }
            node._y_parent=null;
        }
        if(node._y_parID!=null){
            node._y_parID=null;
        }
    },
    /*********将node添加到舞台对像中**********/
    addStageNodeObjFun:function (tcName,nodeID,nhStr) {
        if(this.stageNodeObj[tcName]==null){this.stageNodeObj[tcName]={};}
        if(this.stageNodeObj[tcName][nhStr]==null){this.stageNodeObj[tcName][nhStr]={};}
        if(this.stageNodeObj[tcName][nhStr][nodeID]===undefined){
            this.stageNodeObj[tcName][nhStr][nodeID]=null;
        }
    },
    extend:function(obj1,obj2){
        for(let key in obj2){ 
            obj1[key]=obj2[key]; 
        }
        return obj1;
    },
    /***public******通坐标返回某块区域内的所有node**********/
    getNodesByLocation:function(LayerName,x,y){
        let obj=this.stageNodeObj[LayerName];
        let arr=[];
        if(obj!=null){
            let pw=this.layerRect[LayerName][1];
            let ph=this.layerRect[LayerName][2];
            let nx=Math.floor(((x+this.flagPoint.x)/pw))*pw;
            let ny=Math.ceil(((y+this.flagPoint.y)/ph))*ph;
            if(obj[nx+'-'+ny]!=null){
                let sarr=this.stageNodeObj[LayerName][nx+'-'+ny];
                if(sarr!=null){
                    for(let str in sarr){
                        if(this.showNodeObj[str]!=null){
                            arr[arr.length]=this.showNodeObj[str];
                        }
                        
                    }
                }
            }
        }
        return arr;
    },
    /***public******通坐标返回某块区域内的最顶部的node**********/
getTopNodeByLocation:function(LayerName,x,y){
        let obj=this.stageNodeObj[LayerName];
        let node;
        if(obj!=null){
            let pw=this.layerRect[LayerName][1];
            let ph=this.layerRect[LayerName][2];
            let nx=Math.floor(((x+this.flagPoint.x)/pw))*pw;
            let ny=Math.ceil(((y+this.flagPoint.y)/ph))*ph;
            if(obj[nx+'-'+ny]!=null){
                let sarr=this.stageNodeObj[LayerName][nx+'-'+ny];
                if(sarr!=null){
                    for(let str in sarr){
                        if(this.showNodeObj[str]!=null){
                            if(node==null){;
                                node=this.showNodeObj[str];
                            }else{
                                if(node.zInde<this.showNodeObj[str].zIndex){
                                    node=this.showNodeObj[str];
                                }
                            };
                        }
                    }
                }
            }
        }
        return node;
    },
    /****public*****将图块node信息添加到地图中,参数1 可以是ID也可以图块Node**********/
    addMapNode:function(n,LayerName,x,y){
        let id=null;
        let nBo=false;
        if(n instanceof cc.Node){
            if(n.bID==null){return false}
            id=n.bID[0];
            nBo=true;
        }else{
            if(typeof(n)=='number'){
                id=n;
            }else{
                return false;
            }
        }
        if(this.nodeAllObj[LayerName]==null){return false;}
        let pw=this.layerRect[LayerName][1];
        let ph=this.layerRect[LayerName][2];
        let i=-1;
        if(this.LayerNodeObj[LayerName]!=null){
           i=this.LayerNodeObj[LayerName].LayerArrID;
        }else{
           return false;
        }
        let nArr=null;
        for(let str in this.nodeAllObj){
            if(str!=LayerName){
                if(this.nodeAllObj[str][id]!=null){
                    nArr=this.nodeAllObj[str][id];
                    this.setStageNodeInfo(str,id,this.layerRect[str][1],this.layerRect[str][2],true);
                    this.Info(str,id,i,null,true);//清除地图中的信息
                    delete(this.nodeAllObj[str][id]);
                }
            }
        }
        if(nArr!=null){
            this.nodeAllObj[LayerName][id]=nArr;
            this.setStageNodeInfo(LayerName,id,pw,ph,true);
            this.Info(LayerName,id,i,null,true);//清除地图中的信息
        }
        let mcBo=false;
        if(typeof(this.nodeAllObj[LayerName][id][0])!='number'){
            mcBo=true;
        }
        let node=this.showNodeObj[id];
        if(x==null){x=this.nodeAllObj[LayerName][id][1]-this.flagPoint.x;}
        if(y==null){y=this.nodeAllObj[LayerName][id][2]-this.flagPoint.y;}
        let ix=this.nodeAllObj[LayerName][id][1]-this.flagPoint.x;
        let iy=this.nodeAllObj[LayerName][id][2]-this.flagPoint.y;
        let _this=this;
        this.setNodeLocation(LayerName,id,x+_this.flagPoint.x,y+_this.flagPoint.y,node);
        this.Info(LayerName,id,i,function(lx,ly,jx){//添加地图中的信息
            let stageRect=new cc.Rect(cc.view.getVisibleOrigin().x,cc.view.getVisibleOrigin().y,cc.view.getVisibleSize().width,cc.view.getVisibleSize().height);
            let nXY=new cc.Vec2(jx.x-_this.flagPoint.x,jx.y-_this.flagPoint.y);
            let rect=new cc.Rect(0,0,jx.width*this.node.scaleX,jx.height*this.node.scaleY);
            let dian=_this.LayerNodeObj[LayerName].convertToWorldSpaceAR(cc.v2(nXY.x,nXY.y));
            rect.x=dian.x;
            rect.y=dian.y*-1;
            let r1=rect;
            let r2=new cc.Rect(stageRect.x,stageRect.y-stageRect.height,stageRect.width,stageRect.height);
            if((r1.x+r1.width)<=r2.x||(r2.x + r2.width)<=r1.x||(r1.y+r1.height)<=r2.y||(r2.y + r2.height)<=r1.y){//这里应该必要
                if(_this.showNodeObj[id]!=null){
                    _this.killStageNode(LayerName,_this.showNodeObj[id],id,mcBo);
                }
            }else{
                if(_this.showNodeObj[id]!=null){
                    _this.showNodeObj[id].x=x;
                    _this.showNodeObj[id].y=y;
                    _this.setStageNodeInfo(LayerName,id,pw,ph,false);
                }else{
                    if(_this.LayerNodeArr[i].parent!=null){
                        _this.addNodeChildFun(_this.nodeAllObj[LayerName][id][0],x-_this.flagPoint.x,y-_this.flagPoint.y,i,id)
                    }
                }
            }
        });
        if(nBo){n.destroy();}
        return true;  
    },
    /*********删除舞台外面的对像**********/
    removeNodeChildFun:function(rArr,stageRect,nStr)
    {
        for(let i=0;i<this.LayerNodeArr.length;i++){
            if(nStr!='this'){
                if(this.LayerNodeArr[i].name!=nStr){continue;}
            }
            for(let o=0;o<rArr.length;o++){
                let pw=this.layerRect[this.LayerNodeArr[i].name][1];
                let ph=this.layerRect[this.LayerNodeArr[i].name][2];
                let cx=rArr[o].x;
                let cy=rArr[o].y;
                let cw=rArr[o].width;
                let ch=rArr[o].height;
                let obj=this.stageNodeObj[this.LayerNodeArr[i].name];
                if(obj==null){continue;}
                    for(let w=0;w<cw;w++){
                        for(let h=0;h<ch;h++){
                           let nx=cx*pw+w*pw;
                            let ny=cy*ph+h*ph;
                            if(obj[nx+"-"+ny]!=null){
                                let sarr=this.stageNodeObj[this.LayerNodeArr[i].name][nx+"-"+ny];
                                if(sarr==null){continue;}
                                for(let str in sarr){
                                    this.removeStageNode(str,stageRect);
                                }
                            }
                        }
                    }
                }
            }
    },
    /************清除舞台上单个Node*************/
    removeStageNode:function(nodeID,stageRect){
        let n=this.showNodeObj[nodeID];
        if(n==null){return;}
        let nRect=n.bID[2];
        let nPar;
        let mcBo=false;
        if(typeof(n.bID[1][0])=='number'){
            if(n._y_parent!=null){
                nPar=n._y_parent.parent;
            }else{
                nPar=n.parent;
            }
        }else{
            nPar=n.getPraent();
            mcBo=true;
        }
        if(nPar==null){
            return;
        }
        let layerName=nPar.name;
        let pw=this.layerRect[layerName][1];
        let ph=this.layerRect[layerName][2];
        let nXY=new cc.Vec2(nRect.x,nRect.y);
        let dian=nPar.convertToWorldSpaceAR(cc.v2(n.MRect.x*pw-this.flagPoint.x,n.MRect.y*ph-this.flagPoint.y));
        let r1=new cc.Rect(dian.x,dian.y*-1,(n.MRect.width-n.MRect.x+1)*pw*this.node.scaleX,(n.MRect.y-n.MRect.height+1)*ph*this.node.scaleY);
        let r2=new cc.Rect(stageRect.x,stageRect.y-stageRect.height,stageRect.width,stageRect.height);
        if((r1.x+r1.width)<=r2.x||(r2.x + r2.width)<=r1.x||(r1.y+r1.height)<=r2.y||(r2.y + r2.height)<=r1.y){//这里应该必要
           this.setStageNodeInfo(layerName,nodeID,pw,ph,true);
        }else{
            return;
        }
        this.killStageNode(layerName,n,nodeID,mcBo);
    },
    /*public*****获得地图Node信息,第一个参数可以Node也可以是ID*******/
    getMapNodeObj:function(IDorN,LayerName){
        let nodeID=null;
        if(IDorN instanceof cc.Node){
            nodeID=IDorN.bID[0];
        }else{
            nodeID=IDorN;
        }
        if(LayerName==null){
            for(let str in this.nodeAllObj){
                if(this.nodeAllObj[str][nodeID]!=null){
                    LayerName=str;
                    break;
                }
            }
        }
        if(LayerName==null){return null;}
        let obj={};
        if(typeof(this.nodeAllObj[LayerName][nodeID][0])=='number'){
            obj['name']=this.MapSprArr[this.nodeAllObj[LayerName][nodeID][0]][0];
        }else{
            obj['name']=this.ymcMapSprArr[this.nodeAllObj[LayerName][nodeID][0]][0];
        }
        obj['LayerName']=LayerName;
        obj['id']=nodeID;
        obj['x']= this.nodeAllObj[LayerName][nodeID][1]-this.flagPoint.x;
        obj['y']= this.nodeAllObj[LayerName][nodeID][2]-this.flagPoint.y;
        return obj;
    },
    /****public****坐标更改******Bo 加等还是更改***/
    setMapLocation:function(n,lObj,LayerName,Bo){
        let id=-1;
        let mcBo=false;
        let x=lObj['x'];
        let y=lObj['y'];
        let sx=lObj['sx'];
        let sy=lObj['sy'];
        if(n instanceof cc.Node){
            if(n.bID!=null){
               id=n.bID[0];
            }else{
                return;
            }
        }else {
            id=n;
        }
        if(id==-1){
            return;
        }
        if(LayerName==null){
            for(let str in this.nodeAllObj){
                if(this.nodeAllObj[str][id]!=null){
                    LayerName=str;
                    break;
                }
            }
        }
        if(LayerName==null){return;}
        let i=-1;
        if(this.LayerNodeObj[LayerName]!=null){
             i=this.LayerNodeObj[LayerName].LayerArrID;
        }else{
            return;
        }
        if(typeof(this.nodeAllObj[LayerName][id][0])!='number'){
            mcBo=true;
        }
        let node=this.showNodeObj[id];
        let pw=this.layerRect[LayerName][1];
        let ph=this.layerRect[LayerName][2];
        if(x==null){x=this.nodeAllObj[LayerName][id][1]-this.flagPoint.x;}
        else if(Bo){x=this.nodeAllObj[LayerName][id][1]-this.flagPoint.x+x;}
        if(y==null){y=this.nodeAllObj[LayerName][id][2]-this.flagPoint.y;}
        else if(Bo){y=this.nodeAllObj[LayerName][id][2]-this.flagPoint.y+y;}
        let ix=this.nodeAllObj[LayerName][id][1]-this.flagPoint.x;
        let iy=this.nodeAllObj[LayerName][id][2]-this.flagPoint.y;
        let _this=this;
        let ggBo=false;
        let lx=this.nodeAllObj[LayerName][id][3][4]==null?1:this.nodeAllObj[LayerName][id][3][4];
        let ly=this.nodeAllObj[LayerName][id][3][5]==null?1:this.nodeAllObj[LayerName][id][3][5];
        if(sx!=null&&sx!=lx){ggBo=true;}
        if(sy!=null&&sy!=ly){ggBo=true;}
        if(x!=ix||y!=iy||ggBo){
            this.setStageNodeInfo(LayerName,id,pw,ph,true);
            this.Info(LayerName,id,i,null,true);//清除地图中的信息
            if(sx!=null){this.nodeAllObj[LayerName][id][3][4]=sx}
            if(sy!=null){this.nodeAllObj[LayerName][id][3][5]=sy}
            this.setNodeLocation(LayerName,id,x+_this.flagPoint.x,y+_this.flagPoint.y,node);
         
            this.Info(LayerName,id,i,function(lx,ly,jx){//添加地图中的信息
                let stageRect=new cc.Rect(cc.view.getVisibleOrigin().x,cc.view.getVisibleOrigin().y,cc.view.getVisibleSize().width,cc.view.getVisibleSize().height);
                let nXY=new cc.Vec2(jx.x-_this.flagPoint.x,jx.y-_this.flagPoint.y);
                let rect=new cc.Rect(0,0,jx.width*_this.node.scaleX,jx.height*_this.node.scaleY);
                let dian=_this.LayerNodeObj[LayerName].convertToWorldSpaceAR(cc.v2(nXY.x,nXY.y));
                rect.x=dian.x;
                rect.y=dian.y*-1;
                let r1=rect;
                let r2=new cc.Rect(stageRect.x,stageRect.y-stageRect.height,stageRect.width,stageRect.height);
                if((r1.x+r1.width)<=r2.x||(r2.x + r2.width)<=r1.x||(r1.y+r1.height)<=r2.y||(r2.y + r2.height)<=r1.y){//这里应该必要
                    if(_this.showNodeObj[id]!=null){
                        _this.killStageNode(LayerName,_this.showNodeObj[id],id,mcBo);
                    }
                }else{
                    if(_this.showNodeObj[id]!=null){
                        _this.showNodeObj[id].x=x;
                        _this.showNodeObj[id].y=y;
                        if(sx!=null){
                            _this.showNodeObj[id].scaleX=sx;
                        }
                        if(sy!=null)_this.showNodeObj[id].scaleY=sy;
                        _this.setStageNodeInfo(LayerName,id,pw,ph,false);
                    }else{
                        if(_this.LayerNodeArr[i].parent!=null){
                            _this.addNodeChildFun(_this.nodeAllObj[LayerName][id][0],x-_this.flagPoint.x,y-_this.flagPoint.y,i,id)
                        }
                    }
                }
            });
        }
    },
    /********清除或清加舞台上地图信息*********/
    setStageNodeInfo:function(LayerName,id,pw,ph,remBo){
        let node=this.showNodeObj[id];
        if(node==null){return;}
        let yrect=node.bID[2];
        let tx,ty,iw,ih;
        if(remBo){;
            tx = node.MRect.x;
            ty =node.MRect.y;
            iw =node.MRect.width;
            ih =node.MRect.height;
        }else{
            let r = this.getNodeRect(LayerName,id);
            let nodeX = r.x;
            let nodeY = r.y;
            tx =(Math.floor(nodeX/pw));
            ty =(Math.ceil(nodeY/ph));
            iw =Math.floor(((r.width+ nodeX-1)/pw));
            ih = Math.ceil((nodeY-r.height+1)/ph);
            // let nodeX = yrect.x+this.flagPoint.x;
            // let nodeY = yrect.y+this.flagPoint.y;
            // tx =(Math.floor(nodeX/(pw)));
            // ty =(Math.ceil(nodeY/(ph)));
            // iw =Math.floor(((yrect.width+ nodeX-1)/pw));
            // ih =Math.ceil((nodeY-yrect.height+1)/(ph));
            node.MRect=new cc.rect(tx,ty,iw,ih);
        }
        for(let xt=tx;xt<=iw;xt++){
            for(let yt=ty;yt>=ih;yt--){//坐标相反倒序列相减
                if(node!=null){
                    if(remBo){
                        if(this.stageNodeObj[LayerName][((xt)*pw)+'-'+((yt)*ph)]!=null){
                            delete(this.stageNodeObj[LayerName][((xt)*pw)+'-'+((yt)*ph)][id]);
                        }
                    }else{
                        this.addStageNodeObjFun(LayerName,id,((xt)*pw)+'-'+((yt)*ph));
                    }
                }
            }
        }
    },
    /***********清除舞台上的Node****/
    killStageNode:function(layerName,n,nodeID,mcBo){
        let arr=this.MapSprArr[n.bID[1][0]];
        if(!mcBo){
            if(this.killSprite!=null){
                this.killSprite(n,layerName);
            }
            n.parent=null;
            n.opacity=255;
            arr[2][arr[2].length]=n;
            let ctobj=arr[1];
            delete(ctobj[nodeID]);
        }else{
         
            if(this.killYMovieClip!=null){
                this.killYMovieClip(n,layerName);
            }
            this.mcPool[n.pid]["pool"][this.mcPool[n.pid]["pool"].length]=n;
            delete(this.MapMcArr[nodeID]);
            this.ymcFrameObj[nodeID]=[n.cFrame,this.ymcTimInt,n.stopBo,n.offBo];
            let sy= this.ymcStageArr.indexOf(n);
            if(sy!=-1){
                this.ymcStageArr.splice(sy,1);
            }
            n.parent=null;
        //    n.removeThis();
        }
        delete(this.showNodeObj[nodeID]);
        this.removeNodeParent(n,layerName);
    },
    /********返回两个矩形相交的部分********/
    getIntersectsRectFun:function(rect1,rect2){
        let rect=new cc.Rect();
        rect.x=rect1.x>rect2.x?rect1.x:rect2.x;//X取最大
        rect.y=rect1.y<rect2.y?rect1.y:rect2.y;//Y取最小
        let nw=(rect1.x+rect1.width)>(rect2.x+rect2.width)?(rect2.x+rect2.width):(rect1.x+rect1.width);
        let nh=(rect1.y-rect1.height)<(rect2.y-rect2.height)?(rect2.y-rect2.height):(rect1.y-rect1.height);
        rect.width=nw-rect.x;
        rect.height=Math.abs(rect.y-nh);
        return rect;
    },
    /******public****卸载地图Node 参数：ID或是图块Node*********/
    removeMapNode:function(n){
        let id=null;
        let nBo=false;
        if(n instanceof cc.Node){
            if(n.bID==null){return false}
            id=n.bID[0];
            nBo=true;
        }else{
            if(typeof(n)=='number'){
                id=n;
            }else{
                return false;
            }
            if(this.showNodeObj[id]!=null){
                nBo=true;
                n=this.showNodeObj[id];
            }
        }
        let LayerName=null;
        for(let str in this.nodeAllObj){
            if(this.nodeAllObj[str][id]!=null){
                LayerName=str;
                break;
            }
        }
        if(LayerName==null){return;}
        let i=-1;
        if(this.LayerNodeObj[LayerName]!=null){
            i=this.LayerNodeObj[LayerName].LayerArrID;
        }else{
            return;
        }
        let mcBo=false; 
        if(nBo){
            if(this.showNodeObj[id]!=null){
                let pw=this.layerRect[LayerName][1];
                let ph=this.layerRect[LayerName][2];
                let arr=this.MapSprArr[this.nodeAllObj[LayerName][id][0]];
                if(n instanceof YMovieClip){
                    mcBo=true;
                }
                this.setStageNodeInfo(LayerName,id,pw,ph,true);
                if(!mcBo){
                    let ctobj=arr[1];
                    if(ctobj[id]!=null){delete(ctobj[id]);}
                }else{
                    if(this.MapMcArr[id]!=null){delete(this.MapMcArr[id]);}
                    this.ymcFrameObj[id]=[n.cFrame,this.ymcTimInt,n.stopBo,n.offBo];
                    let sy=this.ymcStageArr.indexOf(n);
                    if(sy!=-1){
                        this.ymcStageArr.splice(sy,1);
                    }
                }
                delete(this.showNodeObj[id]);
            }
        }
        this.Info(LayerName,id,i,null,true);//清除地图中的信息
        if(mcBo){n.removeThis();}    
    },
    /**public*****通过名子得到图块的地图父节点，但需要地图父节点必须在场景加载过，否则反为null***/
    getNodeParentByName:function(name){
        for(let str in this.nodeParentObj){
            if(this.nodeParentObj[str][0]==name){
                if(this.nodeParentObj[str].length>=8){
                    return this.nodeParentObj[str][7];
                }
            }
        }
        return null;
    },
    /**public*****通过图块得到其地图父节点，如果图没有地图父节点，则反为null,如果你确定该图块一定有地图父节点，也可以直接n.parent得到***/
    getNodeParentBySprite:function(n){
        if(node._y_parent!=null){
            return node._y_parent.parent;
        }
        return null;
    },
    getNodeRect:function(layerName,nodeID){
        let r = new cc.Rect(this.nodeAllObj[layerName][nodeID][1],this.nodeAllObj[layerName][nodeID][2]);
        let id=this.nodeAllObj[layerName][nodeID][0];
        let sx=1;
        let sy=1;
        if(this.nodeAllObj[layerName][nodeID].length>=4){
            if(this.nodeAllObj[layerName][nodeID][3][0]!=null){r.x=this.nodeAllObj[layerName][nodeID][3][0];}
            if(this.nodeAllObj[layerName][nodeID][3][1]!=null){r.y=this.nodeAllObj[layerName][nodeID][3][1];}
            if(this.nodeAllObj[layerName][nodeID][3][4]!=null){sx=this.nodeAllObj[layerName][nodeID][3][4]}
            if(this.nodeAllObj[layerName][nodeID][3][5]!=null){sy=this.nodeAllObj[layerName][nodeID][3][5]}
        }
        if(typeof(id)=='number'){
            r.width=this.MapSprArr[id][0][2]*sx;
            r.height=this.MapSprArr[id][0][3]*sy;
        }else{
            let mr=this.ymcAllObj[this.ymcMapSprArr[id][0]][3];
            r.x+=mr.x;
            r.y+=mr.y;
            r.width=mr.width*sx;
            r.height=mr.height*sy;
        }
        return r;
    },
    /******地图坐标信息更改*******/
    setNodeLocation:function(layerName,nodeID,x,y,node){
        let tx=x-this.nodeAllObj[layerName][nodeID][1];
        let ty=y-this.nodeAllObj[layerName][nodeID][2];
        this.nodeAllObj[layerName][nodeID][1]+=tx;
        this.nodeAllObj[layerName][nodeID][2]+=ty;
        if(this.nodeAllObj[layerName][nodeID].length>=4){ 
            if(this.nodeAllObj[layerName][nodeID][3][0]!=null){this.nodeAllObj[layerName][nodeID][3][0]+=tx;}
            if(this.nodeAllObj[layerName][nodeID][3][1]!=null){this.nodeAllObj[layerName][nodeID][3][1]+=ty;}
        }
        if(node!=null){
            if(node.bID!=null){
                node.bID[2].x+=tx;
                node.bID[2].y+=ty;
            }
        }
    },
    /**********得到舞台上的显示对像***********/
    getShowNode:function(id){
        if(this.showNodeObj[id]!=null){
            return this.showNodeObj[id];
        }
        return null;
    },
    /******向地图添加信息*******/
    Info:function(layerName,nodeID,i,fun,remBo){
       if(i==-1){
           for(let t=0;t<this.LayerArr.length;t++){
               if(this.LayerArr[t]['LayerName']==layerName){
                    i=t;
                    break;
                }
            }
        }
        if(i==-1){return};
        if(remBo==null){remBo=false;}
        let id=this.nodeAllObj[layerName][nodeID][0];
        let r = this.getNodeRect(layerName,nodeID);
        let pw=this.layerRect[layerName][1];
        let ph=this.layerRect[layerName][2];
        let nodeX = r.x;
        let nodeY = r.y;
        let tx =(Math.floor(nodeX/pw));
        let ty =(Math.ceil(nodeY/ph));
        let iw =Math.floor(((r.width+ nodeX-1)/pw));
        let ih = Math.ceil((nodeY-r.height+1)/ph);
        for(let xt=tx;xt<=iw;xt++){
            for(let yt=ty;yt>=ih;yt--){
                let xn=(xt*pw).toString();
                let yn=(yt*ph).toString();
                if(!remBo){
                    if(this.LayerArr[i]['Position'][xn]==null){this.LayerArr[i]['Position'][xn]={}}
                    if(this.LayerArr[i]['Position'][xn][yn]==null){this.LayerArr[i]['Position'][xn][yn]=[]}
                    this.LayerArr[i]['Position'][xn][yn].push(Number(nodeID));
                }else{
                    if(this.LayerArr[i]['Position'][xn]!=null){
                        if(this.LayerArr[i]['Position'][xn][yn]!=null){
                            let v=this.LayerArr[i]['Position'][xn][yn].indexOf(nodeID);
                            if(v!=-1){
                                this.LayerArr[i]['Position'][xn][yn].splice(v,1);
                            }
                        }
                    }
                }
                if(fun!=null){fun(xn,yn,r);}
            }
        }
    },
    /*****得到标标签******/
    getTag:function(str){
        if(this.tagObj[str]!=null){
            return this.tagObj[str];
        }else{
            return [];
        }
    },
    /***导出寻路对像**/
    onPath:function(pathObj){
        if(pathObj['pathObj']==null){return;}
        let pobj={};
        for(let i=0;i<pathObj['pathObj'].length;i++){
            pobj[pathObj['pathObj'][i][1]+"*"+pathObj['pathObj'][i][0]]={'x':pathObj['pathObj'][i][0],'y':pathObj['pathObj'][i][1]}
        }
       pathObj['pathObj']=pobj;
       this.PathGridObj=pathObj;
    },
    /********当贴图加载完成执行********/
    onLayerFun: function () {
        //'闪影 个人版v0.9.0
        this.BGInit();
        this.onLayerFun2();
        let mcArr=this.MapObj['mcArr'];
        this.ymcAllObj={};
        for(let str in mcArr)
        {
            let arr=mcArr[str][0];
            let zarr=[];
            for(let t=0;t<arr.length;t++){
                let tarr=[];
                let carr=arr[t];
                let l=carr[0];
                for(let c=1;c<carr.length;c++){
                    tarr[tarr.length]=carr[c];
                }
                for(let s=0;s<l;s++){
                    zarr[zarr.length]=tarr;
                }
                this.ymcAllObj[str]=[zarr,mcArr[str][1],mcArr[str][2],new cc.Rect(mcArr[str][3][0],mcArr[str][3][1],mcArr[str][3][2],mcArr[str][3][3]),mcArr[str][4]];
            }
        }
        for(let str in this.nodeAllObj){
            for(let i=0;i<this.LayerArr.length;i++){
                if(this.LayerArr[i]['LayerName']==str){
                    if(this.LayerArr[i]['Position']==null){
                        this.LayerArr[i]['Position']={};
                        for(let idStr in this.nodeAllObj[str]){
                            this.Info(str,idStr,i);
                            if(this.nodeAllObj[str][idStr][3]==null){this.nodeAllObj[str][idStr][3]=[];}
                        }
                    }
                }
            }
        }
        let hitFun=function(arr,bo){
            for(let i=0;i<arr.length;i++){
                if(arr[i]['pz']!=null){
                    let pzArr={}
                    for(let str in arr[i]['pz']){
                        if(arr[i]['pz'][str]){
                            if(bo){
                                pzArr[str]={};
                                pzArr[str]['offset']=new cc.Vec2(arr[i]['pz'][str][0],arr[i]['pz'][str][1]);
                                pzArr[str]['size']=new cc.Size(arr[i]['pz'][str][2],arr[i]['pz'][str][3]);
                            }else{
                                pzArr[str]={};
                                pzArr[str]['points']=[];
                                for(let s=0;s<arr[i]['pz'][str].length;s++){
                                    pzArr[str]['points'][pzArr[str]['points'].length]=new cc.Vec2(arr[i]['pz'][str][s][0],arr[i]['pz'][str][s][1]);
                                }
                            }
                        }
                    }
                    arr[i]['pz']=pzArr;
                }
            }
        }
        for(let yStr in this.ymcMapSprArr){
            let pzObj=this.ymcMapSprArr[yStr][1];
            if(pzObj['Collider']!=null){hitFun(pzObj['Collider'],true);}
            if(pzObj['PolygonCollider']!=null){hitFun(pzObj['PolygonCollider'],false);}
        }
        this.LayerNodeArr=new Array();
        this.LayerNodeObj={};
        for(let i=0;i<this.LayerArr.length;i++)
        {
            
            let n=this.addNode(this.extend({"name":this.LayerArr[i]["LayerName"],"zIndex":i*100,"parent":this.node},this.LayerArr[i]["Pro"]));
            this.LayerNodeObj[this.LayerArr[i]["LayerName"]]=n;
            this.LayerNodeArr[i]=n;//保存图层Node的数组
            n.LayerArrID=i;
        }
        this.LoadBo=true;
        this.setLocationFun(this.node.x,this.node.y);
        if(this.cInit!=null){this.cInit();this.cInit=null;}
        if(this.Init!=null){this.Init();}
    },
});