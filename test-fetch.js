
const fetch = require('node-fetch');

async function test() {
    const res = await fetch('http://localhost:3000/api/snacks/products?activeOnly=true');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
