const arrow_chars = {
	left: '←',
	right: '→',
	up: '↓',
	down: '↑'
}

function to_color(v){
	let color = Array(3).fill(Math.floor(255*(1-Math.abs(v))))
	color[v<0? 0 : 1] = 255
	return `rgb(${color})`
}

export function paint_grid(PARAMS){
	this.PARAMS = PARAMS
	this.cell_size = PARAMS.width / PARAMS.grid_size[0]
	this.corner_pos = ([x,y]) => [x*this.cell_size, y*this.cell_size]
	this.center_pos = pos => this.corner_pos(pos).map(d => d+(this.cell_size / 2))
	this.canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	this.canvas.style.overflow = "visible"
	//this.canvas.style.borderStyle = "solid"
	this.canvas.style.height = PARAMS.width
	this.canvas.style.width = PARAMS.width

	this.clear_canvas = _ => {this.canvas.innerHTML = ''}

	this.draw_tile = (pos, color) => {
			let [x,y] = this.corner_pos(pos),
			square = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
			if(color != undefined) square.setAttribute("fill", color)
			square.setAttribute("width", this.cell_size)
			square.setAttribute("height", this.cell_size)
			square.setAttribute("x", x)
			square.setAttribute("y", y)
			square.setAttribute("stroke-width", 1)
			this.canvas.append(square)
	}

	this.draw_tiles = (colors, to_color_fn) => {
		colors.map((row, i) => {
			row.map((color, j) => {
				this.draw_tile([i,j], to_color_fn===undefined? color : to_color_fn(color))
			})
		})
	}

	this.draw_matrix = (matrix) => {
		const max = Math.max(...matrix.map(r=>Math.max(...r.map(Math.abs)))),
		colors = matrix.map(row => row.map(x => to_color(x/max)))
		this.draw_tiles(colors)
	}

	this.draw_reward = grid => this.draw_matrix(grid.reward)
	this.draw_values = grid => this.draw_matrix(grid.value.vals)

	this.draw_policy = policy => {
		policy.map((row,i) => row.map((dir,j) => {
			const char = arrow_chars[dir],
			[x,y] = this.corner_pos([i,j])
			let text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			text.setAttribute("x", x+(0.25*this.cell_size))
			text.setAttribute("y", y+(0.75*this.cell_size))
			text.setAttribute("font-size", this.cell_size*0.75)
			text.innerHTML = char
			this.canvas.append(text)
		}))
	}

	this.draw_value_policy = grid => {
		const [xs, ys] = grid.size.map(v => Array(v).fill()),
		policy = xs.map((_,i) => ys.map((_,j) => grid.value.choose_action([i,j])))
		this.draw_policy(policy)
	}

	this.draw_value = grid => {
		this.clear_canvas()
		this.draw_reward(grid)
		this.draw_value_policy(grid)
		return this.canvas
	}
}