function parseProgram(str){
    let expression = ['']
    let stack = [expression]
    for(const char of str){
        let context = stack[stack.length-1]
        const lastExp = context[context.length-1]
        if(char === '('){
            if(lastExp === ''){ context.pop() }
            let next = ['']
            context.push(next)
            stack.push(next)
        } else if(char === ')'){
            if(lastExp === ''){ context.pop() }
            stack.pop()
        } else if(/\s/g.test(char)){
            if(lastExp !== ''){
                context.push('')
            }
        } else {
            context[context.length-1] += char
        }
    }
    return expression
}

function bind(ks, vs){
    let acc = {}
    for(const i in ks){
        if(ks[i].startsWith('...')){
            return Object.assign(acc, {[ks[i].slice(3)]: vs.slice(i)})
        } else { acc[ks[i]] = vs[i] }
    }
    return acc
}

function spread(args, env){
    let acc = []
    for(let i=0; i<args.length; i++){
        if(typeof(args[i]) === 'string' && args[i].startsWith('...')){
            if(args[i] === '...'){
                i++
                acc.push(...evalExp(args[i], env))
            } else {
                acc.push(...evalExp(args[i].slice(3), env))
            }
        } else { acc.push(args[i]) }
    }
    return acc
}

const baseOps = {
    'def': ([key, val], env) => { return env[key] = evalExp(val, env) },
    'if': ([cond, a, b], env) => evalExp(evalExp(cond, env)? a : b, env),
    'quote': (args) => args[0],
    'fn': ([params, ...exprs], env) => (...supplied) => {
        const newEnv = Object.assign({}, env, bind(params, supplied))
        return exprs.map(a => evalExp(a, newEnv)).pop()
    },
    'macro': ([params, ...exprs], env) => (f => {f.isMacro=true; return f;})(
        (...supplied) => {
            const subEnv = Object.assign({}, env, bind(params, supplied))
            const transformed = exprs.map(a => evalExp(a, subEnv)).pop()
            return evalExp(transformed, env)
        })
}

function evalExp(exp, env){
    if(!isNaN(+exp)) return +exp
    if(typeof(exp) === 'string' && exp.startsWith("'")) return exp.slice(1)
    if(typeof(exp) === 'string') return env[exp]
    if(!Array.isArray(exp)) return exp
    const [op, ...args] = spread(exp, env)
    if(typeof(op) === 'string' && baseOps.hasOwnProperty(op)){
        return baseOps[op](args, env)
    }
    const f = evalExp(op, env)
    return f(...(f.isMacro? args : args.map(a => evalExp(a, env))))
}

function newEnvironment(){
    let env = {
        // lists
        'list': (...args) => args,
        'count': (list) => list.length,
        'first': (list) => list[0],
        'rest': (list) => list.slice(1),
        'last': (list) => list[list.length-1],
        'cons': (ele, list) => [ele, ...list],
        'conj': (ele, list) => [...list, ele],
        'nth': (list, n) => list[n],
        'set': (list) => new Set(list),
        // higher order
        'map': (fn, list) => list.map(fn),
        'filter': (fn, list) => list.filter(fn),
        'reduce': (fn, list, init=null) => list.reduce(fn, init),
        'apply': (fn, list) => fn(...list),
        // boolean
        'true': true,
        'false': false,
        'and': (...exprs) => exprs.reduce((a,b) => a && b, true),
        'or': (...exprs) => exprs.reduce((a,b) => a || b, true),
        'not': (x) => !x,
        // math
        '+': (...args) => args.reduce((a,b) => a+b),
        '*': (...args) => args.reduce((a,b) => a*b),
        '-': (...args) => args.reduce((a,b) => a-b),
        '/': (...args) => args.reduce((a,b) => a/b),
        'mod': (...args) => args.reduce((a,b) => a%b),
        '>': (a,b) => a>b, '<': (a,b) => a<b,'=': (a,b) => a==b,
        // etc
        'get': (obj, prop) => obj[prop],
        'range': (n) => Array(n).fill().map((_,i)=>i),
        'console': console.log,
        'window': window,
        'Math': Math,
    }
    const stdMacros = `
    (def defn
        (macro (name args body)
            (list 'def name
                (list 'fn args body))))

    (def defmacro
        (macro (name args body)
            (list 'def name
                (list 'macro args body))))
    `
    evalProgram(stdMacros, env)
    return env
}

let GLOBAL = newEnvironment()

export function evalProgram(str, env=GLOBAL){
    return parseProgram(str).map(p => evalExp(p, env)).pop()
}
