const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Build fresh
console.log("Building dist...");
execSync("npm run build", { cwd: path.join(__dirname, "frontend"), stdio: "inherit" });
execSync("tar czf dist.tar.gz --transform 's,^,dist/,' -C frontend dist", { cwd: __dirname });
const buf = fs.readFileSync(path.join(__dirname, "dist.tar.gz"));

const c = new Client();
c.on("ready", () => {
  console.log("Uploading...");
  // Upload dist + start everything using (nohup bash script &)
  c.sftp((e, sftp) => {
    if (e) { console.error(e); c.end(); return; }
    sftp.writeFile("/tmp/dist-ro.tar.gz", buf, (we) => {
      if (we) { console.error(we); c.end(); return; }

      const script = `
# Extract dist
cd /opt/acs-varshan/frontend && rm -rf dist && tar xzf /tmp/dist-ro.tar.gz && rm /tmp/dist-ro.tar.gz
echo "Dist extracted: $(ls dist/index.html)"

# Create startup wrapper that stays alive
cat > /opt/acs-varshan/run_frontend.sh << 'FX'
#!/bin/bash
cd /opt/acs-varshan/frontend
exec npx vite --host --port 3057 2>&1
FX
chmod +x /opt/acs-varshan/run_frontend.sh

cat > /opt/acs-varshan/run_backend.sh << 'BX'
#!/bin/bash
cd /opt/acs-varshan/backend
exec node src/index.js 2>&1
BX
chmod +x /opt/acs-varshan/run_backend.sh

# Kill everything
pkill -f "run_frontend" 2>/dev/null
pkill -f "run_backend" 2>/dev/null
pkill -f vite 2>/dev/null
pkill -f "node src/index" 2>/dev/null
sleep 1

# Start backend
nohup /opt/acs-varshan/run_backend.sh > /tmp/ro-backend.log 2>&1 &
echo "Backend PID: $!"
sleep 2

# Start frontend
nohup /opt/acs-varshan/run_frontend.sh > /tmp/ro-frontend.log 2>&1 &
echo "Frontend PID: $!"
sleep 4

# Verify
curl -s http://localhost:8057/api/health
echo ""
curl -s -o /dev/null -w "Frontend: %{http_code}\\n" http://localhost:3057/
echo "=== READY ==="
echo "http://68.178.168.196:3057"
`;

      // Run via a temp script so everything stays alive
      c.exec(`cat > /tmp/deploy-ro.sh << 'ALLEOF'\n${script}\nALLEOF\nbash /tmp/deploy-ro.sh`, (err, stream) => {
        if (err) { console.error(err); c.end(); return; }
        stream.on("data", d => process.stdout.write(d.toString()));
        stream.stderr.on("data", d => process.stdout.write(d.toString()));
        stream.on("close", () => {
          console.log("\nDone. Check http://68.178.168.196:3057");
          c.end();
          try { fs.unlinkSync(path.join(__dirname, "dist.tar.gz")); } catch {}
        });
      });
    });
  });
});
c.on("error", e => console.error("SSH:", e.message));
c.connect({ host:"68.178.168.196", port:22, username:"ailearner", password:"Rpsitaids#1", readyTimeout:15000, keepaliveInterval:10000 });
