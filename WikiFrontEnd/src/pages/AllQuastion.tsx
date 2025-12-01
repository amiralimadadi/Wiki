import {
  Card,
  Modal,
  Typography,
  Space,
  Pagination,
  type PaginationProps,
  Spin,
} from "antd";
import  {
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CommentIcon from "../svgs/CommentIcon";
import LikeIcon from "../svgs/LikeIcon";
import UserIcon from "../svgs/UserIcon";
import type { Question } from "../types/Interfaces";
import { toPersianDigits } from "../utils/persianNu";
const { Paragraph, Text } = Typography;
import fa_IR from "antd/lib/locale/fa_IR";
import gregorianToJalali from "../helpers/createDate";
import { ConfigProvider } from "antd";
import {
  getAllQuestions,
  likeQuestion,
  unlikeQuestion,
} from "../services/auth";
import { baseUrlForDownload } from "../configs/api";
import ArticleCardQuastion from "../components/common/ArticleCardQuastion";
import NotFoundPage from "../components/module/NotFoundPage";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import IconPdf from "../svgs/IconPdf";

interface Mention {
  userId: number;
  fullName: string;
}

const AllQuastion = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Question | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const [articles, setArticles] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  const [pageCount, setPageCount] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // goalId فعلی
  const [currentGoalId, setCurrentGoalId] = useState<number | undefined>(
    undefined
  );

  const location = useLocation();
  const navigate = useNavigate();

  // نتایج سرچ از ریداکس
  const searchResults = useSelector((state: RootState) => state.search.results);

  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // ---------- تابع اصلی گرفتن سوالات از سرور ----------
  const fetchQuestions = useCallback(
    async (
      pageNo: number = 1,
      pageSizeParam: number = 6,
      goalId?: number,
      searchText: string = ""
    ) => {
      try {
        setLoading(true);
        setError(false);

        // ⚠️ این امضا باید در سرویس پیاده شده باشد:
        // getAllQuestions(pageNo, pageSize, goalId?, searchText?)
        const response = await getAllQuestions(
          pageNo,
          pageSizeParam,
          goalId,
          searchText
        );

        const list: Question[] = response?.data || [];
        const paging = response?.pagingInfo;

        setArticles(list);

        if (paging) {
          setTotalQuestions(paging.totalCount || 0);
          setPageCount(paging.pageCount || 1);
        } else {
          setTotalQuestions(list.length);
          setPageCount(1);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setArticles([]);
        setTotalQuestions(0);
        setPageCount(1);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ---------- هم‌خوان کردن state با URL (goalId + searchText) ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const goalIdParam = params.get("goalId");
    const searchText = params.get("searchText") || "";

    if (goalIdParam) {
      setCurrentGoalId(Number(goalIdParam));
    } else {
      setCurrentGoalId(undefined);
    }

    // اگر searchText خالی است → برگرد به حالت goalId
    if (searchText.trim() === "") {
      fetchQuestions(1, pageSize, goalIdParam ? Number(goalIdParam) : undefined);
      setCurrentPage(1);
    }
  }, [location.search, fetchQuestions, pageSize]);

  // ---------- لیسنر برای درخت هدف‌ها (goal tree) ----------
  useEffect(() => {
    const onFilterByGoal = (e: Event) => {
      const ce = e as CustomEvent<{ goalId?: number }>;
      const goalId = ce.detail?.goalId;

      setCurrentGoalId(goalId);

      const params = new URLSearchParams(location.search);
      if (goalId != null) {
        params.set("goalId", String(goalId));
      } else {
        params.delete("goalId");
      }
      // وقتی goalId عوض می‌شود، سرچ را پاک کن
      params.delete("searchText");

      navigate(`/questions?${params.toString()}`, { replace: true });
      setCurrentPage(1);
    };

    window.addEventListener("questions:filter-by-goal", onFilterByGoal);
    return () =>
      window.removeEventListener("questions:filter-by-goal", onFilterByGoal);
  }, [location.search, navigate]);

  // ---------- وقتی صفحه/سایز/goalId عوض می‌شود (در حالتی که searchText خالی است) ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchText = params.get("searchText") || "";

    // اگر در حالت سرچ هستیم، این افکت کاری نکند
    if (searchText.trim() !== "") return;

    fetchQuestions(currentPage, pageSize, currentGoalId);
  }, [currentPage, pageSize, currentGoalId, fetchQuestions, location.search]);

  // ---------- وقتی نتایج سرچ از ریداکس می‌آید ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchText = params.get("searchText") || "";

    if (searchText.trim() === "") {
      // در این حالت، کنترل با افکت‌های بالاست
      return;
    }

    // اگر سرچ فعال است:
    if (searchResults && searchResults.length > 0) {
      setArticles(searchResults as Question[]);
      setTotalQuestions(searchResults.length);
      setPageCount(1);
      setCurrentPage(1);
      setError(false);
    } else {
      // سرچ فعال است ولی نتیجه‌ای نیست
      setArticles([]);
      setTotalQuestions(0);
      setPageCount(1);
      setError(false);
    }
  }, [searchResults, location.search]);

  // ---------- لایک ----------
  const onLikeClick = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      // Optimistic UI
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id
            ? {
                ...article,
                isLiked: true,
                likeCount: (article.likeCount || 0) + 1,
              }
            : article
        )
      );

      const result = await likeQuestion(id, userId, cleanToken);
      if (!result.success) {
        // rollback
        setArticles((prev) =>
          prev.map((article) =>
            article.id === id
              ? {
                  ...article,
                  isLiked: false,
                  likeCount: Math.max((article.likeCount || 1) - 1, 0),
                }
              : article
          )
        );
        alert("خطا در ثبت لایک");
      }
    } catch (err) {
      console.error("Error in like:", err);
      // rollback
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id
            ? {
                ...article,
                isLiked: false,
                likeCount: Math.max((article.likeCount || 1) - 1, 0),
              }
            : article
        )
      );
      alert("خطا در ثبت لایک");
    } finally {
      setLoadingLike(null);
    }
  };

  // ---------- آن‌لایک ----------
  const unlikeHandeler = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      // optimistic
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id
            ? {
                ...article,
                isLiked: false,
                likeCount: Math.max((article.likeCount || 1) - 1, 0),
              }
            : article
        )
      );

      const result = await unlikeQuestion(id, userId, cleanToken);

      if (!result.success) {
        // rollback
        setArticles((prev) =>
          prev.map((article) =>
            article.id === id
              ? {
                  ...article,
                  isLiked: true,
                  likeCount: (article.likeCount || 0) + 1,
                }
              : article
          )
        );
        alert("خطا در ثبت آنلایک");
      }
    } catch (err) {
      console.error("Error in unlike:", err);
      // rollback
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id
            ? {
                ...article,
                isLiked: true,
                likeCount: (article.likeCount || 0) + 1,
              }
            : article
        )
      );
      alert("خطا در ثبت آنلایک");
    } finally {
      setLoadingLike(null);
    }
  };

  const handleOpen = (item: Question) => {
    setSelectedArticle(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedArticle(null);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            color: current === currentPage ? "#000" : "#000",
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

  // ---------- نمایش‌ها ----------

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

  if (error || articles.length === 0) {
    return <NotFoundPage />;
  }

  const currentData = articles;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginTop: "1rem",
      }}
    >
      {/* لیست مقالات */}
      <Space
        direction="vertical"
        size={15}
        style={{ width: "100%", borderRadius: 8 }}
      >
        {currentData.map((item) => (
          <Card
            className="border-[1px] hover:border-green-600 w-full md:max-w-none max-w-[95%]"
            key={item.id}
            hoverable
            onClick={() => handleOpen(item)}
            style={{
              width: "100%",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
            {/* Header */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1 justify-between w-full">
                <div className="flex items-center gap-1">
                  <UserIcon size={12.24} color="#000000A6" />
                  <Text
                    className="font-yekan"
                    style={{
                      fontSize: 12.25,
                      color: "#000000A6",
                      fontWeight: 600,
                    }}
                  >
                    {item.user.fullName}
                  </Text>
                </div>
              </div>
              <div>
                <p
                  className="text-[#000000A6] text-[14px]"
                  style={{ margin: 0 }}
                >
                  {gregorianToJalali(item.createdDate)}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Paragraph
                className="font-yekan font-semibold"
                ellipsis={{ rows: 3, expandable: false }}
                style={{
                  fontSize: 17.5,
                  width: "99%",
                  color: "#007041",
                  marginBottom: 0,
                  lineHeight: "1.6em",
                  maxHeight: "7.8em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.questionTitle}
              </Paragraph>
            </div>

            <div
              className="mt-2"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Space>
                <Text
                  className="font-yekan"
                  style={{ fontSize: 13, color: "#000000A6" }}
                >
                  دسته بندی:
                </Text>
                <Text
                  className="font-yekan"
                  style={{ fontSize: 13, color: "#000000A6" }}
                >
                  {item.goalTile}
                </Text>
              </Space>
            </div>

            <div style={{ marginTop: 10 }}>
              <Paragraph
                className="font-yekan font-semibold"
                ellipsis={{ rows: 3, expandable: false }}
                style={{
                  fontSize: 14,
                  width: "784px",
                  color: "#333333",
                  marginBottom: 0,
                  lineHeight: "2.6em",
                  maxHeight: "7.8em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.questionText}
              </Paragraph>
            </div>

            {item.mentions && item.mentions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {item.mentions.map((mentions: Mention) => (
                  <div
                    key={mentions.userId}
                    className="flex items-center gap-1 bg-gray-100 px-2 py-[2px] rounded-lg border border-gray-300"
                  >
                    <p className="text-[12px] text-[#007041] font-bold">@</p>
                    <p className="text-[12px] text-[#333] font-semibold">
                      {mentions?.fullName}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {item.attachments.map((atta) =>
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
            )}


            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                className="font-yekan"
                style={{ fontSize: 10.5, color: "#333", marginTop: 8 }}
              >
                <div className="flex items-center gap-1">
                  {item.tags.map((items, index) => (
                    <p key={index} className="flex">
                      #{items.tagTitle}
                    </p>
                  ))}
                </div>
              </Text>
              <Space>
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
                    {item.answerCount
                      ? toPersianDigits(item.answerCount)
                      : toPersianDigits("0")}
                  </Text>
                </Space>
                {item.isLiked ? (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      unlikeHandeler(item.id);
                    }}
                    className={`bg-[#00693D] p-1 rounded-lg text-white ${loadingLike === item.id ? "opacity-50" : ""
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
                    className={`bg-[#F0F0F0] p-1 rounded-lg ${loadingLike === item.id ? "opacity-50" : ""
                      }`}
                  >
                    {loadingLike === item.id ? (
                      <Spin size="small" />
                    ) : (
                      <LikeIcon size={12.24} color="#000000A6" />
                    )}
                    <Text className="font-yekan text-[#000000A6]">
                      {toPersianDigits(item.likeCount ? item.likeCount : "0")}
                    </Text>
                  </Space>
                )}
              </Space>
            </div>
          </Card>
        ))}
      </Space>
      {/* پاگینیشن فارسی‌شده */}
      {pageCount > 1 && (
        <div
          className="bg-white p-4 rounded-xl flex"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            direction: "rtl",
            width: "100%",
          }}
        >
          <ConfigProvider direction="rtl" locale={fa_IR}>
            <Pagination
              className="w-full flex font-yekan justify-end"
              current={currentPage}
              total={totalQuestions}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger
              onShowSizeChange={(_current, size) => handlePageChange(1, size)}
              pageSizeOptions={["6", "12", "24", "50"]}
              showTotal={(total, _range) => {
                const totalPages = Math.ceil(total / pageSize);
                return `صفحه ${toPersianDigits(
                  currentPage
                )} از ${toPersianDigits(totalPages)}`;
              }}
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

      {/* مودال */}
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
          <ArticleCardQuastion item={selectedArticle} showActions={false} />
        )}
      </Modal>
    </div>
  );
};

export default AllQuastion;
