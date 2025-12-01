import { Form, Input, Select, Button, Upload, Row, Col, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  CreateUnitDocumentation,
  getTagSelecteddAll,
  getPositionsForCurrentDepartment,
} from "../services/auth";

type Tag = { tagTitle: string };
type PositionItem = { id: number; name: string; unitName?: string };

// --- helpers: پاک‌سازی و یکتا ---
const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const CreateUnitDocumentationForm = ({ onClose }: { onClose: () => void }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<Tag[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // تگ‌ها
  useEffect(() => {
    (async () => {
      try {
        const res = await getTagSelecteddAll();
        if (res && Array.isArray(res.data)) setTags(res.data as Tag[]);
      } catch (e) {
        console.error("Error fetching tags:", e);
      }
    })();
  }, []);

  // سمت‌ها/گروه کاری
  useEffect(() => {
    (async () => {
      try {
        const res = await getPositionsForCurrentDepartment();
        const list = res?.data ?? res?.data?.data ?? [];
        if (res?.isSuccess && Array.isArray(list)) {
          const mapped: PositionItem[] = list.map((p: any) => ({
            id: p.positionId,
            name: p.positionName,
            unitName: p.unit?.unitName,
          }));
          setPositions(mapped);
        } else {
          setPositions([]);
        }
      } catch (e) {
        console.error("Error fetching positions:", e);
        setPositions([]);
      }
    })();
  }, []);

  const handleTagChange = (value: string[]) => {
    const cleaned = uniq(value.map(sanitizeTag)).filter(v => v.length > 0);
    setSelectedTags(cleaned);
    form.setFieldsValue({ tags: cleaned });
  };

  const handleFinish = async (values: any) => {
    try {
      const token = localStorage.getItem("sessionId");
      if (!token) throw new Error("توکن یافت نشد");

      const fd = new FormData();
      fd.append("Title", values.title ?? "");
      fd.append("Text", values.text ?? "");

      if (values.positionId == null) {
        form.setFields([{ name: "positionId", errors: ["لطفاً سمت را انتخاب کنید"] }]);
        return;
      }
      fd.append("PositionId", String(values.positionId));
      if (values.positionName) fd.append("Position", String(values.positionName));

      // تگ‌های تمیز (امکان افزودن دستی + انتخاب از لیست)
      const rawTags: string[] = values.tags || selectedTags || [];
      const cleanedTags = uniq(rawTags.map(sanitizeTag)).filter(v => v.length > 0);
      if (!cleanedTags.length) {
        form.setFields([{ name: "tags", errors: ["✅ لطفاً حداقل یک تگ انتخاب یا اضافه کنید."] }]);
        return;
      }
      cleanedTags.forEach((t, i) => fd.append(`Tags[${i}]`, t));

      const files: any[] = values.file ?? [];
      files.forEach((f) => {
        const file: File | undefined = f?.originFileObj;
        if (file) fd.append("DocumentationAttachments", file, file.name);
      });

      const res = await CreateUnitDocumentation(fd, token);
      console.log("✅ موفقیت‌آمیز:", res);

      message.success("مستند جدید با موفقیت ثبت شد");
      form.resetFields();
      setSelectedTags([]);
      onClose();
    } catch (error: any) {
      console.error("❌ خطا در ارسال مستندات واحدی:", error);
      message.error(error?.response?.data?.message || "ارسال با خطا مواجه شد");
    }
  };

  return (
    <div className="font-yekan">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-2 font-yekan csstom-form"
        style={{ direction: "rtl" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="عنوان"
              name="title"
              rules={[{ required: true, message: "لطفاً عنوان را وارد کنید" }]}
            >
              <Input placeholder="عنوان" className="custom-input" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="گروه کاری"
              name="positionId"
              rules={[{ required: true, message: "لطفاً سمت را انتخاب کنید" }]}
              className="w-full"
            >
              <Select
                className="custom-input"
                placeholder="انتخاب سمت یا گروه کاری"
                allowClear
                showSearch
                optionFilterProp="children"
                onChange={(option) => {
                  const label = (option as any)?.label ?? (option as any)?.children;
                  form.setFieldsValue({ positionName: label });
                }}
              >
                {positions.map((p) => (
                  <Select.Option key={p.id} value={p.id} label={p.name}>
                    {p.name} {p.unitName ? `— ${p.unitName}` : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="positionName" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tags"
              label="تگ‌ها"
              rules={[{ required: true, message: "تعیین تگ الزامی است" }]}
            >
              <Select
                className="custom-input"
                mode="tags"                              // ← افزودن تگ جدید
                allowClear
                placeholder="تگ‌ها "
                value={selectedTags}
                onChange={handleTagChange}
                tokenSeparators={[",", "،", ";", "؛"]}  // جداکننده فارسی/EN
                maxTagCount="responsive"
              >
                {tags.map((tag, i) => (
                  <Select.Option key={i} value={tag.tagTitle}>
                    {tag.tagTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="متن"
          name="text"
          rules={[{ required: true, message: "لطفاً متن را وارد کنید" }]}
        >
          <Input.TextArea rows={4} placeholder="متن" className="custom-input" />
        </Form.Item>

        <Form.Item label={null} className="upload-item" colon={false}>
          <div className="upload-box">
            <span className="upload-label">افزودن فایل</span>
            <Form.Item
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
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

        <div className="flex justify-end mt-6 gap-4">
          <Button onClick={onClose} className="border-[#007041] text-[#007041] w-32" htmlType="button">
            بازگشت
          </Button>
          <Button type="primary" htmlType="submit" className="bg-[#007041] hover:bg-[#009051] w-32">
            ثبت
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateUnitDocumentationForm;
