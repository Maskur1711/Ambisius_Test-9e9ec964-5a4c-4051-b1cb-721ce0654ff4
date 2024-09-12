import axios from "axios";

const API_URL = "http://localhost:1717/employees";

export const createEmployee = async (employeeData: {
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}`, employeeData);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const getAllEmployee = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const updateEmployee = async (
  id: string,
  employeeData: {
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
  }
) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee with id ${id}:`, error);
    throw error;
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    if (response.status === 200 || response.status === 204) {
      return response.data;
    } else {
      throw new Error("Failed to delete employee, server returned an error.");
    }
  } catch (error) {
    console.error(`Error removing employee with id ${id}:`, error);
    throw error;
  }
};

export const deleteAllEmployees = async () => {
  try {
    const response = await axios.delete(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Error deleting all employees:", error);
    throw error;
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/check-email`, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};
