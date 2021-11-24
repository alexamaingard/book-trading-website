function createElement(tag){
    const element = document.createElement(tag);
    return element;
}

function createElementWithClass(tag, className){
    const element = createElement(tag);
    element.className = className;
    return element;
}

function createInputElement(id, type){
    const input = createElement('input');
    input.id = id;
    input.setAttribute('type', type);
    return input;
}

function createButtonElement(className, id, text){
    const button = createElementWithClass('button', className);
    button.id = id;
    button.innerText = text;
    return button;
}