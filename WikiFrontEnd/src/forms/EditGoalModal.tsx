import { useEffect, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import DatePicker from "@hassanmojab/react-modern-calendar-datepicker";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";

const { Option } = Select;
const { TextArea } = Input;

const toPersianNumber = (num: string | number) => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return num?.toString().replace(/\d/g, (d) => persianDigits[d]) || "";
};

const formatJalaliDate = (date: any) => {
  if (!date) return null;
  const { year, month, day } = date;
  return `${year}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}`;
};

const EditGoalModal = ({
  open,
  onClose,
  onSubmit,
  initialData,
  parentCategories,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: any;
  parentCategories: { value: number; label: string }[];
}) => {
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.goalTitle,
        description: initialData.goalDescription,
        parentCategory: initialData.parentId,
      });
      setStartDate(parseJalaliDate(initialData.startPersianDate));
      setEndDate(parseJalaliDate(initialData.endPersianDate));
    }
  }, [initialData, form]);

  const parseJalaliDate = (str: string) => {
    if (!str) return null;
    const [year, month, day] = str.split("/").map(Number);
    return { year, month, day };
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || userData.userId;

      const payload = {
        Id: initialData.id,
        GoalTitle: values.title,
        GoalDescription: values.description || "",
        StartPersianDate: formatJalaliDate(startDate),
        EndPersianDate: formatJalaliDate(endDate),
        GoalType: 1,
        ParentId: values.parentCategory || 0,
        UserId: userId,
      };

      onSubmit(payload);
    } catch (error) {
      console.log("Validation Error:", error);
    }
  };

  return (
    <Modal
      title="ویرایش دسته بندی"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      footer={
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="w-[129.99px] h-[32px] rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            بازگشت
          </button>
          <button
            onClick={handleOk}
            className="w-[129.99px] h-[32px] rounded-xl bg-[#137B4F] text-white hover:bg-green-700 transition"
          >
            ثبت
          </button>
        </div>
      }
      width={520}
      centered
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="عنوان دسته بندی"
          rules={[{ required: true, message: "عنوان الزامی است" }]}
        >
          <Input className="custom-input" />
        </Form.Item>

        <Form.Item name="description" label="توضیح">
          <TextArea rows={3} placeholder="توضیح" className="custom-input" />
        </Form.Item>

        <Form.Item name="parentCategory" label="دسته بندی پدر">
          <Select className="custom-input" allowClear placeholder="انتخاب کنید">
            {parentCategories.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="تاریخ شروع">
          <DatePicker
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
                className="custom-datepicker-input custom-input "
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
                className="custom-datepicker-input custom-input"
                placeholder="تاریخ پایان"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditGoalModal;
