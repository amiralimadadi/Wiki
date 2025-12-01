import React, { useEffect, useState } from "react";
import { Table, Checkbox, Dropdown, Button } from "antd";
import {
  FilterOutlined,
  RedoOutlined,
  PrinterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { getProjectAdmin } from "../services/auth";
import type { MenuProps } from "antd";
import ApprovalProjectModal from "../components/common/ApprovalProjectModal";
import NoDataIcon from "../svgs/NoDataIcon";

interface PlanData {
  key: string;
  row: number;
  title: string;
  category: string;
  goalId: number;
  abstract: string;
  creator: string;
  projectCode: string;
  ideaCode: string;
  planCode: string;
  attachments?: {
    id: number;
    name: string;
    address: string;
  }[];
}

const ProjectConfirmAdmin: React.FC = () => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "row",
    "title",
    "category",
    "abstract",
    "creator",
    "projectCode",
    "ideaCode",
    "planCode",
    "actions",
  ]);
  const [data, setData] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

  const allColumns = [
    { key: "row", label: "ردیف" },
    { key: "title", label: "عنوان" },
    { key: "category", label: "دسته بندی" },
    { key: "abstract", label: "چکیده" },
    { key: "creator", label: "ایجاد کننده" },
    { key: "projectCode", label: "کد پروژه" },
    { key: "ideaCode", label: "کد ایده" },
    { key: "planCode", label: "کد طرح" },
    { key: "actions", label: "عملیات" },
  ];

  const handleColumnToggle = (columnKey: string) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter((key) => key !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const columns = allColumns
    .filter((column) => selectedColumns.includes(column.key))
    .map((column) => {
      if (column.key === "actions") {
        return {
          title: column.label,
          key: column.key,
          render: (_: any, record: PlanData) => (
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-primary"
              onClick={() => {
                setSelectedPlan(record);
                setModalOpen(true);
              }}
            />
          ),
        };
      }
      return {
        title: column.label,
        dataIndex: column.key,
        key: column.key,
      };
    });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await getProjectAdmin();
        if (Array.isArray(response)) {
          const mappedData: PlanData[] = response.map((item, index) => ({
            key: item.id.toString(),
            row: index + 1,
            title: item.title,
            category: item.goalTitle,
            goalId: item.goalId,
            goalTitle: item.goalTitle,
            abstract: item.abstract,
            creator: item.user?.fullName || "نامشخص",
            projectCode: item.code,
            ideaCode: item.ideaCode,
            attachments: item.attachments || [],
            planCode: "",
          }));
          setData(mappedData);
        }
      } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const columnMenuItems: MenuProps["items"] = allColumns.map((column) => ({
    key: column.key,
    label: (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedColumns.includes(column.key)}
          onChange={() => handleColumnToggle(column.key)}
        />
        <span>{column.label}</span>
      </div>
    ),
  }));

  return (
    <div className="p-2 rounded-xl sm:p-4 print:p-0 sm:print:p-0 bg-white mr-[10rem]">
      <div className="mb-4 print:m-0 print:p-0">
        <div className="pb-4 shrink-0 print:p-0">
          <div className="flex flex-col gap-4 print:gap-0 sm:flex-row sm:justify-between sm:items-start">
            <div className="md:ml-16 print:hidden">
              <h1 className="my-0 text-[21px] text-[#007041] font-bold text-tPrimary">
                پروژه های در انتظار تایید
              </h1>
            </div>

          </div>
        </div>
      </div>

      <div className="grid mb-4 print:mb-0 print:w-full">
        <div className="flex items-center mb-[5px]">
          <div className="flex items-center ml-auto w-fit gap-x-2">
            <Dropdown
              menu={{ items: columnMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
              className="print:hidden"
            >
              <div>
                <Button className="flex bg-gray-100 p-0 w-[100px] items-center gap-1 text-[10.49px] border-none rounded-full ">
                  <FilterOutlined />
                  <span>تغییر ستون ها</span>
                </Button>
              </div>
            </Dropdown>
          </div>
          <div className="flex gap-3">
            <Button
              type="text"
              className="flex items-center gap-1 text-[10.49px] text-tSecondary print:hidden"
              icon={<RedoOutlined />}
            >
              بروز رسانی
            </Button>
            <Button
              onClick={() => window.print()}
              type="text"
              className="flex items-center gap-1 text-[10.49px] text-tSecondary print:hidden"
              icon={<PrinterOutlined />}
            >
              پرینت
            </Button>
          </div>
        </div>
      </div>

      <div className="print:w-full overflow-x-auto print:overflow-x-visible relative">
        <Table
          dataSource={data}
          columns={columns}
          size="middle"
          className="ant-table-rtl"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: (
              <div
                className="flex flex-col items-center gap-2"
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                <NoDataIcon />
                <p className="font-bold text-gray-500"> داده‌ای موجود نیست</p>
              </div>
            ),
          }}
        />
      </div>

      {modalOpen && selectedPlan && (
        <ApprovalProjectModal
          visible={modalOpen}
          onCancel={() => setModalOpen(false)}
          data={selectedPlan}


          onSubmit={(values) => {
            console.log("ارسال تایید طرح:", values);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectConfirmAdmin;
