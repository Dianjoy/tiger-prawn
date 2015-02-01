/**
 * Created by 路佳 on 2015/2/1.
 */
var express = require('express')
  , parser = require('body-parser')
  , app = express();

app.use(parser.json());

app.options('/popup/:id', function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT,PATCH');
  res.set('Access-Control-Allow-Headers', 'content-type');
  res.json({
    code: 0,
    msg: 'ready'
  });
});

app.patch('/popup/:id', function (req, res) {
  res.set('Content-type', 'application/json');
  res.set('Access-Control-Allow-Origin', '*');
  res.json({
    code: 0,
    msg: 'ok',
    attr: req.body
  })
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('get at http://%s:%s', host, port);
});