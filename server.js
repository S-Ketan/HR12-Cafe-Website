const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sahildhillon609:Sahil180@hr12.reguy9v.mongodb.net/db3', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model for the ordered items
const itemSchema = new mongoose.Schema({
    title: String,
    price: Number,
    quantity: Number,
    imgSrc: String
});

const Item = mongoose.model('Item', itemSchema);

// Endpoint to receive ordered items data
app.post('/order', async (req, res) => {
    const orderedItems = req.body;
    try {
        await Item.insertMany(orderedItems);
        res.status(200).send('Order placed successfully');
    } catch (error) {
        res.status(500).send('Error placing order');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Catch-all handler for unknown routes (to handle 404 errors)
app.use((req, res) => {
    res.status(404).send('<h1>Not Found</h1><h2>404</h2>');
});
