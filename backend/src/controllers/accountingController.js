import * as accountingService from '../services/accountingService.js';

export const getSummary = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = accountingService.getAccountingSummary(startDate, endDate);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

export const getMonthly = (req, res, next) => {
  try {
    const { year } = req.query;
    const data = accountingService.getMonthlyBreakdown(year ? Number(year) : null);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getReport = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = accountingService.getDetailedReport(startDate, endDate);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const getTopClients = (req, res, next) => {
  try {
    const { limit, startDate, endDate } = req.query;
    const clients = accountingService.getTopClients(
      limit ? Number(limit) : 5,
      startDate,
      endDate
    );
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

export const getTopSuppliers = (req, res, next) => {
  try {
    const { limit, startDate, endDate } = req.query;
    const suppliers = accountingService.getTopSuppliers(
      limit ? Number(limit) : 5,
      startDate,
      endDate
    );
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};
