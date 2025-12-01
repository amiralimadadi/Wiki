import { Modal, Button } from "antd";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useState } from "react";
import CommentIcon from "../../svgs/CommentIcon";
import { toPersianDigits } from "../../utils/persianNu";
import LikeIcon from "../../svgs/LikeIcon";
import UserIcon from "../../svgs/UserIcon";
import type { Comment } from "../../pages/ArticleCardProject";
import CommentFormModal from "./CommentFormModal";
import { getCommentsAnuser, sendLike, sendUnlike } from "../../services/auth";
import IconPdf from "../../svgs/IconPdf";
import { baseUrlForDownload } from "../../configs/api";

interface ModalContentProps {
  open: boolean;
  onClose: () => void;
  title: string;
  author: string;
  date: string;
  category: string;
  content: string;
  tags: string[];
  questionId: number;
}

const MoadlContentReuseble: React.FC<ModalContentProps> = ({
  open,
  onClose,
  title,
  author,
  date,
  category,
  content,
  tags,
  questionId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentModalOpen, setCommentModalOpen] = useState<boolean>(false);

  const token = localStorage.getItem("sessionId");
  const id = JSON.parse(localStorage.getItem("user"));
  const userId = id.id;

  const handleLikeClick = async (commentId: number, isLiked: boolean) => {
    if (!userId || !token) {
      alert("لطفا ابتدا وارد شوید");
      return;
    }

    const res = isLiked
      ? await sendUnlike(commentId, userId, "Answer", token)
      : await sendLike(commentId, userId, "Answer", token);

    if (res.isSuccess) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            const newLikeCount = isLiked
              ? Math.max((comment.likeCount || 1) - 1, 0)
              : (comment.likeCount || 0) + 1;
            return {
              ...comment,
              isLiked: !isLiked,
              likeCount: newLikeCount,
            };
          }
          return comment;
        })
      );
    } else {
      alert("عملیات انجام نشد: " + (res.message || "خطایی رخ داده"));
    }
  };

  const fetchComments = useCallback(async () => {
    if (!questionId) {
      console.warn("No questionId provided.");
      return;
    }
    try {
      const res = await getCommentsAnuser(questionId);
      // @ts-expect-error tsx

      const rawData = res?.data?.data || res?.data || [];

      const mapped = rawData.map((item) => ({
        id: item.id,
        answerText: item.answerText,
        user: { fullName: item.user?.fullName || "بدون نام" },
        createdDate: item.createdDate,
        likeCount: item.likeCount,
        isLiked: item.isLiked,
        mentions: item.mentions || [],
        tags: item.tags || [],
        attachments: item.attachments || [],
      }));

      setComments(mapped);
    } catch (error) {
      console.error("خطا در دریافت کامنت‌ها:", error);
    }
  }, [questionId]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, fetchComments]);

  const computedAnswersCount = comments.length;
  const computedLikesCount = comments.reduce(
    (sum, c) => sum + (c.likeCount || 0),
    0
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={1079.99}
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
          <div className="pt-4  border-gray-200">
            <div>
              <div className="flex items-center justify-between w-full mb-4">
                <div className="text-sm text-gray-600">
                  <UserOutlined className="mr-1" />
                  {author}
                </div>
                <span className="text-sm text-gray-600">{date}</span>
              </div>

              <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">
                  دسته بندی: {category}
                </div>
                <div className="font-bold text-[15px] whitespace-pre-line ">
                  {content.split("\n").map((paragraph, index) => (
                    <React.Fragment key={index}>
                      {paragraph}
                      <br />
                      <br />
                    </React.Fragment>
                  ))}
                </div>
            
              </div>

              <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[15px]">
                    <CommentIcon size={12.24} />
                    {toPersianDigits(computedAnswersCount)}
                  </div>
                  <div className="flex items-center gap-1 text-[15px] ">
                    <LikeIcon size={12.24} />
                    {toPersianDigits(computedLikesCount)}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-6 flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-inner"
              dir="ltr"
            >
              <Button
                onClick={() => setCommentModalOpen(true)}
                type="default"
                className="bg-[#007041] px-6 w-[130px] p-1 text-white rounded-lg"
              >
                ثبت نظر
              </Button>
              <p className="text-[12.25px] mr-2">
                نظری درباره این محتوا دارید؟
              </p>
            </div>

            {comments.length === 0 ? (
              <p className="text-[12.25px] text-center mt-8">
                نظری تا کنون ثبت نشده است
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                <p className="font-bold text-[14px] mb-2">پاسخ ها:</p>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 flex bg-gray-100 h-fit flex-col items-start gap-2 rounded-lg "
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className="text-[12.25px] text-gray-600 gap-1 flex items-center">
                        <UserIcon size={12.24} /> {comment.user.fullName}
                      </p>
                      {comment.createdDate && (
                        <p className="text-[12.25px] text-gray-500">
                          {toPersianDigits(
                            new Date(comment.createdDate).toLocaleDateString(
                              "fa-IR"
                            )
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <p className="text-[14px] font-semibold leading-6 text-gray-800 mb-1">
                        {comment.answerText}
                      </p>

                      <div
                        onClick={() =>
                          handleLikeClick(comment.id, comment.isLiked)
                        }
                        className={`flex items-center gap-1 p-1 rounded-lg cursor-pointer select-none ${
                          comment.isLiked
                            ? "bg-[#00693D] text-white"
                            : "bg-[#F0F0F0] text-[#000000A6]"
                        }`}
                        role="button"
                        aria-label="like comment"
                      >
                        <LikeIcon
                          size={12.24}
                          color={comment.isLiked ? "#fff" : "#000000A6"}
                        />
                        <p className="font-yekan">
                          {toPersianDigits(comment.likeCount || 0)}
                        </p>
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

                       {/* پیوست‌ها */}
          {Array.isArray(comment?.attachments) &&
            comment.attachments.map((atta: any) => (
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
            ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CommentFormModal
        open={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          fetchComments();
        }}
        questionId={questionId}
      />
    </Modal>
  );
};

export default MoadlContentReuseble;
