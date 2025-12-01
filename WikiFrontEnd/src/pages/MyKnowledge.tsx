import { Card, Modal, Typography, Space, Spin, Pagination, type PaginationProps, ConfigProvider } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import CommentIcon from "../svgs/CommentIcon";
import LikeIcon from "../svgs/LikeIcon";
import StarIcon from "../svgs/StarIcon";
import UserIcon from "../svgs/UserIcon";
import PrintIcon from "../svgs/PrintIcon";
import NoDataIcon from "../svgs/NoDataIcon";
import IconPdf from "../svgs/IconPdf";

import ArticleCard from "../components/common/ArticleCard";
import type { Articles } from "../types/Interfaces";
import type { RootState } from "../redux/store";

import { toPersianDigits } from "../utils/persianNu";
import gregorianToJalali from "../helpers/createDate";
import { baseUrlForDownload } from "../configs/api";

import {
  likeKnowledgeContent,
  MyKnowledgeContent,
  unlikeKnowledgeContent,
} from "../services/auth";

import fa_IR from "antd/lib/locale/fa_IR";

const { Paragraph, Text, Title } = Typography;

const MyKnowledge = () => {
  const [open, setOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Articles | null>(null);
  const [articles, setArticles] = useState<Articles[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(6);

  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;

  const rawToken = localStorage.getItem("sessionId");
  const cleanToken = rawToken && rawToken.startsWith("Bearer ") ? rawToken : rawToken ? `Bearer ${rawToken}` : undefined;

  const navigate = useNavigate();
  const searchResults = useSelector((state: RootState) => state.search.results);

  const dataToShow = useMemo(
    () => (searchResults && searchResults.length > 0 ? searchResults : articles),
    [searchResults, articles]
  );

  useEffect(() => {
    const getData = async () => {
      const res = await MyKnowledgeContent();
      if (res?.data) setArticles(res.data);
    };
    getData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const currentData = useMemo(
    () => dataToShow.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [dataToShow, currentPage, pageSize]
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
    if (newPageSize) setPageSize(newPageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requireAuth = () => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return false;
    }
    return true;
  };


  const onLikeClick = async (id: number) => {
    if (!requireAuth()) return;

    setLoadingLike(id);
    try {
      const result = await likeKnowledgeContent(id, userId!, cleanToken!);
      if (result?.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, isLiked: true, likeCount: (a.likeCount || 0) + 1 } : a
          )
        );
      }
    } catch (e) {
      console.error("Error in like:", e);
    } finally {
      setLoadingLike(null);
    }
  };


  const unlikeHandeler = async (id: number) => {
    if (!requireAuth()) return;

    setLoadingLike(id);
    try {
      const result = await unlikeKnowledgeContent(id, userId!, cleanToken!);
      if (result?.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, isLiked: false, likeCount: Math.max((a.likeCount || 1) - 1, 0) }
              : a
          )
        );
      }
    } catch (e) {
      console.error("Error in unlike:", e);
    } finally {
      setLoadingLike(null);
    }
  };



  const itemRender: PaginationProps["itemRender"] = (current, type, originalElement) => {
    if (type === "page") {
      return (
        <span
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
            cursor: "pointer",
          }}
        >
          {toPersianDigits(current)}
        </span>
      );
    }
    if (type === "prev") {
      return (
        <button
          type="button"
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
            background: "transparent",
            cursor: "pointer",
          }}
        >
          قبلی
        </button>
      );
    }
    if (type === "next") {
      return (
        <button
          type="button"
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
            background: "transparent",
            cursor: "pointer",
          }}
        >
          بعدی
        </button>
      );
    }
    if (type === "jump-prev" || type === "jump-next") {
      return <span style={{ margin: "0 4px" }}>...</span>;
    }
    return originalElement;
  };


return (
    <>
      {dataToShow.length === 0 ? (
        <div className="flex flex-col items-center gap-2 mt-[4rem]">
          <NoDataIcon />
          <p className="text-gray-700">داده‌ای موجود نیست</p>
        </div>
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
          <Space direction="vertical" size={15} style={{ width: "100%", borderRadius: 8 }}>
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
                  <Space className="flex items-center gap-1 justify-between w-full">
                    <div>
                      <div className="flex items-center gap-1">
                        <UserIcon size={12.24} color="#000000A6" />
                        <Text
                          className="font-yekan"
                          style={{ fontSize: 12.25, color: "#000000A6", fontWeight: 600 }}
                        >
                          {item.user.fullName}
                        </Text>
                      </div>
                    </div>
                    <p className="text-[#000000A6] text-[14px]" style={{ margin: 0 }}>
                      {gregorianToJalali(item.createdDate)}
                    </p>
                  </Space>
                </div>

                {/* Title */}
                <Title className="font-yekan" level={5} style={{ color: "#007041" }}>
                  {item.title}
                </Title>

                {/* Category + Structure */}
                <div
                  className={`${item.abstract ? "mb-[0.2rem]" : ""}`}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Space>
                    <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
                      دسته‌بندی:
                    </Text>
                    <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
                      {item.goalTitle}
                    </Text>
                  </Space>

                  {item.knowledgeContentType === "Structured" ? (
                    <Space className="flex items-center gap-1">
                      <StarIcon size={10.49} color="#000000A6" />
                      <Text className="font-yekan" style={{ fontSize: 11, color: "#000000A6" }}>
                        ساختاریافته
                      </Text>
                    </Space>
                  ) : item.knowledgeContentType === "Official" ? (
                    <Space className="flex items-center gap-1">
                      <IconPdf size={10.49} color="#000000A6" />
                      <Text className="font-yekan" style={{ fontSize: 11, color: "#000000A6" }}>
                        درس‌آموخته
                      </Text>
                    </Space>
                  ) : item.knowledgeContentType === "NonStructured" ? (
                    <Space className="flex items-center gap-1">
                      <StarIcon size={10.49} color="#000000A6" />
                      <Text className="font-yekan" style={{ fontSize: 11, color: "#000000A6" }}>
                        غیرساختاریافته
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
                    <Text style={{ fontSize: 12.25, color: "#333", marginLeft: 8 }}>چکیده :</Text>
                    <Paragraph style={{ fontSize: 12.25, color: "#333", marginBottom: 0 }}>
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

                {/* Attachments */}
                {item.attachments?.map((atta) =>
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
                  {/* tags: بدون div داخل Text و با key */}
                  <div className="flex items-center gap-1" style={{ marginTop: 8 }}>
                    {item.tags?.map((t) => (
                      <span key={t.id} className="flex text-[12px] text-[#333]">
                        #{t.tagTitle}
                      </span>
                    ))}
                  </div>

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
                      <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
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
                      <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
                        {toPersianDigits(item.commentCount ?? 0)}
                      </Text>
                    </Space>

                    {item.isLiked ? (
                      <Space
                        onClick={(e) => {
                          e.stopPropagation();
                          unlikeHandeler(item.id);
                        }}
                        className={`bg-[#00693D] p-1 rounded-lg text-white ${
                          loadingLike === item.id ? "opacity-50" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        {loadingLike === item.id ? (
                          <Spin size="small" />
                        ) : (
                          <LikeIcon size={12.24} color="#ffff" />
                        )}
                        <Text className="font-yekan text-white">
                          {toPersianDigits(item.likeCount ?? 0)}
                        </Text>
                      </Space>
                    ) : (
                      <Space
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikeClick(item.id);
                        }}
                        className={`bg-[#F0F0F0] p-1 rounded-lg ${
                          loadingLike === item.id ? "opacity-50" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        {loadingLike === item.id ? (
                          <Spin size="small" />
                        ) : (
                          <LikeIcon size={12.24} color="#000000A6" />
                        )}
                        <Text className="font-yekan text-[#000000A6]">
                          {toPersianDigits(item.likeCount ?? 0)}
                        </Text>
                      </Space>
                    )}
                  </Space>
                </div>
              </Card>
            ))}
          </Space>

          {/* Pagination */}
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
                total={dataToShow.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger
                onShowSizeChange={(_current, size) => handlePageChange(1, size)}
                pageSizeOptions={["6", "12", "24", "50"]}
                showTotal={(total, [start, end]) => (
                  <span className="font-yekan text-center" style={{ marginLeft: 8, fontFamily: "BYekan" }}>
                    {`نمایش ${toPersianDigits(start)}–${toPersianDigits(end)} از ${toPersianDigits(total)}`}
                  </span>
                )}
                itemRender={itemRender}
                style={{ fontFamily: "BYekan", display: "flex", alignItems: "center" }}
                locale={{ items_per_page: "/ صفحه" }}
              />
            </ConfigProvider>
          </div>

          {/* Modal */}
          <Modal
            open={open}
            onCancel={handleClose}
            footer={null}
            closable
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
            style={{ background: "transparent", boxShadow: "none" }}
            maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          >
            {selectedArticle && <ArticleCard item={selectedArticle} showActions={false} />}
          </Modal>
        </div>
      )}
    </>
  );
};

export default MyKnowledge;