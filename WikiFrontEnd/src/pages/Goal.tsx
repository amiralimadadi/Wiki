import React, { useEffect, useState } from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

import HouseIcon from "../iconSaidbar/HouseIcon";
import CloudDownloadIcon from "../iconSaidbar/CloudDownloadIcon";
import QuestionIcon from "../iconSaidbar/QuestionIcon";
import ShieldQuestionIcon from "../iconSaidbar/ShieldQuestionIcon";
import InfoIcon from "../iconSaidbar/InfoIcon";
import LayersIcon from "../iconSaidbar/LayersIcon";
import DoubleRightIcon from "../iconSaidbar/DoubleRightIcon";

import { getAdminListByUserId } from "../services/auth"; // ⬅️ مسیر واقعی رو اینجا بذار

interface SimpleSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  collapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const selectedKey = location.pathname;

  const [accessList, setAccessList] = useState<string[]>([]);

  // گرفتن دسترسی‌ها از API بر اساس userId
  useEffect(() => {
    const loadAccess = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) return;

        const userDetails = JSON.parse(userString);
        const userId = userDetails?.id; // اگه اسم فیلد چیز دیگه‌ایه (مثلاً userId) اینجا عوضش کن

        if (!userId) return;

        const res = await getAdminListByUserId(userId);
        // { isSuccess: true, data: ["Project","Proposal","Wiki", ...] }
        if (res?.isSuccess && Array.isArray(res.data)) {
          setAccessList(res.data);
        }
      } catch (error) {
        console.error("خطا در دریافت دسترسی‌های ادمین:", error);
      }
    };

    loadAccess();
  }, []);

  const hasAccess = (key: string) => accessList.includes(key);

  const getActiveClass = (key: string) =>
    selectedKey === key && !collapsed
      ? "!bg-[#F1F7F4] !text-[#007041] !rounded-r-[5px] !border-l-[4px] !border-[#007041]"
      : "";

  return (
    <div
      className={`fixed top-0 bottom-0 right-0 z-40 transition-all duration-300 bg-white border-l border-gray-200 shadow-sm
  ${collapsed ? "w-[125px]" : "w-[210px]"} overflow-y-auto`}
    >
      <Menu
        mode="vertical"
        selectedKeys={[selectedKey]}
        className={`
          h-full p-1 text-right font-medium text-sm 
          [&_.ant-menu-item]:!my-0 
          [&_.ant-menu-item]:!leading-[1.4] 
          [&_.ant-menu-item]:!h-[32px]
          [&_.ant-menu-item-icon]:me-1.5 
          [&_.ant-menu-item-group-title]:text-[12px]
          [&_.ant-menu-item:hover]:!bg-[#F1F7F4]
          [&_.ant-menu-item:hover]:!text-[#007041]
          [&_.ant-menu-item:hover]:!rounded-r-[5px]
          [&_.ant-menu-item:hover]:!border-l-[4px]
          [&_.ant-menu-item:hover]:!border-[#007041]
          ${collapsed ? "[&_.ant-menu-title-content]:hidden" : ""}
        `}
      >
        {/* خانه - عمومی برای همه */}
        <Menu.Item
          key="/"
          icon={<HouseIcon size="17.49" color="#007041" />}
          className={`!flex !items-center !h-[36px] ${getActiveClass(
            "/"
          )} text-[12.25px] font-yekan`}
        >
          <Link to="/">خانه</Link>
        </Menu.Item>

        <Menu.Divider />

        {/* ================== عمومی (وابسته به Wiki) ================== */}
        {hasAccess("Wiki") && (
          <>
            <Menu.ItemGroup
              title={
                <span
                  className={`text-[#474747] ${
                    collapsed
                      ? "text-[15.25px] font-yekan"
                      : "text-[14px] font-bold"
                  }`}
                >
                  عمومی
                </span>
              }
            >
              {/* ادمین */}
              <Menu.Item
                key="/admin/expertGoal"
                icon={<CloudDownloadIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/expertGoal"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/expertGoal">ادمین</Link>
              </Menu.Item>

              {/* امتیاز */}
              <Menu.Item
                key="/admin/scores"
                icon={<CloudDownloadIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/scores"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/scores">امتیاز ها</Link>
              </Menu.Item>

              {/* درخت دانش */}
              <Menu.Item
                key="/admin/knowledge-tree"
                icon={<CloudDownloadIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/knowledge-tree"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/knowledge-tree">درخت دانش</Link>
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />
          </>
        )}

        {/* ================== گروه پرسش و پاسخ (QuestionAndAnswer) ================== */}
        {hasAccess("QuestionAndAnswer") && (
          <>
            <Menu.ItemGroup
              title={
                <span
                  className={`text-[#474747] ${
                    collapsed
                      ? "text-[15.25px] font-yekan"
                      : "text-[14px] font-bold"
                  }`}
                >
                  پرسش و پاسخ
                </span>
              }
            >
              <Menu.Item
                key="/admin/questions"
                icon={<QuestionIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/questions"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/questions">پرسش ها</Link>
              </Menu.Item>

              <Menu.Item
                key="/admin/pending-questions"
                icon={<ShieldQuestionIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/pending-questions"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/pending-questions">
                  پرسش در انتظار تایید
                </Link>
              </Menu.Item>

              <Menu.Item
                key="/admin/pending-answers"
                icon={<InfoIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/pending-answers"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/pending-answers">
                  پاسخ در انتظار تایید
                </Link>
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />
          </>
        )}

        {/* ================== گروه محتوای دانشی (KnowledgeContent) ================== */}
        {hasAccess("KnowledgeContent") && (
          <>
            <Menu.ItemGroup
              title={
                <span
                  className={`text-[#474747] ${
                    collapsed
                      ? "text-[15.25px] font-yekan"
                      : "text-[14px] font-bold"
                  }`}
                >
                  محتوای دانشی
                </span>
              }
            >
              <Menu.Item
                key="/admin/knowledge-content"
                icon={<LayersIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/knowledge-content"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/knowledge-content">محتوا دانشی</Link>
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />
          </>
        )}

        {/* ================== گروه طرح (Proposal) ================== */}
        {hasAccess("Proposal") && (
          <>
            <Menu.ItemGroup
              title={
                <span
                  className={`text-[#474747] ${
                    collapsed
                      ? "text-[15.25px] font-yekan"
                      : "text-[14px] font-bold"
                  }`}
                >
                  طرح
                </span>
              }
            >
              <Menu.Item
                key="/admin/registrants"
                icon={<LayersIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/registrants"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/registrants">افراد ثبت کننده</Link>
              </Menu.Item>

              <Menu.Item
                key="/admin/pending-plans"
                icon={<LayersIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/pending-plans"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/pending-plans">طرح در انتظار تایید</Link>
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />
          </>
        )}

        {/* ================== گروه پروژه (Project) ================== */}
        {hasAccess("Project") && (
          <>
            <Menu.ItemGroup
              title={
                <span
                  className={`text-[#474747] ${
                    collapsed
                      ? "text-[15.25px] font-yekan"
                      : "text-[14px] font-bold"
                  }`}
                >
                  پروژه
                </span>
              }
            >
              <Menu.Item
                key="/admin/registrants"
                icon={<LayersIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/registrants"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/registrants">افراد ثبت کننده</Link>
              </Menu.Item>

              <Menu.Item
                key="/admin/pending-projects"
                icon={<LayersIcon size="17.49" color="#007041" />}
                className={`!flex !items-center !h-[36px] ${getActiveClass(
                  "/admin/pending-projects"
                )} text-[12.25px] font-yekan`}
              >
                <Link to="/admin/pending-projects">پروژه در انتظار تایید</Link>
              </Menu.Item>
            </Menu.ItemGroup>

            <Menu.Divider />
          </>
        )}

        {/* ================== مستندات واحدی (مثلاً به Wiki ربط بدیم) ================== */}
        {hasAccess("Wiki") && (
          <Menu.ItemGroup
            title={
              <span
                className={`text-[#474747] ${
                  collapsed
                    ? "text-[15.25px] font-yekan"
                    : "text-[14px] font-bold"
                }`}
              >
                مستندات واحدی
              </span>
            }
          >
            <Menu.Item
              key="/admin/work-group"
              icon={<LayersIcon size="17.49" color="#007041" />}
              className={`!flex !items-center !h-[36px] ${getActiveClass(
                "/admin/work-group"
              )} text-[12.25px] font-yekan`}
            >
              <Link to="/admin/work-group">گروه کاری</Link>
            </Menu.Item>
          </Menu.ItemGroup>
        )}

        {/* دکمه جمع/باز شدن */}
        <div
          className="flex items-center justify-center p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-xl mt-4"
          onClick={onToggleCollapse}
        >
          <div className={`${!collapsed ? "rotate-0" : "rotate-180"}`}>
            <DoubleRightIcon />
          </div>
        </div>
      </Menu>
    </div>
  );
};

export default SimpleSidebar;
