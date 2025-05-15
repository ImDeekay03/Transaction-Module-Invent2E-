document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('orderForm');
    const isPaidSelect = document.getElementById('isPaidSelect');
    const paymentMethodGroup = document.getElementById('paymentMethodGroup');
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    const referenceNumberGroup = document.getElementById('referenceNumberGroup');
    const referenceNumberInput = document.getElementById('referenceNumber');
    const productSelect = document.getElementById('productSelect');
    const productQty = document.getElementById('productQty');
    const addProductBtn = document.getElementById('addProductBtn');
    const orderProductsBody = document.getElementById('orderProductsBody');
    const orderTotalInput = document.getElementById('OrderTotal');

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

    // Add product to order
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            const productName = productSelect.value;
            const quantity = parseInt(productQty.value);

            if (!productName) {
                alert('Please select a product');
                return;
            }

            if (quantity < 1) {
                alert('Quantity must be at least 1');
                return;
            }

            const unitPrice = productPrices[productName];
            const total = quantity * unitPrice;

            // Check if product already exists
            const existingRow = Array.from(orderProductsBody.children).find(
                row => row.dataset.product === productName
            );

            if (existingRow) {
                // Update existing row
                const qtyCell = existingRow.children[1];
                const newQty = parseInt(qtyCell.textContent) + quantity;
                qtyCell.textContent = newQty;
                
                const totalCell = existingRow.children[3];
                totalCell.textContent = (newQty * unitPrice).toFixed(2);
            } else {
                // Add new row
                const row = document.createElement('tr');
                row.dataset.product = productName;
                row.innerHTML = `
                    <td style="padding:0.5rem;">${productName}</td>
                    <td style="text-align:right;padding:0.5rem;">${quantity}</td>
                    <td style="text-align:right;padding:0.5rem;">₱${unitPrice.toFixed(2)}</td>
                    <td style="text-align:right;padding:0.5rem;">₱${total.toFixed(2)}</td>
                    <td style="text-align:center;padding:0.5rem;">
                        <button type="button" class="btn btn-outline" onclick="removeProduct(this)" style="padding:0.25rem 0.5rem;">Remove</button>
                    </td>
                `;
                orderProductsBody.appendChild(row);
            }

            updateOrderTotal();
            productSelect.value = '';
            productQty.value = '1';
        });
    }

    // Remove product from order
    window.removeProduct = function(button) {
        const row = button.closest('tr');
        row.remove();
        updateOrderTotal();
    };

    // Update order total
    function updateOrderTotal() {
        const total = Array.from(orderProductsBody.children).reduce((sum, row) => {
            const totalCell = row.children[3];
            return sum + parseFloat(totalCell.textContent.replace('₱', ''));
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
                    alert(`Please fill in ${field.previousElementSibling.textContent}`);
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            // Check if there are any products
            if (orderProductsBody.children.length === 0) {
                alert('Please add at least one product to the order');
                isValid = false;
            }

            // Check payment method if order is paid
            if (isPaidSelect.value === 'true') {
                const paymentMethod = paymentMethodSelect.value;
                if (!paymentMethod) {
                    alert('Please select a payment method');
                    isValid = false;
                }

                // Check reference number for specific payment methods
                if (['GCash', 'Maya', 'Bank'].includes(paymentMethod) && !referenceNumberInput.value.trim()) {
                    alert('Please enter a reference number');
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
                UnitPrice: parseFloat(row.children[2].textContent.replace('₱', ''))
            }));

            // Add order items to form
            const orderItemsInput = document.getElementById('orderItemsJson');
            orderItemsInput.value = JSON.stringify(orderItems);

            // Submit the form
            form.submit();
        });
    }

    // Initial check on page load
    togglePaymentFields();
}); 
