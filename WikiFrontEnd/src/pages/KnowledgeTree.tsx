import { useEffect, useState } from "react";
import moment from "moment-jalaali";
import {
  Table,
  Checkbox,
  Dropdown,
  Modal,
  Select,
  Input,
  Form,
  Popconfirm,
} from "antd";
import {
  createGoal,
  deleteTree,
  getGoalTree,
  updateGoal,
} from "../services/auth";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomIcon from "../iconSaidbar/CustomIcon";
import PrinterIcon from "../iconSaidbar/PrinterIcon";
import RedoIcon from "../iconSaidbar/RedoIcon";
import DatePicker from "@hassanmojab/react-modern-calendar-datepicker";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import toast, { Toaster } from "react-hot-toast";
import { Alert } from "../types/enumes";
import EditGoalModal from "../forms/EditGoalModal";

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

const { Option } = Select;
const { TextArea } = Input;

const toPersianNumber = (num) => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return num?.toString().replace(/\d/g, (d) => persianDigits[d]) || "";
};

let handleEdit;

const formatJalaliDate = (date) => {
  if (!date) return null;
  const { year, month, day } = date;
  return `${year}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}`;
};

const GoalTable = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [parentCategories, setParentCategories] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || 0;

  const handleDelete = async (record) => {
    try {
      await deleteTree(record.id);
      toast.success(Alert.deleted);
      fetchGoalTree();
    } catch (error) {
      console.error("❌ خطا در حذف:", error);
    }
  };

  handleEdit = (record) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const allColumns = [
    {
      title: <span className="text-[12px] text-[#333333]">ردیف</span>,
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => toPersianNumber(index + 1),
    },
    {
      title: <span className="text-[12px] text-[#333333]">عنوان</span>,

      dataIndex: "goalTitle",
      key: "goalTitle",
      render: (text) => <span style={{ fontSize: "12px" }}>{text}</span>,
    },
    {
      title: <span className="text-[12px] text-[#333333]">شرح</span>,

      dataIndex: "goalDescription",
      key: "goalDescription",
      render: (text) => <span style={{ fontSize: "12px" }}>{text}</span>,
    },
    {
      title: <span className="text-[12px] text-[#333333]">نوع</span>,

      dataIndex: "goalTypeDescription",
      key: "goalTypeDescription",
      render: (text) => <span style={{ fontSize: "12px" }}>{text}</span>,
    },
    {
      title: <span className="text-[12px] text-[#333333]">دسته بندی پدر</span>,

      dataIndex: "parentTitle",
      key: "parentTitle",
      render: (text) => <span style={{ fontSize: "12px" }}>{text}</span>,
    },
    {
      title: <span className="text-[11px] text-[#333333]">تاریخ شروع</span>,

      dataIndex: "startPersianDate",
      key: "startPersianDate",
      render: (text) =>
        text ? (
          <span style={{ fontSize: "12px" }}>{toPersianNumber(text)}</span>
        ) : (
          "-"
        ),
    },
    {
      title: <span className="text-[11px] text-[#333333]">تاریخ پایان</span>,

      dataIndex: "endPersianDate",
      key: "endPersianDate",
      render: (text) =>
        text ? (
          <span style={{ fontSize: "12px" }}>{toPersianNumber(text)}</span>
        ) : (
          "-"
        ),
    },
    {
      title: <span className="text-[12px] text-[#333333]">عملیات</span>,

      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-3 justify-center">
          <Popconfirm
            title="آیا این مورد حذف شود؟"
            onConfirm={() => handleDelete(record)}
            okText=<span className="text-white bg-[#137C4F] font-bold">
              تایید
            </span>
            cancelText="لغو"
            placement="topRight"
            okButtonProps={{
              style: {
                backgroundColor: "#007041",
                borderColor: "#007041",
                color: "#fff",
              },
            }}
          >
            <DeleteOutlined
              style={{ color: "#EF212C", cursor: "pointer", fontSize: "16px" }}
              title="حذف"
            />
          </Popconfirm>
          <EditOutlined
            style={{ color: "#88B0A1", cursor: "pointer", fontSize: "16px" }}
            onClick={() => handleEdit(record)}
            title="ویرایش"
          />
        </div>
      ),
    },
  ];

  const fetchGoalTree = async () => {
    setLoading(true);
    try {
      const response = await getGoalTree();
      setData(response.data);
      setParentCategories(
        response.data.map((item) => ({
          value: item.id,
          label: item.goalTitle,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnToggle = (key) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const goalData = {
        goalTitle: values.title,
        goalDescription: values.description || "",
        startPersianDate: formatJalaliDate(startDate),
        endPersianDate: formatJalaliDate(endDate),
        goalType: 1,
        parentId: values.parentCategory || 0,
        userId: userId,
      };
      // @ts-expect-error tsx

      const response = await createGoal(goalData);
      toast.success(Alert.deleted);

      form.resetFields();
      setStartDate(null);
      setEndDate(null);
      setIsModalVisible(false);
      fetchGoalTree();
    } catch (error) {
      if (error.response?.data?.modelErrors) {
        alert(
          "🛑 خطا در اعتبارسنجی:\n" +
            JSON.stringify(error.response.data.modelErrors, null, 2)
        );
      } else {
        console.error("❌ خطا در ارسال:", error);
      }
    }
  };

  useEffect(() => {
    fetchGoalTree();
    setVisibleKeys(allColumns.map((col) => col.key));
  }, []);

  useEffect(() => {
    setColumns(allColumns.filter((col) => visibleKeys.includes(col.key)));
  }, [visibleKeys]);

  const handlePrint = () => window.print();

  const columnCheckboxMenu = (
    <div className="p-2 bg-white rounded shadow">
      {allColumns.map((col) => (
        <div key={col.key}>
          <Checkbox
            checked={visibleKeys.includes(col.key)}
            onChange={() => handleColumnToggle(col.key)}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-xl shadow mr-0 md:mr-[10rem]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[21px] text-[#007041] font-bold">درخت دانش</h1>
        <div className="flex gap-2">
          <button className="border px-4 py-1 rounded-xl text-sm">
            بستن همه
          </button>
          <button
            className="border px-4 py-1 rounded-xl text-sm"
            onClick={() => setIsModalVisible(true)}
          >
            افزودن دسته بندی
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <Dropdown overlay={columnCheckboxMenu} trigger={["hover"]}>
          <div className="cursor-pointer flex items-center gap-1 border px-2 py-1 rounded">
            <span className="text-sm">تغییر ستون‌ها</span>
            <CustomIcon size={12} color="#575759" />
          </div>
        </Dropdown>

        <div className="flex gap-4 items-center text-xs text-gray-600">
          <div
            className="cursor-pointer flex gap-1 items-center"
            onClick={fetchGoalTree}
          >
            <RedoIcon />
            به‌روزرسانی
          </div>
          <div
            className="cursor-pointer flex gap-1 items-center"
            onClick={handlePrint}
          >
            <PrinterIcon />
            پرینت
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        rowClassName={(_record, index) =>
          index % 2 === 0 ? "even-row" : "odd-row"
        }
      />

      <Modal
        title="ایجاد دسته بندی"
        centered
        open={isModalVisible}
        onOk={handleSubmit}
        okButtonProps={{
          style: {
            backgroundColor: "#007041",
            borderColor: "#007041",
            color: "#fff",
          },
        }}
        onCancel={() => {
          form.resetFields();
          setIsModalVisible(false);
        }}
        okText="ثبت"
        cancelText="بازگشت"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="عنوان دسته بندی"
            rules={[{ required: true, message: "عنوان الزامی است" }]}
          >
            <Input className="custom-input" placeholder="عنوان دسته بندی" />
          </Form.Item>
          <Form.Item name="description" label="توضیح">
            <TextArea rows={3} placeholder="توضیح" className="custom-input" />
          </Form.Item>
          <Form.Item name="parentCategory" label="دسته بندی پدر">
            <Select
              className="custom-input"
              allowClear
              placeholder="انتخاب کنید"
            >
              {parentCategories.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="تاریخ شروع">
            <DatePicker
              calendarClassName="custom-calendar"
              value={startDate}
              onChange={setStartDate}
              locale="fa"
              calendarPopperPosition="top"
              shouldHighlightWeekends
              colorPrimary="#007041"
              renderInput={({ ref }) => (
                <input
                  ref={ref as React.Ref<HTMLInputElement>}
                  readOnly
                  value={toPersianNumber(formatJalaliDate(startDate)) || ""}
                  className="custom-datepicker-input "
                  placeholder="تاریخ شروع"
                />
              )}
            />
          </Form.Item>
          <Form.Item label="تاریخ پایان">
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              locale="fa"
              calendarPopperPosition="top"
              shouldHighlightWeekends
              colorPrimary="#007041"
              renderInput={({ ref }) => (
                <input
                  ref={ref as React.Ref<HTMLInputElement>}
                  readOnly
                  value={toPersianNumber(formatJalaliDate(endDate)) || ""}
                  className="custom-datepicker-input"
                  placeholder="تاریخ پایان"
                />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "14px",
            borderRadius: "8px",
            width: "312px",
            height: "63px",
          },
        }}
      />

      <EditGoalModal
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialData={editData}
        parentCategories={parentCategories}
        onSubmit={async (updatedData) => {
          await updateGoal(updatedData);
          toast.success("با موفقیت ویرایش شد");
          setEditModalVisible(false);
          fetchGoalTree();
        }}
      />
    </div>
  );
};

export default GoalTable;
