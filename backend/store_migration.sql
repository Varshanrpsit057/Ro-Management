-- Store tables: products, cart, reviews — no auth required (customer-facing)

-- Store products table (single table, distinguished by store_type: 'ro' or 'ups')
CREATE TABLE IF NOT EXISTS store_products (
    id            SERIAL PRIMARY KEY,
    store_type    VARCHAR(10) NOT NULL CHECK (store_type IN ('ro', 'ups')),
    name          VARCHAR(200) NOT NULL,
    category      VARCHAR(100) NOT NULL,
    brand         VARCHAR(100),
    model         VARCHAR(100),
    description   TEXT,
    features      TEXT,              -- comma-separated features
    specs         JSONB,             -- { capacity, voltage, backup_time, warranty, dimensions, weight }
    price         DECIMAL(10,2) NOT NULL,
    stock_qty     INT DEFAULT 0,
    images        TEXT[],            -- array of image URLs
    warranty      VARCHAR(100),
    is_featured   BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Cart (session-based, no user account needed)
CREATE TABLE IF NOT EXISTS store_cart (
    id            SERIAL PRIMARY KEY,
    session_id    VARCHAR(64) NOT NULL,
    product_id    INT NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    qty           INT DEFAULT 1,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS store_reviews (
    id            SERIAL PRIMARY KEY,
    product_id    INT NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    author        VARCHAR(100) DEFAULT 'Anonymous',
    rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_store_products_type ON store_products(store_type);
CREATE INDEX IF NOT EXISTS idx_store_products_category ON store_products(category);
CREATE INDEX IF NOT EXISTS idx_store_cart_session ON store_cart(session_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_product ON store_reviews(product_id);

-- ===== SEED DATA =====

-- RO Water Systems
INSERT INTO store_products (store_type, name, category, brand, model, description, features, specs, price, stock_qty, images, warranty, is_featured) VALUES
('ro', 'Aquaguard Marvel 8L', 'Domestic RO', 'Aquaguard', 'Marvel 8L', 'Advanced RO+UV+MTDS purification with 8L storage tank. Suitable for municipal and borewell water.', 'RO + UV + MTDS Purification, 8L Storage Tank, 15L/hr Purification, TDS Controller, LED Display, Child Lock', '{"capacity":"8L","purification_rate":"15L/hr","power":"36W","weight":"8.5kg"}', 14999.00, 25, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'], '1 Year', true),
('ro', 'Kent Grand Plus 8L', 'Domestic RO', 'Kent', 'Grand Plus', 'RO+UV+UF+TDS controller with 8L tank. Mineral RO technology retains essential minerals.', 'Mineral RO Technology, UV + UF, 8L Tank, 20L/hr, TDS Controller, Auto On/Off, Wall Mount', '{"capacity":"8L","purification_rate":"20L/hr","power":"60W","weight":"9kg"}', 16990.00, 18, ARRAY['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400','https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], '1 Year', true),
('ro', 'Livpure Glo 7L', 'Domestic RO', 'Livpure', 'Glo', 'Stylish RO+UV+UF purifier with 7L tank. Copper charge technology for health benefits.', 'Copper Charge Tech, RO + UV + UF, 7L Tank, 12L/hr, Taste Enhancer, Slim Design', '{"capacity":"7L","purification_rate":"12L/hr","power":"36W","weight":"7kg"}', 12499.00, 30, ARRAY['https://images.unsplash.com/photo-1571844307880-751c6d86f3f0?w=400'], '1 Year', false),
('ro', 'Pureit Advanced Pro', 'Domestic RO', 'Pureit', 'Advanced Pro', 'Elegant RO+UV+MP desktop design with 6-stage purification.', '6-Stage Purification, RO + UV + MP, 5L Tank, 10L/hr, Compact Desktop, Mineral Enrichment', '{"capacity":"5L","purification_rate":"10L/hr","power":"48W","weight":"6.2kg"}', 10999.00, 22, ARRAY['https://images.unsplash.com/photo-1548366565-6bbab241282d?w=400'], '1 Year', false),
('ro', 'Commercial RO 100LPH', 'Commercial RO', 'Aquafresh', 'CRO-100', 'Heavy-duty commercial RO plant for offices, restaurants, and small industries.', '100 LPH Output, Stainless Steel Frame, 4 Membranes, Pre-treatment Included, Auto Flush', '{"capacity":"100L","purification_rate":"100L/hr","power":"250W","weight":"35kg"}', 45000.00, 5, ARRAY['https://images.unsplash.com/photo-1621277224630-81d5af998ed3?w=400'], '2 Years', true),
('ro', 'Industrial RO 500LPH', 'Industrial RO', 'Aquafresh', 'IRO-500', 'Large-scale RO plant for factories, hospitals, and apartment complexes.', '500 LPH Output, FRP Vessel, PLC Controlled, 8 Membranes, Chemical Dosing, CIP System', '{"capacity":"500L","purification_rate":"500L/hr","power":"1500W","weight":"120kg"}', 185000.00, 2, ARRAY['https://images.unsplash.com/photo-1621277224630-81d5af998ed3?w=400'], '3 Years', false),
('ro', 'Sediment Filter 10" Set of 3', 'Filters', 'Aquaguard', 'SF-10', 'High-quality 5-micron spun polypropylene sediment filter. Pack of 3.', '5 Micron Filtration, Spun PP, 10-inch Standard, Removes Dirt/Sand/Rust, Universal Fit', '{"dimensions":"10 x 2.5 inch","life":"3-6 months"}', 399.00, 100, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, false),
('ro', 'Carbon Block Filter', 'Filters', 'Kent', 'CB-10', 'Activated carbon block filter for chlorine, odour, and taste removal.', 'Activated Carbon Block, 5 Micron, Chlorine Removal, Taste & Odour, 10-inch Standard', '{"dimensions":"10 x 2.5 inch","life":"6 months"}', 599.00, 80, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, false),
('ro', 'RO Membrane 75 GPD', 'Membranes', 'Dow Filmtec', 'TW30-1812-75', 'Premium thin-film composite RO membrane, 75 gallons per day. Industry standard.', '75 GPD, TFC Membrane, 98% TDS Rejection, NSF Certified, Universal Size', '{"dimensions":"12 x 1.8 inch","life":"2-3 years","rejection_rate":"98%"}', 1499.00, 50, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, true),
('ro', 'UV Lamp 11W', 'UV Lamps', 'Philips', 'TUV-11W', '11W UV-C germicidal lamp for water sterilisation systems.', '11W UV-C, 254nm Wavelength, 8000hr Life, Quartz Glass, 4-pin Base', '{"length":"21.5cm","life":"8000 hours","voltage":"230V"}', 799.00, 40, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, false),
('ro', 'Booster Pump 24V', 'Pumps', 'Aquatec', 'CDP 8800', 'High-pressure 24V DC booster pump for RO systems. Quiet operation.', '24V DC, 100 PSI Max, 0.8LPM Flow, Quiet <45dB, 3/8 NPT Ports, Auto Shut-off', '{"voltage":"24V DC","pressure":"100 PSI","flow":"0.8 LPM","noise":"<45dB"}', 2499.00, 35, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], '6 Months', false),
('ro', 'RO Faucet Chrome', 'Faucets', 'Generic', 'RF-360', '360-degree swivel chrome-plated brass faucet with ceramic disc valve.', '360 Swivel, Chrome Plated Brass, Ceramic Disc Valve, 1/4 Quick Connect, Elegant Design', '{"material":"Brass","finish":"Chrome","connection":"1/4 inch"}', 499.00, 60, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, false),
('ro', 'Storage Tank 12L', 'Tanks', 'Aquaguard', 'T-12', 'Food-grade plastic storage tank with float valve for RO systems.', '12L Capacity, Food Grade Plastic, Float Valve Included, Pressurised, White', '{"capacity":"12L","material":"Food Grade Plastic","pressure":"Pre-pressurized"}', 1799.00, 15, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], '1 Year', false),
('ro', 'Service Kit Complete', 'Service Kits', 'Aquaguard', 'SK-100', 'Complete annual service kit — sediment, carbon, post-carbon, membrane, sanitizer.', 'All Filters Included, Membrane, Sanitizer, O-rings, Connectors, DIY Guide', NULL, 2499.00, 20, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, true),
('ro', 'Filter Housing 10"', 'Housings', 'Generic', 'FH-10', 'Standard 10-inch filter housing with pressure relief button.', '10-inch Standard, 1/4 Ports, Pressure Relief, Clear/White Options, Wall Mount Bracket', '{"size":"10 inch","ports":"1/4 inch","pressure":"125 PSI max"}', 699.00, 45, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], NULL, false);

-- UPS & Battery Store
INSERT INTO store_products (store_type, name, category, brand, model, description, features, specs, price, stock_qty, images, warranty, is_featured) VALUES
('ups', 'PowerZone 1100VA Home UPS', 'Home UPS', 'PowerZone', 'PZ-1100', 'Reliable 1100VA / 660W home UPS with pure sinewave output. Ideal for home and small office.', 'Pure Sinewave, 1100VA/660W, LCD Display, Auto Bypass, Overload Protection, 2 Batteries Supported', '{"capacity":"1100VA","wattage":"660W","voltage":"12V","backup":"2-4 hrs","weight":"8kg"}', 5499.00, 20, ARRAY['https://images.unsplash.com/photo-1615799998702-0b3e5a5e0d9f?w=400','https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'], '2 Years', true),
('ups', 'PowerZone 1500VA UPS', 'Office UPS', 'PowerZone', 'PZ-1500', 'Premium 1500VA UPS for office and commercial use. Supports up to 4 computers.', 'Pure Sinewave, 1500VA/900W, Intelligent Battery Management, Cold Start, USB Monitoring', '{"capacity":"1500VA","wattage":"900W","voltage":"24V","backup":"3-6 hrs","weight":"12kg"}', 8999.00, 15, ARRAY['https://images.unsplash.com/photo-1615799998702-0b3e5a5e0d9f?w=400'], '2 Years', true),
('ups', 'Luminous EcoVolt 1050', 'Home UPS', 'Luminous', 'EcoVolt 1050', 'Eco-friendly home UPS with 1050VA capacity. Compatible with tubular and flat plate batteries.', 'Eco Mode, 1050VA, 32A Charging, Overload Protection, Short Circuit Protection, Wall Mount', '{"capacity":"1050VA","voltage":"12V","charging":"32A","weight":"9.5kg"}', 6299.00, 18, ARRAY['https://images.unsplash.com/photo-1615799998702-0b3e5a5e0d9f?w=400'], '2 Years', false),
('ups', 'APC Back-UPS 600VA', 'Office UPS', 'APC', 'BX600C-IN', 'Compact 600VA UPS for routers, small networking, and single PC setups.', '600VA/360W, 3 Surge Protected Outlets, Automatic Voltage Regulation, Compact Design', '{"capacity":"600VA","wattage":"360W","voltage":"12V","backup":"30 min","weight":"4.3kg"}', 2999.00, 25, ARRAY['https://images.unsplash.com/photo-1615799998702-0b3e5a5e0d9f?w=400'], '2 Years', false),
('ups', 'PowerZone 200AH Tubular Battery', 'Tubular Batteries', 'PowerZone', 'PZTB-200', 'Heavy-duty 200AH tall tubular battery. 5 year design life. Perfect for solar and inverter use.', 'C10 Rated 200AH, Tall Tubular, Low Maintenance, 5 Year Design Life, Fast Charging, Leak Proof', '{"capacity":"200AH","voltage":"12V","type":"Tall Tubular","life":"5 Years","weight":"58kg"}', 15999.00, 10, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], '5 Years', true),
('ups', 'Exide Invamaster 150AH', 'Tubular Batteries', 'Exide', 'IMTT-1500', 'Exide 150AH tall tubular battery. Reliable backup for 4-6 hours.', 'C10 Rated 150AH, Tall Tubular, Heavy Duty, Deep Cycle, Low Water Loss', '{"capacity":"150AH","voltage":"12V","type":"Tall Tubular","life":"4 Years","weight":"48kg"}', 12999.00, 12, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], '4 Years', false),
('ups', 'Amaron 100AH Flat Plate', 'Flat Plate Batteries', 'Amaron', 'AR100TN42', 'Amaron Hi-Life 100AH flat plate battery. Zero maintenance, 3 year warranty.', 'Zero Maintenance, Flat Plate Technology, 100AH, High Cranking, 3 Year Pro-rated Warranty', '{"capacity":"100AH","voltage":"12V","type":"Flat Plate","life":"3 Years","weight":"32kg"}', 8999.00, 15, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], '3 Years', false),
('ups', 'PowerZone 150AH SMF Battery', 'SMF Batteries', 'PowerZone', 'PZSMF-150', 'Sealed maintenance-free 150AH battery. Ideal for online UPS and telecom applications.', '150AH, SMF VRLA Technology, Zero Maintenance, Leak & Spill Proof, 5+ Years Float Life', '{"capacity":"150AH","voltage":"12V","type":"SMF VRLA","life":"5 Years","weight":"45kg"}', 11500.00, 8, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], '3 Years', false),
('ups', 'Battery Charger 12V/10A', 'Battery Chargers', 'PowerZone', 'PZBC-10A', 'Smart automatic 12V 10A battery charger with multi-stage charging.', 'Auto Multi-Stage, 12V 10A, Reverse Polarity Protection, LED Status, Spark Proof', '{"voltage":"12V","current":"10A","stages":"3-Stage","suitable":"Up to 200AH"}', 1499.00, 30, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], '1 Year', false),
('ups', 'Battery Terminal Protector Spray', 'Battery Accessories', 'Generic', 'BT-Protect', 'Anti-corrosion terminal protector spray. Prevents sulfate build-up and extends battery life.', 'Anti-Corrosion, Reduces Resistance, 200ml Spray Can, Extends Battery Life', NULL, 299.00, 60, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], NULL, false),
('ups', 'Stabilizer 4KVA', 'Stabilizers', 'V-Guard', 'Digi 200', 'Digital 4KVA stabilizer for home appliances. Wide input range with smart time delay.', '4KVA Capacity, 150-280V Input, Digital Display, Time Delay, MCB Protection, Wall Mount', '{"capacity":"4KVA","input_range":"150-280V","output":"230V +/- 5%","weight":"12kg"}', 4599.00, 12, ARRAY['https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400'], '2 Years', false),
('ups', 'PowerZone 850VA Inverter', 'Inverters', 'PowerZone', 'PZI-850', '850VA pure sinewave inverter with in-built charger. Compact and efficient design.', 'Pure Sinewave, 850VA/510W, Digital Display, Solar Ready, Auto Changeover, Silent Operation', '{"capacity":"850VA","wattage":"510W","voltage":"12V","weight":"6.5kg"}', 4499.00, 14, ARRAY['https://images.unsplash.com/photo-1615799998702-0b3e5a5e0d9f?w=400'], '2 Years', false);

-- Reviews
INSERT INTO store_reviews (product_id, author, rating, comment) VALUES
(1, 'Rahul M.', 5, 'Excellent purifier! Water quality improved drastically. Installation was smooth.'),
(1, 'Priya S.', 4, 'Good product, but the storage tank could be larger. Purification is top-notch.'),
(2, 'Amit K.', 5, 'Kent Grand Plus is worth every rupee. Mineral RO tech is amazing.'),
(5, 'Restaurant Owner', 5, 'Using this for our restaurant. 100LPH is perfect for daily needs.'),
(16, 'Vikram R.', 5, 'PowerZone UPS saved us during last week''s power cut. Pure sinewave output runs my PC smoothly.'),
(16, 'Suresh N.', 4, 'Good value for money. Installation was easy. Works well with my existing battery.'),
(20, 'Deepak G.', 5, 'This 200AH tubular battery is a beast. 8+ hours backup with moderate load.'),
(20, 'Manoj T.', 4, 'Heavy but solid build quality. Expecting long life from this PowerZone battery.');
