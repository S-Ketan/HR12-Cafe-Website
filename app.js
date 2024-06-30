const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const createError = require('http-errors');

// Import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const orderRouter = require('./routes/order');
const otpRouter = require('./routes/otp');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://sahildhillon609:Sahil180@hr12.reguy9v.mongodb.net/db4', {
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model if not already defined
const itemSchema = new mongoose.Schema({
    title: String,
    price: Number,
    quantity: Number,
    imgSrc: String,
    status: Number,
    mobile: Number,
    name: String
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/order', orderRouter);

// New route to fetch items
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// New route to update item status
app.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.status = status;
        await item.save();
        res.json({ message: 'Item updated successfully', item });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update the route to handle POST requests
app.post('/otp', async (req, res) => {
    const { mobile } = req.body;
    await otpRouter.send_otp_to_mobile(mobile);
    res.json({ message: 'OTP sent successfully' });
});

app.post('/verifyOtp', async (req, res) => {
    const { mobile, otp } = req.body;
    const isValid = await otpRouter.validate_otp_code(mobile, otp);
    if (isValid) {
        res.json({ message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ message: 'OTP verification failed' });
    }
});


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error'); // Make sure you have an 'error.ejs' file in the 'views' directory
});

module.exports = app;
