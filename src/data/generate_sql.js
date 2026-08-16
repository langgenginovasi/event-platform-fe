const fs = require('fs');

const csvPath = 'd:/02. LANGIT/CodeRun/EventAbsensiV2/evnthipmi-script-n-docs/output/split-per-batch/data_anggota_batch_20260728.csv';
const sqlPath = 'd:/02. LANGIT/CodeRun/EventAbsensiV2/event-platform-fe/src/data/update_gender.sql';

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).slice(1);

let sqlStatements = [];
lines.forEach(line => {
    if (!line.trim()) return;
    
    let cols = [];
    let cur = '';
    let inQuote = false;
    for(let i=0; i<line.length; i++) {
        let c = line[i];
        if (c === '"') {
            inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
            cols.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    cols.push(cur);
    
    let ekta = cols[2];
    let gender = cols[4];
    if (ekta && (gender === 'L' || gender === 'P')) {
        // Asumsi kolom identification_number di db menyimpan ekta
        sqlStatements.push(`UPDATE participants SET gender = '${gender}' WHERE identification_number = '${ekta}';`);
    }
});

fs.writeFileSync(sqlPath, sqlStatements.join('\n'));
console.log('SQL generated with ' + sqlStatements.length + ' queries.');
