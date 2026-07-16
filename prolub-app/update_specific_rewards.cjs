const fs = require('fs');

let dbContent = fs.readFileSync('services/db.ts', 'utf-8');

// Update Camiseta Gulf MCO
const mcoRegex = /"name":\s*"Camiseta Gulf MCO"[\s\S]*?"pointsPareto":\s*\d+,[\s\S]*?"pointsNormal":\s*\d+,/;
const mcoMatch = dbContent.match(mcoRegex);
if (mcoMatch) {
    let mcoStr = mcoMatch[0];
    mcoStr = mcoStr.replace(/"pointsPareto":\s*\d+/, '"pointsPareto": 50');
    mcoStr = mcoStr.replace(/"pointsNormal":\s*\d+/, '"pointsNormal": 25');
    dbContent = dbContent.replace(mcoMatch[0], mcoStr);
    console.log("Updated Camiseta Gulf MCO");
}

// Update Gorra / Vaso cervecero
const gorraRegex = /"name":\s*"Gorra \/ Vaso cervecero"[\s\S]*?"pointsPareto":\s*\d+,[\s\S]*?"pointsNormal":\s*\d+,/;
const gorraMatch = dbContent.match(gorraRegex);
if (gorraMatch) {
    let gorraStr = gorraMatch[0];
    gorraStr = gorraStr.replace(/"name":\s*"Gorra \/ Vaso cervecero"/, '"name": "Gorra GULF - Prolub"');
    gorraStr = gorraStr.replace(/"pointsPareto":\s*\d+/, '"pointsPareto": 17');
    gorraStr = gorraStr.replace(/"pointsNormal":\s*\d+/, '"pointsNormal": 8');
    dbContent = dbContent.replace(gorraMatch[0], gorraStr);
    console.log("Updated Gorra GULF - Prolub");
}

// Update DB_KEY
dbContent = dbContent.replace(/const DB_KEY = 'gulf_prolub_db_v\d+';/, "const DB_KEY = 'gulf_prolub_db_v10';");

fs.writeFileSync('services/db.ts', dbContent);
console.log('Done');
