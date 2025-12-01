import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Empty,
  Checkbox,
  Button,
  Pagination,
  Spin,
  Select,
  Popover,
  Form,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FilterOutlined,
  RedoOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import {
  deactivateKnowledgeContent,
  fetchCategorys,
  getAdminKnowledgeContent,
} from "../services/auth";

import { toPersianDigits } from "../utils/persianNu";
import { Toaster, toast } from "react-hot-toast";
import ModalReusabale from "../components/common/ModalReusabale";

// ===============================
// Types
// ===============================
interface KnowledgeContent {
  key: number;
  row: number;
  id: number;
  knowledgeContentType: string;
  title: string;
  text: string;
  abstract: string;
  goalTitle: string;
  createdDate: string;
  goalId: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isConfirm: boolean;
  user: {
    fullName: string;
  };
  // برای جدول
  summary: string;
  content: string;
  type: string;
  likes: number;
  comments: number;
  author: string;

  isActive: boolean;
  approved: boolean; // مشتق از isActive برای نمایش
  attachments?: {
    id?: number;
    address?: string;
    name?: string;
  }[];
  tags: string | { tagTitle: string }[];
  mentions?: {
    userId: number;
    fullName?: string;
  }[];
  references: string;
}

// ===============================
// Utils
// ===============================
const toStringTags = (input: unknown): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) {
    if (typeof input[0] === "string") {
      return (input as string[]).map((s) => s.trim()).filter(Boolean);
    }
    return (input as { tagTitle?: string }[])
      .map((t) => (t?.tagTitle ?? "").trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,#\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const truncateText = (text: string | undefined, maxLength: number) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// ===============================
// Component
// ===============================
const KnowledgeContenAdmin: React.FC = () => {
  const [form] = Form.useForm();

  // UI state
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(true);
  const [visiblePopoverId, setVisiblePopoverId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Data state
  const [data, setData] = useState<KnowledgeContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  // Filters & paging
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [pageCount, setPageCount] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [currentKnowledgeContent, setCurrentKnowledgeContent] = useState<KnowledgeContent | null>(null);

  // Columns picker state
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "ردیف",
    "عنوان",
    "چکیده",
    "متن",
    "نوع",
    "لایک",
    "نظر",
    "کاربر",
    "تایید شده",
    "تگ ها",
    "مرجع",
    "وضعیت",
    "عملیات",
  ]);

  const toggleColumn = (columnName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnName)
        ? prev.filter((col) => col !== columnName)
        : [...prev, columnName]
    );
  };

  // ===============================
  // Data fetchers
  // ===============================
  const processData = useCallback(
    (apiData: any[], pageNo: number) => {
      const startIndex = (pageNo - 1) * pageSize;
      const newData: KnowledgeContent[] = apiData.map((item: any, index: number) => {

        const fullName = item?.user?.fullName ?? "";
        return {
          key: item.id,
          id: item.id,
          row: startIndex + index + 1,

          knowledgeContentType: item.knowledgeContentType ?? "",
          title: item.title ?? "",
          text: item.text ?? "",
          abstract: item.abstract ?? "",
          goalTitle: item.goalTitle ?? "",
          createdDate: item.createdDate ?? "",
          goalId: item.goalId,

          likeCount: item.likeCount ?? 0,
          commentCount: item.commentCount ?? 0,
          isLiked: !!item.isLiked,
          isConfirm: !!item.isConfirm,
          isActive: !!item.isActive,

          summary: truncateText(item.abstract ?? "", 120),
          content: truncateText(item.text ?? "", 140),
          type: item.knowledgeContentType ?? "",
          likes: item.likeCount ?? 0,
          comments: item.commentCount ?? 0,
          author: fullName,
          approved: !!item.isActive,

          user: { fullName },
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
          mentions: Array.isArray(item.mentions) ? item.mentions : [],

          tags:
            Array.isArray(item.tags) && item.tags.length > 0
              ? item.tags.map((t: any) => t.tagTitle).join(", ")
              : "",
          references: truncateText(item.references ?? "", 10),
        };
      });
      setData(newData);
    },
    []
  );

  const loadPage = useCallback(
    async (pageNo: number) => {
      setLoading(true);
      try {
        const resp = await getAdminKnowledgeContent(
          selectedCategoryId ?? undefined,
          "",
          pageNo,
          pageSize
        );

        const apiData = resp?.data ?? [];
        processData(apiData, pageNo);
        setPageCount(resp?.pagingInfo?.pageCount ?? 1);
        setTotalItems(
          resp?.pagingInfo?.totalItems ?? resp?.pagingInfo?.totalCount ?? apiData.length
        );
      } catch (e) {
        console.error(e);
        message.error("خطا در دریافت اطلاعات");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, processData, selectedCategoryId]
  );


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



  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  useEffect(() => {
    setCurrentPage(1);
    loadPage(1);
  }, [selectedCategoryId, loadPage]);

  // ===============================
  // Actions
  // ===============================
  const handleRefresh = async () => {
    await loadPage(currentPage);
  };

  const clearFilter = async () => {
    form.resetFields();
    setSelectedCategoryId(null);
    setCurrentPage(1);
    await loadPage(1);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    await loadPage(1);
  };

  const toggleApproval = async (record: KnowledgeContent) => {
    const id = record.key;
    if (loadingIds.includes(id)) return;
    try {
      setLoadingIds((prev) => [...prev, id]);

      // Optimistic UI: isActive را برعکس می‌کنیم
      setData((prev) =>
        prev.map((x) =>
          x.key === id ? { ...x, isActive: !x.isActive, approved: !x.isActive } : x
        )
      );

      const response = await deactivateKnowledgeContent(id);
      if (!response?.isSuccess) {
        message.error("خطا در تغییر وضعیت محتوا");
        setData((prev) =>
          prev.map((x) =>
            x.key === id ? { ...x, isActive: record.isActive, approved: record.isActive } : x
          )
        );
      } else {
        message.success("وضعیت محتوا با موفقیت تغییر کرد");
        await loadPage(currentPage);
      }
    } catch (error) {
      console.error("Error toggling approval:", error);
      message.error("خطا در تغییر وضعیت محتوا");
      setData((prev) =>
        prev.map((x) =>
          x.key === id ? { ...x, isActive: record.isActive, approved: record.isActive } : x
        )
      );
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id));
      setVisiblePopoverId(null);
    }
  };

  const handleViewModalOpen = (knowledgeContent: KnowledgeContent) => {
    setCurrentKnowledgeContent(knowledgeContent);
    setViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setCurrentKnowledgeContent(null);
  };

  // ===============================
  // Columns
  // ===============================
  const columns: ColumnsType<KnowledgeContent> = useMemo(
    () => [
      {
        title: "ردیف",
        dataIndex: "row",
        key: "row",
        width: 60,
        render: (text) => <span style={{ fontSize: 12, color: "#333" }}>{text}</span>,
      },
      {
        title: "عنوان",
        dataIndex: "title",
        key: "title",
        render: (text: string) => (
          <div className="line-clamp-2 max-w-[140px]" title={text}>
            {text}
          </div>
        ),
      },
      {
        title: "چکیده",
        dataIndex: "summary",
        key: "summary",
        render: (text: string) => (
          <div className="line-clamp-2 text-[12px] max-w-[140px]" title={text}>
            {text}
          </div>
        ),
      },
      {
        title: "متن",
        dataIndex: "content",
        key: "content",
        render: (text: string) => (
          <div className="line-clamp-2 text-[12px] max-w-[120px]" title={text}>
            {text}
          </div>
        ),
      },
      {
        title: "نوع",
        dataIndex: "type",
        key: "type",
        render: (text: string) => (
          <div className="line-clamp-2 text-[12px] max-w-[90px]" title={text}>
            {text}
          </div>
        ),
      },
      {
        title: "لایک",
        dataIndex: "likes",
        key: "likes",
        render: (value: number) => (
          <div className="text-[13px]" title={String(value)}>{toPersianDigits(value)}</div>
        ),
      },
      {
        title: "نظر",
        dataIndex: "comments",
        key: "comments",
        render: (value: number) => (
          <div className="text-[13px]" title={String(value)}>{toPersianDigits(value)}</div>
        ),
      },
      {
        title: "کاربر",
        dataIndex: "author",
        key: "author",
        render: (text: string) => (
          <div className="line-clamp-2 text-[12px] max-w-[110px]" title={text}>
            {text}
          </div>
        ),
      },
      {
        title: "تایید شده",
        dataIndex: "approved",
        key: "approved",
        render: (approved: boolean) => (
          <div className="flex items-center gap-1" title={approved ? "فعال" : "غیرفعال"}>
            {approved ? (
              <CheckCircleOutlined className="text-green-500 text-xl" />
            ) : (
              <CloseCircleOutlined className="text-red-500 text-xl" />
            )}
            <span className="text-xs">{approved ? "فعال" : "غیرفعال"}</span>
          </div>
        ),
      },
      {
        title: "تگ ها",
        dataIndex: "tags",
        key: "tags",
        render: (text: string | { tagTitle: string }[]) => (
          <div className="line-clamp-2" title={Array.isArray(text) ? text.map((t) => (t as any).tagTitle).join(", ") : text}>
            {Array.isArray(text) ? text.map((t) => (t as any).tagTitle).join(", ") : text}
          </div>
        ),
      },
      {
        title: "مرجع",
        dataIndex: "references",
        key: "references",
        render: (text: string) => <div className="line-clamp-2" title={text}>{text || "ندارد"}</div>,
      },
      {
        title: "وضعیت",
        key: "status",
        render: (_, record) => {
          const isVisible = visiblePopoverId === record.key;
          return (
            <Popover
              content={
                <div className="text-right max-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-black">
                      <ExclamationCircleOutlined className="text-[20px]" />
                    </span>
                    <p className="m-0 text-sm">
                      آیا وضعیت به&nbsp;
                      <strong>{record.isActive ? "غیرفعال" : "فعال"}</strong>
                      &nbsp;تغییر کند؟
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="small" onClick={() => setVisiblePopoverId(null)}>
                      لغو
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      style={{ backgroundColor: "#16a34a" }}
                      onClick={() => {
                        setVisiblePopoverId(null);
                        toggleApproval(record);
                      }}
                    >
                      تایید
                    </Button>
                  </div>
                </div>
              }
              title={null}
              trigger="click"
              placement="top"
              open={isVisible}
              onOpenChange={(visible) => setVisiblePopoverId(visible ? record.key : null)}
            >
              <div
                className="cursor-pointer"
                style={{ pointerEvents: loadingIds.includes(record.key) ? "none" : "auto" }}
              >
                {loadingIds.includes(record.key) ? (
                  <Spin size="small" />
                ) : record.isActive ? (
                  <CheckCircleOutlined className="text-green-500 text-xl" />
                ) : (
                  <CloseCircleOutlined className="text-red-500 text-xl" />
                )}
              </div>
            </Popover>
          );
        },
      },
      {
        title: "عملیات",
        key: "actions",
        render: (_, record) => (
          <Button
            icon={<EyeOutlined />}
            type="text"
            className="text-primary"
            onClick={() => handleViewModalOpen(record)}
          />
        ),
      },
    ],
    [loadingIds, visiblePopoverId]
  );

  const filteredColumns = useMemo(
    () => columns.filter((col) => selectedColumns.includes(col.title as string)),
    [columns, selectedColumns]
  );

  // ===============================
  // Render
  // ===============================
  return (
    <>
      <div className="p-4 bg-white rounded-xl lg:mr-[11rem] mr-0 print:mr-0 ">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl text-[#147C50] font-bold">لیست محتوا دانشی</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col mb-10 rounded-t-default print:hidden bg-t-ascend-color/5">
          <div
            className="flex items-center justify-between  cursor-pointer rounded-xl bg-gray-100 transition-colors duration-300"
            onClick={() => setExpandedFilter(!expandedFilter)}
          >
            <div className="flex items-center gap-2 mb-0 mr-3">
              <FilterOutlined />
              <span className="text-[15px] text-[#333333]">فیلترها</span>
            </div>
            <div className="flex items-center p-2 rounded-xl gap-x-2 bg-t-ascend-color/10 hover:bg-t-ascend-color/20">
              <div className="bg-gray-200 w-[30px] h-[30px] rounded-xl flex items-center justify-center">
                <DownOutlined
                  className={`transition-transform duration-300 ${expandedFilter ? "rotate-180" : "rotate-0"}`}
                />
              </div>
            </div>
          </div>

          {expandedFilter && (
            <div className="transition-all duration-700 ease-in-out max-h-[2000px] md:max-h-[1000px] opacity-100 p-3 m-0">
              <Form layout="vertical" form={form} className="print:hidden">
                <div className="print:grid print:grid-cols-2 md:grid grid-cols-1 gap-x-5 md:grid-cols-2 gap-y-2">
                  <Form.Item label="دسته بندی" name="category">
                    <Select
                      className="custom-select .ant-select-selector"
                      placeholder="انتخاب کنید"
                      onChange={(value) => setSelectedCategoryId(typeof value === 'number' ? value : (value ? Number(value) : null))}
                      onClear={() => setSelectedCategoryId(null)}
                      value={selectedCategoryId ?? undefined}
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
                </div>

                <div className="flex flex-col justify-between gap-4 mt-10 sm:items-center sm:flex-row col-span-full">
                  <div>
                    <p className="relative z-50 m-0 cursor-pointer text-t-primary-color hover:underline">
                      جستجو پیشرفته
                    </p>
                  </div>
                  <div className="flex justify-end w-full gap-x-4 sm:w-fit">
                    <Button type="default" style={{ minWidth: 130 }} onClick={clearFilter}>
                      حذف فیلترها
                    </Button>
                    <Button onClick={handleSearch} type="primary" style={{ minWidth: 130, backgroundColor: "#007041" }}>
                      جستجو
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <div>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex border-none text-[12px] items-center gap-1 bg-gray-100 hover:bg-gray-200"
              >
                تغییر ستون
              </Button>
            </div>

            {showColumnSelector && (
              <div className="absolute right-0 mt-2 w-52 bg-white border shadow-lg rounded-lg z-50 p-2">
                {columns.map((col) => (
                  <div
                    key={(col.key as string) ?? String(col.title)}
                    onClick={() => toggleColumn(col.title as string)}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                  >
                    <Checkbox checked={selectedColumns.includes(col.title as string)} className="checkbox-green" />
                    <span className="text-sm">{col.title as string}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button icon={<RedoOutlined />} onClick={handleRefresh} loading={loading} className="flex items-center gap-1 text-[11px] border-none">
              بروزرسانی
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()} className="flex items-center gap-1 text-[11px] border-none">
              پرینت
            </Button>
            <span className="flex items-center gap-1 text-[11px] border-none">
              تعداد کل: {toPersianDigits(totalItems)}
            </span>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={filteredColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
          rowKey="key"
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="داده‌ای موجود نیست" />,
          }}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg print:hidden">
          <div className="text-sm">صفحه {toPersianDigits(currentPage)} از {toPersianDigits(pageCount)}</div>
          <Pagination
            current={currentPage}
            total={pageCount * pageSize}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </div>

      {currentKnowledgeContent && (
        <ModalReusabale
          open={viewModalOpen}
          onClose={handleViewModalClose}
          title={currentKnowledgeContent.title}
          author={currentKnowledgeContent.user.fullName || "نامشخص"}
          goalTitle={currentKnowledgeContent.goalTitle}
          abstract={currentKnowledgeContent.abstract}
          createdDate={currentKnowledgeContent.createdDate}

          content={currentKnowledgeContent.text}
          type={currentKnowledgeContent.knowledgeContentType}
          tags={toStringTags(currentKnowledgeContent.tags)}
          knowledgeContentId={currentKnowledgeContent.id}
          commentCount={currentKnowledgeContent.commentCount}
          likeCount={currentKnowledgeContent.likeCount}
          attachments={currentKnowledgeContent.attachments ?? []}
          onCommentSubmit={() => {
            toast.success("نظر شما ثبت شد");
            handleViewModalClose();
          }}
        />
      )}
      <Toaster position="bottom-right" />
    </>
  );
};

export default KnowledgeContenAdmin;
