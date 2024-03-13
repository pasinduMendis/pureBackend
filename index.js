require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
var cors = require('cors')
const corsConfig = require('./config/corsConfig');

const env = process.env.NODE_ENV || "dev";

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
    //schedules.db_check();
})
const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        if (env === 'dev' || !origin || corsConfig[env].allowedOrigins.includes(origin)) {
        callback(null, true);
        } else {
        const error = new Error('Not allowed by CORS');
        error.status = 403;
        error.message = corsConfig[env].errorMessage;
        callback(error);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
}

app.use(cors(corsOptions));
app.use(express.json());

const routes = require('./routes/routes');
const schedules = require('./schedules/schedules');
const updateDataController = require('./controllers/update_data');

app.use('/api', routes)

app.use((err, req, res, next) => {
    console.log('in error handler :>> ');
    if (err && err.status === 403) {
      return res.status(403).json({ error: err.message });
    }
    next();
  });


app.listen(8080, () => {
    console.log(`Server Started at ${8080}`)
})
