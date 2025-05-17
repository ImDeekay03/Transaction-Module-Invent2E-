document.addEventListener('DOMContentLoaded', function () {
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
    const cashPaymentGroup = document.getElementById('cashPaymentGroup');
    const paymentAmount = document.getElementById('paymentAmount');
    const changeAmount = document.getElementById('changeAmount');
    const insufficientAmount = document.getElementById('insufficientAmount');

    let orderItems = [];

    // Toggle payment fields based on payment status
    isPaidSelect.addEventListener('change', function () {
        if (this.value === 'true') {
            paymentMethodGroup.style.display = 'block';
        } else {
            paymentMethodGroup.style.display = 'none';
            referenceNumberGroup.style.display = 'none';
            cashPaymentGroup.style.display = 'none';
            changeAmount.style.display = 'none';
            insufficientAmount.style.display = 'none';
        }
    });

    // Toggle reference number field based on payment method
    paymentMethodSelect.addEventListener('change', function () {
        if (this.value === 'GCash' || this.value === 'Maya' || this.value === 'Bank') {
            referenceNumberGroup.style.display = 'block';
            cashPaymentGroup.style.display = 'none';
            changeAmount.style.display = 'none';
            insufficientAmount.style.display = 'none';
        } else if (this.value === 'Cash') {
            referenceNumberGroup.style.display = 'none';
            cashPaymentGroup.style.display = 'block';
            // Trigger validation on payment method change
            validatePaymentAmount();
        } else {
            referenceNumberGroup.style.display = 'none';
            cashPaymentGroup.style.display = 'none';
            changeAmount.style.display = 'none';
            insufficientAmount.style.display = 'none';
        }
    });

    // Validate payment amount and show appropriate messages
    function validatePaymentAmount() {
        const total = parseFloat(orderTotalInput.value) || 0;
        const paid = parseFloat(paymentAmount.value) || 0;
        
        // Hide both messages initially
        changeAmount.style.display = 'none';
        insufficientAmount.style.display = 'none';
        
        if (paid > total) {
            const change = paid - total;
            changeAmount.textContent = `Change: ₱${change.toFixed(2)}`;
            changeAmount.style.display = 'block';
            paymentAmount.classList.remove('is-invalid');
            paymentAmount.classList.add('is-valid');
        } else if (paid > 0 && paid < total) {
            const remaining = total - paid;
            insufficientAmount.textContent = `Insufficient amount. Remaining: ₱${remaining.toFixed(2)}`;
            insufficientAmount.style.display = 'block';
            paymentAmount.classList.remove('is-valid');
            paymentAmount.classList.add('is-invalid');
        } else {
            paymentAmount.classList.remove('is-valid', 'is-invalid');
        }
    }

    // Calculate and display change for cash payments
    paymentAmount.addEventListener('input', validatePaymentAmount);

    // Add product to order
    addProductBtn.addEventListener('click', function () {
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
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Prevent submission for unpaid orders
        if (isPaidSelect.value === 'false') {
            alert('Cannot submit an unpaid order. Please mark the order as paid and provide payment details.');
            return;
        }

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

        if (!isValid) {
            return; // Stop form submission if required fields are missing
        }

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

        // Validate cash payment amount
        if (paymentMethodSelect.value === 'Cash') {
            const total = parseFloat(orderTotalInput.value) || 0;
            const paid = parseFloat(paymentAmount.value) || 0;
            
            if (paid < total) {
                alert('Amount paid must be equal to or greater than the order total');
                return;
            }
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
                // Add payment date
                let paymentDateInput = document.querySelector('input[name="PaymentDate"]');
                if (!paymentDateInput) {
                    paymentDateInput = document.createElement('input');
                    paymentDateInput.type = 'hidden';
                    paymentDateInput.name = 'PaymentDate';
                    form.appendChild(paymentDateInput);
                }
                paymentDateInput.value = new Date().toISOString();

                // Add payment amount for cash payments, use actual payment amount entered
                let paymentAmountInput = document.querySelector('input[name="PaymentAmount"]');
                if (!paymentAmountInput) {
                    paymentAmountInput = document.createElement('input');
                    paymentAmountInput.type = 'hidden';
                    paymentAmountInput.name = 'PaymentAmount';
                    form.appendChild(paymentAmountInput);
                }
                
                if (paymentMethodSelect.value === 'Cash') {
                    paymentAmountInput.value = document.getElementById('paymentAmount').value;
                } else {
                    paymentAmountInput.value = orderTotalInput.value;
                }

                // Add reference number
                let referenceNumberInput = document.querySelector('input[name="ReferenceNumber"]');
                if (!referenceNumberInput) {
                    referenceNumberInput = document.createElement('input');
                    referenceNumberInput.type = 'hidden';
                    referenceNumberInput.name = 'ReferenceNumber';
                    form.appendChild(referenceNumberInput);
                }
                
                if (paymentMethodSelect.value === 'Cash') {
                    referenceNumberInput.value = 'CASH-' + new Date().getTime();
                } else {
                    referenceNumberInput.value = referenceNumber.value;
                }

                // Add payment method
                let paymentMethodInput = document.querySelector('input[name="PaymentMethod"]');
                if (!paymentMethodInput) {
                    paymentMethodInput = document.createElement('input');
                    paymentMethodInput.type = 'hidden';
                    paymentMethodInput.name = 'PaymentMethod';
                    form.appendChild(paymentMethodInput);
                }
                paymentMethodInput.value = paymentMethodSelect.value;

                // Add IsPaid field
                let isPaidInput = document.querySelector('input[name="IsPaid"]');
                if (!isPaidInput) {
                    isPaidInput = document.createElement('input');
                    isPaidInput.type = 'hidden';
                    isPaidInput.name = 'IsPaid';
                    form.appendChild(isPaidInput);
                }
                isPaidInput.value = 'true';
            }

            // Combine address fields
            const houseNo = form.querySelector('input[name="HouseNo"]').value;
            const streetAddress = form.querySelector('input[name="StreetAddress"]').value;
            const barangay = form.querySelector('input[name="Barangay"]').value;
            const postalId = form.querySelector('input[name="PostalId"]').value;
            const city = form.querySelector('input[name="City"]').value;
            
            const shippingAddress = `${houseNo} ${streetAddress}, ${barangay}, ${city} ${postalId}`;
            
            // Add shipping address to form
            let shippingAddressInput = document.querySelector('input[name="ShippingAddress"]');
            if (!shippingAddressInput) {
                shippingAddressInput = document.createElement('input');
                shippingAddressInput.type = 'hidden';
                shippingAddressInput.name = 'ShippingAddress';
                form.appendChild(shippingAddressInput);
            }
            shippingAddressInput.value = shippingAddress;

            // Log the data before submission
            console.log('Form data being submitted:', {
                orderItems: orderItemsData,
                isPaid: isPaidSelect.value,
                paymentMethod: paymentMethodSelect.value,
                paymentAmount: paymentMethodSelect.value === 'Cash' ? 
                    document.getElementById('paymentAmount').value : 
                    orderTotalInput.value,
                referenceNumber: paymentMethodSelect.value === 'Cash' ? 
                    'CASH-' + new Date().getTime() : 
                    referenceNumber.value,
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