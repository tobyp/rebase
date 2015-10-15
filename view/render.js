/* Draw a rectangle from (x0,y0) to (x1,y1) on context 'ctx', with border color 'color'. */
function draw_rect(ctx, color, x0, y0, x1, y1) {
	ctx.strokeStyle = color;
	ctx.strokeRect(x0, y0, x1-x0, y1-y0);
}

/* Draw a filled box with text 'text' from (x0,y0) to (x1,y1) on context 'ctx', text color 'fg', fill color 'bg', and border color 'bo'. */
function draw_box(ctx, text, fg, bg, bo, x0, y0, x1, y1) {	
	var w = x1-x0;
	var h = y1-y0;

	ctx.fillStyle = bg;
	ctx.fillRect(x0, y0, w, h);

	ctx.strokeStyle = bo;
	ctx.strokeRect(x0, y0, w, h);

	ctx.fillStyle = fg;
	ctx.fillText(text, x0+(w/2), y0+(h/2), w);
}

/* Draw an arrowhead on context 'ctx' at vector2 'p', with dimensions (w,h), rotated by 'rad' degrees, in color 'color'. */
function draw_arrowhead(ctx, color, p, rad, w, h) {
	ctx.fillStyle = color;
	ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(rad);
	ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w/2,h); ctx.lineTo(-w/2,h); ctx.closePath(); //effectively, a downwards-pointing arrow 
	ctx.fill();
	ctx.restore();
}

/* Calculate the end points of a line from the center of box 'from' to the center of box 'to', but don't let the line enter either box. */
function line_block(from, to) {
	var from_c = from.center();
	var to_c = to.center();
	to_c = to.block(from_c, to_c);
	from_c = from.block(to_c, from_c);
	return [from_c, to_c];
}

/* Draw a line from vector2 'from' to vector2 'to', in color 'color'*/
function draw_line(ctx, color, from, to) {
	ctx.strokeStyle = color;
	ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
}

/* Draw a straight arrow on context 'ctx' in color 'color' from box 'from' to box 'to', with an arrow at the from end if 'from_arrow' is true, and an arrow at the to end if 'to_arrow' is true, with view settings 'settings'. */
function draw_arrow_box_to_box_straight(ctx, color, from, to, to_arrow, from_arrow, settings) {
	var from_to = line_block(from, to);
	from = from_to[0];
	to = from_to[1];

	color = settings.arrow_palette[color];

	draw_line(ctx, color, from, to);
	var rad = Math.atan2(to.y - from.y, to.x - from.x);
	if (to_arrow) {
		draw_arrowhead(ctx, color, from, Math.angle_clamp(rad - Math.PI/2), settings.arrowhead.width, settings.arrowhead.height);
	}
	if (from_arrow) {
		draw_arrowhead(ctx, color, to, Math.angle_clamp(rad + Math.PI/2), settings.arrowhead.width, settings.arrowhead.height);
	}
}

/* Draw a bezier arrow on context 'ctx' in color 'color' from box 'from' to box 'to', with an arrow at the from end if 'from_arrow' is true, and an arrow at the to end if 'to_arrow' is true, with view settings 'settings'. */
function draw_arrow_box_to_box_bezier(ctx, color, from, to, to_arrow, from_arrow, settings) {
	var p0 = null;
	var p1 = null;
	var p2 = null;
	var p3 = null;
	var from_rad = 0;
	var to_rad = 0;
	if (from.x1 >= to.x0 && from.x0 <= to.x0 || from.x0 <= to.x1 && from.x1 >= to.x1) {
		if (from.y0 > to.y1) {
			var cpw = Math.min(settings.bezier_control, from.y0-to.y1);
			p0 = new vector2(from.center().x, from.y0);
			p1 = p0.add(0, -cpw);
			p3 = new vector2(to.center().x, to.y1);
			p2 = p3.add(0, cpw);
			to_rad = 0;
		}
		else if (from.y1 < to.y0) {
			var cpw = Math.min(settings.bezier_control, to.y0-from.y1);
			p0 = new vector2(from.center().x, from.y1);
			p1 = p0.add(0, cpw);
			p3 = new vector2(to.center().x, to.y0);
			p2 = p3.add(0, -cpw);
			to_rad = Math.PI;
		}
	}
	else {
		if (from.x0 < to.x0) {
			var cpw = Math.min(settings.bezier_control, to.x0-from.x1);
			p0 = new vector2(from.x1, from.center().y);
			p1 = p0.add(cpw, 0);
			p3 = new vector2(to.x0, to.center().y);
			p2 = p3.add(-cpw, 0);
			to_rad = Math.PI/2;
		}
		else {
			var cpw = Math.min(settings.bezier_control, from.x0-to.x1);
			p0 = new vector2(from.x0, from.center().y);
			p1 = p0.add(-cpw, 0);
			p3 = new vector2(to.x1, to.center().y);
			p2 = p3.add(cpw, 0);
			to_rad = -Math.PI/2;
		}
	}
	if (p1 != null) {
		ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
		ctx.strokeStyle = settings.arrow_palette[color];
		ctx.stroke();
		/*var rad = Math.atan2(p3.y - p0.y, p3.x - p0.x);
		to_rad = Math.angle_clamp(rad - Math.PI/2);
		from_rad = Math.angle_clamp(rad + Math.PI/2);*/
		from_rad = Math.angle_clamp(to_rad + Math.PI);
		if (to_arrow) {
			draw_arrowhead(ctx, settings.arrow_palette[color], p0, from_rad, settings.arrowhead.width, settings.arrowhead.height);
		}
		if (from_arrow) {
			draw_arrowhead(ctx, settings.arrow_palette[color], p3, to_rad, settings.arrowhead.width, settings.arrowhead.height);
		}
	}
}
