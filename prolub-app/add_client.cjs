const fs = require('fs');

let dbContent = fs.readFileSync('services/db.ts', 'utf-8');

// Add to RAW_CLIENTS_CSV
const newClientLine = '\\nNormal;0527;PRUEBA JUAN;000';
const clientsEndIdx = dbContent.indexOf('\`;', dbContent.indexOf('const RAW_CLIENTS_CSV ='));
if (clientsEndIdx !== -1) {
    dbContent = dbContent.substring(0, clientsEndIdx) + newClientLine + dbContent.substring(clientsEndIdx);
}

// Add to RAW_POINTS_CSV
const newPointLine = '\\nPRUEBA JUAN;1500';
const pointsEndIdx = dbContent.indexOf('\`;', dbContent.indexOf('const RAW_POINTS_CSV ='));
if (pointsEndIdx !== -1) {
    dbContent = dbContent.substring(0, pointsEndIdx) + newPointLine + dbContent.substring(pointsEndIdx);
}

// Update DB_KEY
dbContent = dbContent.replace(/const DB_KEY = 'gulf_prolub_db_v\d+';/, "const DB_KEY = 'gulf_prolub_db_v13';");

fs.writeFileSync('services/db.ts', dbContent);
console.log('Added PRUEBA JUAN');
