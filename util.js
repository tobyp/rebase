/* @brief Call function 'f' with specified context 'context' for every value in this array. 'f' is passed the value and the element index.*/
Array.prototype.foreach = function(f, context) {
	var l = this.length;
	for (var i=0;i<l;i++) { f.call(context, this[i], i); }
};

/* @brief Call function 'f' with specified context 'context' for every value in this array, in reverse order. 'f' is passed the value and the element index.*/
Array.prototype.foreach_reversed = function(f, context) {
	for (var i=this.length-1;i>=0;i--) { f.call(context, this[i], i); }
};

/* @brief Append each values of array 'a' to this array. */
Array.prototype.extend = function(a) {
	a.foreach(function(i) { a.push(i); });
};

/* @brief Discard all values from this that are not in array 'a'. */
Array.prototype.intersect = function(a) {
	var o = this.slice(0);
	this.splice(0, this.length);
	var self = this;
	o.foreach(function(v){
		if (a.indexOf(v) != -1) {
			self.push(v);
		}
	});
};

/* @brief Add all values from array 'a' to this array, unless this array already contains them. */
Array.prototype.union = function(a) {
	var self = this;
	a.foreach(function(i) { if (self.indexOf(i) == -1) self.push(i); });
};

/* @brief Remove all values contained in the array 'a' from this array, if this array contains them. */
Array.prototype.subtract = function(a) {
	var self = this;
	a.foreach(function(i) { var i_ = self.indexOf(i); if (i_ != -1) self.splice(i_, 1); });
	return this;
};

/* @brief Remove value 'e' from this array, if this array contains it. */
Array.prototype.discard = function(e) {
	var i = this.indexOf(e);
	if (i != -1) this.splice(i, 1);
}

/* @brief Put value 'e' into this array, if this array does not already contain it. */
Array.prototype.put = function(e) {
	var i = this.indexOf(e);
	if (i == -1) this.push(e);
}

/* @brief Remove value 'e' from this array, if this array contains it. */
Array.prototype.toggle = function(e) {
	var i = this.indexOf(e);
	if (i == -1) this.push(e);
	else this.splice(i, 1);
}

/* @brief Get the element in this array after element 'e' (or before, if 'reverse' is true). Wrap around if necessary. */
Array.prototype.cycle = function(e, reverse) {
	var i = this.indexOf(e);
	if (i == -1) return e;
	i += reverse === true ? -1 : 1;
	if (i == this.length) i = 0;
	if (i == -1) i = this.length - 1;
	return this[i];
}

/* @brief Replace the first occurrence of value 'e' in this array with value 'n'. */
Array.prototype.replace = function(o, n) {
	var i = this.indexOf(o);
	if (i != -1) this[i] = n;
}

/* @brief Set element 'i' of this array to value 'd', if it isn't already set to something else. */
Array.prototype.setdefault = function(i, d) {
	if (this[i] === undefined) {
		this[i] = d;
	}
	return this[i];
}

/* @brief Test whether this array contains the value 'v'. */
Array.prototype.contains = function(v) {
	return this.indexOf(v) != -1;
}

/* @brief Get the last element of this array */
Array.prototype.last = function() {
	return this[this.length - 1];
}

/* @brief Execute a function 'f' for each property of object 'o'. 'f' is passed the name of the property, and its value. */
function object_foreach(o, f, context) {
	for (var k in o) {
		if (o.hasOwnProperty(k)) { f.call(context, k, o[k]); }
	}
	return o;
}

/* @brief Get the property value with name 'k' from object 'o', or return a default value 'd' if no such property exists. */
function object_get(o, k, d) {
	if (o.hasOwnProperty(k)) {
		return o[k];
	}
	return d;
}

/* @brief Prune the object 'o' so it only contains properties with names that are also in the array 'ks'. */
function object_prune(o, ks) {
	var k = Object.keys(o);
	k.foreach(function(k_){
		if (!ks.contains(k_)) delete o[k_];
	});
	return o;
}

/* @brief Remove a the property with name 'k' from the object 'o', if it exists. */
function object_discard(o, k) {
	var r = o[k];
	if (o.hasOwnProperty(k)) {
		delete o[k];
	}
	return r;
}

/* @brief Get the property value with name 'l' from object 'o', or set it to default value 'd' if it doesn't exist and return that. */
function object_setdefault(o, k, d) {
	if (!o.hasOwnProperty(k)) o[k] = d;
	return o[k];
}

/* @brief Get the first (in arbitrary order) name associated with property value 'v' in object 'o', or the default value 'd' if no such property is found */
function object_reverse_get(o, v, d) {
	for (var k in o) {
		if (o.hasOwnProperty(k) && o[k] == v) return k;
	}
	return d;
}

/* @brief Calculate the average of all arguments. */
Math.avg = function() {
	x = 0;
	c = 0;
	arguments.forEach(function(y) { x += y; c += 1; });
	return x / c;
}

/* @brief Clamp a number 'x' between numbers 'min_' and 'max_'. */
Math.clamp = function(x, min_, max_) {
	return Math.min(Math.max(x, min_), max_);
};

/* @brief Find the minimal value in array 'coll', sorting by the value returned for each element by function 'f'. 'f' is passed the value of the element. */
Math.min_in_terms = function(coll, f) {
	var it = null;
	var it_v = null;
	coll.foreach(function(i) {
		var i_v = f(i);
		if (it == null || i_v < it_v) {
			it = i; it_v = i_v;
		}
	});
	return it;
};

/* @brief Cycle the number 'v' through the rane ['start','end'[, optionally in reverse (if 'reverse' is true). */
Math.cycle = function(v, start, end, reverse) {
	var x = v + (reverse === true ? -1 : 1);
	return start + Math.mod(x - start, end - start);
}

/* @brief Return the remainder when dividing number 'x' by number 'm', such that 0<remainder<m and there exists a whole number k such that k*m + r = x. */
Math.mod = function(x, m) {
	return ((x % m) + m) % m;
}

/* @brief Clamp an angle in radians 'x' between 0 and 2*PI by wrapping it around. (A lot like modulo.) */
Math.angle_clamp = function(x) {
	while (x < 0) x += 2*Math.PI;
	while (x > 2*Math.PI) x -= 2*Math.PI;
	return x;
}
