const { createCanvas } = require('canvas');

module.exports = {
    removeBackground(img) {
        // Build the canvas
        const canvas = createCanvas(300, 900);
        const ctx = canvas.getContext('2d');
        
        // Fill background white
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Put image
        const imgHeight = canvas.height;
        const imgWidth = (imgHeight/img.height)*img.width;
        const imgX = canvas.width/2 - imgWidth/2;
        ctx.drawImage(img, 
                    imgX,
                    canvas.height/2 - imgHeight/2,
                    imgWidth,
                    imgHeight);

        // Get image data
        let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pix = imgd.data;
        
        // Threshold for removing white background
        const threshold = 0.9*255;

        // left -> right
        for (let i = 0; i < canvas.height; i++) {
            for (let j = 0; j < canvas.width; j++) {
                const index = 4*(i*canvas.width + j);
                let r = pix[index];
                let g = pix[index+1];
                let b = pix[index+2];

                if (r >= threshold && g >= threshold && b >= threshold) {
                    pix[index] = 0;
                    pix[index+1] = 0;
                    pix[index+2] = 0;
                    pix[index+3] = 0; 
                } else {
                    break;
                }
            }
        }

        // right -> left
        for (let i = 0; i < canvas.height; i++) {
            for (let j = canvas.width-1; j > 0; j--) {
                const index = 4*(i*canvas.width + j);
                let r = pix[index];
                let g = pix[index+1];
                let b = pix[index+2];

                if (r >= threshold && g >= threshold && b >= threshold) {
                    pix[index] = 0;
                    pix[index+1] = 0;
                    pix[index+2] = 0;
                    pix[index+3] = 0; 
                } else {
                    break;
                }
            }
        }

        // up -> down
        for (let j = 0; j < canvas.width; j++) {
            for (let i = 0; i < canvas.height; i++) {
                const index = 4*(i*canvas.width + j);
                let r = pix[index];
                let g = pix[index+1];
                let b = pix[index+2];

                if (r >= threshold && g >= threshold && b >= threshold) {
                    pix[index] = 0;
                    pix[index+1] = 0;
                    pix[index+2] = 0;
                    pix[index+3] = 0; 
                } else {
                    break;
                }
            }
        }

        // down -> up
        for (let j = 0; j < canvas.width; j++) {
            for (let i = canvas.height-1; i > 0; i--) {
                const index = 4*(i*canvas.width + j);
                let r = pix[index];
                let g = pix[index+1];
                let b = pix[index+2];

                if (r >= threshold && g >= threshold && b >= threshold) {
                    pix[index] = 0;
                    pix[index+1] = 0;
                    pix[index+2] = 0;
                    pix[index+3] = 0; 
                } else {
                    break;
                }
            }
        }

        // Put new image
        ctx.putImageData(imgd, 0, 0);

        return canvas;
    },
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        // First, start by splitting all of our text into words, but splitting it into an array split by spaces
        let words = text.split(' ');
        let line = ''; // This will store the text of the current line
        let testLine = ''; // This will store the text when we add a word, to test if it's too long
        let lineArray = []; // This is an array of lines, which the function will return
    
        // Lets iterate over each word
        for(var n = 0; n < words.length; n++) {
            // Create a test line, and measure it..
            testLine += `${words[n]} `;
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            // If the width of this test line is more than the max width
            if (testWidth > maxWidth && n > 0) {
                // Then the line is finished, push the current line into "lineArray"
                lineArray.push([line, x, y]);
                // Increase the line height, so a new line is started
                y += lineHeight;
                // Update line and test line to use this word as the first word on the next line
                line = `${words[n]} `;
                testLine = `${words[n]} `;
            }
            else {
                // If the test line is still less than the max width, then add the word to the current line
                line += `${words[n]} `;
            }
            // If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
            if(n === words.length - 1) {
                lineArray.push([line, x, y]);
            }
        }
        // Return the line array
        return lineArray;
    },
    randint(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },
    getDate(date) {
        const months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July',
                        'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
        const date_list = date.split('/');

        const month = months[parseInt(date_list[1])-1];
        const day = parseInt(date_list[0]);
        const year = parseInt(date_list[2]);

        let cardinal;
        if (day >= 11 && day <= 13) cardinal = 'th';
        else {
            switch (day % 10) {
                case 1:
                    cardinal = 'st';
                case 2:
                    cardinal = 'nd';
                case 2:
                    cardinal = 'rd';
                default:
                    cardinal = 'th';
            }
        }

        return `${month} ${day}${cardinal}, ${year}`;
    }
}