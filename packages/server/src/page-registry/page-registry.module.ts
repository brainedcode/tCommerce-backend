import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageRegistry } from './models/page-registry.model';
import { PageRegistryService } from './page-registry.service';
import { PageRegistryController } from './page-registry.controller';

const pageRegistryModel = {
  name: PageRegistry.model.modelName,
  schema: PageRegistry.model.schema,
  collection: PageRegistry.collectionName
};

@Module({
  imports: [
    MongooseModule.forFeature([pageRegistryModel])
  ],
  providers: [
    PageRegistryService
  ],
  exports: [
    PageRegistryService
  ],
  controllers: [
    PageRegistryController
  ]
})
export class PageRegistryModule {}
