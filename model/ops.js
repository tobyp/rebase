ops = {};
window._$ = window.ops;

ops.remove_dependencies = function(from, color) {
	var count = 0;
	from.foreach(function(v){
		var to_remove = [];
		object_foreach(v.deps, function(k, v_) {
			if (v_ == color) to_remove.push(k);
		})
		count += to_remove.length;
		to_remove.foreach(function(k){
			delete v.deps[k];
		});
	});
	return count;
}

ops.remove_dependees = function(to, color) {
	var count = 0;
	pad.nodes.foreach(function(v){
		to.foreach(function(k) {
			if (v.deps[k.n] == color) {
				delete v.deps[k.n];
				count++;
			}
		})
	});
	return count;
}

ops.detect_cycles = function(pad, candidates) {
	var cycles = [];
	seek_cycle = function (v, path) {
		if (path.contains(v.n)) {
			path.push(v.n);
			cycles.put(path.slice());
			path.pop();
			return;
		}
		path.push(v.n);
		object_foreach(v.deps, function(d_) {
			var d = pad.index[d_];
			if (d !== undefined) {
				seek_cycle(d, path);
			}
		});
		path.pop();
	}
	candidates.foreach(function(v){
		seek_cycle(v, []);
	});
	return cycles;
}

ops.center_nodes = function(candidates, center) {
	if (center === undefined) center = new vector2(0, 0);
	var old = rect.hull(candidates).center();
	var delta = center.sub(old);
	candidates.foreach(function(v) {
		v.iadd(delta);
	});
}

ops.cycle_colors = function(candidates, palette, reverse) {
	candidates.foreach(function(i) {
		i.c = Math.cycle(i.c, 0, palette.length, reverse);
	});
}

ops.cycle_arrows = function(from, to, palette, reverse) {
	from.foreach(function(v){
		object_foreach(v.deps, function(k, v_){
			if (to.contains(k)) {
				v.deps[k] = Math.cycle(v_, 0, palette.length, reverse);
			}
		});
	});
}

ops.starburst = function(pad, candidates, parent) {
	console.log("starbursting...");
	var seen = [];
	var self = this;
	var delve = function(n) {
		if (!seen.contains(n.node)) {
			seen.push(n.node);
			object_foreach(n.node.deps, function(k) {
				var n_ = pad.index[k];
				if (n_ !== undefined && candidates.contains(n_)) {
					var d = {node: n_, ch: [], theta: 0, width: 0};
					n.ch.push(delve(d));
				}
			});
		}
		return n;
	}
	var center = delve({node: parent, ch: [], theta: 0, width: 0});
	var depth = function(n) { //get the depth of this subtree, at least 1 for this node
		var d = 1;
		n.ch.foreach(function(v){d = Math.max(d, 1+depth(v))});
		return d;
	}
	var center_depth = depth(center);
	var widths = function(n) {
		if (n.ch.length == 0) n.width = 1;
		else {
			n.width = 0;
			n.ch.foreach(function(v){widths(v); n.width += v.width;});
		}
		return n.width;
	}
	var theta_per = 2*Math.PI/widths(center);
	var thetas = function(n, start) {
		n.theta = start + (theta_per*n.width/2); //cuncomment second term to make it swirly
		n.ch.foreach(function(v){thetas(v, start); start += theta_per*v.width;});
	}
	thetas(center, 0);
	var origin = parent.center();
	var depth_per = 100;
	var translate = function(n, layer) {
		var n_center = new vector2(origin);
		n_center.x += layer*depth_per*Math.sin(n.theta);
		n_center.y += layer*depth_per*Math.cos(n.theta);
		n.node.set_center(n_center);
		n.ch.foreach(function(v){translate(v, layer+1);});
	}
	translate(center, 0);
}

ops.halign = function(candidates, target, scootch, sortfn, align_margin_vertical) {
	if (candidates.length > 0) {
		var c = null;
		var avg_w = 0;
		if (target != null) {
			c = target.center();
			avg_w = target.size().x;
		}
		else {
			c = new vector2();
			candidates.foreach(function(e) {
				c.iadd(e.center());
				avg_w += e.size().x;
			});
			c.idiv(candidates.length);
			avg_w /= candidates.length;
		}

		var ystart = 0;
		var sum_h = 0;
		if (scootch) {
			candidates.foreach(function(e) {
				sum_h += e.size().y;
			})
			ystart = c.y - (sum_h + (candidates.length - 1)*align_margin_vertical) / 2;
		}

		var osel = candidates.slice(0);
		if (sortfn == null) sortfn = function(to_sort) {
			to_sort.sort(function (a, b) {
				return a.y0 - b.y0;
			});
		}
		sortfn(osel);

		osel.foreach(function(e) {
			var nc = e.center(); nc.x = c.x;
			e.set_center(nc);
			if (scootch) {
				var h = e.size().y;
				e.y0 = ystart;
				e.y1 = h + ystart;
				ystart += h + align_margin_vertical;
			}
		});
	}
}

ops.mirror = function(candidates, center, x, y) {
	if (center === undefined) center = rect.hull(candidates).center();
	candidates.foreach(function(v){
		v.iadd(v.center().sub(center).mul(x ? 0 : -2, y ? 0 : -2));
	});
}

ops.propagate_dependencies = function(pad, candidates, include_candidates) {
	sels = [];
	candidates.foreach(function(v){
		object_foreach(v.deps, function(d_, v) {
			var d = pad.index[d_];
			if (d !== undefined) {
				sels.put(d);
			}
		});
	});
	if (include_candidates) sels.union(candidates);
	return sels;
}

ops.propagate_dependees = function(pad, candidates, include_candidates) {
	sels = [];
	pad.nodes.foreach(function(v){
		candidates.foreach(function(v_){
			if (v.deps.hasOwnProperty(v_.n)) {
				sels.put(v);
			}
		});
	});
	if (include_candidates) sels.union(candidates);
	return sels;
}

ops.pan = function(view, delta) {
	view.settings.origin.isub(delta);
}

ops.translate_nodes = function(candidates, delta) {
	candidates.foreach(function(v){v.iadd(delta);});
}

ops.orbit_nodes = function(candidates, anchor, theta) {
	candidates.foreach(function(v){
		v.orbit_around(anchor, theta);
	});
}

ops.scale_nodes = function(candidates, anchor, factor) {
	candidates.foreach(function(v){
		v.scale_around(anchor, factor);
	});
}

ops.raise_nodes = function(pad, targets) {
	targets.foreach(function(v) {
		var i = pad.nodes.indexOf(v);
		pad.nodes.splice(i, 1);
		pad.nodes.push(v);
	});
}

ops.drop_nodes = function(pad, targets) {
	targets.foreach(function(v) {
		var i = pad.nodes.indexOf(v);
		pad.nodes.splice(i, 1);
		pad.nodes.splice(0, 0, v);
	});
}

ops.search = function(pad, term) {
	results = [];
	pad.nodes.foreach(function(v) {
		if (v.n.indexOf(term) != -1) {
			results.push(v);
		}
	});
	return results;
}