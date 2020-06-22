/*
    自定义事件的监听和发送
*/
(function () {
    var EventCustom = {
        eventTarget: new cc.EventTarget(),
    };

    EventCustom.on = function (event_name, call_back, nodeOrProity) {
        if (typeof event_name === 'undefined' || typeof call_back === 'undefined') {
            cc.warn('EventCustom on: event_name or callback is null.');
            return;
        };

        if (!nodeOrProity) {
            nodeOrProity = cc.game;
        }

        if (nodeOrProity instanceof cc.Component) {
            nodeOrProity = nodeOrProity.node;
        }

        function onEnd(event) {
            call_back(event.detail, event);
        }

        if (nodeOrProity instanceof cc.Node) {
            nodeOrProity._eventCustom = nodeOrProity._eventCustom || {};
            nodeOrProity._eventCustom[event_name] = onEnd;
        }

        return this.eventTarget.on(event_name, onEnd, nodeOrProity, false);
    };

    EventCustom.once = function (event_name, call_back, nodeOrProity) {
        if (typeof event_name === 'undefined' || typeof call_back === 'undefined') {
            cc.warn('EventCustom once: event_name or callback is null.');
            return;
        };

        if (nodeOrProity instanceof cc.Component) {
            nodeOrProity = nodeOrProity.node;
        }

        var self = this;
        function onceFunc(event) {
            call_back(event.detail, event);
        };

        this.eventTarget.once(event_name, onceFunc, nodeOrProity, true);
    };

    //发送自定义事件
    //@param {string} event_name
    //@param {*} user_data
    EventCustom.emit = function (event_name, user_data) {
        if (typeof event_name === 'undefined') {
            cc.warn('EventCustom emit: event_name is null.');
            return;
        };
        cc.log("EventCustom.emit " + event_name);

        var event = new cc.Event.EventCustom(event_name);
        event.detail = user_data;

        // Event.AT_TARGET
        event.eventPhase = cc.Event.AT_TARGET;
        event.target = event.currentTarget = this.eventTarget;

        this.eventTarget.dispatchEvent(event);
    };

    //关闭自定义事件
    //@param {listener|string|Node|Component} eventNameOrNode
    //@param {null|node|Component} nodeOrComponent if eventNameOrNode is "string" need nodeOrComponent
    EventCustom.off = function (eventNameOrNode, nodeOrComponent) {
        if (eventNameOrNode instanceof cc.EventListener) {
            cc.eventManager.removeListener(eventNameOrNode);
        } else if (typeof eventNameOrNode === 'string') {
            if (nodeOrComponent) {
                //关闭某个节点上这个事件的监听
                if (nodeOrComponent instanceof cc.Component) {
                    nodeOrComponent = nodeOrComponent.node;
                }

                if (nodeOrComponent._eventCustom) {
                    var callback = nodeOrComponent._eventCustom[eventNameOrNode];
                    if (callback) {
                        delete nodeOrComponent._eventCustom[eventNameOrNode];
                        this.eventTarget.off(eventNameOrNode, callback, nodeOrComponent, true);
                    }
                } else {
                    this.eventTarget.off(eventNameOrNode);
                }
            }
        } else if (eventNameOrNode instanceof cc.Node) {
            this.eventTarget.targetOff(eventNameOrNode);
        } else if (eventNameOrNode instanceof cc.Component) {
            cc.eventManager.targetOff(eventNameOrNode.node);
        }
    };

    // 按钮点击事件注册
    EventCustom.clickEvent = function(btn, callBack, eventData, target, component){
        if(btn instanceof cc.Node){
            btn = btn.getComponent(cc.Button);
        }
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = component;// 这个是代码脚本文件名
        clickEventHandler.handler = callBack;
        clickEventHandler.customEventData = eventData;
        btn.clickEvents.push(clickEventHandler);
    };

    // pageView滑动事件注册
    EventCustom.pageEvent = function(pageView, callBack, eventData, target, component){
        var pageEventHandler = new cc.Component.EventHandler();
        pageEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        pageEventHandler.component = component;// 这个是代码脚本文件名
        pageEventHandler.handler = callBack;
        pageEventHandler.customEventData = eventData;
        pageView.pageEvents.push(pageEventHandler);
    };

    module.exports = EventCustom;
})();