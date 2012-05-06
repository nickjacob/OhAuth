# OhAuth!
## Lazy OAuth for Express

### 1. How Lazy?
How about this -- here's your server js:
```javascript
	var Express = require('express')
	  , app = Express.createServer(Express.favicon(),Express.static(__dirname))
	  , OhAuth = require('./ohauth')
	  , strategies = require('./ohauth-strategies');


	var cK = 'consumerKey', cS = 'consumerSecret'
		, ohAuth = new OhAuth(strategies.twitter(cK,cS,'http://127.0.0.1:1337'),app);

	app.configure(function(){
		app.use(app.router);	
	});

	app.listen(1337);
	app.get('/', function (req, res) {
	  res.sendfile(__dirname + '/index.html');
	});

	// when you're done, you'll get an access key and an access secret printing out here
	app.get('/oauth/success',function(req,res){
		res.send(req.session.credentials);
	});
```
Now, after a little `node app.js`, just point your browser over to `localhost:1337/oauth/login`


### 2. Wait, so it does everything for me?
Pretty much. It has some defaults that can be changed by passing new values (either in the strategy, or the dict if you're using your own).

* loginURL: `/oauth/login`
* callbackURL: `/oauth/callback`
* sucessURL: `/oauth/succecss`
* errorURL: `/oauth/error`

It sets up all of them except *success*, because I figured you'd probably want to implement it yourself. `/oauth/login` goes straight to twitter.

### 3. I want to make API calls..what do?
There are methods for GET and POST that just wrap the node-oauth library (what this whole things is wrapping). Check it out:

#### Get request:

```javascript
	ohAuth.get({ accessToken: '', accessSecret: '' },url,params,function(status,data,response){
		console.log(response); // there's the return of the call
	});

#### Post request:

	ohAuth.post({ accessToken: '', accessSecret: '' },url,params,function(status,data,response){
		console.log(response); // there's the return of the call
	},contentType); // contentType is an optional parameter..oh and params is optional too

```

### 4. Giant Disclaimer
This is not fully tested, and probably has a lot of issue in the smaller details. It's really just a wrapper around oauth.js, and etc. and use at own risk etc. But if you want really quick and easy oauth and don't care much about configuration, here she is!

### 5. TODO

1. I'm adding the ability to bind to the event of getting the tokens, so you can store them in your database (they're still floating around on the req.session though, so you can always look there in the meantime)

2. Testing testing testing 

### 6. Credits
This would do absolutely nothing without [Ciaran Jessup's node-oauth](https://github.com/ciaranj/node-oauth)