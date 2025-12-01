import { Form, Input, Select, Upload, Button, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DeleteIcon from "../svgs/DeleteIconProps";
import { useEffect, useState } from "react";
import {
  createKnowledgeContent,
  fetchCategorys,
  fetchDepartments,
  getTagSelecteddAll,
  searchFormName,
} from "../services/auth";

export type Tag = { tagTitle: string; };
export type User = {
  id: number; fullName: string; userName: string; email: string; mobileNumber: string;
};

// ---- helpers (خارج از کامپوننت: خالص و بی‌وابستگی) ----
const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const MAX_WORDS = 150;
const MIN_WORDS = 150;

const CreateKnowledgeContent = ({ onClose }: { onClose: () => void }) => {
  const handleSubmit = () => { onClose(); };

  const [form] = Form.useForm();
  const [textValue, setTextValue] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [departments, setDepartments] = useState<{ id: number; departmentTitle: string }[]>([]);
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);

  // ----- Mention state -----
  type MentionOpt = { value: number; label: string; display: string; disabled?: boolean };
  const [mentionOptions, setMentionOptions] = useState<MentionOpt[]>([]);
  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const selectedMentions = (Form.useWatch("mentions", form) ?? []) as Array<{ value: number; label: string }>;
  const [mentionSearch, setMentionSearch] = useState("");

  // ----- People state -----
  type PersonOpt = { value: number; label: string; display: string; disabled?: boolean };
  const [peopleOptions, setPeopleOptions] = useState<PersonOpt[]>([]);
  const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
  const [peopleSearch, setPeopleSearch] = useState("");
  const selectedPeople = (Form.useWatch("people", form) ?? []) as Array<{ value: number; label: string }>;

  // واحد سازمانی چندتایی
  const selectedUnits =
    (Form.useWatch("units", form) ?? []) as Array<{ value: number; label: string }>;

  // ---- handleTagChange فقط داخل کامپوننت باشد ----
  const handleTagChange = (value: string[]) => {
    const cleaned = uniq(value.map(sanitizeTag)).filter(v => v.length > 0);
    setSelectedTags(cleaned);
    form.setFieldsValue({ tags: cleaned });
  };

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await getTagSelecteddAll();
        if (response && Array.isArray(response.data)) setTags(response.data);
      } catch (error) { console.error("Error fetching tags:", error); }
    }
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchDepartments();
        if (result?.data && Array.isArray(result.data)) setDepartments(result.data);
      } catch (error) { console.error("خطا در API:", error); }
    };
    fetchData();
  }, []);

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

  const handleFinish = async (values: any) => {
    try {
      const token = localStorage.getItem("sessionId");
      if (!token) throw new Error("توکن یافت نشد");

      const wc = (t: string) => t.trim().replace(/\s+/g, " ").split(" ").length;
      if (wc(values.summary || "") < 15) {
        form.setFields([{ name: "summary", errors: ["✅ چکیده باید حداقل ۱۵ کلمه داشته باشد."] }]);
        return;
      }
      if (wc(values.text || "") < 150) {
        form.setFields([{ name: "text", errors: ["✅ متن اصلی باید حداقل ۱۵۰ کلمه داشته باشد."] }]);
        return;
      }

      const fd = new FormData();
      fd.append("GoalId", values.category);
      fd.append("Title", values.title);
      fd.append("Abstract", values.summary);
      fd.append("Text", values.text);

      // تگ‌ها (پاک‌سازی + یکتا)
      const rawTags: string[] = values.tags || selectedTags || [];
      const cleanedTags = uniq(rawTags.map(sanitizeTag)).filter(v => v.length > 0);
      if (cleanedTags.length === 0) {
        form.setFields([{ name: "tags", errors: ["✅ لطفاً حداقل یک تگ انتخاب یا اضافه کنید."] }]);
        return;
      }
      cleanedTags.forEach(tag => fd.append("Tags", tag));

      if (values.reference) fd.append("References", values.reference);

      if (values.file?.length) {
        values.file.forEach((f: any) => {
          const blob = f.originFileObj ?? f;
          fd.append("KnowledgeContentAttachments", blob);
        });
      }

      if (values.mentions?.length) {
        (values.mentions as Array<{ value: number; label: string }>)
          .map(m => m.value)
          .forEach(id => fd.append("MentionUserId", id.toString()));
      }

      if (values.people?.length) {
        (values.people as Array<{ value: number; label: string }>)
          .map(p => Number(p.value))
          .forEach(id => fd.append("Users", id.toString()));
      }

      if (values.units?.length) {
        (values.units as Array<{ value: number; label: string }>)
          .map(u => u.value)
          .forEach(id => fd.append("Units", id.toString()));
      }

      const response = await createKnowledgeContent(fd, token);
      console.log("✅ موفقیت‌آمیز:", response);

      form.resetFields();
      setSelectedTags([]);
      form.setFieldValue("units", []);
      form.setFieldValue("people", []);
      form.setFieldValue("mentions", []);
      setMentionOptions([]);
      setPeopleOptions([]);

      window.dispatchEvent(new CustomEvent("knowledge:created", {
        detail: { id: response?.data?.id }
      }));

      onClose();
    } catch (error: any) {
      console.error("❌ خطا در ارسال محتوا:", error);
      if (error?.response?.data?.modelErrors) {
        console.error("خطاهای مدل:", error.response.data.modelErrors);
      }
    }
  };

  // ----- handlers -----
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const words = val.trim() ? val.trim().replace(/\s+/g, " ").split(" ") : [];
    setTextValue(val);
    form.setFieldValue("text", val);
    if (words.length === MAX_WORDS) {
      form.setFields([{ name: "text", errors: [] }]);
    }
  };

  const isSsoAccount = (u: User) => {
    const email = (u.email || "").trim();
    const local = (email.split("@")[0] || "").toLowerCase();
    const username = (u.userName || "").toLowerCase();
    return local.startsWith("sso") || username.startsWith("sso");
  };

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const data = await searchFormName(text);
      return (Array.isArray(data) ? data : []).filter(u => !isSsoAccount(u));
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
  };

  // Mention
  const onMentionSearch = async (text: string) => {
    if (!text) return setMentionOptions([]);
    setMentionLoading(true);
    const users = await searchUsers(text);
    const selectedIds = new Set(selectedMentions.map(m => m.value));
    setMentionOptions(
      users.map(u => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — \u200E${u.email}`,
        disabled: selectedIds.has(u.id),
      }))
    );
    setMentionLoading(false);
  };

  const onPeopleSearch = async (text: string) => {
    if (!text) return setPeopleOptions([]);
    setPeopleLoading(true);
    const users = await searchUsers(text);
    const selectedIds = new Set(selectedPeople.map(p => p.value));
    setPeopleOptions(
      users.map(u => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — \u200E${u.email}`,
        disabled: selectedIds.has(u.id),
      }))
    );
    setPeopleLoading(false);
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="دسته بندی"
              name="category"
              rules={[{ required: true, message: "دسته بندی تعیین نشده است" }]}
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
          </Col>
          <Col span={12}>
            <Form.Item
              label="عنوان"
              name="title"
              rules={[{ required: true, message: "عنوان الزامی است" }]}
            >
              <Input className="custom-input" placeholder="عنوان" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="چکیده"
              name="summary"
              rules={[{ required: true, message: "چکیده الزامی است" }]}
            >
              <Input className="custom-input" placeholder="چکیده" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tags"
              label="تگ‌ها"
              rules={[{ required: true, message: "تعیین تگ الزامی است" }]}
            >
              <Select
                className="custom-input"
                mode="tags"
                allowClear
                placeholder="تگ‌ها"
                value={selectedTags}
                onChange={handleTagChange}
                tokenSeparators={[",", "،", ";", "؛"]}
                maxTagCount="responsive"
              >
                {tags.map((tag, index) => (
                  <Select.Option key={index} value={tag.tagTitle}>
                    {tag.tagTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="مرجع (Reference)" name="reference">
          <Input className="custom-input w-[351px]" placeholder="مرجع (Reference)" />
        </Form.Item>

        <Form.Item
          label="متن"
          name="text"
          rules={[
            { required: true, message: "متن الزامی است" },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject("متن الزامی است");
                const wordCount = value.trim().replace(/\s+/g, " ").split(" ").length;
                if (wordCount < MIN_WORDS) return Promise.reject("متن باید حداقل ۱۵۰ کلمه داشته باشد");
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            className="customtextarea custom-input"
            placeholder="متن"
            value={textValue}
            onChange={onTextChange}
          />
        </Form.Item>

        {/* ارجاع (Mention) */}
        <Form.Item label="ارجاع (Mention)" name="mentions">
          <Select
            mode="multiple"
            labelInValue
            showSearch
            searchValue={mentionSearch}
            onSearch={(val) => { setMentionSearch(val); onMentionSearch(val); }}
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

        {/* چیپ‌های ذکرشده زیر فیلد */}
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedMentions.map(({ value, label }) => (
            <span
              key={value}
              className="flex items-center gap-2 bg-gray-100 text-sm rounded px-2 py-[4px] border border-gray-300"
            >
              {label}
              <button
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

        {/* آپلود */}
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
          <label className="font-yekan">تعین دسترسی</label>
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
                  options={departments.map(d => ({ value: d.id, label: d.departmentTitle }))}
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
                  onSearch={(val) => { setPeopleSearch(val); onPeopleSearch(val); }}
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

        <Form.Item className="flex justify-end gap-4 font-yekan mt-8">
          <Button
            onClick={handleSubmit}
            className="border-[#007041] font-yekan ml-5 text-[#007041] w-32"
            htmlType="button"
          >
            بازگشت
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-[#007041] font-yekan  hover:bg-[#009051] w-32"
          >
            ثبت
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateKnowledgeContent;
