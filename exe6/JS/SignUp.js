function handleSignup(event)
{
    event.preventDefault();  // Prevent the default form submission behavior

    const email = document.getElementById('signupEmail').value.trim();  // Get the entered email and trim any whitespace
    const password = document.getElementById('signupPassword').value.trim();  // Get the entered password and trim any whitespace
    const dob = document.getElementById('dob').value.trim();  // Get the date of birth and trim any whitespace
    const ccn = document.getElementById('ccn').value.trim();  // Get the credit card number and trim any whitespace
    const cce = document.getElementById('cce').value.trim();  // Get the credit card expiry and trim any whitespace

    const errorMessageElement = document.getElementById('errorMessage');  // Element to display error messages
    const successMessageElement = document.getElementById('message');  // Element to display success message

    let isValid = true;  // Flag to track if the input is valid
    let errorMessage = "";  // Variable to store error messages

    // Reset messages
    errorMessageElement.textContent = '';
    errorMessageElement.style.display = 'none';
    successMessageElement.textContent = '';
    successMessageElement.style.display = 'none';

    // Fetch existing users from localStorage
    let users = JSON.parse(localStorage.getItem('listOfUsers')) || [];

    // Check if email already exists in the user list
    for (let i = 0; i < users.length; i++)
    {
        if (users[i].email === email)
        {
            errorMessage += "This email is already registered.<br>";  // Error if email is already in use
            isValid = false;
            break;
        }
    }

    // Validate email format using regular expression
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(email))
    {
        errorMessage += "Invalid email format.<br>";  // Error if email is not in a valid format
        isValid = false;
    }

    // Validate password complexity using regular expression
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=[^!@#$%^&*()]*[!@#$%^&*()][^!@#$%^&*()]*$).{8,}$/;
    if (!passwordRegex.test(password))
    {
        errorMessage += "Password must be exactly 8 characters long, include at least one uppercase letter, one lowercase letter, one digit, and exactly one special character.<br>";
        isValid = false;
    }

    // Validate minimum age requirement (16 years)
    const minAge = 16;
    const dobDate = new Date(dob);  // Convert date of birth to Date object
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate()))
    {
        age--;  // Adjust age if birth month/day has not occurred this year
    }
    if (isNaN(dobDate) || age < minAge)
    {
        errorMessage += "You must be at least 16 years old.<br>";
        isValid = false;
    }

    // Validate credit card number format (xxxx-xxxx-xxxx-xxxx)
    const ccnRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!ccnRegex.test(ccn))
    {
        errorMessage += "Credit card number must be in the format xxxx-xxxx-xxxx-xxxx.<br>";
        isValid = false;
    }

    // Validate credit card expiry format (mm/yy) and check if it is a future date
    const cceRegex = /^\d{2}\/\d{2}$/;
    const splitParts = cce.split('/');
    let expiryMonth = Number(splitParts[0]);
    let expiryYear = Number(splitParts[1]);
    if (!cceRegex.test(cce) || isNaN(expiryMonth) || isNaN(expiryYear))
    {
        errorMessage += "Credit card expiry must be in the format mm/yy.<br>";
        isValid = false;
    }
    else
    {
        const currentYear = today.getFullYear() % 100;  // Get last two digits of the current year
        const currentMonth = today.getMonth() + 1;  // Get the current month
        if (expiryMonth < 1 || expiryMonth > 12 || (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth <= currentMonth)))
        {
            errorMessage += "Credit card expiry must be a valid future date.<br>";
            isValid = false;
        }
    }

    if (!isValid)
    {
        errorMessageElement.innerHTML = errorMessage;  // Display all collected error messages
        errorMessageElement.style.display = 'block';
        return;  // Stop further execution if validation failed
    }

    // Save user details to localStorage
    users.push({ email, password, dob, ccn, cce });
    localStorage.setItem('listOfUsers', JSON.stringify(users));
    successMessageElement.innerHTML = '<span>Registration successful!</span>';  // Display success message
    successMessageElement.style.display = 'block';

    setTimeout(() =>
    {
        window.location.href = 'Login.html';  // Redirect to login page after 2 seconds
    }, 2000);
}