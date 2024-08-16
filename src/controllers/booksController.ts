import { NextFunction, Request, Response } from 'express';
import { prisma } from '../app';
import ApiError from '../errors/ApiError';

export const getAll = async (reg: Request, res: Response) => {
	const books = await prisma.book.findMany();
	return res.json(books);
};

export const create = async (req: Request, res: Response) => {
	const { title, author, publicationDate, genres } = req.body;

	const book = await prisma.book.create({
		data: {
			title,
			author,
			publicationDate: new Date(publicationDate),
			genres,
		},
	});
	return res.json(book);
};

export const getOne = async (req: Request, res: Response) => {
	const { id } = req.params;

	const book = await prisma.book.findFirst({ where: { id: +id } });
	return res.json(book);
};

export const update = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { title, author, publicationDate, genres } = req.body;

	const book = await prisma.book.update({
		where: { id: +id },
		data: {
			title,
			author,
			publicationDate: new Date(publicationDate),
			genres,
		},
	});
	return res.json(book);
};

interface CustomError extends Error {
	code?: string;
}

export const remove = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	try {
		const deletedBook = await prisma.book.delete({ where: { id: +id } });
		return res
			.status(200)
			.json({ message: 'Книга успешно удалена', book: deletedBook });
	} catch (error) {
		const customError = error as CustomError;

		if (customError.code === 'P2025') {
			// Код ошибки, если запись не найдена
			return next(ApiError.badRequest('Книга не найдена'));
		}
		return next(ApiError.internal('Произошла ошибка при удалении книги'));
	}
};
