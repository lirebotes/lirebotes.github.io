function plotEstimates(selector, counter, override_vega={}){
    // 'Actual' is X-coordinate
    // 'Recorded' is Y-coordinate
    // 'Symbol' is legend / color
    const getActual = i => ({Actual: i, Recorded: i, Symbol: 'Standard Counter'});
    const getEstimated = i => ({Actual: i, Recorded: counter.estimate(), Symbol: 'Approximate Counter'})

    let vegaParams = {
        "$schema": 'https://vega.github.io/schema/vega-lite/v3.json',
        "data": {name: 'plot'},
        "mark": {"type": "line","interpolate": "monotone"},
        "encoding": {
            "x": {"field": "Actual", "type": "quantitative"},
            "y": {"field": "Recorded", "type": "quantitative"},
            "color": {"field": "Symbol", "type": "nominal"}
        }
    }
    vegaParams = Object.assign(vegaParams, override_vega);

    let plot = vegaEmbed(selector, vegaParams);

    let i = 0;
    const update = (n_updates=1) => {
        const next_i = i + n_updates;
        for(i; i<next_i; i++){
            counter.increment();
        }
        const changeSet = vega.changeset().insert([getActual(i), getEstimated(i)]);
        plot = plot.then(res => {
            res.view.change('plot', changeSet).run();
            return res;
        });
        return i;
    }
    update(0);

    return update;
}


/* 
* counters expose 3 methods:
*   increment: increments the counter
*   estimate: the current estimate
*   bits_used: the minimum number of bits needed to represent the counter
*/
function counter_factory(estimate_fn){
    let count = 0;
    this.estimate = () => estimate_fn(count);
    this.bits_used = () => Math.ceil(Math.log2(count));
    this.increment = () => {
        if(Math.random() <= (1 / (estimate_fn(count+1) - estimate_fn(count)))){
            count += 1;
        }
    }
}

const aggregator_fns = {
    'median': function(arr){ // naive median, O(n lg n)
        arr = arr.sort();
        if((arr.length % 2) == 1){
            return arr[Math.floor(arr.length / 2)];
        }
        return (arr[arr.length / 2] + arr[(arr.length / 2) - 1]) / 2;
    },

    'mean': function(arr){
        return arr.reduce((a,b) => a+b, 0) / arr.length;
    },

    'single_estimator': function(arr){ return arr[0]; },
}

function aggregated_counter_factory(estimate_fn, n=1, aggregator){
    let counters = Array(n).fill().map(() => new counter_factory(estimate_fn));
    this.bits_used = () => counters.reduce((sum, c) => sum + c.bits_used(), 0);
    this.estimate = () => aggregator_fns[aggregator](counters.map(c => c.estimate()));
    this.increment = () => {
        counters.forEach(c => c.increment());
    }
}
