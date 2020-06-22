//对象池管理

let PoolManager = {
	_nodePools:[],

	//_nodePoolNames： Array
	initNodePools: function (_nodePoolNames) {
		for (var i = 0; i < _nodePoolNames.length; i++) {
			this.createNodePool(_nodePoolNames[i]);
		}
	},

	createNodePool: function (name) {
		if (!this.getNodePool(name) && !this.getNodeElement(name)) {
			let nodePool = new cc.NodePool(name);
			this._nodePools.push(nodePool);
			return nodePool;
		}else {
			return null;
		}
	},

	getNodePool: function (name) {
		if (this._nodePools.length > 0){
			for (var i = 0; i < this._nodePools.length; i++) {
				if (this._nodePools[i].poolHandlerComp == name){
					return this._nodePools[i];
				}
			}
		}
		return null;
	},

	getNodeElement: function (name) {
		let nodePool = this.getNodePool(name);
		if (nodePool){
			let nodeElement = nodePool.get();
			return nodeElement;
		}else{
			return null;
		}
	},

	putNodeElement: function (name, element) {
		let nodePool = this.getNodePool(name);
		if (nodePool){
			nodePool.put(element);
		}
	},

	clear: function (name) {
		let nodePool = this.getNodePool(name);
		if (nodePool){
			nodePool.clear();
		}
	},

	clearAll: function () {
		for (let index = 0; index < this._nodePools.length; index++) {
			this._nodePools[index].clear();
		};
		this._nodePools.length = 0;
	},

};
module.exports = PoolManager;