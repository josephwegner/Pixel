var keen_key = "KEEN_READ_KEY";
var keen_project = "KEEN_PROJECT_ID";

var client = new Keen({
  projectId: keen_project,
  readKey: keen_key
});

Keen.ready(function() {
  var overTime = new Keen.Query("count", {
    event_collection: "pixel",
    interval: "daily",
    timeframe: "previous_14_days"
  });

  var domains = new Keen.Query("count", {
    event_collection: "pixel",
    groupBy: "parsed_url.domain",
    filters: [
      {
        "property_name": "parsed_url.domain",
        "operator": "exists",
        "property_value": true
      }
    ]
  });
  
  var request = client.draw(overTime, document.getElementById("over-time-chart"), {
    chartType: "areachart",
    width: window.outerWidth,
    height: 200,
    chartOptions: {
      enableInteractivity: true,
      backgroundColor: 'transparent',
      areaOpacity: 1,
      series: [
        {
          color: "#3B388A"
        }
      ],
      vAxis: {
        gridlines: {
          count: 0
        }
      },
      chartArea: {
        left: 0,
        top: 0,
        width: '100%',
        height: 200
      }
    }
  });

  request.on('complete', function() {
    document.getElementsByClassName("chart-overlay")[0].className = "chart-overlay remove";
    document.getElementsByClassName("loading-bar")[0].className = "loading-bar remove";
  });

  client.draw(domains, document.getElementById("domains-pie-chart"), {
    chartType: "piechart",
    chartOptions: {
      backgroundColor: "transparent",
      series: [
        {
          color: "#3B388A"
        }
      ],
      legend: {
        textStyle: {
          color: "#ffffff"
        }
      }
    }
  }); 
});
