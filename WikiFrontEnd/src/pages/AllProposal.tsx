import {
  Card,
  Modal,
  Typography,
  Space,
  Pagination,
  type PaginationProps,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import CommentIcon from "../svgs/CommentIcon";
import LikeIcon from "../svgs/LikeIcon";
import IconPdf from "../svgs/IconPdf";
import UserIcon from "../svgs/UserIcon";
import type { Proposal } from "../types/Interfaces";
import { toPersianDigits } from "../utils/persianNu";
const { Paragraph, Text, Title } = Typography;
import fa_IR from "antd/lib/locale/fa_IR";
import { ConfigProvider } from "antd";
import {
  getAllProposals,
  likeProjectAndProposal,
  unLikeProjectAndProposal,
} from "../services/auth";
import { baseUrlForDownload } from "../configs/api";
import ArticleCardProposal from "../components/common/ArticleCardProposal";
import gregorianToJalali from "../helpers/createDate";
export interface Attachment {
  id: number;
  name: string;
  address: string;
}

const AllProposal = () => {
  const [open, setOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Proposal | null>(null);
  const [articles, setArticles] = useState<Proposal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(9);
  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  useEffect(() => {
    const getData = async () => {
      const res = await getAllProposals();

      if (res?.data?.data?.length) {
        setArticles(res.data.data);
      } else {
        setArticles([]);
      }
    };
    getData();
  }, []);

  const onLikeClick = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
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

      const result = await likeProjectAndProposal(id, userId, cleanToken);

      if (!result.success) {
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
        alert("خطا در ثبت لایک");
      }
    } catch (error) {
      console.error("Error in like:", error);
      // در صورت خطا، تغییرات را بازگردانید
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
      alert("خطا در ثبت لایک");
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
      // ابتدا UI را آپدیت می‌کنیم
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

      // سپس درخواست به سرور ارسال می‌شود
      const result = await unLikeProjectAndProposal(id, userId, cleanToken);

      // اگر سرور خطا داد، تغییرات را بازگردانید
      if (!result.success) {
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
        alert("خطا در ثبت آنلایک");
      }
    } catch (error) {
      console.error("Error in unlike:", error);
      // در صورت خطا، تغییرات را بازگردانید
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
      alert("خطا در ثبت آنلایک");
    } finally {
      setLoadingLike(null);
    }
  };

  const currentData = articles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpen = (item: Proposal) => {
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
                <div className="flex items-center w-full justify-between">
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
                  <p
                    className="text-[#000000A6] text-[14px]"
                    style={{ margin: 0 }}
                  >
                    {gregorianToJalali(item.createdDate)}
                  </p>
                </div>
                <Text
                  className="font-yekan"
                  style={{ fontSize: 12.25, color: "#000000A6" }}
                ></Text>
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
              {item.goalTitle && (
                <div className="flex justify-between items-center">
                  <Space>
                    <Text className="font-yekan text-xs text-[#000000A6]">
                      دسته بندی:
                    </Text>
                    <Text className="font-yekan text-xs text-[#000000A6]">
                      {item.goalTitle}
                    </Text>
                  </Space>
                </div>
              )}

              <div className="flex items-center justify-end text-[10.50px] font-yekan text-[#000000A6]">
                <p>کد طرح :</p>
                <p>{item.code}</p>
              </div>

              {/* Summary */}
              <div className="flex flex-col items-start text-[12.25px] bg-gray-100 p-2 rounded-lg">
                <span className="mt-1">چکیده:</span>

                <div className="flex-1">
                  <Paragraph
                    className="font-yekan font-semibold"
                    ellipsis={{ rows: 3, expandable: false }}
                    style={{
                      fontSize: 12.25,
                      color: "#333333",
                      marginBottom: 0,
                      lineHeight: "2.6em",
                      maxHeight: "7.8em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.abstract}
                  </Paragraph>
                </div>
              </div>

       {item.attachments.map((atta) =>
  atta?.address ? (
    <a
      key={atta.id}
      href={`${baseUrlForDownload}${atta.address}`}
      download={atta.name} // باعث میشه مرورگر فایل رو دانلود کنه
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()} // جلوی باز شدن مودال یا کارت رو می‌گیره
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
                  <div className="flex items-center gap-1 text-[12px]">
                    {item.tags.map((items, index) => (
                      <div className="flex items-center gap-1">
                        <p className="text-[15px]">#</p>
                        <p key={index} className="flex">
                          {items.tagTitle}
                        </p>
                      </div>
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
        {articles.length > pageSize && (
          <div
            className="bg-white p-4 rounded-xl flex"
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
    <ArticleCardProposal
      key={selectedArticle.id}             // کمک می‌کند مودال تمیز رفرش شود
      item={selectedArticle}
      showActions={true}
      onProposalChange={(updated) => {
        // 1) لیست اصلی را آپدیت کن
        setArticles(prev =>
          prev.map(a => (a.id === updated.id ? updated : a))
        );
        // 2) خود آیتم انتخاب‌شده در مودال را هم سینک کن
        setSelectedArticle(updated);
      }}
    />
  )}
</Modal>

      </div>
    </>
  );
};

export default AllProposal;