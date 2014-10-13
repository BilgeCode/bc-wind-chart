/**
 * Gets data from forecast.io and converts it to the format required
 * by the areachart:
* [{xVal, yVal, bearing}]
* `xVal` is the datetime and `yVal` is the velocity
 *
 * @method getForecastIOData
 * @return {Object} Returns undefined.
 */
function getForecastIOData(bcWindChart) {
  var self = bcWindChart;
  // var uri = "forecast.io.json";
  var uri = "https://api.forecast.io/forecast/"
  if(self.apikey == null) {
    console.error("Missing API Key");
    return;
  }
  uri += self.apikey + "/" + self.latitude + "," + self.longitude;
  uri += "?callback=d3.jsonp.foo"

  // @todo - it'd be preferable to use CORS over jsonp

  d3.jsonp(uri, function(json) {
    var data = [];
    var last = null; // tracks the last hourly data

    // Get the hourly data
    var hourlyData = json.hourly.data;
    for(var i=0; i < hourlyData.length; i+=4) {
      var time = moment.tz(
        hourlyData[i].time * 1000,
        self.timezone
      );
      last = time;

      data.push({
        xVal: time,
        yVal: hourlyData[i].windSpeed,
        bearing: hourlyData[i].windBearing
      });
    }

    // then add the daily data after that
    var dailyData = json.daily.data;
    for(var i=0; i < dailyData.length; i++) {
      var time = moment.tz(
        dailyData[i].time * 1000,
        self.timezone
      );

      if(last == null || time > last) {
        data.push({
          xVal: time,
          yVal: hourlyData[i].windSpeed,
          bearing: hourlyData[i].windBearing
        });
      }
    }

    self.data = data;
  });
}
