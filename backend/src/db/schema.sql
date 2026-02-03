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
