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
});

// display login modal when login is clicked
document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById("login-modal").addEventListener('click', displayLoginModal); 
});

//add calendar drop down
document.addEventListener('DOMContentLoaded', function() {
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
});

//highlight the focused input by changing background color
const midSection=document.querySelector('.website-header-middle-section');
document.querySelectorAll('.search-input').forEach((input)=>{
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

// functions
function displayLoginModal() {
    const myModal = new bootstrap.Modal(document.getElementById('loginModal'));
    myModal.show();
}