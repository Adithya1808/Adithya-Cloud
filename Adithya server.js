// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/pzt_tiles', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Model
const User = mongoose.model('User ', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'User '], default: 'User ' },
}));

// PZT Tile Model
const Tile = mongoose.model('Tile', new mongoose.Schema({
    size: Number, // in square meters
    powerGeneration: Number, // watts per footstep
    cost: Number, // in currency
}));

// User Registration
app.post('/users/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send('User  registered successfully');
});

// User Login
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});

// Fetch PZT Tiles
app.get('/pzt/tiles', async (req, res) => {
    const tiles = await Tile.find();
    res.json(tiles);
});

// Calculate Required Tiles and Energy Output
app.post('/pzt/calculate-tiles', async (req, res) => {
    const { length, width, footTraffic } = req.body;
    const area = length * width; // Total area in square meters
    const tileSize = 1; // Example tile size in square meters
    const powerGenerationPerFootstep = 1.2; // watts per footstep

    const requiredTiles = Math.ceil(area / tileSize);
    const dailyEnergyOutput = footTraffic * powerGenerationPerFootstep; // in watts
    const monthlyEnergyOutput = dailyEnergyOutput * 30; // in watts

    res.json({
        requiredTiles,
        dailyEnergyOutput,
        monthlyEnergyOutput,
    });
});

// Cost Estimation
app.get('/pzt/cost/:tile_id', async (req, res) => {
    const { area } = req.query;
    const tile = await Tile.findById(req.params.tile_id);
    if (!tile) return res.status(404).send('Tile not found');

    const totalCost = tile.cost * Math.ceil(area / tile.size);
    res.json({ totalCost });
});

// Traffic Data Integration
app.post('/pzt/foot_traffic', (req, res) => {
    // Here you would handle the uploaded traffic data
    res.send('Traffic data received');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(Server is running on port ${PORT});
});
