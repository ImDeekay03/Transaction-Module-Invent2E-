document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables for DOM elements
    const filterOptions = document.querySelectorAll('.filter-option');
    const resetFiltersButton = document.getElementById('resetFilters');
    const searchInput = document.querySelector('.search-input');
    const addNewOrderButton = document.getElementById('addNewOrder');
    const orderList = document.getElementById('orderList');
    const orderCards = document.querySelectorAll('.order-card');
    const dropdowns = document.querySelectorAll('.dropdown');
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const rangeInputs = document.querySelectorAll('.range-inputs input');

    // Filter options click event
    filterOptions.forEach(option => {
        option.addEventListener('click', function () {
            const parentSection = this.closest('.filter-section');
            parentSection.querySelectorAll('.filter-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            filterOrders();
        });
    });

    // Dropdown functionality
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.nextElementSibling;
            if (content && content.classList.contains('dropdown-content')) {
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-content.show').forEach(d => {
                    if (d !== content) d.classList.remove('show');
                });
                content.classList.toggle('show');
            }
        });

        // Handle dropdown item selection
        const content = dropdown.nextElementSibling;
        if (content && content.classList.contains('dropdown-content')) {
            content.querySelectorAll('a').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const selectedValue = this.textContent.trim();
                    dropdown.textContent = selectedValue;
                    content.classList.remove('show');
                    filterOrders();
                });
            });
        }
    });

    // Date range functionality
    dateInputs.forEach(input => {
        input.addEventListener('change', function() {
            filterOrders();
        });
    });

    // Range inputs functionality
    rangeInputs.forEach(input => {
        input.addEventListener('input', debounce(function() {
            filterOrders();
        }, 300));
    });

    // Function to filter orders
    function filterOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeStatus = document.querySelector('.filter-option.active')?.textContent.split(' ')[0].toLowerCase();
        const selectedSource = document.querySelector('.dropdown[data-type="source"]')?.textContent.trim();
        const selectedLocation = document.querySelector('.dropdown[data-type="location"]')?.textContent.trim();
        const minValue = document.querySelector('input[data-type="min"]')?.value;
        const maxValue = document.querySelector('input[data-type="max"]')?.value;
        const orderDateFrom = document.querySelector('input[data-type="orderDateFrom"]')?.value;
        const orderDateTo = document.querySelector('input[data-type="orderDateTo"]')?.value;

        // If no filters are active, show all orders
        if (!searchTerm && !activeStatus && 
            (!selectedSource || selectedSource === 'Select Order Source') && 
            (!selectedLocation || selectedLocation === 'Select Location') && 
            !minValue && !maxValue && !orderDateFrom && !orderDateTo) {
            orderCards.forEach(card => {
                card.style.display = 'block';
            });
            updateOrderCounts();
            return;
        }

        orderCards.forEach(card => {
            const orderId = card.dataset.orderId.toLowerCase();
            const orderDesc = card.querySelector('.order-description').textContent.toLowerCase();
            const orderStatus = card.querySelector('.order-status')?.textContent.toLowerCase() || '';
            const orderSource = card.dataset.source?.toLowerCase();
            const orderLocation = card.dataset.location?.toLowerCase();
            const orderValue = parseFloat(card.dataset.value || '0');
            const orderDate = new Date(card.dataset.orderDate);

            let show = true;

            // Search filter
            if (searchTerm && !orderId.includes(searchTerm) && !orderDesc.includes(searchTerm)) {
                show = false;
            }

            // Status filter
            if (activeStatus && activeStatus !== 'all' && !orderStatus.includes(activeStatus)) {
                show = false;
            }

            // Source filter
            if (selectedSource && selectedSource !== 'Select Order Source' && orderSource !== selectedSource.toLowerCase()) {
                show = false;
            }

            // Location filter
            if (selectedLocation && selectedLocation !== 'Select Location' && orderLocation !== selectedLocation.toLowerCase()) {
                show = false;
            }

            // Value range filter
            if (minValue && orderValue < parseFloat(minValue)) {
                show = false;
            }
            if (maxValue && orderValue > parseFloat(maxValue)) {
                show = false;
            }

            // Date range filter
            if (orderDateFrom) {
                const fromDate = new Date(orderDateFrom);
                if (orderDate < fromDate) {
                    show = false;
                }
            }
            if (orderDateTo) {
                const toDate = new Date(orderDateTo);
                toDate.setHours(23, 59, 59, 999); // End of the day
                if (orderDate > toDate) {
                    show = false;
                }
            }

            card.style.display = show ? 'block' : 'none';
        });

        updateOrderCounts();
    }

    // Function to update order counts in filter badges
    function updateOrderCounts() {
        const statuses = ['all', 'quote', 'sample', 'shipment', 'fulfilled'];
        statuses.forEach(status => {
            const count = Array.from(orderCards).filter(card => {
                if (status === 'all') return card.style.display !== 'none';
                const orderStatus = card.querySelector('.order-status')?.textContent.toLowerCase() || '';
                return card.style.display !== 'none' && orderStatus.includes(status);
            }).length;
            const badge = document.querySelector(`.filter-option[data-status="${status}"] .badge`);
            if (badge) badge.textContent = count;
        });
    }

    // Reset filters button click event
    resetFiltersButton.addEventListener('click', function () {
        // Reset filter options
        filterOptions.forEach(option => {
            option.classList.remove('active');
        });
        // Set "All" as active
        const allOption = document.querySelector('.filter-option:first-child');
        if (allOption) {
            allOption.classList.add('active');
        }

        // Reset dropdowns
        dropdowns.forEach(dropdown => {
            const placeholder = dropdown.getAttribute('data-placeholder') || 'Select...';
            dropdown.textContent = placeholder;
        });

        // Reset range inputs
        rangeInputs.forEach(input => {
            input.value = '';
        });

        // Reset date inputs
        dateInputs.forEach(input => {
            input.value = '';
        });

        // Reset search input
        if (searchInput) {
            searchInput.value = '';
        }

        // Close any open dropdowns
        document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });

        // Show all order cards
        orderCards.forEach(card => {
            card.style.display = 'block';
        });

        // Update order counts
        updateOrderCounts();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.dropdown')) {
            document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Search functionality
    searchInput.addEventListener('input', debounce(function () {
        filterOrders();
    }, 300));

    // Handle Add New Order button
    const addNewOrderBtn = document.getElementById('addNewOrder');
    if (addNewOrderBtn) {
        addNewOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/Orders/RecordPayment';
        });
    }

    // Order buttons click events
    const orderButtons = document.querySelectorAll('.order-button');
    orderButtons.forEach(button => {
        button.addEventListener('click', function () {
            const action = this.textContent.toLowerCase();
            const orderId = this.closest('.order-card').dataset.orderId;
            
            if (action === 'paid' || action === 'unpaid') {
                handlePaymentStatus(orderId, action);
            }
        });
    });

    // Function to handle payment status
    function handlePaymentStatus(orderId, status) {
        fetch(`/Orders/UpdatePaymentStatus/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
                const button = orderCard.querySelector('.order-button');
                button.textContent = status === 'paid' ? 'Paid' : 'Unpaid';
                button.className = `order-button ${status === 'paid' ? 'primary' : 'secondary'}`;
            } else {
                alert(data.message || 'Error updating payment status');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating payment status');
        });
    }

    // Actions button functionality
    const actionsButtons = document.querySelectorAll('.actions-button');
    actionsButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const orderId = this.closest('.order-card').dataset.orderId;
            const actionsMenu = document.createElement('div');
            actionsMenu.className = 'actions-menu';
            actionsMenu.innerHTML = `
                <div class="action-item" data-action="edit">Edit Order</div>
                <div class="action-item" data-action="delete">Delete Order</div>
                <div class="action-item" data-action="details">View Details</div>
            `;

            const existingMenus = document.querySelectorAll('.actions-menu');
            existingMenus.forEach(menu => menu.remove());

            this.parentNode.appendChild(actionsMenu);
            const buttonRect = this.getBoundingClientRect();
            actionsMenu.style.top = `${buttonRect.bottom + 5}px`;

            // Handle action items
            actionsMenu.querySelectorAll('.action-item').forEach(item => {
                item.addEventListener('click', function() {
                    const action = this.dataset.action;
                    handleOrderAction(orderId, action);
                    actionsMenu.remove();
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function closeMenu(e) {
                if (!actionsMenu.contains(e.target) && e.target !== button) {
                    actionsMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        });
    });

    // Function to handle order actions
    function handleOrderAction(orderId, action) {
        switch(action) {
            case 'edit':
                window.location.href = `/Orders/Edit/${orderId}`;
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this order?')) {
                    fetch(`/Orders/Delete/${orderId}`, {
                        method: 'POST'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
                            orderCard.remove();
                            updateOrderCounts();
                        } else {
                            alert(data.message || 'Error deleting order');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error deleting order');
                    });
                }
                break;
            case 'details':
                window.location.href = `/Orders/Details/${orderId}`;
                break;
        }
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle success message auto-hide
    const successMessage = document.querySelector('.alert-success');
    if (successMessage) {
        setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // Initialize
    filterOrders();
});
