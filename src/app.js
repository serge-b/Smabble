/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');

var Settings = require('settings');


var smappee_conf = Settings.data('smappee_conf')||{};

var SmappeeAPI = require('Smappee-api');


var main = new UI.Card({
  title: 'Smabble v0.2',
  subtitle: 'Smappee@wrist',
	body: 'Starting'
  
});
var smappee = new SmappeeAPI(main);



var display_cons=function(result)
{
  console.log("display_cons");      
  console.log(JSON.stringify(result));
        if (typeof(result)!='undefined')
        {
          if (typeof(result.consumptions)!='undefined')
            {
                var l=result.consumptions.length;
                  console.log(l);
                  if (l>0) 
                  {
                    main.body("Solar : "+(result.consumptions[l-1].solar*12).toFixed(0)+"\r\n"+
                              "Elec : "+(result.consumptions[l-1].consumption*12).toFixed(0)
                             );
                    
                  }
            }
        }
};
var display_locations_ok=function(result)
{
   if (typeof result.error == 'undefined')
     {
          main.body("Location received");
			    Settings.data("smappee_conf").serviceLocationIndex=0; // will need to allow the user to chose this via a menu in the future
			 		Settings.data("smappee_conf").serviceLocations=new Array(result.length);
			 
			 /*
			 # of locations :1
[PHONE] pebble-app.js:?: [{"serviceLocationId":7809,"name":"Page d'accueil"}]
[PHONE] pebble-app.js:?: None
[PHONE] pebble-app.js:?: [{"name":"Page d'accueil"}]
*/
			 	console.log('# of locations :'+result.length);
			 console.log(JSON.stringify(result));
			 		
          
			 		for (var i=0;i<result.length;i++) {
						//[{"serviceLocationId":7809,"name":"Page d'accueil"}]
						Settings.data("smappee_conf").serviceLocations[i]={'name':result[i].name,'locationID':result[i].serviceLocationId}; 
			 				
				 	}
			 		console.log(JSON.stringify(Settings.data("smappee_conf").serviceLocations));
          
          smappee.getConsumption(Settings.data('smappee_conf'),display_cons);      
     }
  else
    {
          console.log('Error retreiving locations');
          console.log(result.message);
    }
  
};

Pebble.addEventListener('showConfiguration', function() {
  var url = 'http://petiteappli.com/files/index.html';
  main.body("opening config");
  Pebble.openURL(url);
});
/**
*		once_token_obtained
*		callback function invoked by smappee.getToken has been invoked
*		@answer : the value of the configuration data to be stored into the local storage
*							it contains a dictionary of key/value pairs indicating the 
							"client_id"
							"client_secret"
							"username"
							"password"
							"refresh_token"
							"access_token"
							"expires_on"
		If @answer is valid, goes an calling the api's getLocations with as parameters :
			the configuration
			display_locations_ok as callback.
*/

var once_token_obtained=function(answer)
{
  if (typeof smappee_conf.access_token == 'undefined')
      {
        // handle error here
        return;
      }
      console.log('answer :');
      console.log(JSON.stringify(answer));
      
      
      Settings.data("smappee_conf",answer);
			console.log('New conf :');
      console.log(JSON.stringify( Settings.data("smappee_conf")));
      smappee.getLocations(smappee_conf,display_locations_ok); 
      
  
};
Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  console.log(e.response);
  var configData = JSON.parse(decodeURIComponent(e.response));
  console.log("Decoded config");
   console.log(JSON.stringify(configData));
  main.body("received config");
  smappee_conf=JSON.parse(decodeURIComponent(e.response));
  Settings.data("smappee_conf",smappee_conf);
  
  
  smappee.getToken(smappee_conf, once_token_obtained);
  
      
});





var post_token_refresh=function(result)
{
      if (typeof result.error == 'undefined')
        {
          console.log(JSON.stringify(result));    
					Settings.data("smappee_conf").refresh_token=result.refresh_token;
              Settings.data("smappee_conf").access_token=result.access_token;
              Settings.data("smappee_conf").expires_on=result.expires_on;
					console.log("REfresh is a success");
               console.log(JSON.stringify(Settings.data("smappee_conf")));
              smappee.getLocations(Settings.data("smappee_conf"),display_locations_ok); 
        }
      else
        {
          main.body("Could not\r\nrefresh token");
        }
};


var refresh=function()
{
  if (typeof smappee_conf.expires_on=="undefined")
    {
      main.body("First connection\r\nPlease configure");
    }
  else
    {
      main.body("Checking token");
      if (smappee_conf.expires_on<Date.now())
        {
          console.log("Need to refresh token");
          main.body("Refreshing token");
          smappee.refreshToken(Settings.data("smappee_conf"),post_token_refresh);
          
        }
      else
        {
          main.body("Token fresh enough");
          smappee.getLocations(Settings.data("smappee_conf"),display_locations_ok); 
        }
      
    }
};

main.on('click', function(e) {
  console.log('Button ' + e.button + ' pressed.');
  
  if (e.button=="select")
    {
      refresh();
    }
  
});
main.show();
refresh();

