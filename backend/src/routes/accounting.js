import { Router } from 'express';
import * as accountingController from '../controllers/accountingController.js';

const router = Router();

router.get('/summary', accountingController.getSummary);
router.get('/monthly', accountingController.getMonthly);
router.get('/report', accountingController.getReport);
router.get('/top-clients', accountingController.getTopClients);
router.get('/top-suppliers', accountingController.getTopSuppliers);

export default router;
