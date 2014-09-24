var fs = require('fs');
var http = require('http');
var keen = require('keen.io');

var pixel = fs.readFileSync("pixel.gif");

keenClient = keen.configure({
  projectId: process.env['KEEN_PROJECT_ID'],
  writeKey: process.env['KEEN_WRITE_KEY']
});

var app = http.createServer(function(req, res) {

  if(req.url === "/" || req.url === "/style.css" || req.url === "/main.js") {
    handleContentRequest(req, res);
  } else {
    handlePixelRequest(req, res);
  }
});

app.listen(process.env.PORT);
console.log("Server listening on port "+process.env.PORT);

function handlePixelRequest(req, res) {
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

}

function handleContentRequest(req, res) {
  switch(req.url) {
    case "/":
      res.setHeader("Content-Type", "text/html");
      res.end(fs.readFileSync(__dirname+"/index.html"));
      break;

    case "/main.js":
      console.log("main");
      res.setHeader("Content-Type", "text/javascript");
      var file = fs.readFileSync(__dirname+"/main.js").toString()
      file = file.replace(/KEEN_READ_KEY/g, process.env['KEEN_READ_KEY'])
      file = file.replace(/KEEN_PROJECT_ID/g, process.env['KEEN_PROJECT_ID'])
      res.end(file);
      break;

    case "/style.css":
      console.log("style");
      res.setHeader("Content-Type", "text/css");
      res.end(fs.readFileSync(__dirname+"/style.css"));
      break;

    default:
      res.statusCode = 404;
      res.end();
  }
}
