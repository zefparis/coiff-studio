import * as statsService from '../services/statsService.js';

export const getStats = (req, res, next) => {
  try {
    const summary = statsService.dashboardSummary();
    const daily = statsService.revenueByDay();
    const monthly = statsService.revenueByMonth();

    res.json({ summary, dailyRevenue: daily, monthlyRevenue: monthly });
  } catch (error) {
    next(error);
  }
};
