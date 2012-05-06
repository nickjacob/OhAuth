var Strategies = {
	twitter: function(consumerKey,consumerSecret,urls){
		var config = {
			requestURL: 'https://api.twitter.com/oauth/request_token',
			accessURL: 'https://api.twitter.com/oauth/access_token',
			authorizeURL: 'https://api.twitter.com/oauth/authorize',
			consumerKey: consumerKey,
			consumerSecret: consumerSecret	
		};
		if(typeof urls ==='object'){
			config.loginURL = urls.loginURL;
			config.callbackURL = urls.callBackURL;
			config.successURL = urls.successURL;
			config.errorURL = urls.errorURL;
		}else config.rootURL = urls; //it's just the necessary one		
		// return it for use in the constructor
		return config;
	},
	socialflow: function(consumerKey,consumerSecret){
		var config = {
			requestURL: 'https://www.socialflow.com/oauth/request_token',
			accessURL: 'https://www.socialflow.com/oauth/access_token',
			authorizeURL: 'https://www.socialflow.com/oauth/authorize',
			consumerKey: consumerKey,
			consumerSecret: consumerSecret	
		};
		if(typeof urls ==='object'){
			config.loginURL = urls.loginURL;
			config.callBackURL = urls.callBackURL;
			config.successURL = urls.successURL;
			config.errorURL = urls.errorURL;
		}else config.callBackURL = urls; //it's just the necessary one		
		// return it for use in the constructor
		return config;	
	}
};
// doesn't really exist as anything
module.exports = Strategies;