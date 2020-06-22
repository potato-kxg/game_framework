// 界面类型(功能层级分类)
/* 界面基类
1）内容层，展示游戏相关的信息界面。
2）弹窗层，基础弹窗界面。
3）tips层，显示提示性信息界面，例如获得物品的浮窗、网络异常的提示。
4）新手引导层，主要显示新手引导的手指、新手提示文本框等。
5）alert层，主要显示系统级的信息、错误，例如断网、被踢下线。
6）WebView层，显示网页。
7）loading层，显示加载动画。 */

var ViewType = cc.Enum({
    BASE: "BaseLayer",
    DIALOG: "DialogLayer",
    TIPS: "TipsLayer",
    GUIDE: "GuideLayer",
    ALERT: "AlertLayer",
    WEB_VIEW: "WebViewLayer",
    LOADING: "LoadingLayer",
});

module.exports = ViewType;