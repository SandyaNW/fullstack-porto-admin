import { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { API_URL } from "./config";

export const authProvider: AuthProvider = {
  login: async ({ email, password }: any) => {
    try {
      // PERBAIKAN: Gunakan URLSearchParams untuk x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(`${API_URL}/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log("Login response:", response.data); // Debug

      if (response.data.access_token) {
        localStorage.setItem("my_access_token", response.data.access_token);
        
        // Juga simpan di axios default instance untuk request selanjutnya
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.response?.data?.detail || "Email atau password salah!",
        },
      };
    }
    
    return {
      success: false,
      error: { name: "LoginError", message: "Gagal login" }
    };
  },

  logout: async () => {
    localStorage.removeItem("my_access_token");
    delete axios.defaults.headers.common['Authorization'];
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem("my_access_token");
    if (token) {
      // Set header axios untuk request selanjutnya
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { authenticated: true };
    }
    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    console.error(error);
    
    // Jika error 401, logout user
    if (error.status === 401) {
      localStorage.removeItem("my_access_token");
      delete axios.defaults.headers.common['Authorization'];
      return {
        error,
        redirectTo: "/login",
        logout: true,
      };
    }
    
    return { error };
  },

  getIdentity: async () => {
    const token = localStorage.getItem("my_access_token");
    if (!token) {
      throw new Error("Not authenticated");
    }
    
    return {
      id: 1,
      name: "Admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+Portfolio",
    };
  },

  // Tambahkan method getPermissions jika diperlukan
  getPermissions: async () => {
    return ["admin"];
  },
};