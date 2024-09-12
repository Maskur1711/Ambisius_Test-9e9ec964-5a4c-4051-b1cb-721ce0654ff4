/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { EmployeesService } from '../service/employees.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeesService.create(createEmployeeDto);
    }

    @Get()
    findAll() {
        return this.employeesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        const employee = this.employeesService.findOne(id);
        if (!employee) {
            throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
        }
        return employee;
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        const updatedEmployee = this.employeesService.update(id, updateEmployeeDto);
        if (!updatedEmployee) {
            throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
        }
        return updatedEmployee;
    }

    @Delete('all')
    removeAll() {
        const result = this.employeesService.removeAll();

        if (!result.success) {
            throw new HttpException(result.message, HttpStatus.NOT_FOUND);
        }

        return { message: result.message };
    }

}
