export function renderHeader(){
    //display user dropdown menu when user icon is clicked
    document.addEventListener('DOMContentLoaded',()=>{
        const userIcon=document.querySelector('.user-icon');
        const dropdownMenu=document.querySelector('.dropdown-menu');
        userIcon.addEventListener('click',()=>{
           dropdownMenu.classList.toggle('active'); 
        });
        
        //close user dropdown menu when user clicks outside of it
        document.addEventListener('click',(event)=>{
            if(!userIcon.contains(event.target)){
                dropdownMenu.classList.remove('active');
            }
        });
        
        //add calendar drop down to the date inputs
        const startDatePickr=flatpickr("#start-date", {
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                // Update end-date picker minDate when start-date changes
                endDatePickr.set('minDate', dateStr);
            }
        });
        const endDatePickr=flatpickr("#end-date", {
            dateFormat: "Y-m-d",
            minDate: "today"
        });

        //use Google autosuggest to search for locations
        const destInp = new google.maps.places.SearchBox(document.getElementById('search-destination'));
        
        // display login modal when login is clicked
        if (document.getElementById("login-modal")) {
            document.getElementById("login-modal").addEventListener('click',()=>{
            const myModal = new bootstrap.Modal(document.getElementById('loginModal'));
            myModal.show();
            });
        }
        
        // display signup modal when signup is clicked
        if (document.getElementById("signup-modal")) {
        document.getElementById("signup-modal").addEventListener('click',()=>{
            const myModal = new bootstrap.Modal(document.getElementById('signupModal'));
            myModal.show();
            }); 
        }

        // Function to get query parameter values by name
        function getQueryParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Get the query parameters
        const destination = getQueryParam('destination');
        const startDate = getQueryParam('startDate');
        const endDate = getQueryParam('endDate');
        const guests = getQueryParam('guests');

        // Set the values of the inputs
        if (destination) {
            document.getElementById('search-destination').value = decodeURIComponent(destination);
        }
        if (startDate) {
            document.getElementById('start-date').value = decodeURIComponent(startDate);
        }
        if (endDate) {
            document.getElementById('end-date').value = decodeURIComponent(endDate);
        }
        if (guests) {
            document.getElementById('add-guest').value = decodeURIComponent(guests);
        }
    });

    //highlight the focused input by changing background color
    document.querySelectorAll('.search-input').forEach((input)=>{
        let midSection=document.querySelector('.website-header-middle-section');
        input.addEventListener('focus', ()=>{
            midSection.style.backgroundColor = '#e6e6e6';
            document.querySelectorAll('.search-input').forEach((inp)=>{
                if (inp !== input) {
                    inp.classList.add('unfocused');
                } else {
                    inp.classList.remove('unfocused');
                }
            });
        })
        input.addEventListener('blur', ()=>{
            midSection.style.backgroundColor = 'white';
            document.querySelectorAll('.search-input').forEach((inp)=>{
                inp.classList.remove('unfocused');
            });
        })
    });

    //handle search button click
    document.querySelector('.search-button').addEventListener('click',()=>{
        const destination=document.getElementById('search-destination');
        const startDate=document.getElementById('start-date');
        const endDate=document.getElementById('end-date');
        const guests=document.getElementById('add-guest');
        //input validation
        if(!destination.value || !startDate.value || !endDate.value || !guests.value){
            return;
        }
        // Redirect to the itinerary page with query parameters
        window.location.href = `/itinerary-detail?destination=${encodeURIComponent(destination.value.trim())}&startDate=${encodeURIComponent(startDate.value)}&endDate=${encodeURIComponent(endDate.value)}&guests=${encodeURIComponent(guests.value.trim())}`;
        //Maintain input values
    });
}