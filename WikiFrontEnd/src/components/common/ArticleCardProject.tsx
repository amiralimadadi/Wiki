import { useEffect,  useState } from "react";
import {
  Upload,
  Button,
  Form,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import DeleteIcon from "../../svgs/DeleteIconProps";
import { UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import UserIcon from "../../svgs/UserIcon";
import LikeIcon from "../../svgs/LikeIcon";
import CommentIcon from "../../svgs/CommentIcon";
import IconPdf from "../../svgs/IconPdf";

import { toPersianDigits } from "../../utils/persianNu";
import type { CommentsP, Project } from "../../types/Interfaces";
import type { Attachment } from "../../pages/AllProjects";

import {
  CommentProject,
  downloadFile,
  getCommentOfProject,
  getTagSelecteddAll,
  likeProjectComment,
  searchFormName,
  unlikeProjectComment,
  likeProject,
  unLikeProject,
} from "../../services/auth";

const { Paragraph, Text } = Typography;

interface Props {
  item: Project;
  showActions?: boolean;
  /** بعد از تغییر لایک پروژه، برای سینک با لیست والد صدا زده می‌شود */
  onProjectChange?: (updated: Project) => void;
}

type Tag = { tagTitle: string };
export interface AttachmentList { attachments: Attachment[]; }
export type User = {
  id: number; fullName: string; userName: string; email: string; mobileNumber: string;
};
const sanitizeTag = (t: string) =>
  t?.toString()?.trim().replace(/^#+/, "").replace(/\s+/g, " ") || "";
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const ArticleCardProject: React.FC<Props> = ({ item, onProjectChange, showActions = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [, setFileName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // --- آیتم محلی پروژه برای Optimistic UI ---
  const [localItem, setLocalItem] = useState<Project>(item);
  useEffect(() => { setLocalItem(item); }, [item]);


    // ----- Mention state -----
  type MentionOpt = { value: number; label: string; display: string; disabled?: boolean };
  const [mentionOptions, setMentionOptions] = useState<MentionOpt[]>([]);
  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const selectedMentions = (Form.useWatch("mentions", form) ?? []) as Array<{ value: number; label: string }>;
  const [mentionSearch, setMentionSearch] = useState("");

  // --- سایر state ها ---
  const [tag, setTag] = useState<Tag[]>([]);
  const [commentsGet, setCommentsGet] = useState<CommentsP[]>([]);
  const [loadingLike, setLoadingLike] = useState<number | null>(null); // id پروژه یا id کامنت
  const users = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = users?.id;
  const token = localStorage.getItem("sessionId");
  const cleanToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const [, setMentionUserId] = useState<number | null>(null);
  const [pageNo /* setPageNo */] = useState<number>(1);

  // --- لایک/آنلایک خود پروژه (Optimistic + Rollback) ---
  const onLikeProject = async () => {
    if (!userId || !cleanToken) { alert("ابتدا وارد حساب کاربری خود شوید"); return; }
    setLoadingLike(localItem.id);
    try {
      setLocalItem(prev => {
        const next = { ...prev, isLiked: true, likeCount: (prev.likeCount || 0) + 1 };
        onProjectChange?.(next);
        return next;
      });
      const result = await likeProject(localItem.id, userId, cleanToken);
      if (!result?.success) {
        setLocalItem(prev => {
          const next = { ...prev, isLiked: false, likeCount: Math.max((prev.likeCount || 1) - 1, 0) };
          onProjectChange?.(next);
          return next;
        });
        alert("خطا در ثبت لایک");
      }
    } catch {
      setLocalItem(prev => {
        const next = { ...prev, isLiked: false, likeCount: Math.max((prev.likeCount || 1) - 1, 0) };
        onProjectChange?.(next);
        return next;
      });
      alert("خطا در ثبت لایک");
    } finally {
      setLoadingLike(null);
    }
  };

  const onUnlikeProject = async () => {
    if (!userId || !cleanToken) { alert("ابتدا وارد حساب کاربری خود شوید"); return; }
    setLoadingLike(localItem.id);
    try {
      setLocalItem(prev => {
        const next = { ...prev, isLiked: false, likeCount: Math.max((prev.likeCount || 1) - 1, 0) };
        onProjectChange?.(next);
        return next;
      });
      const result = await unLikeProject(localItem.id, userId, cleanToken);
      if (!result?.success) {
        setLocalItem(prev => {
          const next = { ...prev, isLiked: true, likeCount: (prev.likeCount || 0) + 1 };
          onProjectChange?.(next);
          return next;
        });
        alert("خطا در ثبت آنلایک");
      }
    } catch {
      setLocalItem(prev => {
        const next = { ...prev, isLiked: true, likeCount: (prev.likeCount || 0) + 1 };
        onProjectChange?.(next);
        return next;
      });
      alert("خطا در ثبت آنلایک");
    } finally {
      setLoadingLike(null);
    }
  };

  // --- لایک/آنلایک کامنت‌های پروژه (همان منطق شما + دیزیبل) ---
  const onLikeClick = async (id: number) => {
    if (!userId || !cleanToken) { alert("ابتدا وارد حساب کاربری خود شوید"); return; }
    setLoadingLike(id);
    try {
      setCommentsGet(prev =>
        prev.map(c => (c.id === id ? { ...c, isLiked: true, likeCount: (c.likeCount || 0) + 1 } : c))
      );
      const result = await likeProjectComment(id, userId, cleanToken);
      if (!result?.success) {
        setCommentsGet(prev =>
          prev.map(c =>
            c.id === id ? { ...c, isLiked: false, likeCount: Math.max((c.likeCount || 1) - 1, 0) } : c
          )
        );
        alert("خطا در ثبت لایک");
      }
    } catch {
      setCommentsGet(prev =>
        prev.map(c =>
          c.id === id ? { ...c, isLiked: false, likeCount: Math.max((c.likeCount || 1) - 1, 0) } : c
        )
      );
      alert("خطا در ثبت لایک");
    } finally {
      setLoadingLike(null);
    }
  };

  const unlikeHandeler = async (id: number) => {
    if (!userId || !cleanToken) { alert("ابتدا وارد حساب کاربری خود شوید"); return; }
    setLoadingLike(id);
    try {
      setCommentsGet(prev =>
        prev.map(c => (c.id === id ? { ...c, isLiked: false, likeCount: Math.max((c.likeCount || 1) - 1, 0) } : c))
      );
      const result = await unlikeProjectComment(id, userId, cleanToken);
      if (!result?.success) {
        setCommentsGet(prev =>
          prev.map(c => (c.id === id ? { ...c, isLiked: true, likeCount: (c.likeCount || 0) + 1 } : c))
        );
        alert("خطا در ثبت آنلایک");
      }
    } catch {
      setCommentsGet(prev =>
        prev.map(c => (c.id === id ? { ...c, isLiked: true, likeCount: (c.likeCount || 0) + 1 } : c))
      );
      alert("خطا در ثبت آنلایک");
    } finally {
      setLoadingLike(null);
    }
  };



const handleOk = async () => {
  try {
    const values = await form.validateFields();

    // فایل‌ها از antd Upload
    const fileList = (values.file || []) as Array<{ originFileObj?: File }>;
    const files: File[] = fileList
      .map(f => f?.originFileObj)
      .filter(Boolean) as File[];

    // تگ‌ها
    const rawTags: string[] = values.tags || selected || [];
    const cleanedTags = uniq(rawTags.map(sanitizeTag)).filter(v => v.length > 0);

    const fd = new FormData();
    fd.append("CommentText", values.comment);
    fd.append("UserId", String(userId));
    fd.append("ProjectId", String(localItem.id));

    // آرایه‌ی تگ‌ها طبق بایندر .NET
    cleanedTags.forEach((t, i) => fd.append(`Tags[${i}]`, t));

    // فایل‌ها «اختیاری»
    files.forEach(f => fd.append("ProposalCommentAttachments", f));

     await CommentProject(fd, token);
    
      setIsModalOpen(false);
      form.resetFields();
      setSelected([]);
      setFileName("");
      setMentionUserId(null);

      // رفرش
      try {
        const response = await getCommentOfProject(localItem.id, pageNo);
        if (response.data) setCommentsGet(response.data);
      } catch {}
   
  } catch (error) {
    console.log("ثبت کامنت با خطا:", error);
  }
};


  // --- دریافت تگ‌ها و کامنت‌ها ---
  useEffect(() => {
    (async () => {
      try {
        const response = await getTagSelecteddAll();
        if (response && Array.isArray(response.data)) setTag(response.data);
      } catch { setTag([]); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!localItem?.id) return;
      try {
        const response = await getCommentOfProject(localItem.id, pageNo);
        if (response.data) setCommentsGet(response.data);
        else setCommentsGet([]);
      } catch {
        setCommentsGet([]);
      }
    })();
  }, [localItem.id, pageNo]);

  // --- اتوکامپلیت منشن ---



    const isSsoAccount = (u: User) => {
      const email = (u.email || "").trim();
      const local = (email.split("@")[0] || "").toLowerCase();
      const username = (u.userName || "").toLowerCase();
      return local.startsWith("sso") || username.startsWith("sso");
    };
    const searchUsers = async (text: string): Promise<User[]> => {
      try {
        const data = await searchFormName(text);
        return (Array.isArray(data) ? data : []).filter(u => !isSsoAccount(u));
      } catch (e) {
        console.error("Search error:", e);
        return [];
      }
    };
    // Mention
  const onMentionSearch = async (text: string) => {
    if (!text) return setMentionOptions([]);
    setMentionLoading(true);
    const users = await searchUsers(text);
    const selectedIds = new Set(selectedMentions.map(m => m.value));
    setMentionOptions(
      users.map(u => ({
        value: u.id,
        label: u.fullName,
        display: `${u.fullName} — \u200E${u.email}`,
        disabled: selectedIds.has(u.id),
      }))
    );
    setMentionLoading(false);
  };
  // --- رندر ---
  return (
    <div className="w-[1000px] h-fit font-yekan">
      <p className="text-[17.5px] text-[#007041]  font-semibold mt-2 border-b-[1px]">
        {localItem.title}
      </p>

      <div className="flex items-center gap-1 mt-3 justify-between">
        <div className="flex items-center gap-1  w-full p-1 border-gray-300">
          <UserIcon color="#000000A6" size={12.24} />
          <p className="text-[#000000A6] text-[12.25px] font-bold">
            {localItem.user.fullName}
          </p>
        </div>
      </div>

      {localItem.goalTitle && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Space>
            <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
              دسته بندی:
            </Text>
            <Text className="font-yekan" style={{ fontSize: 13, color: "#000000A6" }}>
              {localItem.goalTitle}
            </Text>
          </Space>
        </div>
      )}

      <div className="flex justify-end items-center gap-1 text-[#000000A6] text-[10.5px] font-yekan w-full ">
        <p>کد طرح:</p>
        <p>{localItem.code}</p>
      </div>

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
            {localItem.abstract}
          </Paragraph>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 justify-between">
        <div className="flex items-center gap-1">
          {(localItem.tags || []).map((t, index) => (
            <p key={index} className="flex">#{t.tagTitle}</p>
          ))}
        </div>

        <div className="flex flex-row-reverse items-center gap-3">
          {/* دکمه لایک پروژه */}
          {localItem.isLiked ? (
            <Space
              onClick={(e) => {
                e.stopPropagation();
                if (loadingLike === localItem.id) return;
                onUnlikeProject();
              }}
              className={`cursor-pointer bg-[#00693D] p-1 rounded-lg text-white ${
                loadingLike === localItem.id ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ pointerEvents: loadingLike === localItem.id ? "none" : "auto" }}
            >
              {loadingLike === localItem.id ? <Spin size="small" /> : <LikeIcon size={12.24} color="#ffff" />}
              <Text className="font-yekan text-white">
                {toPersianDigits(localItem.likeCount || 0)}
              </Text>
            </Space>
          ) : (
            <Space
              onClick={(e) => {
                e.stopPropagation();
                if (loadingLike === localItem.id) return;
                onLikeProject();
              }}
              className={`bg-[#F0F0F0] p-1 rounded-lg cursor-pointer ${
                loadingLike === localItem.id ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ pointerEvents: loadingLike === localItem.id ? "none" : "auto" }}
            >
              {loadingLike === localItem.id ? <Spin size="small" /> : <LikeIcon size={12.24} color="#000000A6" />}
              <Text className="font-yekan text-[#000000A6]">
                {toPersianDigits(localItem.likeCount || 0)}
              </Text>
            </Space>
          )}

          <div className="flex items-center gap-1">
            <CommentIcon size={12.24} />
          </div>
        </div>
      </div>

      {/* اکشن ثبت نظر */}
      {showActions && (
        <div className="mt-6 flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-inner" dir="ltr">
          <Button
            onClick={() => setIsModalOpen(true)}
            type="default"
            className="bg-[#007041] px-6 w-[130px] p-1 text-white rounded-lg"
          >
            ثبت نظر
          </Button>
          <p className="text-[12.25px] mr-2">نظری درباره این محتوا دارید؟</p>
        </div>
      )}

      {/* لیست کامنت‌ها */}
      {commentsGet.length === 0 ? (
        <p className="text-[12.25px] text-center mt-8">نظری تا کنون ثبت نشده است</p>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="font-bold text-[14px] mb-2">پاسخ ها:</p>
          {commentsGet.map((comment) => (
            <div key={comment.id} className="p-4 flex flex-col items-start gap-2 h-fit rounded-lg bg-gray-50">
              <div className="flex items-center justify-between w-full">
                <p className="text-[12.25px] text-gray-600 gap-1 flex items-center">
                  <UserIcon size={12.24} /> {comment.user.fullName}
                </p>
                {comment.createdDate && (
                  <p>{toPersianDigits(new Date(comment.createdDate).toLocaleDateString("fa-IR"))}</p>
                )}
              </div>

              <div className="flex justify-between items-center w-full">
                <p className="text-[14px] font-semibold leading-6 text-gray-800 mb-1">
                  {comment.commentText}
                </p>

                {comment.isLiked ? (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      if (loadingLike === comment.id) return;
                      unlikeHandeler(comment.id);
                    }}
                    className={`cursor-pointer bg-[#00693D] p-1 rounded-lg text-white ${
                      loadingLike === comment.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{ pointerEvents: loadingLike === comment.id ? "none" : "auto" }}
                  >
                    {loadingLike === comment.id ? <Spin size="small" /> : <LikeIcon size={12.24} color="#ffff" />}
                    <Text className="font-yekan text-white">
                      {toPersianDigits(comment.likeCount || 0)}
                    </Text>
                  </Space>
                ) : (
                  <Space
                    onClick={(e) => {
                      e.stopPropagation();
                      if (loadingLike === comment.id) return;
                      onLikeClick(comment.id);
                    }}
                    className={`bg-[#F0F0F0] p-1 rounded-lg cursor-pointer ${
                      loadingLike === comment.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{ pointerEvents: loadingLike === comment.id ? "none" : "auto" }}
                  >
                    {loadingLike === comment.id ? <Spin size="small" /> : <LikeIcon size={12.24} color="#000000A6" />}
                    <Text className="font-yekan text-[#000000A6]">
                      {toPersianDigits(comment.likeCount || 0)}
                    </Text>
                  </Space>
                )}
              </div>

              {comment.attachments?.length > 0 && (
                <div className="flex flex-col gap-2 text-sm text-center bg-gray-100 hover:bg-gray-200 w-fit rounded-xl">
                  {comment.attachments.map((attachment, index) => (
                    <button
                      key={attachment.id || index}
                      onClick={() =>
                        downloadFile(attachment.address, attachment.name || `file-${index + 1}`)
                      }
                      className="flex items-center justify-between gap-10 px-4 py-2 overflow-hidden w-fit"
                      style={{ direction: "ltr" }}
                    >
                      <div className="flex items-center gap-1 text-[1rem]">
                        <span className="block overflow-clip">
                          {attachment.name || "دانلود فایل پیوست"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[1rem] font-medium">فایل پیوست</span>
                        <IconPdf size={24} />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-[10px] items-center justify-between w-full">
                {(comment.mentions || []).map((mention, index) => (
                  <div
                    key={mention.userId ?? index}
                    className="flex bg-[#6969731A] items-center gap-[3px] rounded-xl px-2 py-1"
                  >
                    <p className="text-[16.24px]">@</p>
                    <p className="text-[12.25px] font-bold text-[#333333]">{mention.fullName}</p>
                  </div>
                ))}
              </div>

              {comment.tags?.length > 0 && (
                <div className="flex flex-wrap mt-2 text-[10.5px]">
                  {comment.tags.map((t, index) => (
                    <span key={index} className="px-2 py-1 text-[10.5px]">
                      #{t.tagTitle}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* مودال ثبت نظر */}
      <Modal
        title="ثبت نظر"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="font-yekan"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
             className="mt-2 font-yekan csstom-form"
            label="متن نظر"
            rules={[{ required: true, message: "متن نظر را وارد کنید" }]}
          >
            <TextArea
              className="customtextarea custom-input"
              rows={4}
              placeholder="متن نظر را وارد کنید"
            />
          </Form.Item>

          <Form.Item name="tags" label="تگ‌ها"             rules={[{ required: true, message: "تعیین تگ الزامی است" }]}
>
            <Select
              mode="tags"
              allowClear
              placeholder="تگ ها"
              className="custom-input"
              popupMatchSelectWidth={false}
              value={selected}
              onChange={(vals: string[]) => {
                const cleaned = uniq(vals.map(sanitizeTag)).filter(v => v.length > 0);
                setSelected(cleaned);
                form.setFieldsValue({ tags: cleaned });
              }}
              tokenSeparators={[",", "،", ";", "؛"]}
              maxTagCount="responsive"
              placement="bottomLeft"
            >
              {tag.map((tagItem, index) => (
                <Select.Option key={index} value={tagItem.tagTitle}>
                  {tagItem.tagTitle}
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
            onSearch={(val) => { setMentionSearch(val); onMentionSearch(val); }}
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
            className="font-yekan custom-input mention-select"
          />
        </Form.Item>

             {/* چیپ‌های ذکرشده زیر فیلد */}
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

        {/* آپلود */}
        <Form.Item label={null} className="upload-item" colon={false}>
          <div className="upload-box">
            <span className="upload-label">افزودن فایل</span>
            <Form.Item
              name="file"
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
