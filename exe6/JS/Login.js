document.addEventListener('DOMContentLoaded', function ()
{
    const showPasswordCheckbox = document.getElementById('showPassword');
    const passwordField = document.getElementById('loginPassword');

    // Toggle password visibility when the checkbox is checked/unchecked
    showPasswordCheckbox.addEventListener('change', function ()
    {
        passwordField.type = this.checked ? 'text' : 'password';  // Show password as plain text if checked, otherwise keep it hidden
    });
});

function handleLogin(event)
{
    event.preventDefault();  // Prevent the default form submission behavior

    const email = document.getElementById('loginEmail').value.trim();  // Get the entered email and remove any surrounding whitespace
    const password = document.getElementById('loginPassword').value.trim();  // Get the entered password and remove any surrounding whitespace
    const messageDiv = document.getElementById('message');  // Element to display login error messages

    const users = JSON.parse(localStorage.getItem('listOfUsers')) || [];  // Retrieve list of users from localStorage, or an empty array if not found
    let isExists = false;  // Flag to check if the user exists

    // Iterate over the list of users to find a match
    for (let i = 0; i < users.length; i++)
    {
        if (users[i].email === email && users[i].password === password)
        {
            isExists = true;  // Set flag to true if user is found
            localStorage.setItem('currentUser', email);  // Save the current user's email in localStorage
            break;  // Exit the loop once a match is found
        }
    }

    if (isExists)
    {
        window.location.href = 'Dashboard.html';  // Redirect to Dashboard if login is successful
    }
    else
    {
        messageDiv.textContent = 'Email or password is incorrect.';  // Display an error message
        messageDiv.style.color = 'red';  // Style the error message in red
    }
}