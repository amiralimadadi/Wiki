import React, { useState, type JSX } from "react";
import { Modal, Form, Select, Button, AutoComplete } from "antd";
import { addUserToGenerator, searchFormName } from "../services/auth";
import type { User } from "./CreateKnowledgeContent";
import toast, { Toaster } from "react-hot-toast";

const { Option } = Select;

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  // setUsers را اگر نیاز نداری، از props حذف کن
  onSubmit: (payload: { UserId: number[]; Kind: string }) => Promise<void> | void;
  kinds: string[];
  // fetchData اگر می‌خواهی مستقیم از همین‌جا صدا بزنی، می‌تونی نگه داری
  fetchData?: () => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  visible,
  onClose,
  onSubmit,     // ✅ گرفتم
  kinds,
  fetchData,    // اختیاری
}) => {
  const [form] = Form.useForm();
  const [mentionOptions, setMentionOptions] = useState<{ value: string; label: JSX.Element }[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionInput, setMentionInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false); // ✅ برای جلوگیری از دوباره‌ارسالی

  const normalizePersian = (text: string): string =>
    text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();

  const searchUsers = async (text: string): Promise<User[]> => {
    if (!text) return [];
    try {
      const data = await searchFormName(text);
      const normalizedSearch = normalizePersian(text);
      return (data || []).filter((user: User) =>
        [user.fullName, user.userName, user.email, user.mobileNumber].some(
          (field) => normalizePersian(field || "").includes(normalizedSearch)
        )
      );
    } catch {
      return [];
    }
  };

  const onMentionSearch = async (text: string) => {
    if (!text) {
      setMentionOptions([]);
      return;
    }
    setMentionLoading(true);
    const users = await searchUsers(text);
    setMentionOptions(
      users.map((u) => ({
        value: JSON.stringify(u),
        label: (
          <div className="font-yekan">
            <div><b>{u.fullName}</b></div>
            <div style={{ fontSize: 12, color: "#888" }}>{u.email}</div>
          </div>
        ),
      }))
    );
    setMentionLoading(false);
  };

  const onMentionSelect = (value: string) => {
    try {
      const user: User = JSON.parse(value);
      setMentionInput(`${user.fullName} - ${user.email}`);
      form.setFieldValue("mention", `${user.fullName} - ${user.email}`);
      setSelectedUserId(user.id);
    } catch {
      setMentionInput(value);
      form.setFieldValue("mention", null);
      setSelectedUserId(null);
    }
  };

  const kindMap: Record<string, string> = {
  "پروژه": "Project",
  "طرح": "Proposal",
  "ایده": "Idea",
  "محتوای دانشی": "KnowledgeContent",
  "پرسش و پاسخ": "QuestionAndAnswer",
};

  const handleFinish = async (values: { kind: string; mention: string }) => {
    if (selectedUserId === null) {
      toast.error("لطفا یک کاربر را انتخاب کنید.");
      return;
    }
    if (!kinds.includes(values.kind)) {
      toast.error("نوع دسترسی معتبر نیست.");
      return;
    }

    const kindValue = kindMap[values.kind] || values.kind;
    const payload = { UserId: [selectedUserId], Kind: kindValue };

    try {
      setSubmitting(true); // ✅ شروع
      const res = await addUserToGenerator(payload);

      if (res.isSuccess) {
        toast.success("ثبت با موفقیت انجام شد.");

        // ✅ خیلی مهم: اول والد را آپدیت کن، بعد ببند
        if (onSubmit) {
          await onSubmit(payload);
        } else if (fetchData) {
          await fetchData();
        }

        form.resetFields();
        setSelectedUserId(null);
        setMentionInput("");
        onClose();
      } else {
        toast.error("خطا: " + res.message);
      }
    } catch (error) {
      console.error("❌ خطا در ثبت:", error);
      toast.error("خطا در ثبت اطلاعات. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false); // ✅ پایان
    }
  };

  return (
    <Modal
      title="افزودن ثبت کننده"
      visible={visible}           // اگر AntD v5 داری، به `open={visible}` تغییر بده
      onCancel={() => {
        form.resetFields();
        setSelectedUserId(null);
        setMentionInput("");
        onClose();
      }}
      footer={null}
      centered
      destroyOnClose
      className="print:hidden"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        dir="rtl"
        className="ant-form-rtl"
      >
        <Form.Item
          label="نوع"
          name="kind"
          rules={[{ required: true, message: "لطفا نوع دسترسی را انتخاب کنید" }]}
        >
          <Select placeholder="نوع دسترسی" showArrow allowClear className="ant-select-rtl custom-input">
            {kinds.map((kind) => (
              <Option key={kind} value={kind}>{kind}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="ارجاع (Mention)"
          name="mention"
          rules={[{ required: true, message: "لطفا کاربر را انتخاب کنید" }]}
        >
          <AutoComplete
            className="custom-input"
            options={mentionOptions}
            onSearch={onMentionSearch}
            onSelect={onMentionSelect}
            allowClear
            value={mentionInput}
            onChange={(val) => setMentionInput(val)}
            placeholder="نام فرد را وارد کنید"
            filterOption={false}
            notFoundContent={mentionLoading ? "در حال جستجو..." : "موردی یافت نشد"}
          />
        </Form.Item>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={() => {
              form.resetFields();
              setSelectedUserId(null);
              setMentionInput("");
              onClose();
            }}
            className="px-6 w-[120px]"
            disabled={submitting}
          >
            بازگشت
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="px-6 w-[120px] bg-[#007041]"
            loading={submitting}   // ✅ لودینگ دکمه
          >
            ثبت
          </Button>
        </div>
      </Form>
      <Toaster position="bottom-left" />
    </Modal>
  );
};

export default AddUserModal;
