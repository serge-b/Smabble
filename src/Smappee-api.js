/**
* Original file by Serge Besnard

*/
var ajax=require('ajax');

function SmappeeAPI(_main) {
  this.name='SmappeeAPI';
  this.main=_main;
  
  this.AGGREGATION_TYPES = {
        MINUTES: 1,
        HOURLY: 2,
        DAILY: 3,
        MONTHLY: 4,
        QUARTERLY: 5
    };

 
  this.getLocations= function(conf, handler)
  {
    console.log("Obtaining location ID");
    ajax({
            url: 'https://app1pub.smappee.net/dev/v1/servicelocation',
            method : 'GET',
      
      headers :{'Authorization': ' Bearer '+conf.access_token},
       },
      function(result) {
        
        var answer=JSON.parse(JSON.stringify(JSON.parse(result).serviceLocations));
				console.log("Answer :");
        
				 console.log(JSON.stringify(answer));
        if (typeof handler!='undefined') handler(answer);
      },
         function(data) {
           console.log("failure: "+ data); // test https
           console.log("No locationID");
           if (typeof handler!='undefined') handler({error:true, message:data});
      }
    );
  };
  
      /**
     * Get a list of all consumptions for the specified period and interval.
     *
     * see https://smappee.atlassian.net/wiki/display/DEVAPI/Get+Consumption
     *
     * @param serviceLocationId     serviceLocationId one of the ids from the getServiceLocations() request.
     * @param aggregation           one of the AGGREGATION TYPES to specify the periodically of the consumptions to return.
     * @param from                  date in UTC milliseconds to start from
     * @param to                    date in UTC milliseconds to end with
     * @param handler               function that will be called when request is completed.
     */

  


  this.getConsumption= function(conf,handler)
  {
    console.log("Starting get Consumption");
    if (typeof conf.serviceLocations[0].locationID=="undefined")
      {
        console.log("No location index");
        this.getLocations(conf);
        if (typeof(handler)!='undefined') handler({error:true});
        return;
      }
    
    console.log("location ID="+conf.serviceLocations[conf.serviceLocationIndex].locationID+", getting consumptions");
    ajax({
            url: 'https://app1pub.smappee.net/dev/v1/servicelocation/'+conf.serviceLocations[conf.serviceLocationIndex].locationID+'/consumption?'+
            'aggregation=1&'+
            'from='+(Date.now()-20*60*1000)+
            '&to='+(Date.now()-60*1000),
     
            method : 'GET',
     
      headers :{'Authorization': ' Bearer '+conf.access_token},
       },
      function(result) {
        console.log("Consumption received");
        console.log(result);
        
        if (typeof handler!='undefined') handler(JSON.parse(result));
      },
         function(result) {
           console.log("failure: "+ result);
           if (typeof(handler)!='undefined') handler({error:true});
      }
    );
  };
  
   this.getToken=function(conf,handler){
      
      ajax({
              url: 'https://app1pub.smappee.net/dev/v1/oauth2/token',
              method : 'POST',
        //type : 'json',
        data :{grant_type:'password',
               client_id:conf.client_id,
               client_secret:conf.client_secret,
               username:conf.username,
               password:conf.password},
        headers:'application/x-www-form-urlencoded;charset=UTF-8'
           },
        function(result) {
          console.log( result); 
          var obj=JSON.parse(result);
          
          conf.refresh_token=obj.refresh_token;
          conf.access_token=obj.access_token;
          conf.expires_on=(Date.now()+obj.expires_in);
          console.log(JSON.stringify(conf));
          
          if (typeof handler != 'undefined') handler(conf);
          
        },
           function(result) {
             console.log("failure: "+ result); // test https
             this.main.body("Failed authentication\r\nCheck data submitted");
        }
      );
  };
  
  this.refreshToken=function(conf,handler){
    this.main.body("Refreshing token");
    console.log("Refreshing token");
    console.log(JSON.stringify(conf));
    console.log((Date.now()>conf.expires_on));
    ajax({
              url: 'https://app1pub.smappee.net/dev/v1/oauth2/token',
              method : 'POST',
        
        data :{grant_type:'refresh_token',
               client_id:conf.client_id,
               client_secret:conf.client_secret,
               refresh_token:conf.refresh_token},
                headers:'application/x-www-form-urlencoded;charset=UTF-8'
           },
        function(result) {
					console.log("succes of refresh. Resturn value :");
          console.log(result);
					var r=JSON.parse(result);
          if (typeof handler != 'undefined')
            {
              console.log("Refresh is a success, returning to handler");
							//{"access_token":"f7bf4cfa-7b63-3639-b52b-823b6485bdd2","refresh_token":"a5f1fdb0-2f4d-3486-aa09-f700ad1d5b24","expires_in":86400}
							var answer={
              'refresh_token':r.refresh_token,
              'access_token':r.access_token,
              'expires_on':Date.now()+r.expires_in
              };
							console.log("answer:");
          		console.log(answer);
							handler(answer);
            } else
              {
          conf.refresh_token=r.refresh_token;
          conf.access_token=r.access_token;
          conf.expires_on=(Date.now()+r.expires_in);
              }
          
        },
           function(result) {
             console.log("failure: "+ result); // test https
             if (typeof handler != 'undefined')    handler({error:true,result:result});
        }
      );
  };
}
module.exports = SmappeeAPI;
