document.addEventListener('DOMContentLoaded', function ()
{
    let backButton = document.getElementById('backButton');
    let budgetForm = document.getElementById('budgetForm');
    let saveButton = document.getElementById('saveButton');
    let editButton = document.getElementById('editButton');
    let summaryContent = document.getElementById('summaryContent');

    let categories = ['Food & Beverage', 'Retail & Shopping', 'Home & Personal Care', 'Travel & Transportation', 'Entertainment & Subscriptions'];

    let listOfUsers = JSON.parse(localStorage.getItem('listOfUsers')) || [];
    let currentUserEmail = localStorage.getItem('currentUser');
    let user = null;

    for (let i = 0; i < listOfUsers.length; i++) {
        if (listOfUsers[i].email === currentUserEmail) {
            user = listOfUsers[i];
            break;
        }
    }

    if (!user) {
        console.error('User not found');
        return;
    }

    if (!user.budget)
    {
        user.budget = {};
    }
    if (!user.spending)
    {
        user.spending = {};
    }

    let budgets = user.budget;
    let spending = user.spending;

    // Get current month and year
    let now = new Date();
    let currentMonth = now.getMonth() + 1;
    let currentYear = now.getFullYear();

    // Function to filter transactions for the current month
    function getCurrentMonthTransactions(transactions)
    {
        let filteredTransactions = [];
        for (let i = 0; i < transactions.length; i++)
        {
            let dateParts = transactions[i].date.split('-');
            let year = parseInt(dateParts[0], 10);
            let month = parseInt(dateParts[1], 10);
            if (year === currentYear && month === currentMonth) {
                filteredTransactions.push(transactions[i]);
            }
        }
        return filteredTransactions;
    }

    // Initialize spending for the current month
    for (let i = 0; i < categories.length; i++) {
        spending[categories[i]] = 0;
    }

    // Calculate spending only for the current month
    if (user.transactions && user.transactions.length > 0)
    {
        let currentMonthTransactions = getCurrentMonthTransactions(user.transactions);
        for (let i = 0; i < currentMonthTransactions.length; i++)
        {
            let transaction = currentMonthTransactions[i];
            let category = transaction.category;
            if (spending[category] !== undefined)
            {
                spending[category] += transaction.amount;
            }
            else
            {
                spending[category] = transaction.amount;
            }
        }
    }

    // Save updated spending data to localStorage
    localStorage.setItem('listOfUsers', JSON.stringify(listOfUsers));

    console.log("Budgets:", budgets);
    console.log("Spending:", spending);

    //lock the inputs after saving
    let inputs = budgetForm ? budgetForm.getElementsByTagName('input') : [];

    for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }

    for (let i = 0; i < categories.length; i++) {
        let inputId = categories[i].replace(/\s+&\s+/g, 'And').replace(/\s+/g, '');
        let input = document.getElementById(inputId);
        if (input) {
            input.value = budgets[inputId] ? budgets[inputId] : '';
        }
    }

    editButton.addEventListener('click', function () {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
        saveButton.disabled = false;
        editButton.disabled = true;
    });

    saveButton.addEventListener('click', function ()
    {
        for (let i = 0; i < categories.length; i++)
        {
            let inputId = categories[i].replace(/\s+&\s+/g, 'And').replace(/\s+/g, '');
            let input = document.getElementById(inputId);
            if (input)
            {
                let inputValue = input.value.trim();
                if (inputValue !== '')
                {
                    budgets[categories[i]] = parseFloat(inputValue);
                }
                else
                {
                    delete budgets[categories[i]];
                }
            }
        }

        user.budget = budgets;
        let updatedListOfUsers = [];
        for (let i = 0; i < listOfUsers.length; i++) {
            if (listOfUsers[i].email === user.email) {
                updatedListOfUsers.push(user);
            } else {
                updatedListOfUsers.push(listOfUsers[i]);
            }
        }

        localStorage.setItem('listOfUsers', JSON.stringify(updatedListOfUsers));

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        saveButton.disabled = true;
        editButton.disabled = false;

        updateSummary();
    });

    backButton.addEventListener('click', function () {
        window.location.href = 'Dashboard.html';
    });

    function updateSummary() {
        summaryContent.innerHTML = '';

        let table = document.createElement('table');
        table.classList.add('summary-table');

        let headerRow = document.createElement('tr');
        headerRow.innerHTML = `  
            <th>Category</th>
            <th>Allocated</th>
            <th>Spent</th>
            <th>Remaining</th>
            <th>Exceeded</th>
        `;
        table.appendChild(headerRow);

        for (let i = 0; i < categories.length; i++)
        {
            let category = categories[i];
            let allocated = user.budget[category] ? user.budget[category] : 0;
            let spent = spending[category] ? spending[category] : 0;

            let remaining = allocated - spent;
            let exceeded = (allocated > 0 && remaining < 0) ? Math.abs(remaining) : 0;

            let categoryRow = document.createElement('tr');
            categoryRow.innerHTML = `  
                <td>${category}</td>
                <td>${allocated ? allocated.toFixed(2)+'$' : '-'}</td>
                <td>${spent.toFixed(2)}$</td>
                <td>${remaining >= 0 ? remaining.toFixed(2) +'$' : '0.00$'}</td>
                <td>${exceeded.toFixed(2)}$</td>
            `;
            table.appendChild(categoryRow);
        }

        summaryContent.appendChild(table);
    }

    updateSummary();
});