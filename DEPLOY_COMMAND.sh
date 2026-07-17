# ============================================================
# ACS RO Water System — Deployment Command
# Run this on server 68.178.168.196 as user ailearner
# Just paste this ENTIRE block into your SSH terminal:
# ============================================================

sudo mkdir -p /opt/acs-varshan && sudo chown -R ailearner:ailearner /opt/acs-varshan && \
cd /opt/acs-varshan && \
git clone https://github.com/Varshanrpsit057/Ro-Management.git . 2>/dev/null || git pull && \
cat > backend/.env << 'EOF'
PORT=8057
DB_HOST=localhost
DB_PORT=5432
DB_NAME=varshan-db
DB_USER=postgres
DB_PASS=Rpsitaids#1
EOF
cd backend && npm install --production && cd .. && \
cd frontend && npm install && npx vite build && cd .. && \
PGPASSWORD=Rpsitaids#1 psql -U postgres -d postgres -c 'CREATE DATABASE "varshan-db";' 2>/dev/null; \
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/src/schema.sql && \
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/auth_migration.sql 2>/dev/null && \
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/store_migration.sql 2>/dev/null && \
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/orders_migration.sql 2>/dev/null && \
PGPASSWORD=Rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/expanded_catalog.sql 2>/dev/null && \
cd backend && node -e "
const{Client}=require('pg');const bcrypt=require('bcryptjs');
(async()=>{const c=new Client({host:'localhost',port:5432,database:'varshan-db',user:'postgres',password:'Rpsitaids#1'});
await c.connect();const h=bcrypt.hashSync('password123',10);await c.query('UPDATE users SET password=\$1',[h]);
console.log('Passwords updated');await c.end()})();" && cd .. && \
pkill -f "node src/index" 2>/dev/null; pkill -f "vite" 2>/dev/null; sleep 1 && \
cd backend && nohup node src/index.js > /tmp/ro-backend.log 2>&1 & sleep 2 && \
cd /opt/acs-varshan/frontend && nohup npx vite --host --port 3057 > /tmp/ro-frontend.log 2>&1 & sleep 2 && \
echo "=== DEPLOYMENT COMPLETE ===" && \
echo "Frontend: http://68.178.168.196:3057" && \
echo "Backend:  http://68.178.168.196:8057" && \
curl -s http://localhost:8057/api/health && \
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3057
