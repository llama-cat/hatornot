//requires OAuth1 library
//initialize global variables
var where_am_i = "London"

//thresholds for temp and wind
var too_hot_for_hat = 15;
var too_windy_for_hat = 20;

var hat_hot = false;
var hat_windy = false;

var bot_name = "🎩: ";

/** Bank of tweet responses */
var hot_and_windy = ["Get that hat out of here!","You'd have to be a FOOL to wear a hat.","NO HATS.", "I'd rather you didn't wear a hat.","This place ain't big enough for a hat."];
var cold_and_windy = ["Better hold onto your hat, bud!","Try not to lose your hat!","Bit too blustery for a hat tbh.","I guess you could wear a wooly hat or something idk."];
var hot_and_calm = ["It's too hot for a hat.","You'll look cool, but at what cost????????","A hat? In this economy? Absolutely not.", "It's not the time for a hat.","MAYBE a cap. Maybe."];
var ideal_hat_scenario = ["Hats on, lads!","Wear a hat","ALL THE HATS!","Did somebody say HAT WEATHER?!","Finally, it's hat time.","No hats. JKS. Get that hat on b!", "Very excited to announce that it is time to wear a hat."];

//test of emojis in strings
function emoji_test(){
  var text_out = bot_name + write_tweet();
  Logger.log(text_out);
}

//twitter api keys
var CONSUMER_KEY = '***';
var CONSUMER_SECRET = '***';

//twitter log in
function getService() {
  return OAuth1.createService('Twitter')
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')
  
      // Using a cache will reduce the need to read from 
      // the property store and may increase performance.
      .setCache(CacheService.getUserCache())

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
}

function reset() {
  var service = getService();
  service.reset();
}

function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}

function get_weather_data(location) {
  
  var response = UrlFetchApp.fetch("api.openweathermap.org/data/2.5/weather?q="+ location +"&appid=26d507c1547e5aba63c27c987cd19aa2");
  var json = response.getContentText();
  var data = JSON.parse(json);

  Logger.log(data);

  return data;
}

function hat_or_no_hat() {
  var cur_weather = get_weather_data(where_am_i);
  var decision = 0;
  //strip data
  var tempK = cur_weather["main"]["temp"];
  var wind = cur_weather["wind"]["speed"];
  
  //fix units and clean data
  tempK = tempK.toFixed(2);
  var tempC = (tempK - 273.15).toFixed(2);

  windKM = (wind * 3.6).toFixed(0)

  //make a decision using if's and comparisons

  if (tempC > too_hot_for_hat) {
    hat_hot = true;
  }
  else {
    hat_hot = false;
  }
  if (windKM > too_windy_for_hat) {
    hat_windy = true;
  }
  else {
    hat_windy = false;

  }
  // hot and windy = 1
  // hot and calm = 2
  // cool and windy = 3
  // cooooooool and caaaaaaaaalm = 4
  if ( hat_hot == true && hat_windy == true ){decision = 1; }
  if ( hat_hot == true && hat_windy == false ){decision = 2; }
  if ( hat_hot == false && hat_windy == true ){decision = 3; }
  if ( hat_hot == false && hat_windy == false ){decision = 4; }
  
  Logger.log(tempC);
  Logger.log(windKM);

  Logger.log(hat_hot);
  Logger.log(hat_windy);
  
  Logger.log(decision);

  return decision;
}

function write_tweet(){
  //take the decision from hat_or_no_hat and do something with it
  var what_do_i_tweet = hat_or_no_hat();
  var str = "";
  var rand = 0;

  if (what_do_i_tweet == 1){
    rand = Math.floor(Math.random()*hot_and_windy.length);
    str = hot_and_windy[rand];
  }
  if (what_do_i_tweet == 2){
    rand = Math.floor(Math.random()*hot_and_calm.length);
    str = hot_and_calm[rand];
  }
  if (what_do_i_tweet == 3){
    rand = rand = Math.floor(Math.random()*cold_and_windy.length);
    str = cold_and_windy[rand];
  }
  if (what_do_i_tweet == 4){
    rand = Math.floor(Math.random()*ideal_hat_scenario.length);
    str = ideal_hat_scenario[rand];
  }
  
  return str;

};

function run() {
  var service = getService();
  var tweet = bot_name + write_tweet();
  Logger.log(tweet);
  if (service.hasAccess()) {
    var url = 'https://api.twitter.com/1.1/statuses/update.json';
    var payload = {
      status: tweet
    };
    var response = service.fetch(url, {
      method: 'post',
      payload: payload
    });
    var result = JSON.parse(response.getContentText());
    Logger.log(JSON.stringify(result, null, 2));
  } else {
    var authorizationUrl = service.authorize();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
} 
