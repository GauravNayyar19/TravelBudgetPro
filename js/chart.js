/**
 * Chart module
 * Handles chart creation and updates
 * 
 * This file serves as a wrapper for Chart.js functionality,
 * with specific implementations for the travel budget app
 */

const ChartManager = {
    /**
     * Create or update a category breakdown doughnut chart
     * @param {string} chartId - The ID of the canvas element
     * @param {Object} expensesByCategory - Object with category totals
     * @param {string} currency - The currency code
     * @returns {Chart} The Chart.js instance
     */
    createCategoryBreakdownChart(chartId, expensesByCategory, currency) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        // Category info
        const categoryInfo = {
            accommodation: {
                label: 'Accommodation',
                color: '#1E88E5' // travel-blue
            },
            food: {
                label: 'Food & Drinks',
                color: '#FFB300' // travel-yellow
            },
            transportation: {
                label: 'Transportation',
                color: '#43A047' // travel-green
            },
            activities: {
                label: 'Activities',
                color: '#8E24AA' // travel-purple
            },
            shopping: {
                label: 'Shopping',
                color: '#E53935' // travel-red
            },
            other: {
                label: 'Other',
                color: '#546E7A' // travel-gray
            }
        };
        
        // Prepare data
        const categories = Object.keys(expensesByCategory);
        const values = Object.values(expensesByCategory);
        const total = values.reduce((sum, val) => sum + val, 0);
        
        // If there are no expenses, show empty chart
        if (total === 0) {
            return this.createEmptyChart(chartId);
        }
        
        // Prepare chart data
        const labels = categories.map(cat => categoryInfo[cat]?.label || 'Other');
        const colors = categories.map(cat => categoryInfo[cat]?.color || '#546E7A');
        
        // Destroy existing chart if it exists
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        // Create chart
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
        
        // Store chart reference
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * Create an empty chart when no data is available
     * @param {string} chartId - The ID of the canvas element
     * @returns {Chart} The Chart.js instance
     */
    createEmptyChart(chartId) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        // Create empty chart
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
                events: [] // Disable all events
            }
        });
        
        // Store chart reference
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * Create a budget vs. spending bar chart
     * @param {string} chartId - The ID of the canvas element
     * @param {number} budget - The total budget
     * @param {number} spent - The amount spent
     * @param {string} currency - The currency code
     * @returns {Chart} The Chart.js instance
     */
    createBudgetComparisonChart(chartId, budget, spent, currency) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        // Colors
        const budgetColor = '#1E88E5'; // travel-blue
        const spentColor = spent > budget ? '#E53935' : '#43A047'; // red if over budget, green otherwise
        
        // Create chart
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
        
        // Store chart reference
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * Create a daily spending line chart
     * @param {string} chartId - The ID of the canvas element
     * @param {Array} expenses - Array of expense objects
     * @param {string} startDate - Start date string (YYYY-MM-DD)
     * @param {string} endDate - End date string (YYYY-MM-DD)
     * @param {string} currency - The currency code
     * @returns {Chart} The Chart.js instance
     */
    createDailySpendingChart(chartId, expenses, startDate, endDate, currency) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.budgetCharts && window.budgetCharts[chartId]) {
            window.budgetCharts[chartId].destroy();
        }
        
        // Generate array of dates between start and end
        const dateRange = this.generateDateRange(startDate, endDate);
        
        // Group expenses by date
        const expensesByDate = {};
        dateRange.forEach(date => {
            expensesByDate[date] = 0;
        });
        
        expenses.forEach(expense => {
            if (expensesByDate.hasOwnProperty(expense.date)) {
                expensesByDate[expense.date] += expense.amount;
            }
        });
        
        // Prepare data for chart
        const dates = Object.keys(expensesByDate);
        const spendingByDate = Object.values(expensesByDate);
        
        // Create chart
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
        
        // Store chart reference
        if (!window.budgetCharts) {
            window.budgetCharts = {};
        }
        window.budgetCharts[chartId] = chart;
        
        return chart;
    },
    
    /**
     * Generate an array of date strings between start and end dates
     * @param {string} startDate - Start date string (YYYY-MM-DD)
     * @param {string} endDate - End date string (YYYY-MM-DD)
     * @returns {Array} Array of date strings
     */
    generateDateRange(startDate, endDate) {
        const result = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Reset time to ensure proper comparison
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
