const toggleBtn = document.querySelector('.toggle_btn')
const toggleBtnIcon = document.querySelector('.toggle_btn i')
const dropDownMenu = document.querySelector('.dropdown_menu')

// Attach an onclick event handler to the toggle button
toggleBtn.onclick = function () {
    dropDownMenu.classList.toggle('open')

    // Check if the dropdown menu is currently open or not
    const isOpen = dropDownMenu.classList.contains('open')

    // If open, set the icon to 'xmark' (cross icon), 
    // otherwise set it to 'bars' (hamburger menu icon)
    toggleBtnIcon.classList = isOpen
      ?'fa-solid fa-xmark'
      :'fa-solid fa-bars'
}