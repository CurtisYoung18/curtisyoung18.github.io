const my_website_code = "Curtis";
const queryParams = {
    website_code: my_website_code,
}

// fuction to update ARIA attributes
const updateAriaAttributes = () => {
    const width = window.innerWidth;
    const normal_menu = document.getElementsByClassName("navbar")[0];
    const dropdown_menu = document.getElementsByClassName("dropdown_menu")[0];
    // [0] gets the first element
}

if (width <= 1194) {
    normal_menu.setAttribute("aria-hidden", "true");
    dropdown_menu.setAttribute("aria-hidden", "false");
} else {
    normal_menu.setAttribute("aria-hidden", "false");
    dropdown_menu.setAttribute("aria-hidden", "true");
}

// run this code then the page first loads
updateAriaAttributes();
window.addEventListener("resize", updateAriaAttributes);

// Handle card interactions
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            cards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
        });
    });

    // Close card when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.card')) {
            cards.forEach(card => card.classList.remove('active'));
        }
    });
});