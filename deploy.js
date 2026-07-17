// deploy.js — Single robust deployment with retry
const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const H = "68.178.168.196";
const U = "ailearner";
const P = "Rpsitaids#1";
const D = "/opt/acs-varshan";

// Step 1: Build frontend
console.log("1/3 Building frontend...");
execSync("npm run build", { cwd: path.join(__dirname, "frontend"), stdio: "inherit" });

// Step 2: Package
console.log("2/3 Packaging...");
execSync('tar czf deploy.tar.gz --exclude=node_modules --exclude=.git backend frontend/dist frontend/package.json frontend/vite.config.js frontend/index.html frontend/public', { cwd: __dirname, stdio: "inherit" });
const tar = fs.readFileSync(path.join(__dirname, "deploy.tar.gz"));
console.log(`   Package: ${(tar.length/1024).toFixed(0)}KB`);

// Step 3: Connect and deploy
console.log("3/3 Connecting to server...");

function tryConnect(attempt = 1) {
  const c = new Client();
  let connected = false;

  c.on("ready", () => {
    connected = true;
    console.log("   Connected! Uploading...");

    c.sftp((e, sftp) => {
      if (e) { console.error("SFTP error:", e); c.end(); return; }

      // Upload tar
      sftp.writeFile(`${D}/deploy.tar.gz`, tar, (we) => {
        if (we) { console.error("Upload error:", we); c.end(); return; }
        console.log("   Uploaded. Running setup...");

        // Run the entire setup as a background script
        const script = `#!/bin/bash
cd ${D}
tar xzf deploy.tar.gz && rm deploy.tar.gz

# .env
cat > backend/.env << 'ENVEOF'
PORT=8057
DB_HOST=localhost
DB_PORT=5432
DB_NAME=varshan-db
DB_USER=postgres
DB_PASS=Rpsitaids#1
ENVEOF

# Install
cd ${D}/backend && npm install --production 2>&1 | tail -2
cd ${D}/frontend && npm install 2>&1 | tail -2
cd ${D}/frontend && npx vite build 2>&1 | tail -3

# Database
PGPASSWORD=Rpsitaids#1 psql -U postgres -d postgres -c 'CREATE DATABASE "varshan-db";' 2>&1
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f ${D}/backend/src/schema.sql 2>&1 | tail -2
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f ${D}/backend/auth_migration.sql 2>&1 | tail -1
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f ${D}/backend/store_migration.sql 2>&1 | tail -1
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f ${D}/backend/orders_migration.sql 2>&1 | tail -1
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f ${D}/backend/expanded_catalog.sql 2>&1 | tail -1

# Fix passwords
cd ${D}/backend && node -e "const{Client}=require('pg');const bcrypt=require('bcryptjs');(async()=>{const c=new Client({host:'localhost',port:5432,database:'varshan-db',user:'postgres',password:'Rpsitaids#1'});await c.connect();const h=bcrypt.hashSync('password123',10);await c.query('UPDATE users SET password=\\$1',[h]);await c.end()})();"

# Kill old
pkill -f "node src/index" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Start
cd ${D}/backend && nohup node src/index.js > /tmp/ro-backend.log 2>&1 &
cd ${D}/frontend && nohup npx vite --host --port 3057 > /tmp/ro-frontend.log 2>&1 &
sleep 3

echo "=== RESULT ==="
curl -s http://localhost:8057/api/health
curl -s -o /dev/null -w "Frontend: %{http_code}" http://localhost:3057
echo ""
echo "Frontend: http://${H}:3057"
echo "Backend:  http://${H}:8057"
echo "Admin:    admin / password123"
`;

        // Write script to server and execute in background
        const scriptEncoded = Buffer.from(script).toString("base64");
        c.exec(`echo ${scriptEncoded} | base64 -d > /tmp/deploy.sh && chmod +x /tmp/deploy.sh && bash /tmp/deploy.sh`, (err, stream) => {
          if (err) { console.error("Exec error:", err); c.end(); return; }

          let output = "";
          stream.on("data", (d) => {
            const s = d.toString();
            process.stdout.write(s);
            output += s;
          });
          stream.stderr.on("data", (d) => process.stderr.write(d.toString()));

          stream.on("close", () => {
            console.log("\n=== Deployment Complete ===");
            c.end();
            try { fs.unlinkSync(path.join(__dirname, "deploy.tar.gz")); } catch {}
          });
        });
      });
    });
  });

  c.on("error", (err) => {
    if (attempt < 5) {
      const delay = attempt * 5000;
      console.log(`   Retry ${attempt}/5 in ${delay/1000}s... (${err.message})`);
      setTimeout(() => tryConnect(attempt + 1), delay);
    } else {
      console.error("   Failed after 5 attempts:", err.message);
      process.exit(1);
    }
  });

  c.connect({ host: H, port: 22, username: U, password: P, readyTimeout: 20000, keepaliveInterval: 10000, keepaliveCountMax: 3 });
}

tryConnect();
