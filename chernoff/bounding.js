const optimizer = (boundFn) => (lottery, k, z) => {
	let t = 1e-10;
	let step = 1;
	let value = Infinity;
	while(Math.abs(step) > 1e-10){
		const proposal = t + step;
		if(proposal <= 0){ step *= -0.5; continue; }
		const prop_val = boundFn(lottery, k, z, proposal);
		if(prop_val < value){
			t = proposal;
			value = prop_val;
		} else {
			step *= step<0? -0.5 : -1;
		}
	}
	return value;
}


/**
 * @param {Array} lottery - An array of pairs, eg [[value, probability], ...]
 * @param {integer} k - Number of trials
 * @param {number} z - The x-axis of the tail
 * @return {number} An upper bound
 * @example
 *	upperTail([[-5, 0.65], [5, 0.34], [95, 0.01]], 100, 0)
 */
const upperTail = optimizer((lottery, k, z, t) =>
	Math.pow(lottery.reduce((acc, [a, p]) => acc + (p * Math.exp(a*t)), 0), k)
	/ Math.exp(t * z));


/**
* @example
*	makeUpperTailGraph('body', [[-5, 0.65], [5, 0.34], [95, 0.01]], 0);
*/
function makeUpperTailGraph(selector, lottery, bound, extent=5000, n_simulations=1000){
	const theoretical = Array(extent).fill().map((_, k) =>
		({symbol: 'Bound', k: k+1, Probability: upperTail(lottery, k+1, bound)}));
	const simulation = getSimulationProbabilities(lottery, bound, extent, n_simulations).map(
		(Probability, k) => ({Probability, k: k+1, symbol: 'Simulation'}));
	vegaEmbed(selector, {
		"$schema": 'https://vega.github.io/schema/vega-lite/v3.json',
		"data": {values: [...theoretical,  ...simulation]},
		"mark": {"type": "line","interpolate": "monotone"},
		"encoding": {
			"x": {"field": "k", "type": "quantitative"},
			"y": {"field": "Probability", "type": "quantitative"},
			"color": {"field": "symbol", "type": "nominal"}
		}
	});
}




function rouletteAlias(probsRaw){
	const sumRaw = probsRaw.reduce((a,b) => a+b)
	let probs = probsRaw.map(p => probsRaw.length*p/sumRaw)
	let aliases = Array(probs.length).fill()
	let over = []
	let under = []
	probs.forEach((p,i) => {
		if(p > 1) over.push(i)
		else if(p < 1) under.push(i)
	})
	// while there is something in either over or under
	while(over.length+under.length > 0){
		// we terminate if some buckets are over/under and
		// there aren't buckets to compensate (due to roundoff error)
		if(over.length === 0 || under.length === 0){
			const notEmpty = over.length>0? over : under
			notEmpty.forEach(i => probs[i] = 1)
			break
		}
		const underIndex = under.pop()
		const overIndex = over.pop()
		aliases[underIndex] = overIndex
		probs[overIndex] -= 1 - probs[underIndex]
		if(probs[overIndex] > 1){
			over.push(overIndex) // put back on over stack
		}
		else if(probs[overIndex] < 1){
			under.push(overIndex) // move to under stack
		}
	}
	return () => {
		const idx = Math.floor(Math.random() * probs.length)
		return Math.random()<probs[idx] ? idx : aliases[idx]
	}
}


function getSimulationProbabilities(lottery, bound, extent=10000, n_simulations=1000){
	const indexPicker = rouletteAlias(lottery.map(v => v[1]));
	const lotterValues = lottery.map(v => v[0]);
	const valuePicker = () => lotterValues[indexPicker()];
	let probs = Array(extent).fill(0);
	for(let trial=0; trial<n_simulations; trial++){
		let Z = 0;
		for(let i=0; i<extent; i++){
			Z += valuePicker();
			probs[i] += (Z >= bound? 1 : 0) / n_simulations;
		}	
	}
	return probs;
}

