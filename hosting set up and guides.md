🚀 FULL DEPLOYMENT GUIDE (Next.js + PM2 + Nginx + Domain)

This is your playbook.

🧱 0. Server reset checklist (fresh VPS)
apt update && apt upgrade -y
apt install nginx git -y

Install Node (with nvm):

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install node

Install PM2:

npm install -g pm2
📦 1. Get your project
cd /var/www
git clone YOUR_REPO_URL zedyoum
cd zedyoum
📥 2. Install & build
npm install
npm run build
▶️ 3. Run with PM2

Make sure your package.json has:

"start": "next start -p 3000 -H 0.0.0.0"

Start:

pm2 start npm --name "zedyoum" -- start
pm2 save
pm2 startup

(run the command it gives you)

🌐 4. Domain (DNS)

In zedyoumplus.com DNS:

A @ → YOUR_VPS_IP
A www → YOUR_VPS_IP
⚙️ 5. Nginx config
nano /etc/nginx/sites-available/zedyoumplus

Paste:

server {
    listen 80;
    server_name zedyoumplus.com www.zedyoumplus.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

Enable:

ln -s /etc/nginx/sites-available/zedyoumplus /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
🔒 6. SSL (HTTPS)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d zedyoumplus.com -d www.zedyoumplus.com
✅ DONE

Your app is live at:

https://zedyoumplus.com
🔄 HOW TO UPDATE YOUR APP (daily workflow)

When you push changes:

cd /var/www/zedyoum

git pull
npm install
npm run build
pm2 restart zedyoum

👉 That’s it.

⚡ EVEN FASTER (1 command deploy)

Create a script:

nano deploy.sh

Paste:

#!/bin/bash
git pull
npm install
npm run build
pm2 restart zedyoum

Make executable:

chmod +x deploy.sh

Now just run:

./deploy.sh
🧠 DEBUG COMMANDS (you WILL need these)
Check app logs
pm2 logs zedyoum
Check running apps
pm2 status
Check port
lsof -i :3000
Check nginx
systemctl status nginx
🔥 MOST COMMON ISSUES
❌ Site not reachable
DNS not propagated
nginx not restarted
❌ 502 Bad Gateway
app not running
pm2 restart zedyoum
❌ Changes not showing
npm run build
pm2 restart zedyoum
🧠 PRO SETUP (for your agency later)

Multiple apps:

App	Port
zedyoum	3000
client2	3001
client3	3002

Each gets:

its own PM2 process
its own Nginx config