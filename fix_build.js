const { Client } = require("ssh2");
const c = new Client();
c.on("ready", () => {
  console.log("Connected. Doing clean rebuild from git...");

  const script = `
echo "=== Clean clone fresh source ==="
cd /opt && rm -rf acs-varshan-source
git clone https://github.com/Varshanrpsit057/Ro-Management.git acs-varshan-source
cd acs-varshan-source/frontend

echo "=== Set Vite config ==="
cat > vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/acs-varshan/",
  server: { port: 3057, host: true, proxy: { "/api": { target: "http://localhost:8057", changeOrigin: true } } }
});
EOF

echo "=== Build frontend ==="
npm install 2>&1 | tail -3
npm run build 2>&1

echo "=== Copy dist to /opt/acs-varshan/frontend/ ==="
cp -r dist /opt/acs-varshan/frontend/

echo "=== Verify ==="
ls -la /opt/acs-varshan/frontend/dist/index.html
cat /opt/acs-varshan/frontend/dist/index.html | head -8
curl -s -o /dev/null -w "Nginx: %{http_code}\\n" http://localhost/acs-varshan/
echo "Site: http://ailearner.com/acs-varshan/"
`;

  c.exec(script, (err, stream) => {
    if (err) { console.error("Exec:", err); c.end(); return; }
    stream.on("data", d => process.stdout.write(d.toString()));
    stream.stderr.on("data", d => process.stdout.write(d.toString()));
    stream.on("close", () => { console.log("\nDone!"); c.end(); });
  });
});
c.on("error", e => console.error(e.message));
c.connect({ host:"68.178.168.196", port:22, username:"ailearner", password:"Rpsitaids#1", readyTimeout:15000, keepaliveInterval:10000 });
