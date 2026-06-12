import api from "../services/api";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  return api.post("/auth/register", data);
};

export const login = async (data: LoginData) => {
  return api.post("/auth/login", data);
};