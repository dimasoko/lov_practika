document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const loadingDiv = document.getElementById('loading');
    
    function showLoading() {
        if (loadingDiv) loadingDiv.style.display = 'block';
    }
    
    function hideLoading() {
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
    
    function calculateDiscountPrice(price, discountPercentage) {
        return discountPercentage ? (price - (price * discountPercentage / 100)).toFixed(2) : price;
    }
    function createProductCard(product) {
        const discountPrice = calculateDiscountPrice(product.price, product.discountPercentage);
        const hasDiscount = product.discountPercentage > 0;
        
        return `
        <div class="product-card">
            <img src="${product.thumbnail || product.images[0] || ''}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-prices">
                ${hasDiscount ? `<span class="original-price">$${product.price}</span>` : ''}
                <span class="discount-price">$${discountPrice}</span>
                <button class="product-button" onclick="goToProduct(${product.id})">
                    🛈
                </button>
                </div>                    
            </div>
        </div>
        `;

        
    }
    
    function displayProducts(products) {
        if (!productsContainer) return;
        
        if (!products || products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">Товары не найдены</p>';
        return;
        }
        
        const cardsHTML = products.map(product => createProductCard(product)).join('');
        productsContainer.innerHTML = cardsHTML;
    }
    
    function loadProducts(searchQuery = '') {
        showLoading();
        
        const apiUrl = searchQuery 
        ? `/api/products?q=${encodeURIComponent(searchQuery)}`
        : '/api/products';
        
        fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayProducts(data.products);
        })
        .catch(error => {
            hideLoading();
            console.error('Ошибка:', error);
            if (productsContainer) {
            productsContainer.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
            }
        });
    }
    
    function searchProducts() {
        const query = searchInput ? searchInput.value.trim() : '';
        loadProducts(query);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', searchProducts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
        });
    }
    
    window.goToProduct = function(productId) {
        window.location.href = `/product.html?id=${productId}`;
    };
    
    loadProducts();
});