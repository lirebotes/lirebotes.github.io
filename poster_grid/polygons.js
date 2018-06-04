function draw_polygons(random, given_PARAMS){
	var canvas_width = 240;
	var DEFAULT_PARAMS = {
		'grid_size': 3,

		'square_fill': 'red',
		'outer_fill': 'blue',
		'inner_fill': 'white',
		'border': 0.5,
		'n_sides': 5,

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

			// make polygons
			var outer_polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'),
			inner_polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'),
			cx = corner_x + (PARAMS['square_size'] / 2),
			cy = corner_y + (PARAMS['square_size'] / 2),
			outer_points = "",
			inner_points = "";
			for(k=0;k<PARAMS['n_sides'];k++){
				var magnitude = (0.2+(0.8*random())) * PARAMS['square_size'] / 2,
				inner_mag = (1-PARAMS['border']) * (0.2+(0.8*random())) * PARAMS['square_size'] / 2, //10, // magnitude * (1-PARAMS['border']),
				angle = (k / PARAMS['n_sides']) * (2*Math.PI);
				outer_points += (cx + (magnitude * Math.cos(angle))) + ",";
				outer_points += (cy + (magnitude * Math.sin(angle))) + " ";
				inner_points += (cx + (inner_mag * Math.cos(angle))) + ",";
				inner_points += (cy + (inner_mag * Math.sin(angle))) + " ";
			}
			outer_polygon.setAttribute("points", outer_points);
			outer_polygon.setAttribute("fill", PARAMS['outer_fill']);
			inner_polygon.setAttribute("points", inner_points);
			inner_polygon.setAttribute("fill", PARAMS['inner_fill']);
			canvas.append(outer_polygon);
			canvas.append(inner_polygon);
		}
	}
	return canvas;
}
