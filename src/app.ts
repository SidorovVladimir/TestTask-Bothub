import 'dotenv/config';
import express from 'express';
import router from './routes';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import errorHandler from './middleware/errorHandlingMiddleware';

const app = express();
export const prisma = new PrismaClient();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use('/', router);
app.use(errorHandler);

const start = async () => {
	try {
		await prisma.$connect();
		app.listen(port, () => {
			console.log(`server is listening on ${port}`);
		});
	} catch (e) {
		console.log('Errors started DateBase');
		console.log(e);
	}
};

start();
