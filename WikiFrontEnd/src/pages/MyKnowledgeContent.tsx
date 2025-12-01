import {
  Card,
  Modal,
  Typography,
  Space,
  Pagination,
  type PaginationProps,
} from "antd";
import { useState } from "react";
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
import NotFoundPage from "../components/module/NotFoundPage";
import IconPdf from "../svgs/IconPdf";
import CustomIcon from "../svgs/CustomIcon";
const MyKnowledgeContent: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Articles | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [articles /*setArticles*/] = useState<Articles[]>([]);

  // @ts-expect-error tsx

  const [loading, setLoading] = useState<boolean>(true);
  // @ts-expect-error tsx

  const [error, setError] = useState<boolean>(false);

  const navigate = useNavigate();
  // @ts-expect-error tsx

  const [likes, setLikes] = useState<{
    [id: number]: { count: number; liked: boolean };
  }>(() =>
    Object.fromEntries(
      // @ts-expect-error tsx
      articles.map((a) => [a.id, { count: a.likes || 1, liked: false }])
    )
  );

  console.log(articles);

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

  return (
    <>
      {articles.length === 0 ? (
        <NotFoundPage />
      ) : (
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
                className="border-[1px] hover:border-gray-600 w-full md:max-w-none max-w-[95%]"
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
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
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
                  <Text
                    className="font-yekan"
                    style={{ fontSize: 12.25, color: "#000000A6" }}
                  >
                    {/* {toPersianDigits(item.date)} */}
                  </Text>
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
                    <Text
                      style={{ fontSize: 12.25, color: "#333", marginLeft: 8 }}
                    >
                      چکیده :
                    </Text>
                    <Paragraph
                      style={{
                        fontSize: 12.25,
                        color: "#333",
                        marginBottom: 0,
                      }}
                    >
                      {item.abstract}
                    </Paragraph>
                  </div>
                )}

                {/* Short Content */}
                <div style={{ marginTop: 10 }}>
                  <Text
                    className="font-yekan font-semibold"
                    style={{ fontSize: 14, color: "#333" }}
                  >
                    {item.goalTitle}:
                  </Text>
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
      {/* Attachments */}
            {item?.attachments?.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 text-[#000000A6] max-w-full">
                {item.attachments.map(
                  (atta, index) =>
                    atta?.address && (
                      <a
                        key={atta.id || index}
                        href={atta.address}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between bg-[#F7F7F8] px-4 py-2 rounded-full text-[13px] font-yekan border border-[#e0e0e0] max-w-[400px] hover:bg-gray-100 transition no-underline focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-none text-inherit`}
                        style={{
                          outline: "none",
                          boxShadow: "none",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span className="flex items-center gap-1 text-[14px] font-bold">
                          <CustomIcon size={20.29} className="text-[#666]" />
                          فایل پیوست
                        </span>
                        <span className="truncate max-w-[300px] text-right text-[14px] font-bold">
                          {atta.name || "دانلود فایل"}
                        </span>
                      </a>
                    )
                )}
              </div>
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
                      {item.tags.map((items) => (
                        <p className="flex">#{items.tagTitle}</p>
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
                    <Space
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={` ${
                        item.isLiked
                          ? "bg-[#00693D] p-1 rounded-lg text-white"
                          : "bg-[#F0F0F0] p-1 rounded-lg"
                      }`}
                    >
                      <LikeIcon
                        size={12.24}
                        color={item.isLiked ? "#ffff" : "#000000A6"}
                      />
                      <Text
                        className={`font-yekan ${
                          item.isLiked ? "text-white" : "text-[#000000A6]"
                        }`}
                      >
                        {item.likeCount
                          ? toPersianDigits(item.likeCount)
                          : toPersianDigits("0")}
                      </Text>
                    </Space>
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
          {/* پاگینیشن فارسی‌شده */}
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
                total={articles.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={true}
                onShowSizeChange={(_current, size) => handlePageChange(1, size)}
                pageSizeOptions={["6", "12", "24", "50"]}
                showTotal={(total, range) => (
                  <span
                    className="font-yekan text-center"
                    style={{ marginLeft: "8px", fontFamily: "BYekan" }}
                  >
                    {`صفحه ${toPersianDigits(range[0])}${toPersianDigits(
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
      )}
    </>
  );
};

export default MyKnowledgeContent;
