import { Router } from 'express';
import booksRouter from './booksRouter';
import usersRouter from './usersRouter';

const router = Router();

router.use('/books', booksRouter);
router.use('/users', usersRouter);

export default router;
