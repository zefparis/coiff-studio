import { Router } from 'express';
import * as productsController from '../controllers/productsController.js';

const router = Router();

router.get('/', productsController.list);
router.get('/low-stock', productsController.lowStock);
router.get('/:id', productsController.getOne);
router.post('/', productsController.create);
router.put('/:id', productsController.update);
router.delete('/:id', productsController.remove);
router.post('/:id/adjust-stock', productsController.adjustStock);

export default router;
