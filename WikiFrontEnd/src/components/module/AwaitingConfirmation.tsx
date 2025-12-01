import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Form, Spin, Input, Button, Modal, message } from "antd";
import NotFoundIcon from "../../svgs/NotIcon";
import gregorianToJalali from "../../helpers/createDate";
import { baseUrlForDownload } from "../../configs/api";
import IconPdf from "../../svgs/IconPdf";
import {
  getUnitDocumentationsAwait,
  acceptDocumentation,
} from "../../services/auth";

interface Props {
  id: number;
  unitName: string;
  position: string;
  PositionId: number;
  title?: string;
  isActive: boolean;
  createdDate: string;
  text: string;
  user: {
    fullName: string;
  };
  attachments: {
    id?: number;
    address?: string;
    name?: string;
  }[];
  tags: {
    tagTitle: string;
  }[];
}

const AwaitingConfirmation = () => {
  const [items, setItems] = useState<Props[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);
  const [current, setCurrent] = useState<Props | null>(null);
  const [acceptForm] = Form.useForm();

  // --- گرفتن دیتا و فیلتر کردن فقط isActive == false ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getUnitDocumentationsAwait();

        if (result?.isSuccess && Array.isArray(result.data)) {
          const pending = (result.data as Props[]).filter(
            (d) => d.isActive === false
          );
          setItems(pending);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("❌ خطا در دریافت اطلاعات:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- باز کردن مودال برای یک کارت مشخص ---
  const handleOpenAcceptModal = (item: Props) => {
    setCurrent(item);
    acceptForm.setFieldsValue({
      title: item.title,
      text: item.text,
    });
    setAcceptModalOpen(true);
  };

  // --- ارسال تأیید و ویرایش ---
  const handleAcceptSubmit = async (values: { title?: string; text?: string }) => {
    if (!current) return;

    try {
      setAcceptSubmitting(true);

      const result = await acceptDocumentation({
        documentationId: current.id,
        title: values.title,
        text: values.text,
      });

      if (result?.isSuccess) {
        message.success(result.message || "با موفقیت تأیید شد");

        // بعد از تأیید، این کارت را از لیست حذف کن
        setItems((prev) => prev.filter((x) => x.id !== current.id));

        setAcceptModalOpen(false);
        setCurrent(null);
      } else {
        message.error(result?.message || "خطا در تأیید مستند");
      }
    } catch (error) {
      console.error("❌ خطا در تأیید مستند:", error);
      message.error("خطایی در تأیید مستند رخ داد");
    } finally {
      setAcceptSubmitting(false);
    }
  };

  // --- حالت لودینگ ---
  if (loading) {
    return (
      <div className="flex justify-center items-center mt-[3rem]">
        <Spin />
      </div>
    );
  }

  // --- اگر هیچ کارتی برای تأیید نیست ---
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 mt-[3rem]">
        <NotFoundIcon />
        <p className="text-gray-600">مستندی در انتظار تأیید وجود ندارد</p>
      </div>
    );
  }

  // --- رندر لیست کارت‌ها + دکمه + مودال ---
  return (
    <>
      {items.map((data) => (
        <div
          key={data.id}
          className="grid grid-cols-1 gap-4 mb-6 bg-white mt-[1rem] rounded-xl"
        >
          <div className="flex flex-col p-2 border shadow-sm rounded-xl bg-t-ascend-color/5 bg-t-bg-color">
            {/* هدر کاربر و تاریخ */}
            <div className="flex justify-between mb-2">
              <div className="text-sm flex items-center w-full justify-between">
                <div className="flex items-center gap-1">
                  <UserOutlined className="text-[12.25px] text-[#000000A6]" />
                  <p className="text-[12.25px] text-[#000000A6]">
                    {data.user?.fullName ?? "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[12.5px] ">
                  {data.createdDate
                    ? gregorianToJalali(data.createdDate)
                    : "تاریخی درج نشده"}
                </span>
              </div>
            </div>

            {/* عنوان */}
            <div className="mb-2">
              <span className="font-bold text-[#007041]">{data.title}</span>
            </div>

            {/* سمت و واحد */}
            <div className="flex justify-between">
              <div className="text-sm flex items-center w-full justify-between">
                <div>
                  <p className="text-[13px] text-[#000000A6]">
                    {data.position} _ {data.unitName}
                  </p>
                </div>
              </div>
            </div>

            {/* توضیح */}
            <div>
              <div className="p-2 my-2 rounded-lg bg-gray-50">
                <p className="block text-[12.25px] text-[#000000A6]">
                  توضیح :
                </p>
                <p className="text-[14.5px] text-[#333333] mt-2">
                  {data.text}
                </p>
              </div>
            </div>

            {/* فایل‌های پیوست */}
            {data.attachments.map((atta) =>
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

            {/* تگ‌ها */}
            <div className="flex items-center justify-start mt-3">
              <div className="flex items-center gap-1 flex-wrap">
                {data.tags.map((items, index) => (
                  <div
                    key={index}
                    className="flex items-center text-[11px] text-[#333333] mr-1"
                  >
                    <p className="text-[15px]">#</p>
                    <p className="flex">{items.tagTitle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* دکمه تأیید / ویرایش – همیشه نمایش داده می‌شود */}
            <div className="flex justify-start mt-4">
              <Button
                type="primary"
                onClick={() => handleOpenAcceptModal(data)}
                style={{
                  backgroundColor: "#007041",
                  borderColor: "#007041",
                  color: "#fff",
                }}
              >
                تأیید و ویرایش
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* مودال تأیید + ویرایش */}
      <Modal
        open={acceptModalOpen}
        title="تأیید مستند واحدی"
        onCancel={() => {
          setAcceptModalOpen(false);
          setCurrent(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={acceptForm}
          layout="vertical"
          onFinish={handleAcceptSubmit}
          style={{ direction: "rtl" }}
        >
          <Form.Item
            label="عنوان"
            name="title"
            rules={[{ required: true, message: "لطفاً عنوان را وارد کنید" }]}
          >
            <Input placeholder="عنوان مستند" />
          </Form.Item>

          <Form.Item
            label="متن"
            name="text"
            rules={[{ required: true, message: "لطفاً متن را وارد کنید" }]}
          >
            <Input.TextArea rows={4} placeholder="متن مستند" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setAcceptModalOpen(false);
                setCurrent(null);
              }}
            >
              انصراف
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={acceptSubmitting}
              style={{
                backgroundColor: "#007041",
                borderColor: "#007041",
                color: "#fff",
              }}
            >
              تأیید
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AwaitingConfirmation;
