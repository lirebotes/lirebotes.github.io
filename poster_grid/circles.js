function draw_circles(random, given_PARAMS){
	var canvas_width = 240;
	var DEFAULT_PARAMS = {
		'grid_size': 3,

		'square_fill': "#c6c6c6",
		'outer_fill': 'black',
		'inner_fill': 'white',

		'circle_border': 3,

		'space_to_border': 20,
		'space_between_squares': 10,
		'square_size': 60,
	};
	var PARAMS = Object.assign({}, DEFAULT_PARAMS, given_PARAMS);
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
			var out_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
			in_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
			radius =  PARAMS['square_size'] * (0.5 * (0.2 + (0.6 * random()))),
			freedom = PARAMS['square_size'] - (2*radius),
			cx = corner_x + radius + (freedom * random()),
			cy = corner_y + radius + (freedom * random());
			out_circle.setAttribute('fill', PARAMS['outer_fill']);
			out_circle.setAttribute('r', radius);
			out_circle.setAttribute('cx', cx);
			out_circle.setAttribute('cy', cy);
			in_circle.setAttribute('fill', PARAMS['inner_fill']);
			in_circle.setAttribute('r', Math.max(0, radius - PARAMS['circle_border']));
			in_circle.setAttribute('cx', cx);
			in_circle.setAttribute('cy', cy);
			canvas.append(out_circle);
			canvas.append(in_circle);
		}
	}
	return canvas;
}
