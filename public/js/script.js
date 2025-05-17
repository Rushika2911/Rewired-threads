// FAQ Accordion
document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const answer = question.nextElementSibling;
    const isActive = question.classList.contains("active");

    // Close all
    document.querySelectorAll(".faq-question").forEach((q) => {
      q.classList.remove("active");
      q.nextElementSibling.classList.remove("active");
    });

    // If it wasn't active before, open it
    if (!isActive) {
      question.classList.add("active");
      answer.classList.add("active");
    }
  });
});

// Mobile menu toggle (would be expanded in a real implementation)
const mobileMenuBtn = document.createElement("div");
mobileMenuBtn.className = "mobile-menu-btn";
mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".header-top").prepend(mobileMenuBtn);

// Product hover effect
document.querySelectorAll(".product-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-10px)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)";
  });
});

// Simulated loading effect
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Add to cart functionality
function addToCart(element) {
    const productCard = element.closest('.product-card');
    const priceText = productCard.querySelector('.price').textContent;
    const price = parseFloat(priceText.replace('$', ''));
    
    const productData = {
        productId: parseInt(productCard.dataset.productId) || Date.now(),
        name: productCard.querySelector('h4').textContent,
        price: price,
        quantity: 1,
        image: productCard.querySelector('img').src,
        color: productCard.querySelector('p').textContent.split('|')[0]?.trim() || 'Default',
        size: 'M' // Default size
    };

    fetch('/api/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Product added to cart successfully!');
        } else {
            throw new Error(data.error || 'Failed to add product to cart');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add item to cart. Please try again.');
    });
}

// Add click event listeners to cart icons
document.addEventListener('DOMContentLoaded', function() {
    const cartIcons = document.querySelectorAll('.fa-shopping-cart');
    cartIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(this);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const cartIcon = card.querySelector('.fa-shopping-cart');
    
    cartIcon.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const productInfo = {
        name: card.querySelector('h4').textContent,
        price: card.querySelector('.price').textContent.replace('$', ''),
        image: card.querySelector('img').getAttribute('src'),
        category: card.querySelector('p').textContent,
        quantity: 1
      };

      try {
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productInfo)
        });

        if (response.ok) {
          alert('Product added to cart successfully!');
        } else {
          alert('Failed to add product to cart');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error adding product to cart');
      }
    });
  });
});