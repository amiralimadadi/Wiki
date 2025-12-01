import React, { useEffect, useState, type JSX } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  AutoComplete,
  Popover,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { Tag, User } from "../../forms/CreateKnowledgeContent";
import {
  CreateAnswer,
  getTagSelecteddAll,
  searchFormName,
} from "../../services/auth";
import toast, { Toaster } from "react-hot-toast";

const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  questionId: number;
}

const CommentFormModal: React.FC<Props> = ({ open, onClose, questionId }) => {
  const [form] = Form.useForm();
  const [mentionOptions, setMentionOptions] = useState<
    { value: string; label: JSX.Element }[]
  >([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [mentionLoading, setMentionLoading] = useState<boolean>(false);
  const [mentions, setMentions] = useState<{ id: number; fullName: string }[]>(
    []
  );
  const [mentionInput, setMentionInput] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const handleSubmit = async (values) => {
    const trimmedText = values.text?.trim();

    if (!trimmedText) {
      toast.error("متن سوال نباید فقط فاصله باشد");
      return;
    }

    if (!values.tags || values.tags.length === 0) {
      toast.error("حداقل یک تگ را انتخاب کنید");
      return;
    }

    try {
      const result = await CreateAnswer({
        answerText: trimmedText,
        userId: user.id,
        questionId: questionId,
        mentionUserId: mentions.map((m) => m.id),
        tags: values.tags,
        answerAttachments: selectedFiles,
      });

      console.log("📤 Payload نهایی برای ارسال:", {
        commentText: trimmedText,
        userId: user.id,
        knowledgeContentId: questionId,
        mentionUserIds: mentions.map((m) => m.id),
        tags: values.tags,
        commentAttachments: selectedFiles,
      });

      if (result?.isSuccess) {
        toast.success("عملیات با موفقیت انجام شد");
        form.resetFields();
        setMentions([]);
        setSelectedFiles([]);
        setMentionInput("");
        onClose();
      } else {
        toast.error(result?.message || "خطایی رخ داده است");
      }
    } catch (error) {
      toast.error("ارسال با خطا مواجه شد");
      console.error("خطا در ارسال پرسش: ", error);
    }
  };

  const onMentionSearch = async (text: string) => {
    if (!text) return setMentionOptions([]);
    setMentionLoading(true);
    const users = await searchUsers(text);
    setMentionOptions(
      users.slice(1, 2).map((u) => ({
        value: JSON.stringify(u),
        label: (
          <div className="font-yekan">
            <div>
              <b>{u.fullName}</b>
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{u.email}</div>
          </div>
        ),
      }))
    );
    setMentionLoading(false);
  };

  const normalizePersian = (text: string): string =>
    text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();

  const searchUsers = async (text: string): Promise<User[]> => {
    try {
      const data = await searchFormName(text);
      const normalizedSearch = normalizePersian(text);
      return (data || []).filter((user: User) =>
        [user.fullName, user.userName, user.email, user.mobileNumber].some(
          (field) => normalizePersian(field || "").includes(normalizedSearch)
        )
      );
    } catch {
      return [];
    }
  };

  const onMentionSelect = (value: string) => {
    try {
      const user = JSON.parse(value);
      setMentionInput(`${user.fullName} - ${user.email}`);
      form.setFieldValue("mention", `${user.fullName} - ${user.email}`);

      setMentions((prev) => {
        if (prev.find((m) => m.id === user.id)) return prev;
        return [...prev, { id: user.id, fullName: user.fullName }];
      });
    } catch {
      setMentionInput(value);
      form.setFieldValue("mention", null);
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      const res = await getTagSelecteddAll();
      if (res?.data) setTags(res.data);
    };
    fetchTags();
  }, []);

  return (
    <>
      <Toaster position="bottom-right" />
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        title="ثبت نظر"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="عنوان سوال"
            rules={[{ required: true, message: "عنوان سوال را وارد کنید" }]}
          >
            <Input
              placeholder="عنوان سوال را وارد کنید"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="text"
            label="متن سوال"
            rules={[{ required: true, message: "متن سوال را وارد کنید" }]}
          >
            <TextArea
              rows={4}
              placeholder="متن سوال را وارد کنید"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="تگ‌ها"
            rules={[
              { required: true, message: "لطفا حداقل یک تگ انتخاب کنید" },
            ]}
          >
            <Select
              className="custom-input"
              mode="multiple"
              allowClear
              placeholder="تگ‌ها"
            >
              {tags.map((tag, i) => (
                <Select.Option key={i} value={tag.tagTitle}>
                  {tag.tagTitle}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="ارجاع (Mention)" name="mention">
            <AutoComplete
              allowClear
              className="custom-input"
              options={mentionOptions}
              style={{ width: "100%" }}
              onSearch={onMentionSearch}
              onSelect={onMentionSelect}
              value={mentionInput}
              onChange={setMentionInput}
              placeholder="نام فرد را وارد کنید"
              notFoundContent={mentionLoading ? "در حال جستجو..." : "یافت نشد"}
            />
          </Form.Item>

          <div className="mt-2 flex flex-wrap gap-2">
            {mentions.map((mention) => {
              const isPopoverVisible = deletingId === mention.id;
              return (
                <div
                  key={mention.id}
                  className="flex items-center gap-1 bg-gray-100 rounded px-3 py-1 text-sm"
                >
                  <span>{mention.fullName}</span>
                  <Popover
                    content={
                      <div className="flex flex-col items-center gap-2 p-2">
                        <div className="flex items-center gap-1 text-yellow-600">
                          <ExclamationCircleOutlined color="#000000" />
                          <span className="text-black">این مورد حذف شود؟</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            onClick={() => setDeletingId(null)}
                          >
                            لغو
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            style={{ backgroundColor: "#007041" }}
                            danger
                            onClick={() => {
                              setMentions((prev) =>
                                prev.filter((m) => m.id !== mention.id)
                              );
                              setDeletingId(null);
                            }}
                          >
                            تایید
                          </Button>
                        </div>
                      </div>
                    }
                    trigger="click"
                    visible={isPopoverVisible}
                    onVisibleChange={(visible) => {
                      if (visible) setDeletingId(mention.id);
                      else setDeletingId(null);
                    }}
                    placement="top"
                  >
                    <Button
                      size="small"
                      type="text"
                      icon={<DeleteOutlined style={{ color: "red" }} />}
                      onClick={() => setDeletingId(mention.id)}
                    />
                  </Popover>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center w-full mb-2">
            <label className="text-[14px] font-medium">افزودن فایل</label>
            <Upload beforeUpload={() => false} multiple showUploadList={false}>
              <Button icon={<UploadOutlined />}>انتخاب فایل</Button>
            </Upload>
          </div>

          <Form.Item
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              const files = e?.fileList || [];
              const realFiles = files
                .map((fileWrapper) => fileWrapper.originFileObj)
                .filter(Boolean);
              setSelectedFiles(realFiles);
              return files;
            }}
          ></Form.Item>

          <div className="flex justify-end gap-4 mt-6">
            <Button className="w-[129.99px]" onClick={onClose}>
              بازگشت
            </Button>
            <Button
              className="w-[129.99px] custom-btn bg-[#005041]"
              type="primary"
              htmlType="submit"
            >
              ثبت
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CommentFormModal;
