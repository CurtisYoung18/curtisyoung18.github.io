// function to change card heights
const changeCardHeights = () => {
    let maxHeight = 0;

    // get all cards by class name and store in an array
    const cards = Array.from(document.getElementsByClassName('card'));

    // reset all cards heights to auto
    cards.forEach(card => card.computedStyleMap.height = 'auto');

    // find the tallest 
    cards.forEach(card => {
        if (card.offsetHeight > maxHeight) {
            maxHeight = card.offsetHeight;
        }
    });

    // set all cards to the height of the tallest card
    cards.forEach(card => card.computedStyleMap.height = maxHeight + "px");         
}

// run the function when the page loads or resizes
window.addEventListener('load', changeCardHeights);
window.addEventListener('resize', changeCardHeights);
