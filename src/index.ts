import express,{Express,Request,Response} from 'express';
import { PORT } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middlewares/error';
import { SignupSchema } from './schema/users';

const app:Express = express();
app.use(express.json());


app.use('/api',rootRouter)
export const prismaClient = new PrismaClient({
  log: ["query"],
}).$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          street: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
        },
        compute: (addr) => {
          return `${addr.street}, ${addr.city}, ${addr.state}, ${addr.zipCode},${addr.country}`;
        },
      },
    },
  },
});

app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});