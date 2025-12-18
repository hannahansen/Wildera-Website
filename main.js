function toggleMenu() {
    var menu = document.querySelector('.menu');
    menu.classList.toggle('show');
}

document.querySelector('.menu-button').addEventListener('click', toggleMenu);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function changeImageSource() {
    const video = document.querySelector('.main-banner video');
    if (video) {  // Check if the element exists
        if (window.matchMedia("(max-width: 768px)").matches) {
            video.src = 'images/Sequence 01_1_small.mp4';
        } else {
            video.src = 'images/Sequence 01_1.mp4';
        }
    }
}


// Initialize EmailJS
(function(){
    emailjs.init("ST_aM3HmS9Oq1D3Hf");  // Use your Public Key here
})();

// Function to format the phone number as 000-000-0000
function formatPhoneNumber(value) {
    // Remove all non-digit characters
    value = value.replace(/\D/g, "");

    // Format phone number in the form of 000-000-0000
    if (value.length > 3 && value.length <= 6) {
        return value.slice(0, 3) + "-" + value.slice(3);
    } else if (value.length > 6) {
        return value.slice(0, 3) + "-" + value.slice(3, 6) + "-" + value.slice(6, 10);
    }
    return value;
}

// Add an event listener for form submission
document.getElementById('inquiry-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const phoneInput = document.querySelector("input[name='phone']");
    const formattedPhone = formatPhoneNumber(phoneInput.value);

    // Validate phone number format
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(formattedPhone)) {
        displayMessage("Invalid phone number. Please enter the number in the format 000-000-0000.", "error");
        return;
    }

    // Update phone input field with the formatted value
    phoneInput.value = formattedPhone;

    // Send email via EmailJS
    emailjs.sendForm('hannahansenphotography', 'template_k7a4rl5', this)
        .then(function() {
            displayMessage("Your inquiry has been sent successfully!", "success");
            document.getElementById('inquiry-form').reset(); // Reset the form
        }, function(error) {
            displayMessage('Failed to send inquiry: ' + JSON.stringify(error), "error");
        });
});

// Display message function (for success and error messages)
function displayMessage(message, type) {
    const formMessage = document.getElementById('inquiry-message');
    formMessage.style.display = 'block'; // Show the message

    // Change the color based on message type
    if (type === "success") {
        formMessage.style.color = 'green';
    } else if (type === "error") {
        formMessage.style.color = 'red';
    }

    // Set the message text
    formMessage.textContent = message;

    // Hide the message after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Automatically format phone number as the user types
document.querySelector("input[name='phone']").addEventListener('input', function(event) {
    const formattedPhone = formatPhoneNumber(event.target.value);
    event.target.value = formattedPhone;
});

changeImageSource();
window.addEventListener('resize', changeImageSource);
