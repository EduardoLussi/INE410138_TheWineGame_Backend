const express = require('express');

const WineController = require('./controllers/WineController');
const NFTController = require('./controllers/NFTController');

const routes = new express.Router();

routes.get('/wineInfo', WineController.getWineInfo);
routes.get('/NFTMetadata/:tokenId', NFTController.getMetadata);
routes.get('/NFTMetadata/:tokenId/image', NFTController.getImage);

routes.post('/artwork', NFTController.getArtwork);
routes.post('/createNFT', NFTController.createNFT);

module.exports = routes;