/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { EmployeesService } from '../service/employees.service';
import { EmployeesController } from '../controller/employees.controller';

@Module({
    controllers: [EmployeesController],
    providers: [EmployeesService],
})
export class EmployeesModule { }
