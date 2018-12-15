import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ngExpressEngine } from '@nguniversal/express-engine';

import { join } from 'path';
import { AppModule } from './app.module';
import { enableProdMode } from '@angular/core';

enableProdMode();

const dist = join(process.cwd(), '..', '..', 'dist');
const port = process.env.port || 3500;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.engine('html', ngExpressEngine({ bootstrap: null }));
  app.set('views', dist);
  app.set('view engine', 'html');

  await app.listen(port, () => console.log(`It's rolling on ${port}!`));
}
bootstrap();
