/*  Create a new vector from coordinates 'x' and 'y'. */
function vector2(x, y) {
	this.set(x, y);
}

/* Multiply this vector2 componentwise by factors ('x', 'y'), in place. If y is undefined, y=x. */
vector2.prototype.imul = function(x, y) {
	if (y === undefined) y = x;
	this.x *= x;
	this.y *= y;
}

/* Return a new vector2 that is this vector2's componentwise product with dactors ('x', 'y'). If y is undefined, y=x. */
vector2.prototype.mul = function(x, y) {
	if (y === undefined) y = x;
	return new vector2(this.x*x, this.y*y);
}

/* Return a new vector2 that is this vector2 scaled around vector2 'c' by factor 'f'. If c is undefined, is is assumed to be the origin. */
vector2.prototype.scale = function(f, c) {
	if (c === undefined) return this.mul(f);
	return new vector2(c.x + f*(this.x-c.x), c.y + f*(this.y-c.y));
}

/* Divide this vector2 componentwise by divisors ('x', 'y'), in place. If y is undefined, y=x. */
vector2.prototype.idiv = function(x, y) {
	if (y === undefined) y = x;
	this.x /= x;
	this.y /= y;
}

/* Return a new vector2 that is the componentwise real quotient of this and divisors ('x', 'y'). If y is undefined, y=x. */
vector2.prototype.div = function(x, y) {
	if (y === undefined) y = x;
	return new vector2(this.x/x, this.y/y);
}

/* Return the distance between this vector2 and vector2 'p'. */
vector2.prototype.dist = function(p) {
	var dx = p.x - this.x;
	var dy = p.y - this.y;
	return Math.sqrt(dx*dx+dy*dy);
}

/* Add addends ('x', 'y') componentwise to this vector2, in place. If y is undefined, y=x. */
vector2.prototype.iadd = function(p) {
	this.x += p.x;
	this.y += p.y;
}

/* Return a new vector2 that is the componentwise sum of this vector2 and addends ('x', 'y'). If y is undefined, y=x. */
vector2.prototype.add = function(x, y) {
	if (y === undefined) { y = x.y; x = x.x; }
	return new vector2(this.x + x, this.y + y);
}

/* Subtract subtrahends ('x', 'y') componentwise from this vector2, in place. If y is undefined, y=x. */
vector2.prototype.isub = function(p) {
	this.x -= p.x;
	this.y -= p.y;
}

/* Return a new vector2 that is the componentwise difference of this and subtrahends ('x', 'y'). If y is undefined, y=x. */
vector2.prototype.sub = function(p) {
	return new vector2(this.x - p.x, this.y - p.y);
}

/* Invert this vector2, componentwise. */
vector2.prototype.invert = function() {
	return new vector2(-this.x, -this.y);
}

/* Set the x and y components of this vector to coordinates 'x' and 'y'. If x and y are undefined, x=y=0. If y is undefined, y=x.*/
vector2.prototype.set = function(x, y) {
	if (x === undefined) {
		x = 0;
		y = 0;
	}
	else if (y === undefined) {
		y = x.y;
		x = x.x;
	}
	this.x = x;
	this.y = y;
}

/* Orbit this vector2 around the origin by angle 'theta'. */
vector2.prototype.orbit = function(theta) {
	var c_ = Math.cos(theta);
	var s_ = Math.sin(theta);
	return new vector2(this.x*c_ - this.y*s_, this.x*s_ + this.y*c_);
}
