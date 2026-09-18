import { Router } from 'express';
import { RequestsController } from './requests.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

// Protect ALL request routes with JWT Auth
router.use(authenticateJWT);

// 1. Metadata endpoint
router.get('/meta', RequestsController.getMetadata);

// 2. User summary & My requests
router.get('/my/summary', RequestsController.getMySummary);
router.get('/my', RequestsController.getMyRequests);
router.get('/', RequestsController.getMyRequests);

// 3. Create request
router.post('/', RequestsController.createRequest);

// 4. Get specific request by ID
router.get('/:id', RequestsController.getRequestById);

export default router;
