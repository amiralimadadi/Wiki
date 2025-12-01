import React, { useEffect, useRef, useState } from "react";
import { Button, Table, Checkbox, Dropdown } from "antd";
import { Toaster, toast } from "react-hot-toast";
import {
  RedoOutlined,
  PrinterOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import NoDataIcon from "../../svgs/NoDataIcon";
import SubstituteForm from "../../forms/SubstituteForm";

const SubstituteComponent: React.FC = () => {
  const [columns, setColumns] = useState([
    { title: "ردیف", dataIndex: "index", key: "index" },
    { title: "نام", dataIndex: "name", key: "name" },
    { title: "واحد", dataIndex: "unit", key: "unit" },
    { title: "عملیات", dataIndex: "actions", key: "actions" },
  ]);

  const dataSource: any[] = [];

  const allColumnOptions = [
    { label: "ردیف", key: "index" },
    { label: "نام", key: "name" },
    { label: "واحد", key: "unit" },
    { label: "عملیات", key: "actions" },
  ];

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const toastShown = useRef<boolean>(false);

  const handleColumnChange = (key: string, checked: boolean) => {
    const exists = columns.find((col) => col.key === key);
    if (checked && !exists) {
      const newCol = allColumnOptions.find((c) => c.key === key);
      setColumns((prev) => [
        ...prev,
        { title: newCol?.label, dataIndex: key, key },
      ]);
    } else if (!checked && exists) {
      setColumns((prev) => prev.filter((col) => col.key !== key));
    }
  };

  useEffect(() => {
    if (!toastShown.current) {
      toastShown.current = true;
      toast.error("شما مجاز به مشاهده جانشینان این واحد نیستید");
    }
  }, []);

  const columnMenu = (
    <div className="rounded-xl shadow-xl bg-white min-w-[100px] z-10">
      {allColumnOptions.map((col) => (
        <div
          key={col.key}
          className="flex items-center px-2 py-1 cursor-pointer gap-x-2 hover:bg-gray-100"
        >
          <Checkbox
            checked={!!columns.find((c) => c.key === col.key)}
            onChange={(e) => handleColumnChange(col.key, e.target.checked)}
          />
          <span className="text-xs whitespace-nowrap">{col.label}</span>
        </div>
      ))}
    </div>
  );

  // فرض می‌کنیم این لیست کاربران برای فرم جانشین هست:
  const users = [
    { id: "1", name: "کاربر اول" },
    { id: "2", name: "کاربر دوم" },
  ];

  const handleSubmit = (values: number[]) => {
    console.log("Selected IDs:", values);
    setModalVisible(false);
  };

  return (
    <div className="p-4 print:p-0 bg-white mt-[2rem]">
      <div className="mb-4">
        <div className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="md:ml-16 hidden print:block sm:block">
              <p className="text-[21px] text-[#007041] font-bold">جانشین ها</p>
            </div>
            <div className="hidden text-xs print:block">
              <p className="m-0">پنل مدیریتی تیپاکس یکپارچه - IGT</p>
              <p className="m-0">۱۸:۳۰ دوشنبه ۱۴۰۴/۰۴/۱۶</p>
            </div>
            <div className="flex items-center justify-center gap-2 print:hidden">
              <Button
                type="default"
                className="px-6 min-w-[130px] no-hover-bg"
                onClick={() => setModalVisible(true)}
              >
                افزودن جانشین
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 print:mb-0">
        <div className="flex items-center mb-2 justify-between">
          <div className="flex gap-2">
            <Dropdown overlay={columnMenu} trigger={["hover"]}>
              <div className="flex items-center px-3 text-xs rounded-full cursor-pointer bg-gray-100 hover:bg-gray-200 gap-1">
                <FilterOutlined /> تغییر ستون ها
              </div>
            </Dropdown>
          </div>
          <div className="flex gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1 cursor-pointer">
              <RedoOutlined /> بروز رسانی
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <PrinterOutlined /> پرینت
            </div>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible relative">
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            locale={{
              emptyText: (
                <div className="flex flex-col items-center gap-2">
                  <NoDataIcon />
                  <p className="text-gray-800">داده ای موجود نیست</p>
                </div>
              ),
            }}
            className="ant-table-rtl"
            bordered
            size="middle"
          />
        </div>
      </div>

      <SubstituteForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        users={users}
      />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default SubstituteComponent;
