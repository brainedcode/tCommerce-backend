import { ProductCategory } from './product-category.model';
import { elasticIntegerType, elasticKeywordType, elasticTextType } from '../../shared/constants';

export class ElasticProductCategory implements Record<keyof ProductCategory, any> {
  id = elasticKeywordType;
  name = elasticTextType;
  slug = elasticTextType;
  sortOrder = elasticIntegerType;
}
