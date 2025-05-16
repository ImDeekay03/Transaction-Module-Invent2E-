// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

// Responsive behavior for Order Management System

document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile navigation
    const menuToggle = document.querySelector('.rectangle-4');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Handle Add New Order button
    const addNewOrderBtn = document.getElementById('addNewOrder');
    if (addNewOrderBtn) {
        addNewOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showPaymentPopup();
        });
    }
    
    // Handle Record Payment button
    const recordPaymentBtns = document.querySelectorAll('.record-payment');
    recordPaymentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.closest('.order-card')?.dataset.orderId;
            showPaymentPopup(orderId);
        });
    });
    
    // Handle View Invoice button
    const viewInvoiceBtns = document.querySelectorAll('.view-invoice');
    viewInvoiceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.closest('.order-card')?.dataset.orderId;
            if (orderId) {
                window.location.href = `/Orders/Invoice/${orderId}`;
            }
        });
    });
    
    // Handle View Profile link
    const viewProfileLinks = document.querySelectorAll('.view-profile');
    viewProfileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const customerId = this.dataset.customerId;
            if (customerId) {
                window.location.href = `/Customers/Details/${customerId}`;
            }
        });
    });
    
    // Handle navigation arrows
    const prevArrow = document.querySelector('.arrow-left');
    const nextArrow = document.querySelector('.arrow-right');
    
    if (prevArrow) {
        prevArrow.addEventListener('click', function() {
            const currentOrderId = this.closest('.order-card')?.dataset.orderId;
            if (currentOrderId) {
                const prevOrder = document.querySelector(`.order-card[data-order-id="${parseInt(currentOrderId) - 1}"]`);
                if (prevOrder) {
                    prevOrder.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', function() {
            const currentOrderId = this.closest('.order-card')?.dataset.orderId;
            if (currentOrderId) {
                const nextOrder = document.querySelector(`.order-card[data-order-id="${parseInt(currentOrderId) + 1}"]`);
                if (nextOrder) {
                    nextOrder.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    // Handle Edit button
    const editButtons = document.querySelectorAll('.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.closest('.order-card')?.dataset.orderId;
            if (orderId) {
                window.location.href = `/Orders/Edit/${orderId}`;
            }
        });
    });
    
    // Add responsive behavior for tables on small screens
    adjustTableForSmallScreens();
    
    // Listen for window resize and adjust tables accordingly
    window.addEventListener('resize', adjustTableForSmallScreens);

    const form = document.getElementById('orderForm');
    const productSelect = document.getElementById('productSelect');
    const productQty = document.getElementById('productQty');
    const addProductBtn = document.getElementById('addProductBtn');
    const orderProductsBody = document.getElementById('orderProductsBody');
    const orderTotalInput = document.getElementById('OrderTotal');
    const isPaidSelect = document.getElementById('isPaidSelect');
    const paymentMethodGroup = document.getElementById('paymentMethodGroup');
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    const referenceNumberGroup = document.getElementById('referenceNumberGroup');
    const referenceNumberInput = document.getElementById('referenceNumber');

    // Product prices
    const productPrices = {
        'Men Cotton Polo Shirt': 599.99,
        'Women Blouse': 499.99,
        'Kids Shorts': 299.99
    };

    // Handle payment method visibility
    function togglePaymentFields() {
        const isPaid = isPaidSelect.value === 'true';
        paymentMethodGroup.style.display = isPaid ? 'block' : 'none';
        
        if (!isPaid) {
            paymentMethodSelect.value = '';
            referenceNumberGroup.style.display = 'none';
            referenceNumberInput.value = '';
        } else {
            toggleReferenceNumber();
        }
    }

    // Handle reference number visibility
    function toggleReferenceNumber() {
        const selectedMethod = paymentMethodSelect.value;
        const showReferenceNumber = ['GCash', 'Maya', 'Bank'].includes(selectedMethod);
        
        referenceNumberGroup.style.display = showReferenceNumber ? 'block' : 'none';
        referenceNumberInput.required = showReferenceNumber;
        
        if (!showReferenceNumber) {
            referenceNumberInput.value = '';
        }
    }

    // Add event listeners for payment fields
    if (isPaidSelect) {
        isPaidSelect.addEventListener('change', togglePaymentFields);
    }

    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', toggleReferenceNumber);
    }

    // Initial check on page load
    togglePaymentFields();

    // Add product to order
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            const productName = productSelect.value;
            const quantity = parseInt(productQty.value);

            if (!productName) {
                showMessage('Please select a product', 'error');
                return;
            }

            if (quantity < 1) {
                showMessage('Quantity must be at least 1', 'error');
                return;
            }

            // Check if product already exists
            const existingRow = Array.from(orderProductsBody.children).find(
                row => row.dataset.product === productName
            );

            if (existingRow) {
                const qtyCell = existingRow.children[1];
                const newQty = parseInt(qtyCell.textContent) + quantity;
                qtyCell.textContent = newQty;
                
                const unitPrice = productPrices[productName];
                const totalCell = existingRow.children[3];
                totalCell.textContent = (newQty * unitPrice).toFixed(2);
            } else {
                const unitPrice = productPrices[productName];
                const total = quantity * unitPrice;

                const row = document.createElement('tr');
                row.dataset.product = productName;
                row.innerHTML = `
                    <td style="padding:0.5rem;">${productName}</td>
                    <td style="text-align:right;padding:0.5rem;">${quantity}</td>
                    <td style="text-align:right;padding:0.5rem;">${unitPrice.toFixed(2)}</td>
                    <td style="text-align:right;padding:0.5rem;">${total.toFixed(2)}</td>
                    <td style="text-align:center;padding:0.5rem;">
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeProduct(this)">Remove</button>
                    </td>
                `;
                orderProductsBody.appendChild(row);
            }

            updateOrderTotal();
            productSelect.value = '';
            productQty.value = 1;
            showMessage('Product added successfully', 'success');
        });
    }

    // Remove product from order
    window.removeProduct = function(button) {
        const row = button.closest('tr');
        row.remove();
        updateOrderTotal();
        showMessage('Product removed successfully', 'success');
    };

    // Update order total
    function updateOrderTotal() {
        const total = Array.from(orderProductsBody.children).reduce((sum, row) => {
            const totalCell = row.children[3];
            return sum + parseFloat(totalCell.textContent);
        }, 0);
        orderTotalInput.value = total.toFixed(2);
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate required fields
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    showMessage(`Please fill in ${field.previousElementSibling.textContent}`, 'error');
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            // Check if there are any products
            if (orderProductsBody.children.length === 0) {
                showMessage('Please add at least one product to the order', 'error');
                isValid = false;
            }

            // Check payment method if order is paid
            if (isPaidSelect.value === 'true') {
                const paymentMethod = paymentMethodSelect.value;
                if (!paymentMethod) {
                    showMessage('Please select a payment method', 'error');
                    isValid = false;
                }

                // Check reference number for specific payment methods
                if (['GCash', 'Maya', 'Bank'].includes(paymentMethod) && !referenceNumberInput.value.trim()) {
                    showMessage('Please enter a reference number', 'error');
                    isValid = false;
                }
            }

            if (!isValid) {
                return;
            }

            // Create order items array
            const orderItems = Array.from(orderProductsBody.children).map(row => ({
                ProductName: row.dataset.product,
                Quantity: parseInt(row.children[1].textContent),
                UnitPrice: parseFloat(row.children[2].textContent)
            }));

            // Add order items to form
            const orderItemsInput = document.getElementById('orderItemsJson');
            orderItemsInput.value = JSON.stringify(orderItems);

            // Show loading message
            showMessage('Saving order...', 'info');

            // Submit the form
            form.submit();
        });
    }

    // Function to show messages
    function showMessage(message, type = 'info') {
        // Remove any existing message
        const existingMessage = document.querySelector('.message-popup');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-popup ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
                </span>
                <span class="message-text">${message}</span>
            </div>
        `;

        // Add styles
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            background: ${type === 'success' ? '#00df72' : type === 'error' ? '#ff4444' : '#2196f3'};
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add to document
        document.body.appendChild(messageDiv);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Function to show payment popup
function showPaymentPopup(orderId = null) {
    const popup = document.getElementById('paymentPopup');
    const popupBody = popup.querySelector('.popup-body');
    
    // Show loading state
    popupBody.innerHTML = '<div class="loading">Loading...</div>';
    popup.style.display = 'block';
    
    // Fetch content from the server
    const url = orderId ? `/Orders/RecordPayment/${orderId}` : '/Orders/Create';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            popupBody.innerHTML = html;
            
            // Add event listener to the form
            const form = popupBody.querySelector('form');
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }
        })
        .catch(error => {
            popupBody.innerHTML = `
                <div class="error">
                    <h3>Error</h3>
                    <p>Failed to load payment form. Please try again.</p>
                </div>
            `;
            console.error('Error:', error);
        });
}

function closePaymentPopup() {
    const popup = document.getElementById('paymentPopup');
    popup.style.display = 'none';
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            closePaymentPopup();
            // Reload the page to show updated data
            window.location.reload();
        } else {
            throw new Error(data.message || 'Failed to process payment');
        }
    })
    .catch(error => {
        const errorDiv = form.querySelector('.error') || document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${error.message}</p>
        `;
        if (!form.querySelector('.error')) {
            form.insertBefore(errorDiv, form.firstChild);
        }
    });
}

// Function to make tables responsive on small screens
function adjustTableForSmallScreens() {
    const tables = document.querySelectorAll('.products-table');
    const windowWidth = window.innerWidth;
    
    tables.forEach(function(table) {
        if (windowWidth < 768) {
            table.classList.add('responsive-table');
        } else {
            table.classList.remove('responsive-table');
        }
    });
}

function updateOrderItemsHiddenFields() {
    // Remove old hidden fields
    document.querySelectorAll('.order-item-hidden').forEach(e => e.remove());
    
    // Add new hidden fields for each product row
    const rows = document.querySelectorAll('#orderProductsBody tr');
    rows.forEach((row, idx) => {
        const product = row.querySelector('td:nth-child(1)').textContent;
        const qty = row.querySelector('.prod-qty').value;
        const price = row.querySelector('.prod-price').textContent;
        
        // Create hidden fields for each property
        const fields = {
            'ProductId': product, // Using product name as ID for demo
            'ProductName': product,
            'Quantity': qty,
            'UnitPrice': price
        };

        Object.entries(fields).forEach(([prop, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `OrderItems[${idx}].${prop}`;
            input.value = value;
            input.className = 'order-item-hidden';
            document.querySelector('form').appendChild(input);
        });
    });
}
