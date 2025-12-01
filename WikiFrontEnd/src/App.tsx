import { useState } from "react";
import  { useEffect } from "react";
import { message, notification } from "antd";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  matchPath,
} from "react-router-dom";

import Sidebar from "./components/module/Saidbar";
import ContentArea from "./components/module/ContentArea";
import Header from "./components/module/Header";
import Header2 from "./components/module/Header2";
import Login from "./pages/Login";
import PrintPageWrapper from "./components/common/PrintPageWrapper";
import ProtectedRoute from "./components/module/ProtectedRoute";
import { useChangeTitle } from "./hooks/useTitle";
import { toPersianDigits } from "./utils/persianNu";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import GoalSidebar from "./pages/Goal";
import SimpleSidebar from "./pages/Goal";
import GetProfileDataAll from "./components/templates/GetProfileDataAll";
import AdminPage from "./pages/AdminPage";
import KnowledgeTree from "./pages/KnowledgeTree";
import QuastionAdmin from "./pages/QuastionAdmin";
import PendingQuestions from "./pages/PendingQuestions";
import CommentConfirm from "./pages/CommentConfirm";
import KnowledgeContenAdmin from "./pages/KnowledgeContenAdmin";
import ProjectPerposonalAdmin from "./pages/ProjectPerposonalAdmin";
import PendingApprovalPlans from "./pages/PendingApprovalPlangs";
import ProjectConfirmAdmin from "./pages/ProjectConfirmAdmin";
import GroupWorkAdmin from "./pages/GroupWorkAdmin";

export default function App() {
  useEffect(() => {
    // برای notification که رسمی پشتیبانی می‌کند
    notification.config({
      placement: "bottomLeft",
      duration: 4,
    });

    // برای message که placement ندارد
    message.config({
      duration: 4,
      maxCount: 3,
    });

    // ⬇️ با CSS جای پیام‌ها را پایین چپ می‌بریم
    const style = document.createElement("style");
    style.innerHTML = `
      .ant-message {
      top: auto !important;
    bottom: 24px !important;
    left: 175px !important;
    right: auto !important;
    max-width: 300px !important;
    white-space: normal !important;
    word-break: break-word !important;
    text-align: right;
    direction: rtl;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useChangeTitle("سامانه تیپاکس یکپارچه");

  const excludedPaths = ["/login"];
  const isExcluded = excludedPaths.includes(location.pathname);

  const { data } = useSelector((state: RootState) => state.knowledgeContent);
  const isAdminPath = location.pathname.startsWith("/admin");
  const isGoalPath = matchPath("/admin/:id", location.pathname);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isExcluded) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  if (isAdminPath) {
    return (
      <div className="pr-[82px] pl-[66px] md:pr-[82px] md:pl-[66px] px-4">
        <div
          className={`flex justify-center mb-[15px] mt-[11px] ${
            location.pathname.startsWith("/admin") ? "mr-[11rem]" : "mr-0"
          }`}
        >
          <Header />
        </div>

        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
          <SimpleSidebar
            collapsed={sidebarCollapsed}
            // @ts-expect-error لازم به دلیل ناسازگاری تایپ‌ها
            selectedKey={location.pathname}
            onSelect={(key) => navigate(key)}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          />

          <div className="flex-1 flex flex-col pt-1">
            <Header2 />
            <div className="flex-1">
              <Routes>
                <Route
                  path="/admin"
                  element={
                    <div className="text-center mt-20 text-2xl">
                      صفحه خانه ادمین
                    </div>
                  }
                />
                <Route path="/admin/expertGoal" element={<AdminPage />} />
                <Route path="/admin/scores" element={<GetProfileDataAll />} />
                <Route
                  path="/admin/knowledge-tree"
                  element={<KnowledgeTree />}
                />
                <Route path="/admin/questions" element={<QuastionAdmin />} />
                <Route
                  path="/admin/pending-questions"
                  element={<PendingQuestions />}
                />
                <Route
                  path="/admin/pending-answers"
                  element={<CommentConfirm />}
                />
                <Route
                  path="/admin/knowledge-content"
                  element={<KnowledgeContenAdmin />}
                />
                <Route
                  path="/admin/registrants"
                  element={<ProjectPerposonalAdmin />}
                />
                <Route
                  path="/admin/pending-plans"
                  element={<PendingApprovalPlans />}
                />
                <Route
                  path="/admin/pending-projects"
                  element={<ProjectConfirmAdmin />}
                />
                {/* <Route
                  path="/admin/unit-docs"
                  element={
                    <div className="text-center mt-20 text-2xl">
                      مستندات واحدی
                    </div>
                  }
                /> */}
                <Route path="/admin/work-group" element={<GroupWorkAdmin />} />
              </Routes>
            </div>

            <footer className="text-[10.5px] rounded-xl mr-[10rem] text-[#333333] flex justify-between bg-white p-3 mt-[35px]">
              <div className="flex flex-col">
                <p>سامانه تیپاکس یکپارچه</p>
                <p>{toPersianDigits("دپارتمان IT تیپاکس - 2025")}</p>
              </div>
              <div className="flex flex-col items-center">
                <p>{toPersianDigits("نسخه پنل :2.3.12")}</p>
                <p>{toPersianDigits("نسخه API :1.4.1")}</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[1300px] mx-auto">
      <div
        className={`flex justify-center mb-[15px] mt-[11px] ${
          location.pathname === "/admin" ? "mr-[10rem]" : ""
        }`}
      >
        <Header />
        {isGoalPath ? (
          <GoalSidebar
            collapsed={sidebarCollapsed}
            // @ts-expect-error لازم به دلیل ناسازگاری تایپ‌ها
            selectedKey={location.pathname}
            onSelect={(key) => navigate(key)}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />
        ) : null}
      </div>

      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        <section>
          <Sidebar />
        </section>

        <div className="flex-1 flex flex-col mr-[1.5rem]">
          <Header2 />
          <div className="flex-1">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/knowledgeContent" replace />}
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/:id"
                element={
                  <ProtectedRoute>
                    <ContentArea />
                  </ProtectedRoute>
                }
              />

              <Route path="/profile" element={<div>محتوای پروفایل</div>} />
              <Route
                path="/knowledgeContentPrint/:id"
                // @ts-expect-error لازم به دلیل ناسازگاری تایپ‌ها
                element={<PrintPageWrapper articles={data} />}
              />
            </Routes>
          </div>

          <footer
            className={`text-[10.5px] rounded-xl ${
              location.pathname === "/admin" ? "mr-[10rem]" : ""
            } text-[#333333] flex justify-between bg-white p-3 mt-[35px]`}
          >
            <div className="flex flex-col">
              <p>سامانه تیپاکس یکپارچه</p>
              <p>{toPersianDigits("دپارتمان IT تیپاکس - 2025")}</p>
            </div>
            <div className="flex flex-col items-center">
              <p>{toPersianDigits("نسخه پنل :2.3.12")}</p>
              <p>{toPersianDigits("نسخه API :1.4.1")}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
