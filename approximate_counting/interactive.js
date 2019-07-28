const __interactive_component_raw__ = `
<div>
    <div id='plot'></div>
    <table>
        <tr>
            <td># of Estimators</td>
            <td>
                <input id="n_estimators" type="range" min="1" max="101" value="51" step="2" class="slider">
            </td>
        </tr>
        <tr>
            <td>Aggregator</td>
            <td>
                <select id="aggregator">
                    ${
                        Object.keys(aggregator_fns)
                            .map(name => `<option value="${name}" ${name == 'mean'? 'selected="selected"' : ''}>${name}</option>`)
                            .join('')
                    }
                </select>
            </td>
        </tr>
        <tr>
            <td>Coefficient</td>
            <td>
                <input id="scale" type="range" min="0.01" max="1000" value="1" step="0.01" class="slider">
            </td>
        </tr>
        <tr>
            <td>Base</td>
            <td>
                <input id="base" type="range" min="1.01" max="2.5" value="1.1" step="0.01" class="slider">
            </td>
        </tr>
        <tr>
            <td>Function</td>
            <td id="function_display"></td>
        </tr>
        <tr>
            <td>Bits Used</td>
            <td id="bits_display"></td>
        </tr>
    </table>
</div>
`;

function make_interactive(vega_params={width: 300, height: 300}){
    const component = new DOMParser()
        .parseFromString(__interactive_component_raw__, 'text/html')
        .body.childNodes[0];
    
    function onchange(){
        const n_estimators = +component.querySelector(`#n_estimators`).value;
        const aggregator = component.querySelector(`#aggregator`).value;
        const coeff = +component.querySelector(` #scale`).value;
        const base = +component.querySelector(`#base`).value;
        const fn = x => coeff * Math.pow(base, x);

        component.querySelector(`#function_display`).innerHTML = `f(x) = ${coeff} * ${base}^x`;

        const counter = new aggregated_counter_factory(fn, n_estimators, aggregator);
        if(component.__interval__ != undefined){
            window.clearInterval(component.__interval__);
        }
        const update_fn = plotEstimates(component.querySelector('#plot'), counter, vega_params);
        component.__interval__ = window.setInterval(() => {
            const i = update_fn(10000);
            const bits_info = `${counter.bits_used()} / ${Math.ceil(Math.log2(1+i))} bits`;
            component.querySelector(`#bits_display`).innerHTML = bits_info;
        }, 10);
    }

    onchange();

    ['#n_estimators', '#aggregator', '#scale', '#base'].forEach(s => {
        component.querySelector(s).oninput = onchange;
    });

    return component;
}
