/**
 * Budget Calculator module
 * Handles all budget calculations for the trip
 */

const BudgetCalculator = {
    /**
     * Calculate the remaining budget for a trip
     * @param {Object} trip - The trip object
     * @returns {number} The remaining budget
     */
    calculateRemainingBudget(trip) {
        const totalExpenses = this.calculateTotalExpenses(trip);
        return trip.budget - totalExpenses;
    },
    
    /**
     * Calculate the total expenses for a trip
     * @param {Object} trip - The trip object
     * @returns {number} The total expenses
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
     * Calculate the daily budget for a trip
     * @param {Object} trip - The trip object
     * @returns {number} The daily budget
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
     * Calculate the duration of a trip in days
     * @param {Object} trip - The trip object
     * @returns {number} The trip duration in days
     */
    calculateTripDuration(trip) {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        
        // Calculate difference in milliseconds and convert to days
        const durationMs = endDate - startDate;
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        
        return durationDays;
    },
    
    /**
     * Calculate the budget progress percentage
     * @param {Object} trip - The trip object
     * @returns {number} The percentage of budget used (0-100)
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
     * Calculate expenses by category
     * @param {Object} trip - The trip object
     * @returns {Object} Object with category totals
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
     * Calculate the percentage of each category in the total expenses
     * @param {Object} trip - The trip object
     * @returns {Object} Object with category percentages
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
     * Format a number as currency
     * @param {number} amount - The amount to format
     * @param {string} currency - The currency code (USD, EUR, etc.)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'USD') {
        // Get currency symbols and formats
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: 'CA$',
            AUD: 'A$',
            INR: '₹'
        };
        
        // Get the symbol, default to currency code if not found
        const symbol = currencySymbols[currency] || currency;
        
        // Format the number appropriately based on currency
        let formattedAmount;
        
        if (currency === 'JPY') {
            // No decimal places for JPY
            formattedAmount = Math.round(amount).toLocaleString();
        } else {
            // 2 decimal places for other currencies
            formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
        
        return `${symbol}${formattedAmount}`;
    },
    
    /**
     * Calculate if trip is over budget
     * @param {Object} trip - The trip object
     * @returns {boolean} True if trip is over budget
     */
    isOverBudget(trip) {
        return this.calculateRemainingBudget(trip) < 0;
    },
    
    /**
     * Get human-readable date range
     * @param {Object} trip - The trip object
     * @returns {string} Formatted date range
     */
    getDateRangeText(trip) {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        
        const options = { month: 'short', day: 'numeric' };
        
        // If different years, include year in both
        if (startDate.getFullYear() !== endDate.getFullYear()) {
            options.year = 'numeric';
        }
        
        const startFormatted = startDate.toLocaleDateString('en-US', options);
        
        // Always include year in end date if different from today's year
        if (endDate.getFullYear() !== new Date().getFullYear()) {
            options.year = 'numeric';
        }
        
        const endFormatted = endDate.toLocaleDateString('en-US', options);
        
        return `${startFormatted} - ${endFormatted}`;
    },
    
    /**
     * Check if a trip is upcoming, ongoing, or past
     * @param {Object} trip - The trip object
     * @returns {string} 'upcoming', 'ongoing', or 'past'
     */
    getTripStatus(trip) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time component for proper comparison
        
        const startDate = new Date(trip.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(trip.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        
        if (today < startDate) {
            return 'upcoming';
        } else if (today > endDate) {
            return 'past';
        } else {
            return 'ongoing';
        }
    }
};
