import { Router } from 'express';
import { signup, signin, getMe } from '../controller/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const userRouter = Router();

// Public routes
userRouter.post('/signup', signup);
userRouter.post('/signin', signin);

// Protected routes
userRouter.get('/me', authenticate, getMe);

export default userRouter;
