import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { prisma } from '../app';
import verifyToken from '../utils/verifyToken';
import nodemailer from 'nodemailer';
import ApiError from '../errors/ApiError';

const generateJwt = (id: number, username: string, role: number): string => {
	return jwt.sign({ id, username, role }, process.env.SECRET_KEY as Secret, {
		expiresIn: '24h',
	});
};

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { username, email, password } = req.body;
	const verificationCode = Math.random().toString(36).slice(2);
	const hashedCode = await bcrypt.hash(verificationCode, 5);

	const candidate = await prisma.user.findUnique({ where: { email } });

	if (candidate) {
		return next(
			ApiError.badRequest('Пользователь с таким email уже существует')
		);
	}

	const hashPassword = await bcrypt.hash(password, 5);

	const user = await prisma.user.create({
		data: {
			username,
			email,
			password: hashPassword,
			verificationCode: hashedCode,
		},
	});
	await sendVerificationEmail(email, hashedCode);

	return res.json(user);
};

const sendVerificationEmail = async (email: string, code: string) => {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	const url = `http://localhost:${process.env.PORT}/users/verify/${code}`;
	await transporter.sendMail({
		to: email,
		subject: 'Подтверждение email',
		text: `Перейдите по ссылке для подтверждения: ${url}`,
	});
};

export const verifyEmail = async (code: string) => {
	const user = await prisma.user.findFirst({
		where: {
			verificationCode: code,
		},
	});

	if (user) {
		await prisma.user.update({
			where: { id: user.id },
			data: { isVerified: true },
		});
		return true;
	}

	return false;
};

export const verify = async (req: Request, res: Response) => {
	const { code } = req.params;
	const isVerified = await verifyEmail(code);

	if (isVerified) {
		res.send('Email успешно подтвержден!');
	} else {
		res.send('Неверный код подтверждения.');
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { username, password } = req.body;

	const user = await prisma.user.findUnique({ where: { username } });

	if (!user) {
		return next(ApiError.internal('Пользователь не найден!'));
	}
	const comparePassword = bcrypt.compareSync(password, user.password);

	if (!comparePassword) {
		return next(ApiError.internal('Указан неверный пароль'));
	}

	const token = generateJwt(user.id, user.username, user.role);

	return res.json({ token });
};

export const getInfo = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.headers['authorization']?.split(' ')[1];
		if (!token) {
			return next(ApiError.unauthorized('Пользователь не авторизован'));
		}
		const decoded = verifyToken(token);

		const user = await prisma.user.findUnique({ where: { id: decoded.id } });

		return res.json(user);
	} catch (e) {
		return next(ApiError.unauthorized('Пользователь не авторизован'));
	}
};

export const updateRole = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { role } = req.body;

	const user = await prisma.user.update({ where: { id: +id }, data: { role } });
	return res.json(user);
};
