$(document).ready(function() {
    // Initialize filters object
    let currentFilters = {
        minPrice: 0,
        maxPrice: 2000,
        vehicleTypes: [],
        bodyTypes: [],
        seats: [],
        engineCapacity: []
    };

    // Load cars on page load
    loadCars();

    // Price range slider functionality
    const rangeMin = document.querySelector('.range-min');
    const rangeMax = document.querySelector('.range-max');
    const inputMin = document.querySelector('.input-min');
    const inputMax = document.querySelector('.input-max');
    const progress = document.querySelector('.progress');

    function updatePriceRange() {
        const minVal = parseInt(rangeMin.value);
        const maxVal = parseInt(rangeMax.value);
        const minPrice = Math.min(minVal, maxVal - 1);
        const maxPrice = Math.max(maxVal, minVal + 1);
        
        inputMin.value = minPrice;
        inputMax.value = maxPrice;
        rangeMin.value = minPrice;
        rangeMax.value = maxPrice;
        
        const percent1 = (minPrice / rangeMin.max) * 100;
        const percent2 = (maxPrice / rangeMax.max) * 100;
        progress.style.left = percent1 + '%';
        progress.style.right = (100 - percent2) + '%';
        
        currentFilters.minPrice = minPrice;
        currentFilters.maxPrice = maxPrice;
        
        // Apply filters with debounce
        clearTimeout(window.priceFilterTimeout);
        window.priceFilterTimeout = setTimeout(applyFilters, 500);
    }

    if (rangeMin && rangeMax) {
        rangeMin.addEventListener('input', updatePriceRange);
        rangeMax.addEventListener('input', updatePriceRange);
        inputMin.addEventListener('input', function() {
            rangeMin.value = this.value;
            updatePriceRange();
        });
        inputMax.addEventListener('input', function() {
            rangeMax.value = this.value;
            updatePriceRange();
        });
    }

    // Vehicle type filters
    $('input[name^="vehicle_type_"]').on('change', function() {
        updateArrayFilter('vehicleTypes', this);
        applyFilters();
    });

    // Body type filters
    $('input[name^="car_body_type_"]').on('change', function() {
        updateArrayFilter('bodyTypes', this);
        applyFilters();
    });

    // Seat filters
    $('input[name^="car_seat_"]').on('change', function() {
        updateArrayFilter('seats', this);
        applyFilters();
    });

    // Engine capacity filters
    $('input[name^="car_engine_"]').on('change', function() {
        updateArrayFilter('engineCapacity', this);
        applyFilters();
    });

    function updateArrayFilter(filterType, checkbox) {
        const value = $(checkbox).next('label').text().trim();
        if (checkbox.checked) {
            if (!currentFilters[filterType].includes(value)) {
                currentFilters[filterType].push(value);
            }
        } else {
            const index = currentFilters[filterType].indexOf(value);
            if (index > -1) {
                currentFilters[filterType].splice(index, 1);
            }
        }
    }

    function loadCars(filters = {}) {
        const carsContainer = $("#cars-container");
        const loadingMessage = $("#loading-message");
        
        loadingMessage.show();
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filters.minPrice !== undefined) queryParams.append('min_price', filters.minPrice);
        if (filters.maxPrice !== undefined) queryParams.append('max_price', filters.maxPrice);
        if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
            queryParams.append('vehicle_types', filters.vehicleTypes.join(','));
        }
        if (filters.bodyTypes && filters.bodyTypes.length > 0) {
            queryParams.append('body_types', filters.bodyTypes.join(','));
        }
        if (filters.seats && filters.seats.length > 0) {
            queryParams.append('seats', filters.seats.join(','));
        }
        if (filters.engineCapacity && filters.engineCapacity.length > 0) {
            queryParams.append('engine_capacity', filters.engineCapacity.join(','));
        }

        const url = queryParams.toString() ? `${API_BASE_URL}/cars?${queryParams.toString()}` : `${API_BASE_URL}/cars`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch cars');
                }
                return response.json();
            })
            .then(cars => {
                loadingMessage.hide();
                displayCars(cars);
            })
            .catch(error => {
                console.error("Error loading cars:", error);
                loadingMessage.html('<p class="text-danger">Error loading cars. Please try again.</p>');
            });
    }

    function displayCars(cars) {
        const carsContainer = $("#cars-container");
        carsContainer.empty();
        
        if (cars.length === 0) {
            carsContainer.html('<div class="col-12 text-center"><p>No cars found matching your criteria.</p></div>');
            return;
        }
        
        cars.forEach(function(car) {
            const carHtml = `
                <div class="col-xl-4 col-lg-6">
                    <div class="de-item mb30">
                        <div class="d-img">
                            <img src="${car.image_url}" class="img-fluid" alt="${car.make} ${car.model}" onerror="this.src='images/cars-alt/default-car.png'">
                        </div>
                        <div class="d-info">
                            <div class="d-text">
                                <h4>${car.make} ${car.model}</h4>
                                <div class="d-item_like" data-car-id="${car.id}">
                                    <i class="fa fa-heart ${car.is_favorited ? 'fas' : 'far'}"></i><span class="likes-count">${car.likes_count}</span>
                                </div>
                                <div class="d-atr-group">
                                    <span class="d-atr"><img src="images/icons/1-green.svg" alt="">${car.seats || 5}</span>
                                    <span class="d-atr"><img src="images/icons/2-green.svg" alt="">2</span>
                                    <span class="d-atr"><img src="images/icons/3-green.svg" alt="">4</span>
                                    <span class="d-atr"><img src="images/icons/4-green.svg" alt="">${car.category || 'Car'}</span>
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
            carsContainer.append(carHtml);
        });
    }

    function applyFilters() {
        loadCars(currentFilters);
    }

    // Initialize price range
    updatePriceRange();
});



    // Favorite car functionality
    $(document).on("click", ".d-item_like .fa-heart", async function() {
        if (!window.isAuthenticated()) {
            alert("Please login to add cars to your favorites.");
            window.location.href = 'login.html';
            return;
        }

        const $heartIcon = $(this);
        const $favoriteContainer = $heartIcon.closest(".d-item_like");
        const carId = $favoriteContainer.data("car-id");
        const $favoriteCount = $favoriteContainer.find(".likes-count");

        try {
            if ($heartIcon.hasClass("fas")) { // Already favorited, so remove
                await API.removeFavorite(carId);
                $heartIcon.removeClass("fas").addClass("far");
                $favoriteCount.text(parseInt($favoriteCount.text()) - 1);
            } else { // Not favorited, so add
                await API.addFavorite(carId);
                $heartIcon.removeClass("far").addClass("fas");
                $favoriteCount.text(parseInt($favoriteCount.text()) + 1);
            }
        } catch (error) {
            console.error("Error updating favorite status:", error);
            alert("Failed to update favorite status. Please try again.");
        }
    });

    // Initial check for favorited cars (after cars are displayed)
    $(document).ajaxStop(function() {
        if (window.isAuthenticated()) {
            API.getFavoriteCars().then(favoriteCars => {
                favoriteCars.forEach(favCar => {
                    $(`.d-item_like .fa-heart[data-car-id='${favCar.id}']`).removeClass("far").addClass("fas");
                    // Update count if necessary, though current backend doesn't provide per-car favorite count
                });
            }).catch(error => {
                console.error("Error fetching favorite cars:", error);
            });
        }
    });


