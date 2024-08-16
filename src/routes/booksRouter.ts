import { Router } from 'express';
import {
	getAll,
	create,
	getOne,
	update,
	remove,
} from '../controllers/booksController';

import checkRole from '../middleware/roleMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import { Roles } from '../constants';

const booksRouter = Router();

booksRouter.get('/', getAll);
booksRouter.post('/', authMiddleware, checkRole(Roles.ADMIN), create);
booksRouter.get('/:id', getOne);
booksRouter.put('/:id', authMiddleware, checkRole(Roles.ADMIN), update);
booksRouter.delete('/:id', authMiddleware, checkRole(Roles.ADMIN), remove);

export default booksRouter;
