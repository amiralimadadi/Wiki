import React, { useEffect, useRef, useState } from "react";
import { Modal, Form, Input, Select, Button, message, Row, Col } from "antd";
import { fetchCategorys, fetchDepartments, searchFormName, confirmProject } from "../../services/auth";
import { baseUrlForDownload } from "../../configs/api";
import DeleteIcon from "../../svgs/DeleteIconProps";
import type { User } from "../../forms/CreateKnowledgeContent";
import IconPdf from "../../svgs/IconPdf";

const { TextArea } = Input;

/** ========= Types ========= **/
interface ConfirmProjectPayload {
  userIds: number[];
  entityId: number;
  goalId: number;
  unitIds: number[];
  title: string;
  abstract: string;
  ideaCode: string;
  proposalCode: string;
}

interface ApprovalProjectModal {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (res?: any) => void;
  data: any | null;
}

type Opt = { value: number; label: string };
type LabeledVal = { value: number; label: string };
type PersonOpt = { value: number; label: string; display: string; disabled?: boolean };

type FormValues = {
  GoalId?: number;
  Title: string;
  IdeaCode?: string;
  proposalCode?: string;
  Abstract: string;
  units?: LabeledVal[]; // چند انتخابی (lowercase مطابق با فرم)
  people: LabeledVal[];
};

/** ========= Component ========= **/
const ApprovalModal: React.FC<ApprovalProjectModal> = ({
  visible,
  onCancel,
  onSubmit,
  data
}) => {
  const [form] = Form.useForm<FormValues>();

  // گزینه‌های Select (نرمال‌شده برای antd)
  const [categoryOptions, setCategoryOptions] = useState<Opt[]>([]);
  const [deptOptions, setDeptOptions] = useState<Opt[]>([]);

  // افراد
  const [peopleOptions, setPeopleOptions] = useState<PersonOpt[]>([]);
  const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
  const [peopleSearch, setPeopleSearch] = useState("");

  // جلوگیری از race condition و دیباونس
  const searchCounter = useRef(0);

  // مقادیر انتخاب‌شده از فرم
  const selectedPeople = (Form.useWatch("people", form) ?? []) as LabeledVal[];
  const selectedUnits = (Form.useWatch("units", form) ?? []) as LabeledVal[];

  /** ====== Helpers ====== **/
  const safeLabel = (s?: string, fallback?: string) => (s ?? "").trim() || (fallback ?? "").trim() || "—";

  const isSsoAccount = (u: User) => {
    const email = (u.email || "").trim();
    const local = (email.split("@")[0] || "").toLowerCase();
    const username = (u.userName || "").toLowerCase();
    return local.startsWith("sso") || username.startsWith("sso");
  };

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const r = await searchFormName(text);
      return (Array.isArray(r) ? r : []).filter((u) => !isSsoAccount(u));
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
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

  /** ====== Submit ====== **/
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: FormValues) => {
    try {
      setSubmitting(true);

      // جلوگیری از تکراری‌ها
      const uniqPeople = Array.from(new Map((values.people ?? []).map((v) => [Number(v.value), v])).values());
      const uniqUnits = Array.from(new Map((values.units ?? []).map((v) => [Number(v.value), v])).values());

      const payload: ConfirmProjectPayload = {
        entityId: Number(data?.key ?? data?.id),
        goalId: Number(values.GoalId),
        title: (values.Title || "").trim(),
        abstract: (values.Abstract || "").trim(),
        ideaCode: (values.IdeaCode ?? "").toString().trim(),
        proposalCode: (values.proposalCode ?? "").toString().trim(),
        unitIds: uniqUnits.map((u) => Number(u.value)), // ✅ از units
        userIds: uniqPeople.map((x) => Number(x.value)), // ✅ از people
      };

      const res = await confirmProject(payload);
      onSubmit?.(res);
    } catch (err: any) {
      const api = err?.response?.data;
      const first = api?.modelErrors?.[0];
      const fallback = api?.message || "خطای غیرمنتظره هنگام ارسال";
      const msg = first?.modelErrorMessage || fallback;
      message.error(msg);

      if (first?.modelPropertyName) {
        const map: Record<string, string> = {
          Title: "Title",
          Abstract: "Abstract",
          IdeaCode: "IdeaCode",
          proposalCode: "proposalCode",
          GoalId: "GoalId",
          UnitId: "units", // اگر بک‌اند UnitId گفت، روی units ارور بده
          UserId: "people",
        };
        const fieldName = map[first.modelPropertyName] || first.modelPropertyName;
        form.setFields([{ name: fieldName as any, errors: [msg] }]);
      }
    } finally {
      setSubmitting(false);
    }
  };


  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetchCategorys();
        const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const opts: Opt[] = raw.map((g: any) => (
          {
            value: Number(g.id ?? g.goalId), label: safeLabel(g.goalTitle || g.title, `دسته ${g.id}`)
          }
        ));
        if (!canceled) setCategoryOptions(opts);
      } catch (e) {
        console.error(e);
        if (!canceled) setCategoryOptions([]);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);


  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const result = await fetchDepartments();
        const raw = Array.isArray(result?.data) ? result.data : result?.data?.items || [];
        const opts: Opt[] = (raw || []).map((d: any) => ({ value: Number(d.id), label: safeLabel(d.departmentTitle || d.title, `واحد ${d.id}`) }));
        if (!canceled) setDeptOptions(opts);
      } catch (error) {
        console.error("خطا در API:", error);
        if (!canceled) setDeptOptions([]);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);



  useEffect(() => {
    if (!(visible && data)) return;

    const gid = data.goalId ? Number(data.goalId) : undefined;

    // اگر goalTitle داریم و گزینه‌اش هنوز ساخته نشده، یک گزینه موقت اضافه کن
    if (gid && data.goalTitle && !categoryOptions.find((o) => o.value === gid)) {
      setCategoryOptions((prev) => [{ value: gid, label: data.goalTitle }, ...prev]);
    }

    // units موجود در data را به شکل labelInValue ست کن
    const unitIds: number[] = Array.isArray(data.unitIds) ? data.unitIds : data.unitId ? [data.unitId] : [];
    const unitsLV: LabeledVal[] = unitIds.map((id: number) => {
      const found = deptOptions.find((d) => d.value === Number(id));
      return { value: Number(id), label: found?.label ?? `واحد ${id}` };
    });

    form.setFieldsValue({
      GoalId: gid,
      Title: data.title ?? "",
      IdeaCode: data.ideaCode ?? "",
      proposalCode: data.proposalCode ?? "",
      Abstract: data.abstract ?? "",
      units: unitsLV,
      people: [],
    });
  }, [visible, data, categoryOptions, deptOptions, form]);

  // useEffect #4: پاک‌سازی هنگام بستن مودال
  useEffect(() => {
    if (visible) return;
    form.resetFields();
    setPeopleOptions([]);
    setPeopleSearch("");
    searchCounter.current = 0;
  }, [visible, form]);


  /** ====== Render ====== **/
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={<p className="mb-0 text-lg">تایید پروژه</p>}
      centered
      className="rtl"
    >
      <div className="pt-2 border-gray-300">
        <Form form={form} layout="vertical" className="mt-2 font-yekan csstom-form print:hidden" onFinish={handleFinish}>
          <Form.Item
            name="GoalId"
            label="دسته‌بندی"
            rules={[{ required: true, message: "لطفاً دسته‌بندی را انتخاب کنید" }]}
          >
            <Select
              className="custom-input"
              showSearch
              allowClear
              placeholder="انتخاب دسته‌بندی"
              options={categoryOptions}
              optionFilterProp="label"
              loading={!categoryOptions.length}
            />
          </Form.Item>

          <Form.Item name="Title" label="عنوان" rules={[{ required: true, message: "عنوان الزامی است" }]}>
            <Input className="custom-input" placeholder="عنوان" />
          </Form.Item>

          <Form.Item name="IdeaCode" label="کد ایده">
            <Input placeholder="کد ایده" className="custom-input" />
          </Form.Item>

          <Form.Item name="proposalCode" label="کد طرح">
            <Input placeholder="کد طرح" className="custom-input" />
          </Form.Item>

          <Form.Item name="Abstract" label="چکیده" rules={[{ required: true, message: "چکیده الزامی است" }]}>
            <TextArea rows={3} placeholder="چکیده" className="custom-input" />
          </Form.Item>

          {/* پیوست‌ها */}
          {Array.isArray(data?.attachments) &&
            data.attachments.map((atta: any) => (
              atta?.address ? (
                <a
                  key={atta.id}
                  href={`${baseUrlForDownload}${atta.address}`}
                  download={atta.name}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between gap-10 w-fit mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl"
                  style={{ direction: "ltr" }}
                >
                  <div className="flex items-center gap-1 text-[1rem]">
                    <span className="block overflow-clip">
                      {atta.name || "دانلود فایل پیوست"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[1rem] font-medium">فایل پیوست</span>
                    <IconPdf size={22} />
                  </div>
                </a>
              ) : null
            ))}


          <div className="flex flex-col gap-3 font-yekan bg-gray-100 rounded-xl font-semibold mt-2 p-3">
            <label className="font-yekan">تعیین دسترسی</label>
            {/* بخش واحد و افراد */}
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
                    options={deptOptions}
                    tagRender={() => null}
                    maxTagCount={0}
                    maxTagPlaceholder={null}
               
                  />
                </Form.Item>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUnits.map(({ value, label }) => (
                    <span key={value} className="flex items-center gap-2 bg-gray-100 text-sm rounded px-2 py-[4px] border border-gray-300">
                      {label}
                      <button
                        style={{ color: "#ff4d4f" }}
                        onClick={() => form.setFieldValue("units", selectedUnits.filter((x) => x.value !== value))}
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
                  allowClear
                  searchValue={peopleSearch}
                  onSearch={(val) => { setPeopleSearch(val); onPeopleSearch(val); }}
                  autoClearSearchValue={false}
                  filterOption={false}
                  options={peopleOptions}
                  optionLabelProp="label"
                  optionRender={(opt) => (
                    <div className="font-yekan">{opt.data.display ?? opt.data.label}</div>
                  )}
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

          <div className="flex justify-end gap-4 mt-10">
            <Button onClick={onCancel} className="min-w-[130px] px-6">
              بازگشت
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="min-w-[130px] px-6 bg-[#007041]">
              تایید
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
