const express = require('express');
const app = express();
const morgan = require('morgan');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const uri = 'mongodb://localhost/firstdb';

MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((client) => {
    const db = client.db('firstdb');
    const placesCollection = db.collection('places');

    app.use(express.json());
    app.use(express.urlencoded({
        extended: false
    }));
    app.use(morgan('dev'));

    // \*\*\*EVERYTHING EXCEPT app.listen.... GOES IN HERE
    app.get('/', (req, res) => {
        placesCollection
            .find()
            .toArray()
            .then((value) => {
                return res.status(200).json({
                    confirmation: 'Success',
                    message: 'You data has been retrieved',
                    value
                });
            })
            .catch(err => console.log(err));

        ;
    });

    app.get('/remove', (req, res) => {
        placesCollection
                        .remove({})
                        .then((result) => {
                            return res.status(200).json({ confirmation: 'Succes', message: 'Your data has been removed', result })
                        })
                        .catch(err => console.log(err));
    })

    app.get('/create', (req, res) => {

        let placesArray = [{
                name: 'NextGen Advisors',
                industry: 'Professional Services',
                contact: 'John Rutton',
                city: 'Newark',
                state: 'NJ',
                sales: 535000,
            },
            {
                name: 'Receivers Inc',
                industry: 'Legal',
                contact: 'Stacey Martin',
                city: 'New York',
                state: 'NY',
                sales: 201000,
            },
            {
                name: 'Ethan Allen',
                industry: 'Textile',
                contact: 'Mark Shamburger',
                city: 'Seacaucus',
                state: 'NJ',
                sales: 735000,
            },
            {
                name: 'Russian River',
                industry: 'Transportation',
                contact: 'Phil Butterworth',
                city: 'Parsipanny',
                state: 'NJ',
                sales: 205000,
            },
            {
                name: 'Johnson',
                industry: 'Legal',
                contact: 'Beverly Stephens',
                city: 'Syracuse',
                state: 'NY',
                sales: 135000,
            },
            {
                name: 'Kravet',
                industry: 'Textile',
                contact: 'Jan Farnsworth',
                city: 'Ithaca',
                state: 'NY',
                sales: 105000,
            },
            {
                name: 'Wacomb',
                industry: 'Professional Services',
                contact: 'Larry Peters',
                city: 'Elizabeth',
                state: 'NJ',
                sales: 130000,
            },
            {
                name: 'Farnsworth',
                industry: 'Transportation',
                contact: 'Peter Dalton',
                city: 'Philadelphia',
                state: 'PA',
                sales: 437000,
            },
            {
                name: 'Barnes',
                industry: 'Legal',
                contact: 'John Percy',
                city: 'White Plains',
                state: 'NY',
                sales: 350000,
            },
        ];

            placesCollection
                .deleteMany({})
                .then(placesCollection.insertMany(placesArray))
                .finally(placesCollection
                    .find()
                    .toArray()
                    .then((value) => {
                        return res
                            .status(200)
                            .json({
                                confirmation: 'success',
                                message: 'previous data deleted and new default data written',
                                value
                            })
                    })
                    .catch((err) => console.log(err)));
    });


    app.get('/count', (req, res) => {
        placesCollection
            .countDocuments()
            .then((value) => {
                res.status(200).json({
                    confirmation: 'Success',
                    message: `# of documents: ${value}`,
                })
            })
            .catch(err => console.log(err));
    });


    app.post('/insertone', (req, res) => {
        placesCollection
                        .insertOne({ 
                            name: req.body.name,
                            industry: req.body.industry,
                            contact: req.body.contact,
                            city: req.body.city,
                            state: req.body.state,
                            sales: req.body.sales})
                        .then((value) => {
                            return res.status(200).json({ confirmation: 'Success', value})
                        })
    })

    app.delete('/delete', (req, res) => {
        placesCollection
                        .deleteOne({
                            name: req.body.name
                        })
                        .then((value) => {
                            return res.status(200).json({ confirmation: 'Success', value})
                        })
    });

    app.get('/lessthan/:value', (req, res) => {
        let check = { sales: {$lt : Number(req.params.value)}}
        placesCollection
                        .find(check)
                        .toArray()
                        .then((value) => {
                            return res.status(200).json({ confirmation: 'Success', value})
                        })
                        .catch(err => console.log(err));
    });

    app.get('/sum/:value', (req, res) => {
        let agg = [{ $match: { industry : req.params.value }}, {$group: { _id: 1, sumSales: { $sum: '$sales'}}}];
        placesCollection
                        .aggregate(agg)
                        .toArray()
                        .then((value) => {
                            return res.status(200).json({ confirmation: 'Success', message: `Total Sales for the requested industry are ${value[0].sumSales}`})
                        })
                        .catch(err => console.log(err));
    });

    app.get('/between/:min/:max', (req, res) => {
        let check = { sales: { $lt: Number(req.params.max), $gt: Number(req.params.min)}}
        placesCollection
                        .find(check)
                        .sort((a, b) => a -b)
                        .toArray()
                        .then((value) => {
                            return res.status(200).json({ confirmation: 'Success', mesage: value})
                        })
                        .catch(err => console.log(err));
    });

});



app.listen(3000, () => {
    console.log(`Listening on port 3000`)
})