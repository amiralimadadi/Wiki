// src/pages/HomeLanding.tsx
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getTabs } from "../components/common/TabsData";

export default function HomeLanding() {
  const navigate = useNavigate();

  // 👈 فعلاً بدون Redux: اگر لیست دسترسی‌ها را در localStorage ذخیره می‌کنی، می‌تونی از این استفاده کنی
  const rawRoles = localStorage.getItem("accessList"); // اسم key را با پروژه خودت هماهنگ کن
  const accessList: string[] = rawRoles ? JSON.parse(rawRoles) : [];

  // اگر هنوز هیچ‌جا accessList ذخیره نمی‌کنی، می‌تونی موقتاً فقط خالی بگیری:
  // const accessList: string[] = [];

  const tabs = getTabs("", accessList);

  return (
    <div className="w-full flex flex-col items-center text-center px-4 py-10">
      <h1 className="text-2xl font-bold text-[#007141] mb-4">
        به سامانه تیپاکس یکپارچه خوش آمدید
      </h1>

      <p className="text-gray-600 text-sm max-w-[500px] leading-6 mb-8">
        لطفاً یکی از بخش‌های زیر را انتخاب کنید تا به صفحه مربوطه هدایت شوید.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-[420px]">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            block
            onClick={() => navigate(`/${tab.path}`)}
            className="!flex !items-center !justify-between !h-12 !rounded-xl !bg-white !border !border-gray-300 hover:!border-[#007141] hover:!shadow-sm"
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              <span className="font-yekan text-sm">{tab.label}</span>
            </span>
            <span className="text-xs text-gray-400">ورود</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
