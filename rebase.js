var pad = null;
var view = null;
var controller = null;

var pad_key = "rebase.pad_settings";
var view_key = "rebase.view_settings";
var controller_key = "rebase.controller_settings";
var keymap_key = "rebase.keymap";

/* Debug mode shows a bottom toolbar of the form "O(origin_x, origin_y) S(scale), C(cursor_x, cursor_y) @(sel_x0, sel_y0 | sel_x1, sel_y1)" (the @ term is only mentioned if there is a selection, and sel refers to the first element). */
var debug = false;

function debug_toolbar(view, ctx) {
	ctx.fillStyle = "#ddd";
	ctx.fillRect(0, ctx.height - 14, ctx.width, 14);
	ctx.fillStyle = "#111";

	ctx.font = "12px monospace";
	ctx.fillText("O ("+view.settings.origin.x + ", " + view.settings.origin.y + ")", 5, ctx.height-1, 200);
	ctx.fillText("S ("+view.settings.scaling + ")", 210, ctx.height-1, 100);
	ctx.fillText("C ("+controller.pos.x + ", " + controller.pos.y + ")", 315, ctx.height-1, 200);
	if (view.selection.length > 0) {
		var v = view.selection[0];
		ctx.fillText("@ ("+v.x0+", "+v.y0+" | "+v.x1+", "+v.y1+")", 520, ctx.height-1, 400);
	}
}

$(document).ready(function(){
	var cnv = $("#canvas");
	var ctx = cnv[0].getContext('2d');
	$(window).resize(function() {
		cnv[0].width = window.innerWidth;
		cnv[0].height = window.innerHeight;
		ctx.width = window.innerWidth;
		ctx.height = window.innerHeight;
	}).resize();

	window.pad = new Pad(pad_key);
	$(window).bind("beforeunload", function() { 
		window.pad.save();
		window.pad.save_settings();
	});

	window.view = new View(ctx, view_key);
	$(window).bind("beforeunload", function() { 
		window.view.save_settings();
	});

	window.controller = new Controller(window.view, window.pad, mouse_default, keyboard_default, controller_key);
	window.controller.install();
	$(window).bind("beforeunload", function() { 
		window.controller.save_settings();
	});

	if (localStorage[keymap_key] === undefined) {
		localStorage[keymap_key] = JSON.stringify(window.default_keymap);
	}
	window.controller.keyboard.init(JSON.parse(localStorage[keymap_key]));

	window.setInterval(function(){
		window.view.draw(window.pad);
		window.controller.draw(window.view.ctx);
		if (debug) debug_toolbar(window.view, window.view.ctx);
	}, 1000.0/25.0);
});