let express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  stringSimilarity = require('string-similarity'),
  app = express(),
  admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.id))
});

var db = admin.firestore();

var docRef = db.collection('users').doc('test');

var setAda = docRef.set({
  yoshi: {
    name: "Yoshi",
    type: "Dog",
    lastFed: new Date()
  },
  arty: {
    name: "Arty",
    type: "Cat",
    lastFed: new Date()
  }
});


let alexaVerifier = require('alexa-verifier'); // at the top of our file
var obj = require("./inspiration.json")


console.log(process.env.id);

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

const options = {
  url: 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=STEAMKEY&format=json',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8'
  }
};

var json = [];
var games = [];

request(options, function(err, res, body) {
  json = JSON.parse(body).applist.apps;
  for (var i = 0; i < json.length; i++) {
    games.push(json[i].name);
  }

});

app.set('port', process.env.PORT || 3000);


app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));
app.post('/quote', requestVerifier, function(req, res) {
  var a = "tails";
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to Daily Quote, your tool for good quotes that will inspire you, for information about what it can do, just say help.</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'Inspire'){

    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>" + obj.quotes[Math.floor(Math.random() * obj.quotes.length + 1)] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheDay'){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>The quote of the day is... " + obj.quotes[day] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheYesterday'){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Yesterday's quote of the day is... " + obj.quotes[day-1] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheTomorrow'){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Tomorrow's quote of the day is... " + obj.quotes[day+1] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To get the quote of the day, just say: \"What is the quote of the day?\", you can also do this for yesterday and tomorrow!... To get a random quote, just say: \"Inspire me\", come on, try it out for yourself!</speak>"
        }
      }
    });
  }
  else {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Goodbye, we hope to see you soon!</speak>"
        }
      }
    });
  }
});

app.post('/steam', requestVerifier, function(req, res) {
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to Steam Assistant,for information about what we can do, just say help.</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To get the price of a game, for example Cuphead, just say: \"What is the price of Cuphead?\" To get a description, just say: \"Describe Cuphead\", come on, try it out for yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GamePrice') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      var temp = json[games.indexOf(stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target)];
      var ops = {
        url: 'https://store.steampowered.com/api/appdetails?appids=' + temp.appid + '&cc=us&l=en',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      };
      request(ops, function(err, resp, body) {
        var info = JSON.parse(body)[temp.appid];
        if (info.data.price_overview) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>We found " + temp.name +", which cost a total of $" + (info.data.price_overview.final/100).toString() + ".</speak>"
              }
            }
          });
        }
        else {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>We could not find a price for " + temp.name + ".</speak>"
              }
            }
          });
        }
      });
    }
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GameDescription') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      var temp = json[games.indexOf(stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target)];
      var ops = {
        url: 'https://store.steampowered.com/api/appdetails?appids=' + temp.appid + '&cc=us&l=en',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      };

      request(ops, function(err, resp, body) {
        var info = JSON.parse(body)[temp.appid];
        if (info.data.short_description) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>Here is a description of " + temp.name +": " + info.data.short_description + ".</speak>"
              }
            }
          });
        }
        else {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>We could not find a description for " + temp.name + ".</speak>"
              }
            }
          });
        }
      });
    }

  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GameGenre') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      var temp = json[games.indexOf(stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target)];
      var ops = {
        url: 'https://store.steampowered.com/api/appdetails?appids=' + temp.appid + '&cc=us&l=en',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      };

      request(ops, function(err, resp, body) {
        var info = JSON.parse(body)[temp.appid];
        if (info.data.genres) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>Here is a genre " + temp.name +" fits into: " + info.data.genres[0].description + ".</speak>"
              }
            }
          });
        }
        else {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>We could not find a description for " + temp.name + ".</speak>"
              }
            }
          });
        }
      });
    }
  }
  else {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Sorry, we did not understand, could you try something else?</speak>"
        }
      }
    });
  }
});
app.listen(app.get("port"));
