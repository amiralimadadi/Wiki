import {
  Card,
  Typography,
  Space,
  Pagination,
  type PaginationProps,
  ConfigProvider,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import fa_IR from "antd/lib/locale/fa_IR";
import { baseUrlForDownload } from "../configs/api";
import NotFoundPage from "../components/module/NotFoundPage";
import { toPersianDigits } from "../utils/persianNu";
import UserIcon from "../svgs/UserIcon";
import StarIcon from "../svgs/StarIcon";
import CommentIcon from "../svgs/CommentIcon";
import LikeIcon from "../svgs/LikeIcon";
import CheckIcon from "../svgs/CheckIcon";
import { fetchAwaitingConfirmationKnowledgeContent } from "../services/auth";
import PainPointModal from "../components/common/PainPointModal";
import ArticleCard from "../components/common/ArticleCard";
import gregorianToJalali from "../helpers/createDate";
import IconPdf from "../svgs/IconPdf";
const { Paragraph, Text, Title } = Typography;

interface Articles {
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
  isActive: boolean;
  user: {
    igtUserId: number;
    id: number;
    fullName: string;
    userName: string;
  };
  attachments: any[];
  tags: { tagTitle: string; createdUserId: string }[];
  mentions: any;
  mentionUserIds: any;
  references: string;
}

const PAGE_SIZE_OPTIONS = ["6", "12", "24", "50"];

const ExpertConfirm = () => {
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Articles | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articles, setArticles] = useState<Articles[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(6);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetchAwaitingConfirmationKnowledgeContent(
          currentPage
        );
        // @ts-expect-error tsx
        if (response.isSuccess && response.data) {
          // @ts-expect-error tsx
          setArticles(response.data);
          // @ts-expect-error tsx
          setTotalItems(response.totalCount || 100);
          setError(false);
        } else {
          setArticles([]);
          setError(true);
          setTotalItems(0);
        }
      } catch {
        setError(true);
        setArticles([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [currentPage]);

  const handleOpenDetailModal = (item: Articles) => {
    setSelectedArticle(item);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedArticle(null);
  };

  const handleOpenConfirmModal = (item: Articles, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArticle(item);
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
    setSelectedArticle(null);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // const formatDateToPersian = (dateStr: string) => {
  //   if (!dateStr) return "";
  //   const date = new Date(dateStr);
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //   const day = date.getDate().toString().padStart(2, "0");
  //   return toPersianDigits(`${year}/${month}/${day}`);
  // };

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
    return <NotFoundPage />;
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
      <Space
        direction="vertical"
        size={15}
        style={{ width: "100%", borderRadius: 8 }}
      >
        {articles.map((item) => (
          <Card
            className="border-[1px] hover:border-green-600 w-full md:max-w-none max-w-[95%]"
            key={item.id}
            hoverable
            onClick={() => handleOpenDetailModal(item)}
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Space>
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
              </Space>
              <p className="text-[#000000A6] text-[14px]" style={{ margin: 0 }}>
                {gregorianToJalali(item.createdDate)}
              </p>
            </div>

            <Title
              className="font-yekan"
              level={5}
              style={{ color: "#007041" }}
            >
              {item.title}
            </Title>

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
            {item.abstract && (
              <div
                style={{
                  background: "#F7F7F8",
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1rem",
                  gap: 8,
                  maxWidth: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: 12.25,
                    color: "#333",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  چکیده :
                </Text>
                <Paragraph
                  style={{
                    fontSize: 12.25,
                    color: "#333",
                    marginBottom: 0,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    margin: 0,
                    maxWidth: "calc(100% - 60px)",
                  }}
                  ellipsis={{ rows: 3, expandable: false }}
                >
                  {item.abstract}
                </Paragraph>
              </div>
            )}

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
                  {item.tags.map((tag) => (
                    <p key={tag.tagTitle} className="flex">
                      #{tag.tagTitle}
                    </p>
                  ))}
                </div>
              </Text>
              <Space>
                <Space
                  onClick={(e) => handleOpenConfirmModal(item, e)}
                  style={{
                    background: "#F0F0F0",
                    padding: "4px 8px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  <CheckIcon size={12.24} color="#000000A6" />
                  <Text
                    className="font-yekan"
                    style={{ fontSize: 13, color: "#000000A6" }}
                  >
                    تایید
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
                  onClick={(e) => e.stopPropagation()}
                  className={`${
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
            total={totalItems}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={true}
            onShowSizeChange={(_current, size) => handlePageChange(1, size)}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            showTotal={(total, range) => (
              <span
                className="font-yekan text-center"
                style={{ marginLeft: "8px", fontFamily: "BYekan" }}
              >
                {`صفحه ${toPersianDigits(range[0])} تا ${toPersianDigits(
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

      {/* مودال نمایش جزئیات مقاله */}
      <Modal
        open={openDetailModal}
        onCancel={handleCloseDetailModal}
        footer={null}
        closable={true}
        centered
        width="1070.99px"
        bodyStyle={{
          padding: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {selectedArticle && (
          // @ts-expect-error tsx
          <ArticleCard item={selectedArticle} showActions={false} />
        )}
      </Modal>

      {/* مودال تایید مقاله */}
      <PainPointModal
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        article={selectedArticle}
        onSuccess={(confirmedId) => {
          setArticles((prev) => prev.filter((item) => item.id !== confirmedId));
          setOpenConfirmModal(false);
          setSelectedArticle(null);
        }}
      />
    </div>
  );
};

export default ExpertConfirm;
