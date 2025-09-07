// Car listing and search functionality

$(document).ready(function() {
    // Load cars on cars listing pages
    if (window.location.pathname.includes('cars.html') || window.location.pathname.includes('cars-list.html')) {
        loadCars();
    }
    
    // Load single car details
    if (window.location.pathname.includes('car-single.html')) {
        loadCarDetails();
    }
    
    // Search form handling
    $('#car_search_form').on('submit', function(e) {
        e.preventDefault();
        performCarSearch();
    });
    
    // Filter handling
    $('.car-filter').on('change', function() {
        loadCars();
    });
});

function loadCars(filters = {}) {
    // Show loading state
    const container = $('#cars-container, .cars-list-container');
    if (container.length) {
        container.html('<div class="text-center"><p>Loading cars...</p></div>');
    }
    
    // Get filters from form elements
    const formFilters = {};
    
    // Car type filters
    $('input[name="vehicle_type"]:checked').each(function() {
        if (!formFilters.car_type) formFilters.car_type = [];
        formFilters.car_type.push($(this).val());
    });
    
    // Seats filter
    $('input[name="car_seats"]:checked').each(function() {
        if (!formFilters.seats) formFilters.seats = [];
        formFilters.seats.push(parseInt($(this).val()));
    });
    
    // Price range
    const priceRange = $('#price-range').val();
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        formFilters.min_price = min;
        formFilters.max_price = max;
    }
    
    // Merge with provided filters
    const finalFilters = { ...formFilters, ...filters };
    
    API.getCars(finalFilters)
        .then(function(cars) {
            displayCars(cars);
        })
        .catch(function(error) {
            console.error('Failed to load cars:', error);
            if (container.length) {
                container.html('<div class="text-center"><p>Failed to load cars. Please try again.</p></div>');
            }
        });
}

function performCarSearch() {
    const searchParams = {
        pickup_location: $('#pickup_location').val(),
        pickup_date: $('#pickup_date').val(),
        return_date: $('#return_date').val(),
        car_type: $('#search_car_type').val(),
        seats: $('#search_seats').val()
    };
    
    API.searchCars(searchParams)
        .then(function(cars) {
            displayCars(cars);
            // Update URL to reflect search
            const params = new URLSearchParams(searchParams);
            window.history.pushState({}, '', `cars.html?${params}`);
        })
        .catch(function(error) {
            console.error('Car search failed:', error);
            showMessage('Search failed. Please try again.', 'error');
        });
}

function displayCars(cars) {
    const container = $('#cars-container');
    if (!container.length) return;
    
    if (cars.length === 0) {
        container.html('<div class="col-12"><p class="text-center">No cars found matching your criteria.</p></div>');
        return;
    }
    
    let html = '';
    cars.forEach(function(car) {
        html += generateCarCard(car);
    });
    
    container.html(html);
}

function generateCarCard(car) {
    return `
        <div class="col-xl-4 col-lg-6 mb-4">
            <div class="de-item mb30">
                <div class="d-img">
                    <img src="${car.image_url || 'images/cars/default-car.jpg'}" class="img-fluid" alt="${car.make} ${car.model}">
                </div>
                <div class="d-info">
                    <div class="d-text">
                        <h4>${car.make} ${car.model}</h4>
                        <div class="d-item_like">
                            <i class="fa fa-heart"></i><span>25</span>
                        </div>
                        <div class="d-atr-group">
                            <span class="d-atr"><img src="images/icons/1-green.svg" alt="">${car.seats}</span>
                            <span class="d-atr"><img src="images/icons/2-green.svg" alt="">${car.doors}</span>
                            <span class="d-atr"><img src="images/icons/3-green.svg" alt="">${car.transmission}</span>
                            <span class="d-atr"><img src="images/icons/4-green.svg" alt="">${car.car_type}</span>
                        </div>
                        <div class="d-price">
                            Daily rate from <span>$${car.daily_rate}</span>
                            <a class="btn-main" href="booking.html?car_id=${car.id}">Rent Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadCarDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    if (!carId) {
        showMessage('Car not found', 'error');
        return;
    }
    
    API.getCar(carId)
        .then(function(car) {
            displayCarDetails(car);
        })
        .catch(function(error) {
            console.error('Failed to load car details:', error);
            showMessage('Failed to load car details. Please try again.', 'error');
        });
}

function displayCarDetails(car) {
    // Update page title
    document.title = `${car.make} ${car.model} - Rentaly`;
    
    // Update car details in the page
    $('#car-title').text(`${car.make} ${car.model} ${car.year}`);
    $('#car-image').attr('src', car.image_url || 'images/cars/default-car.jpg');
    $('#car-price').text(`$${car.daily_rate}/day`);
    $('#car-description').text(car.description || 'No description available');
    
    // Update specifications
    $('#car-seats').text(car.seats);
    $('#car-doors').text(car.doors);
    $('#car-transmission').text(car.transmission);
    $('#car-fuel').text(car.fuel_type);
    $('#car-type').text(car.car_type);
    
    // Update booking link
    $('#book-now-btn').attr('href', `booking.html?car_id=${car.id}`);
    
    // Update availability status
    if (car.availability_status !== 'available') {
        $('#book-now-btn').addClass('disabled').text('Not Available');
        $('.availability-status').text('Currently Unavailable').addClass('text-danger');
    } else {
        $('.availability-status').text('Available').addClass('text-success');
    }
}

function showMessage(message, type) {
    // Remove existing messages
    $('.car-message').remove();
    
    // Create message element
    const messageClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const messageHtml = `
        <div class="car-message alert ${messageClass}" style="margin: 20px 0;">
            ${message}
        </div>
    `;
    
    // Insert message
    $('.container').prepend(messageHtml);
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
        $('.car-message').fadeOut();
    }, 5000);
}







function loadCarBodyTypes() {
    fetch(API_BASE_URL + '/cars/body-types')
        .then(response => response.json())
        .then(data => {
            const container = $('#car-body-type-filters');
            container.empty();
            data.forEach(bodyType => {
                container.append(`
                    <div class="de_checkbox">
                        <input id="car_body_type_${bodyType}" name="car_body_type" type="checkbox" value="${bodyType}">
                        <label for="car_body_type_${bodyType}">${bodyType}</label>
                    </div>
                `);
            });
        })
        .catch(error => console.error('Error loading car body types:', error));
}

function loadCarSeats() {
    fetch(API_BASE_URL + '/cars/seats')
        .then(response => response.json())
        .then(data => {
            const container = $('#car-seat-filters');
            container.empty();
            data.forEach(seat => {
                container.append(`
                    <div class="de_checkbox">
                        <input id="car_seat_${seat}" name="car_seat" type="checkbox" value="${seat}">
                        <label for="car_seat_${seat}">${seat} seats</label>
                    </div>
                `);
            });
        })
        .catch(error => console.error('Error loading car seats:', error));
}

function applyFilters() {
    const bodyTypes = $('input[name="car_body_type"]:checked').map(function() {
        return this.value;
    }).get();

    const seats = $('input[name="car_seat"]:checked').map(function() {
        return this.value;
    }).get();

    const priceRange = $('.price-range').val().split(',');
    const minPrice = priceRange[0];
    const maxPrice = priceRange[1];

    let url = API_BASE_URL + '/cars?';
    if (bodyTypes.length > 0) {
        url += 'body_types=' + bodyTypes.join(',') + '&';
    }
    if (seats.length > 0) {
        url += 'seats=' + seats.join(',') + '&';
    }
    if (minPrice) {
        url += 'min_price=' + minPrice + '&';
    }
    if (maxPrice) {
        url += 'max_price=' + maxPrice + '&';
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const container = $('#cars-container');
            container.empty();
            if (data.length === 0) {
                container.html('<div class="col-md-12">No cars found matching your criteria.</div>');
                return;
            }
            data.forEach(car => {
                container.append(generateCarCard(car));
            });
        })
        .catch(error => console.error('Error applying filters:', error));
}

$(document).ready(function() {
    loadCarBodyTypes();
    loadCarSeats();

    $(document).on('change', 'input[name="car_body_type"], input[name="car_seat"]', function() {
        applyFilters();
    });

    $('.price-range').on('change', function() {
        applyFilters();
    });
});




// Add filter event handlers
$(document).ready(function() {
    // Filter change handlers
    $('input[name="vehicle_type"], input[name="car_seats"]').on('change', function() {
        loadCars();
    });
    
    $('#price-range').on('change', function() {
        loadCars();
    });
    
    // Reset filters
    $('#reset-filters').on('click', function() {
        $('input[name="vehicle_type"], input[name="car_seats"]').prop('checked', false);
        $('#price-range').val('');
        loadCars();
    });
});

