import { Router } from 'express';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../controllers/servicesController.js';

const router = Router();

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
