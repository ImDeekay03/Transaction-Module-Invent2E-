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
        'Men Cotton Polo Shirt': { price: 599.99, id: 'MCP001' },
        'Women Blouse': { price: 499.99, id: 'WB001' },
        'Kids Shorts': { price: 299.99, id: 'KS001' }
    };

    // Create productPrice div if it doesn't exist
    let productPriceDiv = document.getElementById('productPrice');
    if (!productPriceDiv && productSelect) {
        productPriceDiv = document.createElement('div');
        productPriceDiv.id = 'productPrice';
        productSelect.parentNode.insertBefore(productPriceDiv, productSelect.nextSibling);
    }

    // Handle payment method visibility
    function togglePaymentFields() {
        if (!isPaidSelect || !paymentMethodGroup) return;
        
        const isPaid = isPaidSelect.value === 'true';
        paymentMethodGroup.style.display = isPaid ? 'block' : 'none';
        
        if (!isPaid) {
            if (paymentMethodSelect) paymentMethodSelect.value = '';
            if (referenceNumberGroup) referenceNumberGroup.style.display = 'none';
            if (referenceNumberInput) referenceNumberInput.value = '';
        } else {
            toggleReferenceNumber();
        }
    }

    // Handle reference number visibility
    function toggleReferenceNumber() {
        if (!paymentMethodSelect || !referenceNumberGroup || !referenceNumberInput) return;
        
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

    // Handle product selection
    if (productSelect) {
        productSelect.addEventListener('change', function() {
            const productName = this.value;
            if (productName && productPrices[productName]) {
                if (productQty) productQty.value = '1';
            }
        });
    }

    // Add product to order
    if (addProductBtn && productSelect && productQty && orderProductsBody) {
        addProductBtn.addEventListener('click', function() {
            const productName = productSelect.value;
            const quantity = parseInt(productQty.value || 0);

            if (!productName) {
                alert('Please select a product');
                return;
            }

            if (isNaN(quantity) || quantity < 1) {
                alert('Quantity must be at least 1');
                return;
            }

            const productInfo = productPrices[productName];
            if (!productInfo) {
                alert('Product information not found');
                return;
            }

            const total = quantity * productInfo.price;

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
                totalCell.textContent = `₱${(newQty * productInfo.price).toFixed(2)}`;
            } else {
                // Add new row
                const row = document.createElement('tr');
                row.dataset.product = productName;
                row.dataset.productId = productInfo.id;
                row.innerHTML = `
                    <td style="padding:0.5rem;">${productName}</td>
                    <td style="text-align:right;padding:0.5rem;">${quantity}</td>
                    <td style="text-align:right;padding:0.5rem;">₱${productInfo.price.toFixed(2)}</td>
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
            
            // Clear the price display
            if (productPriceDiv) {
                productPriceDiv.textContent = '';
            }
        });
    }

    // Remove product from order
    window.removeProduct = function(button) {
        if (!button) return;
        
        const row = button.closest('tr');
        if (row) {
            row.remove();
            updateOrderTotal();
        }
    };

    // Update order total
    function updateOrderTotal() {
        if (!orderProductsBody || !orderTotalInput) return;
        
        const total = Array.from(orderProductsBody.children).reduce((sum, row) => {
            if (row.children && row.children[3]) {
                const totalText = row.children[3].textContent || '₱0';
                return sum + parseFloat(totalText.replace('₱', '') || 0);
            }
            return sum;
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
                    const labelText = field.previousElementSibling ? 
                        field.previousElementSibling.textContent : 
                        field.getAttribute('name') || 'this field';
                    alert(`Please fill in ${labelText}`);
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            // Check if there are any products
            if (!orderProductsBody || orderProductsBody.children.length === 0) {
                alert('Please add at least one product to the order');
                isValid = false;
            }

            // Check payment method if order is paid
            if (isPaidSelect && isPaidSelect.value === 'true') {
                if (paymentMethodSelect && !paymentMethodSelect.value) {
                    alert('Please select a payment method');
                    isValid = false;
                }

                // Check reference number for specific payment methods
                if (paymentMethodSelect && 
                    ['GCash', 'Maya', 'Bank'].includes(paymentMethodSelect.value) && 
                    referenceNumberInput && 
                    !referenceNumberInput.value.trim()) {
                    alert('Please enter a reference number');
                    isValid = false;
                }
            }

            if (!isValid) {
                return;
            }

            try {
                // Create order items array
                const orderItems = Array.from(orderProductsBody.children).map(row => ({
                    ProductId: row.dataset.productId || '',
                    ProductName: row.dataset.product || '',
                    Quantity: parseInt(row.children[1].textContent || '0'),
                    UnitPrice: parseFloat((row.children[2].textContent || '₱0').replace('₱', ''))
                }));

                // Add order items to form
                let orderItemsInput = document.getElementById('orderItemsJson');
                if (!orderItemsInput) {
                    // Create the field if it doesn't exist
                    orderItemsInput = document.createElement('input');
                    orderItemsInput.type = 'hidden';
                    orderItemsInput.id = 'orderItemsJson';
                    orderItemsInput.name = 'OrderItemsJson';
                    form.appendChild(orderItemsInput);
                }
                orderItemsInput.value = JSON.stringify(orderItems);

                // Set payment date if order is paid
                if (isPaidSelect && isPaidSelect.value === 'true') {
                    const paymentDateInput = document.createElement('input');
                    paymentDateInput.type = 'hidden';
                    paymentDateInput.name = 'PaymentDate';
                    paymentDateInput.value = new Date().toISOString();
                    form.appendChild(paymentDateInput);
                }

                // Log the data before submission
                console.log('Form data being submitted:', {
                    orderItems: orderItems,
                    isPaid: isPaidSelect ? isPaidSelect.value : 'unknown',
                    paymentMethod: paymentMethodSelect ? paymentMethodSelect.value : 'unknown',
                    referenceNumber: referenceNumberInput ? referenceNumberInput.value : 'unknown',
                    total: orderTotalInput ? orderTotalInput.value : 'unknown'
                });

                // Submit the form
                form.submit();
            } catch (error) {
                console.error('Error preparing form submission:', error);
                alert('Error preparing order data: ' + error.message);
            }
        });
    }

    // Initial check on page load
    togglePaymentFields();
});