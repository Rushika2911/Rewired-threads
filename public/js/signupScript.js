document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Optional: Add validation or checkbox check here

    try {
        const response = await fetch('http://localhost:5000/api/signup', { // Replace with your actual API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Signup successful!');
            // Redirect or clear form here
        } else {
            alert(`Signup failed: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
});
