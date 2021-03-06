var express = require('express');
var app = express();

var db;
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    console.log("Successfully connected to MongoDB.");
    db = client.db('checkout');
}); 

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 2000);

app.use(express.static(__dirname + '/public'));

app.use(require('body-parser')());

app.get('/', function (req, res) {
    res.render('checkout');
});

app.get('/damage', function (req, res) {
    res.render('damage');
});

app.post('/charger', function (req, res) {
    console.log(req.body.pin);
    db.collection('students').findAndModify({ "ID": parseInt(req.body.pin) },
        [['_id', 'asc']], {
                $addToSet: {
                    Activities: { Date: new Date(), Description: (req.body.model), DateReturn: "", Returned : false }
                }
            
        }, { upsert: 1 },
        function (err, thing) {
            if (err) {
                console.log(err);
            } else {
                console.log(thing);
            }
        });

    res.render('checkout');
});

app.post('/chromebook', function (req, res) {
    console.log(req.body.pin);
    db.collection('students').findAndModify({ "ID": parseInt(req.body.pin) },
        [['_id', 'asc']], {
            $addToSet: {
                Activities: { Date: new Date(), Description: (req.body.model), Barcode: (req.body.barcode),  DateReturn: "", Returned: false }
            }

        }, { upsert: 1 },
        function (err, thing) {
            if (err) {
                console.log(err);
            } else {
                console.log(thing);
            }
        });

    res.render('checkout');
});


app.post('/process', function (req, res) {
    db.collection('students').findOne({ ID: parseInt(req.body.pin) }, function (err, student) {

        db.collection('devices').findOne({ Barcode: parseInt(student.Tbc) }, function (err, device) {

            res.render('process', {
                pin: student.ID,
                FName: student.First_Name,
                LName: student.Last_Name,
                Grade: student.Grade_Level,
                Grad: student.Sched_YearOfGraduation,
                img: "img/" + student.ID + ".jpg",
                barcode: student.Tbc,
                brand: device.Brand,
                type: device.Type,
                model: device.Model,
                vendor: device.Vendor,
                cdi: device.CDI,
                serial: device.ServiceTag,
                PDate: device.PurchaseDate,
            });
        });
    });
});

// 404 page
app.use(function (req, res, next) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});