function draw_rectangles(random, given_PARAMS){
	canvas_width = 240;
	var DEFAULT_PARAMS = {
		'grid_size': 3,

		'square_fill': 'orange',
		'outer_fill': 'black',
		'inner_fill': 'white',

		'rect_border': 0.1,

		'space_to_border': 20,
		'space_between_squares': 10,
		'square_size': 60,
	};
	var PARAMS = Object.assign({}, DEFAULT_PARAMS, given_PARAMS || {});
	var canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	canvas.style.width = canvas_width;
	canvas.style.height = canvas_width;
	canvas.style.overflow = "visible";
	canvas.style.borderStyle = "solid";

	function normalize_grid(PARAMS){
		var available = (canvas_width - (2*PARAMS['space_to_border'])) / PARAMS['grid_size'],
		sum = PARAMS['square_size'] + PARAMS['space_between_squares'] - (PARAMS['space_between_squares']/PARAMS['grid_size']);
		PARAMS['square_size'] *= available / sum;
		PARAMS['space_between_squares'] *= available / sum;
	}
	normalize_grid(PARAMS);
	var rect_border = PARAMS['rect_border'] * PARAMS['square_size'];

	for(i=0;i<PARAMS['grid_size'];i++){
		for(j=0;j<PARAMS['grid_size'];j++){
			var space_per_square = PARAMS['space_between_squares']+PARAMS['square_size'],
			corner_x = PARAMS['space_to_border'] + (j*space_per_square),
			corner_y = PARAMS['space_to_border'] + (i*space_per_square);

			// make square
			var square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			square.setAttribute("fill", PARAMS['square_fill']);
			square.setAttribute("width", PARAMS['square_size']);
			square.setAttribute("height", PARAMS['square_size']);
			square.setAttribute("x", corner_x);
			square.setAttribute("y", corner_y);
			canvas.append(square);

			// make circles
			var out_rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
			in_rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
			in_rect_available = PARAMS['square_size'] - (2 * rect_border),
			in_height = in_rect_available * (0.2 + (0.6 * random())),
			in_width = in_rect_available * (0.2 + (0.6 * random())),
			out_height = in_height + (2 * rect_border),
			out_width = in_width + (2 * rect_border),
			out_x = corner_x + ((PARAMS['square_size'] - out_width) * random()),
			out_y = corner_y + ((PARAMS['square_size'] - out_height) * random()),
			in_x = out_x + rect_border,
			in_y = out_y + rect_border;
			out_rect.setAttribute('fill', PARAMS['outer_fill']);
			out_rect.setAttribute('x', out_x);
			out_rect.setAttribute('y', out_y);
			out_rect.setAttribute('height', out_height);
			out_rect.setAttribute('width', out_width);
			in_rect.setAttribute('fill', PARAMS['inner_fill']);
			in_rect.setAttribute('x', in_x);
			in_rect.setAttribute('y', in_y);
			in_rect.setAttribute('height', in_height);
			in_rect.setAttribute('width', in_width);
			canvas.append(out_rect);
			canvas.append(in_rect);
		}
	}
	return canvas
}
