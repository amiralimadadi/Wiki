import { useEffect, useState } from "react";
import { Form, Input, Select, Button, Upload, message } from "antd";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { CreatePersonal, fetchCategorys, getTagSelecteddAll } from "../services/auth";
import type { Tag } from "./CreateKnowledgeContent";

const { TextArea } = Input;

// --- helpers: پاک‌سازی و یکتا ---
const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const ProposalForm = ({ onClose }: { onClose: () => void }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);

  // شمارش کلمات چکیده
  const MIN_WORDS = 15;
  const countWords = (s: string = "") =>
    s.trim().replace(/\s+/g, " ").split(" ").filter(Boolean).length;

  // ← هندلر تگ‌ها: پاک‌سازی + یکتا + sync با فرم
  const handleTagChange = (value: string[]) => {
    const cleaned = uniq(value.map(sanitizeTag)).filter(v => v.length > 0);
    setSelectedTags(cleaned);
    form.setFieldsValue({ tags: cleaned });
  };

  const onFinish = async (values: any) => {
    const token = localStorage.getItem("sessionId");
    if (!token) {
      message.error("❌ توکن یافت نشد.");
      return;
    }

    try {
      const formData = new FormData();
      const idea = values?.ideaCode?.trim();

      formData.append("GoalId", values.category);
      formData.append("Title", values.title);
      formData.append("IdeaCode", idea && idea.length > 0 ? idea : "null");
      formData.append("Abstract", values.summary);

      // تگ‌ها: از فرم یا state، بعد پاک‌سازی و ارسال
      const rawTags: string[] = values.tags || selectedTags || [];
      const cleanedTags = uniq(rawTags.map(sanitizeTag)).filter(v => v.length > 0);
      if (cleanedTags.length === 0) {
        message.error("❌ لطفاً حداقل یک تگ انتخاب یا اضافه کنید.");
        return;
      }
      cleanedTags.forEach(tag => formData.append("Tags", tag));

      // فایل‌ها
      const files: UploadFile[] = values.files || fileList;
      files.forEach((f) => {
        const rc = f.originFileObj as RcFile | undefined;
        if (rc) formData.append("ProposalAttachments", rc, rc.name);
      });

      const { data: res } = await CreatePersonal(formData, token);

      if (res?.isSuccess) {
        message.success("✅ فرم طرح با موفقیت ارسال شد");
        form.resetFields();
        setFileList([]);
        setSelectedTags([]);
        onClose();
      } else {
        const first = res?.modelErrors?.[0];
        const fallback = res?.message || "❌ ارسال فرم با خطا مواجه شد";
        const msg = first?.modelErrorMessage || fallback;
        message.error(`❌ ${msg}`);

        if (first?.modelPropertyName) {
          const map: Record<string, string> = {
            Title: "title",
            Abstract: "summary",
            IdeaCode: "ideaCode",
            GoalId: "category",
          };
          const fieldName = map[first.modelPropertyName] || first.modelPropertyName;
          form.setFields([{ name: fieldName, errors: [msg] }]);
        }
      }
    } catch (err: any) {
      const api = err?.response?.data;
      const first = api?.modelErrors?.[0];
      const fallback = api?.message || " خطای غیرمنتظره هنگام ارسال فرم";
      const msg = first?.modelErrorMessage || fallback;

      message.error(` ${msg}`);

      if (first?.modelPropertyName) {
        const map: Record<string, string> = {
          Title: "title",
          Abstract: "summary",
          IdeaCode: "ideaCode",
          GoalId: "category",
        };
        const fieldName = map[first.modelPropertyName] || first.modelPropertyName;
        form.setFields([{ name: fieldName, errors: [msg] }]);
      }
      console.error(" خطا در ارسال فرم:", err);
    }
  };

  // داده‌های اولیه
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategorys();
        if (Array.isArray(data)) setCategory(data);
        else if (Array.isArray(data?.data)) setCategory(data.data);
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await getTagSelecteddAll();
        if (response && Array.isArray(response.data)) setTags(response.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    fetchTags();
  }, []);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-md text-right font-yekan csstom-form">
      <div className="mb-4 p-4 bg-custom rounded-lg">
        <p className="font-semibold text-[14px]">دانلود فرم خام ثبت طرح</p>
        <p className="text-[12.25px] text-[#000000A6]">
          ابتدا فرم ثبت طرح را پر کنید و با استفاده از فرم زیر آن را بارگذاری نمایید.
        </p>
        <div className="flex justify-end w-full">
          <Button
            className="w-[130px] mt-2"
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/download/proposal.rar";
              link.download = "طرح-نمونه.zip";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            دانلود
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="category"
          label="دسته بندی"
          className="mt-2 font-yekan csstom-form"
          rules={[{ required: true, message: "لطفا دسته بندی را انتخاب کنید" }]}
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

        <Form.Item label="عنوان" name="title" rules={[{ required: true, message: "عنوان الزامی است" }]}>
          <Input placeholder="عنوان" className="custom-input" />
        </Form.Item>

        <Form.Item label="کد ایده" name="ideaCode">
          <Input placeholder="کد ایده" className="custom-input" />
        </Form.Item>

        <Form.Item
          label="چکیده"
          name="summary"
          rules={[
            { required: true, message: "چکیده الزامی است" },
            {
              validator: (_, value) => {
                const words = countWords(value || "");
                return words >= MIN_WORDS
                  ? Promise.resolve()
                  : Promise.reject(new Error(`چکیده باید حداقل ${MIN_WORDS} کلمه باشد`));
              },
            },
          ]}
        >
          <TextArea rows={4} placeholder="چکیده" className="custom-input" />
        </Form.Item>

        <Form.Item name="tags" label="تگ‌ها" rules={[{ required: true, message: "حداقل یک تگ انتخاب کنید" }]}>
          <Select
            className="custom-input"
            mode="tags"                                        // ← امکان افزودن تگ جدید
            allowClear
            placeholder="تگ‌ها "
            value={selectedTags}
            onChange={handleTagChange}
            tokenSeparators={[",", "،", ";", "؛"]}            // جداکننده‌های فارسی/انگلیسی
            maxTagCount="responsive"
          >
            {tags.map((tag, index) => (
              <Select.Option key={index} value={tag.tagTitle}>
                {tag.tagTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={null} className="upload-item" colon={false}>
          <div className="upload-box">
            <span className="upload-label">افزودن فایل</span>
            <Form.Item
              name="files"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList || []}
              noStyle
              rules={[{ required: true, message: "حداقل یک فایل انتخاب کنید" }]}
            >
              <Upload beforeUpload={() => false} showUploadList listType="text" multiple className="upload-trigger">
                <Button icon={<UploadOutlined />} className="upload-btn">
                  انتخاب فایل
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item className="flex justify-end">
          <Button onClick={onClose} className="w-[130px] bg-white text-black border-[2px] ml-4 no-hover-bg">
            بازگشت
          </Button>
          <Button type="primary" htmlType="submit" className="w-[130px] bg-[#007041] hover:bg-red-600 custom-btn">
            ثبت
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProposalForm;
