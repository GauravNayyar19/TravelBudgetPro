

const ChartManager = {
    /**
     * @param {string} chartId 
     * @param {Object} expensesByCategory 
     * @param {string} currency 
     * @returns {Chart} 
     */
    createCategoryBreakdownChart(chartId, expensesByCategory, currency) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        const categoryInfo = {
            accommodation: {
                label: 'Accommodation',
                color: '#1E88E5' 
            },
            food: {
                label: 'Food & Drinks',
                color: '#FFB300' 
            },
            transportation: {
                label: 'Transportation',
                color: '#43A047' 
            },
            activities: {
                label: 'Activities',
                color: '#8E24AA' 
            },
            shopping: {
                label: 'Shopping',
                color: '#E53935' 
            },
            other: {
                label: 'Other',
                color: '#546E7A' 
            }
        };
        
        const categories = Object.keys(expensesByCategory);
        const values = Object.values(expensesByCategory);
        const total = values.reduce((sum, val) => sum + val, 0);
        
        if (total === 0) {
            return this.createEmptyChart(chartId);
        }
        
        const labels = categories.map(cat => categoryInfo[cat]?.label || 'Other');
        const colors = categories.map(cat => categoryInfo[cat]?.color || '#546E7A');
        
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${BudgetCalculator.formatCurrency(value, currency)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * @param {string} chartId 
     * @returns {Chart} 
     */
    createEmptyChart(chartId) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No expenses yet'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#ECEFF1'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                events: [] 
            }
        });
        
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * @param {string} chartId 
     * @param {number} budget 
     * @param {number} spent 
     * @param {string} currency 
     * @returns {Chart} 
     */
    createBudgetComparisonChart(chartId, budget, spent, currency) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        const budgetColor = '#1E88E5'; 
        const spentColor = spent > budget ? '#E53935' : '#43A047'; 
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Budget', 'Spent'],
                datasets: [{
                    data: [budget, spent],
                    backgroundColor: [budgetColor, spentColor],
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return BudgetCalculator.formatCurrency(context.raw, currency);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return BudgetCalculator.formatCurrency(value, currency);
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * @param {string} chartId 
     * @param {Array} expenses 
     * @param {string} startDate 
     * @param {string} endDate 
     * @param {string} currency 
     * @returns {Chart}
     */
    createDailySpendingChart(chartId, expenses, startDate, endDate, currency) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        const dateRange = this.generateDateRange(startDate, endDate);
        
        const expensesByDate = {};
        dateRange.forEach(date => {
            expensesByDate[date] = 0;
        });
        
        expenses.forEach(expense => {
            if (expensesByDate.hasOwnProperty(expense.date)) {
                expensesByDate[expense.date] += expense.amount;
            }
        });
        
        const dates = Object.keys(expensesByDate);
        const spendingByDate = Object.values(expensesByDate);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Daily Spending',
                    data: spendingByDate,
                    borderColor: '#1E88E5',
                    backgroundColor: 'rgba(30, 136, 229, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#1E88E5',
                    pointBorderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return BudgetCalculator.formatCurrency(context.raw, currency);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return BudgetCalculator.formatCurrency(value, currency);
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Array} 
     */
    generateDateRange(startDate, endDate) {
        const result = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        let current = new Date(start);
        
        while (current <= end) {
            result.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        
        return result;
    }
};