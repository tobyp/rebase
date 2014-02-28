var default_pad_settings = {
	/* @brief Default size of a new node */
	box_width: 200,
	box_height: 14,
	/* @brief Key to store pad contents under in local storage */
	data_key: "rebase.data"
};

var default_view_settings = {
	/* @brief Font settings for node labels */
	font: {
		family: "monospace",
		size: 12
	},
	/* @brief Border color for selected nodes */
	selection_color: "#f00",
	/* @brief Foreground-Background pairs for nodes */
	palette : [
		["#eee", "#111"],
		["#faa", "#a00"],
		["#afa", "#0a0"],
		["#aaf", "#00a"],
		["#700", "#f00"],
		["#070", "#0f0"],
		["#00a", "#aaf"],
		["#111", "#eee"]
	],
	/* @brief Palette of possible dependency arrow colors */
	arrow_palette : [
		"#222",
		"#722",
		"#272",
		"#227",
		"#777"
	],
	/* @brief Arrowhead dimensions for rendering dependency arrows. (Actual filled area will be 50% of width*height) */
	arrowhead: {
		width: 16,
		height: 8
	},
	/* @brief List of arrow colors to actually draw. Can be used to hide/show certain colors. */
	arrow_mask: [0,1,2,3,4],
	/* @brief bezier control value for bezier arrows. Only applicable if arrow_bezier is true. Larger values make the arrows curvier. */
	bezier_control: 20,
	/* @brief current view settings. */
	scaling: 1.0,
	origin: {x: 0, y: 0},
	/* @brief True to draw the arrows from depender to dependee, false otherwise. */
	arrow_direction: true,
	/* @brief True to draw bezier arrows, false to draw them straigh. */
	arrow_bezier: true
};

var default_controller_settings = {
	/* @brief The factor by which one zoom/scale operation will scale. If this is greater than one, scaling is in the normal directionfh. If this is equal to one, scaling is not possible. If this is greater than 0 and less than 1, scaling is inverted. If this is less than or equal to zero, so help you god.*/
	scale_factor: 1.1,
	/* @brief Angle to rotate by on shift+mouse wheel */
	rotation_angle: Math.PI/50.0,
	/* @brief distance to move by for translate keyop (used as a multiplier on x and y of the "translate" keyop data object) */
	move_delta: 10,
	/* @brief Factor for panning distance, as multiple of view width. Used as multiplier for the "pan" keyop data object) */
	pan_factor: 0.9,
	/* @brief display properties of the Box Select selection box. */
	selection_box: {
		border_color: "#777",
		fill_color: "#ccc",
		fill_alpha: 0.5
	},
	/* @brief Vertical spacing between nodes, for align keyop. */
	align_margin_vertical: 5,
	/* Color of dependency arrow for the Drag mouse handler. */
	arrow_color: "#222"
};

/*
@brief Default keymap that will be loaded if no keymap exists in local storage.
Entries have a keyspec as key, and a keyop data object as value.
A keyop data object contains at least an op key, whose value is the name of a keyop as defined in the keyops object.
The whole keyop data object will be passed to the keyops function. Use it to pass extra data for different parameterizations ("variants") of the keyop.
*/
var default_keymap = {
	"NUMPAD1": {"op": "translate", "x": -1, "y": 1},
	"NUMPAD2": {"op": "translate", "x": 0, "y": 1},
	"NUMPAD3": {"op": "translate", "x": 1, "y": 1},
	"NUMPAD4": {"op": "translate", "x": -1, "y": 0},
	"NUMPAD6": {"op": "translate", "x": 1, "y": 0},
	"NUMPAD7": {"op": "translate", "x": -1, "y": -1},
	"NUMPAD8": {"op": "translate", "x": 0, "y": -1},
	"NUMPAD9": {"op": "translate", "x": 1, "y": -1},

	"#NUMPAD1": {"op": "pan", "x": -1, "y": 1},
	"#NUMPAD2": {"op": "pan", "x": 0, "y": 1},
	"#NUMPAD3": {"op": "pan", "x": 1, "y": 1},
	"#NUMPAD4": {"op": "pan", "x": -1, "y": 0},
	"#NUMPAD6": {"op": "pan", "x": 1, "y": 0},
	"#NUMPAD7": {"op": "pan", "x": -1, "y": -1},
	"#NUMPAD8": {"op": "pan", "x": 0, "y": -1},
	"#NUMPAD9": {"op": "pan", "x": 1, "y": -1},

	"F1": {"op": "arrow_toggle", "arrow": 0},
	"F2": {"op": "arrow_toggle", "arrow": 1},
	"F3": {"op": "arrow_toggle", "arrow": 2},
	"F4": {"op": "arrow_toggle", "arrow": 3},
	"F5": {"op": "arrow_toggle", "arrow": 4},

	"ADD": {"op": "zoom", "zoom_in": true},
	"SUBTRACT": {"op": "zoom", "zoom_in": false},

	"TAB": {"op": "jump"},

	"A": {"op": "align"},
	"&A": {"op": "align", "alpha": true},
	"#A": {"op": "align", "scooch": true},
	"&#A": {"op": "align", "scooch": true, "alpha": true},

	"C": {"op": "cycle_color"},
	"#C": {"op": "cycle_color", "reverse": true},

	"^C": {"op": "cycle_arrow"},
	"^#C": {"op": "cycle_arrow", "reverse": true},

	"&C": {"op": "detect_cycles"},

	"D": {"op": "toggle_dep"},
	"^D": {"op": "put_dep"},
	"#D": {"op": "discard_dep"},
	"&D": {"op": "debug"},

	"I": {"op": "invert"},

	"M": {"op": "mirror", "y": true},
	"&M": {"op": "mirror", "y": true},
	"#M": {"op": "mirror", "x": true},
	"&#M": {"op": "mirror", "x": true, "y": true},
	
	"^M": {"op": "mirror", "mouse": true, "y": true},
	"^&M": {"op": "mirror", "mouse": true, "y": true},
	"^#M": {"op": "mirror", "mouse": true, "x": true},
	"^&#M": {"op": "mirror", "mouse": true, "x": true, "y": true},

	"N": {"op": "add"},

	"#P": {"op": "propagate_dependencies"},
	"P": {"op": "propagate_dependencies", "expand": true},
	"^#P": {"op": "propagate_dependees"},
	"^P": {"op": "propagate_dependees", "expand": true},

	"Q": {"op": "search"},

	"R": {"op": "rename"},
	"^#R": {"op": "reload"},

	"S": {"op": "starburst"},
	"^#S": {"op": "save"},

	"T": {"op": "bring"},
	"#T": {"op": "center"},

	"^#V": {"op": "reset_view"},

	"X": {"op": "delete"},
	"^#X": {"op": "delete_selection"}
};
