# Rebase
### Node graph based brainstorming tool.

Rebase allows you to create graphs (in the computer science sense, with vertices and edges, not the things that get called graphs but are actually charts or diagrams) and manupluate them visually or via your browser's JavaScript console. All your data and keybindings, and most other settings, are stored in localStorage in your browser as JSON strings. Its design goal was to allow easy mindmap-based brainstorming, rearranging graphs to examine interdependencies or relations from different perspectives, and organising information to aid thinking about large structures.

Rebase is designed for Modern HTML5 browsers, using the Canvas and localStorage APIs, tested exclusively in Chromium, and follows a zero-tolerance policy of non-compliant browsers.

## Default usage
### Mouse operations
* Ctrl+Left Mouse Button: toggle dependency of A on B by dragging from A to B
* Shift+Left Mouse Button: resize a node by dragging
* Left Mouse Button: move node or selection by dragging
* Middle Mouse Button: pan view by dragging
* Right Mouse Button: box select by dragging (Hold Ctrl to add to existing selection, Shift to remove from existing selection, and Ctrl+Shift to keep the intersection of the existing selection and the new one)
* Shift+Mouse Wheel: orbit selection around cursor
* Mouse Wheel: zoom

### Node tools
* D/Ctrl+D/Shift+D: toggle/put/discard dependency from node under cursor to selection
* C: cycle color (Shift to reverse)
* N: add node
* Q: search for node by name
* R: rename node under cursor
* X: delete node under cursor (Ctrl+Shift+X to delete all selected nodes)

### Selection tools:
* I: invert selection
* P: propagate dependencies (i.e. add all nodes depended upon by any selected node to the selection), Shift+P to replace the selection with them instead of adding them to it.
* Ctrl+P: propagate dependees (i.e. add all nodes depending on any selected node to the selection), Ctrl+Shift+P to replace the selection with them instead of adding them.

### Node rearrangement
* A: align (Alt: alphabetically, Shift: compact)
* M: mirror (Shift to mirror over X, Alt or nothing to mirror over Y, both to mirror over both; add Ctrl to mirror around the mouse instead the selection's center).
* S: arrange nodes in starburst, outwards from the node under the cursor.
* T: center nodes around current cursor position (Shift to center around origin instead).
* Ctrl+C: cycle arrow color (Shift to reverse)

### View manipulation:
* Ctrl+Shift+V: reset view to center and normal zoom.
* Numpad: move selection (2 is down, 6 right, 7 up-left, etc.)
* Shift+Numpad: pan view
* Numpad+/-: zoom
* TAB: focus next selected element
* F1..F5: Toggle arrow visibility

### Debug/Diagnostics
* Alt+D: enable debug info
* Alt+C: detect cycles

### Save/Restore
* Ctrl+Shift+R: reload pad
* Ctrl+shift+S: save pad

## Architecture:
* controller - takes mouse and keyboard input and translates it into calls to the model and view. The Controller class keeps some state (like last mouse location and modifier key values). Different handlers are assigned to it to emulate "modes", (example, holding down the left mouse button enters drag mode, which reacts differently to mouse move events than other modes.).
* view - rendering of a pad. Manages settings like color scheme, move/scale parameters, viewport, etc.
* model/pad - data store and access.
* ops - operations in a generic sense. These should be elementary, if possible, so keyops can then combine them.
* keyops - bind ops and other small functions to keyboard. The glue between controller and ops. They can be parameterized by the keymap.