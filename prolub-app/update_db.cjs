const fs = require('fs');
const dbContent = fs.readFileSync('services/db.ts', 'utf-8');
const newRewards = fs.readFileSync('new_rewards.json', 'utf-8');

const lines = dbContent.split('\n');
const startIdx = lines.findIndex(l => l.includes('rewards: ['));
const endIdx = lines.findIndex(l => l.includes('orders: []'));

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = [
        ...lines.slice(0, startIdx),
        '  rewards: ' + newRewards + ',',
        ...lines.slice(endIdx)
    ].join('\n');
    fs.writeFileSync('services/db.ts', newContent);
    console.log('Updated services/db.ts');
} else {
    console.log('Could not find start or end index');
}
