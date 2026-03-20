// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Custom CRM JS loaded');
    
    // Инициализация всех компонентов
    initNavbarScroll();
    initTooltips();
    initFormValidation();
    initSearchFilter();
    initNotifications();
    initModalHandlers();
    initDragAndDrop();
    initCharts();
    initThemeToggle();
    initKeyboardShortcuts();
});

// ===== НАВИГАЦИЯ =====
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== ПОДСКАЗКИ =====
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const el = e.target;
    const text = el.getAttribute('title') || el.getAttribute('data-title');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip animate__animated animate__fadeIn';
    tooltip.textContent = text;
    tooltip.setAttribute('data-tooltip', '');
    
    document.body.appendChild(tooltip);
    
    const rect = el.getBoundingClientRect();
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('[data-tooltip]');
    if (tooltip) tooltip.remove();
}

// ===== ВАЛИДАЦИЯ ФОРМ =====
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', validateForm);
        
        // Валидация в реальном времени
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => validateField(input));
            input.addEventListener('blur', () => validateField(input));
        });
    });
}

function validateForm(e) {
    const form = e.target;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Дополнительная валидация
    const password = form.querySelector('input[type="password"]');
    const confirm = form.querySelector('input[name="password2"]');
    
    if (password && confirm && password.value !== confirm.value) {
        showFieldError(confirm, 'Пароли не совпадают');
        isValid = false;
    }
    
    if (!isValid) {
        e.preventDefault();
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
    }
}

function validateField(field) {
    if (!field.value && field.hasAttribute('required')) {
        showFieldError(field, 'Это поле обязательно');
        return false;
    }
    
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(field, 'Введите корректный email');
            return false;
        }
    }
    
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[\d\-\+\s\(\)]+$/;
        if (!phoneRegex.test(field.value)) {
            showFieldError(field, 'Введите корректный телефон');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorDiv = field.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    errorDiv.textContent = message;
    
    // Анимация
    field.classList.add('animate-shake');
    setTimeout(() => field.classList.remove('animate-shake'), 500);
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
        errorDiv.remove();
    }
}

// ===== ПОИСК И ФИЛЬТРАЦИЯ =====
function initSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.searchable-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const match = text.includes(searchTerm);
            
            if (match) {
                card.style.display = '';
                card.classList.add('animate__animated', 'animate__fadeIn');
                
                // Подсветка совпадений
                highlightMatches(card, searchTerm);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем/скрываем пустое состояние
        const visibleCards = document.querySelectorAll('.searchable-card[style="display: none;"]').length;
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = visibleCards === cards.length ? 'block' : 'none';
        }
    });
}

function highlightMatches(element, term) {
    if (!term) return;
    
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    
    textNodes.forEach(node => {
        const text = node.textContent;
        if (text.toLowerCase().includes(term)) {
            const span = document.createElement('span');
            span.innerHTML = text.replace(new RegExp(term, 'gi'), match => 
                `<span class="bg-warning bg-opacity-25">${match}</span>`
            );
            node.parentNode.replaceChild(span, node);
        }
    });
}

// ===== УВЕДОМЛЕНИЯ =====
function initNotifications() {
    // Автоматическое скрытие уведомлений
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => alert.remove(), 1000);
        }, 5000);
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show animate__animated animate__fadeInDown`;
    notification.innerHTML = `
        <i class="bi bi-${getIconForType(type)}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.main-content .container');
    if (container) {
        container.insertBefore(notification, container.firstChild);
        
        setTimeout(() => {
            notification.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => notification.remove(), 1000);
        }, 5000);
    }
}

function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function initModalHandlers() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.href;
            const itemName = this.closest('.card')?.querySelector('.card-title')?.textContent || 'элемент';
            
            showConfirmDialog(
                'Подтверждение удаления',
                `Вы уверены, что хотите удалить "${itemName}"?`,
                () => window.location.href = url
            );
        });
    });
}

function showConfirmDialog(title, message, onConfirm) {
    // Создаем затемнение
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'custom-modal animate__animated animate__fadeIn';
    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h5 class="custom-modal-title">${title}</h5>
                <button type="button" class="custom-modal-close">&times;</button>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-footer">
                <button type="button" class="btn btn-secondary" id="cancelModal">Отмена</button>
                <button type="button" class="btn btn-danger" id="confirmModal">Подтвердить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    // Обработчики
    const closeModal = () => {
        modal.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            overlay.remove();
            modal.remove();
        }, 300);
    };
    
    modal.querySelector('.custom-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancelModal').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    modal.querySelector('#confirmModal').addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
}

// ===== DRAG AND DROP =====
function initDragAndDrop() {
    const dealCards = document.querySelectorAll('.deal-card');
    const dealColumns = document.querySelectorAll('[data-stage]');
    
    dealCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    dealColumns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.id);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    const newStage = this.dataset.stage;
    
    if (draggable && newStage) {
        // Обновляем этап сделки
        updateDealStage(id, newStage);
        
        // Перемещаем карточку
        this.querySelector('.row').appendChild(draggable);
        
        showNotification('Этап сделки обновлен', 'success');
    }
}

function updateDealStage(dealId, newStage) {
    // Здесь должен быть AJAX запрос к серверу
    fetch(`/deal/${dealId}/update-stage/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ stage: newStage })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateBadge(dealId, newStage);
        }
    });
}

// ===== ГРАФИКИ =====
function initCharts() {
    // График сделок по этапам
    const dealChart = document.getElementById('dealChart');
    if (dealChart) {
        createDealChart(dealChart);
    }
    
    // График активности
    const activityChart = document.getElementById('activityChart');
    if (activityChart) {
        createActivityChart(activityChart);
    }
}

function createDealChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Получаем данные из data-атрибутов
    const stages = JSON.parse(canvas.dataset.stages || '[]');
    const counts = JSON.parse(canvas.dataset.counts || '[]');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: stages.length ? stages : ['Лиды', 'Связались', 'Предложение', 'Переговоры', 'Выиграно', 'Проиграно'],
            datasets: [{
                data: counts.length ? counts : [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#36b9cc', '#4e73df', '#f6c23e', 
                    '#e74a3b', '#1cc88a', '#858796'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function createActivityChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Активность',
                data: [12, 19, 15, 17, 14, 10, 8],
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// ===== ТЕМА (СВЕТЛАЯ/ТЕМНАЯ) =====
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.documentElement.style.setProperty('--light', '#1a1a2e');
        document.documentElement.style.setProperty('--dark', '#e5e5e5');
    } else {
        document.body.classList.remove('dark-theme');
        document.documentElement.style.setProperty('--light', '#f8f9fc');
        document.documentElement.style.setProperty('--dark', '#5a5c69');
    }
}

// ===== ГОРЯЧИЕ КЛАВИШИ =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + N - новый контакт
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            const newContactBtn = document.querySelector('a[href*="contact_create"]');
            if (newContactBtn) newContactBtn.click();
        }
        
        // Ctrl + D - новая сделка
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            const newDealBtn = document.querySelector('a[href*="deal_create"]');
            if (newDealBtn) newDealBtn.click();
        }
        
        // Ctrl + S - сохранить форму
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const form = document.querySelector('form');
            if (form) form.submit();
        }
        
        // Esc - закрыть модальные окна
        if (e.key === 'Escape') {
            const modal = document.querySelector('.custom-modal');
            if (modal) modal.remove();
        }
        
        // / - фокус на поиск
        if (e.key === '/') {
            e.preventDefault();
            const search = document.getElementById('searchInput');
            if (search) search.focus();
        }
    });
    
    // Показываем подсказку по горячим клавишам
    showShortcutsHint();
}

function showShortcutsHint() {
    const hint = document.createElement('div');
    hint.className = 'shortcuts-hint';
    hint.innerHTML = `
        <div class="shortcuts-hint-content">
            <i class="bi bi-keyboard"></i>
            <span>Ctrl+N - Новый контакт | Ctrl+D - Новая сделка | Ctrl+S - Сохранить | / - Поиск</span>
        </div>
    `;
    document.body.appendChild(hint);
    
    setTimeout(() => {
        hint.classList.add('fade-out');
        setTimeout(() => hint.remove(), 1000);
    }, 5000);
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function updateBadge(dealId, newStage) {
    const badge = document.querySelector(`#${dealId} .status-badge`);
    if (badge) {
        const stageNames = {
            'lead': 'Лиды',
            'contacted': 'Связались',
            'proposal': 'Предложение',
            'negotiation': 'Переговоры',
            'won': 'Выиграно',
            'lost': 'Проиграно'
        };
        
        badge.textContent = stageNames[newStage] || newStage;
        
        const colors = {
            'lead': 'bg-info',
            'contacted': 'bg-primary',
            'proposal': 'bg-warning',
            'negotiation': 'bg-warning',
            'won': 'bg-success',
            'lost': 'bg-danger'
        };
        
        badge.className = `badge ${colors[newStage]} status-badge`;
    }
}

// ===== АВТОСОХРАНЕНИЕ ФОРМ =====
let autoSaveTimeout;
const autoSaveForms = () => {
    const forms = document.querySelectorAll('form[data-autosave]');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    const formData = new FormData(form);
                    const data = {};
                    formData.forEach((value, key) => {
                        data[key] = value;
                    });
                    localStorage.setItem(`form_${window.location.pathname}`, JSON.stringify(data));
                    showNotification('Черновик сохранен', 'info');
                }, 1000);
            });
        });
        
        // Восстанавливаем сохраненные данные
        const saved = localStorage.getItem(`form_${window.location.pathname}`);
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) field.value = data[key];
            });
            showNotification('Восстановлен черновик', 'info');
        }
    });
};

// ===== СТАТИСТИКА АКТИВНОСТИ =====
function trackActivity() {
    const events = ['click', 'scroll', 'keydown'];
    let activityCount = 0;
    
    events.forEach(event => {
        document.addEventListener(event, () => {
            activityCount++;
            if (activityCount % 10 === 0) {
                // Отправка статистики на сервер (если нужно)
                console.log('User active');
            }
        });
    });
}

// Инициализация дополнительных функций
autoSaveForms();
trackActivity();

// Экспорт для использования в других файлах
window.showNotification = showNotification;
window.showConfirmDialog = showConfirmDialog;