PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    scheduled_at DATETIME NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    total REAL NOT NULL CHECK(total >= 0),
    status TEXT NOT NULL CHECK(status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('coloration', 'soin', 'revente', 'equipement', 'autre')),
    supplier_id INTEGER,
    purchase_price REAL NOT NULL CHECK(purchase_price >= 0),
    sale_price REAL CHECK(sale_price >= 0),
    stock_quantity REAL NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
    alert_threshold REAL NOT NULL DEFAULT 5 CHECK(alert_threshold >= 0),
    unit TEXT NOT NULL DEFAULT 'unité',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount REAL NOT NULL CHECK(total_amount >= 0),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('especes', 'carte', 'virement', 'cheque', 'autre')) DEFAULT 'carte',
    invoice_reference TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL CHECK(unit_price >= 0),
    subtotal REAL NOT NULL CHECK(subtotal >= 0),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

INSERT INTO clients (name, phone, email, notes)
SELECT 'Alice Duval', '+33 6 12 34 56 78', 'alice@example.com', 'Prefers morning slots'
WHERE NOT EXISTS (SELECT 1 FROM clients);

INSERT INTO clients (name, phone, email, notes)
SELECT 'Bastien Leroy', '+33 6 98 76 54 32', 'bastien@example.com', 'Sensitive scalp'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Bastien Leroy');

INSERT INTO suppliers (name, phone, email, notes)
SELECT 'ColorMax', '+33 1 23 45 67 89', 'hello@colormax.fr', 'Hair dyes'
WHERE NOT EXISTS (SELECT 1 FROM suppliers);

INSERT INTO suppliers (name, phone, email, notes)
SELECT 'ProTools', '+33 1 98 76 54 32', 'sales@protools.fr', 'Equipment and scissors'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'ProTools');

INSERT INTO services (name, price, duration_minutes)
SELECT 'Coupe classique', 45.0, 45
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO services (name, price, duration_minutes)
SELECT 'Coloration complète', 120.0, 120
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Coloration complète');

INSERT INTO services (name, price, duration_minutes)
SELECT 'Brushing', 35.0, 30
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Brushing');

INSERT INTO appointments (client_id, service_id, scheduled_at, price, notes)
SELECT 1, 1, datetime('now', '+1 day'), 45.0, 'Standard cut'
WHERE NOT EXISTS (SELECT 1 FROM appointments);

INSERT INTO appointments (client_id, service_id, scheduled_at, price, notes)
SELECT 2, 2, datetime('now', '+2 days'), 130.0, 'Includes toner'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_id = 2 AND service_id = 2);

INSERT INTO invoices (appointment_id, total, status)
SELECT 1, 45.0, 'paid'
WHERE NOT EXISTS (SELECT 1 FROM invoices);

INSERT INTO invoices (appointment_id, total, status)
SELECT 2, 130.0, 'unpaid'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE appointment_id = 2);

INSERT INTO products (name, category, supplier_id, purchase_price, sale_price, stock_quantity, alert_threshold, unit, notes)
SELECT 'Coloration L''Oréal Professionnel', 'coloration', 1, 12.50, 0, 15, 5, 'tube', 'Gamme complète de couleurs'
WHERE NOT EXISTS (SELECT 1 FROM products);

INSERT INTO products (name, category, supplier_id, purchase_price, sale_price, stock_quantity, alert_threshold, unit, notes)
SELECT 'Shampooing Kérastase', 'soin', 1, 18.00, 35.00, 8, 3, 'flacon', 'Revente possible en salon'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Shampooing Kérastase');

INSERT INTO products (name, category, supplier_id, purchase_price, sale_price, stock_quantity, alert_threshold, unit, notes)
SELECT 'Ciseaux professionnels', 'equipement', 2, 85.00, 0, 3, 1, 'unité', 'Acier japonais'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ciseaux professionnels');
