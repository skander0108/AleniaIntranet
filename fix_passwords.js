const bcrypt = require('bcryptjs');
const fs = require('fs');
const cp = require('child_process');

// Generate a valid bcrypt hash for "password"
// We enforce the $2a$ format which Spring Boot natively prefers, even though bcryptjs outputs $2b$
let hash = bcrypt.hashSync('password', 10);
hash = hash.replace(/^\$2[abxy]\$/, '$2a$');

console.log('Generated verified BCrypt hash for "password":', hash);
console.log('Matches "password"?', bcrypt.compareSync('password', hash));

const sql = `UPDATE users SET password = '${hash}' WHERE email IN ('admin@iberia.tn', 'collaborator@iberia.tn');`;

fs.writeFileSync('db_fix.sql', sql);
console.log('Wrote pure SQL payload to db_fix.sql');

try {
    cp.execSync('docker exec -i aleniaintranet-db-1 psql -U postgres -d iberia_intranet < db_fix.sql');
    console.log('Successfully applied the verified BCrypt hash directly to the Docker DB!');
} catch (e) {
    console.error('Failed to run docker exec:', e.message);
}
