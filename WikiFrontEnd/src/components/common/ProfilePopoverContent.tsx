import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ProfilePopoverContent = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();

    // انتقال به صفحه لاگین
    navigate("/login");

    window.location.reload();
  };

  return (
    <div className="w-40 font-yekan h-fit">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 cursor-pointer text-[#333333] hover:bg-gray-200 duration-300 ease-linear  pt-2 pb-2 rounded-xl pr-1 text-[15px]">
          <UserOutlined />
          <span>حساب کاربری</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer text-[#333333] hover:bg-gray-200 duration-300 ease-linear  pt-2 pb-2 rounded-xl pr-1 text-[15px]">
          <PictureOutlined />
          <span>عکس پروفایل</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer text-[#333333] hover:bg-gray-200 duration-300 ease-linear  pt-2 pb-2 rounded-xl pr-1 text-[15px]">
          <SettingOutlined />
          <span>تنظیمات پنل</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer text-[#333333] hover:bg-red-500 hover:text-white duration-300 ease-linear  pt-2 pb-2 rounded-xl pr-1 text-[15px]">
          <LogoutOutlined />
          <span onClick={handleLogout}>خروج از حساب کاربری</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopoverContent;
