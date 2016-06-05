var document; 
// Get a handle to the button's HTML element
  var submitButton = document.getElementById('submit_button');
  var cancelButton = document.getElementById('cancel_button');
	
	cancelButton.addEventListener('click', function() {
    function getQueryParam(variable, defaultValue) {
      var query = location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return decodeURIComponent(pair[1]);
        }
      }
    }
		var return_to = getQueryParam('return_to', 'pebblejs://close#');

		// Encode and send the data when the page closes
		document.location = return_to + "cancel";
  });
  // Add a 'click' listener
  submitButton.addEventListener('click', function() {
    // Get the config data from the UI elements
    var client_id = document.getElementById('client_id');
    var client_secret = document.getElementById('client_secret');
    var username = document.getElementById('username');
    var password = document.getElementById('password');

    // Make a data object to be sent, coercing value types to integers
    var options = {
      'client_id': client_id.value,
      'client_secret': client_secret.value,
      'username': username.value,
      'password': password.value
    };

    // Determine the correct return URL (emulator vs real watch)
    function getQueryParam(variable, defaultValue) {
      var query = location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return decodeURIComponent(pair[1]);
        }
      }
      return defaultValue || false;
    }
    var return_to = getQueryParam('return_to', 'pebblejs://close#');

    // Encode and send the data when the page closes
    document.location = return_to + encodeURIComponent(JSON.stringify(options));
  });