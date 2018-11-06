function makeEnvironment(imageData){
    const {width, height} = imageData
    const spawn = n_circles => Array(n_circles).fill().map(() => {
        const tri = Array(6).fill().map((_,i) => Math.random() * (i%2==1? imageData.height : imageData.width))
        const rgb = Array(3).fill().map(() => Math.random()*255)
        const alpha = Math.random()
        return [...rgb, alpha, ...tri]
        })
    const errorFn = circles => pixelDistance(imageData.data,
        makePixels(circles, imageData))
    return {spawn, errorFn, width, height}
}

function mutateTriangles(env, oldTriangles){
    let newTriangles = oldTriangles.slice()
    const triangleIndex = Math.floor(Math.random() * (oldTriangles.length))
    newTriangles[triangleIndex] = oldTriangles[triangleIndex].slice()
    if(Math.random()<0.5){ // mutate rgba 
        const rgbaIndex = Math.floor(Math.random()*4)
        newTriangles[triangleIndex][rgbaIndex] = env.spawn(1)[0][rgbaIndex]
    } else { // mutate coordinate
        const coordIndex = Math.floor(Math.random() * (oldTriangles[triangleIndex].length-4)) + 4
        newTriangles[triangleIndex][coordIndex] = env.spawn(1)[0][coordIndex]
    }
    return newTriangles
}


function hillClimb(environment, n_triangles, redraw=false){
    const {spawn, errorFn} = environment
    let best = spawn(n_triangles)
    let bestError = errorFn(best)
    let i = 0
    function nextIteration(){
        for(let j=0; j<10; j++){
            const candidate = mutateTriangles(environment, best)
            const candidateError = errorFn(candidate)
            if(candidateError <= bestError){
                best = candidate
                bestError = candidateError
            }
            i++   
        }
        if(redraw){redraw(best)}
    }
    const interval = setInterval(nextIteration, 0)
    return interval
}



function beamSearch(env, n_triangles=10, redraw=false, popSize=10){
    const {spawn, errorFn} = env
    let population = Array(popSize).fill()
        .map(() => spawn(n_triangles))
        .map(t => [t, errorFn(t)])
    function nextIteration(){
        const successors = population
            .map(([t,]) => mutateTriangles(env, t))
            .map(t => [t, errorFn(t)])
        population = population
            .concat(successors)
            .sort(([,a],[,b]) => a-b)
            .slice(0, popSize)
        console.log(`min error: ${population[0][1]}`)
        if(redraw){redraw(population[0][0])}
    }
    const interval = setInterval(nextIteration, 0)
    return interval
}
