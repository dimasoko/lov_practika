document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.getElementById('product-container');
    const loadingDiv = document.getElementById('loading');
    const backButton = document.getElementById('back-button');
    
    function showLoading() {
        if (loadingDiv) loadingDiv.style.display = 'block';
    }
        function hideLoading() {
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
    function getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    // расчет цены со скидкой
    function calculateDiscountPrice(price, discountPercentage) {
        return discountPercentage ? (price - (price * discountPercentage / 100)).toFixed(2) : price;
    }
    // делаем три статуса наличия
    function getStockStatus(stock, availabilityStatus) {
        if (stock === 0) return 'Нет в наличии';
        if (stock < 10) return 'Мало в наличии';
        if (availabilityStatus) return availabilityStatus;
        return 'В наличии';
    }
    function createProductHTML(product) {
        const discountPrice = calculateDiscountPrice(product.price, product.discountPercentage);
        const hasDiscount = product.discountPercentage > 0;
        const stockStatus = getStockStatus(product.stock, product.availabilityStatus);
        const mainImage = product.thumbnail || (product.images && product.images[0]) || '';
        
        return `
        <div class="product-detail">
            <div class="product-image-section">
            <img src="${mainImage}" alt="${product.title}" class="product-main-image">
            </div>
            
            <div class="product-info-section">
            <h1 class="product-title">${product.title}</h1>
            
            <div class="product-description">
                <p>${product.description || 'Описание товара отсутствует'}</p>
            </div>
            
            <div class="product-availability">
                <span class="stock-status ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}">
                ${stockStatus}
                </span>
                ${product.stock > 0 ? `<span class="stock-count">(${product.stock} шт.)</span>` : ''}
            </div>
            
            <div class="product-prices">
                ${hasDiscount ? `
                <div class="price-row">
                    <span class="price-label">Цена без скидки:</span>
                    <span class="original-price">$${product.price}</span>
                </div>
                <div class="price-row">
                    <span class="price-label">Цена со скидкой:</span>
                    <span class="discount-price">$${discountPrice}</span>
                    <span class="discount-badge">-${product.discountPercentage.toFixed(0)}%</span>
                </div>
                ` : `
                <div class="price-row">
                    <span class="price-label">Цена:</span>
                    <span class="current-price">$${product.price}</span>
                </div>
                `}
            </div>
            </div>
        </div>
        `;
    }
    
    function loadProduct(productId) {
        if (!productId) {
        showError('ID товара не указан');
        return;
        }
        
        showLoading();
        
        fetch(`/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
            throw new Error('Товар не найден');
            }
            return response.json();
        })
        .then(product => {
            hideLoading();
            displayProduct(product);
        })
        .catch(error => {
            hideLoading();
            console.error('Ошибка:', error);
            showError('Ошибка загрузки товара');
        });
    }
    function displayProduct(product) {
        if (!productContainer) return;
        
        const productHTML = createProductHTML(product);
        productContainer.innerHTML = productHTML;
    }    
    function showError(message) {
        if (productContainer) {
        productContainer.innerHTML = `<p class="error">${message}</p>`;
        }
    }    
    if (backButton) {
        backButton.addEventListener('click', function() {
        // возвращаемся на главную страницу или на предыдущую страницу
        if (document.referrer && document.referrer.includes(window.location.hostname)) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
        });
    }
    const productId = getProductIdFromUrl();
    if (productId) {
        loadProduct(productId);
    } else {
        showError('ID товара не указан в URL');
    }
});