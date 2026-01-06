import React, { useRef, useState } from "react";
import { Modal, Form, Select, Button, Typography } from "antd";
import { searchFormName } from "../../services/auth";
import type { User } from "../../forms/CreateKnowledgeContent";

const { Title } = Typography;

type MentionOpt = {
  value: number;
  label: string;
  display: string;
};

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

  // --- mention states ---
  const [mentionOptions, setMentionOptions] = useState<MentionOpt[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");

  // جلوگیری از برگشت نتایج قدیمی
  const fetchIdRef = useRef(0);

  // debounce
  const debounceTimerRef = useRef<number | null>(null);

  const isSsoAccount = (u: User) => {
    const email = (u.email || "").trim();
    const local = (email.split("@")[0] || "").toLowerCase();
    const username = (u.userName || "").toLowerCase();
    return local.startsWith("sso") || username.startsWith("sso");
  };

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const data = await searchFormName(text);
      return (Array.isArray(data) ? data : []).filter(
        (u: User) => !isSsoAccount(u)
      );
    } catch {
      return [];
    }
  };

  const doMentionSearch = async (text: string) => {
    const myFetchId = ++fetchIdRef.current;

    if (!text) {
      setMentionLoading(false);
      setMentionOptions([]);
      return;
    }

    setMentionLoading(true);
    const users = await searchUsers(text);

    if (myFetchId !== fetchIdRef.current) return;

    setMentionOptions(
      users.map((u) => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — \u200E${u.email}`,
      }))
    );

    setMentionLoading(false);
  };

  const onMentionSearch = (text: string) => {
    setMentionSearch(text);

    if (debounceTimerRef.current)
      window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
      doMentionSearch(text);
    }, 200);
  };

  const resetMention = () => {
    fetchIdRef.current++;
    setMentionSearch("");
    setMentionOptions([]);
    setMentionLoading(false);
  };

  const handleFinish = (values: any) => {
    const kindMap: Record<string, string> = {
      "ویکی": "Wiki",
      "پروژه": "Project",
      "طرح": "Proposal",
      "ایده": "Idea",
      "محتوای دانشی": "KnowledgeContent",
      "پرسش و پاسخ": "QuestionAndAnswer",
    };

    onSubmit({
      UserId: values.UserId,
      Kind: kindMap[values.kind],
    });

    form.resetFields();
    resetMention();
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        resetMention();
        onClose();
      }}
      footer={null}
      closable
      destroyOnClose
      className="rtl"
    >
      <div className="pb-2 border-b border-gray-200">
        <Title level={5} className="mb-0">
          افزودن ادمین سیستم
        </Title>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Form form={form} layout="vertical" onFinish={handleFinish} className="rtl">
          <Form.Item
            name="kind"
            label="نوع نقش"
            rules={[{ required: true, message: "نوع نقش را انتخاب کنید" }]}
          >
            <Select placeholder="نوع نقش را انتخاب کنید" className="custom-input">
              <Select.Option value="ویکی">ویکی</Select.Option>
              <Select.Option value="پروژه">پروژه</Select.Option>
              <Select.Option value="طرح">طرح</Select.Option>
              <Select.Option value="ایده">ایده</Select.Option>
              <Select.Option value="محتوای دانشی">محتوای دانشی</Select.Option>
              <Select.Option value="پرسش و پاسخ">پرسش و پاسخ</Select.Option>
            </Select>
          </Form.Item>

          {/* انتخاب کاربر */}
{/* کاربر (برای نمایش اسم) */}
<Form.Item
  label="کاربر"
  name="User"
  rules={[{ required: true, message: "کاربر را انتخاب کنید" }]}
>
  <Select
    showSearch
    labelInValue
    filterOption={false}
    searchValue={mentionSearch}
    onSearch={onMentionSearch}
    autoClearSearchValue={false}
    options={mentionOptions}
    optionLabelProp="label"
    optionRender={(opt) => (
      <div className="font-yekan">{opt.data.display ?? opt.data.label}</div>
    )}
    allowClear
    placeholder="نام فرد را وارد کنید"
    notFoundContent={mentionLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
    className="font-yekan custom-input mention-select"
    onChange={(val) => {
      // val: { value:number, label: ReactNode } | undefined
      if (!val) {
        form.setFieldValue("UserId", null);
        resetMention();
        return;
      }
      form.setFieldValue("UserId", val.value); // ✅ فقط id برای ارسال
      resetMention(); // (اختیاری) مثل قبل
    }}
  />
</Form.Item>

{/* فقط برای ارسال به بک‌اند */}
<Form.Item name="UserId" hidden>
  <input type="hidden" />
</Form.Item>


          <div className="flex justify-end gap-4 mt-8">
            <Button
              htmlType="button"
              onClick={() => {
                form.resetFields();
                resetMention();
                onClose();
              }}
              className="w-32"
            >
              بازگشت
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#007041] w-32"
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
