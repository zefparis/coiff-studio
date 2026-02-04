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

export const statsApi = {
  get: () => api.get('/stats').then((res) => res.data),
};
