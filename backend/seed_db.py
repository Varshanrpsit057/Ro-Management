"""Seed the SQLite database with sample products."""
import sqlite3, os, json

DB = os.path.join(os.path.dirname(__file__), "ro_service.db")
conn = sqlite3.connect(DB)

# Create admin user if not exists
try:
    conn.execute("INSERT INTO users (username, password, full_name) VALUES ('admin','$2b$10$hashed','Admin User')")
except:
    pass

cnt = conn.execute("SELECT COUNT(*) FROM store_products").fetchone()[0]
print(f"store_products before: {cnt}")

if cnt > 0:
    conn.close()
    print("Already seeded. Done.")
    exit()

products = [
    ('ro','Aquaguard Marvel 8L','Complete RO Systems','Aquaguard','Marvel 8L','Advanced RO+UV+MTDS with 8L storage tank','RO + UV + MTDS, 8L Tank, 15L/hr, LED Display','{"capacity":"8L"}',14999.00,25,'["/images/ro-system.svg"]','1 Year',1),
    ('ro','Kent Grand Plus 8L','Complete RO Systems','Kent','Grand Plus','RO+UV+UF+TDS controller','Mineral RO, UV + UF, 8L Tank, 20L/hr','{"capacity":"8L"}',16990.00,18,'["/images/ro-system.svg"]','1 Year',1),
    ('ro','Livpure Glo 7L','Complete RO Systems','Livpure','Glo','Stylish RO+UV+UF with copper charge','Copper Charge, 7L Tank','{"capacity":"7L"}',12499.00,30,'["/images/ro-system.svg"]','1 Year',0),
    ('ro','Sediment Filter 5 Micron','Filters','Grand Aqua',None,'5-micron spun PP sediment filter','5 Micron, Spun PP, 10-inch',None,149.00,200,'["/images/filter.svg"]',None,0),
    ('ro','Carbon Block Filter','Filters','Kent',None,'Activated carbon block filter','Activated Carbon, 5 Micron',None,599.00,80,'["/images/filter.svg"]',None,0),
    ('ro','Post Carbon Inline Filter','Filters','Aquaguard',None,'In-line post carbon filter','In-line, Coconut Shell Carbon',None,399.00,90,'["/images/filter.svg"]',None,0),
    ('ro','RO Membrane 80 GPD','Membranes','Dow Filmtec','TW30-1812-80','80 GPD TFC RO membrane, 98% rejection','80 GPD, 98% Rejection',None,1699.00,40,'["/images/membrane.svg"]',None,1),
    ('ro','UF Membrane','Membranes','Aqua Pearl',None,'Hollow fiber UF membrane','0.01 Micron',None,899.00,35,'["/images/membrane.svg"]',None,0),
    ('ro','UV Lamp 11W','UV Lamps','Philips',None,'11W UV-C germicidal lamp','11W UV-C, 254nm',None,799.00,40,'["/images/uv-lamp.svg"]',None,0),
    ('ro','Booster Pump 24V DC','Pumps','Aquatec','CDP 8800','24V DC booster pump','24V DC, 100 PSI, Quiet',None,2499.00,35,'["/images/pump.svg"]','6 Months',0),
    ('ro','RO Faucet Chrome','Faucets','Generic',None,'360 swivel chrome faucet','360 Swivel, Chrome Plated',None,499.00,60,'["/images/faucet.svg"]',None,0),
    ('ro','Storage Tank 12L','Tanks','Aquaguard',None,'Food-grade 12L storage tank','12L Capacity, Food Grade',None,1799.00,15,'["/images/tank.svg"]','1 Year',0),
    ('ro','Filter Housing 10"','Housings','Generic',None,'Standard 10-inch filter housing','10-inch, Pressure Relief',None,699.00,45,'["/images/housing.svg"]',None,0),
    ('ro','Complete Service Kit','Service Kits','Aquaguard',None,'Annual service kit','Filters, Membrane, Sanitizer',None,2499.00,20,'["/images/kit.svg"]',None,1),
    ('ups','PowerZone 1100VA UPS','Home UPS','PowerZone','PZ-1100','1100VA pure sinewave UPS','Pure Sinewave, 1100VA/660W','{"capacity":"1100VA","wattage":"660W"}',5499.00,20,'["/images/ups.svg"]','2 Years',1),
    ('ups','PowerZone 1500VA UPS','Office UPS','PowerZone','PZ-1500','1500VA premium UPS','Pure Sinewave, 1500VA/900W','{"capacity":"1500VA","wattage":"900W"}',8999.00,15,'["/images/ups.svg"]','2 Years',1),
    ('ups','Luminous EcoVolt 1050','Home UPS','Luminous',None,'Eco-friendly 1050VA UPS','Eco Mode, 1050VA','{"capacity":"1050VA"}',6299.00,18,'["/images/ups.svg"]','2 Years',0),
    ('ups','200AH Tubular Battery','Tubular Batteries','PowerZone',None,'200AH tubular battery','C10 200AH, 5 Year Life','{"capacity":"200AH"}',15999.00,10,'["/images/battery.svg"]','5 Years',1),
    ('ups','150AH SMF Battery','SMF Batteries','PowerZone',None,'Sealed 150AH battery','150AH, VRLA','{"capacity":"150AH"}',11500.00,8,'["/images/battery.svg"]','3 Years',0),
    ('ups','Battery Charger 12V/10A','Battery Chargers','PowerZone',None,'Smart battery charger','Auto Multi-Stage, 12V 10A',None,1499.00,30,'["/images/battery.svg"]','1 Year',0),
    ('ups','850VA Inverter','Inverters','PowerZone',None,'850VA pure sinewave inverter','Pure Sinewave, Solar Ready','{"capacity":"850VA"}',4499.00,14,'["/images/ups.svg"]','2 Years',0),
]

conn.executemany("""INSERT INTO store_products
    (store_type,name,category,brand,model,description,features,specs,price,stock_qty,images,warranty,is_featured)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""", products)
conn.commit()

cnt = conn.execute("SELECT COUNT(*) FROM store_products").fetchone()[0]
print(f"store_products after: {cnt}")
conn.close()
print("Seeding complete!")
