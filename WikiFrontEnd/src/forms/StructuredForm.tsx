import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Upload, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DeleteIcon from "../svgs/DeleteIconProps";
import { changeKnowledgeContentType, searchFormName, fetchDepartments } from "../services/auth";
import toast, { Toaster } from "react-hot-toast";

const { TextArea } = Input;

type MentionLite = { userId: number; fullName: string };

export type User = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  mobileNumber: string;
};

interface StructuredFormProps {
  onClose: () => void;
  text: string;
  tags: { tagTitle: string }[];
  title: string;
  knowledgeContentId: number;
  token: string;
  existingMentions?: MentionLite[];
}

type MentionOpt = { value: number; label: string; display: string; disabled?: boolean };
type PersonOpt = { value: number; label: string; display: string; disabled?: boolean };

const StructuredForm: React.FC<StructuredFormProps> = ({
  onClose,
  text,
  tags,
  title,
  knowledgeContentId,
  token,
  existingMentions = [],
}) => {
  const [form] = Form.useForm();

  // ----- Mention state -----
  const [mentionOptions, setMentionOptions] = useState<MentionOpt[]>([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const selectedMentions =
    (Form.useWatch("mentions", form) ?? []) as Array<{ value: number; label: string }>;
  const initialMentions = (existingMentions || []).map((m) => ({
    value: m.userId,
    label: m.fullName,
    display: m.fullName,
  }));

  // ----- People (دسترسی افراد) -----
  const [peopleOptions, setPeopleOptions] = useState<PersonOpt[]>([]);
  const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
  const [peopleSearch, setPeopleSearch] = useState("");
  const selectedPeople =
    (Form.useWatch("people", form) ?? []) as Array<{ value: number; label: string }>;

  // ----- Units (واحدهای سازمانی) -----
  const [departments, setDepartments] = useState<{ id: number; departmentTitle: string }[]>([]);
  const selectedUnits =
    (Form.useWatch("units", form) ?? []) as Array<{ value: number; label: string }>;

  // حذف اکانت‌های SSO
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

  // Mention search
  const onMentionSearch = async (text: string) => {
    if (!text) return setMentionOptions([]);
    setMentionLoading(true);
    const users = await searchUsers(text);
    const selectedIds = new Set(selectedMentions.map((m) => m.value));
    setMentionOptions(
      users.map((u) => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — ${u.email ?? ""}`,
        disabled: selectedIds.has(u.id),
      }))
    );
    setMentionLoading(false);
  };

  // People search (برای تعیین دسترسی افراد)
  const onPeopleSearch = async (text: string) => {
    if (!text) return setPeopleOptions([]);
    setPeopleLoading(true);
    const users = await searchUsers(text);
    const selectedIds = new Set(selectedPeople.map((p) => p.value));
    setPeopleOptions(
      users.map((u) => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — ${u.email ?? ""}`,
        disabled: selectedIds.has(u.id),
      }))
    );
    setPeopleLoading(false);
  };

  // load departments (واحدها)
  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const result = await fetchDepartments();
        if (result?.data && Array.isArray(result.data)) setDepartments(result.data);
      } catch (error) {
        console.error("خطا در دریافت واحدها:", error);
      }
    };
    fetchDeps();
  }, []);

  const initialTags = (tags || []).map((t) => t.tagTitle);

  // ✅ ارسال params (نه FormData)
  const onFinish = async (values: any) => {
    try {
      const mentionUserIds: number[] = (values.mentions || [])
        .map((m: { value: number }) => Number(m.value))
        .filter((id) => !isNaN(id));

      const files: File[] = (values.file || [])
        .map((f: any) => f?.originFileObj ?? f)
        .filter(Boolean);

      // ⬇️ استخراج Users و Units برای تعیین دسترسی
      const users: number[] = (values.people || [])
        .map((p: { value: number }) => Number(p.value))
        .filter((id: number) => !isNaN(id));

      const units: number[] = (values.units || [])
        .map((u: { value: number }) => Number(u.value))
        .filter((id: number) => !isNaN(id));

      // ✅ ساخت آبجکت params
      const params = {
        KnowledgeContentId: knowledgeContentId,
        Title: values.title,
        Abstract: values.abstract ?? "",
        Text: values.text,
        Tags: values.tags || [],
        MentionUserId: mentionUserIds,
        References: values.reference ? [values.reference] : [],
        KnowledgeContentAttachments: files,
        // 👇 اضافه‌شده‌ها
        Users: users,
        Units: units,
      };

      await changeKnowledgeContentType(params, token);

      window.dispatchEvent(
        new CustomEvent("knowledge:updated", {
          detail: { id: knowledgeContentId },
        })
      );

      toast.success("✅ محتوا با موفقیت تبدیل شد");
      onClose();
    } catch (error: any) {
      const modelErrors = error?.response?.data?.modelErrors;
      if (modelErrors?.length) {
        const msg = modelErrors.map((e: any) => e.modelErrorMessage).join("\n");
        toast.error(msg, {
          style: {
            whiteSpace: "pre-line",
            border: "1px solid red",
            padding: 8,
            color: "#b00020",
            fontWeight: "bold",
          },
          icon: "⚠️",
        });
      } else {
        toast.error("⚠️ خطای غیرمنتظره رخ داد");
      }
      console.error(error);
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        className="mt-2 font-yekan csstom-form"
        initialValues={{
          title,
          abstract: "",
          tags: initialTags,
          reference: "",
          text,
          mentions: initialMentions,
          file: [],
          // 👇 برای تعیین دسترسی
          people: [],
          units: [],
        }}
        onFinish={onFinish}
        style={{ direction: "rtl", font: "BYekan" }}
      >
        {/* header */}
        <div className="mb-3">
          <div className="text-[17px] text-[#333333] font-bold">تبدیل به ساختار یافته</div>
          <div className="mt-2 h-px bg-gray-300 w-full"></div>
        </div>

        {/* inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="عنوان"
            name="title"
            rules={[{ required: true, message: "عنوان الزامی است" }]}
          >
            <Input className="custom-input" placeholder="عنوان" />
          </Form.Item>

          <Form.Item
            label="چکیده"
            name="abstract"
            rules={[{ required: true, message: "چکیده الزامی است" }]}
          >
            <Input className="custom-input" placeholder="چکیده" />
          </Form.Item>

          <Form.Item
            label="تگ‌ها"
            name="tags"
            rules={[{ required: true, message: "حداقل یک تگ انتخاب کنید" }]}
          >
            <Select mode="multiple" allowClear className="custom-input" placeholder="تگ‌ها">
              {tags.map((tag, index) => (
                <Select.Option key={index} value={tag.tagTitle}>
                  {tag.tagTitle}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="مرجع (Reference)" name="reference">
            <Input className="custom-input" placeholder="مرجع" style={{ height: 34 }} />
          </Form.Item>
        </div>

        {/* text */}
        <Form.Item
          label="متن"
          name="text"
          rules={[{ required: true, message: "لطفا متن را وارد کنید" }]}
        >
          <TextArea rows={4} className="customtextarea custom-input" placeholder="متن" />
        </Form.Item>

        {/* mentions */}
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
            style={{ height: 34, background: "#fff" }}
          />
        </Form.Item>

        {/* mention chips */}
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedMentions.map(({ value, label }) => (
            <span
              key={value}
              className="flex items-center gap-2 bg-gray-100 text-sm rounded px-2 py-[4px] border border-gray-300"
            >
              {label}
              <button
                type="button"
                style={{ color: "#ff4d4f" }}
                onClick={() =>
                  form.setFieldValue(
                    "mentions",
                    selectedMentions.filter((x) => x.value !== value)
                  )
                }
                title="حذف"
              >
                <DeleteIcon />
              </button>
            </span>
          ))}
        </div>

        {/* upload */}
        <Form.Item label={null} className="upload-item" colon={false}>
          <div className="upload-box">
            <span className="upload-label">افزودن فایل</span>
            <Form.Item
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList || []}
              noStyle
            >
              <Upload
                beforeUpload={() => false}
                showUploadList
                listType="text"
                multiple
                className="upload-trigger"
              >
                <Button icon={<UploadOutlined />} className="upload-btn">
                  انتخاب فایل
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form.Item>

        {/* دسترسی‌ها */}
        <div className="flex flex-col gap-3 font-yekan bg-gray-100 rounded-xl font-semibold p-3">
          <label className="font-yekan">تعیین دسترسی</label>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item className="font-yekan" label="واحد سازمانی" name="units">
                <Select
                  mode="multiple"
                  className="font-yekan custom-input"
                  labelInValue
                  showSearch
                  allowClear
                  placeholder="انتخاب کنید"
                  optionFilterProp="label"
                  options={departments.map((d) => ({ value: d.id, label: d.departmentTitle }))}
                  tagRender={() => null}
                  maxTagCount={0}
                  maxTagPlaceholder={null}
                />
              </Form.Item>

              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUnits.map(({ value, label }) => (
                  <span
                    key={value}
                    className="flex items-center gap-2 bg-gray-100 text-sm rounded px-2 py-[4px] border border-gray-300"
                  >
                    {label}
                    <button
                      type="button"
                      style={{ color: "#ff4d4f" }}
                      onClick={() =>
                        form.setFieldValue(
                          "units",
                          selectedUnits.filter((x) => x.value !== value)
                        )
                      }
                      title="حذف"
                    >
                      <DeleteIcon />
                    </button>
                  </span>
                ))}
              </div>
            </Col>

            <Col span={12}>
              <Form.Item className="font-yekan" label="افراد" name="people">
                <Select
                  className="font-yekan custom-input"
                  mode="multiple"
                  labelInValue
                  showSearch
                  searchValue={peopleSearch}
                  onSearch={(val) => {
                    setPeopleSearch(val);
                    onPeopleSearch(val);
                  }}
                  autoClearSearchValue={false}
                  filterOption={false}
                  options={peopleOptions}
                  optionLabelProp="label"
                  optionRender={(opt) => (
                    <div className="font-yekan">{opt.data.display ?? opt.data.label}</div>
                  )}
                  allowClear
                  placeholder="نام افراد را وارد کنید"
                  notFoundContent={peopleLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
                  tagRender={() => null}
                  maxTagCount={0}
                  maxTagPlaceholder={null}
                />
              </Form.Item>

              <div className="mt-2 flex flex-wrap gap-2">
                {selectedPeople.map(({ value, label }) => (
                  <span
                    key={value}
                    className="flex items-center gap-2 bg-gray-100 text-sm rounded px-2 py-[4px] border border-gray-300"
                  >
                    {label}
                    <button
                      type="button"
                      style={{ color: "#ff4d4f" }}
                      onClick={() =>
                        form.setFieldValue(
                          "people",
                          selectedPeople.filter((x) => x.value !== value)
                        )
                      }
                      title="حذف"
                    >
                      <DeleteIcon />
                    </button>
                  </span>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button className="w-[172.82px] rounded-xl no-blue-border" onClick={onClose} type="default">
            بازگشت
          </Button>
          <Button className="w-[172.82px] bg-[#007041] rounded-xl bg-green-custom" type="primary" htmlType="submit">
            تبدیل به ساختار یافته
          </Button>
        </div>
      </Form>
      <Toaster position="bottom-right" />
    </>
  );
};

export default StructuredForm;
