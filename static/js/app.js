// State Management
let expenses = [];
let categoryChart = null;
let currentLimit = parseFloat(localStorage.getItem('monthlyLimit')) || 2000.00;

// Category Configurations (Colors and Budget Distribution %)
const categoryConfig = {
    'Alimentação': { color: '#facc15', pct: 0.25, icon: 'utensils' },
    'Transporte': { color: '#818cf8', pct: 0.15, icon: 'car' },
    'Moradia': { color: '#fb7185', pct: 0.35, icon: 'home' },
    'Saúde': { color: '#34d399', pct: 0.10, icon: 'heart-pulse' },
    'Lazer': { color: '#f472b6', pct: 0.08, icon: 'party-popper' },
    'Educação': { color: '#c084fc', pct: 0.05, icon: 'graduation-cap' },
    'Outros': { color: '#94a3b8', pct: 0.02, icon: 'more-horizontal' }
};

// DOM Elements
const expensesList = document.getElementById('expenses-list');
const totalSpentMonthEl = document.getElementById('total-spent-month');
const totalSpentCountEl = document.getElementById('total-spent-count');
const avgExpenseValEl = document.getElementById('avg-expense-val');
const currentLimitValEl = document.getElementById('current-limit-val');
const limitStatusEl = document.getElementById('limit-status');
const sidebarMonthTotalEl = document.getElementById('sidebar-month-total');
const sidebarBudgetProgressEl = document.getElementById('sidebar-budget-progress');
const sidebarBudgetLabelEl = document.getElementById('sidebar-budget-label');
const categoryBudgetsListEl = document.getElementById('category-budgets-list');
const transactionsCountEl = document.getElementById('transactions-count');

// Search & Filter
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const emptyStateEl = document.getElementById('empty-state');
const expensesTable = document.getElementById('expenses-table');

// Modals
const expenseModal = document.getElementById('expense-modal');
const limitModal = document.getElementById('limit-modal');
const expenseForm = document.getElementById('expense-form');
const limitForm = document.getElementById('limit-form');
const monthlyLimitInput = document.getElementById('monthly-limit-input');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Load expenses
    fetchExpenses();

    // Set default limits text
    currentLimitValEl.textContent = formatCurrency(currentLimit);

    // Event Listeners
    setupEventListeners();
});

// Setup All UI Event Listeners
function setupEventListeners() {
    // Add Expense Triggers
    document.querySelectorAll('.btn-add-expense-trigger').forEach(btn => {
        btn.addEventListener('click', () => openExpenseModal());
    });

    // Close Modal Buttons
    document.getElementById('btn-close-modal').addEventListener('click', () => closeExpenseModal());
    document.getElementById('btn-cancel-expense').addEventListener('click', () => closeExpenseModal());
    document.getElementById('btn-close-limit-modal').addEventListener('click', () => closeLimitModal());
    document.getElementById('btn-cancel-limit').addEventListener('click', () => closeLimitModal());

    // Edit Limit Trigger
    document.getElementById('btn-edit-limit').addEventListener('click', () => openLimitModal());

    // Forms
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    limitForm.addEventListener('submit', handleLimitSubmit);

    // Filter and Search
    searchInput.addEventListener('input', renderUI);
    categoryFilter.addEventListener('change', renderUI);

    // Close Modals on click outside
    window.addEventListener('click', (e) => {
        if (e.target === expenseModal) closeExpenseModal();
        if (e.target === limitModal) closeLimitModal();
    });

    // Sidebar navigation mock behaviors
    document.getElementById('btn-nav-dashboard').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.getElementById('btn-nav-transactions').addEventListener('click', (e) => {
        e.preventDefault();
        const element = document.querySelector('.transactions-section');
        element.scrollIntoView({ behavior: 'smooth' });
    });
}

// Fetch Data from API
async function fetchExpenses() {
    try {
        const response = await fetch('/api/expenses');
        if (!response.ok) throw new Error('Falha ao buscar despesas.');
        expenses = await response.ok ? await response.json() : [];
        renderUI();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Format currency standard BRL
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format date to local PT-BR
function formatDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Get Year-Month key for current date (YYYY-MM)
function getCurrentYearMonth() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
}

// Render Dashboard Data
function renderUI() {
    const currentYM = getCurrentYearMonth();
    
    // Filter expenses of the current month for calculation
    const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentYM));
    
    // Total spent this month
    const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.value, 0);
    
    // Update summary metrics
    totalSpentMonthEl.textContent = formatCurrency(totalSpent);
    sidebarMonthTotalEl.textContent = formatCurrency(totalSpent);
    totalSpentCountEl.textContent = `${currentMonthExpenses.length} gasto${currentMonthExpenses.length !== 1 ? 's' : ''} cadastrado${currentMonthExpenses.length !== 1 ? 's' : ''}`;
    
    // Average spent
    const avgSpent = currentMonthExpenses.length > 0 ? totalSpent / currentMonthExpenses.length : 0;
    avgExpenseValEl.textContent = formatCurrency(avgSpent);

    // Limit progress
    const pctSpent = currentLimit > 0 ? (totalSpent / currentLimit) * 100 : 0;
    sidebarBudgetProgressEl.style.width = `${Math.min(pctSpent, 100)}%`;
    sidebarBudgetLabelEl.textContent = `${pctSpent.toFixed(1)}% do limite atingido`;
    
    // Color status for limit progress bar and text
    if (pctSpent >= 100) {
        sidebarBudgetProgressEl.style.background = 'var(--color-expense)';
        limitStatusEl.innerHTML = `<span style="color: var(--color-expense); font-weight: 600;">Limite Estourado</span>`;
    } else if (pctSpent >= 80) {
        sidebarBudgetProgressEl.style.background = '#eab308'; // warning yellow
        limitStatusEl.innerHTML = `<span style="color: #eab308; font-weight: 600;">Atenção (80%+)</span>`;
    } else {
        sidebarBudgetProgressEl.style.background = 'linear-gradient(90deg, var(--color-primary), var(--color-accent))';
        limitStatusEl.textContent = 'Dentro do limite planejado';
    }

    // Category progress bars
    renderCategoryBudgets(currentMonthExpenses);

    // Filter table list
    renderTable();

    // Render / Update Chart
    renderChart(currentMonthExpenses);

    // Refresh icons
    lucide.createIcons();
}

// Render Category Budget limits
function renderCategoryBudgets(currentMonthExpenses) {
    categoryBudgetsListEl.innerHTML = '';
    
    Object.keys(categoryConfig).forEach(category => {
        const config = categoryConfig[category];
        const categoryLimit = currentLimit * config.pct;
        
        // Sum spent in this category
        const spent = currentMonthExpenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.value, 0);
        
        const pct = categoryLimit > 0 ? (spent / categoryLimit) * 100 : 0;
        
        // Determine fill color
        let fillColor = config.color;
        if (pct >= 100) {
            fillColor = 'var(--color-expense)';
        }

        const itemHtml = `
            <div class="category-budget-item">
                <div class="budget-item-header">
                    <span class="budget-item-name">${category}</span>
                    <span class="budget-item-values">
                        <span class="${pct >= 100 ? 'accent' : ''}">${formatCurrency(spent)}</span>
                        / ${formatCurrency(categoryLimit)}
                    </span>
                </div>
                <div class="budget-item-bar">
                    <div class="budget-item-fill" style="width: ${Math.min(pct, 100)}%; background-color: ${fillColor}"></div>
                </div>
            </div>
        `;
        categoryBudgetsListEl.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// Render and filter Transactions Table
function renderTable() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCat = categoryFilter.value;

    const filtered = expenses.filter(exp => {
        const matchesSearch = exp.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCat === 'all' || exp.category === selectedCat;
        return matchesSearch && matchesCategory;
    });

    // Update count badge
    transactionsCountEl.textContent = filtered.length;

    // Show empty state if nothing matches
    if (filtered.length === 0) {
        expensesTable.classList.add('hidden');
        emptyStateEl.classList.remove('hidden');
    } else {
        expensesTable.classList.remove('hidden');
        emptyStateEl.classList.add('hidden');
        
        expensesList.innerHTML = '';
        filtered.forEach(exp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="expense-name-cell">${escapeHTML(exp.name)}</td>
                <td>
                    <span class="category-tag tag-${normalizeCategory(exp.category)}">
                        <i data-lucide="${getCategoryIcon(exp.category)}" style="width: 13px; height: 13px;"></i>
                        ${exp.category}
                    </span>
                </td>
                <td>${formatDate(exp.date)}</td>
                <td class="expense-value-cell">${formatCurrency(exp.value)}</td>
                <td class="text-right actions-cell">
                    <button class="btn-action btn-edit" onclick="editExpense(${exp.id})" title="Editar">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteExpense(${exp.id})" title="Excluir">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;
            expensesList.appendChild(tr);
        });
    }
}

// Render/Update Chart.js Doughnut Chart
function renderChart(currentMonthExpenses) {
    const chartData = {};
    
    // Group values by category
    currentMonthExpenses.forEach(exp => {
        chartData[exp.category] = (chartData[exp.category] || 0) + exp.value;
    });

    const categories = Object.keys(chartData);
    const values = Object.values(chartData);
    const colors = categories.map(cat => categoryConfig[cat]?.color || '#94a3b8');

    const canvas = document.getElementById('categoryChart');
    const emptyChartEl = document.getElementById('no-chart-data');

    if (categories.length === 0) {
        canvas.classList.add('hidden');
        emptyChartEl.classList.remove('hidden');
        return;
    }

    canvas.classList.remove('hidden');
    emptyChartEl.classList.add('hidden');

    if (categoryChart) {
        // Update existing chart
        categoryChart.data.labels = categories;
        categoryChart.data.datasets[0].data = values;
        categoryChart.data.datasets[0].backgroundColor = colors;
        categoryChart.update();
    } else {
        // Create new chart
        categoryChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: '#151d30', // match card background
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#94a3b8',
                            font: {
                                family: 'Outfit',
                                size: 12
                            },
                            padding: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw;
                                return ` ${context.label}: ${formatCurrency(val)}`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// Modal Management
function openExpenseModal(expenseToEdit = null) {
    expenseForm.reset();
    document.getElementById('expense-id').value = '';
    
    if (expenseToEdit) {
        document.getElementById('modal-title').textContent = 'Editar Gasto';
        document.getElementById('expense-id').value = expenseToEdit.id;
        document.getElementById('expense-name').value = expenseToEdit.name;
        document.getElementById('expense-value').value = expenseToEdit.value;
        document.getElementById('expense-category').value = expenseToEdit.category;
        document.getElementById('expense-date').value = expenseToEdit.date;
    } else {
        document.getElementById('modal-title').textContent = 'Adicionar Novo Gasto';
        // Set default date to today in YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;
    }
    
    expenseModal.classList.add('active');
    document.getElementById('expense-name').focus();
}

function closeExpenseModal() {
    expenseModal.classList.remove('active');
}

function openLimitModal() {
    monthlyLimitInput.value = currentLimit;
    limitModal.classList.add('active');
    monthlyLimitInput.focus();
}

function closeLimitModal() {
    limitModal.classList.remove('active');
}

// Handle Form Submission: Expense
async function handleExpenseSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('expense-id').value;
    const expenseData = {
        name: document.getElementById('expense-name').value.trim(),
        value: parseFloat(document.getElementById('expense-value').value),
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value
    };

    const isEdit = id !== '';
    const url = isEdit ? `/api/expenses/${id}` : '/api/expenses';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Erro ao salvar despesa.');
        }

        showToast(isEdit ? 'Gasto atualizado com sucesso!' : 'Gasto adicionado com sucesso!', 'success');
        closeExpenseModal();
        fetchExpenses();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Handle Form Submission: Limit
function handleLimitSubmit(e) {
    e.preventDefault();
    const val = parseFloat(monthlyLimitInput.value);
    if (isNaN(val) || val <= 0) {
        showToast('Insira um limite válido superior a 0.', 'error');
        return;
    }
    currentLimit = val;
    localStorage.setItem('monthlyLimit', currentLimit.toFixed(2));
    currentLimitValEl.textContent = formatCurrency(currentLimit);
    closeLimitModal();
    renderUI();
    showToast('Meta de gastos atualizada com sucesso!', 'success');
}

// Global actions triggered from inline click
window.editExpense = function(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        openExpenseModal(expense);
    }
};

window.deleteExpense = async function(id) {
    if (confirm('Deseja realmente excluir este gasto?')) {
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Falha ao excluir despesa.');
            
            showToast('Gasto excluído com sucesso!', 'success');
            fetchExpenses();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove toast after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utilities
function normalizeCategory(category) {
    return category.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\s+/g, '-');
}

function getCategoryIcon(category) {
    return categoryConfig[category]?.icon || 'tag';
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
