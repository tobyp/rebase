/*
Create a new rect. Can be called in three forms:
rect(rect) to copy data from an existing rect object,
rect(vector2, vector2) to construct a rect from two opposite corner points,
rect(Number, Number, Number, Number) to construct a rect from left, top, right, and bottom edge values.
*/
function rect(x0, y0, x1, y1) {
	if (y0 === undefined && x1 == undefined && y1 == undefined) {
		y0 = x0.y0;
		x1 = x0.x1;
		y1 = x0.y1;
		x0 = x0.x0;
	}
	else if (x1 == undefined && y1 == undefined) { //two point constructur
		x1 = y0.x;
		y1 = y0.y;
		y0 = x0.y;
		x0 = x0.x;
	}
	this.x0 = Math.min(x0, x1); this.y0 = Math.min(y0, y1);
	this.x1 = Math.max(x0, x1); this.y1 = Math.max(y0, y1);
}

/*  Return the size of this rect. */
rect.prototype.size = function() { return new vector2(this.x1 - this.x0, this.y1 - this.y0); }
/* Return the center vector2 of this rect. */
rect.prototype.center = function() { return new vector2((this.x1 + this.x0) / 2, (this.y1 + this.y0) / 2); }

/* Return the left edge of this rect. */
rect.prototype.left = function() { return new line(Infinity, this.x0); }
/* Return the right edge of this rect. */
rect.prototype.right = function() { return new line(Infinity, this.x1); }
/* Return the top edge of this rect. */
rect.prototype.top = function() { return new line(0, this.y0); }
/* Return the bottom edge of this rect. */
rect.prototype.bottom = function() { return new line(0, this.y1); }

/* Trim a line segment between vector2 'start' and vector2 'end' so that it does not enter inside this rect. If 'start' is inside this rect, return null. Returns The nearest-to-start point on the line segment that intersects one of the edges of this rect, or 'end' if the line segment doesn't intersect this rect. */
rect.prototype.block = function(start, end) {
	if (this.contains(start)) return null;
	var l = line_from_points(start, end);
	var i_b = this.bottom().intersect(l);
	var i_t = this.top().intersect(l);
	var i_l = this.left().intersect(l);
	var i_r = this.right().intersect(l);
	var is = [];
	if (i_b != null && i_b.x >= this.x0 && i_b.x <= this.x1) is.push(i_b);
	if (i_t != null && i_t.x >= this.x0 && i_t.x <= this.x1) is.push(i_t);
	if (i_l != null && i_l.y >= this.y0 && i_l.y <= this.y1) is.push(i_l);
	if (i_r != null && i_r.y >= this.y0 && i_r.y <= this.y1) is.push(i_r);
	var r = Math.min_in_terms(is, function(p) { return p.dist(start); });
	if (r == null) return end;
	else return r;
}

/* Clip a line at the edges of a rect so that it does not leave this rect. Returns a [vector2, vector2] with points on the edges of the rect between which the line runs, or null if the line does not intersect this rect at all. */
rect.prototype.clip = function(l_) {
	var l = l.m * this.x0 + l_.b;
	var r = l.m * this.x1 + l_.b;
	var t = (this.y0 - l_.b) / l_.m;
	var b = (this.y1 - l_.b) / l_.m;
	if (l_.m == Infinity) {
		if (l_.b >= this.x1 || l_.b <= this.x0) return null;
		return [new vector2(l_.b, t), new vector2(l_.b, b)];
	}
	if (l_.m == 0) {
		if (l_.b >= this.y1 ||l_.b <= this.y0) return null;
		return [new vector2(l, l_.b), new vector2(r, l_.b)];
	}
	var p0 = vector2(0, 0);
	var p1 = vector2(0, 0);
	var got = false;
	if (l >= this.y0 && l <= this.y1) {
		p0.x = this.x0; p0.y = l;
		got = true;
	}
	if (t >= this.x0 && t <= this.x1) {
		p0.x = t; p0.y = this.y0;
		got = true;
	}
	if (r >= this.y0 && r <= this.y1) {
		p0.x = this.x1; p0.y = r;
		got = true;
	}
	if (b >= this.x0 && b <= this.x1) {
		p0.x = b; p0.y = this.y1;
		got = true;
	}
	if (got) return [p0, p1];
	else return null;
}

/* Returns the intersection rect of this rect and rect 'r'. Return null if the rects do not intersect. */
rect.prototype.intersection = function(r) {
	var x0 = Math.max(this.x0, r.x0);
	var y0 = Math.max(this.y0, r.y0);
	var x1 = Math.min(this.x1, r.x1);
	var y1 = Math.min(this.y1, r.y1);
	if (x1 <= x0 || y1 <= y0) return null;
	return new rect(x0, y0, x1, y1);
}

/* Returns whether this rect and rect 'r' intersect. */
rect.prototype.intersects = function(r) {
	if (this.x0 > r.x1) return false;
	if (this.x1 < r.x0) return false;
	if (this.y0 > r.y1) return false;
	if (this.y1 < r.y0) return false;
	return true;
}

/* Return the smallest rect containing this rect and rect 'r'. */
rect.prototype.hull = function(r) {
	return new rect(Math.min(this.x0, r.x0), Math.min(this.y0, r.y0), Math.max(this.x1, r.x1), Math.max(this.y1, r.y1));
}

/* Return whether a rect 'r' is enclosed in this rect. */
rect.prototype.encloses = function(r) {
	if (this.x1 <= r.x1) return false;
	if (this.x0 >= r.x0) return false;
	if (this.y1 <= r.y1) return false;
	if (this.y0 >= r.y0) return false;
	return true;
}

/* Return whether this rect contains a vector2 'p'. */
rect.prototype.contains = function(p) {
	return (p.x >= this.x0 && p.x <= this.x1 && p.y >= this.y0 && p.y <= this.y1);
}

/* Return the area of this rect. */
rect.prototype.area = function() {
	var s = this.size();
	return s.x * s.y;
}

/* Move this rect so it centers on vector2 'c'. */
rect.prototype.set_center = function(c) {
	this.iadd(c.sub(this.center()));
}

/* Orbit this rect's center around a vector2 'c' by 'angle' radians. */
rect.prototype.orbit_around = function(c, angle) {
	this.set_center(this.center().sub(c).orbit(angle).add(c));
}

/* Scale this rect's center around vector2 'c' by factor 'f'. (note that this does not change the size/shape of the rect, only its location) */
rect.prototype.scale_around = function(c, factor) {
	this.set_center(this.center().sub(c).scale(factor).add(c));
}

/*
Resize this rect by applying a delta of vector2 'd' to a corner point. This may change 'extent_point' to become another corner point.
Example for extent point change: If you're dragging x1,y1 by -10,-10 on a 5x5 box, the extent point will become x0,y0 on a 5x5 box. further dragging would expand it to the top left.
*/
rect.prototype.resize = function(d, extent_point) {
	this[extent_point[0]] += d.x;
	this[extent_point[1]] += d.y;
	if (this.x0 > this.x1) {
		var t = this.x0; this.x0 = this.x1; this.x1 = t;
		if (d.x != 0) extent_point[0] = d.x < 0 ? 'x0' : 'x1';
	}
	if (this.y0 > this.y1) {
		var t = this.y0; this.y0 = this.y1; this.y1 = t;
		if (d.y != 0) extent_point[1] = d.y < 0 ? 'y0' : 'y1';
	}
}

/* Translate ths rect by a vector2 'p'. */
rect.prototype.iadd = function(p) {
	this.x0 += p.x;
	this.x1 += p.x;
	this.y0 += p.y;
	this.y1 += p.y;
}

/* Return a new rect that is this rect translated by a vector2 'p'. */
rect.prototype.add = function(p) {
	return new rect(this.x0+p.x, this.y0+p.y, this.x1+p.x, this.y1+p.y);
}

// STATIC
/* Return the minimal rect hull of an array of rects 'rs'. */
rect.hull = function(rs) {
	if (rs.length == 0) return null;
	
	var xmin = Infinity, xmax = -Infinity;
	var ymin = Infinity, ymax = -Infinity;
	rs.foreach(function(v) {
		xmin = Math.min(v.x0, xmin); ymin = Math.min(v.y0, ymin);
		xmax = Math.max(v.x1, xmax); ymax = Math.max(v.y1, ymax);
	});
	return new rect(xmin, ymin, xmax, ymax);
}