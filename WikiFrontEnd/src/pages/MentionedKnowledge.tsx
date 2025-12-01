import {
  Card,
  Modal,
  Typography,
  Space,
  Pagination,
  Spin,
  type PaginationProps,
} from "antd";
import { useEffect, useState } from "react";
import CommentIcon from "../svgs/CommentIcon";
import LikeIcon from "../svgs/LikeIcon";
import StarIcon from "../svgs/StarIcon";
import UserIcon from "../svgs/UserIcon";
import PrintIcon from "../svgs/PrintIcon";
import { useNavigate } from "react-router-dom";
import ArticleCard from "../components/common/ArticleCard";
import type { Articles } from "../types/Interfaces";
import { toPersianDigits } from "../utils/persianNu";
const { Paragraph, Text, Title } = Typography;
import fa_IR from "antd/lib/locale/fa_IR";
import { ConfigProvider } from "antd";
import {
  MentionedKnowledgeContent,
  likeKnowledgeContent,
  unlikeKnowledgeContent,
} from "../services/auth";
import { baseUrlForDownload } from "../configs/api";
import NotFoundPage from "../components/module/NotFoundPage";
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import gregorianToJalali from "../helpers/createDate";
import IconPdf from "../svgs/IconPdf";
const MentionedKnowledge = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Articles | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articles, setArticles] = useState<Articles[]>([]);
  const [pageSize, setPageSize] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  const navigate = useNavigate();
  const [pageCount, setPageCount] = useState<number>(1);

  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  const searchResults = useSelector((state: RootState) => state.search.results);

  // اگر نتایج سرچ وجود داره از اون استفاده کن، در غیر اینصورت آرایه اصلی articles
  const dataToShow =
    searchResults && searchResults.length > 0 ? searchResults : articles;

  useEffect(() => {
    const getDataqusation = async () => {
      try {
        setLoading(true);
        const response = await MentionedKnowledgeContent();
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setArticles(response.data);
          setPageCount(response.pagingInfo?.pageCount || 1);
          setTotalQuestions(
            response.pagingInfo?.totalItems ||
            response.pagingInfo?.totalCount ||
            0
          );

          setError(false);
        } else {
          setError(true);
          setArticles([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    getDataqusation();
  }, []);

  useEffect(() => {
    setArticles(dataToShow);
    setCurrentPage(1);
  }, [dataToShow]);

  const onLikeClick = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await likeKnowledgeContent(id, userId, cleanToken);
      if (result.success) {
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.id === id
              ? {
                ...article,
                isLiked: true,
                likeCount: (article.likeCount || 0) + 1,
              }
              : article
          )
        );
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
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.id === id
              ? {
                ...article,
                isLiked: false,
                likeCount: Math.max((article.likeCount || 1) - 1, 0),
              }
              : article
          )
        );
      }
    } catch (error) {
      console.error("Error in unlike:", error);
    } finally {
      setLoadingLike(null);
    }
  };

  // محاسبه داده‌های صفحه جاری
  const currentData = articles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpen = (item: Articles) => {
    setSelectedArticle(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedArticle(null);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || articles.length === 0) {
    return <NotFoundPage />;
  }

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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Space>
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
              </Space>
              <p className="text-[#000000A6] text-[14px]" style={{ margin: 0 }}>
                {gregorianToJalali(item.createdDate)}
              </p>
            </div>

            {/* Title */}
            <Title
              className="font-yekan"
              level={5}
              style={{ color: "#007041" }}
            >
              {item.title}
            </Title>

            {/* Category + Structure */}
            <div
              className={`${item.abstract ? "mb-[0.2rem]" : ""}`}
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
                  {item.goalTitle}
                </Text>
              </Space>

              {item.knowledgeContentType === "Structured" ? (
                <Space className="flex items-center gap-1">
                  <StarIcon size={10.49} color="#000000A6" />
                  <Text
                    className="font-yekan"
                    style={{ fontSize: 11, color: "#000000A6" }}
                  >
                    ساختار یافته
                  </Text>
                </Space>
              ) : item.knowledgeContentType === "Official" ? (
                <Space className="flex items-center gap-1">
                  <IconPdf size={10.49} color="#000000A6" />
                  <Text
                    className="font-yekan"
                    style={{ fontSize: 11, color: "#000000A6" }}
                  >
             درس آموخته
                  </Text>
                </Space>
              ) : item.knowledgeContentType === "NonStructured" ? (
                <Space className="flex items-center gap-1">
                  <StarIcon size={10.49} color="#000000A6" />
                  <Text
                    className="font-yekan"
                    style={{ fontSize: 11, color: "#000000A6" }}
                  >
                    غیر ساختاریافته
                  </Text>
                </Space>
              ) : null}
            </div>

            {/* Summary */}
            {item.abstract && (
              <div
                style={{
                  background: "#F7F7F8",
                  borderRadius: 8,
                  display: "flex",
                  padding: "1rem",
                }}
              >
                <Text style={{ fontSize: 12.25, color: "#333", marginLeft: 8 }}>
                  چکیده :
                </Text>
                <Paragraph
                  style={{ fontSize: 12.25, color: "#333", marginBottom: 0 }}
                >
                  {item.abstract}
                </Paragraph>
              </div>
            )}

            {/* Short Content */}
            <div style={{ marginTop: 10 }}>
              <Paragraph
                className="font-yekan font-semibold"
                ellipsis={{ rows: 3, expandable: false }}
                style={{
                  fontSize: 14,
                  width: "56%",
                  color: "#333",
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
                {item.text}
              </Paragraph>
            </div>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/print/${item.id}`);
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
          <ArticleCard item={selectedArticle} showActions={false} />
        )}
      </Modal>
    </div>
  );
};

export default MentionedKnowledge;
