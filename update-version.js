const fs = require('fs');
const buildDate = new Date().toISOString();
fs.writeFileSync('./app/assets/version.txt', buildDate, 'utf-8');