

const BudgetCalculator = {
    /**
     * 
     * @param {Object} trip 
     * @returns {number} 
     */
    calculateRemainingBudget(trip) {
        const totalExpenses = this.calculateTotalExpenses(trip);
        return trip.budget - totalExpenses;
    },
    
    /**
     * @param {Object} trip 
     * @returns {number} 
     */
    calculateTotalExpenses(trip) {
        if (!trip.expenses || trip.expenses.length === 0) {
            return 0;
        }
        
        return trip.expenses.reduce((total, expense) => {
            return total + expense.amount;
        }, 0);
    },
    
    /**
    
     * @param {Object} trip
     * @returns {number} 
     */
    calculateDailyBudget(trip) {
        const duration = this.calculateTripDuration(trip);
        const remainingBudget = this.calculateRemainingBudget(trip);
        
        if (duration <= 0) {
            return remainingBudget;
        }
        
        return remainingBudget / duration;
    },
    
    /**
    
     * @param {Object} trip 
     * @returns {number} 
     */
    calculateTripDuration(trip) {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        
        const durationMs = endDate - startDate;
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; 
        
        return durationDays;
    },
    
    /**
     * @param {Object} trip 
     * @returns {number} 
     */
    calculateBudgetProgress(trip) {
        const totalExpenses = this.calculateTotalExpenses(trip);
        
        if (trip.budget <= 0) {
            return 0;
        }
        
        const percentage = (totalExpenses / trip.budget) * 100;
        return Math.min(percentage, 100); // Cap at 100%
    },
    
    /**
    
     * @param {Object} trip 
     * @returns {Object} 
     */
    calculateExpensesByCategory(trip) {
        if (!trip.expenses || trip.expenses.length === 0) {
            return {};
        }
        
        const categories = {
            accommodation: 0,
            food: 0,
            transportation: 0,
            activities: 0,
            shopping: 0,
            other: 0
        };
        
        trip.expenses.forEach(expense => {
            if (categories.hasOwnProperty(expense.category)) {
                categories[expense.category] += expense.amount;
            } else {
                categories.other += expense.amount;
            }
        });
        
        return categories;
    },
    
    /**
    
     * @param {Object} trip 
     * @returns {Object}
     */
    calculateCategoryPercentages(trip) {
        const categories = this.calculateExpensesByCategory(trip);
        const totalExpenses = this.calculateTotalExpenses(trip);
        
        if (totalExpenses <= 0) {
            return Object.keys(categories).reduce((result, category) => {
                result[category] = 0;
                return result;
            }, {});
        }
        
        return Object.keys(categories).reduce((result, category) => {
            result[category] = (categories[category] / totalExpenses) * 100;
            return result;
        }, {});
    },
    
    /**
    
     * @param {number} amount 
     * @param {string} currency 
     * @returns {string} 
     */
    formatCurrency(amount, currency = 'USD') {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: 'CA$',
            AUD: 'A$',
            INR: '₹'
        };
        
        const symbol = currencySymbols[currency] || currency;
        
        let formattedAmount;
        
        if (currency === 'JPY') {
            formattedAmount = Math.round(amount).toLocaleString();
        } else {
            formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
        
        return `${symbol}${formattedAmount}`;
    },
    
    /**
     * @param {Object} trip 
     * @returns {boolean} 
     */
    isOverBudget(trip) {
        return this.calculateRemainingBudget(trip) < 0;
    },
    
    /**
     * @param {Object} trip 
     * @returns {string} 
     */
    getDateRangeText(trip) {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        
        const options = { month: 'short', day: 'numeric' };
        
        if (startDate.getFullYear() !== endDate.getFullYear()) {
            options.year = 'numeric';
        }
        
        const startFormatted = startDate.toLocaleDateString('en-US', options);
        
        if (endDate.getFullYear() !== new Date().getFullYear()) {
            options.year = 'numeric';
        }
        
        const endFormatted = endDate.toLocaleDateString('en-US', options);
        
        return `${startFormatted} - ${endFormatted}`;
    },
    
    /**
     * @param {Object} trip
     * @returns {string} 
     */
    getTripStatus(trip) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const startDate = new Date(trip.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(trip.endDate);
        endDate.setHours(23, 59, 59, 999); 
        
        if (today < startDate) {
            return 'upcoming';
        } else if (today > endDate) {
            return 'past';
        } else {
            return 'ongoing';
        }
    }
};
