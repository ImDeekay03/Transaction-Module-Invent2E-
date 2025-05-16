document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paymentForm');
    const productSelect = document.getElementById('productSelect');
    const productQty = document.getElementById('productQty');
    const addProductBtn = document.getElementById('addProductBtn');
    const orderProductsBody = document.getElementById('orderProductsBody');
    const orderTotal = document.getElementById('orderTotal');
    const isPaidSelect = document.getElementById('isPaidSelect');
    const paymentMethodGroup = document.getElementById('paymentMethodGroup');
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    const referenceNumberGroup = document.getElementById('referenceNumberGroup');
    const referenceNumber = document.getElementById('referenceNumber');
    const orderItemsJson = document.getElementById('orderItemsJson');
    const orderTotalInput = document.querySelector('input[name="OrderTotal"]');

    let orderItems = [];

    // Toggle payment fields based on payment status
    isPaidSelect.addEventListener('change', function() {
        if (this.value === 'true') {
            paymentMethodGroup.style.display = 'block';
        } else {
            paymentMethodGroup.style.display = 'none';
            referenceNumberGroup.style.display = 'none';
        }
    });

    // Toggle reference number field based on payment method
    paymentMethodSelect.addEventListener('change', function() {
        if (this.value === 'GCash' || this.value === 'Maya' || this.value === 'Bank') {
            referenceNumberGroup.style.display = 'block';
        } else {
            referenceNumberGroup.style.display = 'none';
        }
    });

    // Add product to order
    addProductBtn.addEventListener('click', function() {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        if (!selectedOption.value) {
            alert('Please select a product');
            return;
        }

        const productId = selectedOption.value;
        const productName = selectedOption.dataset.name;
        const unitPrice = parseFloat(selectedOption.dataset.price);
        const quantity = parseInt(productQty.value);

        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        if (!productName || isNaN(unitPrice)) {
            alert('Product information not found. Please try again.');
            return;
        }

        // Check if product already exists in order
        const existingItem = orderItems.find(item => item.ProductID === parseInt(productId));
        if (existingItem) {
            existingItem.Quantity += quantity;
            existingItem.TotalPrice = existingItem.Quantity * existingItem.UnitPrice;
        } else {
            orderItems.push({
                ProductID: parseInt(productId),
                ProductName: productName,
                Quantity: quantity,
                UnitPrice: unitPrice,
                TotalPrice: quantity * unitPrice
            });
        }

        updateOrderTable();
        updateOrderTotal();
        productSelect.value = '';
        productQty.value = '1';
    });

    // Remove product from order
    function removeProduct(productId) {
        orderItems = orderItems.filter(item => item.ProductID !== parseInt(productId));
        updateOrderTable();
        updateOrderTotal();
    }

    // Update order table
    function updateOrderTable() {
        orderProductsBody.innerHTML = '';
        orderItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.ProductName}</td>
                <td style="text-align:right;">${item.Quantity}</td>
                <td style="text-align:right;">₱${item.UnitPrice.toFixed(2)}</td>
                <td style="text-align:right;">₱${item.TotalPrice.toFixed(2)}</td>
                <td style="text-align:center;">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeProduct('${item.ProductID}')">
                        Remove
                    </button>
                </td>
            `;
            orderProductsBody.appendChild(row);
        });
    }

    // Update order total
    function updateOrderTotal() {
        const total = orderItems.reduce((sum, item) => sum + item.TotalPrice, 0);
        orderTotal.textContent = `₱${total.toFixed(2)}`;
        orderTotalInput.value = total.toFixed(2);
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                const labelText = field.previousElementSibling ? 
                    field.previousElementSibling.textContent : 
                    field.getAttribute('name') || 'this field';
                alert(`Please fill in ${labelText}`);
            } else {
                field.classList.remove('is-invalid');
            }
        });

        // Check if products have been added
        if (orderItems.length === 0) {
            alert('Please add at least one product to the order');
            return;
        }

        // Validate payment method if order is paid
        if (isPaidSelect.value === 'true' && !paymentMethodSelect.value) {
            alert('Please select a payment method');
            return;
        }

        // Validate reference number for specific payment methods
        if (isPaidSelect.value === 'true' && 
            (paymentMethodSelect.value === 'GCash' || 
             paymentMethodSelect.value === 'Maya' || 
             paymentMethodSelect.value === 'Bank') && 
            !referenceNumber.value.trim()) {
            alert('Please enter a reference number');
            return;
        }

        try {
            // Create order items array with the correct structure
            const orderItemsData = orderItems.map(item => ({
                ProductID: item.ProductID,
                ProductName: item.ProductName,
                Quantity: item.Quantity,
                UnitPrice: item.UnitPrice,
                TotalPrice: item.TotalPrice
            }));

            // Add order items to form
            let orderItemsInput = document.getElementById('orderItemsJson');
            if (!orderItemsInput) {
                orderItemsInput = document.createElement('input');
                orderItemsInput.type = 'hidden';
                orderItemsInput.id = 'orderItemsJson';
                orderItemsInput.name = 'OrderItemsJson';
                form.appendChild(orderItemsInput);
            }
            orderItemsInput.value = JSON.stringify(orderItemsData);

            // Set payment date if order is paid
            if (isPaidSelect.value === 'true') {
                const paymentDateInput = document.createElement('input');
                paymentDateInput.type = 'hidden';
                paymentDateInput.name = 'PaymentDate';
                paymentDateInput.value = new Date().toISOString();
                form.appendChild(paymentDateInput);
            }

            // Combine address fields
            const houseNo = form.querySelector('input[name="HouseNo"]').value;
            const streetAddress = form.querySelector('input[name="StreetAddress"]').value;
            const barangay = form.querySelector('input[name="Barangay"]').value;
            const postalId = form.querySelector('input[name="PostalId"]').value;
            const city = form.querySelector('input[name="City"]').value;
            
            const shippingAddress = `${houseNo} ${streetAddress}, ${barangay}, ${city} ${postalId}`;
            
            // Add shipping address to form
            const shippingAddressInput = document.createElement('input');
            shippingAddressInput.type = 'hidden';
            shippingAddressInput.name = 'ShippingAddress';
            shippingAddressInput.value = shippingAddress;
            form.appendChild(shippingAddressInput);

            // Log the data before submission
            console.log('Form data being submitted:', {
                orderItems: orderItemsData,
                isPaid: isPaidSelect.value,
                paymentMethod: paymentMethodSelect.value,
                referenceNumber: referenceNumber.value,
                total: orderTotalInput.value,
                shippingAddress: shippingAddress
            });

            // Submit the form
            form.submit();
        } catch (error) {
            console.error('Error preparing form submission:', error);
            alert('Error preparing order data: ' + error.message);
        }
    });

    // Make removeProduct function globally available
    window.removeProduct = removeProduct;
});