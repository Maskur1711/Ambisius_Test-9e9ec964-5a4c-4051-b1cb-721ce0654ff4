/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    position: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    email: string;
}