import * as invoiceService from '../services/invoiceService.js';

export const listInvoices = (req, res, next) => {
  try {
    const invoices = invoiceService.listInvoices();
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const getInvoice = (req, res, next) => {
  try {
    const invoice = invoiceService.getInvoiceById(Number(req.params.id));
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const createInvoice = (req, res, next) => {
  try {
    const invoice = invoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = (req, res, next) => {
  try {
    const invoice = invoiceService.updateInvoice(Number(req.params.id), req.body);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = (req, res, next) => {
  try {
    invoiceService.deleteInvoice(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
