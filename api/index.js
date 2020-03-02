var http = require('http');
var path = require('path');
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
const LUISClient = require("./luis_sdk");
var time 
  var location
const APPID = "AppID";
const APPKEY = "APPKEY";

var LUISclient = LUISClient({
  appId: APPID,
  appKey: APPKEY,
  verbose: true
});

// Create Express webapp
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json({})) 
app.use(bodyParser.urlencoded({
  extended: true
}));
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/newMessage', async(req, res) => {
  const msg = req.body.content;  
    LUISclient.predict(msg, {

      //On success of prediction
      onSuccess: function (response) {
        var ans = answer(response);
        res.status(200).json({
          data : ans,
          response : response
        }); 
      },
      //On failure of prediction
      onFailure: function (err) {
        return res.status(500).json({
          mensaje: 'Ocurrio un error',
          error
        })
      }
    });

});

// Create http server and run it
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Express server running on *:' + port);
});

var printOnSuccess = function (response) {
  console.log(response.topScoringIntent.intent.includes('BookFlight'))
    console.log("Query: " + response.query);
    console.log("Top Intent: " + response.topScoringIntent.intent);
    console.log("Entities:");
    for (var i = 1; i <= response.entities.length; i++) {
      console.log(i + "- " + response.entities[i-1].entity);
    }
    if (typeof response.dialog !== "undefined" && response.dialog !== null) {
      console.log("Dialog Status: " + response.dialog.status);
      if(!response.dialog.isFinished()) {
        console.log("Dialog Parameter Name: " + response.dialog.parameterName);
        console.log("Dialog Prompt: " + response.dialog.prompt);
      }
    }
  };


var answer = function (response) {

  console.log(response)

  if (response.topScoringIntent.intent.includes('Greetings'))
  {
    return "Hi What do you want to do "
  }
  else if (response.topScoringIntent.intent.includes('BookFlight') || response.topScoringIntent.intent.includes('location')|| response.topScoringIntent.intent.includes('Time'))
  {
    if (typeof response.entities !== 'undefined' && response.entities.length > 0) 
    {
      for (var i = 1; i <= response.entities.length; i++) 
      {
        if (response.entities[i-1].type === "builtin.datetimeV2.time")
        {
          time = response.entities[i-1].entity
        }
        if (response.entities[i-1].type === "To")
        {
          location=response.entities[i-1].entity
        }
      }
      if (time == null )
      {
        return   "<ul><li>At what time do you prefer to book you flight</li><ul><li>to " + location + " at 10:00am</li><li>to " + location + " at 11:00am</li><li>to " + location + " at 12:00am</li><li>to " + location + " at 1:00pm</li></ul></ul>"
        // return "At what time do you prefer to book you flight "
      }  
      if (location == null )
      {
        return "where do you want to flight "
      }

      return "I book your fligth to "+ location + " at: "+ time
      
    }
    else
    {
      return "where do you want to flight"
    }

  }
  else
  {
    return "Sorry can't make your request ?"
  }
  };


