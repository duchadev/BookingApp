import React, { useContext, useEffect, useState } from "react";
import Toast from "../components/Toast";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";

type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

type AppContextType = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  role: string | null;
  email: string | null;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Khi component mount, lấy lại trạng thái từ localStorage
  useEffect(() => {
    const savedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const savedRole = localStorage.getItem("role");
    const savedEmail = localStorage.getItem("email");

    if (savedIsLoggedIn === "true") {
      setIsLoggedIn(true);
      setRole(savedRole);
      setEmail(savedEmail);
    }
  }, []);

  // Sử dụng react-query để xác thực token
  const { isError } = useQuery("validateToken", apiClient.validateToken, {
    retry: false,
    onSuccess: (data) => {
      // Giả sử API trả về vai trò người dùng trong data
      console.log("AppContext: Token validation success", data);
      setIsLoggedIn(true);
      setRole(data?.role || null);
      setRole(data?.email || null);
      // Lưu trạng thái vào localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", data?.role || "");
      localStorage.setItem("email", data?.email || "");
    },
    onError: () => {
      console.log("AppContext: Token validation failed");
      // Xóa thông tin đăng nhập khi token không hợp lệ
      setIsLoggedIn(false);
      setRole(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
    },
  });

  // Hàm hiển thị thông báo
  const showToast = (toastMessage: ToastMessage) => {
    setToast(toastMessage);
  };

  return (
    <AppContext.Provider
      value={{
        showToast,
        isLoggedIn: !isError && isLoggedIn,
        role,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

// Custom hook để sử dụng AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
