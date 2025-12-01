import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Row,
  Col,
} from "antd";
import { UploadOutlined, } from "@ant-design/icons";
import { useEffect, useState } from "react";
import DeleteIcon from "../../svgs/DeleteIconProps";
import {
  CreateKnowledgeNon,
  fetchCategorys,
  fetchDepartments,
  getTagSelecteddAll,
  searchFormName,
} from "../../services/auth";

type Tag = { tagTitle: string };
type User = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  mobileNumber: string;
};

// ---- helpers (خارج از کامپوننت: خالص و بی‌وابستگی) ----
const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const MIN_WORDS_NON = 30;
const MAX_WORDS_NON = 149;


const CreateKnowledgeNonStructured = ({ onClose }: { onClose: () => void }) => {
  const [form] = Form.useForm();
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


  // ----- Person state -----
 // ---- handleTagChange فقط داخل کامپوننت باشد ----
  const handleTagChange = (value: string[]) => {
    const cleaned = uniq(value.map(sanitizeTag)).filter(v => v.length > 0);
    setSelectedTags(cleaned);
    form.setFieldsValue({ tags: cleaned });
  };

  const [textWordCount, setTextWordCount] = useState(0);


  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await getTagSelecteddAll();
        if (response && Array.isArray(response.data)) {
          setTags(response.data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchDepartments();
        if (result?.data && Array.isArray(result.data)) {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error("خطا در API:", error);
      }
    };

    fetchData();
  }, []);

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
    try {
      const token = localStorage.getItem("sessionId");
      if (!token) throw new Error("توکن یافت نشد");

      const wordCount = (t: string) => (t?.trim() ? t.trim().replace(/\s+/g, " ").split(" ").length : 0);

      const c = wordCount(values.text || "");
      if (c < MIN_WORDS_NON || c > MAX_WORDS_NON) {
        form.setFields([
          {
            name: "text",
            errors: [
              `متن باید بین ${MIN_WORDS_NON} تا ${MAX_WORDS_NON} کلمه باشد.`
            ],
          },
        ]);
        return;
      }
      const fd = new FormData();
      fd.append("GoalId", values.category);
      fd.append("Title", values.title);
      if (values.summary?.trim()) {
        fd.append("Abstract", values.summary.trim());
      }
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

      const response = await CreateKnowledgeNon(fd, token);
      console.log("✅ موفقیت‌آمیز:", response);

      form.resetFields();
      setSelectedTags([]);
      form.setFieldValue("units", []);
      form.setFieldValue("people", []);
      form.setFieldValue("mentions", []);
      setMentionOptions([]);
      setPeopleOptions([]);

      window.dispatchEvent(
        new CustomEvent("knowledge:created", {
          detail: { id: response?.data?.id } // اختیاری
        })
      );

      onClose();
    } catch (error: any) {
      console.error("❌ خطا در ارسال محتوا:", error);
      if (error?.response?.data?.modelErrors) {
        console.error("خطاهای مدل:", error.response.data.modelErrors);
      }
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
      const data = await searchFormName(text); // ← همون سرویس خودت
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


  type PersonOpt = { value: number; label: string; display: string; disabled?: boolean };

  const [peopleOptions, setPeopleOptions] = useState<PersonOpt[]>([]);
  const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
  const [peopleSearch, setPeopleSearch] = useState("");

  // مقدار انتخاب‌شده‌های افراد را از فرم بخوانیم
  const selectedPeople = (Form.useWatch("people", form) ?? []) as Array<{ value: number; label: string }>;


  const onPeopleSearch = async (text: string) => {
    if (!text) return setPeopleOptions([]);
    setPeopleLoading(true);

    const users = await searchUsers(text);   // همان تابعی که SSOها را حذف می‌کند
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



  // واحد سازمانی چندتایی
  const selectedUnits =
    (Form.useWatch("units", form) ?? []) as Array<{ value: number; label: string }>;



  // const normalizePersian = (text: string): string =>
  //   text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();



  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim() ? text.trim().replace(/\s+/g, " ").split(" ") : [];
    setTextWordCount(words.length);
    form.setFieldValue("text", text);


    if (words.length >= MIN_WORDS_NON && words.length <= MAX_WORDS_NON) {
      form.setFields([{ name: "text", errors: [] }]);
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="دسته بندی"
              name="category"
              rules={[{ required: true, message: "دسته بندی را وارد کنید" }]}
            >
              <Select
                className="custom-select .ant-select-selector"
                placeholder="انتخاب کنید"
                showSearch
                allowClear
                optionFilterProp="children"
                
              >
                {category.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.goalTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="عنوان"
              name="title"
              rules={[{ required: true, message: "عنوان را وارد کنید" }]}
            >
              <Input className="custom-input" placeholder="عنوان" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tags"
              label="تگ ها"
              rules={[
                {
                  required: true,
                  message: "تعیین تگ الزامی است",
                },
              ]}>
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
                {tags.map((tag, i) => (
                  <Select.Option key={i} value={tag.tagTitle}>
                    {tag.tagTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {/* <Form.Item label="مرجع (Reference)" name="reference">
          <Input className="custom-input" placeholder="مرجع (Reference)" />
        </Form.Item> */}

        <Form.Item
          label="متن"
          name="text"
          rules={[
            { required: true, message: "متن را وارد کنید" },
            {
              validator: (_, value) => {
                const wc = (value ?? "").toString().trim().replace(/\s+/g, " ").split(" ");
                const count = (wc[0] === "" ? 0 : wc.length);
                if (count < MIN_WORDS_NON) {
                  return Promise.reject(`حداقل ${MIN_WORDS_NON} کلمه لازم است`);
                }
                if (count > MAX_WORDS_NON) {
                  return Promise.reject(`حداکثر ${MAX_WORDS_NON} کلمه مجاز است`);
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <>
            <Input.TextArea
              rows={4}
              className="custom-input"
              placeholder="متن"
              onChange={handleTextChange}
            />
            <div className="text-xs text-gray-500 mt-1 text-left">
              {textWordCount}/{MAX_WORDS_NON} کلمه (حداقل {MIN_WORDS_NON})
            </div>
          </>
        </Form.Item>

        {/* ارجاع (Mention) */}
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
            className="font-yekan custom-input mention-select visible-border"
            style={{ height: 40, background: "#fff" }}
          />
        </Form.Item>


        {/*  چیپ‌های زیر فیلد */}
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




        {/* ظرف ظاهری (فقط UI) */}
        <Form.Item label={null} className="upload-item" colon={false}>
          <div className="upload-box">
            <span className="upload-label">افزودن فایل</span>

            {/* این Form.Item داخلی مستقیماً والد Upload است و مقدار را به فرم بایند می‌کند */}
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

        <div className="bg-gray-100 rounded-xl p-3 mt-4">
          <label className="font-bold">تعیین دسترسی</label>

          {/* بخش واحد و افراد */}
          <Row className="" gutter={16}>
            <Col span={12}>
              <Form.Item className="font-yekan" label="واحد سازمانی" name="units">
                <Select
                  mode="multiple"
                  className="font-yekan custom-input"
                  labelInValue
                  showSearch
                  allowClear
                  placeholder="انتخاب کنید"
                  optionFilterProp="label"          // سرچ روی لیبل
                  options={departments.map(d => ({
                    value: d.id,
                    label: d.departmentTitle,
                  }))}

                  // ظاهر شبیه ارجاع: چیپ‌ها داخل باکس مخفی، زیر فیلد نمایش می‌دهیم
                  tagRender={() => null}
                  maxTagCount={0}
                  maxTagPlaceholder={null}

                />
              </Form.Item>

              {/* چیپ‌های زیر فیلد واحد سازمانی */}
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


              <Form.Item
                className="font-yekan "
                label="افراد"
                name="people"
              >
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

                  // چیپ‌های داخل خود Select را مخفی می‌کنیم (مثل ارجاع)
                  tagRender={() => null}
                  maxTagCount={0}
                  maxTagPlaceholder={null}


                />
              </Form.Item>

              {/* چیپ‌های زیر فیلد افراد */}
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
                      🗑
                    </button>
                  </span>
                ))}
              </div>




            </Col>
          </Row>

        </div>

        <Form.Item className="flex justify-end gap-4 mt-8">
          <Button
            onClick={onClose}
            className="border-[#007041] ml-4 text-[#007041] w-32"
          >
            بازگشت
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-[#007041] hover:bg-[#009051] w-32"
          >
            ثبت
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateKnowledgeNonStructured;
