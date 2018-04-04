var app = require('express')();
var moment = require('moment-timezone');
const express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('assets'))
app.get('/data/', function(req, res){

  var sql = `
    SELECT * FROM wind ORDER BY id DESC LIMIT 1800
  `

  connection.query(sql,  function (error, results, fields) {
    var data = {
      labels: [],
      datasets: [{
        data: [

        ],
        fill: true,
      }]
    }

    results = results.reverse();
    results.forEach(function(r){
      data.datasets[0].data.push(r.windspeed);
      data.labels.push(moment(r.datetime).tz('America/Denver').format("LT"));
    })

    res.send(JSON.stringify(data));

  });
});

// aopa!2QDzxopwfj

var mysql      = require('mysql');
var connection = mysql.createConnection(require("./config.js"));
connection.connect();


io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


var exec = require('child_process').exec;

var ads1x15 = require('node-ads1x15');
var chip = 1; //0 for ads1015, 1 for ads1115

//Simple usage (default ADS address on pi 2b or 3):
var adc = new ads1x15(chip);

// Optionally i2c address as (chip, address) or (chip, address, i2c_dev)
// So to use  /dev/i2c-0 use the line below instead...:

//    var adc = new ads1x15(chip, 0x48, 'dev/i2c-0');

var channel = 0; //channel 0, 1, 2, or 3...
var samplesPerSecond = '250'; // see index.js for allowed values for your chip
var progGainAmp = '4096'; // see index.js for allowed values for your chip

setInterval(r, 1000);



/*


400mv = 0
2000mv = 72.47674mph

1600mv
mph = (v - 400) / 72.4764

*/
function r(){
  //somewhere to store our reading
  var reading  = 0;
  if(!adc.busy)
  {
    adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function(err, data) {
      if(err)
      {
        //logging / troubleshooting code goes here...
        throw err;
      }
      // if you made it here, then the data object contains your reading!


      var mph = ((data  - 400) / 1600) * 72.4764
      //var mph = ((data - 400) / 72.4764) * 72.4764;
      if (mph < 0){
        console.log("MPH DIPPED BELOW 0 ", mph)
        mph = 0;
      }
      var rounded = (Math.round(mph * 4) / 4).toFixed(2);
      console.log(data,rounded + "MPH");
      var v = (rounded * 100).toString();

      if (v.length == 3) v = "0"+v
      if (v.length == 2) v = "00"+v
      if (v.length == 1) v = "000"+v

      //console.log(v);

      io.emit('wind', rounded);
      exec('python lcd.py ' + v, function(error, stdout, stderr) {
        //console.log(err,stdout,stderr)
      })

      var CURRENT_TIMESTAMP =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      //console.log("TIMETSTAMP:",CURRENT_TIMESTAMP)
      var sql = `
        INSERT INTO wind SET ?
      `
      var set = {
        datetime : CURRENT_TIMESTAMP,
        windspeed : rounded
      }
      connection.query(sql, set, function (error, results, fields) {
        if (error) throw error;

      });
      // any other data processing code goes here...
    });
  }
}
