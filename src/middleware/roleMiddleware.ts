import { NextFunction, Request, Response } from 'express';
import verifyToken from '../utils/verifyToken';

export default (role: number) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.headers['authorization']?.split(' ')[1];
			if (!token) {
				return res.status(401).json({ message: 'Пользователь не авторизован' });
			}
			const decoded = verifyToken(token);

			if ((decoded.role & role) !== role) {
				return res.status(403).json({ message: 'Доступ запрещен' });
			}

			next();
		} catch (e) {
			res.status(401).json({ message: 'Пользователь не авторизован' });
		}
	};
};
