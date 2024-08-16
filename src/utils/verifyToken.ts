import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

export interface CustomJwtPayload extends JwtPayload {
	role: number;
	id: number;
}

const verifyToken = (token: string): CustomJwtPayload => {
	const decoded = jwt.verify(
		token,
		process.env.SECRET_KEY as Secret
	) as CustomJwtPayload;
	return decoded;
};

export default verifyToken;
