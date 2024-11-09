import { UserType } from '../../src/shared/types';
import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as apiClient from '../api-client';

const Profile: React.FC = () => {
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
      <h1 className="text-3xl font-bold mb-4">Thông tin cá nhân</h1>
      <p className="text-gray-600 mb-6">Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao.</p>

      <div className="space-y-6">
        <ProfileField label="Tên" fieldName="firstName" value={userProfile?.firstName || "Hãy cho chúng tôi biết tên gọi của bạn"} refetch={refetch} />
        <ProfileField label="Số điện thoại" fieldName="phone" value={userProfile?.phone || "Thêm số điện thoại của bạn"} refetch={refetch} />
        <ProfileField 
          label="Địa chỉ email" 
          fieldName="email" 
          value={userProfile?.email || "Thêm địa chỉ email"} 
          description="Đây là địa chỉ email bạn dùng để đăng nhập." 
        />
        <PasswordField />
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

  // Mutation để cập nhật thông tin người dùng (không áp dụng cho email)
  const mutation = useMutation((updatedData: Partial<UserType>) => apiClient.updateUserProfile(updatedData), {
    onSuccess: () => {
      refetch?.(); // Lấy lại thông tin sau khi cập nhật thành công, nếu có refetch
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
          <button onClick={handleSave} className="text-blue-500 font-semibold">Lưu</button>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 font-semibold">Hủy</button>
        </div>
      ) : (
        fieldName !== 'email' && (
          <button onClick={() => setIsEditing(true)} className="text-blue-500 font-semibold">Chỉnh sửa</button>
        )
      )}
    </div>
  );
};

const PasswordField: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  
    // Xác nhận mật khẩu hiện tại
    const validateCurrentPassword = useMutation(
      (currentPassword: string) => apiClient.validateOldPassword(currentPassword),
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
  
    // Thay đổi mật khẩu mới
    const changePasswordMutation = useMutation(
      (passwords: { currentPassword: string; newPassword: string }) =>
        apiClient.changePassword(passwords.currentPassword, passwords.newPassword),
      {
        onSuccess: () => {
          toast.success("Đã thay đổi mật khẩu thành công", { position: "top-right", autoClose: 5000 });
          setIsEditing(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setIsCurrentPasswordValid(false);
        },
        onError: (error: Error) => {
          toast.error(`Thay đổi mật khẩu thất bại: ${error.message}`, { position: "top-right", autoClose: 5000 });
        },
      }
    );
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleValidateCurrentPassword = () => {
      validateCurrentPassword.mutate(passwordData.currentPassword);
    };
  
    const handleSave = () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Mật khẩu mới không khớp', { position: "top-right", autoClose: 5000 });
        return;
      }
      changePasswordMutation.mutate({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
    };
  
    return (
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">Mật khẩu</h3>
          <p className="text-gray-500">*********</p>
        </div>
        {isEditing ? (
          <div className="space-y-4 mt-4">
            {!isCurrentPasswordValid ? (
              <>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full"
                />
                <button onClick={handleValidateCurrentPassword} className="text-blue-500 font-semibold">Xác nhận mật khẩu hiện tại</button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full"
                />
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="text-blue-500 font-semibold">Lưu</button>
                  <button onClick={() => setIsEditing(false)} className="text-gray-500 font-semibold">Hủy</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-blue-500 font-semibold">Chỉnh sửa</button>
        )}
      </div>
    );
  };
    

export default Profile;
