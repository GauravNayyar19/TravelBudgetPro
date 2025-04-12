/**
 * UI module
 * Handles all UI updates and interactions
 */

const UI = {
    /**
     * Current trip ID being viewed
     */
    _currentTripId: null,
    
    /**
     * Get the current trip ID
     * @returns {string|null} The current trip ID
     */
    getCurrentTripId() {
        return this._currentTripId || Storage.getCurrentTripId();
    },
    
    /**
     * Set the current trip ID
     * @param {string} tripId - The trip ID to set as current
     */
    setCurrentTripId(tripId) {
        this._currentTripId = tripId;
        Storage.setCurrentTrip(tripId);
    },
    
    /**
     * Display the list of trips
     * @param {string} sortOrder - 'newest' or 'oldest'
     */
    displayTripList(sortOrder = 'newest') {
        // Get trips from storage
        let trips = Storage.getTrips();
        
        // Sort trips
        trips = Storage.sortTripsByDate(trips, sortOrder);
        
        // Show trip list section and hide other sections
        document.getElementById('trip-list-section').classList.remove('hidden');
        document.getElementById('new-trip-section').classList.add('hidden');
        document.getElementById('trip-details-section').classList.add('hidden');
        
        // Get the container
        const tripsContainer = document.getElementById('trips-container');
        
        // Clear previous trip cards
        tripsContainer.innerHTML = '';
        
        // If no trips, show message and return
        if (trips.length === 0) {
            document.getElementById('no-trips-message').classList.remove('hidden');
            return;
        }
        
        // Hide no trips message
        document.getElementById('no-trips-message').classList.add('hidden');
        
        // Add trip cards
        trips.forEach(trip => {
            const tripStatus = BudgetCalculator.getTripStatus(trip);
            const statusClass = {
                'upcoming': 'category-badge bg-blue-100 text-blue-800',
                'ongoing': 'category-badge bg-green-100 text-green-800',
                'past': 'category-badge bg-gray-100 text-gray-800'
            }[tripStatus];
            
            const statusIcon = {
                'upcoming': 'calendar',
                'ongoing': 'check-circle',
                'past': 'check'
            }[tripStatus];
            
            const statusText = {
                'upcoming': 'Upcoming',
                'ongoing': 'Active',
                'past': 'Completed'
            }[tripStatus];
            
            const dateRange = BudgetCalculator.getDateRangeText(trip);
            const totalExpenses = BudgetCalculator.calculateTotalExpenses(trip);
            const remainingBudget = BudgetCalculator.calculateRemainingBudget(trip);
            const formattedRemaining = BudgetCalculator.formatCurrency(remainingBudget, trip.currency);
            const budgetProgress = BudgetCalculator.calculateBudgetProgress(trip);
            const isOverBudget = BudgetCalculator.isOverBudget(trip);
            
            // Determine the card highlight color based on trip status
            let cardHighlightClass = '';
            if (tripStatus === 'ongoing') {
                cardHighlightClass = 'border-l-4 border-success';
            } else if (tripStatus === 'upcoming') {
                cardHighlightClass = 'border-l-4 border-primary';
            }
            
            // Determine progress bar class
            const progressBarClass = isOverBudget ? 'bg-danger' : 'bg-primary';
            
            const tripCard = document.createElement('div');
            tripCard.className = `card mb-5 trip-card overflow-hidden ${cardHighlightClass}`;
            tripCard.innerHTML = `
                <div class="p-5">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold font-heading text-gray-dark mb-1">${trip.name}</h3>
                            <p class="text-gray-custom text-sm">${trip.destination}</p>
                        </div>
                        <span class="${statusClass}">
                            <i data-feather="${statusIcon}" class="h-3 w-3 mr-1"></i>
                            ${statusText}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-5">
                        <div class="flex items-center">
                            <div class="bg-gray-100 p-2 rounded-full mr-3">
                                <i data-feather="calendar" class="h-4 w-4 text-gray-custom"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-custom mb-1">Date Range</p>
                                <p class="text-sm font-medium">${dateRange}</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="bg-gray-100 p-2 rounded-full mr-3">
                                <i data-feather="dollar-sign" class="h-4 w-4 text-gray-custom"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-custom mb-1">Total Budget</p>
                                <p class="text-sm font-medium">${BudgetCalculator.formatCurrency(trip.budget, trip.currency)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="flex justify-between items-center mb-2">
                            <p class="text-sm text-gray-custom">Budget Used</p>
                            <p class="text-sm font-medium ${isOverBudget ? 'text-danger' : ''}">${Math.round(budgetProgress)}%</p>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar ${progressBarClass} animate-progress" style="width: ${Math.min(budgetProgress, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <p class="text-xs text-gray-custom mb-1">Spent</p>
                            <p class="text-sm font-medium">${BudgetCalculator.formatCurrency(totalExpenses, trip.currency)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-custom mb-1">Remaining</p>
                            <p class="text-sm font-medium ${isOverBudget ? 'text-danger' : 'text-success'}">${formattedRemaining}</p>
                        </div>
                    </div>
                </div>
                
                <div class="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button class="view-trip-btn btn btn-outline btn-sm" data-trip-id="${trip.id}">
                        <i data-feather="eye" class="h-4 w-4 mr-2"></i>
                        View Details
                    </button>
                </div>
            `;
            
            tripsContainer.appendChild(tripCard);
            
            // Add click event to view button
            const viewBtn = tripCard.querySelector('.view-trip-btn');
            viewBtn.addEventListener('click', () => {
                this.displayTripDetails(trip.id);
            });
        });
        
        // Re-initialize feather icons
        feather.replace();
    },
    
    /**
     * Show the new trip form
     */
    showNewTripForm() {
        // Hide trip list and trip details, show new trip form
        document.getElementById('trip-list-section').classList.add('hidden');
        document.getElementById('trip-details-section').classList.add('hidden');
        document.getElementById('new-trip-section').classList.remove('hidden');
        
        // Reset form
        document.getElementById('new-trip-form').reset();
        
        // Set default dates (today and tomorrow)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('trip-start-date').value = today.toISOString().split('T')[0];
        document.getElementById('trip-end-date').value = tomorrow.toISOString().split('T')[0];
    },
    
    /**
     * Hide the new trip form
     */
    hideNewTripForm() {
        // Show trip list, hide new trip form
        document.getElementById('trip-list-section').classList.remove('hidden');
        document.getElementById('new-trip-section').classList.add('hidden');
    },
    
    /**
     * Display trip details
     * @param {string} tripId - The ID of the trip to display
     */
    displayTripDetails(tripId) {
        // Get trip
        const trip = Storage.getTripById(tripId);
        if (!trip) return;
        
        // Set current trip
        this.setCurrentTripId(tripId);
        
        // Hide trip list, show trip details
        document.getElementById('trip-list-section').classList.add('hidden');
        document.getElementById('new-trip-section').classList.add('hidden');
        document.getElementById('trip-details-section').classList.remove('hidden');
        
        // Set trip title and destination
        document.getElementById('trip-details-title').textContent = trip.name;
        document.getElementById('trip-details-destination').textContent = trip.destination;
        
        // Set date range
        const dateRange = BudgetCalculator.getDateRangeText(trip);
        document.getElementById('trip-date-range').textContent = dateRange;
        
        // Set trip status badge
        const tripStatus = BudgetCalculator.getTripStatus(trip);
        const statusBadge = document.getElementById('trip-status-badge');
        
        if (tripStatus === 'upcoming') {
            statusBadge.className = 'category-badge bg-blue-100 text-blue-800';
            statusBadge.innerHTML = '<i data-feather="calendar" class="h-3 w-3 mr-1"></i> Upcoming';
        } else if (tripStatus === 'ongoing') {
            statusBadge.className = 'category-badge bg-green-100 text-green-800';
            statusBadge.innerHTML = '<i data-feather="check-circle" class="h-3 w-3 mr-1"></i> Active';
        } else {
            statusBadge.className = 'category-badge bg-gray-100 text-gray-800';
            statusBadge.innerHTML = '<i data-feather="check" class="h-3 w-3 mr-1"></i> Completed';
        }
        
        // Set budget information
        const totalBudget = BudgetCalculator.formatCurrency(trip.budget, trip.currency);
        const remainingBudget = BudgetCalculator.formatCurrency(BudgetCalculator.calculateRemainingBudget(trip), trip.currency);
        const spentAmount = BudgetCalculator.formatCurrency(BudgetCalculator.calculateTotalExpenses(trip), trip.currency);
        const dailyBudget = BudgetCalculator.formatCurrency(BudgetCalculator.calculateDailyBudget(trip), trip.currency);
        
        document.getElementById('trip-total-budget').textContent = totalBudget;
        document.getElementById('trip-remaining-budget').textContent = remainingBudget;
        document.getElementById('trip-spent-amount').textContent = spentAmount;
        document.getElementById('trip-daily-budget').textContent = `${dailyBudget}/day`;
        
        // Set budget progress
        const progress = BudgetCalculator.calculateBudgetProgress(trip);
        document.getElementById('trip-budget-progress').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('budget-percentage').textContent = `${Math.round(progress)}%`;
        
        // If over budget, change color
        if (BudgetCalculator.isOverBudget(trip)) {
            document.getElementById('trip-budget-progress').classList.remove('bg-primary');
            document.getElementById('trip-budget-progress').classList.add('bg-danger');
            document.getElementById('trip-remaining-budget').classList.remove('text-success');
            document.getElementById('trip-remaining-budget').classList.add('text-danger');
            document.getElementById('budget-percentage').classList.add('text-danger');
        } else {
            document.getElementById('trip-budget-progress').classList.remove('bg-danger');
            document.getElementById('trip-budget-progress').classList.add('bg-primary');
            document.getElementById('trip-remaining-budget').classList.remove('text-danger');
            document.getElementById('trip-remaining-budget').classList.add('text-success');
            document.getElementById('budget-percentage').classList.remove('text-danger');
        }
        
        // Setup currency symbol for expense form
        const currencySymbol = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CAD': 'CA$',
            'AUD': 'A$',
            'INR': '₹'
        }[trip.currency] || trip.currency;
        
        document.getElementById('expense-currency-symbol').textContent = currencySymbol;
        
        // Display expenses
        this.displayExpenses(tripId);
        
        // Display chart
        this.displayBudgetChart(tripId);
        
        // Set default expense date to today or trip start date if in future
        const today = new Date().toISOString().split('T')[0];
        const tripStart = trip.startDate;
        document.getElementById('expense-date').value = today >= tripStart ? today : tripStart;
        document.getElementById('expense-date').min = tripStart;
        document.getElementById('expense-date').max = trip.endDate;
        
        // Refresh feather icons
        feather.replace();
    },
    
    /**
     * Display expenses for a trip
     * @param {string} tripId - The ID of the trip
     * @param {string} category - The category to filter by, or 'all' for all categories
     * @param {string} sortOrder - 'newest' or 'oldest'
     */
    displayExpenses(tripId, category = 'all', sortOrder = 'newest') {
        // Get expenses
        let expenses = Storage.getExpensesByCategory(tripId, category);
        
        // Sort expenses
        expenses = Storage.sortExpensesByDate(expenses, sortOrder);
        
        // Get trip for currency
        const trip = Storage.getTripById(tripId);
        if (!trip) return;
        
        // Get container
        const expensesContainer = document.getElementById('expenses-container');
        
        // Clear previous expenses
        expensesContainer.innerHTML = '';
        
        // Show no expenses message if needed
        if (expenses.length === 0) {
            document.getElementById('no-expenses-message').classList.remove('hidden');
            return;
        }
        
        // Hide no expenses message
        document.getElementById('no-expenses-message').classList.add('hidden');
        
        // Create expense items
        expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item p-4 hover:bg-gray-50 transition-colors';
            
            // Get category display info
            const categoryInfo = this.getCategoryInfo(expense.category);
            
            // Format the date
            const expenseDate = new Date(expense.date);
            const formattedDate = expenseDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: expenseDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
            
            expenseItem.innerHTML = `
                <div class="flex items-start">
                    <div class="mr-4 mt-1">
                        <div class="p-2 rounded-full ${categoryInfo.class}">
                            <i data-feather="${categoryInfo.icon}" class="h-4 w-4"></i>
                        </div>
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium text-gray-dark">${expense.name}</h4>
                                <div class="flex items-center mt-1">
                                    <span class="text-sm text-gray-custom flex items-center">
                                        <i data-feather="calendar" class="h-3 w-3 mr-1"></i>
                                        ${formattedDate}
                                    </span>
                                    <span class="mx-2 text-gray-300">•</span>
                                    <span class="text-sm text-gray-custom">${categoryInfo.label}</span>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="font-bold text-gray-dark mr-4">${BudgetCalculator.formatCurrency(expense.amount, trip.currency)}</span>
                                <button class="delete-expense-btn p-1 text-gray-custom hover:text-danger transition-colors rounded-full hover:bg-red-50" data-expense-id="${expense.id}" aria-label="Delete expense">
                                    <i data-feather="trash-2" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            expensesContainer.appendChild(expenseItem);
            
            // Add delete event listener
            const deleteBtn = expenseItem.querySelector('.delete-expense-btn');
            deleteBtn.addEventListener('click', () => {
                this.showModal(
                    'Delete Expense',
                    'Are you sure you want to delete this expense? This action cannot be undone.',
                    'Delete',
                    'expense-delete'
                );
                
                // Set confirm action
                document.getElementById('modal-confirm').onclick = () => {
                    Storage.deleteExpense(tripId, expense.id);
                    this.hideModal();
                    this.displayTripDetails(tripId);
                };
            });
        });
        
        // Re-initialize feather icons
        feather.replace();
    },
    
    /**
     * Display budget breakdown chart
     * @param {string} tripId - The ID of the trip
     */
    displayBudgetChart(tripId) {
        // Get trip
        const trip = Storage.getTripById(tripId);
        if (!trip) return;
        
        // Get expense categories
        const categories = BudgetCalculator.calculateExpensesByCategory(trip);
        
        // Chart colors
        const categoryColors = {
            accommodation: '#1E88E5', // travel-blue
            food: '#FFB300', // travel-yellow
            transportation: '#43A047', // travel-green
            activities: '#8E24AA', // travel-purple
            shopping: '#E53935', // travel-red
            other: '#546E7A' // travel-gray
        };
        
        // Destroy existing chart if it exists
        const chartCanvas = document.getElementById('budget-chart');
        if (chartCanvas._chart) {
            chartCanvas._chart.destroy();
        }
        
        // Format data for chart
        const data = {
            labels: Object.keys(categories).map(cat => this.getCategoryInfo(cat).label),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: Object.keys(categories).map(cat => categoryColors[cat]),
                borderWidth: 0
            }]
        };
        
        // Create chart
        const chart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${BudgetCalculator.formatCurrency(value, trip.currency)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
        
        // Save reference to chart
        chartCanvas._chart = chart;
    },
    
    /**
     * Show the trip list
     */
    showTripList() {
        // Clear current trip ID
        this._currentTripId = null;
        Storage.clearCurrentTrip();
        
        // Show trip list, hide other sections
        document.getElementById('trip-list-section').classList.remove('hidden');
        document.getElementById('trip-details-section').classList.add('hidden');
        document.getElementById('new-trip-section').classList.add('hidden');
    },
    
    /**
     * Show the confirmation modal
     * @param {string} title - The modal title
     * @param {string} message - The modal message
     * @param {string} confirmText - The text for the confirm button
     * @param {string} actionType - The type of action ('trip-delete', 'expense-delete', etc.)
     */
    showModal(title, message, confirmText, actionType) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal-confirm').textContent = confirmText;
        document.getElementById('modal-confirm').dataset.action = actionType;
        
        // Show modal
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('hidden');
        
        // Add animation class after a small delay (allows transition to work)
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Set up close button if not already set
        if (!modal._closeInitialized) {
            document.getElementById('modal-close').addEventListener('click', this.hideModal.bind(this));
            modal._closeInitialized = true;
        }
    },
    
    /**
     * Hide the confirmation modal
     */
    hideModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('active');
        
        // Wait for animation to finish before hiding
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },
    
    /**
     * Get info for an expense category
     * @param {string} category - The category name
     * @returns {Object} Object with display info for the category
     */
    getCategoryInfo(category) {
        const categories = {
            accommodation: {
                label: 'Accommodation',
                icon: 'home',
                class: 'category-accommodation'
            },
            food: {
                label: 'Food & Drinks',
                icon: 'coffee',
                class: 'category-food'
            },
            transportation: {
                label: 'Transportation',
                icon: 'map',
                class: 'category-transportation'
            },
            activities: {
                label: 'Activities',
                icon: 'compass',
                class: 'category-activities'
            },
            shopping: {
                label: 'Shopping',
                icon: 'shopping-bag',
                class: 'category-shopping'
            },
            other: {
                label: 'Other',
                icon: 'more-horizontal',
                class: 'category-other'
            }
        };
        
        return categories[category] || categories.other;
    }
};
