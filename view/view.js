function View(ctx, settings) {
	this.settings_key = settings;
	this.settings = localStorage[settings]
	if (this.settings === undefined) this.settings = window.default_view_settings;
	else this.settings = JSON.parse(this.settings);
	this.ctx = ctx;
	this.settings.origin.__proto__ = vector2.prototype;
	this.selection = [];
	this.selection_focus = 0;
}

View.prototype.save_settings = function() {
	localStorage[this.settings_key] = JSON.stringify(this.settings);
}

/* Select the nodes in array 'sel'. If 'focus' is true, focus on them as well. */
View.prototype.select = function(sel, focus) {
	var old_focus = this.selection[this.selection_focus];
	this.selection = sel;
	var ofi = this.selection.indexOf(old_focus);
	if (old_focus !== undefined && ofi != -1) this.selection_focus = ofi;
	else this.selection_focus = 0;
	if (focus === true) this.focus();
}

/* Focus on the next node in the current selection, wrapping around if necessary. If 'reverse' is true, focus on the previous node instead. */
View.prototype.focus_advance = function(reverse) {
	this.selection_focus = Math.cycle(this.selection_focus, 0, this.selection.length, reverse);
	this.focus(this.selection[this.selection_focus]);
}

/* Focus on rect 'v'. If v is undefined, focus on the dominant selection item. */
View.prototype.focus = function(v) {
	if (v !== undefined) {
		this.focus_coord(v.center());
	}
	else if (this.selection_focus < this.selection.length) {
		this.focus_coord(this.selection[this.selection_focus].center());
	}
}

/* Pan the view so vector2 'p' is at the center. */
View.prototype.focus_coord = function(p) {
	var cx = this.ctx.width / 2;
	var cy = this.ctx.height / 2;
	this.settings.origin = new vector2(cx - p.x, cy - p.y);
}

View.prototype.focus_name = function(name) {
	var v = this.index[name];
	this.focus(v);
}

/* Convert screenspace coordinates of vector2 'p' to a vector2 of pad coordinates. */
View.prototype.screen_to_pad = function(p) {
	return p.div(this.settings.scaling).sub(this.settings.origin);
}

/* Convert pad coordinates of vector2 'p' to a vector2 of screenspace coordinates. */
View.prototype.pad_to_screen = function(p) {
	return p.add(this.settings.origin).mul(this.settings.scaling);
}

/* Pick the topmost node at vector2 'p' in pad 'pad', or return null if there isn't one. */
View.prototype.pick = function(p, pad) {
	return pad.pick(p);
}

/* Reset this view's origin and scaling to (0,0) and factor 1. */
View.prototype.reset = function() {
	this.settings.scaling = 1.0;
	this.settings.origin.set(0, 0);
}

/* Return a vector2 of this view's center. Does not apply scaling. */
View.prototype.center = function() {
	return new vector2(this.ctx.width/2, this.ctx.height/2);
}

/* Return a vector2 of the dimensions of this view. Does not apply scaling (scaling > 1.0 means the actual pad-space dimensions are smaller, because they're stretched to fit.)*/
View.prototype.size = function() {
	return new vector2(this.ctx.width, this.ctx.height);
}

/* Apply scaling factor 'f' to the view. */
View.prototype.scale = function(f) {
	this.settings.scaling *= f;
}

/* Translate the view by vector2 'd' */
View.prototype.translate = function(d) {
	this.settings.origin.iadd(d);
}

/* Draw the Pad 'pad' with this view. */
View.prototype.draw = function(pad) {
	this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
	this.ctx.save();
	this.ctx.scale(this.settings.scaling, this.settings.scaling);
	this.ctx.translate(this.settings.origin.x, this.settings.origin.y);
	this.ctx.font = "" + this.settings.font.size + "px " + this.settings.font.family;
	this.ctx.textBaseline="middle";
	this.ctx.textAlign="center";

	var draw_arrow_box_to_box = this.settings.arrow_bezier ? draw_arrow_box_to_box_bezier : draw_arrow_box_to_box_straight;
	var self = this;
	pad.nodes.foreach(function(v) {
		object_foreach(v.deps, function(d, dcol) {
			if (pad.index.hasOwnProperty(d) && self.settings.arrow_mask.contains(dcol)) {
				draw_arrow_box_to_box(self.ctx, dcol, pad.index[d], v, self.settings.arrow_direction, !(self.settings.arrow_direction), self.settings);
			}
		});
		draw_box(self.ctx, v.n, self.settings.palette[v.c][1], self.settings.palette[v.c][0], self.settings.palette[v.c][1], v.x0, v.y0, v.x1, v.y1);
		
		if (self.selection.contains(v)) {
			draw_rect(self.ctx, self.settings.selection_color, v.x0-1, v.y0-1, v.x1+1, v.y1+1);
		}
	});
	this.ctx.restore();
	this.ctx.fillStyle = "#ddd";
	this.ctx.fillRect(0, this.ctx.height - 14, this.ctx.width, 14);
	this.ctx.fillStyle = "#111";
}