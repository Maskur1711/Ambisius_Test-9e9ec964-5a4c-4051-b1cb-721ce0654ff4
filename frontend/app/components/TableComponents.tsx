"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { Add, ArrowBack, Save, Delete } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import {
  getAllEmployee,
  createEmployee,
  updateEmployee,
  deleteAllEmployees,
} from "../api/EmployeeAPI";

interface Data {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: "asc" | "desc",
  orderBy: Key
) {
  return order === "desc"
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

const TableComponents: React.FC = () => {
  const [employees, setEmployees] = useState<Data[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Data>("lastName");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof Data | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // States for email validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailErrorDuplicate, setEmailErrorDuplicate] = useState<string | null>(
    null
  );
  const [errorRows, setErrorRows] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("");

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setLoadingText("Loading employees...");

      const timer = setTimeout(async () => {
        try {
          const data = await getAllEmployee();
          setEmployees(data);
        } finally {
          setLoading(false);
          setLoadingText("");
        }
      }, 500);

      return () => clearTimeout(timer);
    };

    loadEmployees();
  }, []);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditStart = (id: string, field: keyof Data, value: string) => {
    setEditingRow(id);
    setEditingField(field);
    setEditValue(value);
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEditValue(value);

    if (editingField === "email") {
      if (!validateEmail(value)) {
        setEmailError("Invalid email address");
        setEmailErrorDuplicate(null);
        setErrorRows((prev) => new Set(prev).add(editingRow || ""));
      } else if (employees.some((employee) => employee.email === value)) {
        setEmailError(null);
        setEmailErrorDuplicate("Email address already exists");
        setErrorRows((prev) => new Set(prev).add(editingRow || ""));
      } else {
        setEmailError(null);
        setEmailErrorDuplicate(null);
        setErrorRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(editingRow || "");
          return newSet;
        });
      }
    }
  };

  const handleEditSave = async (id: string) => {
    if (editingField && editingRow) {
      const employeeToUpdate = employees.find((employee) => employee.id === id);

      if (employeeToUpdate) {
        const updatedEmployee = {
          ...employeeToUpdate,
          [editingField]: editValue,
        };

        if (editingField === "email" && (emailError || emailErrorDuplicate)) {
          alert("Please fix the email errors before saving");
          return;
        }

        setLoading(true);
        setLoadingText("Saving changes...");

        // Simulate a delay for saving
        const timer = setTimeout(async () => {
          try {
            await updateEmployee(id, updatedEmployee);
            const updatedEmployees = employees.map((employee) =>
              employee.id === id ? updatedEmployee : employee
            );
            setEmployees(updatedEmployees);
          } finally {
            setLoading(false);
            setLoadingText("");
            setEditingRow(null);
            setEditingField(null);
            setEmailError(null);
            setEmailErrorDuplicate(null);
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditingField(null);
    setEditValue("");
    setEmailError(null); 
    setEmailErrorDuplicate(null); 
    setErrorRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(editingRow || "");
      return newSet;
    });
  };

  const handleAddNewEmployee = async () => {
    if (Object.values(newEmployee).some((value) => value === "")) {
      alert("Please fill in all fields");
      return;
    }

    if (emailError || emailErrorDuplicate) {
      alert("Please fix the errors before adding the employee");
      return;
    }

    setLoading(true);
    setLoadingText("Adding new employee...");

    const timer = setTimeout(async () => {
      try {
        const newEmployeeData = await createEmployee(newEmployee as Data);
        setEmployees([...employees, newEmployeeData]);
        setShowAddForm(false);
        setNewEmployee({
          firstName: "",
          lastName: "",
          position: "",
          phone: "",
          email: "",
        });
      } finally {
        setLoading(false);
        setLoadingText("");
        setEmailError(null); 
        setEmailErrorDuplicate(null); 
      }
    }, 2000);

    return () => clearTimeout(timer);
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    setLoadingText("Deleting all employees...");

    const timer = setTimeout(async () => {
      try {
        await deleteAllEmployees();
        setEmployees([]);
        alert("All employees have been deleted successfully");
      } catch (error) {
        console.error("Error deleting all employees:", error);
        alert("Failed to delete all employees");
      } finally {
        setLoading(false);
        setLoadingText("");
      }
    }, 2000);

    return () => clearTimeout(timer);
  };

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Data>>({
    firstName: "",
    lastName: "",
    position: "",
    phone: "",
    email: "",
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNewEmployee((prev) => ({
      ...prev,
      email: value,
    }));

    if (!validateEmail(value)) {
      setEmailError("Invalid email address");
    } else if (employees.some((employee) => employee.email === value)) {
      setEmailError(null);
      setEmailErrorDuplicate("Email address already exists");
    } else {
      setEmailError(null);
      setEmailErrorDuplicate(null);
    }
  };

  return (
    <Box sx={{ p: 5 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Employee List</Typography>
        <Box>
          <IconButton
            color="default"
            aria-label="add"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            <Add />
          </IconButton>
          <IconButton color="default" aria-label="save">
            <Save />
          </IconButton>
          <IconButton
            color="default"
            aria-label="delete-all"
            onClick={handleDeleteAll}
          >
            <Delete />
          </IconButton>
        </Box>
      </Toolbar>

      {showAddForm && (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="First Name"
            value={newEmployee.firstName || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, firstName: e.target.value })
            }
            sx={{ mr: 1 }}
          />
          <TextField
            label="Last Name"
            value={newEmployee.lastName || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, lastName: e.target.value })
            }
            sx={{ mr: 1 }}
          />
          <TextField
            label="Position"
            value={newEmployee.position || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, position: e.target.value })
            }
            sx={{ mr: 1 }}
          />
          <TextField
            label="Phone"
            value={newEmployee.phone || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, phone: e.target.value })
            }
            sx={{ mr: 1 }}
          />
          <TextField
            label="Email"
            value={newEmployee.email || ""}
            onChange={handleEmailChange}
            sx={{ mr: 1 }}
            error={!!emailError || !!emailErrorDuplicate}
            helperText={emailError || emailErrorDuplicate}
          />
          <Button
            onClick={handleAddNewEmployee}
            variant="contained"
            color="primary"
          >
            Add Employee
          </Button>
        </Box>
      )}

      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {loadingText}
          </Typography>
        </Box>
      )}

      {!loading && (
        <TableContainer component={Paper}>
          <Table aria-label="sortable table">
            <TableHead>
              <TableRow>
                {/* First Name */}
                <TableCell
                  sortDirection={orderBy === "firstName" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "firstName"}
                    direction={orderBy === "firstName" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "firstName")}
                  >
                    First Name
                    {orderBy === "firstName" ? (
                      <span style={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                {/* Last Name */}
                <TableCell
                  sortDirection={orderBy === "lastName" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "lastName"}
                    direction={orderBy === "lastName" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "lastName")}
                  >
                    Last Name
                    {orderBy === "lastName" ? (
                      <span style={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                {/* Position */}
                <TableCell
                  sortDirection={orderBy === "position" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "position"}
                    direction={orderBy === "position" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "position")}
                  >
                    Position
                    {orderBy === "position" ? (
                      <span style={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                {/* Phone */}
                <TableCell sortDirection={orderBy === "phone" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "phone"}
                    direction={orderBy === "phone" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "phone")}
                  >
                    Phone
                    {orderBy === "phone" ? (
                      <span style={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                {/* Email */}
                <TableCell sortDirection={orderBy === "email" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "email")}
                  >
                    Email
                    {orderBy === "email" ? (
                      <span style={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {employees
                .slice()
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell
                      onClick={() =>
                        handleEditStart(row.id, "firstName", row.firstName)
                      }
                    >
                      {editingRow === row.id && editingField === "firstName" ? (
                        <TextField
                          value={editValue}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(row.id)}
                          autoFocus
                        />
                      ) : (
                        row.firstName
                      )}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        handleEditStart(row.id, "lastName", row.lastName)
                      }
                    >
                      {editingRow === row.id && editingField === "lastName" ? (
                        <TextField
                          value={editValue}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(row.id)}
                          autoFocus
                        />
                      ) : (
                        row.lastName
                      )}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        handleEditStart(row.id, "position", row.position)
                      }
                    >
                      {editingRow === row.id && editingField === "position" ? (
                        <TextField
                          value={editValue}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(row.id)}
                          autoFocus
                        />
                      ) : (
                        row.position
                      )}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        handleEditStart(row.id, "phone", row.phone)
                      }
                    >
                      {editingRow === row.id && editingField === "phone" ? (
                        <TextField
                          value={editValue}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(row.id)}
                          autoFocus
                        />
                      ) : (
                        row.phone
                      )}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        handleEditStart(row.id, "email", row.email)
                      }
                      sx={{
                        backgroundColor: errorRows.has(row.id)
                          ? "rgba(255, 0, 0, 0.1)"
                          : "inherit",
                      }}
                    >
                      {editingRow === row.id && editingField === "email" ? (
                        <TextField
                          value={editValue}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(row.id)}
                          autoFocus
                          error={!!emailError || !!emailErrorDuplicate}
                          helperText={emailError || emailErrorDuplicate}
                        />
                      ) : (
                        row.email
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={employees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default TableComponents;
