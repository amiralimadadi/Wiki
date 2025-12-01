import React, { useEffect, useState, type JSX } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Typography,
  AutoComplete,
  message,
} from "antd";
import type { User } from "../../forms/CreateKnowledgeContent";
import {
  addUserToOwner,
  fetchCategorys,
  searchFormName,
} from "../../services/auth";

const { Title } = Typography;

interface AddProcessOwnerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

const AddProcessOwnerModal: React.FC<AddProcessOwnerModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [mentionOptions, setMentionOptions] = useState<
    { value: string; label: JSX.Element }[]
  >([]);
  const [mentionInput, setMentionInput] = useState<string>("");

  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchCategorys();

        if (response?.data) {
          setCategory(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleFinish = async (values: any) => {
    if (!values.UserId || !values.category) {
      message.error("لطفاً کاربر و دسته بندی را انتخاب کنید.");
      return;
    }

    const result = await addUserToOwner(values.UserId, values.category);

    if (result?.isSuccess) {
      message.success("مالک با موفقیت افزوده شد");
      form.resetFields();
      onSubmit?.();
      onClose();
    } else {
      message.error(result?.message || "خطا در افزودن مالک");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      closable
      className="rtl"
    >
      <div className="pb-2 border-b border-gray-200 ">
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
          <Form.Item label="دسته بندی" name="category">
            <Select
              className="custom-select"
              placeholder="انتخاب کنید"
              onChange={(value) => setSelectedCategoryId(value)}
              value={selectedCategoryId ?? undefined}
              allowClear
              style={{
                backgroundColor: "white",
              }}
            >
              {category.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.goalTitle}
                </Select.Option>
              ))}
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
            <input type="hidden" />
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

export default AddProcessOwnerModal;
