// CommentConfirm.tsx
import { useEffect, useState } from "react";
import {
  Table,
  Empty,
  Checkbox,
  Modal,
  Tooltip,
  Spin,
  Divider,
  Typography,
  Card,
  Tag,
  Space,
  Form,
  Select,
} from "antd";
import {
  RedoOutlined,
  PrinterOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  PaperClipOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import {
  acceptOrDeleteAnswerByAdmin, // ✅ متد واحد
  getCommentsAdmin,
  getQuestionById,
  getCommentsAnswer,
} from "../services/auth";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text, Paragraph } = Typography;

/*--------- انواع داده ---------*/
interface AnswerData {
  key: number;
  row: number;
  category: string;
  questionTitle: string;
  answerText: string;
  registrar: string;
  deleted: string;
  active: string;
  questionId?: number;
}

type ViewAnswer = {
  id: number;
  text?: string;
  user?: { fullName?: string; userName?: string };
  createdAt?: string;
  likeCount?: number;
  isLiked?: boolean;
  tags?: { tagTitle?: string }[];
  mentions?: { userId?: number; fullName?: string }[];
  attachments?: { id?: number; name?: string; address?: string }[];
};

type ViewQuestion = {
  id?: number;
  title: string;
  text: string;
  type?: string;
  goals?: string[];
  tags?: { id?: number; title: string }[];
  mentions?: { id?: number; displayName?: string }[];
  attachments?: { id?: number; fileName?: string; fileUrl?: string }[];
  userName?: string;
  likeCount?: number | null;
  answerCount?: number | null;
  date?: string;
  category?: string;
};

const typeOptions = [
  { value: 0, label: "حذف پاسخ" },
  { value: 1, label: "پاسخ نوع اول" },
  { value: 2, label: "پاسخ نوع دوم" },
  { value: 3, label: "پاسخ نوع سوم" },
];

/*--------- کمکی ---------*/
const formatDate = (d?: string | Date) => {
  if (!d) return "—";
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return typeof d === "string" ? d : "—";
  }
};

const CommentConfirm = () => {
  const [data, setData] = useState<AnswerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    "ردیف",
    "عنوان پرسش",
    "متن پاسخ",
    "ثبت کننده",
    "حذف شده",
    "فعال",
    "عملیات",
  ]);

  // --- state های مربوط به مودال مشاهده ---
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewQuestion, setViewQuestion] = useState<ViewQuestion>({ title: "", text: "" });
  const [viewAnswers, setViewAnswers] = useState<ViewAnswer[]>([]);

  // --- state های مربوط به مودال «ویرایش/تأیید پاسخ» ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<AnswerData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm<{ action: 0 | 1 | 2 | 3 }>(); // ✅ مقدار عددی

  /*------ لیست اصلی جدول ------*/
  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await getCommentsAdmin();
      if (res?.isSuccess && Array.isArray(res.data)) {
        const transformedData: AnswerData[] = res.data.map((item: any, index: number) => ({
          key: item.id,
          row: index + 1,
          category: item.answerTypes?.map((type: any) => type.title).join("، ") || "-",
          questionTitle: item.questionTitle || "-",
          answerText: item.answerText || "-",
          registrar: item.userName || "-",
          deleted: item.isDelete ? "بله" : "خیر",
          active: item.isActive ? "بله" : "خیر",
          questionId: item.questionId ?? item.QuestionId,
        }));
        setData(transformedData);
      } else {
        toast.error(res?.message || "دریافت داده‌ها با مشکل مواجه شد");
      }
    } catch (err) {
      console.error("خطا در دریافت پاسخ‌ها:", err);
      toast.error("خطا در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /*------ تایید/حذف/تعیین نوع پاسخ (از داخل مودال) ------*/
  const onFinishEdit = async ({ action }: { action: 0 | 1 | 2 | 3 }) => {
    if (!editRow) return;
    try {
      setEditLoading(true);

       const res = await acceptOrDeleteAnswerByAdmin(editRow.key, String(action));

      const serverMsg = res?.message || res?.Message || "عملیات با موفقیت انجام شد";
      toast.success(serverMsg);

      setData(prev => prev.filter(r => r.key !== editRow.key));
      closeEdit();
    } catch (err: any) {
      console.error("SUBMIT error =>", err?.response || err);
      const serverMsg = err?.response?.data?.message || err?.message || "ثبت اطلاعات ناموفق بود";
      toast.error(serverMsg);
    } finally {
      setEditLoading(false);
    }
  };

  /*------ باز کردن مودال «مشاهده» و گرفتن جزئیات پرسش + پاسخ‌ها ------*/
  const openViewModal = async (record: AnswerData) => {
    if (!record.questionId) {
      toast.error("شناسه پرسش در داده موجود نیست.");
      return;
    }
    setViewOpen(true);
    setViewLoading(true);

    try {
      // 1) جزییات پرسش
      const qRes: any = await getQuestionById(record.questionId);
      if (qRes?.isSuccess && qRes.data) {
        const q = qRes.data as any;
        setViewQuestion({
          id: q.id,
          title: q.questionTitle ?? record.questionTitle ?? "—",
          text: q.questionText ?? "—",
          type: q.questionType,
          goals: Array.isArray(q.goalTile) ? q.goalTile.filter(Boolean) : [],
          tags: Array.isArray(q.tags)
            ? q.tags.map((t: any) => ({
                id: t.id ?? t.tagId,
                title: t.tagTitle ?? t.title ?? t.name ?? "",
              }))
            : [],
          mentions: Array.isArray(q.mentions)
            ? q.mentions.map((m: any) => ({ id: m.id, displayName: m.userName ?? m.displayName }))
            : [],
          attachments: Array.isArray(q.attachments)
            ? q.attachments.map((a: any) => ({
                id: a.id,
                fileName: a.fileName ?? a.title ?? "پیوست",
                fileUrl: a.url ?? a.fileUrl ?? a.path ?? "#",
              }))
            : [],
          userName: q.user?.fullName ?? q.user?.userName ?? record.registrar,
          likeCount: q.likeCount,
          answerCount: q.answerCount,
          date: q.createdDate,
          category: record.category,
        });

        // 2) پاسخ‌ها
        if (Array.isArray(q.questionAnswers) && q.questionAnswers.length > 0) {
          setViewAnswers(
            q.questionAnswers.map((a: any) => ({
              id: a.id,
              text: a.answerText,
              user: a.user?.fullName ? { fullName: a.user.fullName } : { userName: a.userName },
              createdAt: a.createdDate,
            }))
          );
        } else {
          const ansRes: any = await getCommentsAnswer(record.questionId);
          if (ansRes?.isSuccess && Array.isArray(ansRes.data)) {
            setViewAnswers(
              ansRes.data.map((a: any) => ({
                id: a.id,
                text: a.answerText,
                createdAt: a.createdDate,
                likeCount: a.likeCount ?? 0,
                isLiked: a.isLiked ?? false,
                tags: a.tags ?? [],
                user: a.user,
                mentions: a.mentions ?? [],
                attachments: a.attachments ?? [],
              }))
            );
          } else {
            setViewAnswers([]);
          }
        }
      } else {
        // fallback
        setViewQuestion({
          id: record.questionId,
          title: record.questionTitle || "—",
          text: "—",
          category: record.category,
          userName: record.registrar,
        });

        const ansRes: any = await getCommentsAnswer(record.questionId);
        if (ansRes?.isSuccess && Array.isArray(ansRes.data)) {
          setViewAnswers(
            ansRes.data.map((a: any) => ({
              id: a.id,
              text: a.answerText,
              user: a.userName ? { userName: a.userName } : undefined,
              createdAt: a.createdDate,
            }))
          );
        } else {
          setViewAnswers([]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در دریافت جزئیات پرسش/پاسخ‌ها");
      setViewAnswers([]);
    } finally {
      setViewLoading(false);
    }
  };

  /*------ باز/بستن مودال «ویرایش/تأیید پاسخ» ------*/
  const openEdit = (record: AnswerData) => {
    setEditRow(record);
    setIsEditOpen(true);
    form.setFieldsValue({ action: 1 }); // پیش‌فرض: نوع اول (تأیید)
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditRow(null);
    form.resetFields();
  };

  /*------ ستون‌ها ------*/
  const columns = [
    { title: "ردیف", dataIndex: "row", key: "row", width: 16 },
    {
      title: "عنوان پرسش",
      dataIndex: "questionTitle",
      key: "questionTitle",
      width: 250,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "متن پاسخ",
      dataIndex: "answerText",
      key: "answerText",
      width: 750,
      className: "text-justify whitespace-pre-line",
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "ثبت کننده",
      dataIndex: "registrar",
      key: "registrar",
      width: 150,
      render: (text: string) => <span className="text-xs">{text}</span>,
    },
    {
      title: "حذف شده",
      dataIndex: "deleted",
      key: "deleted",
      width: 90,
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
      width: 110,
      render: (_: any, record: AnswerData) => (
        <div className="flex gap-3">
          <Tooltip title="مشاهده سؤال و پاسخ‌ها">
            <button
              onClick={() => openViewModal(record)}
              className="p-2 rounded-full text-blue-600 transition"
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="ویرایش/تأیید پاسخ">
            <button
              onClick={() => openEdit(record)}
              disabled={loading}
              className="p-2 rounded-full text-green-600 transition disabled:opacity-50"
            >
              <EditOutlined />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const filteredColumns = columns.filter((col) => selectedColumns.includes(col.title as string));

  /*------ رندر ------*/
  return (
    <>
      <Toaster position="bottom-right" />

      <div
        className="p-4 bg-white rounded-xl print:mr-0 mr-[10rem] relative"
        onClick={() => setShowColumnSelector(false)}
      >
        <h1 className="text-2xl text-[#147C50] font-bold mb-4">پاسخ‌های در انتظار تایید</h1>

        {/* نوار بالا */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <button
              className="flex items-center gap-1 text-xs px-3 py-1 bg-gray-100 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setShowColumnSelector((prev) => !prev); // ✅ ساده
              }}
            >
              <FilterOutlined />
              تغییر ستون
            </button>

            {showColumnSelector && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white border shadow-xl rounded-lg z-50 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    onClick={() =>
                      setSelectedColumns((prev) =>
                        prev.includes(col.title as string)
                          ? prev.filter((c) => c !== col.title)
                          : [...prev, col.title as string]
                      )
                    }
                    className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    <Checkbox
                      checked={selectedColumns.includes(col.title as string)}
                      style={{ accentColor: "green" }}
                    />
                    <span className="text-sm">{col.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => !loading && fetchData()}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-gray-100 rounded-md"
            >
              <RedoOutlined />
              بروزرسانی
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-gray-100 rounded-md"
            >
              <PrinterOutlined />
              پرینت
            </button>
          </div>
        </div>

        {/* جدول */}
        <Table
          columns={filteredColumns}
          dataSource={data}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="پاسخی برای نمایش وجود ندارد"
              />
            ),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </div>

      {/* --- مودال مشاهده سؤال و پاسخ‌ها --- */}
      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={860}
        centered
        title={<Title level={4} style={{ margin: 0 }}>{viewQuestion.title}</Title>}
      >
        {viewLoading ? (
          <Spin />
        ) : (
          <>
            {viewQuestion.goals?.length ? (
              <div className="my-2">
                {viewQuestion.goals.map((goal, i) => (
                  <Text key={i}>{goal}</Text>
                ))}
              </div>
            ) : null}

            <div className="flex-1">
              <div className="flex justify-between">
                <Text strong>
                  <UserOutlined /> {viewQuestion.userName || "کاربر"}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(viewQuestion.date)}
                </Text>
              </div>
            </div>

            <Card style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <Text strong className="block mb-2">متن پرسش:</Text>
              <Paragraph className="whitespace-pre-line text-justify m-0">
                {viewQuestion.text || "—"}
              </Paragraph>

              {viewQuestion.tags?.length ? (
                <div className="mb-1">
                  <Text type="secondary" style={{ fontSize: 12 }}>تگ‌ها:</Text>
                  <Space size={[6, 6]} wrap className="mt-1">
                    {viewQuestion.tags.map((t, i) => (
                      <Tag key={t.id ?? i} color="green">
                        {t.title || "—"}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ) : null}

              {viewQuestion.attachments && viewQuestion.attachments.length > 0 ? (
                <div className="mt-3">
                  <Text type="secondary" style={{ fontSize: 12 }}>پیوست‌ها:</Text>
                  <div className="mt-1 flex flex-col gap-1">
                    {viewQuestion.attachments.map((a, i) => (
                      <a
                        key={a.id ?? i}
                        href={a.fileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm"
                      >
                        <PaperClipOutlined />&nbsp;{a.fileName || "دانلود"}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>

            <Divider>پاسخ‌ها</Divider>

            {viewAnswers.length === 0 ? (
              <Empty description="پاسخی برای این سؤال وجود ندارد" />
            ) : (
              viewAnswers.map((ans) => (
                <Card
                  key={ans.id}
                  style={{
                    marginBottom: 12,
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <Text strong>
                          <UserOutlined /> {ans.user?.fullName || ans.user?.userName || "کاربر"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(ans.createdAt)}
                        </Text>
                      </div>

                      <Paragraph
                        style={{
                          marginTop: 8,
                          marginBottom: 0,
                          whiteSpace: "pre-line",
                          textAlign: "justify",
                        }}
                      >
                        {ans.text || "—"}
                      </Paragraph>

                      {ans.tags?.length ? (
                        <div className="mt-2">
                          <Text type="secondary" style={{ fontSize: 12 }}>تگ‌ها:</Text>
                          {ans.tags.map((t, i) => (
                            <Tag key={i} color="green">
                              {t.tagTitle || "—"}
                            </Tag>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-2 flex items-center gap-2 text-gray-500 text-xs">
                        <LikeOutlined />
                        <span>{ans.likeCount ?? 0}</span>
                        {ans.isLiked && (
                          <Tag color="gold" style={{ marginRight: 8 }}>
                            پسند شده
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </Modal>

      {/* --- مودال «ویرایش/تأیید پاسخ» --- */}
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
        {editRow && (
          <div className="space-y-4">
            <div className="font-bold">تعیین نوع پاسخ</div>
            <Divider className="my-2" />

            {/* خلاصه اطلاعات */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <div className="text-gray-500">ثبت کننده :</div>
                <div className="font-medium">{editRow.registrar || "—"}</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-gray-500">عنوان پرسش :</div>
                <div className="font-medium">{editRow.questionTitle || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">وضعیت‌ها :</div>
                <div className="font-medium">
                  حذف‌شده: {editRow.deleted ?? "—"} | فعال: {editRow.active ?? "—"}
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <div className="text-gray-500">متن پاسخ :</div>
                <div className="font-medium whitespace-pre-line text-justify">
                  {editRow.answerText || "—"}
                </div>
              </div>
            </div>

            {/* فرم عملیات */}
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="mt-2 font-yekan custom-form"
              style={{ direction: "rtl", fontFamily: "BYekan" }}
              preserve={false}
              initialValues={{ action: 1 }}
              onFinish={onFinishEdit}
            >
              <Form.Item
                name="action"
                label={<span className="text-xs">تعیین نوع</span>}
                rules={[{ required: true, message: "عملیات را انتخاب کنید" }]}
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
                  {editLoading ? "در حال ثبت..." : "ثبت"}
                </button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CommentConfirm;
