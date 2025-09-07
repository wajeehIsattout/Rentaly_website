$(document).ready(function() {
    // Load cars for the landing page carousel
    loadLandingCars();

    function loadLandingCars() {
        // Fetch a limited number of cars for the landing page (e.g., 6 cars)
        fetch(`${API_BASE_URL}/cars?limit=6`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch cars');
                }
                return response.json();
            })
            .then(cars => {
                displayLandingCars(cars);
            })
            .catch(error => {
                console.error("Error loading cars for landing page:", error);
                // Show fallback content or error message
                displayFallbackCars();
            });
    }

    function displayLandingCars(cars) {
        const carousel = $("#items-carousel");
        carousel.empty();
        
        if (cars.length === 0) {
            displayFallbackCars();
            return;
        }
        
        cars.forEach(function(car) {
            const carHtml = `
                <div class="col-lg-12">
                    <div class="de-item mb30">
                        <div class="d-img">
                            <img src="${car.image_url}" class="img-fluid" alt="${car.make} ${car.model}" onerror="this.src='images/cars/default-car.jpg'">
                        </div>
                        <div class="d-info">
                            <div class="d-text">
                                <h4>${car.make} ${car.model}</h4>
                                <div class="d-item_like">
                                    <i class="fa fa-heart"></i><span>0</span>
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
            carousel.append(carHtml);
        });

        // Reinitialize the owl carousel after adding content
        initializeCarousel();
    }

    function displayFallbackCars() {
        // Display some default cars if API fails
        const carousel = $("#items-carousel");
        const fallbackCars = [
            {
                id: 1,
                make: "Jeep",
                model: "Renegade",
                image_url: "images/cars/jeep-renegade.jpg",
                daily_rate: 265,
                seats: 5,
                category: "SUV"
            },
            {
                id: 2,
                make: "BMW",
                model: "M2",
                image_url: "images/cars/bmw-m5.jpg",
                daily_rate: 244,
                seats: 5,
                category: "Sedan"
            },
            {
                id: 3,
                make: "Ferrari",
                model: "Enzo",
                image_url: "images/cars/ferrari-enzo.jpg",
                daily_rate: 167,
                seats: 2,
                category: "Exotic Car"
            }
        ];

        carousel.empty();
        fallbackCars.forEach(function(car) {
            const carHtml = `
                <div class="col-lg-12">
                    <div class="de-item mb30">
                        <div class="d-img">
                            <img src="${car.image_url}" class="img-fluid" alt="${car.make} ${car.model}">
                        </div>
                        <div class="d-info">
                            <div class="d-text">
                                <h4>${car.make} ${car.model}</h4>
                                <div class="d-item_like">
                                    <i class="fa fa-heart"></i><span>0</span>
                                </div>
                                <div class="d-atr-group">
                                    <span class="d-atr"><img src="images/icons/1-green.svg" alt="">${car.seats}</span>
                                    <span class="d-atr"><img src="images/icons/2-green.svg" alt="">2</span>
                                    <span class="d-atr"><img src="images/icons/3-green.svg" alt="">4</span>
                                    <span class="d-atr"><img src="images/icons/4-green.svg" alt="">${car.category}</span>
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
            carousel.append(carHtml);
        });

        initializeCarousel();
    }

    function initializeCarousel() {
        // Destroy existing carousel if it exists
        if ($("#items-carousel").hasClass('owl-loaded')) {
            $("#items-carousel").trigger('destroy.owl.carousel');
        }

        // Initialize owl carousel
        $("#items-carousel").owlCarousel({
            items: 3,
            loop: true,
            margin: 30,
            nav: true,
            dots: false,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        });
    }
});

