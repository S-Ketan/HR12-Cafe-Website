const express = require('express');
const router = express.Router();

// Import any necessary dependencies
const mongoose = require('mongoose');

// Define a schema and model for the ordered items

const itemSchema = new mongoose.Schema({
    title: String,
    price: Number,
    quantity: Number,
    imgSrc: String,
    status: Number,
    createdAt: { type: Date, default: Date.now },
    mobile: Number,
    name: String
});


const Item = mongoose.model('Item', itemSchema);

// Endpoint to receive ordered items data
router.post('/', async (req, res) => {
    const orderedItems = req.body;
    try {
        await Item.insertMany(orderedItems);
        res.status(200).send('Order placed successfully');
    } catch (error) {
        res.status(500).send('Error placing order');
    }
});

module.exports = router;
