document.addEventListener('DOMContentLoaded', function ()
{
    // Get the elements from the DOM to display user information and charge data
    const welcomeMessage = document.getElementById('welcomeMessage');
    const previousCharge = document.getElementById('previousCharge');
    const upcomingCharge = document.getElementById('upcomingCharge');
    const recommendationsDiv = document.getElementById('recommendations');
    // Get the current user from local storage
    const currentUser = getCurrentUser();

    // If no user is found, alert and redirect to login page
    if (!currentUser)
    {
        alert('No user found. Please log in again.');
        window.location.href = 'Login.html';
        return;
    }

    // Get the current date and time
    const now = new Date();
    const date = now.toLocaleDateString(); // Formats the current date
    const time = now.toLocaleTimeString(); // Formats the current time

    // Display welcome message and current date/time
    welcomeMessage.innerHTML = `
        <p>Welcome, ${currentUser.email}!</p>
        <p>Today's date: ${date}</p>
        <p>Current time: ${time}</p>
    `;

    // Get the charge data for the current user
    const chargeData = getChargeData(currentUser.email);
    let previousChargeValue = 0;
    let upcomingChargeValue = 0;

    // If charge data exists, set the previous and upcoming charge values
    if (chargeData)
    {
        if (chargeData.previousMonthCharge != null)
        {
            previousChargeValue = chargeData.previousMonthCharge;
        }
        if (chargeData.upcomingCharge != null)
        {
            upcomingChargeValue = chargeData.upcomingCharge;
        }
    }

    // Display the charge values
    previousCharge.textContent = `${previousChargeValue}$`;
    upcomingCharge.textContent = `${upcomingChargeValue}$`;

    // Check birthday coupon status
    checkBirthdayCoupon();

    document.getElementById('fetchRecommendations').addEventListener('click', function () {

        if (currentUser.transactions && currentUser.transactions.length > 0)
        {
            fetchRecommendations(currentUser.transactions, recommendationsDiv); // Pass recommendationsDiv explicitly
        }
        else
        {
            recommendationsDiv.innerHTML = '<p>No transactions found to generate recommendations.</p>';
        }
    });
});

function fetchRecommendations(transactions, recommendationsDiv) {
    const url = 'https://yael-ex-expenses-services-299199094731.me-west1.run.app/get-recommendations?lang=en&apiKay=afGre4Eerf223432AXE';
    recommendationsDiv.innerHTML = '<p>Loading recommendations...</p>'; // Show a loading message
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            displayRecommendations(data, recommendationsDiv); // Pass recommendationsDiv to displayRecommendations
        })
        .catch((error) => {
            recommendationsDiv.innerHTML = '<p>Error fetching recommendations. Please try again later.</p>';
        });
}


function displayRecommendations(data, recommendationsDiv)
{
    recommendationsDiv.innerHTML = ''; // Clear previous content

    if (data.recommendations)
    {
        recommendationsDiv.innerHTML = data.recommendations; // Display the recommendations from the API
    }
    else
    {
        recommendationsDiv.innerHTML = '<p>No recommendations available at the moment.</p>';
    }
}


// Function to get the current logged-in user from local storage
function getCurrentUser()
{
    // Retrieve list of users from local storage, or initialize an empty array if not present
    const users = JSON.parse(localStorage.getItem('listOfUsers')) || [];
    const currentUserEmail = localStorage.getItem('currentUser');

    // Loop through the users array and find the user with the matching email
    for (let i = 0; i < users.length; i++)
    {
        if (users[i].email === currentUserEmail)
        {
            return users[i]; // Return the current user
        }
    }
    return null; // Return null if user is not found
}

// Function to get the charge data for a given email
function getChargeData(email)
{
    // Retrieve charge data from local storage, or initialize an empty object if not present
    const chargeData = JSON.parse(localStorage.getItem('chargeData')) || {};
    return chargeData[email] || { previousMonthCharge: 0, upcomingCharge: 0 }; // Return the charge data for the email or default values
}

// Function to navigate to a different page (used for redirection)
function navigateTo(page)
{
    window.location.href = page + '.html'; // Redirect to the specified page
}

// Function to logout the current user
function logout()
{
    // Clear the current user data from local storage
    localStorage.removeItem('currentUser');
    window.location.href = 'Login.html'; // Redirect to login page
}

function checkBirthdayCoupon()
{
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const today = new Date();
    const dob = new Date(currentUser.dob); // User's date of birth
    const birthdayToday = today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth();

    const couponDiv = document.getElementById('birthdayCoupon');

    // If the user has already redeemed the coupon, remove the coupon div
    if (currentUser.couponRedeemed)
    {
        if (couponDiv)
        {
            couponDiv.remove(); // Completely remove the div if coupon is redeemed
        }
        return; // No need to check further if coupon is redeemed
    }

    // If it's the user's birthday and they haven't redeemed the coupon yet
    if (birthdayToday && !currentUser.couponRedeemed)
    {
        couponDiv.innerHTML = '<h2>Happy Birthday!</h2>';
        couponDiv.innerHTML += '<p>You have received a $50 credit to your card! Enjoy your reward!</p>';
        couponDiv.innerHTML += '<button id="claimCoupon">Claim Birthday Coupon</button>';
        document.getElementById('claimCoupon').addEventListener('click', function () {
            redeemBirthdayCoupon(currentUser);
        });
    }
    else
    {
        couponDiv.innerHTML = ''; // Remove the button if not eligible
    }
}

function redeemBirthdayCoupon(user)
{
    const couponAmount = 50; // Birthday coupon amount

    // Add credit transaction for the coupon
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const couponTransaction =
    {
        date: formattedDate,
        business: 'Birthday Coupon',
        category: 'Credit',
        amount: -couponAmount, // Negative amount for credit
    };

    if (!user.transactions)
    {
        user.transactions = [];
    }

    user.transactions.push(couponTransaction); // Add the coupon transaction to the user's transactions
    user.couponRedeemed = true; // Mark the coupon as redeemed

    // Update localStorage for user
    let users = JSON.parse(localStorage.getItem('listOfUsers')) || [];
    for (let i = 0; i < users.length; i++)
    {
        if (users[i].email === user.email)
        {
            users[i] = user;
            break;
        }
    }
    localStorage.setItem('listOfUsers', JSON.stringify(users));

    // Update chargeData for upcomingCharge
    let chargeData = JSON.parse(localStorage.getItem('chargeData')) || {};
    if (!chargeData[user.email])
    {
        chargeData[user.email] = { previousMonthCharge: 0, upcomingCharge: 0 };
    }
    chargeData[user.email].upcomingCharge -= couponAmount; // Subtract the coupon amount from upcomingCharge
    localStorage.setItem('chargeData', JSON.stringify(chargeData));

    alert('Birthday coupon redeemed successfully! 50₪ has been credited to your account.');

    // Remove the coupon div after redemption
    const couponDiv = document.getElementById('birthdayCoupon');
    if (couponDiv)
    {
        couponDiv.remove(); // Completely remove the div from the DOM
    }

    // Refresh the page to reflect the changes
    location.reload();
}