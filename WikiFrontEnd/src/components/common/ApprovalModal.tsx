import React, { useEffect, useRef, useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { getGoalTree, fetchDepartments, searchFormName, confirmProposal, } from "../../services/auth";
import type { User } from "../../forms/CreateKnowledgeContent";
import DeleteIcon from "../../svgs/DeleteIconProps";
import { baseUrlForDownload } from "../../configs/api";
import IconPdf from "../../svgs/IconPdf";

const { TextArea } = Input;

/** ========= Types ========= **/
interface ConfirmProposalPayload {
  userIds: number[];
  entityId: number;
  goalId: number;
  unitIds: number[];
  title: string;
  abstract: string;
  ideaCode: string;
  proposalCode: string;
}

interface ApprovalModalProps {
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
  Abstract: string;
  Units?: LabeledVal[];     // چند انتخابی
  people: LabeledVal[];
};

/** ========= Component ========= **/
const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  data,
}) => {
  const [form] = Form.useForm<FormValues>();

  // دسته‌بندی‌ها و واحدها
  const [categoryOptions, setCategoryOptions] = useState<Opt[]>([]);
  const [deptOptions, setDeptOptions] = useState<Opt[]>([]);

  // افراد
  const [peopleOptions, setPeopleOptions] = useState<PersonOpt[]>([]);
  const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
  const [peopleSearch, setPeopleSearch] = useState("");

  // شمارنده برای جلوگیری از race
  const searchCounter = useRef(0);

  // مقدار انتخاب‌شده‌ها از فیلدها
  const selectedPeople =
    (Form.useWatch("people", form) ?? []) as Array<LabeledVal>;

  /** ====== Helpers ====== **/
  const safeLabel = (s?: string, fallback?: string) =>
    (s ?? "").trim() || (fallback ?? "").trim() || "—";

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
      const uniqPeople = Array.from(
        new Map((values.people ?? []).map(v => [Number(v.value), v])).values()
      );
      const uniqUnits = Array.from(
        new Map((values.Units ?? []).map(v => [Number(v.value), v])).values()
      );

      const payload: ConfirmProposalPayload = {
        entityId: Number(data?.key ?? data?.id),
        goalId: Number(values.GoalId),
        title: (values.Title || "").trim(),
        abstract: (values.Abstract || "").trim(),
        ideaCode: (values.IdeaCode ?? "").toString().trim(),
        proposalCode: data?.planCode || "",
        unitIds: uniqUnits.map(u => Number(u.value)),     // ⬅️ چند انتخابی
        userIds: uniqPeople.map((x) => Number(x.value)),
      };

      const res = await confirmProposal(payload);
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
          GoalId: "GoalId",
          UnitId: "Units", // اگر بک‌اند UnitId گفت، روی Units ارور بده
          UserId: "people",
        };
        const fieldName = map[first.modelPropertyName] || first.modelPropertyName;
        form.setFields([{ name: fieldName as any, errors: [msg] }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** ====== Init & Data Load ====== **/
  useEffect(() => {
    if (visible && data) {
      const gid = data.goalId ? Number(data.goalId) : undefined;

      // اگر goalTitle داریم و options هنوز نیومده، یک گزینه موقت اضافه کن
      if (gid && data.goalTitle && !categoryOptions.find((o) => o.value === gid)) {
        setCategoryOptions((prev) => [{ value: gid, label: data.goalTitle }, ...prev]);
      }

      form.setFieldsValue({
        GoalId: gid,
        Title: data.title ?? "",
        IdeaCode: data.ideaCode ?? "",
        Abstract: data.abstract ?? "",
        Units: (Array.isArray(data.unitIds) ? data.unitIds : data.unitId ? [data.unitId] : [])
          .map((id: number) => {
            const found = deptOptions.find(d => d.value === Number(id));
            return { value: Number(id), label: found?.label ?? `واحد ${id}` };
          }),
        people: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, data, categoryOptions, deptOptions]);

  useEffect(() => {
    (async () => {
      try {
        const r = await getGoalTree();
        const list = Array.isArray(r?.data) ? r.data : [];
        const opts = list.map((g: any) => ({
          value: Number(g.id ?? g.goalId),
          label: safeLabel(g.goalTitle || g.title, `دسته ${g.id}`),
        }));
        setCategoryOptions((prev) => {
          const map = new Map<number, string>();
          [...prev, ...opts].forEach((o) => map.set(o.value, o.label));
          return Array.from(map, ([value, label]) => ({ value, label }));
        });
      } catch (e) {
        console.error("getGoalTree error:", e);
        setCategoryOptions([]);
      }

      try {
        const d = await fetchDepartments();
        const list = Array.isArray(d?.data) ? d.data : d?.data?.items || [];
        setDeptOptions(
          (list || []).map((x: any) => ({
            value: Number(x.id),
            label: safeLabel(x.departmentTitle || x.title, `واحد ${x.id}`),
          }))
        );
      } catch (e) {
        console.error("fetchDepartments error:", e);
        setDeptOptions([]);
      }
    })();
  }, []);

  // پاکسازی هنگام بستن
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setPeopleOptions([]);
      setPeopleSearch("");
      searchCounter.current = 0;
    }
  }, [visible, form]);

  /** ====== Render ====== **/
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={<p className="mb-0 text-lg">تایید طرح</p>}
      centered
      className="rtl"
      destroyOnClose
    >
      <div className="pt-2 border-gray-300">
        <Form
          form={form}
          layout="vertical"
          className="mt-2 font-yekan csstom-form print:hidden"
          onFinish={handleFinish}
        >
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

          <Form.Item
            name="Title"
            label="عنوان"
            rules={[{ required: true, message: "عنوان الزامی است" }]}
          >
            <Input className="custom-input" placeholder="عنوان" />
          </Form.Item>

          <Form.Item name="IdeaCode" label="کد ایده">
            <Input placeholder="کد ایده" className="custom-input" />
          </Form.Item>

          <Form.Item
            name="Abstract"
            label="چکیده"
            rules={[{ required: true, message: "چکیده الزامی است" }]}
          >
            <TextArea rows={3} placeholder="چکیده" className="custom-input" />
          </Form.Item>

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

          <div className="p-4 mt-4 bg-gray-100 rounded">
            <p className="font-medium">تعیین دسترسی</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2 mt-2">
              {/* واحد - چند انتخابی */}
              <Form.Item className="font-yekan" label="واحد" name="Units">
                <Select
                  className="font-yekan custom-input"
                  mode="multiple"
                  labelInValue
                  placeholder="انتخاب کنید"
                  options={deptOptions}
                  optionFilterProp="label"
                  allowClear
                  loading={!deptOptions.length}
                  tagRender={() => null}
                  maxTagCount={0}
                  maxTagPlaceholder={null}
            
                />
              </Form.Item>
              {/* افراد - چند انتخابی با سرچ ریموت */}
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

              {/* چیپ‌های زیر فیلد افراد */}
              <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-auto pr-1">
                {selectedPeople.map(({ value, label }) => (
                  <span
                    key={`p-${value}`}
                    className="flex items-center gap-2 bg-white text-sm rounded px-2 py-[4px] border border-gray-300"
                  >
                    {label}
                    <button
                      type="button"
                      className="hover:opacity-80"
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
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <Button onClick={onCancel} className="min-w-[130px] px-6">
              بازگشت
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="min-w-[130px] px-6 bg-[#007041]"
            >
              تایید
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
