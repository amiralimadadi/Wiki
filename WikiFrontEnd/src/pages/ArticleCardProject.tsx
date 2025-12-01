import StarIcon from "../svgs/StarIcon";
import UserIcon from "../svgs/UserIcon";
import { toPersianDigits } from "../utils/persianNu";
import type { Answer, Question } from "../types/Interfaces";
import LikeIcon from "../svgs/LikeIcon";
import {
  AutoComplete,
  Button,
  Form,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import CommentIcon from "../svgs/CommentIcon";
import { useEffect, useRef, useState } from "react";
import TextArea from "antd/es/input/TextArea";

import {
  CommentProjectPer2,
  likeAnswer,
  unlikeAnswer,
  getCommentsAnswer,
  getTagSelecteddAll,
  searchFormName,
} from "../services/auth";
const { Text } = Typography;

interface Mention {
  userId: number;
  fullName: string;
}

interface Tag {
  tagTitle: string;
}

export interface Comment {
  id: number;
  answerText: string;
  user: {
    fullName: string;
  };
  createdDate: string;
  isLiked: boolean;
  likeCount: number;
  mentions: Mention[];
  tags: Tag[];
  attachments?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
  }>;
}

interface Props {
  item: Question;
  onClick?: () => void;
  onLike?: () => void;
  liked?: boolean;
  likeCount?: number;
  showActions?: boolean;
}

const ArticleCardProject: React.FC<Props> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileName, setFileName] = useState("");
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [localItem, setLocalItem] = useState<Question>(item);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<Answer[]>([]);
  // @ts-expect-error tsx

  const [mentionUserId, setMentionUserId] = useState<number | null>(null);
  const [options, setOptions] = useState([]);
  // @ts-expect-error tsx

  const [searchText, setSearchText] = useState("");
  // @ts-expect-error tsx

  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // Handle like for the main question
  const handleQuestionLike = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await likeAnswer(id, userId, cleanToken);
      if (result.success) {
        setLocalItem((prev) => ({
          ...prev,
          isLiked: true,
          likeCount: (prev.likeCount || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Error in like:", error);
    } finally {
      setLoadingLike(null);
    }
  };

  // Handle unlike for the main question
  const handleQuestionUnlike = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await unlikeAnswer(id, userId, cleanToken);
      if (result.success) {
        setLocalItem((prev) => ({
          ...prev,
          isLiked: false,
          likeCount: Math.max((prev.likeCount || 1) - 1, 0),
        }));
      }
    } catch (error) {
      console.error("Error in unlike:", error);
    } finally {
      setLoadingLike(null);
    }
  };

  // Handle like for comments
  const handleCommentLike = async (commentId: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      const result = await likeAnswer(commentId, userId, cleanToken);
      if (result.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: true,
                  likeCount: (comment.likeCount || 0) + 1,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Handle unlike for comments
  const handleCommentUnlike = async (commentId: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      const result = await unlikeAnswer(commentId, userId, cleanToken);
      if (result.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: false,
                  likeCount: Math.max((comment.likeCount || 1) - 1, 0),
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error unliking comment:", error);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const file = fileInputRef.current?.files?.[0];
      const tagsArray = values.tags || [];

      const result = await CommentProjectPer2({
        commentText: values.comment,
        userId: userId,
        proposalId: localItem.id,
        tags: tagsArray,
        commentAttachments: file ? [file] : [],
      });

      console.log("پاسخ کامل سرور:", result);

      if (result?.isSuccess) {
        console.log("کامنت با موفقیت ارسال شد");

        setIsModalOpen(false);
        form.resetFields();
        setFileName("");
        setMentionUserId(null);

        // اگر نیاز به گرفتن دوباره کامنت‌ها بود
        // const response = await getComments(localItem.id);
        // if (response) {
        //   setCommentsGet(response);
        // }
      } else {
        console.log("ارسال کامنت با مشکل مواجه شد");
      }
    } catch (error) {
      console.log("ثبت کامنت با خطا مواجه شد:", error);
      console.log("خطایی در ثبت کامنت رخ داد");
    }
  };

  // Modal handlers
  const showModal = () => setIsModalOpen(true);
  const handleCancelModal = () => setIsModalOpen(false);

  // Submit comment form

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      const response = await getTagSelecteddAll();
      if (response && Array.isArray(response.data)) {
        setAvailableTags(response.data);
      }
    };
    fetchTags();
  }, []);

  // Fetch comments on component mount or when item.id changes
  useEffect(() => {
    const loadComments = async () => {
      if (item?.id) {
        try {
          const response = await getCommentsAnswer(item.id);
          if (response?.data) {

            setComments(response.data);
          }
        } catch (error) {
          console.error("Error fetching comments:", error);
          setComments([]);
        }
      }
    };
    loadComments();
  }, [item.id]);

  function normalizePersian(text: string): string {
    return text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();
  }

  const onSearch = async (text) => {
    setSearchText(text);

    if (!text) {
      setOptions([]);
      return;
    }

    setLoading(true);

    try {
      const data = await searchFormName(text);
      const normalizedSearch = normalizePersian(text);

      const filtered = (data || []).filter((user) => {
        return (
          normalizePersian(user.fullName || "").includes(normalizedSearch) ||
          normalizePersian(user.userName || "").includes(normalizedSearch) ||
          normalizePersian(user.email || "").includes(normalizedSearch) ||
          normalizePersian(user.mobileNumber || "").includes(normalizedSearch)
        );
      });

      const newOptions = filtered.map((user) => ({
        value: JSON.stringify(user),
        label: (
          <div>
            <div>
              <b>{user.fullName}</b>
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{user.email}</div>
            <div style={{ fontSize: 12, color: "#aaa" }}>
              {user.email} - {user.fullName}
            </div>
          </div>
        ),
      }));

      setOptions(newOptions);
    } catch (error) {
      console.error("Search error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (value) => {
    try {
      const selectedUser = JSON.parse(value);
      const finalText = `${selectedUser.fullName} - ${selectedUser.email}`;
      setInputValue(finalText);
      setMentionUserId(selectedUser.id);
    } catch (e) {
      setInputValue(value);
      setMentionUserId(null);
    }
  };

  return (
    <div className="w-[1000px] h-fit font-yekan">
      <div className="flex items-center gap-1 mt-3 justify-between">
        <div className="flex items-center gap-1 border-b-[1px] w-full p-1 border-gray-300">
          <div className="flex">
            <UserIcon color="#000000A6" size={12.24} />
            <p className="text-[#000000A6] text-[12.25px] font-bold">
              {localItem.user.fullName}
            </p>
          </div>
        </div>
        <div></div>
      </div>

      <p className="text-[17.5px] text-[#007041] font-semibold mt-2">
        {localItem.questionText}
      </p>

      <div className="flex justify-between">
        <div className="flex items-center gap-1 text-[#000000A6] text-[12.25px]">
          <p>دسته بندی:</p>
          <p>{localItem.goalTile}</p>
        </div>
        <div className="text-[#000000A6] text-[12.25px] flex items-center">
          <StarIcon size={9.51} />
          <p>ساختار یافته</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[14px] leading-7 font-bold text-[#333333]">
          {localItem.questionText}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 justify-between">
        <div className="flex items-center gap-1">
          {item.tags.map((tag, index) => (
            <p key={index} className="flex">
              #{tag.tagTitle}
            </p>
          ))}
        </div>
        <div className="flex flex-row-reverse items-center gap-3">
          {localItem.isLiked ? (
            <Space
              onClick={(e) => {
                e.stopPropagation();
                handleQuestionUnlike(localItem.id);
              }}
              className={`bg-[#00693D] p-1 rounded-lg text-white ${
                loadingLike === localItem.id ? "opacity-50" : ""
              }`}
            >
              {loadingLike === localItem.id ? (
                <Spin size="small" />
              ) : (
                <LikeIcon size={12.24} color="#ffff" />
              )}
              <Text className="font-yekan text-white">
                {toPersianDigits(localItem.likeCount || "0")}
              </Text>
            </Space>
          ) : (
            <Space
              onClick={(e) => {
                e.stopPropagation();
                handleQuestionLike(localItem.id);
              }}
              className={`bg-[#F0F0F0] p-1 rounded-lg ${
                loadingLike === localItem.id ? "opacity-50" : ""
              }`}
            >
              {loadingLike === localItem.id ? (
                <Spin size="small" />
              ) : (
                <LikeIcon size={12.24} color="#000000A6" />
              )}
              <Text className="font-yekan text-[#000000A6]">
                {toPersianDigits(localItem.likeCount || "0")}
              </Text>
            </Space>
          )}

          <div className="flex items-center gap-1">
            <CommentIcon size={12.24} />
            <p>{toPersianDigits(comments.length || "0")}</p>
          </div>
        </div>
      </div>

      <div
        className="mt-6 flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-inner"
        dir="ltr"
      >
        <Button
          onClick={showModal}
          type="default"
          className="bg-[#007041] px-6 w-[130px] p-1 text-white rounded-lg"
        >
          ثبت نظر
        </Button>
        <p className="text-[12.25px] mr-2">نظری درباره این محتوا دارید؟</p>
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
              className="p-4 flex flex-col items-start gap-2 h-fit rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-between w-full">
                <p className="text-[12.25px] text-gray-600 gap-1 flex items-center">
                  <UserIcon size={12.24} /> {comment.user.fullName}
                </p>
                {/* <p>{toPersianDigits(formatDate(comment.createdDate))}</p> */}
              </div>

              <p className="text-[14px] font-semibold leading-6 text-gray-800 mb-1">
                {comment.answerText}
              </p>

              <div className="flex gap-2 mb-[10px] items-center justify-between w-full">
                {/* {(comment.mentions || []).map((mention, index) => (
                  <div
                    key={mention.userId ?? index}
                    className="flex bg-[#6969731A] items-center gap-[3px] rounded-xl px-2 py-1"
                  >
                    <p className="text-[16.24px]">@</p>
                    <p className="text-[12.25px] font-bold text-[#333333]">
                      {mention.fullName}
                    </p>
                  </div>
                ))} */}

                {comment.isLiked ? (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommentUnlike(comment.id);
                    }}
                    className="bg-[#00693D] cursor-pointer p-1 rounded-lg text-white"
                  >
                    <LikeIcon size={12.24} color="#ffff" />
                    <Text className="font-yekan text-white">
                      {toPersianDigits(comment.likeCount || "0")}
                    </Text>
                  </Space>
                ) : (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommentLike(comment.id);
                    }}
                    className="bg-[#F0F0F0] p-1 rounded-lg cursor-pointer"
                  >
                    <LikeIcon size={12.24} color="#000000A6" />
                    <Text className="font-yekan text-[#000000A6]">
                      {toPersianDigits(comment.likeCount || "0")}
                    </Text>
                  </Space>
                )}
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
            </div>
          ))}
        </div>
      )}

      <Modal
        title="ثبت نظر"
        visible={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        className="font-yekan"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
            label="متن نظر"
            rules={[{ required: true, message: "متن نظر را وارد کنید" }]}
          >
            <TextArea
              className="border-[1px] font-yekan border-gray-500"
              rows={4}
              placeholder="متن نظر را وارد کنید"
            />
          </Form.Item>

          <Form.Item name="tags" label="تگ‌ها">
            <Select
              mode="multiple"
              allowClear
              placeholder="تگ ها"
              className="font-yekan custom-select"
              value={selectedTags}
              onChange={setSelectedTags}
            >
              {availableTags.map((tag, index) => (
                <Select.Option key={index} value={tag.tagTitle}>
                  {tag.tagTitle}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <AutoComplete
            options={options}
            style={{ width: "100%" }}
            onSearch={onSearch}
            onSelect={onSelect}
            allowClear
            value={inputValue}
            onChange={(value) => setInputValue(value)}
            placeholder="جستجوی نام، ایمیل یا شماره موبایل"
          />

          <div className="flex items-center gap-4 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileName(file.name);
              }}
            />

            <div className="flex items-center justify-between w-full">
              <label className="font-yekan font-semibold">افزودن فایل</label>

              <label
                htmlFor="fileInput"
                className="cursor-pointer hover:border-[1px] hover:border-[#007041] duration-150 font-yekan text-[#333333] px-9 py-1 border-2 rounded-xl"
              >
                انتخاب فایل
              </label>
            </div>
            {fileName && (
              <span className="text-sm text-gray-700">{fileName}</span>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-9">
            <button
              type="button"
              onClick={handleCancelModal}
              className="cursor-pointer hover:border-[1px] hover:border-[#007041] duration-150 font-yekan text-[#333333] px-9 py-1 border-2 rounded-xl"
            >
              بازگشت
            </button>
            <button
              onClick={handleOk}
              type="submit"
              className="cursor-pointer bg-[#007041] duration-150 font-yekan text-[#ffffff] px-14 py-1 border-2 rounded-xl"
            >
              ثبت
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ArticleCardProject;
