document.addEventListener('DOMContentLoaded', () => {
  const customersTable = document.getElementById('customers-body');
  const filterInput = document.getElementById('filter-input');
  const transactionChartCtx = document.getElementById('transaction-chart').getContext('2d');

  let transactionsData = [];
  let customersData = [];
  let transactionChart;

  const fetchData = async () => {
    try {
      const [transactionsRes, customersRes] = await Promise.all([
        axios.get('https://my-json-server.typicode.com/Hazemsief/TransactionDataCustomers/transactions'),
        axios.get('https://my-json-server.typicode.com/Hazemsief/TransactionDataCustomers/customers')
      ]);
      transactionsData = transactionsRes.data;
      customersData = customersRes.data;
      renderTable(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderTable = (data) => {
    customersTable.innerHTML = '';
    data.forEach(transaction => {
      const customer = customersData.find(c => c.id === transaction.customer_id) || { name: 'Unknown' };
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${transaction.customer_id}</td>
        <td>${customer.name}</td>
        <td>${transaction.date}</td>
        <td>${transaction.amount}</td>
      `;
      customersTable.appendChild(row);
    });
  };

  const filterTable = () => {
    const filterText = filterInput.value.toLowerCase();
    const filteredData = transactionsData.filter(transaction => {
      const customer = customersData.find(c => c.id === transaction.customer_id) || { name: 'Unknown' };
      return (
        customer.name.toLowerCase().includes(filterText) ||
        transaction.amount.toString().includes(filterText)
      );
    });
    renderTable(filteredData);
  };

  const getTransactionDataByCustomer = (customerId) => transactionsData.filter(transaction => transaction.customer_id === customerId);

  const renderChart = (customerId) => {
    const customerTransactions = getTransactionDataByCustomer(customerId);
    const labels = [...new Set(customerTransactions.map(transaction => transaction.date))];
    const data = labels.map(label => {
      return customerTransactions
        .filter(transaction => transaction.date === label)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    if (transactionChart) {
      transactionChart.destroy();
    }

    transactionChart = new Chart(transactionChartCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Transaction Amount',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  filterInput.addEventListener('input', filterTable);

  customersTable.addEventListener('click', event => {
    const row = event.target.closest('tr');
    if (row) {
      const customerId = parseInt(row.children[0].textContent, 10);
      renderChart(customerId);
    }
  });

  fetchData();
});
