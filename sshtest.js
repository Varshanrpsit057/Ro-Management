const { Client } = require("ssh2");
const c = new Client();
c.on("ready", () => { console.log("OK"); c.exec("whoami && ls /opt/ 2>/dev/null", (e,s)=>{ s.on("data",d=>process.stdout.write(d)); s.on("close",()=>c.end()); }); });
c.on("error", e => console.error("X:", e.message));
c.connect({ host:"68.178.168.196", port:22, username:"ailearner", password:"Rpsitaids#1", readyTimeout:15000, tryKeyboard:true, keepaliveInterval:5000 });
