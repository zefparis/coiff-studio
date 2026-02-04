import { Router } from 'express';
import * as purchasesController from '../controllers/purchasesController.js';

const router = Router();

router.get('/', purchasesController.list);
router.get('/stats', purchasesController.stats);
router.get('/supplier/:supplierId', purchasesController.bySupplier);
router.get('/:id', purchasesController.getOne);
router.post('/', purchasesController.create);
router.put('/:id', purchasesController.update);
router.delete('/:id', purchasesController.remove);

export default router;
