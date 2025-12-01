import React, { useState } from "react";
import { Modal, Typography, Space, Button } from "antd";
import UserIcon from "../../svgs/UserIcon";
import { confirmKnowledgeContent } from "../../services/auth";
import toast, { Toaster } from "react-hot-toast";
// import { toPersianDigits } from "../../utils/persianNu";
import StarIcon from "../../svgs/StarIcon";
import gregorianToJalali from "../../helpers/createDate";
const { Title, Text, Paragraph } = Typography;

interface Articles {
  id: number;
  title: string;
  goalTitle: string;
  user: {
    fullName: string;
  };
  createdDate: string;
  abstract: string;
  text: string;
  tags: { tagTitle: string }[];
}

interface PainPointModalProps {
  open: boolean;
  onClose: () => void;
  article: Articles | null;
  onSuccess: (confirmedId: number) => void;
}

const PainPointModal: React.FC<PainPointModalProps> = ({
  open,
  onClose,
  article,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!article) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const response = await confirmKnowledgeContent(article.id);
      console.log("در حال ارسال ID برای تایید:", article?.id);

      if (response?.isSuccess) {
        toast.success("محتوا با موفقیت تایید شد.");
        onSuccess(article.id);
        onClose();
      } else {
        toast.error("تایید محتوا با خطا مواجه شد.");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  // const formatDateToPersian = (dateStr: string) => {
  //   if (!dateStr) return "";
  //   const date = new Date(dateStr);

  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //   const day = date.getDate().toString().padStart(2, "0");

  //   const formatted = `${year}/${month}/${day}`;
  //   return toPersianDigits(formatted);
  // };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={521}
      className="font-yekan"
    >
      <Title
        level={5}
        className="font-yekan border-b-[1px] p-2 text-right text-[16px] text-[#333333]"
      >
        {article.title}
      </Title>

      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Text
              className="font-yekan text-[12.25px]"
              style={{ fontSize: 11 }}
            >
              {article.goalTitle}
            </Text>
          </div>
          <Text className="font-yekan" style={{ fontSize: 14, color: "#666" }}>
            {gregorianToJalali(article.createdDate)}
          </Text>
        </div>
        <p className="text-[#007041] text-[14px] font-bold">{article.title}</p>

        <Text
          className="font-yekan font-semibold"
          style={{ fontSize: 16, color: "#007041" }}
        >
          {article.goalTitle}
        </Text>

        <div className="flex w-full items-center justify-between">
          <div className="flex  items-center gap-1">
            <UserIcon size={10.49} />
            <p className="text-gray-500 text-[11px]">{article.user.fullName}</p>
          </div>
          <div className="flex  items-center gap-1">
            <StarIcon size={10.49} />
            <p className="text-gray-500 text-[11px]">ساختار یافته</p>
          </div>
        </div>

        <div
          style={{
            background: "#F7F7F8",
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
          }}
        >
          {article.abstract && (
            <>
              <Text
                className="font-yekan"
                style={{
                  fontSize: 13,
                  color: "#333",
                  fontWeight: "600",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                چکیده:
              </Text>
              <Paragraph
                className="font-yekan"
                style={{ fontSize: 14, color: "#333", marginBottom: 12 }}
              >
                {article.abstract}
              </Paragraph>
            </>
          )}

          <Text
            className="font-yekan font-semibold"
            style={{ fontSize: 14, marginBottom: 6, display: "block" }}
          >
            متن:
          </Text>
          <Paragraph
            className="font-yekan"
            style={{ fontSize: 14, color: "#333", marginBottom: 0 }}
          >
            {article.text}
          </Paragraph>
        </div>

        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag.tagTitle} className="rounded text-xs font-yekan">
              #{tag.tagTitle}
            </span>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button className="w-[153px]" onClick={onClose}>
            بازگشت
          </Button>
          <Button
            type="primary"
            className="bg-[#007041] w-[153px] no-hover-effect"
            loading={loading}
            onClick={handleConfirm}
          >
            تایید محتوا دانشی
          </Button>
        </div>
      </Space>
      <Toaster position="bottom-right" />
    </Modal>
  );
};

export default PainPointModal;
