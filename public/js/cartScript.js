document.addEventListener('DOMContentLoaded', function() {
    // Update quantity with backend sync
    async function updateQuantity(itemId, quantity) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId, quantity })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            updateCartDisplay(data.cart);
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity');
        }
    }

    // Remove item with backend sync
    async function removeItem(itemId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            updateCartDisplay(data.cart);
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item');
        }
    }

    // Clear cart with backend sync
    async function clearCart() {
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            location.reload(); // Refresh the page to show empty cart
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Failed to clear cart');
        }
    }

    // Apply coupon with backend sync
    async function applyCoupon(code) {
        try {
            const response = await fetch('/api/cart/coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            updateCartDisplay(data.cart);
        } catch (error) {
            console.error('Error applying coupon:', error);
            alert('Invalid coupon code');
        }
    }

    // Helper function to update cart display
    function updateCartDisplay(cart) {
        // Update item counts
        document.querySelector('.summary-row:nth-child(1) div:last-child').textContent = cart.items.length;
        
        // Update subtotal
        document.querySelector('.summary-row:nth-child(2) div:last-child').textContent = 
            `$${cart.totalAmount.toFixed(2)}`;
        
        // Update discount
        document.querySelector('.discount').textContent = `-$${cart.discount.toFixed(2)}`;
        
        // Update total
        document.querySelector('.summary-row.total div:last-child').textContent = 
            `$${(cart.totalAmount - cart.discount).toFixed(2)}`;
    }

    // Event listeners
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const quantity = parseInt(e.target.value);
            if (quantity > 0) {
                await updateQuantity(itemId, quantity);
            }
        });
    });

    document.querySelectorAll('.x-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            await removeItem(itemId);
        });
    });

    document.querySelector('.clear-cart-btn').addEventListener('click', clearCart);

    document.querySelector('.coupon-btn').addEventListener('click', async () => {
        const code = document.querySelector('.coupon-input').value.trim();
        await applyCoupon(code);
    });
});