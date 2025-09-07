// Dashboard functionality for user account pages

$(document).ready(function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data and dashboard content based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'account-dashboard.html':
            loadDashboard();
            break;
        case 'account-profile.html':
            loadProfile();
            break;
        case 'account-booking.html':
            loadBookings();
            break;
        case 'account-favorite.html':
            loadFavorites();
            break;
    }
    
    // Profile form handling
    $('#profile_form').on('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Logout handling
    $('.logout-btn').on('click', function(e) {
        e.preventDefault();
        API.logout();
    });
});

function loadDashboard() {
    // Load user info
    API.getCurrentUser()
        .then(function(user) {
            $('#user-name').text(`${user.first_name} ${user.last_name}`);
            $('#user-email').text(user.email);
            $('#user-since').text(new Date(user.registration_date).toLocaleDateString());
        })
        .catch(function(error) {
            console.error('Failed to load user data:', error);
        });
    
    // Load dashboard stats
    API.getDashboardStats()
        .then(function(stats) {
            $('#total-bookings').text(stats.total_bookings);
            $('#active-bookings').text(stats.active_bookings);
        })
        .catch(function(error) {
            console.error('Failed to load dashboard stats:', error);
        });
    
    // Load recent bookings
    API.getUserBookings()
        .then(function(bookings) {
            displayRecentBookings(bookings.slice(0, 5)); // Show last 5 bookings
        })
        .catch(function(error) {
            console.error('Failed to load bookings:', error);
        });
}

function loadProfile() {
    API.getCurrentUser()
        .then(function(user) {
            // Populate form fields
            $('#profile_username').val(user.username);
            $('#profile_email').val(user.email);
            $('#profile_first_name').val(user.first_name || '');
            $('#profile_last_name').val(user.last_name || '');
            $('#profile_phone').val(user.phone_number || '');
            $('#profile_address').val(user.address || '');
        })
        .catch(function(error) {
            console.error('Failed to load profile:', error);
            showMessage('Failed to load profile data', 'error');
        });
}

function updateProfile() {
    const profileData = {
        first_name: $('#profile_first_name').val(),
        last_name: $('#profile_last_name').val(),
        phone_number: $('#profile_phone').val(),
        address: $('#profile_address').val()
    };
    
    $('#profile_submit').prop('disabled', true).val('Updating...');
    
    API.updateProfile(profileData)
        .then(function(result) {
            showMessage('Profile updated successfully!', 'success');
            $('#profile_submit').prop('disabled', false).val('Update Profile');
        })
        .catch(function(error) {
            console.error('Failed to update profile:', error);
            showMessage('Failed to update profile. Please try again.', 'error');
            $('#profile_submit').prop('disabled', false).val('Update Profile');
        });
}

function loadBookings() {
    API.getUserBookings()
        .then(function(bookings) {
            displayBookings(bookings);
        })
        .catch(function(error) {
            console.error('Failed to load bookings:', error);
            showMessage('Failed to load bookings', 'error');
        });
}

function displayBookings(bookings) {
    const container = $('#bookings-container');
    if (!container.length) return;
    
    if (bookings.length === 0) {
        container.html('<div class="col-12"><p class="text-center">No bookings found.</p></div>');
        return;
    }
    
    let html = '';
    bookings.forEach(function(booking) {
        html += generateBookingCard(booking);
    });
    
    container.html(html);
}

function displayRecentBookings(bookings) {
    const container = $('#recent-bookings');
    if (!container.length) return;
    
    if (bookings.length === 0) {
        container.html('<p>No recent bookings.</p>');
        return;
    }
    
    let html = '<ul class="list-group">';
    bookings.forEach(function(booking) {
        const statusClass = getStatusClass(booking.booking_status);
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${booking.car.make} ${booking.car.model}</strong><br>
                    <small>${new Date(booking.pickup_datetime).toLocaleDateString()} - ${new Date(booking.return_datetime).toLocaleDateString()}</small>
                </div>
                <span class="badge ${statusClass}">${booking.booking_status}</span>
            </li>
        `;
    });
    html += '</ul>';
    
    container.html(html);
}

function generateBookingCard(booking) {
    const statusClass = getStatusClass(booking.booking_status);
    
    return `
        <div class="col-lg-6 col-md-12 mb-4">
            <div class="booking-card card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="${booking.car.image_url || 'images/cars/default-car.jpg'}" 
                                 alt="${booking.car.make} ${booking.car.model}" 
                                 class="img-fluid rounded">
                        </div>
                        <div class="col-md-8">
                            <h5 class="card-title">${booking.car.make} ${booking.car.model}</h5>
                            <p class="card-text">
                                <strong>Booking ID:</strong> #${booking.id}<br>
                                <strong>Pickup:</strong> ${new Date(booking.pickup_datetime).toLocaleString()}<br>
                                <strong>Return:</strong> ${new Date(booking.return_datetime).toLocaleString()}<br>
                                <strong>Location:</strong> ${booking.pickup_location}<br>
                                <strong>Total:</strong> $${booking.total_price}
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge ${statusClass}">${booking.booking_status}</span>
                                ${booking.booking_status === 'pending' || booking.booking_status === 'confirmed' ? 
                                    `<button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button>` : 
                                    ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStatusClass(status) {
    switch(status) {
        case 'confirmed': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        case 'completed': return 'badge-info';
        default: return 'badge-secondary';
    }
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    API.cancelBooking(bookingId)
        .then(function(result) {
            showMessage('Booking cancelled successfully', 'success');
            loadBookings(); // Reload bookings
        })
        .catch(function(error) {
            console.error('Failed to cancel booking:', error);
            showMessage('Failed to cancel booking. Please try again.', 'error');
        });
}

function showMessage(message, type) {
    // Remove existing messages
    $('.dashboard-message').remove();
    
    // Create message element
    const messageClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const messageHtml = `
        <div class="dashboard-message alert ${messageClass}" style="margin: 20px 0;">
            ${message}
        </div>
    `;
    
    // Insert message
    $('.container').prepend(messageHtml);
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
        $('.dashboard-message').fadeOut();
    }, 5000);
}

function displayFavorites(favorites) {
    const container = $('#favorites-container');
    if (!container.length) return;

    if (favorites.length === 0) {
        container.html('<div class="col-12"><p class="text-center">No favorite cars found.</p></div>');
        return;
    }

    let html = '';
    favorites.forEach(function(car) {
        html += generateCarCard(car);
    });

    container.html(html);
}


function filterCars() {
    const filters = {
        car_type: [],
        seats: [],
        price_range: $("#price-range").val(),
    };

    $('input[name="vehicle_type"]:checked').each(function() {
        filters.car_type.push($(this).val());
    });

    $('input[name="car_seats"]:checked').each(function() {
        filters.seats.push($(this).val());
    });

    loadCars(filters);
}





function loadUserData() {
    API.getCurrentUser()
        .then(function(user) {
            displayUserData(user);
        })
        .catch(function(error) {
            console.error("Failed to load user data:", error);
            showMessage("Failed to load user data.", "error");
            // Redirect to login if not authenticated
            if (error.message.includes("401")) {
                window.location.href = "login.html";
            }
        });
}

function displayUserData(user) {
    // Update profile name and email in header
    $(".de-submenu .d-name h4").text(`${user.first_name} ${user.last_name}`);
    $(".de-submenu .d-name .text-gray").text(user.email);

    // Update dashboard profile info
    $("#user-name").text(`${user.first_name} ${user.last_name}`);
    $("#user-email").text(user.email);
    $("#user-since").text(`Member since: ${new Date(user.created_at).toLocaleDateString()}`);

    // Update profile page form fields
    $("#first_name").val(user.first_name);
    $("#last_name").val(user.last_name);
    $("#email").val(user.email);
    $("#phone").val(user.phone_number);
    $("#address").val(user.address);
}






function loadUserBookings() {
    API.getUserBookings()
        .then(function(bookings) {
            displayUserBookings(bookings);
        })
        .catch(function(error) {
            console.error("Failed to load user bookings:", error);
            showMessage("Failed to load user bookings.", "error");
        });
}

function displayUserBookings(bookings) {
    const container = $("#bookings-container");
    if (!container.length) return;

    if (bookings.length === 0) {
        container.html("<div class=\"col-12\"><p class=\"text-center\">No bookings found.</p></div>");
        return;
    }

    let html = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Order ID</span></th>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Car Name</span></th>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Pick Up Location</span></th>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Drop Off Location</span></th>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Pick Up Date</span></th>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Return Date</span></th>
                    <th scope="col"><span class="text-uppercase fs-12 text-gray">Status</span></th>
                </tr>
            </thead>
            <tbody>
    `;

    bookings.forEach(function(booking) {
        const pickUpDate = new Date(booking.pickup_datetime).toLocaleDateString();
        const returnDate = new Date(booking.return_datetime).toLocaleDateString();
        const statusClass = booking.status === "completed" ? "bg-success" : booking.status === "cancelled" ? "bg-danger" : "bg-warning";
        html += `
            <tr>
                <td><span class="d-lg-none d-sm-block">Order ID</span><div class="badge bg-gray-100 text-dark">#${booking.id}</div></td>
                <td><span class="d-lg-none d-sm-block">Car Name</span><span class="bold">${booking.car.make} ${booking.car.model}</span></td>
                <td><span class="d-lg-none d-sm-block">Pick Up Location</span>${booking.pickup_location}</td>
                <td><span class="d-lg-none d-sm-block">Drop Off Location</span>${booking.dropoff_location}</td>
                <td><span class="d-lg-none d-sm-block">Pick Up Date</span>${pickUpDate}</td>
                <td><span class="d-lg-none d-sm-block">Return Date</span>${returnDate}</td>
                <td><div class="badge ${statusClass}">${booking.status}</div></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.html(html);
}





$(document).ready(function() {
    if (window.location.pathname.includes("account-dashboard.html") ||
        window.location.pathname.includes("account-profile.html") ||
        window.location.pathname.includes("account-booking.html") ||
        window.location.pathname.includes("account-favorite.html")) {
        loadUserData();
    }

    if (window.location.pathname.includes("account-booking.html")) {
        loadUserBookings();
    }

    if (window.location.pathname.includes("account-favorite.html")) {
        loadFavorites();
    }
});





function loadFavorites() {
    API.getFavoriteCars()
        .then(function(favorites) {
            displayFavorites(favorites);
        })
        .catch(function(error) {
            console.error("Failed to load favorite cars:", error);
            // Optionally display an error message to the user
        });
}

function displayFavorites(favorites) {
    const container = $("#favorite-cars-container");
    container.empty();

    let html = '';

    if (favorites.length === 0) {
        container.html("<p>No favorite cars yet.</p>");
        return;
    }

    favorites.forEach(function(car) {
        html += generateCarCard(car);
    });

    container.html(html);
}

function generateCarCard(car) {
    return `
        <div class="col-xl-4 col-lg-6">
            <div class="de-item mb30">
                <div class="d-img">
                    <img src="${car.image_url}" class="img-fluid" alt="${car.make} ${car.model}" onerror="this.src='images/cars-alt/default-car.png'">
                </div>
                <div class="d-info">
                    <div class="d-text">
                        <h4>${car.make} ${car.model}</h4>
                        <div class="d-item_like" data-car-id="${car.id}">
                            <i class="fa fa-heart far"></i><span class="likes-count">${car.favorite_count || 0}</span>
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
}


