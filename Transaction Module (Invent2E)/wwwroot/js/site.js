document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables for DOM elements
    const filterOptions = document.querySelectorAll('.filter-option');
    const resetFiltersButton = document.getElementById('resetFilters');
    const searchInput = document.querySelector('.search-input');
    const addNewOrderButton = document.getElementById('addNewOrder');
    const orderList = document.getElementById('orderList');
    const orderCards = document.querySelectorAll('.order-card');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Filter options click event
    filterOptions.forEach(option => {
        option.addEventListener('click', function () {
            filterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const selectedFilter = this.textContent.split(' ')[0].toLowerCase();
            filterOrders(selectedFilter);
        });
    });

    // Filter orders function
    function filterOrders(filter) {
        orderCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const orderStatus = card.querySelector('.order-status').textContent.toLowerCase();
                if (orderStatus.includes(filter) ||
                    (filter === 'quote' && orderStatus.includes('new quote')) ||
                    (filter === 'shipment' && orderStatus.includes('shipping')) ||
                    (filter === 'sample' && orderStatus.includes('packed'))) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    // Reset filters button click event
    resetFiltersButton.addEventListener('click', function () {
        filterOptions.forEach(opt => {
            if (opt.textContent.includes('All')) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
        searchInput.value = '';
        orderCards.forEach(card => {
            card.style.display = 'block';
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        orderCards.forEach(card => {
            const orderId = card.dataset.orderId.toLowerCase();
            const orderDesc = card.querySelector('.order-description').textContent.toLowerCase();
            if (orderId.includes(searchTerm) || orderDesc.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Add new order button click event
    addNewOrderButton.addEventListener('click', function () {
        alert('Add new order functionality would be implemented here.');
    });

    // Order buttons click events
    const orderButtons = document.querySelectorAll('.order-button');
    orderButtons.forEach(button => {
        button.addEventListener('click', function () {
            const action = this.textContent;
            const orderId = this.closest('.order-card').dataset.orderId;
            alert(`${action} action triggered for order ${orderId}`);
        });
    });

    // Dropdown functionality
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function () {
            const dropdownTitle = this.textContent.trim().split('\n')[0];
            alert(`${dropdownTitle} dropdown clicked. Would show options in a real app.`);
        });
    });

    // Progress tracking simulation
    function updateOrderProgress() {
        orderCards.forEach(card => {
            const progressBar = card.querySelector('.progress');
            const steps = card.querySelectorAll('.step');
            const orderStatus = card.querySelector('.order-status');

            const currentProgress = parseInt(progressBar.style.width);
            const statusText = orderStatus.textContent;

            if (statusText.includes('shipping') && currentProgress < 90) {
                const newProgress = Math.min(currentProgress + 5, 90);
                progressBar.style.width = `${newProgress}%`;
                if (newProgress > 75 && !steps[3].classList.contains('active')) {
                    steps[3].classList.add('active');
                }
            } else if (statusText.includes('packed') && currentProgress < 75) {
                const newProgress = Math.min(currentProgress + 5, 75);
                progressBar.style.width = `${newProgress}%`;
            }
        });
    }

    setInterval(updateOrderProgress, 3000);

    // Actions button functionality
    const actionsButtons = document.querySelectorAll('.actions-button');
    actionsButtons.forEach(button => {
        button.addEventListener('click', function () {
            const orderId = this.closest('.order-card').dataset.orderId;
            const actionsMenu = document.createElement('div');
            actionsMenu.className = 'actions-menu';
            actionsMenu.innerHTML = `
                <div class="action-item">Edit Order</div>
                <div class="action-item">Delete Order</div>
                <div class="action-item">View Details</div>
            `;
            actionsMenu.style.position = 'absolute';
            actionsMenu.style.right = '20px';
            actionsMenu.style.backgroundColor = 'var(--card-bg)';
            actionsMenu.style.border = '1px solid var(--border-color)';
            actionsMenu.style.borderRadius = '6px';
            actionsMenu.style.padding = '0.5rem 0';
            actionsMenu.style.zIndex = '100';

            const existingMenus = document.querySelectorAll('.actions-menu');
            existingMenus.forEach(menu => menu.remove());
            this.parentNode.appendChild(actionsMenu);
            const buttonRect = this.getBoundingClientRect();
            actionsMenu.style.top = `${buttonRect.bottom + 5}px`;

            const actionItems = actionsMenu.querySelectorAll('.action-item');
            actionItems.forEach(item => {
                item.style.padding = '0.5rem 1rem';
                item.style.cursor = 'pointer';
                item.style.transition = 'all 0.2s';

                item.addEventListener('mouseover', function () {
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                });

                item.addEventListener('mouseout', function () {
                    this.style.backgroundColor = 'transparent';
                });

                item.addEventListener('click', function () {
                    alert(`${this.textContent} for order ${orderId}`);
                    actionsMenu.remove();
                });
            });

            document.addEventListener('click', function closeMenu(e) {
                if (!actionsMenu.contains(e.target) && e.target !== button) {
                    actionsMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        });
    });

    filterOrders('quote');
});
