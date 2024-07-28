export function renderHeader(){
    //display user dropdown menu when user icon is clicked
    document.addEventListener('DOMContentLoaded',()=>{
        const userIcon=document.querySelector('.user-icon');
        const dropdownMenu=document.querySelector('.dropdown-menu');
        userIcon.addEventListener('click',()=>{
           dropdownMenu.classList.toggle('active'); 
        });
        
        //close dropdown menu when user clicks outside of it
        document.addEventListener('click',(event)=>{
            if(!userIcon.contains(event.target)){
                dropdownMenu.classList.remove('active');
            }
        });
        
        //add calendar drop down to the date inputs
        flatpickr("#start-date", {
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                // Handle check-in date change
            }
        });
        flatpickr("#end-date", {
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                // Handle check-out date change
            }
        });

        //use Google autosuggest to search for locations
        const destInp = new google.maps.places.SearchBox(document.getElementById('search-destination'));
        
        // display login modal when login is clicked
        document.getElementById("login-modal").addEventListener('click',()=>{
            const myModal = new bootstrap.Modal(document.getElementById('loginModal'));
            myModal.show();
        });
        
        // display signup modal when signup is clicked
        document.getElementById("signup-modal").addEventListener('click',()=>{
            const myModal = new bootstrap.Modal(document.getElementById('signupModal'));
            myModal.show();
        }); 
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
}

