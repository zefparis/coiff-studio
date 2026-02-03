import { Router } from 'express';
import clientsRouter from './clients.js';
import suppliersRouter from './suppliers.js';
import servicesRouter from './services.js';
import appointmentsRouter from './appointments.js';
import invoicesRouter from './invoices.js';
import statsRouter from './stats.js';

const router = Router();

router.use('/clients', clientsRouter);
router.use('/suppliers', suppliersRouter);
router.use('/services', servicesRouter);
router.use('/appointments', appointmentsRouter);
router.use('/invoices', invoicesRouter);
router.use('/stats', statsRouter);

export default router;
