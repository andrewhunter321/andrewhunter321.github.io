document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var formData = new FormData(this);

    // We can trust formsprees spam filtering from misuse
    fetch('https://formspree.io/f/mwpedana', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(function(response) {
        if (response.ok) {
            document.getElementById('popupMessage').style.display = 'block';

            document.getElementById('contactForm').reset();
        } else {
            alert('Something went wrong. Please try again.');
        }
    }).catch(function(error) {
        alert('Error submitting the form.');
    });
});
