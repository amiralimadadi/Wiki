import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Select,
  Table,
  Checkbox,
  Dropdown,
  Menu,
  Input,
  Upload,
  Modal
} from "antd";
import {
  FilterOutlined,
  DownOutlined,
  EyeOutlined,
  RedoOutlined,
  PrinterOutlined,
  UploadOutlined,
  CloseOutlined
} from "@ant-design/icons";
import {
  createQuestion,
  fetchCategorys,
  fetchQuestions,
  getAllQuestions,
  getQuestionsForAdminConfirm,
  getTagSelecteddAll,
  searchFormName,
} from "../services/auth";
import type { Tag, User } from "../forms/CreateKnowledgeContent";
import { Toaster, toast } from "react-hot-toast";
import gregorianToJalali from "../helpers/createDate";
import NoDataIcon from "../iconSaidbar/NoDataIcon";
import MoadlContentReuseble from "../components/common/MoadlContentReuseble";

const { TextArea } = Input;

interface Question {
  questionId: number;
  key: number;
  row: number;
  title: string;
  content: string;
  category: string;
  type: string;
  answersCount: number;
  likesCount: number;
  parentTitle?: string;
  userName?: string;
  createdDate: string;
  user: User;
}


const QuestionsList = () => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<Tag[]>([]);
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);

  const [expandedFilter, setExpandedFilter] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "row",
    "title",
    "content",
    "category",
    "type",
    "answersCount",
    "likesCount",
    "actions",
  ]);

  const toPersianDigits = (value): string => {
    if (value === null || value === undefined) return "۰";

    return value
      .toString()
      .replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".charAt(parseInt(digit, 10)));
  };

  const handlePrint = () => {
    window.print();
  };

  // تابع برای باز کردن مودال نمایش
  const handleViewModalOpen = (question: Question) => {
    console.log("🔎 record going to modal:", question);
    setCurrentQuestion(question);
    setViewModalOpen(true);
  };

  // تابع برای بستن مودال نمایش
  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setCurrentQuestion(null);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await getAllQuestions();
      console.log(res);
      const mapped = (res.data || []).map((q, index) => ({
        key: q.id,
        questionId: q.id,
        row: index + 1,
        title: q.questionTitle,
        content: q.questionText,
        category: q.goalTile?.[0] || "—",
        type:
          q.questionType === "3"
            ? "پرسش نوع سوم"
            : q.questionType === "2"
              ? "پرسش نوع دوم"
              : "پرسش نوع اول",
        answersCount: q.answerCount,
        likesCount: q.likeCount,
        userName: q.userName ?? q.user?.fullName ?? "—",
        createdDate: q.createdDate
          ? gregorianToJalali(q.createdDate)     // اگر می‌خوای جلالی باشه
          : "—",
      }));

      setQuestionsData(mapped);
    } catch (error) {
      console.error("خطا در بروزرسانی:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const columns = [
    {
      title: <span className="text-[#333333] font-bold text-[12px]">ردیف</span>,
      dataIndex: "row",
      key: "row",
      width: 60,
      render: (text: number) => <span>{toPersianDigits(text)}</span>,
    },
    {
      title: (
        <span className="text-[#333333] font-bold text-[12px]">عنوان</span>
      ),
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <div
          className="text-[13px] font-[500] leading-6 text-gray-700"
          style={{ lineHeight: "2.2", fontSize: "12px", color: "#333333" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span className="text-[#333333] font-bold text-[12px]">متن پرسش</span>
      ),
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <div
          className="text-[13px] font-[500] leading-6 text-gray-700 whitespace-pre-wrap"
          style={{ lineHeight: "2", fontSize: "12px", color: "#333333" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span className="text-[#333333] font-bold text-[12px]">دسته بندی</span>
      ),
      dataIndex: "category",
      key: "category",
      render: (text: string) => (
        <div
          className="text-[13px] font-[500] leading-6 text-gray-700 whitespace-pre-wrap"
          style={{ lineHeight: "2", fontSize: "12px", color: "#333333" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span className="text-[#333333] font-bold text-[12px]">نوع</span>,
      dataIndex: "type",
      key: "type",
      render: (text: string) => (
        <div
          className="text-[13px] font-[500] leading-6 text-gray-700 whitespace-pre-wrap"
          style={{ lineHeight: "2", fontSize: "12px", color: "#333333" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span className="text-[#333333] font-bold text-[12px]">تعداد پاسخ</span>
      ),
      dataIndex: "answersCount",
      key: "answersCount",
      render: (text: number) => (
        <div
          className="text-[13px] font-[500] leading-6 text-gray-700 whitespace-pre-wrap"
          style={{ lineHeight: "2", fontSize: "15px", color: "#333333" }}
        >
          {toPersianDigits(text)}
        </div>
      ),
    },
    {
      title: (
        <span className="text-[#333333] font-bold text-[12px]">تعداد لایک</span>
      ),
      dataIndex: "likesCount",
      key: "likesCount",
      render: (text: number) => (
        <div
          className="text-[13px] font-[500] leading-6 text-gray-700 whitespace-pre-wrap"
          style={{ lineHeight: "2", fontSize: "15px", color: "#333333" }}
        >
          {toPersianDigits(text)}
        </div>
      ),
    },
    {
      title: (
        <span className="text-[#333333] font-bold text-[12px]">عملیات</span>
      ),
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewModalOpen(record)}
        />
      ),
    },
  ];

  const columnOptions = [
    { label: "ردیف", value: "row" },
    { label: "عنوان", value: "title" },
    { label: "متن پرسش", value: "content" },
    { label: "دسته بندی", value: "category" },
    { label: "نوع", value: "type" },
    { label: "تعداد پاسخ", value: "answersCount" },
    { label: "تعداد لایک", value: "likesCount" },
    { label: "عملیات", value: "actions" },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = selectedCategoryId
        ? { goalId: selectedCategoryId, pageNo: 1 }
        : { pageNo: 1 };
      const res = await fetchQuestions(params);

      const mapped = (res.data || []).map((q, index) => ({
        key: q.id,
        row: index + 1,
        title: q.questionTitle,
        content: q.questionText,
        category: q.goalTiles?.[0] || "—",
        type: q.questionTypes?.[1]?.description || "—",
        answersCount: q.answersCount,
        likesCount: q.likesCount,
        userName: q.userName ?? q.user?.fullName ?? "—",
        createdDate: q.createdDate ? gregorianToJalali(q.createdDate) : "—",
      }));

      setQuestionsData(mapped);
    } catch (error) {
      console.error("خطا در جستجو:", error);
      setQuestionsData([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = async () => {
    try {
      form.resetFields();

      setLoading(true);
      const res = await getQuestionsForAdminConfirm();

      const mapped = res.map((q, index) => ({
        questionId: q.id,
        row: index + 1,
        title: q.questionTitle,
        content: q.questionText,
        category: q.goalTiles?.[0] || "—",
        type: q.questionTypes?.[1]?.description || "—",
        answersCount: q.answersCount,
        likesCount: q.likesCount,
        userName: q.userName ?? q.user?.fullName ?? "—",
        createdDate: q.createdDate ? gregorianToJalali(q.createdDate) : "—",
      }));

      setQuestionsData(mapped);
    } catch (error) {
      console.error("خطا در پاک کردن فیلتر:", error);
      setQuestionsData([]);
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu>
      {columnOptions.map((option) => (
        <Menu.Item key={option.value}>
          <Checkbox
            checked={selectedColumns.includes(option.value)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedColumns([...selectedColumns, option.value]);
              } else {
                setSelectedColumns(
                  selectedColumns.filter((col) => col !== option.value)
                );
              }
            }}
          >
            {option.label}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const filteredColumns = columns.filter((column) =>
    selectedColumns.includes(column.key)
  );

  // ----- Mention state -----
  type MentionOpt = { value: number; label: string; display: string; disabled?: boolean };
  const [mentionOptions, setMentionOptions] = useState<MentionOpt[]>([]);
  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const selectedMentions = (Form.useWatch("mentions", form) ?? []) as Array<{ value: number; label: string }>;
  const [mentionSearch, setMentionSearch] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      const res = await getTagSelecteddAll();
      if (res?.data) setTags(res.data);
    };
    fetchTags();
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

  const handleSubmit = () => setIsModalOpen(false);
  const handleFinish = async (values: any) => {
    try {
      const token = localStorage.getItem("sessionId");
      if (!token) throw new Error("توکن یافت نشد");

      const fd = new FormData();

      fd.append("goalIds", values.category);
      fd.append("questionTitle", values.title.trim());
      fd.append("questionText", values.text.trim());

      (values.tags as string[]).forEach((tag) => fd.append("Tags", tag));

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

      form.resetFields();
      setMentionOptions([]);
      setMentionOptions([]);
      setIsModalOpen(false);
      toast.success("پرسش با موفقیت ثبت شد");
      await refreshData();

      window.dispatchEvent(new CustomEvent("Question:created", { detail: { id: response?.data?.id } }));

    } catch (error: any) {
      console.error("❌ خطا در ارسال پرسش:", error);
      if (error?.response?.data?.modelErrors) {
        console.error("خطاهای مدل:", error.response.data.modelErrors);
      }
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="p-2 bg-white rounded-xl shadow-sm sm:p-4 print:p-0 sm:print:p-0  md:mr-[10rem]">
        <div className="mb-4 print:m-0 print:p-0">
          <div className="pb-4 shrink-0 print:p-0">
            <div className="flex flex-col gap-4 print:gap-0 sm:flex-row sm:justify-between sm:items-start">
              <div className="md:ml-16 print:hidden">
                <h1 className="text-2xl font-bold text-[#007141]">پرسش ها</h1>
              </div>

              {/* <div className="flex items-center justify-center gap-2 print:hidden">
                <button
                  className="text-gray-800 border-[1px] rounded-lg border-gray-300 p-1"
                  style={{ minWidth: 130 }}
                  onClick={() => setIsModalOpen(true)}
                >
                  افزودن پرسش
                </button>
              </div> */}
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col mb-10 rounded-t-default print:hidden bg-t-ascend-color/5">
            <div
              className="flex items-center justify-between  cursor-pointer rounded-t-xl bg-gray-200 transition-colors duration-300"
              onClick={() => setExpandedFilter(!expandedFilter)}
            >
              <div className="flex items-center gap-2 mb-0 mr-3">
                <FilterOutlined />
                <span className="text-[15px] text-[#333333]">فیلترها</span>
              </div>
              <div className="flex items-center p-2 rounded-xl gap-x-2 bg-t-ascend-color/10 hover:bg-t-ascend-color/20">
                <div className="bg-gray-200 w-[30px] h-[30px] rounded-xl flex items-center justify-center">
                  <DownOutlined
                    className={`transition-transform duration-300 ${expandedFilter ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </div>
              </div>
            </div>

            {expandedFilter && (
              <div className="transition-all duration-700 ease-in-out max-h-[2000px] md:max-h-[1000px] opacity-100 bg-gray-100 p-3 m-0">
                <Form layout="vertical" className="print:hidden">
                  <div className="print:grid print:grid-cols-2 md:grid grid-cols-1 gap-x-5 md:grid-cols-2 gap-y-2">
                    <Form.Item
                      label="دسته بندی"
                      name="category"
                      rules={[
                        { required: true, message: "دسته بندی را وارد کنید" },
                      ]}
                    >
                      <Select
                        className="custom-select .ant-select-selector "
                        placeholder="انتخاب کنید"
                        onChange={(value) => setSelectedCategoryId(value)}
                        value={selectedCategoryId ?? undefined}
                      >
                        {category.map((cat) => (
                          <Select.Option key={cat.id} value={cat.id}>
                            {cat.goalTitle}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>

                  <div className="flex flex-col justify-between gap-4 mt-10 sm:items-center sm:flex-row col-span-full">
                    <div>
                      <p className="relative z-50 m-0 cursor-pointer text-[#007141] hover:underline">
                        جستجو پیشرفته
                      </p>
                    </div>
                    <div className="flex justify-end w-full gap-x-4 sm:w-fit">
                      <Button
                        type="default"
                        style={{ minWidth: 130 }}
                        onClick={clearFilter}
                      >
                        حذف فیلترها
                      </Button>
                      <Button
                        onClick={handleSearch}
                        type="primary"
                        style={{ minWidth: 130, backgroundColor: "#007041" }}
                      >
                        جستجو
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            )}
          </div>

          <div className="grid mb-4 print:mb-0 print:w-full">
            <div className="flex items-center mb-[5px]">
              <div className="flex items-center ml-auto w-fit gap-x-2">
                <div className="relative group print:hidden bg-gray-200 rounded-xl">
                  <Dropdown overlay={menu} trigger={["hover"]}>
                    <p className="flex items-center px-3 mb-0 text-xs rounded-full cursor-pointer bg-t-layer-bg-color group-hover:bg-t-layer-bg-color-hovered gap-x-1">
                      <FilterOutlined size={11} />
                      <span className="text-[11px]">تغییر ستون ها</span>
                    </p>
                  </Dropdown>
                </div>
              </div>
              <div className="flex gap-x-3">
                <div
                  onClick={refreshData}
                  className="flex items-center text-xs cursor-pointer print:hidden gap-x-1 text-t-secondary-text-color inherit-color w-fit"
                >
                  <RedoOutlined />
                  <span>بروز رسانی</span>
                </div>
                <div
                  onClick={handlePrint}
                  className="flex items-center text-xs cursor-pointer print:hidden gap-x-1 text-t-secondary-text-color inherit-color w-fit"
                >
                  <PrinterOutlined />
                  <span>پرینت</span>
                </div>
                <span
                  className="text-xs print:text-black"
                  style={{ color: "var(--text-color-secondary)" }}
                >
                  تعداد کل {toPersianDigits(questionsData.length || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="print:w-full overflow-x-auto print:overflow-x-visible relative">
            <Table
              dataSource={questionsData}
              columns={filteredColumns}
              pagination={false}
              loading={loading}
              bordered
              size="middle"
              locale={{
                emptyText: (
                  <div className="flex flex-col items-center gap-3 mt-[4rem]">
                    <NoDataIcon />
                    <p className="font-bold text-gray-700">
                      داده ای موجود نیست
                    </p>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </div>

      {currentQuestion && (
        <MoadlContentReuseble
          open={viewModalOpen}
          onClose={handleViewModalClose}
          title={currentQuestion.title}
          author={currentQuestion.userName}
          date={currentQuestion.createdDate}
          content={currentQuestion.content}
          category={currentQuestion.category}

          tags={["پرسش", "مدیریت"]}
          // @ts-expect-error tsx

          answersCount={currentQuestion.answersCount}
          likesCount={currentQuestion.likesCount}
          onCommentSubmit={() => {
            toast.success("نظر شما ثبت شد");
            handleViewModalClose();
          }}
          questionId={currentQuestion.questionId}
        />
      )}

      {/* مودال جدید ایجاد پرسش */}
      <Modal
        title={<p className="mb-0">ایجاد پرسش</p>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        closeIcon={<CloseOutlined />}
        width={520}
        centered
        bodyStyle={{
          maxHeight: "fit-content",
        }}
      >
        <div className="pt-2 border-t-border-color-base">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="mt-2 font-yekan csstom-form"
            style={{ direction: "rtl", font: "BYekan" }}
          >

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

            <Form.Item
              style={{ rowGap: "8px", marginBottom: 0 }}
              name="title"
              label="عنوان پرسش"
              rules={[
                { required: true, message: "لطفا عنوان پرسش را وارد کنید" },
              ]}
            >
              <Input placeholder="عنوان پرسش" className="custom-input" />
            </Form.Item>

            <Form.Item
              style={{ rowGap: "8px", marginBottom: 0 }}
              name="text"
              label="متن پرسش"
              rules={[
                { required: true, message: "لطفا متن پرسش را وارد کنید" },
              ]}
              className="col-span-full"
            >
              <TextArea
                rows={3}
                placeholder="متن پرسش"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label="تگ‌ها"
              rules={[
                { required: true, message: "لطفاً حداقل یک تگ انتخاب کنید." },
              ]}>
              <Select
                className="custom-input"
                mode="multiple"
                allowClear
                placeholder="تگ‌ها"
              >
                {tags.map((tag, i) => (
                  <Select.Option key={i} value={tag.tagTitle}>
                    {tag.tagTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

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
                optionRender={(opt) => <div className="font-yekan">{opt.data.display ?? opt.data.label}</div>}
                allowClear
                placeholder="نام افراد را وارد کنید"
                notFoundContent={mentionLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
                tagRender={() => null}
                maxTagCount={0}
                maxTagPlaceholder={null}
                className="font-yekan custom-input mention-select"
              />
            </Form.Item>

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
                    🗑
                  </button>
                </span>
              ))}
            </div>

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

            <div className="flex flex-col justify-between gap-4 mt-10 sm:items-center sm:flex-row">

              <Form.Item className="flex justify-end gap-4 font-yekan mt-8">
                <Button
                  onClick={handleSubmit}
                  className="border-[#007041] font-yekan ml-5 text-[#007041] w-32"
                  htmlType="button"
                >
                  بازگشت
                </Button>
                <Button type="primary" htmlType="submit" className="bg-[#007041] font-yekan  hover:bg-[#009051] w-32">
                  ثبت
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default QuestionsList;