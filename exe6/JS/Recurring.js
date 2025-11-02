document.addEventListener('DOMContentLoaded', function ()
{
    let backButton = document.getElementById('backButton');
    let monthSelector = document.getElementById('monthSelector');
    let transactionList = document.getElementById('transactionList');

    // Back to Dashboard button functionality
    backButton.addEventListener('click', function ()
    {
        window.location.href = 'Dashboard.html';
    });

    // Populate month options dynamically
    function populateMonths() {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();

        while (year >= 2024) {
            for (let i = month; i >= 0; i--) {
                let option = document.createElement('option');
                option.value = year + '-' + String(i + 1).padStart(2, '0'); // Format the month as YYYY-MM
                option.textContent = months[i] + ' ' + year;
                monthSelector.appendChild(option);
            }
            year--;
            month = 11;
        }
    }

    populateMonths();

    monthSelector.addEventListener('change', function () {
        let selectedMonth = monthSelector.value;
        updateTransactionsTable(selectedMonth);
    });

    // Function to update transactions table based on selected month for the current user
    function updateTransactionsTable(month)
    {
        let listOfUsers = JSON.parse(localStorage.getItem('listOfUsers')) || [];
        let currentUserEmail = localStorage.getItem('currentUser');

        // Find the current user's data
        let currentUser = null;
        for (let i = 0; i < listOfUsers.length; i++) {
            if (listOfUsers[i].email === currentUserEmail) {
                currentUser = listOfUsers[i];
                break;
            }
        }

        if (!currentUser || !currentUser.transactions) {
            console.error('No transactions found for the current user.');
            transactionList.innerHTML = '<tr><td colspan="5">No transactions found for this month</td></tr>';
            return;
        }

        let transactionSummary = {};

        for (let i = 0; i < currentUser.transactions.length; i++)
        {
            let transaction = currentUser.transactions[i];

            // Adjusted date parsing to handle the format YYYY-MM-DD
            let dateParts = transaction.date.split('-');
            let year = dateParts[0];
            let monthFromDate = dateParts[1];
            let day = dateParts[2];

            console.log('Transaction Date:', transaction.date, 'Parsed:', year + '-' + monthFromDate + '-' + day);

            // Ensure date format is properly compared to the selected month
            if (year + '-' + String(monthFromDate).padStart(2, '0') === month)
            {
                let business = transaction.business;
                let amount = transaction.amount;

                if (!transactionSummary[business])
                {
                    transactionSummary[business] =
                    {
                        category: transaction.category,
                        purchases: 0,
                        totalSpending: 0
                    };
                }

                transactionSummary[business].purchases += 1;
                transactionSummary[business].totalSpending += amount;
            }
        }

        console.log('Transaction Summary:', transactionSummary);

        // Clear previous rows in the table
        transactionList.innerHTML = '';

        let summaryKeys = [];
        for (let key in transactionSummary)
        {
            summaryKeys.push(key);
        }

        if (summaryKeys.length === 0)
        {
            let row = document.createElement('tr');
            row.innerHTML = '<td colspan="5">No transactions found for this month</td>';
            transactionList.appendChild(row);
        }

        // Add rows to the table based on the summary data
        for (let i = 0; i < summaryKeys.length; i++)
        {
            let business = summaryKeys[i];
            let data = transactionSummary[business];
            let average = (data.totalSpending / data.purchases).toFixed(2);

            let row = document.createElement('tr');
            row.innerHTML =
                '<td>' + business + '</td>' +
                '<td>' + data.category + '</td>' +
                '<td>' + data.purchases + '</td>' +
                '<td>' + data.totalSpending.toFixed(2) + '$</td>' +
                '<td>' + average + '$</td>';
            transactionList.appendChild(row);
        }
    }

    // Initialize the table with the current month for the current user
    let today = new Date();
    let currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    monthSelector.value = currentMonth;
    updateTransactionsTable(currentMonth);
});