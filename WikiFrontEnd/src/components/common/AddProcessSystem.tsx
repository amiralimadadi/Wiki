import React, { useState, type JSX } from "react";
import { Modal, Form, Select, Button, Typography, AutoComplete } from "antd";
import { searchFormName } from "../../services/auth";
import type { User } from "../../forms/CreateKnowledgeContent";

const { Option } = Select;
const { Title } = Typography;

interface AddProcessOwnerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const AddProcessSystem: React.FC<AddProcessOwnerModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [mentionOptions, setMentionOptions] = useState<
    { value: string; label: JSX.Element }[]
  >([]);
  const [mentionInput, setMentionInput] = useState<string>("");

  const handleFinish = (values: any) => {
    const kindMap: Record<string, string> = {
      "ویکی": "Wiki",
      "پروژه": "Project",
      "طرح": "Proposal",
      "ایده": "Idea",
      "محتوای دانشی": "KnowledgeContent",
      "پرسش و پاسخ": "QuestionAndAnswer",
    };

    const payload = {
      UserId: values.UserId,
      Kind: kindMap[values.kind],
    };

    onSubmit(payload);
    form.resetFields();
  };

  const normalizePersian = (text: string): string =>
    text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();

  const searchUsers = async (text: string): Promise<User[]> => {
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

  const onMentionSelect = (value: string) => {
    try {
      const user = JSON.parse(value);
      setMentionInput(`${user.fullName} - ${user.email}`);
      form.setFieldValue("mention", `${user.fullName} - ${user.email}`);
      form.setFieldValue("UserId", user.id);
    } catch {
      setMentionInput(value);
      form.setFieldValue("mention", null);
      form.setFieldValue("UserId", null);
    }
  };

  const onMentionSearch = async (text: string) => {
    if (!text) return setMentionOptions([]);
    const users = await searchUsers(text);
    setMentionOptions(
      users.slice(1, 2).map((u) => ({
        value: JSON.stringify(u),
        label: (
          <div className="font-yekan">
            <div>
              <b>{u.fullName}</b>
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{u.email}</div>
          </div>
        ),
      }))
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      className="rtl"
    >
      <div className="pb-2 border-b border-gray-200">
        <Title level={5} className="mb-0">
          افزودن مالک فرایند
        </Title>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="rtl"
        >
          <Form.Item name="kind" label="نوع نقش">
            <Select
              placeholder="نوع نقش را انتخاب کنید"
              className="text-right custom-input"
            >
              <Option value="ویکی">ویکی</Option>
              <Option value="پروژه">پروژه</Option>
              <Option value="طرح">طرح</Option>
              <Option value="ایده">ایده</Option>
              <Option value="محتوای دانشی">محتوای دانشی</Option>
              <Option value="پرسش و پاسخ">پرسش و پاسخ</Option>
            </Select>
          </Form.Item>

          <Form.Item label="کاربر" name="mention">
            <AutoComplete
              className="custom-input"
              options={mentionOptions}
              onSearch={onMentionSearch}
              onSelect={onMentionSelect}
              value={mentionInput}
              onChange={(val) => setMentionInput(val)}
              placeholder="نام فرد را وارد کنید"
              filterOption={false}
              allowClear
            />
          </Form.Item>

          <Form.Item name="UserId" hidden>
            <input type="hidden" className="custom-input" />
          </Form.Item>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <Button
              htmlType="button"
              onClick={() => {
                form.resetFields();
                onClose();
              }}
              className="px-6 w-[120px]"
            >
              بازگشت
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="px-6 bg-[#007041] custom-btn w-[120px]"
            >
              ثبت
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddProcessSystem;
