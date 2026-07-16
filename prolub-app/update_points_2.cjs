const fs = require('fs');

let dbContent = fs.readFileSync('services/db.ts', 'utf-8');

// Update points
dbContent = dbContent.replace(/FILTROS Y FILTROS S\.A\.S\.;0/, 'FILTROS Y FILTROS S.A.S.;267');
dbContent = dbContent.replace(/GRISALES MESA EDWARD HERNAN;0/, 'GRISALES MESA EDWARD HERNAN;521');

// Update DB_KEY
dbContent = dbContent.replace(/const DB_KEY = 'gulf_prolub_db_v\d+';/, "const DB_KEY = 'gulf_prolub_db_v14';");

fs.writeFileSync('services/db.ts', dbContent);
console.log('Updated points');
