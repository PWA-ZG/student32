const { PrismaClient } = require('@prisma/client');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const fs = require('fs');
const https = require('https');

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

const config = {
    baseURL: externalUrl ||  `https://localhost:${port}`,
}

const prisma = new PrismaClient();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post('/upload', async (req, res) => {
    try{
        const { imageDataUrl, caption } = req.body;
        const base64Data = imageDataUrl.replace(/^data:image\/jpeg;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const savedPicture = await prisma.picture.create({
            data: {
                data: buffer,
                caption: caption || null,
            },
        });

        res.status(200).json({ message: 'Image uploaded successfully', picture: savedPicture, redirect: '/index.html' });
    }
    catch(err){
        res.status(500).json({ error: 'Error with uploading picture' });
    }
});

app.get('/pictures', async (req, res) => {
    try{
        const pictures = await prisma.picture.findMany();

        res.status(200).json({ pictures });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Error with getting pictures' });
    }
});

if(externalUrl){
    const hostname = '0.0.0.0';
    app.listen(port, hostname, () => {
        console.log( `Server locally running at https://${hostname}:${port}/ and from outside on ${externalUrl}`);
    });
}
else{
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}