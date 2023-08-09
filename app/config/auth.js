module.exports = {
    'facebookAuth':{
      'clientID' 		: '601769931942209', 
  		'clientSecret' 	: '8709c5b7b40f4a7084d846de727a4655', 
      'callbackURL' : 'http://localhost:5050/auth/facebook/callback',
      'profileFields': ['id','displayName', 'photos', 'email']
    },
    'twitterAuth' : {
  		'consumerKey' 		: 'your-consumer-key-here',
  		'consumerSecret' 	: 'your-client-secret-here',
  		'callbackURL' 		: 'http://localhost:5050/auth/twitter/callback'
  	},

  	'googleAuth' : {
  		'clientID' 		  : '380599842759-5ej6u3engite0fj2tvjf6j8j1km9j8tt.apps.googleusercontent.com',
  		'clientSecret' 	: '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',
  		'callbackURL' 	: 'http://localhost:3000/auth/google/callback'
  }
};
