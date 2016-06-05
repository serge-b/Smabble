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
          smappee_conf.serviceLocationID=result.serviceLocationID; 
          Settings.data("smappee_conf",smappee_conf);
          smappee.getConsumption(smappee_conf,display_cons);      
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

var once_token_obtained=function(answer)
{
  if (typeof smappee_conf.access_token == 'undefined')
      {
        //error
        return;
      }
      console.log('New conf :');
      console.log(JSON.stringify(smappee_conf));
      console.log('New conf :');
      
      Settings.data("smappee_conf",smappee_conf);
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
  
  var need_token=(typeof smappee_conf.access_token=="undefined")?true:false;
  
  if (need_token){
    smappee.getToken(smappee_conf, once_token_obtained);
  }
      
});





var post_token_refresh=function(result)
{
      if (typeof result.error == 'undefined')
        {
              smappee_conf.refresh_token=result.refresh_token;
              smappee_conf.access_token=result.access_token;
              smappee_conf.expires_on=(Date.now()+result.expires_in);
              Settings.data("smappee_conf",smappee_conf);
              smappee.getLocations(smappee_conf,display_locations_ok); 
        }
      else
        {
          main.body("Could not\r\nrefresh token");
        }
};


var refresh=function()
{
  if ((typeof smappee_conf.expires_on=="undefined")||(smappee_conf.expires_on===null))
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
          smappee.refreshToken(smappee_conf,post_token_refresh);
          
        }
      else
        {
          main.body("Token fresh enough");
          smappee.getConsumption(smappee_conf,display_cons);
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

