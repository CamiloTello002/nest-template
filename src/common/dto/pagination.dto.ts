import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
	@ApiProperty({
		default: 10,
		description: 'The amount of rows you need',
		required: false
	})
	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	@IsOptional()
	limit?: number;

	@ApiProperty({
		default: 0,
		description: 'Amount of rows you want to skip',
		required: false
	})
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	@IsOptional()
	offset?: number;
}
