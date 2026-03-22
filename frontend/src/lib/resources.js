import api from './api';

const buildResource = (basePath) => ({
  list: () => api.get(basePath).then((res) => res.data),
  get: (id) => api.get(`${basePath}/${id}`).then((res) => res.data),
  create: (payload) => api.post(basePath, payload).then((res) => res.data),
  update: (id, payload) => api.put(`${basePath}/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`${basePath}/${id}`),
});

export const clientApi = buildResource('/clients');
export const supplierApi = buildResource('/suppliers');
export const serviceApi = buildResource('/services');
export const appointmentApi = buildResource('/appointments');
export const invoiceApi = buildResource('/invoices');

export const productApi = {
  ...buildResource('/products'),
  getLowStock: () => api.get('/products/low-stock').then((res) => res.data),
  adjustStock: (id, quantity, reason) => api.post(`/products/${id}/adjust-stock`, { quantity, reason }).then((res) => res.data),
};

export const purchaseApi = {
  ...buildResource('/purchases'),
  getStats: () => api.get('/purchases/stats').then((res) => res.data),
  getBySupplier: (supplierId) => api.get(`/purchases/supplier/${supplierId}`).then((res) => res.data),
};

export const accountingApi = {
  getSummary: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/accounting/summary?${params}`).then((res) => res.data);
  },
  getMonthly: (year) => {
    const params = year ? `?year=${year}` : '';
    return api.get(`/accounting/monthly${params}`).then((res) => res.data);
  },
  getReport: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/accounting/report?${params}`).then((res) => res.data);
  },
  getTopClients: (limit, startDate, endDate) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/accounting/top-clients?${params}`).then((res) => res.data);
  },
  getTopSuppliers: (limit, startDate, endDate) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/accounting/top-suppliers?${params}`).then((res) => res.data);
  },
};

export const statsApi = {
  get: () => api.get('/stats').then((res) => res.data),
};
