document.addEventListener('DOMContentLoaded', function ()
{
    // Variables for accessing HTML elements and chart contexts
    let monthSelect = document.getElementById('month');  // Dropdown for selecting the month
    let totalCharge = document.getElementById('totalCharge');  // Element displaying total charge
    let transactionList = document.getElementById('transactionList');  // Table displaying transactions

    // Chart contexts
    let barChartCtx = document.getElementById('barChart').getContext('2d');
    let pieChartCtx = document.getElementById('pieChart').getContext('2d');
    let barChart, pieChart;

    // Get current user details
    let currentUser = getCurrentUser();
    if (!currentUser)
    {
        alert('No user found. Please log in again.');  // Redirect if user is not logged in
        window.location.href = 'Login.html';
        return;
    }

    // Set the default selected month to the current month
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    monthSelect.value = year + '-' + (month < 10 ? '0' + month : month);

    // Populate the month dropdown with available months
    populateMonths();

    // Update display when a new month is selected
    monthSelect.addEventListener('change', function ()
    {
        let selectedMonth = monthSelect.value;
        updateDisplay(selectedMonth);
    });

    // Populate the month dropdown with options from the current date back to January 2024
    function populateMonths()
    {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();
        while (year >= 2024)
        {
            for (let i = month; i >= 0; i--)
            {
                let option = document.createElement('option');
                option.value = year + '-' + ((i + 1) < 10 ? '0' + (i + 1) : (i + 1));
                option.textContent = months[i] + ' ' + year;
                monthSelect.appendChild(option);
            }
            year--;
            month = 11;
        }
    }

    // Update the total charge, transaction list, and charts for the selected month
    function updateDisplay(selectedMonth)
    {
        totalCharge.textContent = 'Total Charge:' + calculateTotalCharge(selectedMonth).toFixed(2) +'$';
        displayTransactions(selectedMonth);
        updateCharts(selectedMonth);
    }

    // Calculate the total charge for a specific month
    function calculateTotalCharge(month)
    {
        if (!currentUser || !currentUser.transactions)
        {
            return 0;
        }

        let sum = 0;
        for (let i = 0; i < currentUser.transactions.length; i++)
        {
            if (currentUser.transactions[i].date.indexOf(month) === 0)
            {
                sum += currentUser.transactions[i].amount;
            }
        }
        return sum;
    }

    // Display all transactions for the selected month
    function displayTransactions(month)
    {
        transactionList.innerHTML = '';  // Clear the table
        for (let i = 0; i < currentUser.transactions.length; i++)
        {
            if (currentUser.transactions[i].date.indexOf(month) === 0)
            {
                let row = document.createElement('tr');
                row.innerHTML = '<td>' + currentUser.transactions[i].date + '</td><td>' + currentUser.transactions[i].business + '</td><td>' + currentUser.transactions[i].category + '</td><td>' + currentUser.transactions[i].amount.toFixed(2) + '$</td>';
                transactionList.appendChild(row);
            }
        }
    }

    // Update the bar and pie charts to show expenditures
    function updateCharts(month)
    {
        let categories = ['Food & Beverage', 'Retail & Shopping', 'Home & Personal Care', 'Travel & Transportation', 'Entertainment & Subscriptions'];
        let expendituresByCategory = [];

        // Calculate expenditures for each category in the selected month
        for (let i = 0; i < categories.length; i++)
        {
            expendituresByCategory[i] = 0;
            for (let j = 0; j < currentUser.transactions.length; j++) {
                if (currentUser.transactions[j].category === categories[i] && currentUser.transactions[j].date.indexOf(month) === 0)
                {
                    expendituresByCategory[i] += currentUser.transactions[j].amount;
                }
            }
        }

        // Get total expenditures for the two previous months
        let previousMonths = [getMonthKey(new Date(month + '-01'), -1), getMonthKey(new Date(month + '-01'), -2)];
        let monthlyExpenditures = [];
        for (let k = 0; k < previousMonths.length; k++)
        {
            let sum = 0;
            for (let i = 0; i < currentUser.transactions.length; i++)
            {
                if (currentUser.transactions[i].date.indexOf(previousMonths[k]) === 0)
                {
                    sum += currentUser.transactions[i].amount;
                }
            }
            monthlyExpenditures.push(sum);
        }

        // Bar chart showing monthly expenditures
        if (barChart)
        {
            barChart.destroy();
        }
        barChart = new Chart(barChartCtx,
        {
            type: 'bar',
            data:
            {
                labels: ['Current Month', 'Previous Month', 'Two Months Ago'],
                datasets: [{ label: 'Monthly Expenditure', data: [calculateTotalCharge(month)].concat(monthlyExpenditures), backgroundColor: ['#007bff', '#28a745', '#dc3545'], borderColor: ['#0056b3', '#218838', '#c82333'], borderWidth: 1 }]
            },
            options:
            {
                responsive: true,
                plugins:
                {
                    legend: { display: false },
                    tooltip:
                    {
                        callbacks:
                        {
                            label: function (tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '$';
                            }
                        }
                    }
                },
                scales: { y: { beginAtZero: true } }
            }
        });

        // Doughnut chart showing expenditures by category
        if (pieChart)
        {
            pieChart.destroy();
        }
        pieChart = new Chart(pieChartCtx,
        {
            type: 'doughnut',
            data:
            {
                labels: categories,
                datasets: [{ label: 'Expenditure by Category', data: expendituresByCategory, backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'], borderColor: '#fff', borderWidth: 1 }]
            },
            options:
            {
                responsive: true,
                plugins:
                {
                    legend: { position: 'bottom' },
                    tooltip:
                    {
                        callbacks:
                        {
                            label: function (tooltipItem)
                            {
                                return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) +'$';
                            }
                        }
                    }
                },
                cutout: '75%'
            },
            plugins:
            [{
                id: 'centerText',beforeDraw(chart)
                {
                    let ctx = chart.ctx;
                    let chartArea = chart.chartArea;
                    let width = chartArea.right - chartArea.left;
                    let height = chartArea.bottom - chartArea.top;

                    ctx.save();
                    let fontSize = Math.min(width, height) / 16;
                    ctx.font = fontSize.toFixed(2) + "px Arial";
                    ctx.fillStyle = '#007bff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText("Expenditure by Category", (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2);
                    ctx.restore();
                }
            }]
        });
    }

    // Get a date key (YYYY-MM) offset by a specified number of months
    function getMonthKey(date, offset)
    {
        let newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + offset);
        let year = newDate.getFullYear();
        let month = newDate.getMonth() + 1;
        return year + '-' + (month < 10 ? '0' + month : month);
    }

    // Initial display update using the current month
    updateDisplay(monthSelect.value);

    // Go back to the dashboard when the back button is clicked
    document.getElementById('backButton').addEventListener('click', function ()
    {
        window.location.href = 'Dashboard.html';
    });
});

// Retrieve the current user from localStorage
function getCurrentUser()
{
    let users = JSON.parse(localStorage.getItem('listOfUsers')) || [];
    let currentUserEmail = localStorage.getItem('currentUser');
    for (let i = 0; i < users.length; i++)
    {
        if (users[i].email === currentUserEmail)
        {
            if (!users[i].transactions)
            {
                users[i].transactions = [];  // Ensure transactions is an array
            }
            return users[i];
        }
    }
    return null;
}