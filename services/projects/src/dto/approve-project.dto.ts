import { IsString, IsOptional, MaxLength, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FeedbackDto {
    @IsNumber() @Min(1) @Max(5) quality: number;
    @IsNumber() @Min(1) @Max(5) communication: number;
    @IsNumber() @Min(1) @Max(5) timeliness: number;
    @IsNumber() @Min(1) @Max(5) professionalism: number;
    @IsNumber() @Min(1) @Max(5) overallSatisfaction: number;
}

class TestimonialDto {
    @IsString() @MaxLength(2000) text: string;
    @IsOptional() allowPublicUse?: boolean;
}

export class ApproveProjectDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ValidateNested()
    @Type(() => FeedbackDto)
    feedback: FeedbackDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => TestimonialDto)
    testimonial?: TestimonialDto;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    comments?: string;
}
