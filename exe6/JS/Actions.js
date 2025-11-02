document.getElementById('loadTransactions').addEventListener('click', function ()
{
    let fileInput = document.getElementById('csvFile');  // Reference to file input element
    let file = fileInput.files[0];  // Access the uploaded file
    let loadStatus = document.getElementById('loadStatus');  // Element to display loading status

    // Check if file is selected
    if (!file)
    {
        alert('Please select a file first.');  // Prompt user to select a file
        return;
    }

    let reader = new FileReader();  // Create a FileReader to read the file contents
    reader.onload = function (e)
    {
        let csvData = e.target.result;  // Get the file contents as text
        let rows = csvData.split('\n').slice(1);  // Split rows and ignore the header
        let transactions = rows.map(function (row)
        {
            let fields = row.split(',');  // Split columns by comma
            let date = fields[0].trim();  // Extract and trim date
            let business = fields[1].trim();  // Extract and trim business name
            let category = fields[2].trim();  // Extract and trim category
            let amount = parseFloat(fields[3].trim());  // Extract and parse the amount
            let [day, month, year] = date.split('/');  // Reformat date from DD/MM/YYYY to YYYY-MM-DD
            let formattedDate = `${year}-${month}-${day}`;
            return { date: formattedDate, business: business, category: category, amount: amount };  // Return formatted transaction object
        });

        let users = JSON.parse(localStorage.getItem('listOfUsers')) || [];  // Retrieve user data from localStorage
        let currentUserEmail = localStorage.getItem('currentUser');  // Get current user's email from localStorage
        let currentUser = undefined;

        // Find current user in the list of users
        for (let i = 0; i < users.length; i++)
        {
            if (users[i].email === currentUserEmail)
            {
                currentUser = users[i];
                break;
            }
        }

        if (currentUser)
        {
            if (!currentUser.transactions)
            {
                currentUser.transactions = [];  // Ensure transactions array exists
            }
            currentUser.transactions = currentUser.transactions.concat(transactions);  // Add new transactions
            localStorage.setItem('listOfUsers', JSON.stringify(users));  // Save updated user data to localStorage
            updateChargeData(currentUser.email);  // Update charge data for the user
            loadStatus.textContent = 'Transactions loaded successfully!';  // Display success message
            loadStatus.style.color = 'green';  // Set success message color
        }
        else
        {
            loadStatus.textContent = 'No users were found!';  // Display error message if user is not found
            loadStatus.style.color = 'red';  // Set error message color
        }
    };

    reader.readAsText(file);  // Read the file content as text
    setTimeout(() =>
    {
        window.location.href = 'Dashboard.html';  // Redirect to Dashboard after 2 seconds
    }, 2000);

    function updateChargeData(email)
    {
        let listOfUsers = JSON.parse(localStorage.getItem('listOfUsers')) || [];  // Retrieve user data
        let currentUser = null;

        // Find the current user
        for (let i = 0; i < listOfUsers.length; i++)
        {
            if (listOfUsers[i].email === email)
            {
                currentUser = listOfUsers[i];
                break;
            }
        }
        if (!currentUser || !currentUser.transactions)
        {
            return;
        }
        if (!currentUser.spending)
        {
            currentUser.spending = {};  // Ensure spending object exists
        }

        let categories = ['Food & Beverage', 'Retail & Shopping', 'Home & Personal Care', 'Travel & Transportation', 'Entertainment & Subscriptions'];

        // Reset spending amounts before calculating
        for (let i = 0; i < categories.length; i++)
        {
            currentUser.spending[categories[i]] = 0;
        }

        // Calculate total spending by category
        for (let i = 0; i < currentUser.transactions.length; i++)
        {
            let transaction = currentUser.transactions[i];
            let category = transaction.category;
            if (currentUser.spending[category] !== undefined) {
                currentUser.spending[category] += transaction.amount;
            }
            else
            {
                currentUser.spending[category] = transaction.amount;
            }
        }

        let chargeData = JSON.parse(localStorage.getItem('chargeData')) || {};  // Retrieve charge data
        let now = new Date();
        let currentMonth = now.getMonth();
        let currentYear = now.getFullYear();

        let previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        let previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        function parseTransactionDate(dateStr)
        {
            let parts = dateStr.split('-');  // Date format is YYYY-MM-DD
            if (parts.length !== 3)
            {
                return null;
            }
            return new Date(parts[0], parts[1] - 1, parts[2]);  // Convert to Date object
        }

        let previousMonthCharge = 0;
        let upcomingCharge = 0;

        // Calculate charges for previous and current month
        for (let i = 0; i < currentUser.transactions.length; i++)
        {
            let transactionDate = parseTransactionDate(currentUser.transactions[i].date);
            if (transactionDate && transactionDate.getMonth() === previousMonth && transactionDate.getFullYear() === previousMonthYear)
            {
                previousMonthCharge += currentUser.transactions[i].amount;
            }
            if (transactionDate && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear)
            {
                upcomingCharge += currentUser.transactions[i].amount;
            }
        }

        // Update charge data for the current user
        chargeData[email] = { previousMonthCharge: previousMonthCharge, upcomingCharge: upcomingCharge };
        localStorage.setItem('chargeData', JSON.stringify(chargeData));  // Save updated charge data

        // Update user in the list
        for (let i = 0; i < listOfUsers.length; i++)
        {
            if (listOfUsers[i].email === email)
            {
                listOfUsers[i] = currentUser;
                break;
            }
        }
        localStorage.setItem('listOfUsers', JSON.stringify(listOfUsers));  // Save updated user list
    }
});

// Back button to return to the Dashboard
let backButton = document.getElementById('backButton');
backButton.addEventListener('click', function ()
{
    window.location.href = 'Dashboard.html';
});