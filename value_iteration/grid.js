import {paint_grid} from './paint.js'

const PARAMS = {
	grid_size: [10,10],
	width: 500
}

const actions = {
	left: ([x,y]) => [x-1,y],
	right: ([x,y]) => [x+1,y],
	up: ([x,y]) => [x,y+1],
	down: ([x,y]) => [x,y-1],
}

export function make_grid(PARAMS, gamma){
	const [x,y] = PARAMS.grid_size
	this.paint = new paint_grid(PARAMS)
	this.size = [x,y]
	this.walkable = Array(x).fill().map(_ => Array(y).fill().map(_ => true))
	this.actions = Object.keys(actions).sort()
	this.reward = Array(x).fill().map(_ => Array(y).fill().map(_ => Math.random()>0.2? 0 : (Math.random()*2)-1))
	this.policy = Array(x).fill().map(_ => Array(y).fill().map(_ => (Math.random()*2)-1))
	this.gamma = gamma === undefined? 0.99 : gamma
	this.reward[0][0] = 1
	this.perform_action = (position, action) => {
		const [px,py] = actions[action](position) // proposed position
		if(px<0 || py<0 || px>=this.size[0] ||  py>=this.size[1] || !this.walkable[px][py]){
			return {pos: null, reward: 0}
		} 
		return {pos: [px,py], reward: this.reward[px][py]}
	}

	this.value = {
		vals: Array(x).fill().map(_ => Array(y).fill().map(_ => (Math.random()*0.1))),
		choose_action: position => value_choose_action(this, position),
		iteration: _ => value_iteration(this),
		populate_vals: () => {
			this.value.vals = Array(x).fill().map(_ => Array(y).fill().map(_ => (Math.random()*0.1)))
		}
	}
}





/*
Value iteration fns
*/
function value_choose_action(grid, position){
	const action_values = grid.actions.map(a => {
		const {pos,reward} = grid.perform_action(position, a)
		if(pos === null) return Number.NEGATIVE_INFINITY
		const [px,py] = pos
		return reward + (grid.gamma * grid.value.vals[px][py])
	})
	return grid.actions[action_values.indexOf(Math.max(...action_values))]
}

function value_iteration(grid){
	let max_diff = 0
	for(let i=0;i<grid.size[0];i++){
		for(let j=0;j<grid.size[1];j++){
			const new_val = Math.max(...grid.actions.map(a => {
				const {pos,reward} = grid.perform_action([i,j], a)
				if(pos === null) return reward
				const [px,py] = pos
				return reward + (grid.gamma * grid.value.vals[px][py])
			}))
			max_diff = Math.max(max_diff, Math.abs(grid.value.vals[i][j] - new_val))
			grid.value.vals[i][j] = new_val
		}
	}
	return max_diff
}

