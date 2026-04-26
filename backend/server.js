const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const itemRoutes = require('./routes/items.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);

// Database Connection and Server Start
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}

module.exports = app;
