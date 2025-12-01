import React, { useEffect, useRef, useState } from "react";
import { Table, Button, Checkbox, Space, Card, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  addUserToAdmins,
  deleteAdminById,
  deleteExpertOrOwner,
  getAllAdmins,
  GetAllExperts,
  GetAllOwners,
} from "../services/auth";
import CustomIcon from "../iconSaidbar/CustomIcon";
import RedoIcon from "../iconSaidbar/RedoIcon";
import PrinterIcon from "../iconSaidbar/PrinterIcon";
import NoDataIcon from "../iconSaidbar/NoDataIcon";
import toast, { Toaster } from "react-hot-toast";

// مودال‌های جداگانه
import AddProcessOwnerModal from "../components/common/AddProcessOwnerModal";
import AddProcessNews from "../components/common/AddProcessNews";
import AddProcessSystem from "../components/common/AddProcessSystem";

interface DataType {
  key: string;
  row: number;
  name: string;
  type: string;
  status: string;
  operations: string;
  userId?: number;
  goalId?: number;
}
interface OwnerDataType {
  key: string;
  row: number;
  name: string;
  category: { id: number; name: string; goalId?: number }[];
  id?: number;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [showColumnFilter, setShowColumnFilter] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<DataType[]>([]);
  const [ownerData, setOwnerData] = useState<OwnerDataType[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      ردیف: true,
      نام: true,
      نوع: true,
      عملیات: true,
    }
  );

  const [expertData, setExpertData] = useState<DataType[]>([]);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // مودال‌ها
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  // دریافت داده‌های خبره
  const fetchExperts = async () => {
    const response = await GetAllExperts();
    if (response?.isSuccess && Array.isArray(response.data)) {
      const formatted = response.data.flatMap((item, index) =>
        item.goals.map((goal) => ({
          key: `${item.id}-${goal.goalId}`,
          row: index + 1,
          name: item.fullName,
          type: item.kind,
          status: "فعال",
          operations: "",
          userId: item.id,
          goalId: goal.goalId,
        }))
      );
      setExpertData(formatted);
    } else {
      toast.error("خطا در دریافت اطلاعات خبره‌ها");
    }
  };

  useEffect(() => {
    if (activeTab === "expert") {
      fetchExperts();
    }
  }, [activeTab]);

  // ستون‌ها برای خبره‌ها
  const expertColumns: ColumnsType<DataType> = [
    { title: "ردیف", dataIndex: "row", key: "row", width: 80 },
    { title: "نام", dataIndex: "name", key: "name" },
    { title: "نوع", dataIndex: "type", key: "type" },
    {
      title: "عملیات",
      key: "operations",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="آیا از حذف این مورد مطمئن هستید؟"
            onConfirm={() => handleDelete(record.userId!, record.goalId!)}
            okText="بله"
            okButtonProps={{
              style: { backgroundColor: "#15803D", color: "#fff" },
            }}
            cancelText="خیر"
            okType="danger"
          >
            <DeleteOutlined className="text-red-500 cursor-pointer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ستون‌ها برای مالک‌ها
  const ownerColumns: ColumnsType<OwnerDataType> = [
    { title: "ردیف", dataIndex: "row", key: "row", width: 80 },
    { title: "نام", dataIndex: "name", key: "name" },
    {
      title: "دسته‌بندی",
      dataIndex: "category",
      key: "category",
      render: (
        categories: { id: number; name: string; goalId?: number }[],
        record
      ) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories.map((cat, idx) => (
            <Popconfirm
              key={idx}
              title="حذف دسته‌بندی"
              description={`آیا از حذف دسته‌بندی مطمئن هستید؟`}
              okText="تایید"
              okButtonProps={{
                style: { backgroundColor: "#15803D", color: "#fff" },
              }}
              cancelText="لغو"
              onConfirm={async () => {
                const result = await deleteExpertOrOwner(
                  record.id!,
                  cat.goalId!
                );
                if (result?.isSuccess) {
                  toast.success("با موفقیت حذف شد");
                  loadOwnerData();
                } else {
                  toast.error(result?.message || "خطا در حذف");
                }
              }}
            >
              <span className="owner-tag cursor-pointer hover:bg-red-100 transition-all flex items-center gap-1">
                <DeleteOutlined className="text-red-500" />
                {cat.name}
              </span>
            </Popconfirm>
          ))}
        </div>
      ),
    },
  ];

  // ستون‌ها برای ادمین‌ها
  const adminColumns: ColumnsType<DataType> = [
    { title: "ردیف", dataIndex: "row", key: "row", width: 80 },
    { title: "نام", dataIndex: "name", key: "name" },
    { title: "نوع", dataIndex: "type", key: "type" },
    {
      title: "عملیات",
      key: "operations",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="آیا از حذف این مورد مطمئن هستید؟"
            onConfirm={() => handleDeleteAdmin(Number(record.key))}
            okText="بله"
            okButtonProps={{
              style: { backgroundColor: "#15803D", color: "#fff" },
            }}
            cancelText="خیر"
            okType="danger"
          >
            <DeleteOutlined className="text-red-500 cursor-pointer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabs = [
    { key: "admin", label: "ادمین سیستم" },
    { key: "expert", label: "خبره فرایند" },
    { key: "owner", label: "مالک فرایند" },
  ];

  const EmptyDataComponent = () => (
    <div
      style={{
        color: "#545454",
        textAlign: "center",
        bottom: 20,
        left: "50%",
        width: "100%",
        fontSize: 14,
        fontWeight: "normal",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <NoDataIcon />
      <span>داده‌ای موجود نیست</span>
    </div>
  );

  const customButtonStyle = {
    border: "none",
    boxShadow: "none",
  };

  const customActiveButtonStyle = {
    ...customButtonStyle,
    backgroundColor: "#007041",
    color: "white",
  };

  // حذف خبره یا مالک
  const handleDelete = async (userId: number, goalId: number) => {
    try {
      console.log("Deleting userId:", userId, "goalId:", goalId);
      const response = await deleteExpertOrOwner(userId, goalId);

      if (response?.isSuccess) {
        toast.success("با موفقیت حذف شد");

        if (activeTab === "expert") {
          fetchExperts();
        } else if (activeTab === "owner") {
          loadOwnerData();
        } else {
          loadData();
        }
      } else {
        toast.error(response?.message || "خطا در حذف");
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در ارسال درخواست حذف");
    }
  };

  // حذف ادمین
  const handleDeleteAdmin = async (adminId: number) => {
    const result = await deleteAdminById(adminId);
    if (result?.isSuccess) {
      toast.success("ادمین با موفقیت حذف شد");
      loadData();
    } else {
      toast.error(result?.message || "خطا در حذف ادمین");
    }
  };

  const toggleColumn = (columnName: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  // دریافت مالک‌ها
  const loadOwnerData = async () => {
    const response = await GetAllOwners();
    if (response?.isSuccess && Array.isArray(response.data)) {
      const newOwnerData = response.data.map((user, index) => ({
        key: user.userId.toString(),
        row: index + 1,
        name: user.fullName,
        id: user.id,
        category: user.goals.map((goal) => ({
          goalId: goal.goalId,
          name: goal.goalName,
        })),
      }));
      setOwnerData(newOwnerData);
    } else {
      toast.error("خطا در دریافت اطلاعات مالکین فرایند");
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  // دریافت ادمین‌ها
  const loadData = async () => {
    const response = await getAllAdmins();
    if (response?.isSuccess && Array.isArray(response.data)) {
      const transformedData: DataType[] = response.data.map((item, index) => ({
        key: item.id.toString(),
        row: index + 1,
        name: item.fullName,
        type: item.kind,
        status: "فعال",
        operations: "",
      }));
      setAdminData(transformedData);
      toast.success("داده‌ها بروزرسانی شدند");
    } else {
      toast.error("دریافت اطلاعات ادمین‌ها با مشکل مواجه شد");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !tableRef.current) return;

    const style = `
    <style>
      body { direction: rtl; font-family: sans-serif; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
      .owner-tag { margin: 2px; display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: #f5f5f5; border: 1px solid #ccc; }
    </style>`;

    printWindow.document.write(`
      <html>
        <head><title>چاپ جدول</title>${style}</head>
        <body>${tableRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="mx-auto mr-[9rem] mt-0 pt-0 h-fit  rounded-xl shadow-sm">
      <Card bordered={false}>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <h1 className="text-[21px] text-[#007041] font-bold mb-0">ادمین</h1>

          <Space className="print:hidden">
            <Button
              className="h-[32px] w-[150.79px] rounded-xl"
              onClick={() => setIsSystemModalOpen(true)}
            >
              افزودن ادمین سیستم
            </Button>
            <Button
              className="h-[32px] w-[150.79px] rounded-xl"
              onClick={() => setIsExpertModalOpen(true)}
            >
              افزودن خبره فرایند
            </Button>
            <Button
              className="h-[32px] w-[150.79px] rounded-xl"
              onClick={() => setIsOwnerModalOpen(true)}
            >
              افزودن مالک فرایند
            </Button>
          </Space>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 print:hidden">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              style={
                activeTab === tab.key
                  ? customActiveButtonStyle
                  : customButtonStyle
              }
              className={`${
                activeTab === tab.key
                  ? "hover:!bg-green-700"
                  : "hover:!bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div
          className="mb-4 flex justify-between items-center relative print:hidden"
          onMouseEnter={() => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            setShowColumnFilter(true);
          }}
          onMouseLeave={() => {
            hideTimeout.current = setTimeout(() => {
              setShowColumnFilter(false);
            }, 100);
          }}
        >
          <div className="flex items-center gap-1 bg-gray-200 rounded-xl justify-center cursor-pointer w-[101px] h-[24px] select-none">
            <CustomIcon size={10.5} />
            <span
              className="text-[12px] font-bold text-gray-500"
              style={{ userSelect: "none" }}
            >
              تغییر ستون‌ها
            </span>
          </div>

          {showColumnFilter && (
            <div
              className="absolute right-0 top-full mt-2 p-2 bg-white border rounded shadow-lg z-20"
              style={{ minWidth: 120 }}
              onMouseEnter={() => setShowColumnFilter(true)}
              onMouseLeave={() => setShowColumnFilter(false)}
            >
              {Object.entries(visibleColumns).map(([columnName, isVisible]) => (
                <div
                  key={columnName}
                  className="flex items-center p-1 hover:bg-gray-100"
                >
                  <Checkbox
                    checked={isVisible}
                    onChange={() => toggleColumn(columnName)}
                    className="checkbox-green"
                  />
                  <span className="mr-2 select-none">{columnName}</span>
                </div>
              ))}
            </div>
          )}

          <Space>
            <div
              className="flex items-center cursor-pointer gap-1 select-none"
              onClick={() => {
                if (activeTab === "admin") loadData();
                else if (activeTab === "expert") fetchExperts();
                else if (activeTab === "owner") loadOwnerData();
              }}
            >
              <RedoIcon size={10.49} />
              <span className="text-[12px]" style={customButtonStyle}>
                بروزرسانی
              </span>
            </div>
            <div
              className="flex items-center cursor-pointer gap-1 select-none"
              onClick={handlePrint}
            >
              <PrinterIcon size={10.49} />
              <span className="text-[12px]" style={customButtonStyle}>
                پرینت
              </span>
            </div>
          </Space>
        </div>

        <div ref={tableRef}>
          {activeTab === "owner" ? (
            <Table
              columns={ownerColumns}
              dataSource={ownerData}
              pagination={false}
              locale={{ emptyText: <EmptyDataComponent /> }}
              className="ant-table-rtl"
            />
          ) : activeTab === "expert" ? (
            <Table
              columns={expertColumns.filter(
                (col) => visibleColumns[col.title as string]
              )}
              dataSource={expertData}
              pagination={false}
              locale={{ emptyText: <EmptyDataComponent /> }}
              className="ant-table-rtl"
            />
          ) : (
            <Table
              columns={adminColumns.filter(
                (col) => visibleColumns[col.title as string]
              )}
              dataSource={adminData}
              pagination={false}
              locale={{ emptyText: <EmptyDataComponent /> }}
              className="ant-table-rtl"
            />
          )}
        </div>
      </Card>

      {/* مودال‌ها */}
      <AddProcessOwnerModal
        open={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onSubmit={loadOwnerData}
      />

      <AddProcessNews
        open={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        onSubmit={() => {
          fetchExperts();
          setIsExpertModalOpen(false);
        }}
      />

      <AddProcessSystem
        open={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        onSubmit={async (payload) => {
          const result = await addUserToAdmins(payload);

          if (result?.isSuccess) {
            toast.success("کاربر با موفقیت افزوده شد");
            setIsSystemModalOpen(false);
            loadData();
          } else {
            toast.error(result?.message || "خطا در افزودن کاربر");
          }
        }}
      />

      <Toaster position="bottom-right" />
    </div>
  );
};

export default AdminPanel;
