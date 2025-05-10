/* Acknowledegment of ChatGpt

I acknowledge the use of ChatGPT (https://chat.openai.com/) to
help me perform the functions of zooming photos.

The prompts used and the response from ChatGPT are included
in Appendix 1.

The output from these prompts was JavaScript codes
which has the function of zooming images.

This was used as below.
*/

/*
DOM Manipulation and Usability Enhancements
Image Zoom Functionality for gallery.html
*/
document.addEventListener('DOMContentLoaded', function() {
    let galleryItems = document.querySelectorAll('.gallery-item img'); // Select all the images inside the gallery items
    let modal = document.createElement('div'); // Create a modal div to overlay the screen when an image is clicked
    let modalContent = document.createElement('div'); // Create a div to hold the content of the modal
    let modalImage = document.createElement('img'); // Create an image element for the modal to display the clicked image
    
    // Add classes to the created elements for styling and selection
    modal.classList.add('image-modal');
    modalContent.classList.add('modal-content'); 
    modalImage.classList.add('modal-img');

    // Append the image element to the modal content div
    modalContent.appendChild(modalImage); 
    
    // Append the modal and its content to the body of the document
    document.body.appendChild(modal);
    document.body.appendChild(modalContent); 

    // Loop through each gallery item image
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Set the source of the modal image to the source of the clicked image
            modalImage.src = item.src;

            // Display the modal and its content
            modal.style.display = 'block';
            modalContent.style.display = 'block';
        });
        
        // Close the modal when the 'Escape' key is pressed
        document.addEventListener('keydown', function(event) {
            if (event.key === "Escape") {
                closeModal();
            }
        });

        // Open the modal when the 'Enter' or 'Space' key is pressed on an image
        item.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                item.click();
            }
        });
    });
    
    // Define a function to close the modal
    const closeModal = () => {
        // Hide the modal and its content
        modal.style.display = 'none';
        modalContent.style.display = 'none';
    };

    modal.addEventListener('click', closeModal); // Close when clicking on modal 
    modalContent.addEventListener('click', closeModal);  // Close when clicking on modal content
    modalImage.addEventListener('click', closeModal);    // Close when clicking on the image itself
});
