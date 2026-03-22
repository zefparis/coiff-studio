import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { accountingApi } from '../lib/resources.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import CollapsibleSection from '../components/CollapsibleSection.jsx';

const AccountingPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [topClients, setTopClients] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, monthlyData, clientsData, suppliersData] = await Promise.all([
        accountingApi.getSummary(period.startDate, period.endDate),
        accountingApi.getMonthly(dayjs().year()),
        accountingApi.getTopClients(5, period.startDate, period.endDate),
        accountingApi.getTopSuppliers(5, period.startDate, period.endDate),
      ]);
      setSummary(summaryData);
      setMonthly(monthlyData);
      setTopClients(clientsData);
      setTopSuppliers(suppliersData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les données comptables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handleExportPDF = async () => {
    try {
      const report = await accountingApi.getReport(period.startDate, period.endDate);
      
      const content = `
RAPPORT COMPTABLE - M.Y COIFFURE
Période : ${formatDate(period.startDate)} au ${formatDate(period.endDate)}

═══════════════════════════════════════════════════════════

RÉSUMÉ FINANCIER
───────────────────────────────────────────────────────────
Revenus (Factures payées)    : ${formatCurrency(summary.revenues.total)}
  → ${summary.revenues.count} facture(s) réglée(s)

Dépenses (Achats fournisseurs) : ${formatCurrency(summary.expenses.total)}
  → ${summary.expenses.count} achat(s)

Factures en attente          : ${formatCurrency(summary.unpaid.total)}
  → ${summary.unpaid.count} facture(s) non réglée(s)

───────────────────────────────────────────────────────────
${summary.resultLabel.toUpperCase()}                : ${formatCurrency(Math.abs(summary.result))}
═══════════════════════════════════════════════════════════

DÉTAIL DES FACTURES (${report.invoices.length})
───────────────────────────────────────────────────────────
${report.invoices.map((inv) => `
#${inv.id} - ${formatDate(inv.issued_at)}
Client    : ${inv.client_name || 'N/A'}
Service   : ${inv.service_name || 'N/A'}
Montant   : ${formatCurrency(inv.total)}
Statut    : ${inv.status === 'paid' ? 'PAYÉE' : 'NON RÉGLÉE'}
`).join('\n')}

═══════════════════════════════════════════════════════════

DÉTAIL DES ACHATS (${report.purchases.length})
───────────────────────────────────────────────────────────
${report.purchases.map((purch) => `
#${purch.id} - ${formatDate(purch.purchase_date)}
Fournisseur : ${purch.supplier_name || 'N/A'}
Montant     : ${formatCurrency(purch.total_amount)}
Paiement    : ${purch.payment_method}
${purch.invoice_reference ? `Référence  : ${purch.invoice_reference}` : ''}
`).join('\n')}

═══════════════════════════════════════════════════════════

TOP 5 CLIENTS
───────────────────────────────────────────────────────────
${topClients.map((client, idx) => `
${idx + 1}. ${client.client_name}
   ${client.invoices_count} facture(s) - ${formatCurrency(client.total_paid)}
`).join('\n')}

═══════════════════════════════════════════════════════════

TOP 5 FOURNISSEURS
───────────────────────────────────────────────────────────
${topSuppliers.map((supplier, idx) => `
${idx + 1}. ${supplier.supplier_name}
   ${supplier.purchases_count} achat(s) - ${formatCurrency(supplier.total_spent)}
`).join('\n')}

═══════════════════════════════════════════════════════════
Rapport généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}
M.Y COIFFURE - m.ycoiffure77@gmail.com - 07 89 21 38 10
═══════════════════════════════════════════════════════════
      `.trim();

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-comptable-${period.startDate}-${period.endDate}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Impossible de générer le rapport');
    }
  };

  const setPredefinedPeriod = (type) => {
    let start, end;
    switch (type) {
      case 'month':
        start = dayjs().startOf('month');
        end = dayjs().endOf('month');
        break;
      case 'quarter':
        start = dayjs().startOf('quarter');
        end = dayjs().endOf('quarter');
        break;
      case 'year':
        start = dayjs().startOf('year');
        end = dayjs().endOf('year');
        break;
      default:
        return;
    }
    setPeriod({
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
    });
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Chargement des données comptables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Finances</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Comptabilité</h2>
        <p className="text-sm sm:text-base text-slate-500">
          Vue d'ensemble de vos revenus, dépenses et résultats financiers.
        </p>
      </header>

      <section className="space-y-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Période</p>
              <p className="text-sm text-slate-600">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPredefinedPeriod('month')}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Ce mois
              </button>
              <button
                onClick={() => setPredefinedPeriod('quarter')}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Ce trimestre
              </button>
              <button
                onClick={() => setPredefinedPeriod('year')}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Cette année
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 text-xs rounded-xl bg-brand text-white hover:bg-brand-dark font-semibold"
              >
                📄 Télécharger le rapport
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-500">Date de début</label>
              <input
                type="date"
                value={period.startDate}
                onChange={(e) => setPeriod({ ...period, startDate: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Date de fin</label>
              <input
                type="date"
                value={period.endDate}
                onChange={(e) => setPeriod({ ...period, endDate: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        {summary && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Revenus</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.revenues.total)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.revenues.count} facture(s) payée(s)</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expenses.total)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.expenses.count} achat(s)</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.unpaid.total)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.unpaid.count} facture(s) non réglée(s)</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">{summary.resultLabel}</p>
                <p className={`text-2xl font-bold ${summary.result >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(summary.result))}
                </p>
                <p className="text-xs text-slate-500 mt-1">Revenus - Dépenses</p>
              </div>
            </div>

            <CollapsibleSection
              kicker="Évolution"
              title="Résultats mensuels"
              subtitle={`Année ${monthly?.year || dayjs().year()}`}
              defaultOpen={false}
            >
              <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="text-left text-slate-400 uppercase text-xs tracking-[0.2em]">
                      <tr>
                        <th className="py-2 px-2 sm:px-4">Mois</th>
                        <th className="py-2 px-2 sm:px-4">Revenus</th>
                        <th className="py-2 px-2 sm:px-4">Dépenses</th>
                        <th className="py-2 px-2 sm:px-4">Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly?.months.map((month) => (
                        <tr key={month.month} className="border-t border-slate-100">
                          <td className="py-3 px-2 sm:px-4 font-semibold text-slate-900">{month.monthLabel}</td>
                          <td className="py-3 px-2 sm:px-4 text-green-600">{formatCurrency(month.revenues)}</td>
                          <td className="py-3 px-2 sm:px-4 text-red-600">{formatCurrency(month.expenses)}</td>
                          <td className={`py-3 px-2 sm:px-4 font-semibold ${month.result >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(month.result))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CollapsibleSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CollapsibleSection
                kicker="Performance"
                title="Top 5 Clients"
                defaultOpen={false}
              >
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
                  <div className="space-y-3">
                    {topClients.map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-900">{client.client_name}</p>
                          <p className="text-xs text-slate-500">{client.invoices_count} facture(s)</p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(client.total_paid)}</p>
                      </div>
                    ))}
                    {topClients.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">Aucune donnée disponible</p>
                    )}
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                kicker="Dépenses"
                title="Top 5 Fournisseurs"
                defaultOpen={false}
              >
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
                  <div className="space-y-3">
                    {topSuppliers.map((supplier, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-900">{supplier.supplier_name}</p>
                          <p className="text-xs text-slate-500">{supplier.purchases_count} achat(s)</p>
                        </div>
                        <p className="font-bold text-red-600">{formatCurrency(supplier.total_spent)}</p>
                      </div>
                    ))}
                    {topSuppliers.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">Aucune donnée disponible</p>
                    )}
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default AccountingPage;
