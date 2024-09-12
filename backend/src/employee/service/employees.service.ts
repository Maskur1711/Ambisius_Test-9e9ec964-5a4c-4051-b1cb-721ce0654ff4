/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { CreateEmployeeDto } from "../dto/create-employee.dto";
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from "../entities/employee.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class EmployeesService {
    private employees: Employee[] = [];

    create(createEmployeeDto: CreateEmployeeDto): Employee {
        const newEmployee = { id: uuidv4(), ...createEmployeeDto };
        this.employees.push(newEmployee);
        return newEmployee;
    }

    findAll(): Employee[] {
        return this.employees;
    }

    findOne(id: string): Employee {
        return this.employees.find(employee => employee.id === id);
    }

    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Employee {
        const employeeIndex = this.employees.findIndex(emp => emp.id === id);
        if (employeeIndex !== -1) {
            this.employees[employeeIndex] = { ...this.employees[employeeIndex], ...updateEmployeeDto };
            return this.employees[employeeIndex];
        }
        return null;
    }

    removeAll(): { success: boolean, message: string } {
        if (this.employees.length === 0) {
            return { success: false, message: 'No employees to delete' };
        }

        this.employees = []; 
        return { success: true, message: 'All employees deleted successfully' };
    }
}
