const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Use replica set connection string
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/dist_db?replicaSet=rs0';
        await mongoose.connect(uri);
        console.log('MongoDB Initialized & Connected to Replica Set');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
