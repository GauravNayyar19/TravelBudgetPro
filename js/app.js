/**
 * Main application file for the Travel Budget Planner
 * This file initializes the application and handles the main event listeners
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Initialize the app
    initApp();
    
    // Set event listeners
    setupEventListeners();
});

/**
 * Initialize the application
 */
function initApp() {
    // Load trips from localStorage
    UI.displayTripList();
    
    // Set today's date as min for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trip-start-date').min = today;
    document.getElementById('trip-end-date').min = today;
    
    // Show appropriate section based on whether trips exist
    const trips = Storage.getTrips();
    if (trips.length === 0) {
        document.getElementById('no-trips-message').classList.remove('hidden');
    } else {
        document.getElementById('no-trips-message').classList.add('hidden');
    }
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // New Trip Button
    document.getElementById('new-trip-btn').addEventListener('click', UI.showNewTripForm);
    document.getElementById('empty-new-trip-btn').addEventListener('click', UI.showNewTripForm);
    
    // Close and Cancel New Trip Form
    document.getElementById('close-new-trip-btn').addEventListener('click', UI.hideNewTripForm);
    document.getElementById('cancel-new-trip-btn').addEventListener('click', UI.hideNewTripForm);
    
    // New Trip Form Submission
    document.getElementById('new-trip-form').addEventListener('submit', handleNewTripSubmit);
    
    // Trip Start Date Change (to update min value of end date)
    document.getElementById('trip-start-date').addEventListener('change', function() {
        document.getElementById('trip-end-date').min = this.value;
        // If end date is before start date, update end date
        if (document.getElementById('trip-end-date').value < this.value) {
            document.getElementById('trip-end-date').value = this.value;
        }
    });
    
    // Back to Trips Button
    document.getElementById('back-to-trips-btn').addEventListener('click', UI.showTripList);
    
    // Add Expense Form Submission
    document.getElementById('add-expense-form').addEventListener('submit', handleAddExpenseSubmit);
    
    // Sort Trips Button
    document.getElementById('sort-trips-btn').addEventListener('click', handleSortTrips);
    
    // Sort Expenses Button
    document.getElementById('sort-expenses-btn').addEventListener('click', handleSortExpenses);
    
    // Expense Filter Change
    document.getElementById('expense-filter').addEventListener('change', handleFilterExpenses);
    
    // Delete Trip Button
    document.getElementById('delete-trip-btn').addEventListener('click', handleDeleteTrip);
    
    // Edit Trip Button
    document.getElementById('edit-trip-btn').addEventListener('click', handleEditTrip);
    
    // Modal Buttons
    document.getElementById('modal-cancel').addEventListener('click', UI.hideModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {
        // The actual confirm action will be set dynamically
        // when the modal is shown
    });
}

/**
 * Handle new trip form submission
 * @param {Event} event - The form submission event
 */
function handleNewTripSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const tripName = document.getElementById('trip-name').value;
    const destination = document.getElementById('trip-destination').value;
    const startDate = document.getElementById('trip-start-date').value;
    const endDate = document.getElementById('trip-end-date').value;
    const currency = document.getElementById('trip-currency').value;
    const budget = parseFloat(document.getElementById('trip-budget').value);
    
    // Create new trip object
    const newTrip = {
        id: Date.now().toString(),
        name: tripName,
        destination: destination,
        startDate: startDate,
        endDate: endDate,
        currency: currency,
        budget: budget,
        expenses: [],
        createdAt: new Date().toISOString()
    };
    
    // Save trip to localStorage
    Storage.addTrip(newTrip);
    
    // Reset and hide the form
    document.getElementById('new-trip-form').reset();
    UI.hideNewTripForm();
    
    // Show trip list with the new trip
    UI.displayTripList();
    
    // Hide no trips message
    document.getElementById('no-trips-message').classList.add('hidden');
}

/**
 * Handle add expense form submission
 * @param {Event} event - The form submission event
 */
function handleAddExpenseSubmit(event) {
    event.preventDefault();
    
    // Get the current trip ID
    const tripId = UI.getCurrentTripId();
    if (!tripId) return;
    
    // Get form values
    const expenseName = document.getElementById('expense-name').value;
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    
    // Create new expense object
    const newExpense = {
        id: Date.now().toString(),
        name: expenseName,
        category: category,
        amount: amount,
        date: date,
        createdAt: new Date().toISOString()
    };
    
    // Add expense to trip
    Storage.addExpense(tripId, newExpense);
    
    // Reset form
    document.getElementById('add-expense-form').reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    
    // Refresh trip details
    UI.displayTripDetails(tripId);
}

/**
 * Handle sorting of trips
 */
function handleSortTrips() {
    // Get the current sort
    const currentSort = document.getElementById('sort-trips-btn').dataset.sort || 'newest';
    
    // Toggle sort
    const newSort = currentSort === 'newest' ? 'oldest' : 'newest';
    
    // Update button dataset and icon
    document.getElementById('sort-trips-btn').dataset.sort = newSort;
    
    // Update icon
    const icon = document.getElementById('sort-trips-btn').querySelector('i');
    if (newSort === 'newest') {
        icon.setAttribute('data-feather', 'arrow-down');
    } else {
        icon.setAttribute('data-feather', 'arrow-up');
    }
    
    // Re-initialize feather icons
    feather.replace();
    
    // Display trips with new sort
    UI.displayTripList(newSort);
}

/**
 * Handle sorting of expenses
 */
function handleSortExpenses() {
    // Get the current sort
    const currentSort = document.getElementById('sort-expenses-btn').dataset.sort || 'newest';
    
    // Toggle sort
    const newSort = currentSort === 'newest' ? 'oldest' : 'newest';
    
    // Update button dataset and icon
    document.getElementById('sort-expenses-btn').dataset.sort = newSort;
    
    // Update icon
    const icon = document.getElementById('sort-expenses-btn').querySelector('i');
    if (newSort === 'newest') {
        icon.setAttribute('data-feather', 'arrow-down');
    } else {
        icon.setAttribute('data-feather', 'arrow-up');
    }
    
    // Re-initialize feather icons
    feather.replace();
    
    // Display expenses with new sort
    const tripId = UI.getCurrentTripId();
    if (tripId) {
        UI.displayExpenses(tripId, document.getElementById('expense-filter').value, newSort);
    }
}

/**
 * Handle filtering of expenses
 */
function handleFilterExpenses() {
    const tripId = UI.getCurrentTripId();
    if (tripId) {
        const category = document.getElementById('expense-filter').value;
        const sort = document.getElementById('sort-expenses-btn').dataset.sort || 'newest';
        UI.displayExpenses(tripId, category, sort);
    }
}

/**
 * Handle trip deletion
 */
function handleDeleteTrip() {
    const tripId = UI.getCurrentTripId();
    if (!tripId) return;
    
    // Show confirmation modal
    UI.showModal(
        'Delete Trip',
        'Are you sure you want to delete this trip? This action cannot be undone.',
        'Delete',
        'trip-delete'
    );
    
    // Set confirm action
    document.getElementById('modal-confirm').onclick = function() {
        // Delete trip
        Storage.deleteTrip(tripId);
        
        // Hide modal
        UI.hideModal();
        
        // Show trip list
        UI.showTripList();
        
        // Check if there are any trips left
        const trips = Storage.getTrips();
        if (trips.length === 0) {
            document.getElementById('no-trips-message').classList.remove('hidden');
        }
    };
}

/**
 * Handle trip editing (to be implemented)
 */
function handleEditTrip() {
    // Currently a placeholder - in a full implementation, this would 
    // show a form to edit trip details
    alert('Edit trip functionality would be implemented here in a production app.');
}

// Other event-driven functions would be added below as needed
