// seed.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/pzt_tiles', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Tile = mongoose.model('Tile', new mongoose.Schema({
    size: Number,
    powerGeneration: Number,
    cost: Number,
}));

const sampleTiles = [
    { size: 1, powerGeneration: 1.2, cost: 100 },
    { size: 0.5, powerGeneration: 0.6, cost: 50 },
];

Tile.insertMany(sampleTiles)
    .then(() => {
        console.log('Sample tiles added');
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
