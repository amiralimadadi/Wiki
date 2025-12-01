import React, { useState, type JSX } from "react";
import { Modal, Form, Button, AutoComplete } from "antd";
import { searchFormName } from "../services/auth";
import type { User } from "./CreateKnowledgeContent";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: number[]) => void;
  users: { id: string; name: string }[];
}

const SubstituteForm: React.FC<Props> = ({ visible, onCancel, onSubmit }) => {
  const [mentionOptions, setMentionOptions] = useState<
    { value: string; label: JSX.Element }[]
  >([]);
  const [mentionInput, setMentionInput] = useState<string>("");
  const [selectedMentionUserId, setSelectedMentionUserId] = useState<
    number | null
  >(null);
  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const normalizePersian = (text: string): string => {
    return text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();
  };

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const data = await searchFormName(text);
      const normalizedSearch = normalizePersian(text);

      return (data || []).filter((user: User) => {
        return (
          normalizePersian(user.fullName || "").includes(normalizedSearch) ||
          normalizePersian(user.userName || "").includes(normalizedSearch) ||
          normalizePersian(user.email || "").includes(normalizedSearch) ||
          normalizePersian(user.mobileNumber || "").includes(normalizedSearch)
        );
      });
    } catch (error) {
      console.error("Search error:", error);
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

    const options = users.slice(1, 2).map((user: User) => ({
      value: JSON.stringify(user),
      label: (
        <div className="font-yekan">
          <div>
            <b>{user.fullName}</b>
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>{user.email}</div>
        </div>
      ),
    }));

    setMentionOptions(options);
    setMentionLoading(false);
  };

  const onMentionSelect = (value: string) => {
    try {
      const user = JSON.parse(value) as User;
      setMentionInput(`${user.fullName} - ${user.email}`);
      setSelectedMentionUserId(user.id);
      form.setFieldValue("mention", `${user.fullName} - ${user.email}`);
    } catch {
      setMentionInput(value);
      setSelectedMentionUserId(null);
      form.setFieldValue("mention", null);
    }
  };

  const handleFinish = () => {
    if (selectedMentionUserId) {
      onSubmit([selectedMentionUserId]);
      form.resetFields();
      setMentionInput("");
      setSelectedMentionUserId(null);
    }
  };

  return (
    <Modal
      title="افزودن جانشین"
      open={visible}
      onCancel={() => {
        form.resetFields();
        setMentionInput("");
        setSelectedMentionUserId(null);
        onCancel();
      }}
      footer={null}
      width={520}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} dir="rtl">
        <Form.Item label="ارجاع (Mention)" name="mention">
          <AutoComplete
            className="custom-input"
            options={mentionOptions}
            style={{ width: "100%" }}
            onSearch={onMentionSearch}
            onSelect={onMentionSelect}
            value={mentionInput}
            allowClear
            onChange={setMentionInput}
            placeholder="نام فرد را وارد کنید"
            notFoundContent={
              mentionLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"
            }
          />
        </Form.Item>

        <Form.Item
          style={{ textAlign: "right", display: "flex", justifyContent: "end" }}
        >
          <Button
            className="ml-4"
            style={{ minWidth: 130 }}
            onClick={() => {
              form.resetFields();
              setMentionInput("");
              setSelectedMentionUserId(null);
              onCancel();
            }}
          >
            بازگشت
          </Button>

          <button
            type="submit"
            className="bg-[#007041] w-[130px] h-[32px] rounded-xl text-white"
            style={{ minWidth: 130, marginLeft: 16 }}
          >
            ثبت
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubstituteForm;
