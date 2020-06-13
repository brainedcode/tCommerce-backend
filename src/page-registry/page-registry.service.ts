import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PageRegistry } from './models/page-registry.model';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ClientSession } from 'mongoose';
import { __ } from '../shared/helpers/translate/translate.function';

@Injectable()
export class PageRegistryService {

  private logger = new Logger(PageRegistryService.name);

  constructor(@InjectModel(PageRegistry.name) private readonly registryModel: ReturnModelType<typeof PageRegistry>) {
  }

  getAllPages() {
    return this.registryModel.find();
  }

  async getPageType(slug: string): Promise<string> {
    const found = await this.registryModel.findOne({ slug: slug });

    if (!found) {
      throw new NotFoundException(__('Page with url "$1" not found', 'ru', slug));
    }

    return found.type;
  }

  async createPageRegistry(pageRegistry: PageRegistry, session: ClientSession): Promise<any> {
    const newPage = new this.registryModel({ slug: pageRegistry.slug, type: pageRegistry.type });
    await newPage.save({ session });

    if (newPage) {
      this.logger.log(`Created '${newPage.slug}' page-registry.`);
    } else {
      this.logger.error(`Could not create '${pageRegistry.slug}' in page-registry.`);
    }
    return newPage;
  }

  async updatePageRegistry(oldSlug: PageRegistry['slug'], pageRegistry: PageRegistry, session: ClientSession): Promise<any> {
    const result = await this.registryModel.findOneAndUpdate(
      { slug: oldSlug },
      { slug: pageRegistry.slug, type: pageRegistry.type },
      { new: true }
    ).session(session).exec();

    if (result) {
      this.logger.log(`Updated '${result.slug}' page-registry.`);
    } else {
      this.logger.error(`Could not update '${oldSlug}' in page-registry.`);
    }
    return result;
  }

  async deletePageRegistry(slug: PageRegistry['slug'], session: ClientSession) {
    const deleted = await this.registryModel.findOneAndDelete({ slug: slug }).session(session).exec();

    if (deleted) {
      this.logger.log(`Deleted '${deleted.slug}' from page-registry.`);
    } else {
      this.logger.error(`Could not delete '${slug}' from page-registry.`);
    }

    return deleted;
  }

  async deletePageRegistryByType(type: PageRegistry['type']) {
    const deleted = await this.registryModel.findOneAndDelete({ type: type }).exec();

    if (deleted) {
      this.logger.log(`Deleted all '${type}' pages from page-registry.`);
    } else {
      this.logger.error(`Could not delete all '${type}' from page-registry.`);
    }

    return deleted;
  }
}
