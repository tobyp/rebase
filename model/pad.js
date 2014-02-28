/* represents a node. */
function Node() {

}

Node.prototype.__proto__ = rect.prototype;

/* Toggle this node depending on node 'n'. */
Node.prototype.toggle_dep = function(n) {
	if (this.deps.hasOwnProperty(n)) {
		delete this.deps[n];
	}
	else {
		this.deps[n] = 0;
	}
}

/* Make this node depend on node 'n', if it doesn't already. */
Node.prototype.put_dep = function(n) {
	if (!this.deps.hasOwnProperty(n)) {
		this.deps[n] = 0;
	}
}

/* Make this node not depend on node 'n' anymore, if it does in the first place. */
Node.prototype.discard_dep = function(n) {
	if (this.deps.hasOwnProperty(n)) {
		delete this.deps[n];
	}
}

function Pad(settings) {
	this.settings_key = settings;
	this.settings = localStorage[settings]
	if (this.settings === undefined) this.settings = window.default_pad_settings;
	else this.settings = JSON.parse(this.settings);
	this.load();
}

Pad.prototype.save_settings = function() {
	localStorage[this.settings_key] = JSON.stringify(this.settings);
}

Pad.prototype.load = function() {
	console.log("Loading pad '"+this.settings.data_key+"'...");
	if (localStorage[this.settings.data_key] === undefined) {
		localStorage[this.settings.data_key] = '{"nodes": []}';
	}
	var data = JSON.parse(window.localStorage[this.settings.data_key]);
	this.nodes = data["nodes"];
	this.index = {};
	this.nodes.foreach(function(v) {
		v.__proto__ = Node.prototype;
		this.index[v.n] = v;
	}, this);
}

/* Add a new new node 'n' to this Pad. */
Pad.prototype.add = function(node) {
	if (this.index.hasOwnProperty(node.n)) throw "Duplicate node name";
	this.nodes.push(node);
	this.index[node.n] = node;
	node.__proto__ = Node.prototype;
	console.log("Added node '"+node.n+"'");
}

/*
Get a node. Can be called in three forms:
get_node(Number): Get the node by index,
get_node(String): Get node by text,
get_node(Node): Get nody by identity
Returns [Node, Number] with the node itself, and its index, if the node exists, or [null, -1] if it does not.
*/
Pad.prototype.get_node = function(node) {
	var v = null;
	var i = -1;
	if (typeof(node) === 'number') {
		if (node >= 0 && node < this.nodes.length) {
			v = this.nodes[node];
			i = node;
		}
	}
	else if (typeof(node) === 'string') {
		v = this.index[node]; //or undefined
		i = this.nodes.indexOf(v); //should come out -1
	}
	else {
		i = this.nodes.indexOf(node); //could be -1
		if (i != -1) v = this.nodes[i];
	}
	return [v, i];
}

/* Rename a node from 'old' name to 'new_name'. */
Pad.prototype.rename = function(old, new_name) {
	if (this.index.hasOwnProperty(new_name)) throw "Duplicate node name";
	var x = this.get_node(old);
	var v = x[0];
	var i = x[1];
	if (v != null) {
		this.nodes.foreach(function(d) {
			if (d.deps.hasOwnProperty(v.n)) {
				delete d.deps[v.n];
				d.deps[new_name] = v;
			}
		});
		delete this.index[v.n];
		console.log("Renaming node '"+v.n+"' to '"+new_name+"'");
		v.n = new_name;
		this.index[new_name] = v;
	}
}

/* Remove node 'node'. Can be called with Number, String, or Node (see get_node). */
Pad.prototype.remove = function(node) {
	var x = this.get_node(node);
	var v = x[0];
	var i = x[1];
	if (v != null) {
		this.nodes.foreach(function(d) {
			d.discard_dep(v.n);
		});
		this.nodes.splice(i, 1);
		delete this.index[v.n];
		console.log("Removed node '"+v.n+"'");
	}
}

Pad.prototype.save = function() {
	console.log("Saving pad '"+this.settings.data_key+"'...");
	var data = {nodes: this.nodes};
	window.localStorage[this.settings.data_key] = JSON.stringify(data);
}

/* Return the topmost node under vector2 'p', or null. */
Pad.prototype.pick = function(p) {
	var picked = null;
	this.nodes.foreach(function(v) {
		if (v.contains(p)) picked = v;
	});
	return picked;
}

/* Remove extraneous properties from all node objects. */
Pad.prototype.clean = function() {
	this.nodes.foreach(function(v){
		object_prune(v, ["x0", "x1", "y0", "y1", "n", "deps", "c"]);
	});
}
