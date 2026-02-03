import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import ClientsPage from './pages/Clients.jsx';
import AppointmentsPage from './pages/Appointments.jsx';
import InvoicesPage from './pages/Invoices.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
