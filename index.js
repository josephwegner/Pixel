var fs = require('fs');
var http = require('http');
var keen = require('keen.io');

var pixel = fs.readFileSync("pixel.gif");

keenClient = keen.configure({
  projectId: process.env['KEEN_PROJECT_ID'],
  writeKey: process.env['KEEN_WRITE_KEY']
});

var app = http.createServer(function(req, res) {
  res.setHeader("Content-Type", "image/gif");
  res.end(pixel);

  var eventData = {
    keen: {
      addons: []
    }
  };
  var sendEvent = false;

  if(typeof(req.headers.referer) !== "undefined") {
    eventData.referer = req.headers.referer;
    eventData.keen.addons.push({
      name: "keen:url_parser",
      input: {
        url: "referer"
      },
      output: "parsed_url"
    });
    sendEvent = true;
  }

  if(typeof(req.headers['user-agent']) !== "undefined") {
    eventData['user-agent'] = req.headers['user-agent'];
    eventData.keen.addons.push({
      name: "keen:ua_parser",
      input: {
        "ua_string": "user-agent"
      },
      output: "parsed_user_agent"
    });
    sendEvent = true;
  }

  if(sendEvent) {
    keenClient.addEvent("pixel", eventData, function(err, res) {
      if(err) {
        console.log("error sending event", err);
      } else {
        console.log("Sent Keen Event");
      }
    });
  } else {
    console.log("didn't send keen event", req.headers);
  }

});

app.listen(process.env.PORT);
