import  {Router} from 'express'
import { signup,login, profile } from '../controllers/auth';
import { errorHandler } from '../error-handler';
import authMiddleware from '../middlewares/auth';

const authRoutes:Router = Router();

authRoutes.post('/signup',errorHandler(signup));
authRoutes.post('/login', errorHandler(login));
authRoutes.get('/profile',[authMiddleware], errorHandler(profile));

export default authRoutes;