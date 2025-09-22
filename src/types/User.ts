export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  age: string; // String for form input, converted to number
}