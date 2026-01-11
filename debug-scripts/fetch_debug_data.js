
const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/admin/debug-data', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            let output = "";

            output += "--- VENDORS ---\n";
            json.vendors.forEach(v => output += `${v.name} : ${v.id}\n`);

            output += "\n--- PRODUCTS ---\n";
            const targetProducts = json.products.filter(p =>
                p.name === "INIPPU SEVVU" || p.name === "KAARA SEVVU"
            );
            targetProducts.forEach(p => output += `${p.name} (${p.id}) -> Vendor: ${p.vendorId}\n`);

            output += "\n--- AFFILIATE ---\n";
            const affiliate = json.affiliates.find(a => a.couponCode === "HMS63294");
            if (affiliate) {
                output += `Found: ${affiliate.name} (ID: ${affiliate.id}) Code: ${affiliate.couponCode}\n`;
            } else {
                output += `Affiliate HMS63294 NOT found\n`;
            }

            fs.writeFileSync('debug_output.txt', output);
            console.log("Done");

        } catch (e) {
            console.log("Error parsing JSON: " + e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
