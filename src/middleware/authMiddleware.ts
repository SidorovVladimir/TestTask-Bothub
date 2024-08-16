import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers['authorization']?.split(' ')[1];
		if (!token) {
			return res.status(401).json({ message: 'Пользователь не авторизован' });
		}
		next();
	} catch (e) {
		res.status(401).json({ message: 'Пользователь не авторизован' });
	}
};
