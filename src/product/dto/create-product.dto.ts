import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    stock: number;
}
