const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
content.split('\n').forEach(line => {
    const key = line.split('=')[0];
    if (key.includes('IMAGEKIT')) {
        console.log(key);
    }
});
