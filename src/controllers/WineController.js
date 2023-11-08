const JSSoup = require('jssoup').default;
const axios = require('axios');

module.exports = {
    async getWineInfo(req, res) {
        let soup;
        try {
            const html = await axios.get(req.headers.url);
            soup = new JSSoup(html.data);
        } catch (err) {
            console.log(err);
            res.status(400).send({ message: 'Failed to get wine information.' });
        }

        let name, vintage, varietal, origin, image;

        let i = 0
        while (i < 10) {
            try {
                name = soup.find('h1', 'pipName').text;
                
                vintage = parseInt(name.substring(name.length-4, name.length));
                name = name.substring(0, name.length-5);

                const varietalSpan = soup.find('span', 'prodItemInfo_varietal');
                varietal = varietalSpan.find('a').text;

                const originSpan = soup.find('span', 'prodItemInfo_originText');
                origin = originSpan.find('a').text;

                const imageDiv = soup.find('div', 'pipProdThumbs');
                image = imageDiv.nextElement.nextElement.attrs.src;
                image = image.split('/');
                image = image[image.length-1];
                image = 'https://www.wine.com/product/images/w_600,h_600,c_fit,q_auto:good,fl_progressive/' + image;

                break;
            } catch (error) {
                i++;
            }
        }

        if (i >= 10) res.status(400).send({ message: 'Failed to get wine information.' });

        res.status(200).send({ name, vintage, varietal, origin, image });
    }
}