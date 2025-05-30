document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const loadingDiv = document.getElementById('loading');    
    let currentSearchQuery = '';
    let isLoading = false;
    
    function showLoading() {
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (productsContainer) productsContainer.innerHTML = '';
        isLoading = true;
    }        
    function hideLoading() {
        if (loadingDiv) loadingDiv.style.display = 'none';
        isLoading = false;
    }        
    // вычисление цены со скидкой
    function calculateDiscountPrice(price, discountPercentage) {
        if (!price || isNaN(price)) return '0.00';
        return discountPercentage ? (price - (price * discountPercentage / 100)).toFixed(2) : price.toFixed(2);
    }           
    function createProductCard(product) {
        if (!product || !product.id) {
            console.warn('Получен некорректный товар:', product);
            return '';
        }        
        const discountPrice = calculateDiscountPrice(product.price, product.discountPercentage);
        const hasDiscount = product.discountPercentage > 0;
        const imageUrl = product.thumbnail || (product.images && product.images[0]) || '/placeholder.png';
        const title = product.title || 'Без названия';        
        return `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${imageUrl}" 
                 alt="${title}" 
                 class="product-image"
                 onerror="this.src='/placeholder.png'">
            <div class="product-info">
                <h3 class="product-title">${title}</h3>
                <div class="product-prices-button">
                    <div class="product-prices">
                        ${hasDiscount ? `<span class="original-price">$${product.price.toFixed(2)}</span>` : ''}
                        <span class="discount-price">$${discountPrice}</span>
                    </div>
                    <button class="product-button" onclick="goToProduct(${product.id})">🛈</button>
                </div>
            </div>
        </div>
        `;
    }           
    function displayProducts(products, searchQuery = '') {
        if (!productsContainer) return;
        
        if (!products || products.length === 0) {
            const message = searchQuery ? 
                `По запросу "${searchQuery}" товары не найдены` : 
                'Товары не найдены';
            productsContainer.innerHTML = `
                <div class="no-products" style="text-align: center; padding: 50px;">
                    <p style="font-size: 1.2rem; color: #666; margin-bottom: 20px;">${message}</p>
                    ${searchQuery ? '<button onclick="clearSearch()" class="clear-search-btn">Показать все товары</button>' : ''}
                </div>
            `;
            return;
        }        
        const validProducts = products.filter(product => product && product.id);
        if (validProducts.length !== products.length) {
            console.warn(`Отфильтровано ${products.length - validProducts.length} некорректных товаров`);
        }        
        const cardsHTML = validProducts.map(product => createProductCard(product)).join('');
        productsContainer.innerHTML = cardsHTML;
        
        if (searchQuery) {
            console.log(`Найдено ${validProducts.length} товаров по запросу "${searchQuery}"`);
        }
    }          
    function loadProducts(searchQuery = '') {
        if (isLoading) {
            console.log('Запрос уже выполняется, ожидайте...');
            return;
        }        
        const trimmedQuery = searchQuery.trim();
        console.log('Загружаем товары с запросом:', trimmedQuery);        
        showLoading();
        currentSearchQuery = trimmedQuery;        
        let apiUrl = '/api/products';
        if (trimmedQuery !== '') {
            if (trimmedQuery.length > 100) {
                hideLoading();
                displayError('Поисковый запрос слишком длинный (максимум 100 символов)');
                return;
            }            
            apiUrl = `/api/products?q=${encodeURIComponent(trimmedQuery)}`;
            console.log('Выполняется поиск товаров');
        } else {
            console.log('Загружаются все товары');
        }                
        console.log('API URL:', apiUrl);        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд        
        fetch(apiUrl, { signal: controller.signal })
            .then(response => {
                clearTimeout(timeoutId);
                console.log('Ответ сервера:', response.status, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Полученные данные:', data);                
                hideLoading();               
                if (currentSearchQuery !== trimmedQuery) {
                    console.log('Поисковый запрос изменился, игнорируем результат');
                    return;
                }                
                if (data && data.products && Array.isArray(data.products)) {
                    console.log(`Получено ${data.products.length} товаров`);
                    console.log('Общее количество:', data.total || 'неизвестно');
                    displayProducts(data.products, trimmedQuery);
                } else if (Array.isArray(data)) {
                    console.log(`Получен массив из ${data.length} товаров`);
                    displayProducts(data, trimmedQuery);
                } else {
                    console.error('Неожиданная структура данных:', data);
                    displayError('Получены данные в неожиданном формате');
                }
            })
            .catch(error => {
                clearTimeout(timeoutId);
                hideLoading();                
                if (error.name === 'AbortError') {
                    console.error('Запрос прерван по таймауту');
                    displayError('Запрос занял слишком много времени. Попробуйте еще раз.');
                } else {
                    console.error('Ошибка загрузки:', error);
                    displayError(`Ошибка загрузки товаров: ${error.message}`);
                }
            });
    }    
    function displayError(message) {
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="error" style="text-align: center; padding: 50px;">
                    <p style="color: red; font-size: 1.1rem; margin-bottom: 20px;">${message}</p>
                    <button onclick="location.reload()" class="retry-btn">Обновить страницу</button>
                </div>
            `;
        }
    }        
    function performSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        console.log('Выполняем поиск с запросом:', query); 
        loadProducts(query);
    }    
    window.clearSearch = function() {
        if (searchInput) searchInput.value = '';
        currentSearchQuery = '';
        loadProducts();
    };    
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
    }    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });        
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            if (this.value.trim() === '') {
                console.log('Поле поиска очищено, загружаем все товары');
                loadProducts();
            } else {
                searchTimeout = setTimeout(() => {
                    if (this.value.trim() !== currentSearchQuery) {
                        performSearch();
                    }
                }, 500);
            }
        });
    }       
    window.goToProduct = function(productId) {
        if (!productId || isNaN(productId)) {
            console.error('Некорректный ID товара:', productId);
            return;
        }
        window.location.href = `/product.html?id=${productId}`;
    };    
    
    console.log('Инициализация: загружаем все товары');
    loadProducts();
});
