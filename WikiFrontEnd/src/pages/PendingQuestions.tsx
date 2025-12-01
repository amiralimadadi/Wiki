import { useEffect, useState } from "react";
import { Table, Checkbox, Empty, Modal, Form, Select, Divider } from "antd";
import {
  FilterOutlined,
  RedoOutlined,
  PrinterOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  fetchCategorys,
  acceptOrDeleteQuestionByAdmin,
  getQuestionsForAdminConfirm,
} from "../services/auth";
import toast, { Toaster } from "react-hot-toast";
import type { QuestionData } from "../types/Interfaces";
import gregorianToJalali from "../helpers/createDate";


type RowData = QuestionData & {
  key: number | string;
  row: number;
  category: string;
  categoryId?: number | null;
  questionType?: number | string | null;
  title: string;
  date?: string | null;
  text: string;
  registrar: string;
  deleted: string; // "بله" | "خیر"
  active: string;  // "بله" | "خیر"
};

const PendingQuestions = () => {
  // ---- modal: جزئیات
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<RowData | null>(null);

  // ---- modal: ویرایش
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<RowData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm<{ categoryId?: number; questionType?: string }>();

  // ------ دسته‌بندی‌ها
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ---- جدول
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "ردیف",
    "دسته بندی",
    "عنوان",
    "متن",
    "ثبت کننده",
    "حذف شده",
    "فعال",
    "عملیات",
  ]);

  // ------ نوع‌ها
  const typeOptions = [
    { value: "0", label: "حذف پرسش" },
    { value: "1", label: "پرسش نوع اول" },
    { value: "2", label: "پرسش نوع دوم" },
    { value: "3", label: "پرسش نوع سوم" },
  ];

  // ----- helper: نرمال‌سازی برای مقایسهٔ فارسی/عربی
  const normalize = (s?: string) =>
    (s || "")
      .replace(/\u00A0|\u200c/g, " ")
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[\u06CC]/g, "ی")
      .replace(/[\u06A9]/g, "ک")
      .trim();

  // ----- helper: یافتن categoryId از رکورد/عنوان
  const resolveCategoryId = (
    rec: Pick<RowData, "category" | "categoryId">,
    cats: { id: number; goalTitle: string }[]
  ) => {
    let id: number | undefined =
      typeof rec?.categoryId === "string"
        ? Number(rec.categoryId)
        : (rec?.categoryId as number | undefined);

    if ((id == null || Number.isNaN(id)) && rec?.category && cats?.length) {
      const firstTitle = String(rec.category).split("،")[0]?.trim();
      const nFirst = normalize(firstTitle);
      const found = cats.find((c) => normalize(c.goalTitle) === nFirst);
      if (found) id = found.id;
    }
    return id;
  };

  // --- seed و key برای فرم (برای mount تمیز با initialValues)
  const [formSeed, setFormSeed] = useState<{ categoryId?: number; questionType?: string } | null>(null);
  const [formKey, setFormKey] = useState<string>("");

  // --- دریافت دسته‌بندی‌ها
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const resp = await fetchCategorys();
        const arr = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];
        setCategory(arr);
      } catch (e) {
        console.error(e);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- دریافت پرسش‌ها
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await getQuestionsForAdminConfirm();

      if (Array.isArray(res)) {
        const transformedData: RowData[] = res.map((item: any, index: number) => {
          const joinedGoals =
            Array.isArray(item?.goalTiles) && item.goalTiles.length
              ? item.goalTiles.join("، ")
              : "-";

          const resolvedCategoryId: number | null =
            typeof item?.goalId === "number"
              ? item.goalId
              : Array.isArray(item?.goalIDs) && typeof item.goalIDs[0] === "number"
                ? item.goalIDs[0]
                : Array.isArray(item?.goalIds) && typeof item.goalIds[0] === "number"
                  ? item.goalIds[0]
                  : null;

          return {
            key: item.id,
            row: index + 1,
            category: joinedGoals,
            categoryId: resolvedCategoryId,
            questionType: item?.questionType ?? null,
            title: item?.questionTitle || "-",
            date: item?.createdDate ?? null,
            text: item?.questionText || "-",
            registrar: item?.userName || "-",
            deleted: item?.isDelete ? "بله" : "خیر",
            active: item?.isActive ? "بله" : "خیر",
          } as RowData;
        });

        setData(transformedData);
      } else {
        toast.error("دریافت داده‌ها با مشکل مواجه شد");
      }
    } catch (err) {
      console.error("خطا در دریافت پرسش‌ها:", err);
      toast.error("خطا در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ---------- جزئیات ----------
  const openDetail = (record: RowData) => {
    setCurrentRow(record);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setCurrentRow(null);
  };

  // ---------- ویرایش ----------
  const openEdit = (record: RowData) => {
    setEditRow(record);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditRow(null);
    setFormSeed(null);
    setFormKey("");
    form.resetFields();
  };

  // وقتی مودال باز شد و لیست دسته‌ها آماده بود، فرم‌سید و کلید را بساز
  useEffect(() => {
    if (!isEditOpen || !editRow || category.length === 0) return;

    const id = resolveCategoryId(editRow, category);
    const seed = {
      categoryId: id,
      questionType:
        editRow?.questionType != null ? String(editRow.questionType) : undefined,
    };
    setFormSeed(seed);
    setFormKey(`edit-${editRow.key}-${id ?? "none"}`);
  }, [isEditOpen, editRow, category]);

  const onFinishEdit = async (values: { categoryId?: number; questionType: string }) => {
    if (!editRow) return;
    try {
      setEditLoading(true);
      const index = values.questionType; // "0" | "1" | ...
      const goalId = values.categoryId != null ? Number(values.categoryId) : null;

      const res = await acceptOrDeleteQuestionByAdmin(editRow.key, index, goalId);


      // اگر به اینجا رسیدیم یعنی HTTP=200 بوده → موفقیت
    const serverMsg = res?.message || res?.Message || "عملیات با موفقیت انجام شد";
    toast.success(serverMsg);

    setData(prev => prev.filter(r => Number(r.key) !== editRow.key));
    closeEdit();
  } catch (err: any) {
    // فقط در صورت 500 (یا شبکه) وارد اینجا می‌شوی
    console.error("SUBMIT error =>", err?.response || err);
    const serverMsg = err?.response?.data?.message || err?.message || "ثبت اطلاعات ناموفق بود";
    toast.error(serverMsg);
  } finally {
    setEditLoading(false);
  }
};

  const columns = [
    { title: "ردیف", dataIndex: "row", key: "row", width: 16 },
    {
      title: "دسته بندی",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "عنوان",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "متن",
      dataIndex: "text",
      key: "text",
      width: 900,
      className: "text-justify whitespace-pre-line",
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "ثبت کننده",
      dataIndex: "registrar",
      key: "registrar",
      width: 120,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "حذف شده",
      dataIndex: "deleted",
      key: "deleted",
      width: 70,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "فعال",
      dataIndex: "active",
      key: "active",
      width: 50,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "عملیات",
      key: "actions",
      dataIndex: "actions",
      render: (_text: any, record: RowData) => (
        <div className="flex gap-3 ">
          <button
            onClick={() => openDetail(record)}
            className="text-green-600 hover:text-green-700 text-md"
            title="جزئیات"
          >
            <EyeOutlined />
          </button>

          <button
            onClick={() => openEdit(record)}
            className="text-green-600 hover:text-green-700 text-md"
            title={categoryLoading ? "در حال بارگیری دسته‌ها..." : "ویرایش"}
            disabled={categoryLoading}
          >
            <EditOutlined />
          </button>
        </div>
      ),
    },
  ];

  const filteredColumns = columns.filter((col: any) =>
    selectedColumns.includes(col.title)
  );

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="p-2 sm:p-4 print:p-0 sm:print:p-0 mr-[10rem] bg-white rounded-xl">
        <div className="mb-4 print:m-0 print:p-0">
          <div className="pb-4 shrink-0 print:p-0">
            <div className="flex flex-col gap-4 print:gap-0 sm:flex-row sm:justify-between sm:items-start">
              <div className="md:ml-16 print:hidden">
                <h1 className="my-0 text-2xl text-[#147C50] font-bold">
                  پرسش های در انتظار تایید
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid mb-4 print:mb-0 print:w-full">
          <div className="flex items-center mb-[5px]">
            <div className="flex items-center ml-auto w-fit gap-x-2">
              <div className="relative group print:hidden">
                <button
                  className="flex items-center px-3 mb-0 text-xs rounded-full cursor-pointer bg-t-layer-bg-color group-hover:bg-t-layer-bg-color-hovered gap-x-1"
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                >
                  <FilterOutlined />
                  <span>تغییر ستون ها</span>
                </button>

                {showColumnSelector && (
                  <div className="absolute max-h-[250px] border rounded-xl right-0 shadow-xl bg-t-bg-color min-w-[100px] overflow-hidden z-10">
                    {columns.map((column: any) => (
                      <div
                        key={column.key}
                        className="flex items-center px-2 py-1 cursor-pointer gap-x-2 hover:bg-t-layer-bg-color"
                        onClick={() =>
                          setSelectedColumns((prev) =>
                            prev.includes(column.title)
                              ? prev.filter((c) => c !== column.title)
                              : [...prev, column.title]
                          )
                        }
                      >
                        <Checkbox checked={selectedColumns.includes(column.title)} />
                        <label className="text-xs cursor-pointer whitespace-nowrap">
                          {column.title}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-x-3">
              <div
                className="flex items-center text-xs cursor-pointer print:hidden gap-x-1 text-t-secondary-text-color inherit-color w-fit"
                onClick={() => !loading && fetchQuestions()}
              >
                <RedoOutlined />
                <span>بروز رسانی</span>
              </div>
              <div className="flex items-center text-xs cursor-pointer print:hidden gap-x-1 text-t-secondary-text-color inherit-color w-fit">
                <PrinterOutlined />
                <span>پرینت</span>
              </div>
            </div>
          </div>
        </div>

        <div className="print:w-full overflow-x-auto print:overflow-x-visible relative">
          <Table
            columns={filteredColumns as any}
            dataSource={data}
            pagination={false}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="داده‌ای موجود نیست"
                />
              ),
            }}
            size="middle"
            className="ant-table-rtl"
            rowKey={(r: RowData) => String(r.key)}
          />
        </div>

        {/* Modal جزئیات */}
        <Modal
          open={isDetailOpen}
          onCancel={closeDetail}
          footer={null}
          width={680}
          centered
          destroyOnClose
          maskClosable
          className="rtl text-right"
        >
          {currentRow && (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b ">
                <h3 className="mb-2 font-bold">{currentRow.title }</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-gray-600">{currentRow.category }</div>
                <div className="flex items-center justify-end gap-1 text-gray-600">
                  {currentRow?.date ? gregorianToJalali(currentRow.date as any) : "—"}
                </div>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-500">
                  <UserOutlined />
                  <span className="mr-1">{currentRow.registrar || "—"}</span>
                </span>
              </div>

              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-2 text-xs text-gray-500">متن پرسش :</div>
                <div className="text-sm leading-7 text-justify whitespace-pre-line">
                  {currentRow.text || "—"}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>حذف شده: {currentRow.deleted ?? "—"}</span>
                <span>فعال: {currentRow.active ?? "—"}</span>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal ویرایش */}
        <Modal
          open={isEditOpen}
          onCancel={closeEdit}
          footer={null}
          width={680}
          centered
          destroyOnClose
          maskClosable
          className="rtl text-right"
          title={null}
        >
          {editRow && formSeed && (
            <div className="space-y-4">
              <div className=" font-bold">تعیین نوع پرسش</div>
              <Divider className="my-2" />

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <div className="text-gray-500">ثبت کننده :</div>
                  <div className="font-medium">{editRow.registrar || "—"}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-gray-500">دسته بندی :</div>
                  <div className="font-medium">{editRow.category || "—"}</div>
                </div>
                <div>
                  <div className="text-gray-500">عنوان :</div>
                  <div className="font-medium">{editRow.title || "—"}</div>
                </div>
              </div>

              <div className="grid  gap-6 text-xs">
                <div>
                  <div className="text-gray-500">متن :</div>
                  <div className="font-medium whitespace-pre-line">{editRow.text || "—"}</div>
                </div>
              </div>

              <Form
                key={formKey}
                form={form}
                layout="vertical"
                requiredMark={false}
                className="mt-2 font-yekan csstom-form"
                preserve={false}
                initialValues={formSeed}
                onFinish={onFinishEdit}
                onValuesChange={(changed) => {
                  if (changed?.questionType === "0") {
                    form.setFieldsValue({ categoryId: undefined });
                  }
                }}
              >
                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.questionType !== cur.questionType}>
                  {({ getFieldValue }) => {
                    const isDelete = getFieldValue("questionType") === "0";
                    return (
                      <Form.Item
                        name="categoryId"
                        label={<span className="text-xs">* دسته‌بندی</span>}
                        rules={[{ required: !isDelete, message: "دسته بندی تعیین نشده است" }]}
                      >
                        <Select
                          className="custom-select"
                          placeholder="انتخاب کنید"
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          disabled={isDelete}
                        >
                          {category.map((dep) => (
                            <Select.Option key={dep.id} value={dep.id}>
                              {dep.goalTitle}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    );
                  }}
                </Form.Item>

                <Form.Item
                  name="questionType"
                  label={<span className="text-xs">* تعیین نوع</span>}
                  rules={[{ required: true, message: "نوع پرسش را انتخاب کنید" }]}
                >
                  <Select
                    className="custom-select"
                    placeholder="انتخاب کنید"
                    options={typeOptions}
                    size="large"
                  />
                </Form.Item>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-5 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition text-sm"
                  >
                    بازگشت
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-sm"
                  >
                    ثبت
                  </button>

                </div>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default PendingQuestions;
