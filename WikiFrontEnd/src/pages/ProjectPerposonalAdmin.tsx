import React, { useEffect, useState } from "react";
import { Table, Button, Checkbox, Popconfirm, message } from "antd";
import toast, { Toaster } from "react-hot-toast";

import {
  FilterOutlined,
  RedoOutlined,
  PrinterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toPersianDigits } from "../utils/persianNu";
import getUsersGenerator from "../services/auth";
import {
  deleteUserFromGenerator, // فرض کردم این فانکشن را داری، اگر نه بگو تا بدم
} from "../services/auth";
import AddUserModal from "../forms/AddUserModalProps";

interface ProjectPerson {
  key: number;
  row: number;
  type: string;
  name: string;
  id: number; // برای حذف نیاز است
}

interface UserViewer {
  userId: number;
  fullName: string;
}

interface GeneratorUser {
  id: number;
  kind: string;
  userViewer: UserViewer[];
}

interface ApiResponse {
  isSuccess: boolean;
  data: GeneratorUser[];
  message?: string;
}

const ProjectPerposonalAdmin: React.FC = () => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "ردیف",
    "نوع",
    "نام",
    "عملیات",
  ]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [data, setData] = useState<ProjectPerson[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [kinds, setKinds] = useState<string[]>([]);
  const [users, setUsers] = useState<UserViewer[]>([]);

  // گرفتن دیتا از سرور و ست کردن استیت‌ها
  const fetchData = async () => {
    try {
      // @ts-expect-error tsx

      const response = (await getUsersGenerator()) as ApiResponse;
      if (response.isSuccess && Array.isArray(response.data)) {
        const mappedData: ProjectPerson[] = response.data.map(
          (item, index) => ({
            key: item.id,
            id: item.id,
            row: index + 1,
            type: item.kind,
            name: item.userViewer[0]?.fullName || "",
          })
        );
        setData(mappedData);

 setKinds(["پروژه", "طرح", "ایده", "محتوای دانشی", "پرسش و پاسخ"]);


        // گرفتن لیست یکتای کاربران
        const allUsers = response.data.flatMap((item) => item.userViewer);
        const uniqueUsers = Array.from(
          new Map(allUsers.map((u) => [u.userId, u])).values()
        );
        setUsers(uniqueUsers);
      } else {
        message.error("خطا در دریافت داده‌ها: " + response.message);
      }
    } catch (error) {
      console.error("خطا در دریافت داده‌ها:", error);
      message.error("خطا در دریافت داده‌ها. لطفا دوباره تلاش کنید.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "ردیف",
      dataIndex: "row",
      width: 30,
      key: "row",
      render: (text: number) => <span>{toPersianDigits(text)}</span>,
    },
    {
      title: "نوع",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "نام",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: ProjectPerson) => (
        <Popconfirm
          title="آیا از حذف این مورد مطمئن هستید؟"
          okText="بله"
          cancelText="خیر"
          onConfirm={() => handleDelete(record.id)}
          placement="topRight"
        >
          <Button
            type="text"
            icon={<DeleteOutlined className="text-red-500" />}
            className="hover:bg-transparent"
          />
        </Popconfirm>
      ),
    },
  ];

  const filteredColumns = columns.filter((col) =>
    selectedColumns.includes(col.title as string)
  );

  const toggleColumn = (columnName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnName)
        ? prev.filter((col) => col !== columnName)
        : [...prev, columnName]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUserFromGenerator(id); // حذف از سرور
      toast.success("حذف با موفقیت انجام شد.");
      await fetchData();
    } catch (error) {
      toast.error("خطا در حذف:", error);
      toast.error("خطا در حذف مورد. لطفا دوباره تلاش کنید.");
    }
  };

  // وقتی فرم مودال ثبت شد
  const handleAddUserSubmit = async () => {
    // بعد ثبت مجدد داده‌ها را بگیر
    await fetchData();
  };

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="p-2 sm:p-4 print:p-0 mr-0 md:mr-[10rem] bg-white h-fit">
        <div className="mb-4 print:m-0 print:p-0">
          <div className="pb-4 shrink-0 print:p-0">
            <div className="flex flex-col gap-4 print:gap-0 sm:flex-row sm:justify-between sm:items-start">
              <div className="md:ml-16 print:hidden">
                <h1 className="my-0 text-[21px] font-bold text-[#007041]">
                  افراد ثبت کننده طرح و پروژه
                </h1>
              </div>
                   <div className="flex items-center justify-center gap-2 print:hidden">
                <Button
                  className="flex hover:text-[#333333] items-center justify-center px-6"
                  style={{ minWidth: "130px" }}
                  onClick={() => setModalVisible(true)} // باز کردن مودال
                >
                  + افزودن ثبت کننده
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid mb-4 print:mb-0 print:w-full">
          <div className="flex items-center mb-1">
            <div className="flex items-center ml-auto w-fit gap-x-2">
              <div className="relative group print:hidden">
                <button
                  className="flex items-center px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 gap-x-1"
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                >
                  <FilterOutlined />
                  <span>تغییر ستون ها</span>
                </button>

                {showColumnSelector && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px]">
                    {columns.map((col) => (
                      <div
                        key={col.key as string}
                        className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer gap-x-2"
                        onClick={() => toggleColumn(col.title as string)}
                      >
                        <Checkbox
                          checked={selectedColumns.includes(
                            col.title as string
                          )}
                          className="checkbox-green"
                        />
                        <span className="text-xs">{col.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-x-3">
              <Button
                type="text"
                icon={<RedoOutlined />}
                onClick={fetchData}
                className="flex items-center text-xs text-gray-600 print:hidden gap-x-1"
              >
                بروز رسانی
              </Button>
              <Button
                type="text"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                className="flex items-center text-xs text-gray-600 print:hidden gap-x-1"
              >
                پرینت
              </Button>
            </div>
          </div>
        </div>

        <div className="print:w-full overflow-x-auto print:overflow-x-visible relative">
          <Table
            dataSource={data}
            columns={filteredColumns}
            pagination={false}
            className="ant-table-rtl"
            rowKey="key"
            rowClassName={(_, index) => (index % 2 === 1 ? "bg-gray-50" : "")}
          />
        </div>

        {/* مودال فرم اضافه کردن ثبت کننده */}
        <AddUserModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAddUserSubmit}
          kinds={kinds}
          // @ts-expect-error tsx
          users={users}
        />
      </div>
    </>
  );
};

export default ProjectPerposonalAdmin;
