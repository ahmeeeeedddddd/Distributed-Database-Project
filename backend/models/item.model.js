const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    sku:       { type: String, required: true, unique: true },
    category:  { type: String },
    location:  { type: String },
    qty:       { type: Number, default: 0 },
    threshold: { type: Number, default: 10 },
    price:     { type: Number, default: 0 },
    unit:      { type: String, default: 'pcs' },
    notes:     { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
