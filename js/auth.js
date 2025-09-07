$(document).ready(function() {
    // Login form
    $('#login_form').on('submit', function(e) {
        e.preventDefault();
        
        const username = $('#login_username').val();
        const password = $('#login_password').val();
        
        if (!username || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        $('#login_submit').prop('disabled', true).val('Logging in...');
        
        API.login(username, password)
            .then(function(result) {
                showMessage('Login successful!', 'success');
                setTimeout(function() {
                    window.location.href = 'account-dashboard.html';
                }, 1000);
            })
            .catch(function(error) {
                console.error('Login error:', error);
                showMessage('Login failed. Please check your credentials.', 'error');
                $('#login_submit').prop('disabled', false).val('Login');
            });
    });
    
    // Register form - using direct form access
    $('#register_form').on('submit', function(e) {
        e.preventDefault();
        handleRegistration();
    });
    
    $('#register_submit').on('click', function(e) {
        e.preventDefault();
        handleRegistration();
    });
    
    function handleRegistration() {
        console.log('Starting registration process...');
        
        // Access form elements directly
        const form = document.getElementById('register_form');
        if (!form) {
            console.error('Form not found');
            return;
        }
        
        const inputs = form.querySelectorAll('input');
        console.log('Found', inputs.length, 'inputs');
        
        const formData = {
            first_name: inputs[0].value,
            last_name: inputs[1].value,
            email: inputs[2].value,
            phone_number: inputs[3].value,
            username: inputs[4].value,
            address: inputs[5].value,
            password: inputs[6].value
        };
        
        const confirmPassword = inputs[7].value;
        
        console.log('Form data:', formData);
        
        // Validation
        if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        if (formData.password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (formData.password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        $('#register_submit').prop('disabled', true).val('Creating Account...');
        
        API.register(formData)
            .then(function(result) {
                console.log('Registration successful:', result);
                showMessage('Registration successful! You can now login.', 'success');
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 2000);
            })
            .catch(function(error) {
                console.error('Registration error:', error);
                showMessage('Registration failed. Username or email may already exist.', 'error');
                $('#register_submit').prop('disabled', false).val('Register Now');
            });
    }
});

function showMessage(message, type) {
    // Remove existing messages
    $('.auth-message').remove();
    
    // Create message element
    const messageClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const messageHtml = `
        <div class="auth-message alert ${messageClass}" style="margin: 20px 0;">
            ${message}
        </div>
    `;
    
    // Insert message at the top of the container
    $('.container').first().prepend(messageHtml);
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
        $('.auth-message').fadeOut();
    }, 5000);
}

