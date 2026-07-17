const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Build locally
execSync("npm run build", { cwd: path.join(__dirname, "frontend"), stdio: "inherit" });
execSync('tar czf deploy.tar.gz --exclude=node_modules --exclude=.git -C frontend dist', { cwd: __dirname });
const tar = fs.readFileSync(path.join(__dirname, "deploy.tar.gz"));

const c = new Client();
c.on("ready", () => {
  console.log(`Uploading dist (${(tar.length/1024).toFixed(0)}KB)...`);

  c.sftp((e, sftp) => {
    sftp.writeFile("/opt/acs-varshan/frontend/dist.tar.gz", tar, (we) => {
      if (we) { console.error(we); c.end(); return; }
      console.log("Uploaded. Extracting...");

      c.exec(`
cd /opt/acs-varshan/frontend
rm -rf dist
tar xzf dist.tar.gz
rm dist.tar.gz
ls -la dist/

pkill -f "vite" 2>/dev/null; sleep 1
nohup npx vite --host --port 3057 > /tmp/ro-frontend.log 2>&1 &
sleep 2

echo "Verify:"
curl -s -o /dev/null -w "HTTP %{http_code}\\n" http://localhost:3057/
curl -s http://localhost:8057/api/health
echo ""
echo "Ready: http://68.178.168.196:3057"
      `, (err, stream) => {
        stream.on("data", d => process.stdout.write(d));
        stream.stderr.on("data", d => process.stdout.write(d));
        stream.on("close", () => { console.log("Done."); c.end(); try{fs.unlinkSync(path.join(__dirname,"deploy.tar.gz"))}catch{} });
      });
    });
  });
});
c.on("error", e => console.error(e.message));
c.connect({ host:"68.178.168.196", port:22, username:"ailearner", password:"Rpsitaids#1", readyTimeout:15000, keepaliveInterval:10000 });
