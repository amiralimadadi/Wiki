import {
  Card,
  Modal,
  Typography,
  Space,
  Pagination,
  Spin,
  type PaginationProps,
  ConfigProvider,
} from "antd";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ViewIcon from "../svgs/ViewIcon";

import CommentIcon from "../svgs/CommentIcon";
import LikeIcon from "../svgs/LikeIcon";
import PrintIcon from "../svgs/PrintIcon";
import ArrowsIcon from "../svgs/ArrowsIcon";

import ArticleCard from "../components/common/ArticleCard";
import NotFoundPage from "../components/module/NotFoundPage";

import fa_IR from "antd/lib/locale/fa_IR";
import {
  likeKnowledgeContent,
  unlikeKnowledgeContent,
  searchKnowledgeContents,
  addVisitPageView,
} from "../services/auth";

import { toPersianDigits } from "../utils/persianNu";
import StructuredForm from "../forms/StructuredForm";

import type { Articles } from "../types/Interfaces";
import type { RootState } from "../redux/store";

interface AllKnowledgeProps {
  articles?: Articles[]; // اختیاری، که هم از بالا بشود داد، هم خودش fetch کند
}


const { Paragraph, Text, Title } = Typography;

const AllKnowledge: React.FC<AllKnowledgeProps> = ({ articles }) => {

  const [open, setOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Articles | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [loading, setLoading] = useState(true);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);

  const [localArticles, setLocalArticles] = useState<Articles[]>([]);
  const [pageCount, setPageCount] = useState<number>(1);
  const [, setTotalCount] = useState(0);

  const [isStructuredModalOpen, setIsStructuredModalOpen] =
    useState<boolean>(false);

  // goalId انتخاب‌شده از درخت دانش
  const [currentGoalId, setCurrentGoalId] = useState<number | undefined>(
    undefined
  );

  const location = useLocation();
  const navigate = useNavigate();
  const pageTopRef = useRef<HTMLDivElement>(null);

  // کاربر و توکن
  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // سرچ نتایج از ریداکس
  const searchResults = useSelector((state: RootState) => state.search.results);

  // مقدار سرچ از URL (مثلاً ?searchText=...)
  const searchParams = new URLSearchParams(location.search);
  const searchTextFromUrl = searchParams.get("searchText") || "";

  const isSearchMode =
    searchResults &&
    searchResults.length > 0 &&
    searchTextFromUrl.trim() !== "";

  // ------------------ API ------------------

  const fetchData = useCallback(
    async (pageNo: number = 1, pageSizeParam: number = 9, goalId?: number) => {
      try {
        setLoading(true);

        const response = await searchKnowledgeContents(
          "",
          pageNo,
          pageSizeParam,
          goalId
        );

        const articlesData = response?.data || [];
        const paging = response?.pagingInfo || null;

        setLocalArticles(articlesData);

        if (paging) {
          setPageCount(paging.pageCount);
          setTotalCount(paging.allEntitiesCount);
        } else {
          setPageCount(1);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLocalArticles([]);
        setPageCount(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // وقتی سرچ از URL خالی می‌شود، همیشه از صفحه ۱ شروع کن
  useEffect(() => {
    if (searchTextFromUrl.trim() === "") {
      setCurrentPage(1);
    }
  }, [searchTextFromUrl]);

  // وقتی در حالت سرچ هستیم، لودینگ را قطع کن
  useEffect(() => {
    if (isSearchMode) {
      setLoading(false);
    }
  }, [isSearchMode]);

  // افکت اصلی برای گرفتن دیتا (فقط وقتی سرچ فعال نیست)
  useEffect(() => {
    if (isSearchMode) return; // وقتی نتایج سرچ داریم، از API دیتا نمی‌گیریم

    fetchData(currentPage, pageSize, currentGoalId);
  }, [currentPage, pageSize, currentGoalId, isSearchMode, fetchData]);

  // تغییر goalId از درخت دانش
  useEffect(() => {
    const onFilterByGoal = (e: Event) => {
      const ce = e as CustomEvent<{ goalId?: number }>;
      const goalId = ce.detail?.goalId;

      setCurrentGoalId(goalId);
      setCurrentPage(1);
    };

    window.addEventListener("knowledge:filter-by-goal", onFilterByGoal);
    return () =>
      window.removeEventListener("knowledge:filter-by-goal", onFilterByGoal);
  }, []);

  // وقتی رکوردی آپدیت می‌شود
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ id?: number }>;
      const id = ce.detail?.id;
      if (!id) return;

      if (!isSearchMode) {
        fetchData(currentPage, pageSize, currentGoalId);
      }
    };

    window.addEventListener("knowledge:updated", onUpdated);
    return () => window.removeEventListener("knowledge:updated", onUpdated);
  }, [fetchData, currentPage, pageSize, currentGoalId, isSearchMode]);

  // وقتی رکورد جدید ساخته می‌شود
  useEffect(() => {
    const onCreated = () => {
      setCurrentPage(1);
      if (!isSearchMode) {
        fetchData(1, pageSize, currentGoalId);
      }
    };

    window.addEventListener("knowledge:created", onCreated);
    return () => window.removeEventListener("knowledge:created", onCreated);
  }, [fetchData, pageSize, currentGoalId, isSearchMode]);

  // ------------------ هندل لایک ------------------

  const onLikeClick = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await likeKnowledgeContent(id, userId, cleanToken);
      if (result.success) {
        const updater = (article: Articles) =>
          article.id === id
            ? {
              ...article,
              isLiked: true,
              likeCount: (article.likeCount || 0) + 1,
            }
            : article;

        setLocalArticles((prev) => prev.map(updater));
      }
    } catch (error) {
      console.error("Error in like:", error);
    } finally {
      setLoadingLike(null);
    }
  };

  const unlikeHandeler = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await unlikeKnowledgeContent(id, userId, cleanToken);
      if (result.success) {
        const updater = (article: Articles) =>
          article.id === id
            ? {
              ...article,
              isLiked: false,
              likeCount: Math.max((article.likeCount || 1) - 1, 0),
            }
            : article;

        setLocalArticles((prev) => prev.map(updater));
      }
    } catch (error) {
      console.error("Error in unlike:", error);
    } finally {
      setLoadingLike(null);
    }
  };

  // ------------------ مودال‌ها ------------------

  const handleOpen = async (item: Articles) => {
    setSelectedArticle(item);
    setOpen(true);

    if (!userId || !cleanToken) return;

    try {
      const result = await addVisitPageView(item.id, userId, 2, cleanToken);

      if (result.success) {
        setLocalArticles((prev) =>
          prev.map((article) =>
            article.id === item.id
              ? {
                ...article,
                pageViewCount: (article.pageViewCount ?? 0) + 1,
              }
              : article
          )
        );

        setSelectedArticle((prev) =>
          prev && prev.id === item.id
            ? {
              ...prev,
              pageViewCount: (prev.pageViewCount ?? 0) + 1,
            }
            : prev
        );
      }
    } catch (error) {
      console.error("خطا در ثبت بازدید:", error);
    }
  };



  const handleClose = () => {
    setOpen(false);
    setSelectedArticle(null);
    setIsStructuredModalOpen(false);
  };

  const handleOpenStructuredForm = (item: Articles) => {
    setSelectedArticle(item);
    setIsStructuredModalOpen(true);
  };

  const handleCloseStructuredForm = () => {
    setIsStructuredModalOpen(false);
    //setSelectedArticle(null);
  };

  // ------------------ Pagination ------------------

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }

    // اسکرول به بالای لیست (فقط یک بار)
    pageTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const itemRender: PaginationProps["itemRender"] = (
    current,
    type,
    originalElement
  ) => {
    if (type === "page") {
      return (
        <a
          style={{
            margin: "0 4px",
            padding: "0 8px",
            height: "32px",
            lineHeight: "32px",
            minWidth: "32px",
            borderRadius: "4px",
            display: "inline-block",
            textAlign: "center",
            color: "#000",
          }}
        >
          {toPersianDigits(current)}
        </a>
      );
    }
    if (type === "prev") {
      return (
        <a
          className="font-yekan"
          style={{
            margin: "0 4px",
            padding: "0 8px",
            height: "32px",
            lineHeight: "32px",
            minWidth: "32px",
            borderRadius: "4px",
            display: "inline-block",
            textAlign: "center",
            border: "1px solid #d9d9d9",
          }}
        >
          قبلی
        </a>
      );
    }
    if (type === "next") {
      return (
        <a
          className="font-yekan"
          style={{
            margin: "0 4px",
            padding: "0 8px",
            height: "32px",
            lineHeight: "32px",
            minWidth: "32px",
            borderRadius: "4px",
            display: "inline-block",
            textAlign: "center",
            border: "1px solid #d9d9d9",
          }}
        >
          بعدی
        </a>
      );
    }
    if (type === "jump-prev" || type === "jump-next") {
      return <span style={{ margin: "0 4px" }}>...</span>;
    }
    return originalElement;
  };

  // لیست واقعی که نمایش داده می‌شود:
  const currentData = isSearchMode ? searchResults : localArticles;

  // ------------------ رندر ------------------

  if (loading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ height: "100vh" }}
      >
        <Spin />
      </div>
    );
  }

  if (!currentData || currentData.length === 0) {
    return <NotFoundPage />;
  }


  return (
    <div
      ref={pageTopRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginTop: "1rem",
      }}
    >
      {/* لیست مقالات */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          width: "100%",
        }}
      >
        {currentData.map((item) => (
          <Card
            className="border-[1px] cursor-pointer hover:border-green-600 w-full md:max-w-none max-w-[95%]"
            key={item.id}
            onClick={() => handleOpen(item)}
            style={{
              width: "100%",
              fontFamily: "BYekan",
            }}
            bodyStyle={{
              padding: 6,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontFamily: "BYekan",
            }}
          >
            {/* Title */}
            <Title
              className="font-yekan"
              level={5}
              style={{ color: "#007041" }}
            >
              {item.title}
            </Title>

            {/* Summary */}
            {item.abstract && (
              <div
                className="flex flex-col gap-1"
                style={{
                  background: "#F7F7F8",
                  borderRadius: 8,
                  display: "flex",
                  padding: "1rem",
                }}
              >
                <Text
                  className="font-yekan"
                  style={{ fontSize: 12.25, color: "#333" }}
                >
                  چکیده:
                </Text>
                <Paragraph style={{ fontSize: 12.25, color: "#333" }}>
                  {item.abstract}
                </Paragraph>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                 display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "0.75rem",
    direction: "ltr",
              }}
            >
              <Space size={8}>
                                <Space
                  className="bg-[#F0F0F0] font-yekan"
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    cursor: "default",
                  }}
                >
                  <ViewIcon size={12.24} color="#000000A6" />
                  <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
                    {toPersianDigits(item.pageViewCount ?? 0)}
                  </Text>
                </Space>
           

                <Space
                  className="font-yekan"
                  style={{
                    background: "#F0F0F0",
                    padding: "4px 8px",
                    borderRadius: 8,
                  }}
                >
                  <CommentIcon size={12.24} color="#000000A6" />
                  <Text
                    className="font-yekan"
                    style={{ fontSize: 13, color: "#000000A6" }}
                  >
                    {item.commentCount
                      ? toPersianDigits(item.commentCount)
                      : toPersianDigits("0")}
                  </Text>
                </Space>
                {item.isLiked ? (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      unlikeHandeler(item.id);
                    }}
                    className={`
                      bg-[#00693D] 
                      hover:bg-[#00693D] 
                      p-1 
                      rounded-lg 
                      text-white 
                      ${loadingLike === item.id
                        ? "opacity-50 bg-[#00693D]"
                        : "hover:bg-[#00693D]"
                      }`}
                  >
                    {loadingLike === item.id ? (
                      <Spin size="small" />
                    ) : (
                      <LikeIcon size={12.24} color="#ffff" />
                    )}
                    <Text className="font-yekan text-white">
                      {toPersianDigits(item.likeCount ? item.likeCount : "0")}
                    </Text>
                  </Space>
                ) : (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikeClick(item.id);
                    }}
                    className={`bg-[#F0F0F0] p-1 rounded-lg  cursor-pointer transition group ${loadingLike === item.id ? "opacity-50" : "hover:bg-[#00693D]"
                      }`}
                  >
                    {loadingLike === item.id ? (
                      <Spin size="small" />
                    ) : (
                      <LikeIcon
                        size={12.24}
                        color="#000000A6"
                        className="group-hover:fill-white"
                      />
                    )}
                    <Text className="font-yekan text-[#000000A6] group-hover:text-white">
                      {toPersianDigits(item.likeCount ? item.likeCount : "0")}
                    </Text>
                  </Space>
                )}


     {item.knowledgeContentType?.trim().toLowerCase() ===
                  "nonstructured" ? (
                  <Space
                    className="bg-[#fbfbfb] hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStructuredForm(item);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <ArrowsIcon size={12.24} color="#000000A6" />
                    <Text
                      className="font-yekan"
                      style={{ fontSize: 13, color: "#000000A6" }}
                    >
                      تبدیل
                    </Text>
                  </Space>
                ) : (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/knowledgeContentPrint/${item.id}`);
                    }}
                    style={{
                      background: "#F0F0F0",
                      padding: "4px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <PrintIcon size={12.24} color="#000000A6" />
                    <Text
                      className="font-yekan"
                      style={{ fontSize: 13, color: "#000000A6" }}
                    >
                      پرینت
                    </Text>
                  </Space>
                )}
              </Space>
            </div>
          </Card>
        ))}
      </div>

      {/* پاگینیشن (فقط وقتی در حالت سرچ نیستیم منطقیه – ولی اینجا نگه‌داشتیم) */}
      {!isSearchMode && (
        <div
          className="bg-white font-yekan p-4 rounded-xl flex"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            direction: "rtl",
            width: "100%",
          }}
        >
          <ConfigProvider direction="rtl" locale={fa_IR}>
            <Pagination
              className="w-full ant-pagination flex font-yekan justify-end"
              current={currentPage}
              total={pageCount * pageSize}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={true}
              onShowSizeChange={(_current, size) =>
                handlePageChange(1, size)
              }
              pageSizeOptions={["6", "12", "24", "50"]}
              showTotal={(total, range) => (
                <span
                  className="font-yekan ant-pagination text-center"
                  style={{ marginLeft: "8px", fontFamily: "BYekan" }}
                >
                  {`صفحه ${toPersianDigits(range[0])}-${toPersianDigits(
                    range[1]
                  )} از ${toPersianDigits(total)}`}
                </span>
              )}
              itemRender={itemRender}
              style={{
                fontFamily: "BYekan",
                display: "flex",
                alignItems: "center",
              }}
              locale={{
                items_per_page: "/ صفحه",
              }}
            />
          </ConfigProvider>
        </div>
      )}

      {/* مودال نمایش مقاله */}
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        closable={true}
        centered
        width="auto"
        bodyStyle={{
          padding: 0,
          background: "transparent",
          boxShadow: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        style={{
          background: "transparent",
          boxShadow: "none",
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        {selectedArticle && (
          <ArticleCard
            item={selectedArticle}
            showActions={false}
            onOpenStructuredForm={(article) => {
              setSelectedArticle(article);
              setIsStructuredModalOpen(true);
            }}
          />
        )}
      </Modal>

      {/* مودال StructuredForm */}
      <Modal
        open={isStructuredModalOpen}
        onCancel={handleCloseStructuredForm}
        footer={null}
        width={768}
        centered
        destroyOnClose
      >
        {selectedArticle && (
          <StructuredForm
            onClose={handleCloseStructuredForm}
            text={selectedArticle.text}
            tags={selectedArticle.tags}
            title={selectedArticle.title}
            knowledgeContentId={selectedArticle.id}
            token={cleanToken || ""}
            existingMentions={(selectedArticle.mentions || []).map((m) => ({
              userId: m.userId,
              fullName: m.fullName,
            }))}
          />
        )}
      </Modal>
    </div>
  );
};
export default AllKnowledge;