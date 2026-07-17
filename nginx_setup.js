const { Client } = require("ssh2");
const H="68.178.168.196", U="ailearner", P="Rpsitaids#1", D="/opt/acs-varshan";

const c = new Client();
c.on("ready", () => {
  console.log("Connected! Configuring nginx + Vite base path...");

  const script = `
echo "=== 1. Update Vite base path ==="
cat > ${D}/frontend/vite.config.js << 'VITEEOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/acs-varshan/",
  server: {
    port: 3057,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8057",
        changeOrigin: true,
      },
    },
  },
});
VITEEOF

echo "=== 2. Rebuild frontend ==="
cd ${D}/frontend && npm run build 2>&1 | tail -3

echo "=== 3. Configure nginx ==="
sudo tee /etc/nginx/sites-available/acs-varshan << 'NGXEOF'
server {
    listen 80;
    server_name ailearner.com www.ailearner.com;

    location /acs-varshan/ {
        alias /opt/acs-varshan/frontend/dist/;
        try_files $uri $uri/ /acs-varshan/index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8057/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGXEOF

sudo ln -sf /etc/nginx/sites-available/acs-varshan /etc/nginx/sites-enabled/ 2>/dev/null

echo "=== 4. Test and reload nginx ==="
sudo nginx -t 2>&1
sudo systemctl reload nginx 2>&1 || sudo service nginx reload 2>&1

echo "=== 5. Verify ==="
curl -s -o /dev/null -w "Nginx: %{http_code}\\n" http://localhost/acs-varshan/
curl -s http://localhost:8057/api/health
`;

  c.exec(script, (err, stream) => {
    if (err) { console.error("Exec:", err); c.end(); return; }
    stream.on("data", d => process.stdout.write(d.toString()));
    stream.stderr.on("data", d => process.stdout.write(d.toString()));
    stream.on("close", () => {
      console.log("\n=== Done ===");
      console.log("Site: http://ailearner.com/acs-varshan/");
      console.log("API:  http://ailearner.com/api/");
      c.end();
    });
  });
});

c.on("error", e => { console.error("SSH:", e.message); process.exit(1); });
c.connect({ host:H, port:22, username:U, password:P, readyTimeout:15000, keepaliveInterval:10000, keepaliveCountMax:3 });
