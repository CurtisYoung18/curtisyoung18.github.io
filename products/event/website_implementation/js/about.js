// get the subscribe form
const subscribeForm = document.getElementById('subscribe-form');

// Define a function to handle input changes in the form
const handleInputChange = () => {
    let firstName = document.getElementById('firstName');
    let suburb = document.getElementById('suburb');
    let email = document.getElementById('email');
    let button = document.getElementById('subscribe-submit-button');

    // Check if all required fields have values and the email is valid
    if (firstName.value && suburb.value && email.value && email.validity.valid){
        // If valid, enable the submit button and add the 'enabled' class
        button.classList.add('enabled');
        button.disabled = false;
    } else {
        // If not valid, disable the submit button and remove the 'enabled' class
        button.classList.remove('enabled');
        button.disabled = true;
    }
};

// Define a function to handle form submission
const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the values of the form input fields
    let firstName = document.getElementById('firstName').value;
    let suburb = document.getElementById('suburb').value;
    let email = document.getElementById('email').value;

    let responseMessage = document.getElementById('responseMessage');

    responseMessage.textContent = 'Sending your request ... please wait.';

    // Create the payload object to be sent to the API
    let payload = {
        subscriber_name: firstName,
        subscriber_suburb: suburb,
        subscriber_email: email
    };

    const url = 'https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/api/'
    const method = 'POST';
    const headers = {
        'Content-Type': 'application/json',
    };

    // Send the request to the API using the Fetch API
    fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(payload)
    })
    .then((response) => response.text()) // Convert the response to text
    .then((data) => {
        if (data === 'added') {
            responseMessage.textContent ='Subscription successful. Thank you for subscribing!';
        } else if (data === 'exists') {
            responseMessage.textContent = 'This email address has already been used to subscribe.';
        } else if (data == 'error') {
            responseMessage.textContent = 'An error occured with the API. Please try again later.';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        responseMessage.textContent = 'An unexpected error occured. Please try again later.';
    });


};


subscribeForm.addEventListener('input',handleInputChange);
subscribeForm.addEventListener('submit', handleSubmit);