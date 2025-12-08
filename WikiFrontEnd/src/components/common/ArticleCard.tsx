import StarIcon from "../../svgs/StarIcon";
import UserIcon from "../../svgs/UserIcon";
import { toPersianDigits } from "../../utils/persianNu";
import type { Articles } from "../../types/Interfaces";
import { UploadOutlined } from "@ant-design/icons";
import DeleteIcon from "../../svgs/DeleteIconProps";
import LikeIcon from "../../svgs/LikeIcon";
import {
  Button,
  Form,
  Upload,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { baseUrlForDownload } from "../../configs/api";
import CommentIcon from "../../svgs/CommentIcon";
import { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import ArrowsIcon from "../../svgs/ArrowsIcon";
import PrintIcon from "../../svgs/PrintIcon";
import { useNavigate } from "react-router-dom";

import {
  createComment,
  getComments,
  getTagSelecteddAll,
  likeKnowledgeContent,
  unlikeKnowledgeContent,
  likeComment,
  UnlikeComment,
  searchFormName,
} from "../../services/auth";
import CustomIcon from "../../svgs/CustomIcon";
import gregorianToJalali from "../../helpers/createDate";
import IconPdf from "../../svgs/IconPdf";

const { Text } = Typography;
export interface GetCommentsResponse {
  data: CommentType[];
}

export interface CommentType {
  id: number;
  user: { fullName: string };
  commentText: string;
  mentions?: Mention[];
  tags?: Tag[];
  likeCount?: number;
  isLiked?: boolean;
  attachments?: Attachment[];
}
interface Props {
  item: Articles;
  onClick?: () => void;
  onLike?: () => void;
  liked?: boolean;
  likeCount?: number;
  showActions?: boolean;
  onOpenStructuredForm?: (item: Articles) => void;
}

export interface Mention {
  userId: number;
  fullName: string;
}

type Tag = {
  tagTitle: string;
};
type Attachment = {
  address: string;
  id: number;
  name: string;
};

const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const ArticleCard: React.FC<Props> = ({ item, onOpenStructuredForm }) => {

   const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [, setFileName] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const [localItem, setLocalItem] = useState<Articles>(item);
  const [commentsGet, setCommentsGet] = useState<GetCommentsResponse | null>(
    null
  );

  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // state لازم برای سرچ و آپشن‌ها
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionOptions, setMentionOptions] = useState<
    { value: number; label: string; display?: string; disabled?: boolean }[]
  >([]);
  const [mentionLoading, setMentionLoading] = useState(false);

  // به‌جای state جدا، مقدار انتخابی‌ها را از خود فرم بخوان:
  const selectedMentions = Form.useWatch("mentions", form) || [];

  const [selectedCommentTags, setSelectedCommentTags] = useState<string[]>([]);

const handleCommentTagsChange = (value: string[]) => {
  const cleaned = uniq(value.map(sanitizeTag)).filter(v => v.length > 0);
  setSelectedCommentTags(cleaned);
  form.setFieldsValue({ tags: cleaned });
};


  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const onLikeClick = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await likeKnowledgeContent(id, userId, cleanToken);
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

  const unlikeHandeler = async (id: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoadingLike(id);
    try {
      const result = await unlikeKnowledgeContent(id, userId, cleanToken);
      console.log(result);
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

  const handleCommentLike = async (commentId: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      const result = await likeComment(commentId, userId, cleanToken);
      if (result.success) {
        setCommentsGet((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            data: prev.data.map((c) =>
              c.id === commentId
                ? { ...c, isLiked: true, likeCount: (c.likeCount || 0) + 1 }
                : c
            ),
          };
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleCommentUnlike = async (commentId: number) => {
    if (!userId || !cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      const result = await UnlikeComment(
        commentId,
        userId,
        cleanToken
      );
      if (result.success) {
        setCommentsGet((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            data: prev.data.map((c) =>
              c.id === commentId
                ? {
                  ...c,
                  isLiked: false,
                  likeCount: Math.max((c.likeCount || 1) - 1, 0),
                }
                : c
            ),
          };
        });
      }
    } catch (error) {
      console.error("Error unliking comment:", error);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  // ----------------------------------------------------

  useEffect(() => {
    const fetchComments = async () => {
      if (localItem?.id) {
        const response = await getComments(localItem.id);
        if (response) {
          setCommentsGet(response);
        }
      }
    };
    fetchComments();
  }, [localItem.id]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await getTagSelecteddAll();
        if (response && Array.isArray(response.data)) {
          setTags(response.data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    fetchTags();
  }, []);

  function normalizePersian(text: string): string {
    return text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();
  }

  type User = { id: number; fullName: string; email?: string; userName?: string; mobileNumber?: string };
  const isSsoAccount = (u: User) => {
    const email = (u.email || "").trim();
    const local = (email.split("@")[0] || "").toLowerCase();
    const username = (u.userName || "").toLowerCase();
    return local.startsWith("sso") || username.startsWith("sso");
  };

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const data = await searchFormName(text);
      const normalized = normalizePersian(text);
      // فیلتر سمت کلاینت + حذف sso
      return (Array.isArray(data) ? data : [])
        .filter(u => !isSsoAccount(u))
        .filter(u =>
          normalizePersian(u.fullName || "").includes(normalized) ||
          normalizePersian(u.userName || "").includes(normalized) ||
          normalizePersian(u.email || "").includes(normalized) ||
          normalizePersian(u.mobileNumber || "").includes(normalized)
        );
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
  };

  const onMentionSearch = async (text: string) => {
    if (!text) {
      setMentionOptions([]);
      return;
    }

    setMentionLoading(true);
    const users = await searchUsers(text);

    // انتخاب‌های فعلی فرم را می‌گیریم تا گزینه‌های تکراری را disabled کنیم
    const picked: number[] = form.getFieldValue("mentionUserIds") || [];
    const selectedIds = new Set(picked);

    setMentionOptions(
      users.map(u => ({
        value: u.id,
        label: u.fullName || String(u.id),
        display: `${u.fullName || ""} — \u200E${u.email || ""}`,
        disabled: selectedIds.has(u.id),
      }))
    );

    setMentionLoading(false);
  };


  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const files: File[] = (values.files || []).map((
        f: any) => f?.originFileObj)
        .filter(Boolean);

      const mentionUserIds = (values.mentions || []).map(
        (m: { value: number; label: string }) => m.value
      );

       // ← تگ‌های خام از فرم یا state
    const rawTags: string[] = values.tags || selectedCommentTags || [];
    const cleanedTags = uniq(rawTags.map(sanitizeTag)).filter(v => v.length > 0);
    if (cleanedTags.length === 0) {
      form.setFields([{ name: "tags", errors: ["حداقل یک تگ انتخاب یا اضافه کنید."] }]);
      return;
    }

      await createComment({
        commentText: values.comment,
        userId,
        knowledgeContentId: localItem.id,
        mentionUserIds,
        tags: cleanedTags,  
        commentAttachments: files,     // ← فقط آرایه فایل‌ها رو بده
      });


      form.resetFields();
      setSelectedCommentTags([]);
      setFileName("");
      setMentionSearch("");
      setIsModalOpen(false);

      const response = await getComments(localItem.id);
      if (response) {
        setCommentsGet(response);
      }
    } catch (error) {
      console.error("ثبت کامنت با خطا مواجه شد:", error);
    }
  };

  const handleDownloadFile = async (atta) => {
    if (!cleanToken) {
      alert("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      const response = await fetch(`https://wikiapi.tipax.ir/${atta.address}`, {
        headers: {
          Authorization: cleanToken,
        },
      });

      if (!response.ok) {
        throw new Error(`خطا در دانلود فایل: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = atta.name || "file.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("دانلود فایل با خطا مواجه شد");
    }
  };

  return (
    <div className="w-[1000px] h-fit font-yekan">
      <div className="flex justify-between">
        <p className="text-[16px] text-[#333333] font-semibold">
          {localItem.title}
        </p>
      </div>
      <div className="border-b-[1px] border-gray-200 h-2"></div>
      <div className="flex justify-between items-center w-full mt-2">
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
          <p className="text-[#000000A6] text-[14px]" style={{ margin: 0 }}>
            {gregorianToJalali(item.createdDate)}
          </p>
        </div>
      </div>
      <p className="text-[17.5px] text-[#007041] font-semibold mt-2">
        {localItem.title}
      </p>

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

      <div
        className={`${localItem.abstract ? "block" : "hidden"
          } mt-4 flex flex-col`}
      >
        <p className="text-[13.25px] text-[#333333]">چکیده :</p>
        <p className="text-[13.25px] text-[#333333]"> {localItem.abstract}</p>
      </div>
      <div className="text-[14px] text-[#333333] font-yekan leading-8 font-semibold mt-[2rem]">
        <p className="w-[86%] text-justify">{item.text}</p>
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

      {item.mentions && item.mentions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4">
          {item.mentions.map((mention, index) => (
            <div
              key={mention.userId ?? index}
              className="flex items-center gap-1 bg-gray-100 px-2 py-[2px] rounded-lg border border-gray-300"
            >
              <p className="text-[12px] text-[#007041] font-bold">@</p>
              <p className="text-[12px] text-[#333] font-semibold">
                {mention.fullName}
              </p>
            </div>
          ))}
        </div>
      )}


      <div className="flex flex-wrap gap-2 mt-4 justify-between">
        <div className="flex items-center gap-1">
          {localItem.tags.map((items, index) => (
            <p key={index} className="flex">
              #{items.tagTitle}
            </p>
          ))}
        </div>
        <div className="flex flex-row-reverse items-center gap-3">
          {localItem.isLiked ? (
            <Space
              onClick={(e) => {
                e.stopPropagation();
                unlikeHandeler(localItem.id);
              }}
              className={`bg-[#00693D] p-1 rounded-lg text-white ${loadingLike === localItem.id ? "opacity-50" : "cursor-pointer"
                }`}
            >
              {loadingLike === localItem.id ? (
                <Spin size="small" />
              ) : (
                <LikeIcon size={12.24} color="#ffff" />
              )}
              <Text className="font-yekan cursor-pointer text-white">
                {toPersianDigits(localItem.likeCount || "0")}
              </Text>
            </Space>
          ) : (
            <Space
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick(localItem.id);
              }}
              className={`bg-[#F0F0F0] p-1 rounded-lg cursor-pointer transition group ${loadingLike === localItem.id ? "opacity-50" : "hover:bg-[#00693D]"
                }`}
            >
              {loadingLike === localItem.id ? (
                <Spin size="small" />
              ) : (
                <LikeIcon size={12.24} color="#000000A6" className="group-hover:fill-white"/>
              )}
              <Text className="font-yekan text-[#000000A6] group-hover:text-white">
                {toPersianDigits(localItem.likeCount || "0")}
              </Text>
            </Space>
          )}

          <div className="flex items-center gap-1">
            <CommentIcon size={12.24} />
            <p>{toPersianDigits(commentsGet?.data?.length || "0")}</p>
          </div>

          {/* 👇 دکمه تبدیل / پرینت کنار like و comment */}
   {localItem.knowledgeContentType?.trim().toLowerCase() ===
"nonstructured" ? (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onOpenStructuredForm?.(localItem); // 👈 اینجا والد رو صدا می‌زنیم
    }}
    className="flex items-center gap-1 bg-[#fbfbfb] hover:bg-gray-200 px-2 py-1 rounded-lg cursor-pointer"
  >
    <ArrowsIcon size={12.24} color="#000000A6" />
    <span className="text-[13px] text-[#000000A6]">تبدیل</span>
  </div>
) : (
  <div
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/knowledgeContentPrint/${localItem.id}`); // 👈 این یکی مستقیم ناوبری می‌کنه
    }}
    className="flex items-center gap-1 bg-[#F0F0F0] hover:bg-gray-200 px-2 py-1 rounded-lg cursor-pointer"
  >
    <PrintIcon size={12.24} color="#000000A6" />
    <span className="text-[13px] text-[#000000A6]">پرینت</span>
  </div>
)}

        </div>
      </div>


      <div
        className="mt-6 flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-inner"
        dir="ltr"
      >
        <Button
          onClick={showModal}
          type="default"
          className="bg-[#007041] custom-btn px-6 w-[130px] p-1 text-white rounded-lg"
        >
          ثبت نظر
        </Button>

        <Modal
          title="ثبت نظر"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          className="font-yekan csstom-form"
        >
          <Form
            form={form}
            layout="vertical">
            <Form.Item
              style={{ fontFamily: "Yekan" }}
              name="comment"
              label="متن نظر"
              className="font-yekan border-green-500 "
              rules={[{ required: true, message: "متن نظر را وارد کنید" }]}
            >
              <TextArea
                className="border-[1px] custom-input font-yekan border-gray-500 "
                rows={4}
                placeholder="متن نظر را وارد کنید"
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label="تگ‌ها"
              rules={[
                {
                  required: true,
                  message: "تعیین تگ‌ها الزامی است",
                  validator: (_, value) =>
                    value && value.length > 0 ? Promise.resolve() : Promise.reject(new Error("تعیین تگ‌ها الزامی است")),
                },
              ]}
            >
              <Select
                mode="tags"
                allowClear
                placeholder="تگ ها"
                className="font-yekan rounded-xl hover:custom-select  custom-input"
                popupMatchSelectWidth={false}
                placement="bottomLeft"
                 value={selectedCommentTags}
                 onChange={handleCommentTagsChange}
    tokenSeparators={[",", "،", ";", "؛"]} // جداکننده‌های فارسی/انگلیسی
    maxTagCount="responsive"
              >
                {tags.map((tag, index) => (
                  <Select.Option key={index} value={tag.tagTitle}>
                    {tag.tagTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* ارجاع (Mention) */}
            <Form.Item label="ارجاع (Mention)" name="mentions">
              <Select
                mode="multiple"
                labelInValue
                showSearch
                searchValue={mentionSearch}
                onSearch={(val) => {
                  setMentionSearch(val);
                  onMentionSearch(val);
                }}
                autoClearSearchValue={false}
                filterOption={false}
                options={mentionOptions}
                optionLabelProp="label"
                optionRender={(opt) => (
                  <div className="font-yekan">{opt.data.display ?? opt.data.label}</div>
                )}
                allowClear
                placeholder="نام افراد را وارد کنید"
                notFoundContent={mentionLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
                tagRender={() => null}
                maxTagCount={0}
                maxTagPlaceholder={null}
                className="font-yekan custom-input mention-select visible-border"
                style={{ height: 40, background: "#fff" }}
              />
            </Form.Item>


            {/*  چیپ‌های زیر فیلد */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedMentions.map(({ value, label }) => (
                <span
                  key={value}
                  className="flex items-center gap-2 bg-gray-100 text-sm rounded px-2 py-[4px] border border-gray-300"
                >
                  {label}
                  <button
                    style={{ color: "#ff4d4f" }}
                    onClick={() =>
                      form.setFieldValue(
                        "mentions",
                        selectedMentions.filter((x) => x.value !== value)
                      )
                    }
                    title="حذف"
                  >
                     <DeleteIcon />
                  </button>
                </span>
              ))}
            </div>


            {/* افزودن فایل */}
            <Form.Item label={null} className="upload-item" colon={false}>
              <div className="upload-box">
                <span className="upload-label">افزودن فایل</span>

                {/* این Form.Item داخلی مستقیماً والد Upload است و مقدار را به فرم بایند می‌کند */}
                <Form.Item
                  name="files"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList || []}
                  noStyle
                >
                  <Upload
                    beforeUpload={() => false}
                    showUploadList
                    listType="text"
                    multiple
                    className="upload-trigger"
                  >
                    <Button icon={<UploadOutlined />} className="upload-btn">
                      انتخاب فایل
                    </Button>
                  </Upload>
                </Form.Item>
              </div>
            </Form.Item>


            <div className="flex justify-end gap-4 mt-9">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer hover:border-[1px] hover:border-[#007041] duration-150 font-yekan text-[#333333] px-9 py-1 border-2 rounded-xl"
              >
                بازگشت
              </button>
              <button
                onClick={handleOk}
                type="submit"
                className="cursor-pointer bg-[#007041] duration-150 font-yekan text-[#ffffff] px-14 py-1 border-1 rounded-xl"
              >
                ثبت
              </button>
            </div>
          </Form>
        </Modal>

        <p className="text-[12.25px] mr-2">نظری درباره این محتوا دارید؟</p>
      </div>
      {commentsGet?.data?.length === 0 ? (
        <p className="text-[12.25px] text-center mt-8">
          نظری تا کنون ثبت نشده است
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="font-bold text-[14px] mb-2">پاسخ ها:</p>
          {commentsGet?.data?.map((comment) => (
            <div key={comment.id} className="p-2 rounded-md bg-gray-100">
              <p className="text-[12px] text-gray-600 flex items-center gap-1">
                <UserIcon size={12} /> {comment.user.fullName}
              </p>

              <p className="text-[14.5px] mt-4 text-gray-800 font-bold my-1">
                {comment.commentText}
              </p>
              {/* Attachments */}
              {comment.attachments.map((atta) =>
                atta?.address ? (
                  <a
                    key={atta.id}
                    href={`${baseUrlForDownload}${atta.address}`}
                    download={atta.name}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between gap-10 w-fit mt-4 px-4 py-2 bg-white hover:bg-gray-200 rounded-xl"
                    style={{ direction: "ltr" }}
                  >
                    <div className="flex items-center gap-1 text-[0.8rem]">
                      <span className="block overflow-clip">
                        {atta.name || "دانلود فایل پیوست"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.8rem] font-medium">فایل پیوست</span>
                      <IconPdf size={20} />
                    </div>
                  </a>
                ) : null
              )}
              {comment.mentions && comment.mentions.length > 0 && (
                     <div className="flex flex-wrap gap-1 my-2">
                       {comment.mentions.map((mention: Mention, index: number) => (
                         <div
                           key={mention.userId ?? index}
                           className="flex items-center gap-1 bg-gray-100 px-2 py-[2px] rounded-lg border border-gray-300"
                         >
                           <p className="text-[11px] text-[#007041] font-bold">@</p>
                           <p className="text-[11px] text-[#333] font-semibold">
                             {mention.fullName}
                           </p>
                         </div>
                       ))}
                     </div>
              )}

              <div className="flex justify-between flex-row-reverse">
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
                {comment.tags?.length > 0 && (
                  <div className="flex flex-wrap mt-1 text-[11px] gap-1">
                    {comment.tags.map((tag, i) => (
                      <span key={i} className="px-2 text-[11px]">
                        # {tag.tagTitle}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleCard;