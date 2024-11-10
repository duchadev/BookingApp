import { UserType } from '../../src/shared/types';
import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as apiClient from '../api-client';
import { useAppContext } from "../contexts/AppContext";
import { registerAsManager, fetchCurrentUser } from '../api-client';
import { Link, useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
    
        const { showToast } = useAppContext();
    const navigate = useNavigate();
const handleRegisterAsManager = async () => {
  try {
  
    const currentUser = await fetchCurrentUser();
    const userID = currentUser._id;
      const response = await registerAsManager(userID);
      showToast({ message: "Register successfully!", type: "SUCCESS" });
      navigate("/"); // Optionally redirect on success
    } catch (error) {
       showToast({ message: "Fail to become hotel manager", type: "ERROR" });
    }
  };
  // Lấy thông tin người dùng từ API
  const { data: userProfile, isLoading, refetch } = useQuery<UserType>('fetchUserProfile', apiClient.fetchCurrentUser);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleRegisterAsManager}
          className="bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Become Hotel Manager!
        </button>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Profile Information</h1>
      <p className="text-gray-600 mb-6">Update your Information</p> 

      <div className="space-y-6">
        <ProfileField label="Name" fieldName="firstName" value={userProfile?.firstName || "Hãy cho chúng tôi biết tên gọi của bạn"} refetch={refetch} />
        <ProfileField label="Phone Number" fieldName="phone" value={userProfile?.phone || "Thêm số điện thoại của bạn"} refetch={refetch} />
        <ProfileField
          label="Email Address"
          fieldName="email"
          value={userProfile?.email || "Thêm địa chỉ email"}
          description=""
        />
        {userProfile && <PasswordField userId={userProfile._id} />}
      </div>
    </div>
  );
};
// Component dùng để hiển thị từng trường thông tin với khả năng chỉnh sửa
const ProfileField: React.FC<{
  label: string;
  fieldName: keyof UserType;
  value: string;
  description?: string;
  refetch?: () => void;
}> = ({ label, fieldName, value, description, refetch }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  const mutation = useMutation((updatedData: Partial<UserType>) => apiClient.updateUserProfile(updatedData), {
    onSuccess: () => {
      refetch?.();
      setIsEditing(false);
      toast.success("Thông tin đã được cập nhật thành công", { position: "top-right", autoClose: 5000 });
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật thông tin thất bại: ${error.message}`, { position: "top-right", autoClose: 5000 });
    },
  });
    

  const handleSave = () => {
    mutation.mutate({ [fieldName]: fieldValue });
    };
  

    return (
      
        <div className="flex justify-between items-center border-b pb-4">
          
      <div>
        <h3 className="text-lg font-semibold">{label}</h3>
        {isEditing && fieldName !== 'email' ? (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        ) : (
          <p className="text-gray-500">{value}</p>
        )}
{description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
      {isEditing && fieldName !== 'email' ? (
        <div className="flex space-x-2">
          <button onClick={handleSave} className="text-blue-500 font-semibold">Save</button>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 font-semibold">Cancel</button>
        </div>
      ) : (
        fieldName !== 'email' && (
          <button onClick={() => setIsEditing(true)} className="text-blue-500 font-semibold">Edit</button>
        )
      )}
    </div>
  );
};

const PasswordField: React.FC<{ userId: string }> = ({ userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateCurrentPassword = useMutation(
    ({ currentPassword }: { currentPassword: string }) =>
      apiClient.validateOldPassword(currentPassword, userId),
    {
      onSuccess: () => {
        setIsCurrentPasswordValid(true);
        toast.success("Mật khẩu hiện tại chính xác", { position: "top-right", autoClose: 5000 });
      },
      onError: () => {
        toast.error("Mật khẩu hiện tại không chính xác", { position: "top-right", autoClose: 5000 });
        setPasswordData((prev) => ({ ...prev, currentPassword: '' }));
      },
    }
  );

  const changePasswordMutation = useMutation(
    (passwords: { newPassword: string; confirmPassword: string }) =>
      apiClient.changePassword(userId,passwords.newPassword, passwords.confirmPassword),
    {
      onSuccess: () => {
        toast.success("Đổi mật khẩu thành công");
        setIsEditing(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsCurrentPasswordValid(false);
      },
      onError: (error: Error) => {
        toast.error(`Thay đổi mật khẩu thất bại: ${error.message}`);
        setIsCurrentPasswordValid(false);
      },
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidateCurrentPassword = () => {
    validateCurrentPassword.mutate({ currentPassword: passwordData.currentPassword });
  };

  const handleSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không trùng khớp");
      return;
    }
    changePasswordMutation.mutate({
      newPassword: passwordData.newPassword,
confirmPassword :passwordData.confirmPassword,
    });
  };

    const { showToast } = useAppContext();
    const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center border-b pb-4">
      <div>
        <h3 className="text-lg font-semibold">Password</h3>
        <p className="text-gray-500">*********</p>
      </div>
      {isEditing ? (
        <div className="space-y-4 mt-4 w-full max-w-md mx-auto">
          {!isCurrentPasswordValid ? (
            <>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full pr-10 max-w-md"
                />
                <span
                  onClick={() => toggleShowPassword("current")}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500"
                >
                  {showPassword.current ? "👁️" : "👁️"}
                </span>
              </div>
              <button onClick={handleValidateCurrentPassword} className="text-blue-500 font-semibold">Confirm Current Password</button>
            </>
          ) : (
            <>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full pr-10 max-w-md"
                />
                <span
                  onClick={() => toggleShowPassword("new")}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500"
                >
                  {showPassword.new ? "👁️" : "👁️"}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full pr-10 max-w-md"
                />
                <span
                  onClick={() => toggleShowPassword("confirm")}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500"
                >
                  {showPassword.confirm ? "🙈" : "👁️"}
                </span>
                              </div>
                              
              <div className="flex space-x-2">
                <button onClick={handleSave} className="text-blue-500 font-semibold">Save</button>
<button onClick={() => setIsEditing(false)} className="text-gray-500 font-semibold">Cancel</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)} className="text-blue-500 font-semibold">Edit</button>
      )}
      </div>
      
  );
};

export default Profile;