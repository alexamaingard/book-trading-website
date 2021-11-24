let contactState = {
    firstName: null,
    lastName: null,
    email: null,
    message: ''
}

function setContactState(newState){
    contactState = {...contactState, ...newState};
}

function resetValues(...params){
    params.forEach(element => {
        element.value = '';
    });
}

function storeContactUsData(contactState){
    fetch(contactURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  
        },
        body: JSON.stringify(contactState)
    });
}

function getContactUsFormData(){
    const contactForm = document.querySelector('.contact-form');
    const firstName = document.querySelector('#first-name');
    const lastName = document.querySelector('#last-name');
    const email = document.querySelector('#email');
    const message = document.querySelector('#message');

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        setContactState({firstName: firstName.value, lastName: lastName.value, email: email.value, message: message.value});
        resetValues(firstName, lastName, email, message);
        storeContactUsData(contactState);
    });
}

getContactUsFormData();