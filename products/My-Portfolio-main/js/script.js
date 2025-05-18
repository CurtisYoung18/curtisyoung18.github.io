// When the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // Initialize page-specific functions
    setupWelcomePage();
    setupPortfolioPage();
    setupContactForm();
    setupAboutPage();
    setupReflectionPage();

});


// Function to set up the welcome page
function setupWelcomePage() {
    const exploreBtn = document.getElementById('exploreBtn');
    const flipper = document.querySelector('.flipper');

    if (exploreBtn && flipper) {
        exploreBtn.addEventListener('click', function() {
            flipper.classList.toggle('flipped');
            console.log('Explore button clicked');
        });
    }
}

// Function to set up the portfolio page
function setupPortfolioPage() {
    const projectParts = document.querySelectorAll('.project-part');
    const nextButton = document.getElementById('nextProject');

    if (projectParts.length && nextButton) {
        let currentPart = 0;

        // Show only the first part initially
        projectParts.forEach((part, index) => {
            if (index === 0) {
                part.classList.add('active');
            } else {
                part.classList.remove('active');
            }
        });

        nextButton.addEventListener('click', function() {
            // Hide current part
            projectParts[currentPart].classList.remove('active');

            // Update to next part
            currentPart = (currentPart + 1) % projectParts.length;

            // Show next part
            projectParts[currentPart].classList.add('active');

            // Scroll to the top of the new active part
            projectParts[currentPart].scrollIntoView({ behavior: 'smooth' });

            // Update button text
            nextButton.textContent = currentPart === projectParts.length - 1 ? 'Reset' : 'Next Part';
        });
    }
}


// 设置联系表单的函数
function setupContactForm() {
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages');

    if (messageForm && messagesContainer) {
        messageForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name && email && message) {
                emailjs.send('service_7w3xocd', 'template_n6qvi67', {
                    from_name: name,
                    reply_to: email,
                    message: message
                })
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Message sent successfully!');
                    addMessage(name, email, message); 
                    messageForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Failed to send the message. Please try again.');
                });
            } else {
                alert('Please fill in all fields');
            }
        });
    }

    function addMessage(name, email, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <h3>${name}</h3>
            <p>${message}</p>
            <small>${email}</small>
        `;
        messagesContainer.prepend(messageElement);
    }
}


// 设置关于页的函数
function setupAboutPage() {
    // 在这里添加关于页的特定 JavaScript
}

// 设置反思页的函数
function setupReflectionPage() {
    // 在这里添加反思页的特定 JavaScript
}