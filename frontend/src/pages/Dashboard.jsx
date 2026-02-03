import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { statsApi, appointmentApi } from '../lib/resources.js';
import StatsCard from '../components/StatsCard.jsx';
import CollapsibleSection from '../components/CollapsibleSection.jsx';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, appointments] = await Promise.all([statsApi.get(), appointmentApi.list()]);
        setStats(statsResponse.summary);
        setDailyRevenue(statsResponse.dailyRevenue);
        setMonthlyRevenue(statsResponse.monthlyRevenue);

        const upcoming = appointments
          .filter((appt) => dayjs(appt.scheduledAt).isAfter(dayjs().subtract(1, 'day')))
          .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf())
          .slice(0, 5);
        setUpcomingAppointments(upcoming);
      } catch (err) {
        setError(err?.response?.data?.message || 'Impossible de charger le tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pulse du studio</p>
        <h2 className="text-3xl font-semibold text-slate-900">Tableau de bord</h2>
        <p className="text-slate-500 max-w-2xl">
          Gardez un œil sur les réservations, le chiffre d'affaires et les factures en attente. Tout ce dont le salon a besoin pour anticiper la semaine.
        </p>
      </header>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Clients" value={loading ? '—' : stats?.clients ?? 0} helper="Relations actives" />
        <StatsCard label="Rendez-vous" value={loading ? '—' : stats?.appointments ?? 0} helper="Historique complet" />
        <StatsCard
          label="Chiffre d'affaires"
          value={loading ? '—' : formatCurrency(stats?.revenue || 0)}
          helper="Factures réglées"
        />
        <StatsCard
          label="En attente"
          value={loading ? '—' : formatCurrency(stats?.outstanding || 0)}
          helper="En attente de paiement"
        />
      </section>

      <section className="space-y-6">
        <CollapsibleSection kicker="Trésorerie" title="Revenu quotidien" subtitle="30 derniers jours">
          <div className="space-y-3">
            {dailyRevenue.length ? (
              dailyRevenue.map((item) => (
                <div key={item.day} className="flex items-center gap-4 flex-wrap">
                  <div className="text-xs text-slate-500 w-24">{dayjs(item.day).format('DD MMM')}</div>
                  <div className="flex-1 min-w-[180px] bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-brand-light"
                      style={{ width: `${Math.min(100, (item.revenue / (stats?.revenue || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-slate-600">
                    {formatCurrency(item.revenue || 0)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Pas encore de données de revenu.</p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection kicker="Planning" title="Rendez-vous à venir" subtitle="5 prochains">
          <div className="space-y-3">
            {upcomingAppointments.length ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {dayjs(appointment.scheduledAt).format('ddd').toUpperCase()}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {dayjs(appointment.scheduledAt).format('DD')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{appointment.clientName}</p>
                    <p className="text-sm text-slate-500">{appointment.serviceName}</p>
                    <p className="text-sm text-slate-400">{formatDateTime(appointment.scheduledAt)}</p>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatCurrency(appointment.price)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Aucun rendez-vous à venir.</p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection kicker="Tendances" title="Revenu mensuel" subtitle="12 derniers mois">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {monthlyRevenue.length ? (
              monthlyRevenue.map((month) => (
                <div key={month.month} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {dayjs(month.month).format('MMM').toUpperCase()}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(month.revenue || 0)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Pas encore de données mensuelles.</p>
            )}
          </div>
        </CollapsibleSection>
      </section>
    </div>
  );
};

export default DashboardPage;
