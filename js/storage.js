

const Storage = {
   
    TRIPS_STORAGE_KEY: 'travelBudgetTrips',
    
    CURRENT_TRIP_KEY: 'travelBudgetCurrentTrip',
    
    /**
     * @returns {Array}
     */
    getTrips() {
        const tripsJson = localStorage.getItem(this.TRIPS_STORAGE_KEY);
        return tripsJson ? JSON.parse(tripsJson) : [];
    },
    
    /**
     * @param {Array} trips
     */
    saveTrips(trips) {
        localStorage.setItem(this.TRIPS_STORAGE_KEY, JSON.stringify(trips));
    },
    
    /**
     * @param {Object} trip 
     */
    addTrip(trip) {
        const trips = this.getTrips();
        trips.push(trip);
        this.saveTrips(trips);
    },
    
    /**
     * @param {string} tripId 
     * @returns {Object|null} 
     */
    getTripById(tripId) {
        const trips = this.getTrips();
        return trips.find(trip => trip.id === tripId) || null;
    },
    
    /**
     * @param {string} tripId
     * @param {Object} updatedTrip 
     * @returns {boolean} 
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
     * @param {string} tripId 
     * @returns {boolean} 
     */
    deleteTrip(tripId) {
        const trips = this.getTrips();
        const filteredTrips = trips.filter(trip => trip.id !== tripId);
        
        if (filteredTrips.length === trips.length) {
            return false; 
        }
        
        this.saveTrips(filteredTrips);
        
        if (this.getCurrentTripId() === tripId) {
            this.clearCurrentTrip();
        }
        
        return true;
    },
    
    /**
     * @param {string} tripId 
     * @param {Object} expense 
     * @returns {boolean} 
     */
    addExpense(tripId, expense) {
        const trip = this.getTripById(tripId);
        
        if (!trip) {
            return false;
        }
        
        if (!trip.expenses) {
            trip.expenses = [];
        }
        
        trip.expenses.push(expense);
        return this.updateTrip(tripId, trip);
    },
    
    /**
     * @param {string} tripId 
     * @param {string} expenseId 
     * @param {Object} updatedExpense 
     * @returns {boolean} 
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
     * @param {string} tripId 
     * @param {string} expenseId 
     * @returns {boolean} 
     */
    deleteExpense(tripId, expenseId) {
        const trip = this.getTripById(tripId);
        
        if (!trip || !trip.expenses) {
            return false;
        }
        
        const originalLength = trip.expenses.length;
        trip.expenses = trip.expenses.filter(expense => expense.id !== expenseId);
        
        if (trip.expenses.length === originalLength) {
            return false; 
        }
        
        return this.updateTrip(tripId, trip);
    },
    
    /**
     * @param {string} tripId 
     * @returns {Array} 
     */
    getExpenses(tripId) {
        const trip = this.getTripById(tripId);
        return trip && trip.expenses ? trip.expenses : [];
    },
    
    /**
     * @param {string} tripId
     * @param {string} category 
     * @returns {Array}
     */
    getExpensesByCategory(tripId, category) {
        const expenses = this.getExpenses(tripId);
        
        if (category === 'all') {
            return expenses;
        }
        
        return expenses.filter(expense => expense.category === category);
    },
    
    /**
     * @param {string} tripId 
     */
    setCurrentTrip(tripId) {
        localStorage.setItem(this.CURRENT_TRIP_KEY, tripId);
    },
    
    /**
     * @returns {string|null} 
     */
    getCurrentTripId() {
        return localStorage.getItem(this.CURRENT_TRIP_KEY);
    },

    clearCurrentTrip() {
        localStorage.removeItem(this.CURRENT_TRIP_KEY);
    },
    
    /**
     * @param {Array} trips 
     * @param {string} order 
     * @returns {Array} 
     */
    sortTripsByDate(trips, order = 'newest') {
        return [...trips].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    },
    
    /**
     * @param {Array} expenses 
     * @param {string} order
     * @returns {Array} 
     */
    sortExpensesByDate(expenses, order = 'newest') {
        return [...expenses].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }
};