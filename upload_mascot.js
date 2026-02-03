const ImageKit = require('imagekit');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
});

const videoPath = 'public/mascot-dance.mp4';
const fileName = 'mascot-dance.mp4';

console.log('Starting upload to ImageKit...');

fs.readFile(videoPath, (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    imagekit.upload({
        file: data,
        fileName: fileName,
        folder: '/mascot',
        useUniqueFileName: false
    }, (error, result) => {
        if (error) {
            console.error('Upload failed:', error);
        } else {
            console.log('Upload successful!');
            console.log('URL:', result.url);
        }
    });
});
