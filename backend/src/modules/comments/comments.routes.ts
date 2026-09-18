import { Router } from 'express';
import { addComment, getComments } from './comments.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.post('/', authenticateJWT, addComment);
router.get('/', authenticateJWT, getComments);

export default router;
