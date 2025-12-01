import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import toast, { Toaster } from "react-hot-toast";

import { DeleteOutlined } from "@ant-design/icons";
import { toPersianDigits } from "../utils/persianNu";
import { getGroupWork, deleteGroupWork } from "../services/auth";
import AddUserGroup from "../forms/AddUserGroup";

interface PositionData {
  key: number;
  id: number;
  row: number;
  positionName: string;
  unitName: string;
}

const GroupWorkAdmin: React.FC = () => {
  const [selectedColumns /*setSelectedColumns*/] = useState<string[]>([
    "ردیف",
    "عنوان",
    "واحد",
    "عملیات",
  ]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [data, setData] = useState<PositionData[]>([]);

  // دریافت داده از سرور و تنظیم state
  const fetchData = async () => {
    try {
      const response = await getGroupWork();
      if (response.isSuccess && Array.isArray(response.data)) {
        const mappedData = response.data.map((item: any, index: number) => ({
          key: item.positionId,
          id: item.positionId,
          row: index + 1,
          positionName: item.positionName,
          unitName: item.unit?.unitName || "نامشخص",
        }));
        setData(mappedData);
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

  const handleDelete = async (positionId: number) => {
    try {
      await deleteGroupWork(positionId);
      toast.success("حذف با موفقیت انجام شد.");
      fetchData();
    } catch (error) {
      console.error("خطا در حذف:", error);
      toast.error("خطا در حذف مورد. لطفا دوباره تلاش کنید.");
    }
  };

  const handleAddSuccess = () => {
    fetchData();
    setModalVisible(false);
  };

  const columns = [
    {
      title: "ردیف",
      dataIndex: "row",
      key: "row",
      width: 60,
      render: (text: number) => <span>{toPersianDigits(text)}</span>,
    },
    {
      title: "عنوان",
      dataIndex: "positionName",
      key: "positionName",
    },
    {
      title: "واحد",
      dataIndex: "unitName",
      key: "unitName",
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: PositionData) => (
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

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="p-4 bg-white  mx-auto rounded shadow-sm mr-[10rem]">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-[#007041] text-[21px] font-bold">گروه کاری</h1>
            <Button onClick={() => setModalVisible(true)}>افزودن سمت</Button>
          </div>
          <div className="flex gap-3 print:hidden">
            {/* <div className="relative">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                تغییر ستون‌ها
              </Button>
              {showColumnSelector && (
                <div className="absolute z-10 bg-white border rounded p-2 mt-1 shadow-md">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1"
                      onClick={() => toggleColumn(col.title as string)}
                    >
                      <Checkbox
                        checked={selectedColumns.includes(col.title as string)}
                      />
                      <span>{col.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
            {/* <Button icon={<RedoOutlined />} onClick={fetchData}>
              بروزرسانی
            </Button> */}
            {/* <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              پرینت
            </Button> */}
          </div>
        </div>

        <Table
          dataSource={data}
          columns={filteredColumns}
          pagination={false}
          rowKey="key"
          className="ant-table-rtl"
          rowClassName={(_, index) => (index % 2 === 1 ? "bg-gray-50" : "")}
        />
      </div>
      <AddUserGroup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
};

export default GroupWorkAdmin;
