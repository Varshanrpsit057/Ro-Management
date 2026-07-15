-- Optional seed data for development / demo
-- Run after schema.sql

-- Customers
INSERT INTO customers (name, phone, address) VALUES
  ('Rajesh Kumar', '9876543210', '12, Gandhi Nagar, Chennai'),
  ('Priya Sharma', '9876543211', '45, MG Road, Bangalore'),
  ('Amit Patel', '9876543212', '78, Satellite Road, Ahmedabad');

-- RO Systems
INSERT INTO ro_systems (customer_id, model_name, install_date, status, notes) VALUES
  (1, 'Aquaguard Classic', '2023-01-15', 'active', 'Annual maintenance done'),
  (1, 'Kent Grand Plus', '2024-06-01', 'active', 'New installation'),
  (2, 'Pureit Marvella', '2022-03-10', 'active', 'TDS level checked'),
  (3, 'Aquaguard Select', '2024-11-20', 'active', 'Needs filter check');

-- Products
INSERT INTO products (name, description, price, stock_qty, image_url) VALUES
  ('Sediment Filter 10"', '5-micron sediment pre-filter, standard 10-inch', 250.00, 45, ''),
  ('Carbon Block Filter', 'Activated carbon block for chlorine removal', 450.00, 30, ''),
  ('RO Membrane 75 GPD', 'Thin-film composite RO membrane, 75 gallons per day', 1200.00, 15, ''),
  ('Post Carbon Filter', 'In-line taste and odour polishing filter', 350.00, 25, ''),
  ('UF Membrane', 'Ultrafiltration hollow-fibre membrane', 800.00, 10, ''),
  ('UV Lamp 11W', '11-watt UV sterilisation lamp', 650.00, 8, '');

-- Filter Replacements (some upcoming, some overdue for demo)
INSERT INTO filter_replacements (ro_system_id, filter_type, replaced_date, next_due_date, cost, notes) VALUES
  (1, 'sediment', '2025-12-01', '2026-06-01', 250.00, 'Regular 6-month replacement'),
  (1, 'carbon', '2025-12-01', '2026-06-01', 450.00, 'Replaced together with sediment'),
  (2, 'sediment', '2026-01-15', '2026-07-15', 250.00, 'Due next week'),
  (2, 'RO_membrane', '2024-07-01', '2026-01-01', 1200.00, 'Overdue — needs immediate replacement'),
  (3, 'post_carbon', '2025-10-10', '2026-04-10', 350.00, 'Overdue'),
  (3, 'sediment', '2026-03-20', '2026-09-20', 250.00, 'Upcoming this month');

-- Service History
INSERT INTO service_history (ro_system_id, service_date, description, cost) VALUES
  (1, '2025-12-01', 'Filter replacement — sediment + carbon', 700.00),
  (1, '2025-06-01', 'Annual maintenance — TDS check and sanitisation', 500.00),
  (2, '2026-01-15', 'Sediment filter replacement', 250.00),
  (3, '2025-10-10', 'Post carbon filter replacement', 350.00);
