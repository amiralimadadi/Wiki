import { Form, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  createQuestion,
  fetchCategorys,
  searchFormName,
  getTagSelecteddAll,
} from "../../services/auth";

export type Tag = { tagTitle: string };
export type User = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  mobileNumber: string;
};

// --- helpers: بی‌وابستگی و خالص ---
const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const QuestionForm = ({ onClose }: { onClose: () => void }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<Tag[]>([]);
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // ← state تگ‌ها

  // ----- Mention state -----
  type MentionOpt = { value: number; label: string; display: string; disabled?: boolean };
  const [mentionOptions, setMentionOptions] = useState<MentionOpt[]>([]);
  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const selectedMentions = (Form.useWatch("mentions", form) ?? []) as Array<{ value: number; label: string }>;
  const [mentionSearch, setMentionSearch] = useState("");

  const onlySaneText = (message: string) => ({
    validator(_: any, value: string) {
      if (typeof value === "string" && value.trim().length > 0) return Promise.resolve();
      return Promise.reject(new Error(message));
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await getTagSelecteddAll();
        if (response && Array.isArray(response.data)) setTags(response.data);
      } catch (e) {
        console.error("Error fetching tags:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategorys();
        if (Array.isArray(data)) setCategory(data);
        else if (Array.isArray(data?.data)) setCategory(data.data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  const isSsoAccount = (u: User) => {
    const email = (u.email || "").trim();
    const local = (email.split("@")[0] || "").toLowerCase();
    const username = (u.userName || "").toLowerCase();
    return local.startsWith("sso") || username.startsWith("sso");
  };

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const data = await searchFormName(text);
      return (Array.isArray(data) ? data : []).filter((u) => !isSsoAccount(u));
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
  };

  const onMentionSearch = async (text: string) => {
    if (!text) return setMentionOptions([]);
    setMentionLoading(true);
    const users = await searchUsers(text);
    const selectedIds = new Set(selectedMentions.map((m) => m.value));
    setMentionOptions(
      users.map((u) => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — \u200E${u.email}`,
        disabled: selectedIds.has(u.id),
      }))
    );
    setMentionLoading(false);
  };


  // ← هندلر تگ‌ها: پاک‌سازی + یکتا + sync با فرم
  const handleTagChange = (value: string[]) => {
    const cleaned = uniq(value.map(sanitizeTag)).filter((v) => v.length > 0);
    setSelectedTags(cleaned);
    form.setFieldsValue({ tags: cleaned });
  };

  const handleFinish = async (values: any) => {
    try {
      const token = localStorage.getItem("sessionId");
      if (!token) throw new Error("توکن یافت نشد");

      const fd = new FormData();
      fd.append("goalIds", values.category); // اگر API آرایه می‌خواهد، به ازای هر id یک بار append کنید.
      fd.append("questionTitle", values.title.trim());
      fd.append("questionText", values.text.trim());

      // تگ‌ها: از فرم یا state بگیر، پاک‌سازی و ارسال
      const rawTags: string[] = values.tags || selectedTags || [];
      const cleanedTags = uniq(rawTags.map(sanitizeTag)).filter((v) => v.length > 0);
      if (cleanedTags.length === 0) {
        form.setFields([{ name: "tags", errors: ["✅ لطفاً حداقل یک تگ انتخاب یا اضافه کنید."] }]);
        return;
      }
      cleanedTags.forEach((tag) => fd.append("Tags", tag));

      if (values.file?.length) {
        values.file.forEach((f: any) => {
          const blob = f.originFileObj ?? f;
          fd.append("questionAttachments", blob);
        });
      }

      if (values.mentions?.length) {
        (values.mentions as Array<{ value: number; label: string }>)
          .map((m) => m.value)
          .forEach((id) => fd.append("MentionUserId", id.toString()));
      }

      const response = await createQuestion(fd, token);
      console.log("✅ موفقیت‌آمیز:", response);

      form.resetFields();
      setSelectedTags([]);
      setMentionOptions([]);

      window.dispatchEvent(new CustomEvent("Question:created", { detail: { id: response?.data?.id } }));
      onClose();
    } catch (error: any) {
      console.error("❌ خطا در ارسال پرسش:", error);
      if (error?.response?.data?.modelErrors) {
        console.error("خطاهای مدل:", error.response.data.modelErrors);
      }
    }
  };

  return (
    <div className="font-yekan">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-2 font-yekan csstom-form"
        style={{ direction: "rtl", font: "BYekan" }}
      >
        {/* 1) دسته‌بندی */}
        <Form.Item
          name="category"
          label="دسته بندی"
          rules={[{ required: true, message: "لطفاً دسته‌بندی را انتخاب کنید." }]}
        >
          <Select
            className="custom-select"
            placeholder="انتخاب کنید"
            showSearch
            allowClear
            optionFilterProp="children"
          >
            {category.map((dep) => (
              <Select.Option key={dep.id} value={dep.id}>
                {dep.goalTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 2) عنوان */}
        <Form.Item
          name="title"
          label="عنوان پرسش"
          rules={[
            { required: true, message: "لطفاً عنوان را وارد کنید." },
            onlySaneText("عنوان معتبر وارد کنید."),
            { max: 300, message: "حداکثر ۳۰۰ کاراکتر." },
          ]}
        >
          <Input className="custom-input pb-2" placeholder="عنوان پرسش" />
        </Form.Item>

        {/* 3) متن */}
        <Form.Item
          name="text"
          label="متن پرسش"
          rules={[
            { required: true, message: "لطفاً متن پرسش را وارد کنید." },
            onlySaneText("متن معتبر وارد کنید."),
          ]}
        >
          <Input.TextArea className="custom-input" rows={4} placeholder="متن پرسش" />
        </Form.Item>

        {/* 4) تگ‌ها با قابلیت افزودن تگ جدید */}
        <Form.Item
          name="tags"
          label="تگ‌ها"
          rules={[
            { required: true, message: "لطفاً حداقل یک تگ انتخاب کنید." },
            {
              validator: (_,_value: string[]) =>
                Array.isArray(_value) && _value.length > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("حداقل یک تگ لازم است.")),
            },
          ]}
        >
          <Select
            className="custom-input"
            mode="tags" // ← فعال‌سازی افزودن تگ جدید
            allowClear
            placeholder="تگ‌ها"
            value={selectedTags}
            onChange={handleTagChange}
            tokenSeparators={[",", "،", ";", "؛"]} // جداکننده‌های فارسی/انگلیسی
            maxTagCount="responsive"
          >
            {tags.map((tag, index) => (
              <Select.Option key={index} value={tag.tagTitle}>
                {tag.tagTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ارجاع (Mention) - اختیاری */}
        <Form.Item label="ارجاع (Mention)" name="mentions">
          <Select
            mode="multiple"
            labelInValue
            showSearch
            searchValue={mentionSearch}
            onSearch={(val) => {
              setMentionSearch(val);
              onMentionSearch(val);
            }}
            autoClearSearchValue={false}
            filterOption={false}
            options={mentionOptions}
            optionLabelProp="label"
            optionRender={(opt) => (
              <div className="font-yekan">{opt.data.display ?? opt.data.label}</div>
            )}
            allowClear
            placeholder="نام افراد را وارد کنید"
            notFoundContent={mentionLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
            tagRender={() => null}
            maxTagCount={0}
            maxTagPlaceholder={null}
            className="font-yekan custom-input mention-select"
          />
        </Form.Item>

        {/* آپلود (اختیاری) */}
        <Form.Item label={null} className="upload-item" colon={false}>
          <div className="upload-box">
            <span className="upload-label">افزودن فایل</span>
            <Form.Item
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList || []}
              noStyle
            >
              <Upload beforeUpload={() => false} showUploadList listType="text" multiple className="upload-trigger">
                <Button icon={<UploadOutlined />} className="upload-btn">
                  انتخاب فایل
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item className="flex justify-end gap-4 font-yekan mt-8">
          <Button
            onClick={() => onClose()}
            className="border-[#007041] font-yekan ml-5 text-[#007041] w-32"
            htmlType="button"
          >
            بازگشت
          </Button>
          <Button type="primary" htmlType="submit" className="bg-[#007041] font-yekan hover:bg-[#009051] w-32">
            ثبت
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default QuestionForm;
