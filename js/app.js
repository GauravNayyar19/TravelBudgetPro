
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    
    initApp();
    
    setupEventListeners();
});


function initApp() {
    UI.displayTripList();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trip-start-date').min = today;
    document.getElementById('trip-end-date').min = today;
    
    const trips = Storage.getTrips();
    if (trips.length === 0) {
        document.getElementById('no-trips-message').classList.remove('hidden');
    } else {
        document.getElementById('no-trips-message').classList.add('hidden');
    }
}


function setupEventListeners() {
    document.getElementById('new-trip-btn').addEventListener('click', UI.showNewTripForm);
    document.getElementById('empty-new-trip-btn').addEventListener('click', UI.showNewTripForm);
    document.getElementById('close-new-trip-btn').addEventListener('click', UI.hideNewTripForm);
    document.getElementById('cancel-new-trip-btn').addEventListener('click', UI.hideNewTripForm);    
    document.getElementById('new-trip-form').addEventListener('submit', handleNewTripSubmit);    
    document.getElementById('trip-start-date').addEventListener('change', function() {
        document.getElementById('trip-end-date').min = this.value;
        if (document.getElementById('trip-end-date').value < this.value) {
            document.getElementById('trip-end-date').value = this.value;
        }
    });
    
    document.getElementById('back-to-trips-btn').addEventListener('click', UI.showTripList);
    
    document.getElementById('add-expense-form').addEventListener('submit', handleAddExpenseSubmit);
    
    document.getElementById('sort-trips-btn').addEventListener('click', handleSortTrips);
    
    document.getElementById('sort-expenses-btn').addEventListener('click', handleSortExpenses);
    
    document.getElementById('expense-filter').addEventListener('change', handleFilterExpenses);
    
    document.getElementById('delete-trip-btn').addEventListener('click', handleDeleteTrip);
    
    document.getElementById('edit-trip-btn').addEventListener('click', handleEditTrip);
    
    document.getElementById('modal-cancel').addEventListener('click', UI.hideModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {

    });
}

/**
 * @param {Event} event 
 */
function handleNewTripSubmit(event) {
    event.preventDefault();
    const tripName = document.getElementById('trip-name').value;
    const destination = document.getElementById('trip-destination').value;
    const startDate = document.getElementById('trip-start-date').value;
    const endDate = document.getElementById('trip-end-date').value;
    const currency = document.getElementById('trip-currency').value;
    const budget = parseFloat(document.getElementById('trip-budget').value);
    
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
    
    Storage.addTrip(newTrip);
    
    document.getElementById('new-trip-form').reset();
    UI.hideNewTripForm();
    
    UI.displayTripList();
    
    document.getElementById('no-trips-message').classList.add('hidden');
}

/**
 * 
 * @param {Event} event 
 */
function handleAddExpenseSubmit(event) {
    event.preventDefault();
    
    const tripId = UI.getCurrentTripId();
    if (!tripId) return;
    
    const expenseName = document.getElementById('expense-name').value;
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    
    const newExpense = {
        id: Date.now().toString(),
        name: expenseName,
        category: category,
        amount: amount,
        date: date,
        createdAt: new Date().toISOString()
    };
    
    Storage.addExpense(tripId, newExpense);
    
    document.getElementById('add-expense-form').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    
    UI.displayTripDetails(tripId);
}


function handleSortTrips() {
    const currentSort = document.getElementById('sort-trips-btn').dataset.sort || 'newest';
    
    const newSort = currentSort === 'newest' ? 'oldest' : 'newest';
    
    document.getElementById('sort-trips-btn').dataset.sort = newSort;
    
    const icon = document.getElementById('sort-trips-btn').querySelector('i');
    if (newSort === 'newest') {
        icon.setAttribute('data-feather', 'arrow-down');
    } else {
        icon.setAttribute('data-feather', 'arrow-up');
    }
    
    feather.replace();
    
    UI.displayTripList(newSort);
}


function handleSortExpenses() {
    const currentSort = document.getElementById('sort-expenses-btn').dataset.sort || 'newest';
    
    const newSort = currentSort === 'newest' ? 'oldest' : 'newest';
    
    document.getElementById('sort-expenses-btn').dataset.sort = newSort;
    
    const icon = document.getElementById('sort-expenses-btn').querySelector('i');
    if (newSort === 'newest') {
        icon.setAttribute('data-feather', 'arrow-down');
    } else {
        icon.setAttribute('data-feather', 'arrow-up');
    }
    
    feather.replace();
    
    const tripId = UI.getCurrentTripId();
    if (tripId) {
        UI.displayExpenses(tripId, document.getElementById('expense-filter').value, newSort);
    }
}


function handleFilterExpenses() {
    const tripId = UI.getCurrentTripId();
    if (tripId) {
        const category = document.getElementById('expense-filter').value;
        const sort = document.getElementById('sort-expenses-btn').dataset.sort || 'newest';
        UI.displayExpenses(tripId, category, sort);
    }
}


function handleDeleteTrip() {
    const tripId = UI.getCurrentTripId();
    if (!tripId) return;
    
    UI.showModal(
        'Delete Trip',
        'Are you sure you want to delete this trip? This action cannot be undone.',
        'Delete',
        'trip-delete'
    );
    
    document.getElementById('modal-confirm').onclick = function() {
        Storage.deleteTrip(tripId);
        
        UI.hideModal();
        
        UI.showTripList();
        
        const trips = Storage.getTrips();
        if (trips.length === 0) {
            document.getElementById('no-trips-message').classList.remove('hidden');
        }
    };
}

function handleEditTrip() {
    alert('Edit trip functionality would be implemented here in a production app.');
}
