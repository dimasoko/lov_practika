// animation.js - Полная реализация анимации пульсации

/**
 * Создаёт анимацию пульсации (волна от центра)
 * @param {HTMLElement} container - Элемент, относительно которого позиционируется волна
 * @param {Object} options - Параметры анимации
 * @param {string} options.color - Цвет волны в формате rgba
 * @param {number} options.startSize - Начальный размер волны (px)
 * @param {number} options.endSize - Конечный размер волны (px)
 * @param {number} options.duration - Длительность анимации (ms)
 */
function createPulseAnimation(container, options = {}) {
    // Проверка наличия контейнера
    if (!container) {
        console.warn('Контейнер для анимации не найден');
        return;
    }

    // Проверка поддержки getBoundingClientRect
    if (!container.getBoundingClientRect) {
        console.warn('Метод getBoundingClientRect не поддерживается');
        return;
    }

    // Настройки по умолчанию
    const defaults = {
        color: 'rgba(178, 141, 200, 0.5)',
        startSize: 1000,
        endSize: 3000,
        duration: 600,
    };
    
    const settings = { ...defaults, ...options };

    try {
        // Получаем позицию контейнера
        const rect = container.getBoundingClientRect();
        
        // Учитываем прокрутку страницы
        const scrollTop = window.scrollY || window.pageYOffset;
        const scrollLeft = window.scrollX || window.pageXOffset;
        
        // Вычисляем центр контейнера
        const centerX = rect.left + scrollLeft + rect.width / 2;
        const centerY = rect.top + scrollTop + rect.height / 2;

        // Создаём элемент анимации
        const pulse = document.createElement('div');
        pulse.className = 'pulse';
        
        // Базовые стили
        Object.assign(pulse.style, {
            position: 'fixed',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${settings.color} 0%, transparent 70%)`,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            transition: `width ${settings.duration}ms ease, height ${settings.duration}ms ease, opacity ${settings.duration}ms ease`,
            left: `${centerX}px`,
            top: `${centerY}px`,
            width: `${settings.startSize}px`,
            height: `${settings.startSize}px`,
            opacity: '1',
            zIndex: '1000', // Убедимся, что анимация поверх других элементов
            willChange: 'width, height, opacity' // Оптимизация для GPU
        });

        // Добавляем элемент в DOM
        document.body.appendChild(pulse);

        // Запускаем анимацию через requestAnimationFrame
        requestAnimationFrame(() => {
            pulse.style.width = `${settings.endSize}px`;
            pulse.style.height = `${settings.endSize}px`;
            pulse.style.opacity = '0';
        });

        // Удаляем элемент после завершения анимации
        const handleTransitionEnd = () => {
            if (pulse.parentNode) {
                document.body.removeChild(pulse);
            }
            pulse.removeEventListener('transitionend', handleTransitionEnd);
        };
        
        pulse.addEventListener('transitionend', handleTransitionEnd);
        
    } catch (error) {
        console.error('Ошибка при запуске анимации:', error);
    }
}