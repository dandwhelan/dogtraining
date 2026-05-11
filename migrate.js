const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'training.sqlite');
if (!fs.existsSync(dbPath)) {
  console.log('Database not found, no migration needed.');
  process.exit(0);
}

const db = new Database(dbPath);

const columns = [
  'weight TEXT',
  'dietary_restrictions TEXT',
  'fav_toy TEXT',
  'least_fav_toy TEXT',
  'fav_games TEXT',
  'least_fav_games TEXT',
  'best_traits TEXT',
  'worst_traits TEXT',
  'birthday TEXT',
  'gotcha_day TEXT',
  'microchip_number TEXT',
  'vet_contact TEXT',
  'profile_picture TEXT'
];

let added = 0;
for (const col of columns) {
  try {
    db.prepare(`ALTER TABLE dogs ADD COLUMN ${col}`).run();
    console.log(`Added column: ${col}`);
    added++;
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log(`Column already exists, skipping: ${col}`);
    } else {
      console.error(`Error adding column ${col}:`, err.message);
    }
  }
}

console.log(`Migration complete. Added ${added} columns.`);
db.close();
