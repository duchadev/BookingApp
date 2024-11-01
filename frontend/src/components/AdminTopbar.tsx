import React, { useState } from 'react';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";
import { Link } from "react-router-dom";

const AdminTopbar: React.FC = () => {
    const { role } = useAppContext();

    return (
        <header className="w-full bg-sky-50 shadow-md py-2 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center space-x-4 w-1/3">
                <Link to="/" className="flex items-center">
                    <img
                        src="/Logo2.png"
                        style={{ height: "65px" }}
                    />
                    <span style={{ fontStyle: "italic", fontWeight: "bold" }}>Hotel Haven</span>
                </Link>
            </div>
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <Bell
                        className="text-gray-600 hover:text-purple-600 cursor-pointer"
                        size={24}
                    />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        3
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <User className="text-gray-600" size={24} />
                    <span className="text-sm font-medium">{role || 'Admin'}</span>
                </div>

                {/* <button
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
                >
                    <LogOut size={24} />
                </button> */}
                <SignOutButton />

            </div>
        </header>
    );
};

export default AdminTopbar;