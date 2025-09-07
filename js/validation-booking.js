$(document).ready(function(){
        // Check if user is authenticated for booking
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            showMessage('Please login to make a booking', 'error');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        // Get car ID from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('car_id');
        
        if (carId) {
            $('#booking_car_id').val(carId);
            // Load car details
            API.getCar(carId).then(function(car) {
                $('#selected_car_info').html(`
                    <div class="alert alert-info">
                        <strong>Selected Car:</strong> ${car.make} ${car.model} - $${car.daily_rate}/day
                    </div>
                `);
                $('#car_daily_rate').val(car.daily_rate);
                calculateTotal();
            }).catch(function(error) {
                showMessage('Failed to load car details', 'error');
            });
        }
        
        // Calculate total when dates change
        $('#pickup_datetime, #return_datetime').on('change', calculateTotal);
        
        $('#send_message').click(function(e){
            
            //Stop form submission & check the validation
            e.preventDefault();
            
            // Variable declaration
            var error = false;
            var carId = $('#booking_car_id').val();
            var pickupLocation = $('#pickup_location').val();
            var dropoffLocation = $('#dropoff_location').val();
            var pickupDatetime = $('#pickup_datetime').val();
            var returnDatetime = $('#return_datetime').val();
            var totalPrice = $('#total_price').val();
            
            $('#pickup_location,#dropoff_location,#pickup_datetime,#return_datetime').click(function(){
                $(this).removeClass("error_input");
            });
            
            // Form field validation
            if(!carId){
                var error = true;
                showMessage('Please select a car first', 'error');
            }
            if(pickupLocation.length == 0){
                var error = true;
                $('#pickup_location').addClass("error_input");
            }else{
                $('#pickup_location').removeClass("error_input");
            }
            if(dropoffLocation.length == 0){
                var error = true;
                $('#dropoff_location').addClass("error_input");
            }else{
                $('#dropoff_location').removeClass("error_input");
            }
            if(pickupDatetime.length == 0){
                var error = true;
                $('#pickup_datetime').addClass("error_input");
            }else{
                $('#pickup_datetime').removeClass("error_input");
            }
            if(returnDatetime.length == 0){
                var error = true;
                $('#return_datetime').addClass("error_input");
            }else{
                $('#return_datetime').removeClass("error_input");
            }
            
            // Date validation
            if(pickupDatetime && returnDatetime) {
                const pickup = new Date(pickupDatetime);
                const returnDate = new Date(returnDatetime);
                const now = new Date();
                
                if(pickup < now) {
                    var error = true;
                    showMessage('Pickup date cannot be in the past', 'error');
                }
                if(returnDate <= pickup) {
                    var error = true;
                    showMessage('Return date must be after pickup date', 'error');
                }
            }
            
            // If there is no validation error, create booking
            if(error == false){
               // Disable submit button just after the form processed 1st time successfully.
                $('#send_message').attr({'disabled' : 'true', 'value' : 'Creating Booking...' });
                
                // Use API to create booking
                API.createBooking({
                    car_id: parseInt(carId),
                    pickup_location: pickupLocation,
                    dropoff_location: dropoffLocation,
                    pickup_datetime: pickupDatetime,
                    return_datetime: returnDatetime,
                    total_price: parseFloat(totalPrice)
                }).then(function(result) {
                    // If the booking is created successfully
                    $('#booking_form_wrap').remove();
                    $('#success_message').html(`
                        <div class="alert alert-success">
                            <h4>Booking Successful!</h4>
                            <p>Your booking has been created successfully. Booking ID: #${result.id}</p>
                            <p>You will receive a confirmation email shortly.</p>
                            <a href="account-booking.html" class="btn btn-primary">View My Bookings</a>
                        </div>
                    `).fadeIn(500);
                }).catch(function(error) {
                    // Display the error message
                    showMessage('Booking failed. Please try again.', 'error');
                    // Enable the submit button again
                    $('#send_message').removeAttr('disabled').attr('value', 'Create Booking');
                });
            }
        });
        
        function calculateTotal() {
            const pickupDate = $('#pickup_datetime').val();
            const returnDate = $('#return_datetime').val();
            const dailyRate = parseFloat($('#car_daily_rate').val());
            
            if (pickupDate && returnDate && dailyRate) {
                const pickup = new Date(pickupDate);
                const returnDateTime = new Date(returnDate);
                const timeDiff = returnDateTime.getTime() - pickup.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (daysDiff > 0) {
                    const total = daysDiff * dailyRate;
                    $('#total_price').val(total.toFixed(2));
                    $('#total_display').text(`$${total.toFixed(2)} (${daysDiff} days × $${dailyRate}/day)`);
                }
            }
        }
        
        function showMessage(message, type) {
            // Remove existing messages
            $('.booking-message').remove();
            
            // Create message element
            const messageClass = type === 'success' ? 'alert-success' : 'alert-danger';
            const messageHtml = `
                <div class="booking-message alert ${messageClass}" style="margin: 20px 0;">
                    ${message}
                </div>
            `;
            
            // Insert message
            $('.container').prepend(messageHtml);
            
            // Auto-hide after 5 seconds
            setTimeout(function() {
                $('.booking-message').fadeOut();
            }, 5000);
        }
    });

