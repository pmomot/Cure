var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    config = require('./config'),
    mongoose = require('mongoose'),
    app = express(),
    api = require('./app/routes/api')(app, express);

mongoose.connect(config.database, function (err) {
    'use strict';

    if (err) {
        console.log(err); // eslint-disable-line
    } else {
        console.log('connected to db'); // eslint-disable-line
    }
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use('/api', api);

app.get('*', function (req, res) {
    'use strict';

    res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port, function (err) {
    'use strict';

    if (err) {
        console.log(err); // eslint-disable-line
    } else {
        console.log('listening on port 3000'); // eslint-disable-line
    }
});

