function Controller(view, pad, mouse, keyboard, settings) {
	this.settings_key = settings;
	this.settings = localStorage[settings];
	if (this.settings === undefined) this.settings = window.default_controller_settings;
	else this.settings = JSON.parse(this.settings);
	this.view = view;
	this.pad = pad;
	this.pos = new vector2(0, 0);
	this.delta = new vector2(0, 0);

	this.mouse = mouse;
	this.keyboard = keyboard;

	this.left = false;
	this.right = false;
	this.middle = false;

	this.ctrl = false;
	this.alt = false;
	this.shift = false;
	this.meta = false;
	this.down = [];
}

Controller.prototype.save_settings = function() {
	localStorage[this.settings_key] = JSON.stringify(this.settings);
}

Controller.prototype.mouse_enter = function(e) {
	e.preventDefault();
	this.delta = new vector2(0, 0);
	this.pos = this.view.screen_to_pad(new vector2(e.clientX, e.clientY));
}
Controller.prototype.mouse_down = function(e) {
	e.preventDefault();
	switch (e.button) {
		case 0: this.left = true; break;
		case 1: this.middle = true; break;
		case 2: this.right = true; break;
	}
	this.ctrl = e.ctrlKey; this.alt = e.altKey; this.shift = e.shiftKey; this.meta = e.metaKey;
	this.mouse.down(this, e.button)
}
Controller.prototype.mouse_move = function(e) {
	e.preventDefault();
	var new_pos = this.view.screen_to_pad(new vector2(e.clientX, e.clientY));
	this.delta = new_pos.sub(this.pos);
	this.pos = new_pos;
	this.mouse.move(this, this.delta);
}
Controller.prototype.mouse_up = function(e) {
	e.preventDefault();
	switch (e.button) {
		case 0: this.left = false; break;
		case 1: this.middle = false; break;
		case 2: this.right = false; break;
	}
	this.mouse.up(this, e.button);
}
Controller.prototype.mouse_leave = function(e) {
	e.preventDefault();
	this.mouse.up(this, e.button);
}
Controller.prototype.mouse_wheel = function(e, delta) {
	e.preventDefault();
	this.mouse.wheel(this, delta);
}
Controller.prototype.key_down = function(e) {
	e.preventDefault();
	this.down.put(e.which);
	switch (e.which) {
		case 16: this.shift = true; break;
		case 17: this.ctrl = true; break;
		case 18: this.alt = true; break;
		case 91: this.meta = true; break;
	}
	this.keyboard.down(this, e.which);
}
Controller.prototype.key_up = function(e) {
	e.preventDefault();
	this.down.discard(e.which);
	switch (e.which) {
		case 16: this.shift = false; break;
		case 17: this.ctrl = false; break;
		case 18: this.alt = false; break;
		case 91: this.meta = false; break;
	}
	this.keyboard.up(this, e.which);
}
Controller.prototype.draw = function(ctx) {
	ctx.save();
	ctx.scale(this.view.settings.scaling, this.view.settings.scaling);
	ctx.translate(this.view.settings.origin.x, this.view.settings.origin.y);
	this.mouse.draw(this, ctx);
	this.keyboard.draw(this, ctx);
	ctx.restore();
}
Controller.prototype.scale = function(f) {
	var p = this.view.screen_to_pad(this.pos);
	this.view.scale(f);
	this.pos = this.view.pad_to_screen(p);
}
Controller.prototype.translate = function(d) {
	var p = this.view.pad_to_screen(this.pos);
	this.view.translate(d);
	this.pos = this.view.screen_to_pad(p);
}
Controller.prototype.pick = function() {
	return this.view.pick(this.pos, this.pad);
}
Controller.prototype.install = function() {
	var self = this;
	$(window).mouseenter(function(e){
		self.mouse_enter(e);
	}).mousedown(function(e){
		self.mouse_down(e);
	}).mousemove(function(e){
		self.mouse_move(e);
	}).mouseup(function(e){
		self.mouse_up(e);
	}).mouseleave(function(e){
		self.mouse_leave(e);
	}).mousewheel(function(e, delta){
		self.mouse_wheel(e, delta);
	}).keydown(function(e) {
		self.key_down(e);
	}).keyup(function(e) {
		self.key_up(e);
	});
}

/* Pan mouse handler, that allows shifting the view window into the pad. */
var mouse_pan = {
	/* Called with Controller 'c' when the mouse handler is entered/activated. */
	enter: function(c) { },
	/* Called with Controller 'c' when mouse button 'b' is pressed while in this handler. */
	down: function(c, b) { },
	/* Called with Controller 'c' when the mouse cursor is moved by vector2 'b' while in this handler. */
	move: function(c, d) {
		c.translate(d);
	},
	/* Called with Controller 'c' when mouse button 'b' is released while in this handler. */
	up: function(c, b) { },
	/* Called with Controller 'c' when the mouse wheel is scrolled by delta 'delta' while in this handler. */
	wheel: function(c, delta) { },
	/* Called with Controller 'c' when the mouse handler is left/deactivated. */
	leave: function(c) { },
	/* Allows the current handler to draw something. Called with Controller 'c' and context 'ctx' */
	draw: function(c, ctx) {}
}

/* Drag mouse handler, that allows moving nodes by dragging. If the node under the cursor is part of the view's selection, all elements of the selection are moved. */
var mouse_drag = {
	moving: null,
	enter: function(c) {
		this.moving = c.pick();
		if (this.moving != null) {
			if (c.view.selection.contains(this.moving) && !c.alt) {
				this.moving = c.view.selection;
			}
			else {
				this.moving = [this.moving];
			}
		}
		else {
			this.moving = [];
		}
	},
	down: function(c, b) { },
	move: function(c, d) {
		this.moving.foreach(function (v) {
			v.iadd(d);
		});
	},
	up: function(c, b) { },
	wheel: function(c, delta) { },
	leave: function(c) { },
	draw: function(c, ctx) {}
}

/* Box select mouse handler, that allows selecting nodes in a rectangular area by dragging. */
var mouse_select = {
	rect: null,
	extent_point: null,
	enter: function(c) {
		this.rect = new rect(c.pos, c.pos);
		this.extent_point = ['x1', 'y1'];
	},
	down: function(c, b) {},
	move: function(c, d) {
		this.rect.resize(d, this.extent_point);
	},
	up: function(c, b) {
		var sels = [];
		var self = this;
		var box_sz = this.rect.size();
		var enclosed = false;
		var minisel = box_sz.x <= 1 && box_sz.y <= 1;
		c.pad.nodes.foreach_reversed(function(v) {
			if (!enclosed && self.rect.intersects(v)) {
				sels.push(v);
				if (v.encloses(self.rect)) {
					enclosed = true;
				}
			}
		});
		if (c.alt) {
			c.view.selection.intersect(sels);
		}
		else if (c.ctrl && !c.shift) {
			c.view.selection.union(sels);
		}
		else if (c.shift && !c.ctrl) {
			c.view.selection.subtract(sels);
		}
		else if (c.shift && c.ctrl) {
			c.view.selection.intersect(sels);
		}
		else {
			c.view.selection = sels;
		}
	},
	wheel: function(c, delta) { },
	leave: function(c) { },
	draw: function(c, ctx) {
		ctx.strokeStyle = c.settings.selection_box.border_color;
		ctx.fillStyle = c.settings.selection_box.fill_color;
		ctx.globalAlpha = c.settings.selection_box.fill_alpha;
		ctx.fillRect(this.rect.x0, this.rect.y0, this.rect.size().x, this.rect.size().y)
		ctx.globalAlpha = 1.0;
		ctx.strokeRect(this.rect.x0, this.rect.y0, this.rect.size().x, this.rect.size().y)
	}
}

/* Dependency mouse handler, that allows adding/removing (actually: toggling) dependencies from the node under the cursor in the beginning of a drag operation, to the node under the cursor at the end of the drag operation. */
var mouse_dep = {
	src: null,
	enter: function(c) {
		this.src = c.pick();
	},
	down: function(c, b) {},
	move: function(c, d) {},
	up: function(c, b) {
		var p = c.pick();
		if (this.src != null && p != null && p != this.src) {
			this.src.toggle_dep(p.n);
		}
	},
	wheel: function(c, delta) { },
	leave: function(c) { },
	draw: function(c, ctx) {
		if (this.src != null) draw_line(ctx, c.settings.arrow_color, this.src.center(), c.pos);
	}
}

/* Resize mouse handler, that allows resizing the node currently under the cursor. */
var mouse_resize = {
	resizing: null,
	extent_point: null,
	moved: false,
	enter: function(c) {
		this.extent_point = ['x1', 'y1'];
		this.resizing = c.pick();
		this.moved = false;
	},
	down: function(c, b) {},
	move: function(c, d) {
		this.moved = true;
		if (this.resizing != null) {
			this.resizing.resize(d, this.extent_point);
		}
	},
	up: function(c, b) {
		if (!this.moved && this.resizing != null) {
			var cx = (this.resizing.x0 + this.resizing.x1) / 2;
			var cy = (this.resizing.y0 + this.resizing.y1) / 2;
			this.resizing.x0 = cx - c.pad.settings.box_width / 2;
			this.resizing.x1 = cx + c.pad.settings.box_width / 2;
			this.resizing.y0 = cy - c.pad.settings.box_height / 2;
			this.resizing.y1 = cy + c.pad.settings.box_height / 2;
		}
	},
	wheel: function(c, delta) { },
	leave: function(c) { },
	draw: function(c, ctx) { },
}

/*
Default mouse handler, that enters, delegates to, and leaves the other handlers.
Ctrl+Left Mouse Button: Toggle Dependency
Shift+Left Mouse Button: Resize
Left Mouse Button: Move
Middle Mouse Button: Pan
Right Mouse Button: Box Select
Shift+Mouse Wheel: Orbit
Mouse Wheel: Zoom/Scale
*/
var mouse_default = {
	delegee: null,
	delegee_key: null,
	enter_mh: function(mh, c) {
		if (this.delegee == null) {
			this.delegee = mh;
			this.delegee.enter(c);
		}
	},
	leave_mh: function(c) {
		if (this.delegee != null) {
			this.delegee.leave(c);
			this.delegee = null;
		}
	},
	enter: function(c) { },
	down: function(c, b) {
		if (this.delegee == null) {
			if (b == 0) {
				if (c.ctrl) {
					this.enter_mh(mouse_dep, c);
				}
				else if (c.shift) {
					this.enter_mh(mouse_resize, c);
				}
				else {
					this.enter_mh(mouse_drag, c);
				}
				this.delegee_key = b;
			}
			else if (b == 1) {
				this.enter_mh(mouse_pan, c);
				this.delegee_key = b;
			}
			else if (b == 2) {
				this.enter_mh(mouse_select, c);
				this.delegee_key = b;
			}
		}
		if (this.delegee != null) {
			this.delegee.down(c, b);
		}
	},
	move: function(c, d) { 
		if (this.delegee != null) {
			this.delegee.move(c, d);
		}
	},
	up: function(c, b) { 
		if (this.delegee != null) {
			this.delegee.up(c, b);
			if (b == this.delegee_key) {
				this.leave_mh(c);
			}
		}
	},
	wheel: function(c, delta) {
		if (this.delegee != null) {
			this.delegee.wheel(c, delta);
		}
		else {
			if (c.alt) ops.scale_nodes(c.view.selection, c.pos, delta < 0 ? 1.0/c.settings.scale_factor : c.settings.scale_factor);
			else if (c.shift) ops.orbit_nodes(c.view.selection, c.pos, delta < 0 ? -c.settings.rotation_angle : c.settings.rotation_angle);
			else c.view.scale(delta < 0 ? 1.0/c.settings.scale_factor : c.settings.scale_factor);
		}
	},
	leave: function(c) { 
		this.leave_mh(c);
	},
	draw: function(c, ctx) {
		if (this.delegee != null) {
			this.delegee.draw(c, ctx);
		}
	}
}

/* Default Keyboard handler. Binds keyops to key combinations and runs them when those are released. */
var keyboard_default = {
	keyops: { }, //{key: {mask: {"op":, "data0":, "data1":, ...}}}
	add: function(f, k, mask) {
		if (mask === undefined) mask = 0xFF;
		if ((mask & 0x88) == 0) mask |= 0x88;
		if ((mask & 0x44) == 0) mask |= 0x44;
		if ((mask & 0x22) == 0) mask |= 0x22;
		if ((mask & 0x11) == 0) mask |= 0x11;
		object_setdefault(this.keyops, k, {})[mask] = f;
	},
	init: function(m) {
		var self = this;
		object_foreach(m, function(k, v){
			ks = parse_keyspec(k);
			if (ks != null) {
				self.add(v, ks[0], ks[1]);
			}
			console.log("mapped "+v.op+" to "+unparse_keyspec(ks));
		});
	},
	up: function(c, k) {
		var on_msk = (c.ctrl ? 0x8 : 0)|(c.meta ? 0x4 : 0)|(c.alt ? 0x2 : 0)|(c.shift ? 0x1 : 0);
		var off_msk = (~on_msk&0xf);
		if (this.keyops.hasOwnProperty(k)) {
			object_foreach(this.keyops[k], function(m, v){
				m = parseInt(m);
				on_alw = (m & 0xF0) >>> 4;
				off_alw = (m & 0xF);
				
				if (!((~on_alw & on_msk)&0xF || (~off_alw & off_msk)&0xF)) {
					var opc = keyops[v.op];
					if (opc === undefined) {
						console.log("Undefined operation '"+v.op+"'");
						return
					}
					console.log("Running '"+v.op+"' with '"+JSON.stringify(v)+"'...");
					opc.f(c, v);
				}
			});
		}
	},
	down: function(c, k) { },
	draw: function(ctx) { }
}

CTRL_ON = 0x80
CTRL_OFF = 0x08
META_ON = 0x40
META_OFF = 0x04
ALT_ON = 0x20
ALT_OFF = 0x02
SHIFT_ON = 0x10
SHIFT_OFF = 0x01

var keycodes = {"CANCEL": 3, "HELP": 6, "BACK_SPACE": 8, "TAB": 9, "CLEAR": 12, "RETURN": 13, "ENTER": 14, "SHIFT": 16, "CONTROL": 17, "ALT": 18, "PAUSE": 19, "CAPS_LOCK": 20, "KANA": 21, "HANGUL": 21, "EISU": 22, "JUNJA": 23, "FINAL": 24, "HANJA": 25, "KANJI": 25, "ESCAPE": 27, "CONVERT": 28, "NONCONVERT": 29, "ACCEPT": 30, "MODECHANGE": 31, "SPACE": 32, "PAGE_UP": 33, "PAGE_DOWN": 34, "END": 35, "HOME": 36, "LEFT": 37, "UP": 38, "RIGHT": 39, "DOWN": 40, "SELECT": 41, "PRINT": 42, "EXECUTE": 43, "PRINTSCREEN": 44, "INSERT": 45, "DELETE": 46, "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, "COLON": 58, "SEMICOLON": 59, "LESS_THAN": 60, "EQUALS": 61, "GREATER_THAN": 62, "QUESTION_MARK": 63, "AT": 64, "A": 65, "B": 66, "C": 67, "D": 68, "E": 69, "F": 70, "G": 71, "H": 72, "I": 73, "J": 74, "K": 75, "L": 76, "M": 77, "N": 78, "O": 79, "P": 80, "Q": 81, "R": 82, "S": 83, "T": 84, "U": 85, "V": 86, "W": 87, "X": 88, "Y": 89, "Z": 90, "WIN": 91, "CONTEXT_MENU": 93, "SLEEP": 95, "NUMPAD0": 96, "NUMPAD1": 97, "NUMPAD2": 98, "NUMPAD3": 99, "NUMPAD4": 100, "NUMPAD5": 101, "NUMPAD6": 102, "NUMPAD7": 103, "NUMPAD8": 104, "NUMPAD9": 105, "MULTIPLY": 106, "ADD": 107, "SEPARATOR": 108, "SUBTRACT": 109, "DECIMAL": 110, "DIVIDE": 111, "F1": 112, "F2": 113, "F3": 114, "F4": 115, "F5": 116, "F6": 117, "F7": 118, "F8": 119, "F9": 120, "F10": 121, "F11": 122, "F12": 123, "F13": 124, "F14": 125, "F15": 126, "F16": 127, "F17": 128, "F18": 129, "F19": 130, "F20": 131, "F21": 132, "F22": 133, "F23": 134, "F24": 135, "NUM_LOCK": 144, "SCROLL_LOCK": 145, "WIN_OEM_FJ_JISHO": 146, "WIN_OEM_FJ_MASSHOU": 147, "WIN_OEM_FJ_TOUROKU": 148, "WIN_OEM_FJ_LOYA": 149, "WIN_OEM_FJ_ROYA": 150, "CIRCUMFLEX": 160, "EXCLAMATION": 161, "DOUBLE_QUOTE": 162, "HASH": 163, "DOLLAR": 164, "PERCENT": 165, "AMPERSAND": 166, "UNDERSCORE": 167, "OPEN_PAREN": 168, "CLOSE_PAREN": 169, "ASTERISK": 170, "PLUS": 171, "PIPE": 172, "HYPHEN_MINUS": 173, "OPEN_CURLY_BRACKET": 174, "CLOSE_CURLY_BRACKET": 175, "TILDE": 176, "VOLUME_MUTE": 181, "VOLUME_DOWN": 182, "VOLUME_UP": 183, "COMMA": 188, "PERIOD": 190, "SLASH": 191, "BACK_QUOTE": 192, "OPEN_BRACKET": 219, "BACK_SLASH": 220, "CLOSE_BRACKET": 221, "QUOTE": 222, "META": 224, "ALTGR": 225, "WIN_ICO_HELP": 227, "WIN_ICO_00": 228, "WIN_ICO_CLEAR": 230, "WIN_OEM_RESET": 233, "WIN_OEM_JUMP": 234, "WIN_OEM_PA1": 235, "WIN_OEM_PA2": 236, "WIN_OEM_PA3": 237, "WIN_OEM_WSCTRL": 238, "WIN_OEM_CUSEL": 239, "WIN_OEM_ATTN": 240, "WIN_OEM_FINISH": 241, "WIN_OEM_COPY": 242, "WIN_OEM_AUTO": 243, "WIN_OEM_ENLW": 244, "WIN_OEM_BACKTAB": 245, "ATTN": 246, "CRSEL": 247, "EXSEL": 248, "EREOF": 249, "PLAY": 250, "ZOOM": 251, "PA1": 253, "WIN_OEM_CLEAR": 254}

/*
Parse keyspec 'keyspec' for keyop mappings.
Returns a [keycode, modifiermask] array for the specified keyspec.
Keyspecs contain any number of modifier key symbols followed and single keycode from the keycodes object.
If a modifier key symbol does not appear, the keyspec will NOT match the keyboard state if the modifier's key is pressed.
If a modifier key symbol appears exactly once, the modifier's key must be pressed for the keyboard state to match this keyspec.
If a modifier key symbol appears more than once, the pressed state of that modifier's key is irrelevant for matching the keyspec.
Example: ^&C : Ctrl+Alt+C, shift and meta must not be pressed.
Example: ##%C : Meta+C, or Alt+Meta+C match, ctrl and shift must not be pressed.
Example: #%##C : same as above.
*/
function parse_keyspec(keyspec) {
	var ctrl = false;
	var alt = false;
	var shift = false;
	var meta = false;
	var kc = "";
	for (var i=0;i<keyspec.length;i++) {
		switch(keyspec.charAt(i)) {
			case '^':
				ctrl = ctrl === false ? true : undefined; break;
			case '%':
				meta = meta === false ? true : undefined; break;
			case '&':
				alt = alt === false ? true : undefined; break;
			case '#':
				shift = shift === false ? true : undefined; break;
			default:
				kc = keyspec.substr(i);
				i = keyspec.length; break;
		}
	}
	if (!keycodes.hasOwnProperty(kc)) {
		console.log("Error with keyspec '"+keyspec+"' - keycode '"+kc+"' is not defined.");
		return null;
	}
	var m = function(s) {
		if (s === false) return 0x01;
		else if (s === true) return 0x10;
		return 0x11;
	}
	return [keycodes[kc], (m(ctrl)<<3)|(m(meta)<<2)|(m(alt)<<1)|m(shift)];
}

/* Convert [keycode, mask] to human readable string. */
function unparse_keyspec(ks) {
	var s = [];
	if (ks[1] & CTRL_ON) s.push("Ctrl");
	if (ks[1] & META_ON) s.push("Meta");
	if (ks[1] & ALT_ON) s.push("Alt");
	if (ks[1] & SHIFT_ON) s.push("Shift");
	s.push(object_reverse_get(keycodes, ks[0], "UNKNOWN"));
	return s.join("+");
}