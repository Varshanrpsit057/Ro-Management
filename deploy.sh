#!/bin/bash
# Run this script on the server (68.178.168.196) as user ailearner
# Usage: bash deploy.sh

set -e
DEPLOY_DIR="/opt/acs-varshan"
REPO_URL="https://github.com/Varshanrpsit057/Ro-Management.git"

echo "=== ACS RO Water System Deployment ==="

# 1. Clone or pull project
if [ -d "$DEPLOY_DIR/.git" ]; then
  echo "Pulling latest changes..."
  cd "$DEPLOY_DIR"
  git pull origin master
else
  echo "Cloning repository..."
  sudo mkdir -p "$DEPLOY_DIR"
  sudo chown -R ailearner:ailearner "$DEPLOY_DIR"
  git clone "$REPO_URL" "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# 2. Copy .env file
cat > backend/.env << 'ENVEOF'
PORT=8057
DB_HOST=localhost
DB_PORT=5432
DB_NAME=varshan-db
DB_USER=postgres
DB_PASS=rpsitaids#1
ENVEOF

# 3. Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production
cd ..

# 4. Install frontend dependencies & build
echo "Installing frontend dependencies & building..."
cd frontend
npm install
npx vite build
cd ..

# 5. Setup PostgreSQL database
echo "Setting up database varshan-db..."
sudo -u postgres psql -c "CREATE DATABASE \"varshan-db\";" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'rpsitaids#1';" 2>/dev/null || echo "Password may already be set"

# 6. Run all migrations
echo "Running database migrations..."
PGPASSWORD=rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/src/schema.sql
PGPASSWORD=rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/seed.sql 2>/dev/null
PGPASSWORD=rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/auth_migration.sql 2>/dev/null
PGPASSWORD=rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/store_migration.sql 2>/dev/null
PGPASSWORD=rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/orders_migration.sql 2>/dev/null
PGPASSWORD=rpsitaids#1 psql -U postgres -d "varshan-db" -f backend/expanded_catalog.sql 2>/dev/null

# 7. Generate bcrypt password hashes
echo "Setting up user accounts..."
cd backend
node -e "
const {Client} = require('pg');
const bcrypt = require('bcryptjs');
(async () => {
  const c = new Client({host:'localhost',port:5432,database:'varshan-db',user:'postgres',password:'rpsitaids#1'});
  await c.connect();
  const h = bcrypt.hashSync('password123', 10);
  await c.query('UPDATE users SET password=\$1', [h]);
  console.log('Passwords updated');
  await c.end();
})();
"
cd ..

# 8. Stop old processes
echo "Stopping old processes..."
pkill -f "node src/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# 9. Start backend on port 8057
echo "Starting backend on port 8057..."
cd "$DEPLOY_DIR/backend"
nohup node src/index.js > /tmp/ro-backend.log 2>&1 &
echo "Backend PID: $!"
cd "$DEPLOY_DIR"

# 10. Start frontend on port 3057
echo "Starting frontend on port 3057..."
cd "$DEPLOY_DIR/frontend"
nohup npx vite --host --port 3057 > /tmp/ro-frontend.log 2>&1 &
echo "Frontend PID: $!"
cd "$DEPLOY_DIR"

echo ""
echo "=== Deployment Complete ==="
echo "Frontend:  http://68.178.168.196:3057"
echo "Backend:   http://68.178.168.196:8057"
echo ""
echo "Admin Login: admin / password123"
echo "Backend Log: tail -f /tmp/ro-backend.log"
echo "Frontend Log: tail -f /tmp/ro-frontend.log"
