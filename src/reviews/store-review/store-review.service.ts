import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { StoreReview } from './models/store-review.model';
import { BaseReviewService } from '../base-review/base-review.service';
import { MediaService } from '../../shared/media-uploader/media-uploader/media.service';
import { StoreReviewDto } from '../../shared/dtos/admin/store-review.dto';

@Injectable()
export class StoreReviewService extends BaseReviewService<StoreReview, StoreReviewDto> {

  get collectionName(): string { return StoreReview.collectionName; }

  constructor(@InjectModel(StoreReview.name) protected readonly reviewModel: ReturnModelType<typeof StoreReview>,
              protected readonly mediaService: MediaService) {
    super();
  }

  transformReviewToDto(review: StoreReview, ipAddress?: string, userId?: string, customerId?: number): StoreReviewDto {
    return {
      ...review,
      votesCount: review.votes.length,
      hasClientVoted: this.hasVoted(review, ipAddress, userId, customerId)
    } as any;
  }
}