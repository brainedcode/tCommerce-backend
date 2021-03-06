import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { BaseReviewService } from '../base-review/base-review.service';
import { AdminProductReviewDto } from '../../shared/dtos/admin/product-review.dto';
import { ProductReview, ProductReviewComment } from './models/product-review.model';
import { ProductService } from '../../product/services/product.service';
import { ClientSession, FilterQuery } from 'mongoose';
import { CounterService } from '../../shared/services/counter/counter.service';
import { MediaService } from '../../shared/services/media/media.service';
import { ElasticProductReviewModel } from './models/elastic-product-review.model';
import { SearchService } from '../../shared/services/search/search.service';
import { plainToClass } from 'class-transformer';
import { ClientAddProductReviewCommentDto } from '../../shared/dtos/client/product-review-comment.dto';
import { ClientAddProductReviewDto } from '../../shared/dtos/client/add-product-review.dto';
import { __ } from '../../shared/helpers/translate/translate.function';
import { EmailService } from '../../email/email.service';
import { ProductQuickReviewService } from './product-quick-review.service';
import { ProductQuickReview } from './models/product-quick-review.model';

interface RatingInfo {
  allReviewsCount: number;
  textReviewsCount: number;
  reviewsAvgRating: number;
}

@Injectable()
export class ProductReviewService extends BaseReviewService<ProductReview, AdminProductReviewDto> {

  get collectionName(): string { return ProductReview.collectionName; }
  protected ElasticReview = ElasticProductReviewModel;
  protected logger = new Logger(ProductReviewService.name);

  constructor(
    @InjectModel(ProductReview.name) protected readonly reviewModel: ReturnModelType<typeof ProductReview>,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    protected readonly quickReviewService: ProductQuickReviewService,
    protected readonly searchService: SearchService,
    protected readonly counterService: CounterService,
    protected readonly emailService: EmailService,
    protected readonly mediaService: MediaService
  ) {
    super();
  }

  async findReviewsByProductId(productId: number,
                               onlyEnabled: boolean,
                               ipAddress?: string,
                               userId?: string,
                               customerId?: number
  ): Promise<AdminProductReviewDto[]> {

    const conditions: FilterQuery<ProductReview> = { productId };
    if (onlyEnabled) { conditions.isEnabled = true; }

    const createdAtProp: keyof ProductReview = 'createdAt';
    const found = await this.reviewModel.find(conditions).sort({ [createdAtProp]: -1 }).exec();
    return found.map(review => this.transformReviewToDto(review, ipAddress, userId, customerId, onlyEnabled));
  }

  async createReview(reviewDto: AdminProductReviewDto | ClientAddProductReviewDto): Promise<AdminProductReviewDto> {
    const review = await super.createReview((reviewDto as AdminProductReviewDto), (review: ProductReview, session) => this.productService.updateReviewRating(review.productId, session));
    this.emailService.sendNewProductReviewEmail(review).then();
    return review;
  }

  async createReviewFromEmail(reviewDto: ClientAddProductReviewDto): Promise<string> {
    await this.createReview(reviewDto);
    const product = await this.productService.getProductWithQtyById(reviewDto.productId);
    return product.variants.find(v => v._id.equals(reviewDto.productVariantId)).slug;
  }

  async updateReview(reviewId: string, reviewDto: AdminProductReviewDto): Promise<AdminProductReviewDto> {
    const onEnable = (review: ProductReview, session) => this.productService.updateReviewRating(review.productId, session);
    const onDisable = (review: ProductReview, session) => this.productService.updateReviewRating(review.productId, session);

    return super.updateReview(reviewId, reviewDto, { onEnable, onDisable });
  }

  async deleteReview(reviewId: string): Promise<AdminProductReviewDto> {
    return super.deleteReview(
      reviewId,
      (review: ProductReview, session) => this.productService.updateReviewRating(review.productId, session)
    );
  }

  async deleteReviewsByProductId(productId: number, session: ClientSession) {
    return this.reviewModel.deleteMany({ productId }).session(session).exec();
  }

  transformReviewToDto(
    review: DocumentType<ProductReview>,
    ipAddress?: string,
    userId?: string,
    customerId?: number,
    onlyEnabled?: boolean
  ): AdminProductReviewDto {
    review = review.toJSON();

    const comments = onlyEnabled ? review.comments.filter(c => c.isEnabled) : review.comments;
    const transformed = {
      ...review,
      comments,
      votesCount: review.votes.length,
      hasClientVoted: this.hasVoted(review, ipAddress, userId, customerId)
    } as any;

    return plainToClass(AdminProductReviewDto, transformed, { excludeExtraneousValues: true });
  }

  async addComment(reviewId: number, commentDto: ClientAddProductReviewCommentDto, customerId: any): Promise<DocumentType<ProductReview>> {
    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) {
      throw new NotFoundException(__('Review with id "$1" not found', 'ru', reviewId));
    }

    const comment = new ProductReviewComment();
    Object.assign(comment, commentDto);
    comment.createdAt = new Date();

    if (customerId) {
      comment.customerId = customerId;
    }

    review.comments.push(comment);
    await review.save();

    return review;
  }

  async getRatingInfo(productId: number, session: ClientSession): Promise<RatingInfo> {
    const reviews = await this.reviewModel.find({ productId }).session(session);
    const quickReviews = await this.quickReviewService.findByProductId(productId, session);

    const accumulateRating = (acc, review: ProductReview | ProductQuickReview) => acc + review.rating;
    const reviewsRatingSum = reviews.reduce(accumulateRating, 0);
    const quickReviewsRatingSum = quickReviews.reduce(accumulateRating, 0);

    const allReviewsCount = reviews.length + quickReviews.length;

    let reviewsAvgRating: number = null;
    if (allReviewsCount) {
      reviewsAvgRating = (reviewsRatingSum + quickReviewsRatingSum) / allReviewsCount;
    }

    return {
      allReviewsCount,
      textReviewsCount: reviews.length,
      reviewsAvgRating
    }
  }
}
