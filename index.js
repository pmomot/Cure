var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    config = require('./config'),
    mongoose = require('mongoose'),
    app = express(),
    api = require('./app/routes/api')(app, express);

mongoose.connect(config.database, function(err){
    if(err){
        console.log(err)
    } else {
        console.log('connected to db')
    }
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use('/api', api);

app.get('*', function(req, res){
    res.sendFile(__dirname + '/public/views/index.html')
});

app.listen(config.port, function(err){
    if(err){
        console.log(err)
    } else {
        console.log('listening on port 3000')
    }
});