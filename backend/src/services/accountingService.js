import db from '../db/index.js';
import dayjs from 'dayjs';

/**
 * Service de comptabilité simplifié pour M.Y COIFFURE
 * Calcule les revenus (factures payées) et dépenses (achats fournisseurs)
 */

export const getAccountingSummary = (startDate = null, endDate = null) => {
  const start = startDate || dayjs().startOf('year').format('YYYY-MM-DD');
  const end = endDate || dayjs().endOf('year').format('YYYY-MM-DD');

  // Revenus : Factures payées
  const revenuesStmt = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(total), 0) as total
    FROM invoices
    WHERE status = 'paid'
    AND date(issued_at) BETWEEN date(?) AND date(?)
  `);
  const revenues = revenuesStmt.get(start, end);

  // Dépenses : Achats fournisseurs
  const expensesStmt = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as total
    FROM purchases
    WHERE date(purchase_date) BETWEEN date(?) AND date(?)
  `);
  const expenses = expensesStmt.get(start, end);

  // Factures non réglées
  const unpaidStmt = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(total), 0) as total
    FROM invoices
    WHERE status = 'unpaid'
    AND date(issued_at) BETWEEN date(?) AND date(?)
  `);
  const unpaid = unpaidStmt.get(start, end);

  const result = revenues.total - expenses.total;

  return {
    period: { start, end },
    revenues: {
      count: revenues.count,
      total: revenues.total,
    },
    expenses: {
      count: expenses.count,
      total: expenses.total,
    },
    unpaid: {
      count: unpaid.count,
      total: unpaid.total,
    },
    result,
    resultLabel: result >= 0 ? 'Bénéfice' : 'Perte',
  };
};

export const getMonthlyBreakdown = (year = null) => {
  const targetYear = year || dayjs().year();
  
  const monthlyStmt = db.prepare(`
    SELECT 
      strftime('%Y-%m', issued_at) as month,
      COUNT(*) as invoices_count,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as revenues
    FROM invoices
    WHERE strftime('%Y', issued_at) = ?
    GROUP BY month
    ORDER BY month
  `);

  const purchasesStmt = db.prepare(`
    SELECT 
      strftime('%Y-%m', purchase_date) as month,
      COUNT(*) as purchases_count,
      COALESCE(SUM(total_amount), 0) as expenses
    FROM purchases
    WHERE strftime('%Y', purchase_date) = ?
    GROUP BY month
    ORDER BY month
  `);

  const revenues = monthlyStmt.all(String(targetYear));
  const expenses = purchasesStmt.all(String(targetYear));

  // Fusionner les données par mois
  const months = [];
  for (let i = 1; i <= 12; i++) {
    const monthKey = `${targetYear}-${String(i).padStart(2, '0')}`;
    const revenueData = revenues.find((r) => r.month === monthKey) || { revenues: 0, invoices_count: 0 };
    const expenseData = expenses.find((e) => e.month === monthKey) || { expenses: 0, purchases_count: 0 };

    months.push({
      month: monthKey,
      monthLabel: dayjs(monthKey).format('MMM YYYY'),
      revenues: revenueData.revenues,
      expenses: expenseData.expenses,
      result: revenueData.revenues - expenseData.expenses,
      invoicesCount: revenueData.invoices_count,
      purchasesCount: expenseData.purchases_count,
    });
  }

  return {
    year: targetYear,
    months,
  };
};

export const getDetailedReport = (startDate = null, endDate = null) => {
  const start = startDate || dayjs().startOf('month').format('YYYY-MM-DD');
  const end = endDate || dayjs().endOf('month').format('YYYY-MM-DD');

  // Factures payées détaillées
  const invoicesStmt = db.prepare(`
    SELECT 
      i.id,
      i.total,
      i.status,
      i.issued_at,
      c.name as client_name,
      a.scheduled_at,
      s.name as service_name
    FROM invoices i
    LEFT JOIN appointments a ON i.appointment_id = a.id
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE date(i.issued_at) BETWEEN date(?) AND date(?)
    ORDER BY i.issued_at DESC
  `);
  const invoices = invoicesStmt.all(start, end);

  // Achats détaillés
  const purchasesStmt = db.prepare(`
    SELECT 
      p.id,
      p.total_amount,
      p.purchase_date,
      p.payment_method,
      p.invoice_reference,
      s.name as supplier_name
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE date(p.purchase_date) BETWEEN date(?) AND date(?)
    ORDER BY p.purchase_date DESC
  `);
  const purchases = purchasesStmt.all(start, end);

  return {
    period: { start, end },
    invoices,
    purchases,
  };
};

export const getTopClients = (limit = 5, startDate = null, endDate = null) => {
  const start = startDate || dayjs().startOf('year').format('YYYY-MM-DD');
  const end = endDate || dayjs().endOf('year').format('YYYY-MM-DD');

  const stmt = db.prepare(`
    SELECT 
      c.name as client_name,
      COUNT(i.id) as invoices_count,
      COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END), 0) as total_paid
    FROM invoices i
    LEFT JOIN appointments a ON i.appointment_id = a.id
    LEFT JOIN clients c ON a.client_id = c.id
    WHERE date(i.issued_at) BETWEEN date(?) AND date(?)
    GROUP BY c.id
    ORDER BY total_paid DESC
    LIMIT ?
  `);

  return stmt.all(start, end, limit);
};

export const getTopSuppliers = (limit = 5, startDate = null, endDate = null) => {
  const start = startDate || dayjs().startOf('year').format('YYYY-MM-DD');
  const end = endDate || dayjs().endOf('year').format('YYYY-MM-DD');

  const stmt = db.prepare(`
    SELECT 
      s.name as supplier_name,
      COUNT(p.id) as purchases_count,
      COALESCE(SUM(p.total_amount), 0) as total_spent
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE date(p.purchase_date) BETWEEN date(?) AND date(?)
    GROUP BY p.supplier_id
    ORDER BY total_spent DESC
    LIMIT ?
  `);

  return stmt.all(start, end, limit);
};
