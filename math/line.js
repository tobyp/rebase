/* Generate a line that goes through vector2 'start' and vector2 'end'. If start and end are identical, the line will be vertical through both vector2's. */
function line_from_points(start, end) {
	var m = (end.y - start.y) / (end.x - start.x);
	if (m == Infinity) {
		return new line(m, start.x);
	}
	else {
		return new line(m, start.y - m * start.x)
	}
}

/* Create a line from slope 'm' and y-intercept 't'. If m is Infinity, the line is vertical and b is defined to be the x-intercept. */
function line(m, b) {
	this.m = m;
	this.b = b;
}

/* Calculate the vector2 at which the this line and the line 'l' intersect. If this line and 'l' are parallel, returns null. */
line.prototype.intersect = function(l) {
	if (this.m == l.m) return null;
	if (this.m == Infinity) {
		return new vector2(this.b, l.m * this.b + l.b);
	}
	else if (l.m == Infinity) {
		return new vector2(l.b, this.m * l.b + this.b);
	}
	var x = (this.b - l.b)/(l.m - this.m);
	return new vector2(x, x * this.m + this.b);
}
