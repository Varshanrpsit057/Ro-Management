const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const conn = new Client();
const HOST = "68.178.168.196";
const USER = "ailearner";
const PASS = "rpsitaids#1";
const DEPLOY_DIR = "/opt/acs-varshan";

// Build frontend first
console.log("Building frontend...");
execSync("npm run build", { cwd: path.join(__dirname, "frontend"), stdio: "inherit" });

// Create tar of project (excluding node_modules, dist, .git)
console.log("Packaging project...");
execSync('tar czf deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=backend/node_modules --exclude=frontend/node_modules --exclude=frontend/dist .', { cwd: __dirname, stdio: "inherit" });

const tarBuffer = fs.readFileSync(path.join(__dirname, "deploy.tar.gz"));

conn.on("ready", () => {
  console.log(`Connected to ${HOST}`);

  const commands = [
    `mkdir -p ${DEPLOY_DIR}`,
    `echo "Password for postgres user needed. Run: ALTER USER postgres PASSWORD 'rpsitaids#1'; if needed"`,
  ];

  // Upload tar
  console.log("Uploading project...");
  conn.sftp((err, sftp) => {
    if (err) { console.error("SFTP error:", err); conn.end(); return; }

    sftp.writeFile(
      `${DEPLOY_DIR}/deploy.tar.gz`,
      tarBuffer,
      { mode: 0o644 },
      (writeErr) => {
        if (writeErr) { console.error("Upload error:", writeErr); conn.end(); return; }
        console.log("Upload complete. Extracting...");

        const setupCommands = `
          cd ${DEPLOY_DIR}
          tar xzf deploy.tar.gz
          rm deploy.tar.gz

          echo "=== Installing backend dependencies ==="
          cd backend && npm install --production

          echo "=== Setting up database ==="
          sudo -u postgres psql -c "CREATE DATABASE \\"varshan-db\\";" 2>/dev/null
          sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'rpsitaids#1';" 2>/dev/null

          echo "=== Running migrations ==="
          PGPASSWORD=rpsitaids#1 psql -U postgres -d varshan-db -f src/schema.sql
          PGPASSWORD=rpsitaids#1 psql -U postgres -d varshan-db -f ../seed.sql 2>/dev/null
          PGPASSWORD=rpsitaids#1 psql -U postgres -d varshan-db -f ../auth_migration.sql 2>/dev/null
          PGPASSWORD=rpsitaids#1 psql -U postgres -d varshan-db -f ../store_migration.sql 2>/dev/null
          PGPASSWORD=rpsitaids#1 psql -U postgres -d varshan-db -f ../orders_migration.sql 2>/dev/null
          PGPASSWORD=rpsitaids#1 psql -U postgres -d varshan-db -f ../expanded_catalog.sql 2>/dev/null

          echo "=== Starting backend ==="
          cd ${DEPLOY_DIR}/backend
          pkill -f "node src/index.js" 2>/dev/null
          nohup node src/index.js > backend.log 2>&1 &
          echo "Backend PID: $!"

          echo "=== Starting frontend ==="
          cd ${DEPLOY_DIR}/frontend
          pkill -f "vite" 2>/dev/null
          nohup npx vite --host --port 3057 > frontend.log 2>&1 &
          echo "Frontend PID: $!"

          echo "=== Deployment Complete ==="
          echo "Frontend: http://${HOST}:3057"
          echo "Backend:  http://${HOST}:8057"
        `;

        conn.exec(setupCommands, (execErr, stream) => {
          if (execErr) { console.error("Exec error:", execErr); conn.end(); return; }
          stream.on("data", (d) => process.stdout.write(d.toString().replace(/\r/g, "")));
          stream.stderr.on("data", (d) => process.stderr.write(d.toString().replace(/\r/g, "")));
          stream.on("close", () => {
            console.log("\nDone.");
            conn.end();
            fs.unlinkSync(path.join(__dirname, "deploy.tar.gz"));
          });
        });
      }
    );
  });
});

conn.on("error", (err) => {
  console.error("Connection error:", err.message);
  process.exit(1);
});

conn.on("keyboard-interactive", (name, instructions, lang, prompts, finish) => {
  finish([PASS]);
});

conn.connect({ host: HOST, port: 22, username: USER, tryKeyboard: true, password: PASS, readyTimeout: 30000, keepaliveInterval: 10000, algorithms: { kex: ["diffie-hellman-group14-sha256","diffie-hellman-group14-sha1","ecdh-sha2-nistp256","ecdh-sha2-nistp384","ecdh-sha2-nistp521"], cipher: ["aes128-ctr","aes192-ctr","aes256-ctr","aes128-gcm","aes256-gcm"], serverHostKey: ["rsa-sha2-512","rsa-sha2-256","ecdsa-sha2-nistp256","ssh-ed25519"], hmac: ["hmac-sha2-256","hmac-sha2-512"] } });
