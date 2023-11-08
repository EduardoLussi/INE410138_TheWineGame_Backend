const fs = require('fs');

const { Web3 } = require('web3');
const abi = require('../contracts/TheWineGame.json');

const { createCanvas, loadImage } = require('canvas');
const { removeBackground, wrapText, randint, getDate } = require('../utils');

require('dotenv').config(); 

const colorPallete = [
    { background: '#45A89C', text:'#000' },
    { background: '#2F726A', text:'#000' },
    { background: '#193C38', text:'#e6e6e6' },
    { background: '#A84551', text:'#e6e6e6' },
    { background: '#722F37', text:'#e6e6e6' },
    { background: '#3C191D', text:'#e6e6e6' },
    { background: '#B7505C', text:'#000' },
    { background: '#4E2026', text:'#e6e6e6' },
    { background: '#6A2F72', text:'#e6e6e6' },
    { background: '#722F58', text:'#e6e6e6' },
    { background: '#722F37', text:'#e6e6e6' },
    { background: '#D9A3BB', text:'#000' },
    { background: '#F2CED2', text:'#000' },
    { background: '#6A2F72', text:'#e6e6e6' },
    { background: '#A17CBF', text:'#000' }
]

const web3 = new Web3(process.env.CHAIN_URL);

const contract = new web3.eth.Contract(abi.abi, process.env.CONTRACT_ADDRESS);
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

module.exports = {
    async getArtwork(req, res) {
        let canvas;
        try {
            // Get wine
            const { title } = req.headers;
            const { wineInfo } = req.body;
            let { date } = req.headers;

            date = getDate(date);

            const { background, text } = colorPallete[randint(0, colorPallete.length)];

            // Get wine image
            let wineImg = await loadImage(wineInfo.image);

            wineImg = removeBackground(wineImg);

            // Create canvas
            canvas = createCanvas(1000, 1000);
            const ctx = canvas.getContext('2d');

            // Fill background
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw wine image
            const wineImgHeight = canvas.height*0.85;
            const wineImgWidth = (wineImgHeight/wineImg.height)*wineImg.width;
            const wineImgX = canvas.width*0.7 - wineImgWidth*0.3;
            ctx.drawImage(wineImg, 
                        wineImgX,
                        canvas.height/2 - wineImgHeight/2,
                        wineImgWidth,
                        wineImgHeight);

            ctx.font = '500 57pt Urbanist';
            ctx.textAlign = 'right';
            ctx.fillStyle = text;

            // ----- Moment information -----
            
            // Date
            let textY = 400;
            ctx.fillText(date, wineImgX, textY);

            // Title
            ctx.font = '200 25pt Urbanist';
            textY += 70;
            let wrappedText = wrapText(ctx, title, wineImgX, textY, 550, 40);
            wrappedText.forEach((item) => { ctx.fillText(item[0].trim(), item[1], item[2]) });

            // ----- Wine information -----

            // Wine name
            ctx.font = '500 32pt Urbanist';
            textY += 180;
            wrappedText = wrapText(ctx, wineInfo.name, wineImgX, textY, 550, 50);
            wrappedText.forEach((item) => { ctx.fillText(item[0].trim(), item[1], item[2]) });

            // Variety/Region
            ctx.font = '200 18pt Urbanist';
            textY += 50*wrappedText.length;        
            ctx.fillText(`${wineInfo.varietal} from ${wineInfo.origin}`, wineImgX, textY);

            // Vintage
            ctx.font = '500 27pt Urbanist';
            textY += 70;
            ctx.fillText(wineInfo.vintage, wineImgX, textY);
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: 'Failed to generate artwork.' });
        }
        
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(canvas.toBuffer('image/png'));
    },
    async createNFT(req, res) {
        let tokenURI;
        try {
            const { to } = req.headers;

            const tx = contract.methods.safeMint(to);
            const gas = await tx.estimateGas({ from: process.env.ACCOUNT_ADDRESS });
            const gasPrice = await web3.eth.getGasPrice();
            const data = tx.encodeABI();
            const nonce = await web3.eth.getTransactionCount(process.env.ACCOUNT_ADDRESS);
            const txData = {
            from: process.env.ACCOUNT_ADDRESS,
            to: contract.options.address,
            data: data,
            gas,
            gasPrice,
            nonce
            };
        
            await web3.eth.sendTransaction(txData);
            
            const numOfTokens = await contract.methods.balanceOf(to).call();
            let tokenId = await contract.methods.tokenOfOwnerByIndex(to, parseInt(numOfTokens)-1).call();
            tokenId = parseInt(tokenId);

            const tokenURI = await contract.methods.tokenURI(tokenId).call();

            const { title } = req.headers;
            let { wine, date } = req.headers;
            wine = JSON.parse(wine);

            date = new Date(date);
            date = Math.floor(date.getTime()/1000);

            const metadata = {
                'image': `${tokenURI}/image`,
                'description': title,
                'name': wine.name + ' ' + wine.vintage.toString(),
                'attributes': [
                    { 'trait_type': 'varietal', 'value': wine.varietal },
                    { 'trait_type': 'origin', 'value': wine.origin },
                    { 'trait_type': 'vintage', 'value': wine.vintage },
                    { 'display_type': 'date', 'trait_type': 'date', 'value': date }
                ]
            }

            const path = require('path').dirname(require.main.filename);
            fs.writeFileSync(`${path}/metadata/${tokenId}.json`, JSON.stringify(metadata));
            fs.writeFileSync(`${path}/artworks/${tokenId}.png`, Buffer.from(req.body, 'base64'));
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: 'Failed to create the NFT.' });
        }

        res.status(200).send(tokenURI);
    },
    getMetadata(req, res) {
        let metadata;
        try {
            const path = require('path').dirname(require.main.filename);
            metadata = fs.readFileSync(`${path}/metadata/${req.params.tokenId}.json`);
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: 'Failed to get metadata.' });
        }

        res.json(JSON.parse(metadata.toString()));
    },
    getImage(req, res) {
        let image;
        try {
            const tokenId = req.params.tokenId;
            const path = require('path').dirname(require.main.filename);
            
            image = fs.readFileSync(`${path}/artworks/${tokenId}.png`);
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: 'Failed to get image.' });
        }
        
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(image);
    }
}