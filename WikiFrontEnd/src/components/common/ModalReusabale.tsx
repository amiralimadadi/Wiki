// ModalReusabale.tsx
import { Modal, Button, Space, message, Tooltip } from "antd";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CommentIcon from "../../svgs/CommentIcon";
import { toPersianDigits } from "../../utils/persianNu";
import LikeIcon from "../../svgs/LikeIcon";
import UserIcon from "../../svgs/UserIcon";
import type { Comment } from "../../pages/ArticleCardProject";
import CommentFormModal from "./CommentFormModal";
import { getCommentsAnuser, sendLike, sendUnlike } from "../../services/auth";
import gregorianToJalali from "../../helpers/createDate";
import StarIcon from "../../svgs/StarIcon";
import IconPdf from "../../svgs/IconPdf";

interface ModalContentProps {
  open: boolean;
  onClose: () => void;

  title: string;
  author: string;
  content: string;
  tags: string[];
  knowledgeContentId: number;

  abstract: string;
  goalTitle: string;
  createdDate: string;
  type: "Structured" | "Official" | "NonStructured" | string;

  attachments?: Array<{ id?: number; address?: string; name?: string }>;

  // آمار خود محتوا (نه پاسخ‌ها)
  commentCount?: number;
  likeCount?: number;

  // آدرس پایه برای دانلود فایل‌ها (اختیاری، برای حذف هاردکُد)
  attachmentsBaseUrl?: string;

  onCommentSubmit?: () => void;
}

const ModalReusabale: React.FC<ModalContentProps> = ({
  open,
  onClose,
  title,
  author,
  content,
  tags = [],
  knowledgeContentId,
  goalTitle,
  createdDate,
  abstract,
  type,
  commentCount,
  likeCount,
  attachmentsBaseUrl = "",
  onCommentSubmit,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentModalOpen, setCommentModalOpen] = useState<boolean>(false);

  const token = localStorage.getItem("sessionId") || "";
  const userData = localStorage.getItem("user");
  const parsedUser = userData ? JSON.parse(userData) : null;
  const userId: number | undefined = parsedUser?.id;

  const handleLikeClick = async (commentId: number, isLiked: boolean) => {
    if (!userId || !token) {
      message.warning("لطفا ابتدا وارد شوید");
      return;
    }
    try {
      const res = isLiked
        ? await sendUnlike(commentId, userId, "Answer", token)
        : await sendLike(commentId, userId, "Answer", token);

      if (res?.isSuccess) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !isLiked,
                  likeCount: isLiked
                    ? Math.max((comment.likeCount || 1) - 1, 0)
                    : (comment.likeCount || 0) + 1,
                }
              : comment
          )
        );
      } else {
        message.error(res?.message || "عملیات انجام نشد");
      }
    } catch (e) {
      message.error("خطایی رخ داد");
      // console.error(e);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!knowledgeContentId) return;
    try {
      const res = await getCommentsAnuser(knowledgeContentId);
      // @ts-expect-error
      const rawData = res?.data?.data || res?.data || [];
      const mapped: Comment[] = rawData.map((item: any) => ({
        id: item.id,
        answerText: item.answerText,
        user: { fullName: item.user?.fullName || "بدون نام" },
        createdDate: item.createdDate,
        likeCount: item.likeCount,
        goalTitle: item.goalTitle,
        isLiked: !!item.isLiked,
        mentions: item.mentions || [],
        tags: item.tags || [],
        attachments: item.attachments || [],
      }));
      setComments(mapped);
    } catch {
      message.error("خطا در دریافت نظرها");
    }
  }, [knowledgeContentId]);

  useEffect(() => {
    if (open) fetchComments();
  }, [open, fetchComments]);

  // آمار پاسخ‌ها (نه آمار خود محتوا)
  const answersCount = comments.length;
  const answersLikesTotal = useMemo(
    () => comments.reduce((sum, c) => sum + (c.likeCount || 0), 0),
    [comments]
  );

  const formattedDate = createdDate ? gregorianToJalali(createdDate) : "—";

  const typeBadge = useMemo(() => {
    if (type === "Structured") {
      return (
        <Space className="flex items-center gap-1">
          <StarIcon size={10.49} color="#000000A6" />
          <p className="font-yekan" style={{ fontSize: 11, color: "#000000A6" }}>
            ساختاریافته
          </p>
        </Space>
      );
    }
    if (type === "Official") {
      return (
        <Space className="flex items-center gap-1">
          <IconPdf size={10.49} color="#000000A6" />
          <p className="font-yekan" style={{ fontSize: 11, color: "#000000A6" }}>
            درس‌آموخته
          </p>
        </Space>
      );
    }
    if (type === "NonStructured") {
      return (
        <Space className="flex items-center gap-1">
          <StarIcon size={10.49} color="#000000A6" />
          <p className="font-yekan" style={{ fontSize: 11, color: "#000000A6" }}>
            غیرساختاریافته
          </p>
        </Space>
      );
    }
    return null;
  }, [type]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setCommentModalOpen(false);
        onClose();
      }}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={1080}
      centered
      className="[&_.ant-modal-content]:shadow-none"
    >
      <div className="ant-modal-content p-6">
        <div className="ant-modal-header pb-4">
          <div className="ant-modal-title">
            <p className="mb-0 text-lg font-bold text-[#298760]">{title}</p>
          </div>
        </div>

        <div className="ant-modal-body">
          <div className="pt-3 border-gray-200">
            <div>
              <div className="flex items-center justify-between w-full mb-4">
                <div className="text-sm text-gray-600">
                  <UserOutlined className="mr-1" />
                  {author || "نامشخص"}
                </div>
                <p className="text-[#000000A6]">{formattedDate}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#000000A6] mb-5 gap-1">
                  <p>دسته‌بندی:</p>
                  <p>{goalTitle || "—"}</p>
                </div>
                <div>{typeBadge}</div>
              </div>

              {abstract ? (
                <div
                  className="flex flex-col mb-4"
                  style={{
                    background: "#F7F7F8",
                    borderRadius: 8,
                    display: "flex",
                    padding: "1rem",
                  }}
                >
                  <p>چکیده:</p>
                  <p>{abstract}</p>
                </div>
              ) : null}

              <div className="mb-4 w-[99%]">
                <div className="font-bold text-[15px] text-gray-700 leading-8 whitespace-pre-wrap">
                  {content}
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* آمار محتوا (از والد) */}
                <div className="flex items-center gap-4">
                  <Tooltip title="تعداد نظرات ثبت‌شده برای محتوا">
                    <div className="flex items-center gap-1 text-[15px]">
                      <CommentIcon size={12.24} />
                      {toPersianDigits(commentCount ?? 0)}
                    </div>
                  </Tooltip>
                  <Tooltip title="تعداد لایک‌های محتوا">
                    <div className="flex items-center gap-1 text-[15px] ">
                      <LikeIcon size={12.24} />
                      {toPersianDigits(likeCount ?? 0)}
                    </div>
                  </Tooltip>
                </div>
              </div>

              {/* CTA ثبت نظر */}
              <div
                className="mt-6 flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-inner"
                dir="ltr"
              >
                <Button
                  onClick={() => setCommentModalOpen(true)}
                  type="default"
                  className="bg-[#007041] px-6 custom-btn w-[130px] p-1 text-white rounded-lg"
                >
                  ثبت نظر
                </Button>
                <p className="text-[12.25px] mr-2">نظری درباره این محتوا دارید؟</p>
              </div>

              {/* لیست پاسخ‌ها */}
              {comments.length === 0 ? (
                <p className="text-[12.25px] text-center mt-8">نظری تا کنون ثبت نشده است</p>
              ) : (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] mb-2">پاسخ‌ها:</p>
                    <div className="flex items-center gap-4 text-[12.5px] text-[#000000A6]">
                      <span>تعداد پاسخ‌ها: {toPersianDigits(answersCount)}</span>
                      <span>جمع لایک پاسخ‌ها: {toPersianDigits(answersLikesTotal)}</span>
                    </div>
                  </div>

                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 flex bg-gray-100 h-fit flex-col items-start gap-2 rounded-lg "
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className="text-[12.25px] text-gray-600 gap-1 flex items-center">
                          <UserIcon size={12.24} /> {comment.user?.fullName || "بدون نام"}
                        </p>
                        {comment.createdDate ? (
                          <p className="text-[12.25px] text-gray-500">
                            {toPersianDigits(
                              new Date(comment.createdDate).toLocaleDateString("fa-IR")
                            )}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <p className="text-[14px] font-semibold leading-6 text-gray-800 mb-1">
                          {comment.answerText || "بدون متن"}
                        </p>

                        <div
                          onClick={() => handleLikeClick(comment.id, !!comment.isLiked)}
                          className={`flex items-center gap-1 p-1 rounded-lg cursor-pointer select-none ${
                            comment.isLiked ? "bg-[#00693D] text-white" : "bg-[#F0F0F0] text-[#000000A6]"
                          }`}
                          role="button"
                          aria-label="like comment"
                        >
                          <LikeIcon size={12.24} color={comment.isLiked ? "#fff" : "#000000A6"} />
                          <p className="font-yekan">{toPersianDigits(comment.likeCount || 0)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-[10px] items-center justify-between w-full">
                        {(comment.mentions || []).map((mention, index) => (
                          <div
                            key={mention?.userId ?? index}
                            className="flex bg-[#6969731A] items-center gap-[3px] rounded-xl px-2 py-1"
                          >
                            <p className="text-[16.24px]">@</p>
                            <p className="text-[12.25px] font-bold text-[#333333]">
                              {mention?.fullName}
                            </p>
                          </div>
                        ))}
                      </div>

                      {comment.tags?.length > 0 && (
                        <div className="flex flex-wrap mt-2 text-[10.5px]">
                          {comment.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 text-[10.5px]">
                              #{tag.tagTitle}
                            </span>
                          ))}
                        </div>
                      )}

                      {comment.attachments?.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          <p className="text-[11px] text-gray-500">فایل‌های ضمیمه:</p>
                          {comment.attachments.map((file, index) => {
                            const href = `${attachmentsBaseUrl}${file.fileName || ""}`;
                            return (
                              <a
                                key={file.id || index}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-[12px]"
                              >
                                {file.fileName || `دانلود فایل ${index + 1}`}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* فرم ثبت نظر */}
      <CommentFormModal
        open={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          fetchComments();      // رفرش لیست نظرات بعد از بستن فرم
          onCommentSubmit?.();  // اطلاع به والد (toast و ...)
        }}
        questionId={knowledgeContentId}
      />
    </Modal>
  );
};

export default ModalReusabale;
