const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

app.get('/api/scrape', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).json({ 
            success: false, 
            error: "Erreur : Vous devez fournir une URL valide (?url=https://...)" 
        });
    }

    try {
        const response = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
            },
            timeout: 7000
        });

        const $ = cheerio.load(response.data);

        $('script, style, nav, footer, header, iframe, noscript, .ads, #sidebar, .menu, .banner').remove();

        let cleanText = [];
        $('h1, h2, h3, p').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 15) {
                cleanText.push(text);
            }
        });

        return res.status(200).json({
            success: true,
            source: targetUrl,
            data: cleanText.join('\n\n')
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: "Impossible d'extraire les données : " + error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Le moteur de l'API tourne sur le port ${PORT}`);
});
