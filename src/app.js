/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */


var MENU_LOCATION=0;
var MENU_SYSTEM=1;

var Settings = require('settings');
var UI = require('ui');


var smappee_conf = Settings.data('smappee_conf')||{};

var SmappeeAPI = require('Smappee-api');


var main = new UI.Card({
  title: 'Smabble v0.3',
  subtitle: 'Smappee@wrist',
	body: 'Starting'
  
});





var menu = new UI.Menu({
  backgroundColor: 'white',
  textColor: 'black',
  highlightBackgroundColor: 'blue',
  highlightTextColor: 'white',
  sections: [{
    title: 'Locations',
    items: [{
      title: 'First Item',
			subtitle: 'Some subtitle'},
      
			{title: 'Second item'
    }]
  },
	{
    title: 'System',
		items: [{title:'refresh'}]
  }]
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
var update_location_menu=function()
{
				var servLoc=Settings.data("smappee_conf").serviceLocations;
	if (typeof servLoc != 'undefined')
		{
				menu.items(MENU_LOCATION,new Array(servLoc.length));
			 		for (var i=0;i<servLoc.length;i++) {
						menu.item(MENU_LOCATION, i, { title: servLoc[i].name, subtitle: 'ID = '+servLoc[i].locationID });	
				 	}
		} else
			{
				console.log("WARNING : no serviceLocation defined");
				menu.items(MENU_LOCATION,[{title:'not defined'}]);
			}
};

var display_locations_ok=function(result)
{
   if (typeof result.error == 'undefined')
     {
          main.body("Location received");
			     // will need to allow the user to chose this via a menu in the future
			 		Settings.data("smappee_conf").serviceLocations=new Array(result.length);
			 
			 	//console.log('# of locations :'+result.length);
			 	//console.log(JSON.stringify(result));
			 		
          menu.items(MENU_LOCATION,new Array(result.length));
			 		for (var i=0;i<result.length;i++) {
						//[{"serviceLocationId":7809,"name":"Page d'accueil"}]
						Settings.data("smappee_conf").serviceLocations[i]={'name':result[i].name,'locationID':result[i].serviceLocationId}; 
			 			//menu.item(MENU_LOCATION, i, { title: result[i].name, subtitle: 'ID = '+result[i].serviceLocationId });	
				 	}
			 		update_location_menu();
			 		
			 
			 		//console.log(JSON.stringify(Settings.data("smappee_conf").serviceLocations));
          
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
      //console.log('answer :');
      //console.log(JSON.stringify(answer));
      
      
      Settings.data("smappee_conf",answer);
			//console.log('New conf :');
      //console.log(JSON.stringify( Settings.data("smappee_conf")));
      smappee.getLocations(smappee_conf,display_locations_ok); 
      
  
};
Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  //console.log(e.response);
  //var configData = JSON.parse(decodeURIComponent(e.response));
  //console.log("Decoded config");
  //console.log(JSON.stringify(configData));
  main.body("received config");
  smappee_conf=JSON.parse(decodeURIComponent(e.response));
  Settings.data("smappee_conf",smappee_conf);
  Settings.data("smappee_conf").serviceLocationIndex=0;
  
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
	
  if (e.button=="up")
    {
      menu.show();
    }
});


menu.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  console.log('The item is titled "' + e.item.title + '"');
	if (e.sectionIndex==MENU_LOCATION)
		{
			Settings.data("smappee_conf").serviceLocationIndex=e.itemIndex;
			refresh();
		}
	if (e.sectionIndex==MENU_SYSTEM)
		{
			
			refresh();
		}
	menu.hide();
});

  

main.show();
refresh();

