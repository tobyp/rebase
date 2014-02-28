/*
Keyop library. These can be bound to keycodes.
A keyop has a unique name (the key in this object), desc (description), and a function.
The keyop function will be called by the keyboard handker if specific key conditions are met (as defined by the keyspec in the keybinding).
The keyboard handler will pass in the controller object, and the keyop data object, which may contain data as defined by the keyops description or dodcumentation.
*/
var keyops = {
	"add": {"desc": "Add a new node (requires entering a name)", "f": function(c) {
		var name = prompt("Name?");
		if (name != null) {
			var e = {
				"x0": c.pos.x,
				"y0": c.pos.y,
				"x1": c.pos.x+c.pad.settings.box_width,
				"y1": c.pos.y+c.pad.settings.box_height,
				"deps": {},
				"c": 0,
				"n": name,
			}
			c.pad.add(e);
		}
	}},
	"align": {"desc": "Align selected nodes horizontally. set the scooch property to true to make the nodes align along the y of the node under the cursor, or the horizontal-center of the selection (if there is no node under the cursor), with consistent margins between. set the alpha property to true to sort them alphabetically.", "f": function(c, d) {
		function alphasort(osel) {
			osel.sort(function (a, b) {
				var an = a.n.split("/").last();
				var bn = b.n.split("/").last();
				if (an < bn) return -1;
				if (an > bn) return 1;
				return 0;
			});
		}
		if (c.view.selection.length > 0) {
			ops.halign(c.view.selection, c.pick(), d.scooch, d.alpha ? alphasort : null, c.settings.align_margin_vertical);
		}
	}},
	"arrow_toggle": {"desc": "Toggle the visibility of a type or arrow. Specify the type of arrow to toggle as the arrow property.", "f": function(c, d) {
		c.view.settings.arrow_mask.toggle(d.arrow);
	}},
	"bring": {"desc": "Move nodes so the cursor is at their center", "f": function(c) {
		ops.center_nodes(c.view.selection, c.pos);
		console.log("Centered");
	}},
	"center": {"desc": "Move nodes so they center on the pad's origin (x=0,y=0)", "f": function(c) {
		ops.center_nodes(c.view.selection, new vector2(0, 0));
		console.log("Centered");
	}},
	"cycle_color": {"desc": "Cycle the color of the selected nodes. specify a reverse property to cycle in the other direction.", "f": function(c, d) {
		ops.cycle_colors(c.view.selection, c.view.settings.palette, d.reverse);
	}},
	"cycle_arrow": {"desc": "Cycle the color of any arrows between the selected nodes and the node under the cursor, or all nodes if there is no node under the cursor.", f: function(c, d) {
		var p = c.pick();
		var t = [];
		if (p != null) {
			t = [p.n];
		}
		else {
			t = Object.keys(c.pad.index);
		}
		ops.cycle_arrows(c.view.selection, t, c.view.settings.arrow_palette, d.reverse);
	}},
	"debug": {"desc": "Toggle the debug toolbar.", "f": function() {
		window.debug = !window.debug;
	}},
	"delete": {"desc": "Delete the node under the cursor.", "f": function(c) {
		var p = c.pick();
		c.pad.remove(p);
	}},
	"delete_selection": {"desc": "Delete all selected nodes.", "f": function(c) {
		c.view.selection.foreach(function(v){
			c.pad.remove(v);
		});
	}},
	"detect_cycles": {"desc": "Detect dependency cycles in the selection, and output them to the console.", "f": function(c) {
		var cycles = ops.detect_cycles(c.pad, c.view.selection);
		console.log("Cycles: "+cycles.map(function(x){return x.join("->");}).join(";\n"));
	}},
	"discard_dep": {"desc": "Make any selected element NOT depend on the node under the cursor", "f": function(c) {
		var p = c.pick();
		if (p != null) {
			c.view.selection.foreach(function(s){
				p.discard_dep(s.n);
			});
		}
	}},
	"drop": {"desc": "Drop selected nodes to be shown below all others", "f": function(c) {
		ops.drop_nodes(c.pad, c.view.selection);
	}},
	"invert": {"desc": "Invert the selection", "f": function(c) {
		if (c.ctrl) c.view.select([]);
		else c.view.select(c.pad.nodes.slice().subtract(c.view.selection));
	}},
	"jump": {"desc": "Focus (center view on) the next node in the selection", "f": function(c) {
		c.view.focus_advance();
	}},
	"mirror": {"desc": "Mirror selected nodes. set mouse to true to mirror around the cursor instead of the center of the selection, set x to true to mirror around x, set y to true to mirror around y.", "f": function(c, d) {
		ops.mirror(c.view.selection, d.mouse ? c.pos : undefined, d.x, d.y)
	}},
	"pan": {"desc": "Pan the view. Set the x and y properties.", "f": function(c, d) {
		ops.pan(c.view, new vector2(d.x, d.y).mul(c.settings.pan_factor*c.view.ctx.width, c.settings.pan_factor*c.view.ctx.height));
	}},
	"propagate_dependencies": {"desc": "Inclue any dependencies of any selected node in the selection. set the expand property to true to expand the original selection, leave it out/set it to false to replace it.", "f": function(c, d) {
		c.view.select(ops.propagate_dependencies(c.pad, c.view.selection, d.expand));
	}},
	"propagate_dependees": {"desc": "Include any nodes depending on any selected node in the selection. set the expand property to true to expand the original selection, leave it out/set it to false to replace it.", "f": function(c, d) {
		c.view.select(ops.propagate_dependees(c.pad, c.view.selection, d.expand));
	}},
	"put_dep": {"desc": "Make any selected element depend on the node under the cursor", "f": function(c) {
		var p = c.pick();
		if (p != null) {
			c.view.selection.foreach(function(s){
				p.put_dep(s.n);
			});
		}
	}},
	"raise": {"desc": "Raise selected nodes to be shown above all others", "f": function(c) {
		ops.raise_nodes(c.pad, c.view.selection);
	}},
	"reload": {"desc": "Reload the pad from local storage.", "f": function(c) {
		c.pad.load();
	}},
	"rename": {"desc": "Rename the node under the cursor.", "f": function(c) {
		var p = c.pick();
		if (p != null) {
			var name = prompt("Name", p.n);
			if (name != null) {
				c.pad.rename(p, name);
			}
		}
	}},
	"reset_view": {"desc": "Reset the view by centering it.", "f": function(c, d) {
		c.view.reset();
	}},
	"starburst": {"desc": "Arrange dependencies recursively around the node under the cursor in a starburst formation", "f": function(c) {
		var p = c.pick();
		if (p != null) {
			ops.starburst(c.pad, c.view.selection, p);
		}
	}},
	"save": {"desc": "Save the pad to local stroage.", "f": function(c) {
		c.pad.save();
	}},
	"search": {"desc": "Search for a node.", "f": function(c) {
		var n = prompt("Search term", "");
		if (n != null) {
			selection = ops.search(c.pad, n);
			console.log("Found "+selection.length+" nodes matching '"+n+"'.");
			c.view.select(selection);
		}
	}},
	"toggle_dep": {"desc": "Toggle any selected element depending on the node under the cursor.", "f": function(c) {
		var p = c.pick();
		if (p != null) {
			c.view.selection.foreach(function(s){
				p.toggle_dep(s.n);
			});
		}
	}},
	"translate": {"desc": "Move nodes to a degree. Data must contain x and y properties.", "f": function(c, d) {
		ops.translate_nodes(c.view.selection, new vector2(d.x, d.y).mul(c.settings.move_delta));
	}},
	"zoom": {"desc": "", "f": function(c, d) {
		c.view.scale(d.zoom_in ? c.settings.scale_factor : 1.0/c.settings.scale_factor);
	}},
}