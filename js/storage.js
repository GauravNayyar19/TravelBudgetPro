/**
 * Storage module
 * Handles all localStorage operations for the application
 */

const Storage = {
    /**
     * Key used for storing trips in localStorage
     */
    TRIPS_STORAGE_KEY: 'travelBudgetTrips',
    
    /**
     * Key used for storing current trip ID in localStorage
     */
    CURRENT_TRIP_KEY: 'travelBudgetCurrentTrip',
    
    /**
     * Get all trips from localStorage
     * @returns {Array} Array of trip objects
     */
    getTrips() {
        const tripsJson = localStorage.getItem(this.TRIPS_STORAGE_KEY);
        return tripsJson ? JSON.parse(tripsJson) : [];
    },
    
    /**
     * Save trips to localStorage
     * @param {Array} trips - Array of trip objects
     */
    saveTrips(trips) {
        localStorage.setItem(this.TRIPS_STORAGE_KEY, JSON.stringify(trips));
    },
    
    /**
     * Add a new trip to localStorage
     * @param {Object} trip - The trip object to add
     */
    addTrip(trip) {
        const trips = this.getTrips();
        trips.push(trip);
        this.saveTrips(trips);
    },
    
    /**
     * Get a trip by ID
     * @param {string} tripId - The ID of the trip to retrieve
     * @returns {Object|null} The trip object or null if not found
     */
    getTripById(tripId) {
        const trips = this.getTrips();
        return trips.find(trip => trip.id === tripId) || null;
    },
    
    /**
     * Update a trip
     * @param {string} tripId - The ID of the trip to update
     * @param {Object} updatedTrip - The updated trip object
     * @returns {boolean} True if update successful, false otherwise
     */
    updateTrip(tripId, updatedTrip) {
        const trips = this.getTrips();
        const index = trips.findIndex(trip => trip.id === tripId);
        
        if (index === -1) {
            return false;
        }
        
        trips[index] = updatedTrip;
        this.saveTrips(trips);
        return true;
    },
    
    /**
     * Delete a trip
     * @param {string} tripId - The ID of the trip to delete
     * @returns {boolean} True if deletion successful, false otherwise
     */
    deleteTrip(tripId) {
        const trips = this.getTrips();
        const filteredTrips = trips.filter(trip => trip.id !== tripId);
        
        if (filteredTrips.length === trips.length) {
            return false; // No trip was removed
        }
        
        this.saveTrips(filteredTrips);
        
        // If the deleted trip was the current trip, clear current trip
        if (this.getCurrentTripId() === tripId) {
            this.clearCurrentTrip();
        }
        
        return true;
    },
    
    /**
     * Add an expense to a trip
     * @param {string} tripId - The ID of the trip to add the expense to
     * @param {Object} expense - The expense object to add
     * @returns {boolean} True if addition successful, false otherwise
     */
    addExpense(tripId, expense) {
        const trip = this.getTripById(tripId);
        
        if (!trip) {
            return false;
        }
        
        // Initialize expenses array if it doesn't exist
        if (!trip.expenses) {
            trip.expenses = [];
        }
        
        trip.expenses.push(expense);
        return this.updateTrip(tripId, trip);
    },
    
    /**
     * Update an expense
     * @param {string} tripId - The ID of the trip containing the expense
     * @param {string} expenseId - The ID of the expense to update
     * @param {Object} updatedExpense - The updated expense object
     * @returns {boolean} True if update successful, false otherwise
     */
    updateExpense(tripId, expenseId, updatedExpense) {
        const trip = this.getTripById(tripId);
        
        if (!trip || !trip.expenses) {
            return false;
        }
        
        const index = trip.expenses.findIndex(expense => expense.id === expenseId);
        
        if (index === -1) {
            return false;
        }
        
        trip.expenses[index] = updatedExpense;
        return this.updateTrip(tripId, trip);
    },
    
    /**
     * Delete an expense
     * @param {string} tripId - The ID of the trip containing the expense
     * @param {string} expenseId - The ID of the expense to delete
     * @returns {boolean} True if deletion successful, false otherwise
     */
    deleteExpense(tripId, expenseId) {
        const trip = this.getTripById(tripId);
        
        if (!trip || !trip.expenses) {
            return false;
        }
        
        const originalLength = trip.expenses.length;
        trip.expenses = trip.expenses.filter(expense => expense.id !== expenseId);
        
        if (trip.expenses.length === originalLength) {
            return false; // No expense was removed
        }
        
        return this.updateTrip(tripId, trip);
    },
    
    /**
     * Get all expenses for a trip
     * @param {string} tripId - The ID of the trip
     * @returns {Array} Array of expense objects
     */
    getExpenses(tripId) {
        const trip = this.getTripById(tripId);
        return trip && trip.expenses ? trip.expenses : [];
    },
    
    /**
     * Get expenses filtered by category
     * @param {string} tripId - The ID of the trip
     * @param {string} category - The category to filter by, or 'all' for all categories
     * @returns {Array} Array of filtered expense objects
     */
    getExpensesByCategory(tripId, category) {
        const expenses = this.getExpenses(tripId);
        
        if (category === 'all') {
            return expenses;
        }
        
        return expenses.filter(expense => expense.category === category);
    },
    
    /**
     * Save the current trip ID
     * @param {string} tripId - The ID of the current trip
     */
    setCurrentTrip(tripId) {
        localStorage.setItem(this.CURRENT_TRIP_KEY, tripId);
    },
    
    /**
     * Get the current trip ID
     * @returns {string|null} The current trip ID or null if not set
     */
    getCurrentTripId() {
        return localStorage.getItem(this.CURRENT_TRIP_KEY);
    },
    
    /**
     * Clear the current trip ID
     */
    clearCurrentTrip() {
        localStorage.removeItem(this.CURRENT_TRIP_KEY);
    },
    
    /**
     * Sort trips by creation date
     * @param {Array} trips - Array of trip objects
     * @param {string} order - 'newest' or 'oldest'
     * @returns {Array} Sorted array of trip objects
     */
    sortTripsByDate(trips, order = 'newest') {
        return [...trips].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    },
    
    /**
     * Sort expenses by date
     * @param {Array} expenses - Array of expense objects
     * @param {string} order - 'newest' or 'oldest'
     * @returns {Array} Sorted array of expense objects
     */
    sortExpensesByDate(expenses, order = 'newest') {
        return [...expenses].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }
};
