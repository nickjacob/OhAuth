// OhAuth - lazy oauth drop-in for express
//	it uses oauth.js (node-oauth) and make it so you can 
// 	just pass in your express app and expect it to work 
var OAuth = require('oauth').OAuth;


var OhAuth = function(apiData,app,Express){
	if(!apiData || !app) throw new Error('OhAuth requires data & app to work');
	this.apiData = apiData;
	this.logging = apiData.logging || false;
	this.__setURLS();
	this.__configureApp(app);	
};
OhAuth.strategies = {
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

OhAuth.prototype = {

	__configureApp: function(app,Express){
		this.app = app;
		Express = Express || require('express');
		// set up the app
		app.configure(function(){
			app.use(Express.cookieParser());
			app.use(Express.bodyParser());
			app.use(Express.methodOverride());
			app.use(Express.session({secret: 'thuglife'}));			
		});
		// configure routes in/for express -- remember scope/closures!
		var self = this;
		this.app.get(this.urls.login,function(req,res){ self.__login(req,res); });
		this.app.get(this.urls.callback,function(req,res){ self.__callback(req,res); });
		// this.app.get(this.urls.success,this.__success); who wants this?
		this.app.get(this.urls.error,function(req,res){ self.__error(req,res);});
	},
	__setURLS: function(){
		this.urls = {
			login : this.apiData.loginURL || '/oauth/login',
			callback : this.apiData.callbackURL || '/oauth/callback',
			success : this.apiData.successURL || '/oauth/success',
			error : this.apiData.erorrURL || '/oauth/login' // I prefer this
		};
	},
	__configureOAuth: function(){
		if(!(this.apiData.requestURL || this.apiData.accessURL || this.apiData.authorizeURL
			|| this.apiData.consumerKey || this.apiData.consumerSecret)){
			// missing something
			throw new Error('Missing API configuration data');
		}
		this.oa = new OAuth(this.apiData.requestURL,this.apiData.accessURL,
						this.apiData.consumerKey,this.apiData.consumerSecret,
						'1.0A',(this.apiData.rootURL+this.urls.callback),'HMAC-SHA1');
		// set up callbacks if you want them
		this.requestTokens = function(cb,data){
		 	if(this.apiData.requestTokens) this.apiData.requestTokens(data);
			cb();
		};
		this.accessTokens = function(cb,data){
			if(this.apiData.accessTokens) this.apiData.accessTokens(data);
			cb();
		}
	},
	__login: function(req,res){
		var self = this;
		self.__configureOAuth();
		self.oa.getOAuthRequestToken(function(error,oauth_token,oauth_token_secret,results){
			if(error){
				if(self.logging) new Error(error);
				console.log('error');
				// res.redirect(self.urls.error);
			}
			else {
				req.session.oa = self.oa;
				req.session.oauth_token = oauth_token;
				req.session.oauth_token_secret = oauth_token_secret;
				// send them back if you want them
				auth_url = self.apiData.authorizeURL;
				self.requestTokens(function(){ res.redirect(auth_url+'?oauth_token='+oauth_token); },
					oauth_token,oauth_token_secret);
			}	
		});	
	},
	__callback: function(req,res){
		var self = this;
		self.oa.getOAuthAccessToken(req.session.oauth_token, req.session.oauth_token_secret,
			req.query.oauth_verifier, function(err,accessToken,accessSecret,results){

			if(err){
				if(self.logging) new Error(err);
				console.log(err);
				// res.redirect(self.urls.error);
			}
			else{
				req.session.credentials = req.session.credentials || {};
				req.session.credentials.accessToken = accessToken;
				req.session.credentials.accessSecret = accessSecret;
				//send them on if he wants them
				success = self.urls.success;
				self.accessTokens(function(){ res.redirect(success);},accessToken,accessSecret);
			}
		});
	},
	// methods for calling the API
	get: function(cred,url,params,done){
		if(typeof params ==='function') done = params; // params is optional
		else url += __formatGet(params);
		this.oa.get(url,cred.accessToken,cred.accessSecret,done);
	},
	post: function(cred,url,data,done,contentype){
		if(typeof data==='function'){
			contentype = done;			
			done = data;
		}
		if(!contentype) var contentype = 'application/x-www-form-urlencoded';
		this.oa.post(url,cred.accessToken,cred.accessSecret,data,contentype,done);
	},
	__formatGet: function(params){
		var output = '?';
		for(var k in params){
			if(output!=='?')output+='&';
			output+=k+'='+params[k];
		}
		return output;
	}
};

// commonjs
module.exports = OhAuth;
