import {evalProgram} from './lisp.js'

const defaultSubmitAction = (inputValue, textDiv) => {
    textDiv.innerText += `>>> ${inputValue}`
    textDiv.scrollTop = textDiv.scrollHeight
    try{
        textDiv.innerText += `\n${JSON.stringify(evalProgram(inputValue))}\n`
    } catch(e){
        textDiv.innerText += `\n${e}\n`
    }
    textDiv.scrollTop = textDiv.scrollHeight
} 

export const newDOM = (submitAction=defaultSubmitAction) => {
    const holder = document.createElement('div')
    const textDiv = document.createElement('div')
    const input = document.createElement('textarea')

    holder.appendChild(textDiv)
    holder.appendChild(input)

    holder.style.width = '100%'
    holder.style.height = '50%'
    textDiv.style = 'height: 100%; width: 100%; overflow: scroll; border: 1px solid;'
    input.setAttribute('rows', 2)
    input.style.width = '100%'

    input.addEventListener('keydown', e => {
        if(e.keyCode === 13 && !e.shiftKey){
            e.preventDefault()
            submitAction(input.value, textDiv)
            input.value = ''
        }
    })

    return holder
}

