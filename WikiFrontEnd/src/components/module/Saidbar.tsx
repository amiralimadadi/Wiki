import { useState, useEffect, useCallback } from "react";
import { UserOutlined } from "@ant-design/icons";
import { toPersianDigits } from "../../utils/persianNu";
import { useLocation, useNavigate } from "react-router-dom";
import type { dataUserCurrent, MenuItemType } from "../../types/Interfaces";
import { getGoalTree, getProfileDataForCurrent } from "../../services/auth";

import { convertGoalsToMenu } from "../../utils/menuUtils";
// @ts-expect-error tsx
import BestUsers from "./BestUsers";
import KnowledgeTree from "./KnowledgeTree";
import { Modal } from "antd";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataUser, setDataUser] = useState<dataUserCurrent | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(true);
  const [, setHasWikiAccess] = useState<boolean>(false);

  // بررسی دسترسی ویکی
  useEffect(() => {
    const rolesStr = localStorage.getItem("roles");
    if (rolesStr) {
      try {
        const roles: string[] = JSON.parse(rolesStr);
        setHasWikiAccess(
          roles.includes("Wiki-Admin") || roles.includes("Wiki-User")
        );
      } catch (e) {
        console.error("خطا در تبدیل نقش‌ها:", e);
        setHasWikiAccess(false);
      }
    }
  }, []);

  // همگام‌سازی selectedKey با goalId موجود در URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const goalIdFromUrl = params.get("goalId");
    if (goalIdFromUrl) {
      setSelectedKey(goalIdFromUrl);
    }
  }, [location.search]);

  // مدیریت انتخاب آیتم منو (کلیک روی درخت)
  const handleSelect = useCallback(
    (key: string) => {
      setSelectedKey(key);

      const goalId = Number(key);
      const params = new URLSearchParams(location.search);

      params.set("goalId", String(goalId));
      params.set("pageNo", "1");
      params.set("tab", "All");

      // اگر روی روت هستیم، بفرست روی /knowledgeContent
      const currentPath = location.pathname === "/" ? "/knowledgeContent" : location.pathname;

      navigate({
        pathname: currentPath,
        search: params.toString(),
      });
    },
    [navigate, location.pathname, location.search]
  );

  // دریافت داده‌های درخت دانش
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await getGoalTree();
        if (response?.isSuccess && response.data) {
          setMenuItems(convertGoalsToMenu(response.data));
        }
      } catch (error) {
        console.error("خطا در گرفتن منو:", error);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchTree();
  }, []);

  // دریافت اطلاعات کاربر
  useEffect(() => {
    const getUserDatas = async () => {
      try {
        const response = await getProfileDataForCurrent();
        if (response?.data) {
          setDataUser(response.data);
        }
      } catch (error) {
        console.error("خطا در گرفتن اطلاعات کاربر:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    getUserDatas();
  }, []);

  return (
    <div className="sticky top-0">
      {/* اگر در مسیر admin/goal باشیم، سایدبار اصلی نمایش داده نشود */}
      <div className={`${location.pathname === "/admin/goal" ? "block" : "hidden"}`}>
        {/* محتوای مربوط به آدرس /admin/goal (اگر لازم شد) */}
      </div>

      <div
        className={`${
          location.pathname === "/admin/goal" ? "hidden" : "block"
        } flex flex-col gap-2`}
      >
        {/* بخش اطلاعات کاربر */}
        {loadingUser ? (
          <div className="w-full max-w-[206px] h-fit bg-gray-100 animate-pulse rounded-xl p-4 blur-sm" />
        ) : (
          dataUser && (
            <aside className="bg-white shadow-sm rounded-xl p-4 w-full max-w-[206px] h-auto md:h-fit">
              <div className="flex items-center gap-3 font-yekan font-semibold">
                <UserOutlined className="text-[15px] text-[#333333]" />
                <p className="text-[14px] text-[#333333] truncate max-w-[120px]">
                  {dataUser.firstName}
                </p>
              </div>

              <div className="flex items-center gap-3 font-yekan font-semibold mt-1">
                <p className="text-[13px] text-[#333333]">سطح</p>
                <div className="flex-1 border-b border-dashed border-[#33333333]" />
                <p className="text-[13px] text-[#333333]">
                  {dataUser.currentMedal}
                </p>
              </div>

              <div className="flex items-center gap-3 font-yekan font-semibold mt-1">
                <p className="text-[13px] text-[#333333]">امتیاز</p>
                <div className="flex-1 border-b border-dashed border-[#33333333]" />
                <p className="text-[13px] text-[#333333]">
                  {dataUser.totalScoreAmount}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="font-yekan text-[#333333] text-[11px]">
                  {toPersianDigits(dataUser.remainingScoreText)}
                </p>
                <p
                  onClick={() => setIsModalOpen(true)}
                  className="text-[11px] cursor-pointer text-center mt-1 text-[#0369A1] hover:underline"
                >
                  نمایش افراد برتر
                </p>
              </div>
            </aside>
          )
        )}

        {/* مودال افراد برتر */}
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          centered
          width={500}
          bodyStyle={{
            maxHeight: "80vh",
            overflowY: "auto",
            padding: 20,
          }}
        >
          <div className="rtl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-semibold">افراد برتر</h2>
            </div>
            <div className="w-full h-[0.5px] bg-[#33333333] my-2" />
            <BestUsers />
          </div>
        </Modal>

        {/* درخت دانش سفارشی */}
        {loadingMenu ? (
          <div className="w-[206px] h-[150px] bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <div className="mt-1">
            <KnowledgeTree
              items={menuItems}
              selectedKey={selectedKey}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
