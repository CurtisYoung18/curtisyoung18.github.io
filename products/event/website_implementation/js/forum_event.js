/* global constant variables */
const photoFileInputLabel = document.getElementById('photo-file-input-label');
const photoFileInput = document.getElementById('photo-file-input');
const eventForm = document.getElementById('eventForm');
const myInput = document.querySelector("#date_time");
const fp = flatpickr(myInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});
const baseURLCommunityEvents = "https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/community_events/";
const postCommunityEvnetMethod = 'POST';
const eventsContainer = document.getElementById('events-container');
const filterDropdown = document.getElementById('filterDropdown');

const queryString = new URLSearchParams(queryParams).toString();
const urlWithParams = baseURLCommunityEvents + "?" + queryString;

/* global variables */
let events_list; // to hold the list of fetched events
let photo // to hold the selected photo


// trigger the photo file input click event
const triggerFileInput = () => {
    photoFileInput.click();
};

// handle the change event when a photo file is selected
const handleFileChange = () => {
    let fileName = photoFileInput.files[0].name;
    photo = photoFileInput.files[0]
    if (fileName.length > 20) {
        fileName = fileName.substring(0, 17) + '...';
    }

    // Update the label text to show the selected file name
    photoFileInputLabel.textContent = fileName;
};

// submit
const handleFormSubmit = event => {
    event.preventDefault();
    let formData = new FormData(event.target);
    formData.append("website_code", my_website_code);
    formData.append("photo", photo)
    const requestOptions = {
        method: postCommunityEvnetMethod,
        body: formData,
        redirect: 'follow'
    }

    // Make the POST request to add a new event
    fetch(baseURLCommunityEvents, requestOptions)
        .then(response => response.json().then(data => {
            if (!response.ok) {
                console.log("Sever response:", data);
                throw new Error("Network response was not ok");
            }
            return data;
        }))
        .then(data => {
            console.log(data.description);
            photoFileInputLabel.textContent = "Add a photo (Optional)";
            alert(`Your event "${data.description}" has been added to our website! Thanks!`);
            eventForm.reset();
            return data;
        })
        .then(data => {
            getCommunityEvents();
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error.message);
            alert("Error submitting event. Please try again.");
        });
};

// render the fetched or filtered events to the DOM
const renderEvents = (eventsToRender) => {
    while (eventsContainer.firstChild) {
        eventsContainer.removeChild(eventsContainer.firstChild);
    }
    eventsToRender.forEach(event => {
        const eventTemplate = `
            <article class="col-12 col-md-12 col-lg-6" id="card${event.id}">
                <div class="card" role="group" aria-labelledby="card${event.id}-title" aria-describedby="card${event.id}-desc">
                    <h2 class="card-header p-2" id="card${event.id}-title">${event.name}</h2>
                    <img class="card-banner-image" src="${event.photo}" alt="${event.name}">
                    <p class="card-body-text p-2">${event.description}</p>
                    <p class="card-body-text px-2"><strong>Location:</strong>${event.location}</p>
                    <p class="card-body-text px-2"><strong>Organiser:</strong>${event.organiser}</p>
                    <p class="card-body-text px-2"><strong>Event Type:</strong>${event.event_type}</p>
                    <p class="card-body-text px-2"><strong>Date & Time:</strong>${new Date(event.date_time).toLocaleString()}</p>
                </div>
            </article>
        `;
        eventsContainer.innerHTML += eventTemplate;
    })
}

// fetch events from the Community Events API
const getCommunityEvents = () => {
    const queryParams = {
        website_code: my_website_code,
    }
    const queryString = new URLSearchParams(queryParams).toString();
    const urlWithParams = baseURLCommunityEvents + "?" + queryString;
    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    }

    fetch(urlWithParams, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(events => {
            events_list = events;
            renderEvents(events_list);
        })
        .catch(error => {
            console.error("Error processing events:", error.message);
            alert("There was a problem loading events. Please refresh the page to try again.");
        });
};

// filter events 
const filterEventByTerm = (term) => {
    // if no term selected, show all events
    if (!term) {
        renderEvents(events_list);
        return;
    }
    // filter events by the term and then render them 
    const filteredEvents = events_list.filter(event => event.event_type.includes(term));
    renderEvents(filteredEvents);
}

// Attach event listeners
photoFileInputLabel.addEventListener('click', triggerFileInput);
photoFileInput.addEventListener('change', handleFileChange);
eventForm.addEventListener("submit", handleFormSubmit);
filterDropdown.addEventListener('change', (e) => {
    const selectedTerm = e.target.value;
    filterEventByTerm(selectedTerm);
});

// Fetch and display events when the page loads
getCommunityEvents();
