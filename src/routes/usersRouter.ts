import { Router } from 'express';
import {
	register,
	login,
	getInfo,
	updateRole,
	verify,
} from '../controllers/usersController';
import authMiddleware from '../middleware/authMiddleware';
import checkRole from '../middleware/roleMiddleware';
import { Roles } from '../constants';

const usersRouter = Router();

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/me', authMiddleware, getInfo);
usersRouter.put(
	'/:id/role',
	authMiddleware,
	checkRole(Roles.ADMIN),
	updateRole
);
usersRouter.get('/verify/:code', verify);

export default usersRouter;
