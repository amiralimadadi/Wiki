import { useEffect, useState } from "react";
import { getNotif } from "../services/auth";
import { Modal } from "antd";

type Notification = {
  title: string;
  description: string;
  seen: boolean;
};

const NotificationsPopover = () => {
  const [notifdata, setNotifData] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getNotification = async () => {
      try {
        const response = await getNotif();
        if (response.data) {
          setNotifData(response.data);
        }
      } catch (error) {
        console.error("خطا در گرفتن منو:", error);
      }
    };
    getNotification();
  }, []);

  const handleNotificationClick = (index: number) => {
    // باز کردن مودال
    setSelectedNotif(notifdata[index]);
    setIsModalOpen(true);

    // علامت گذاری به عنوان دیده شده
    setNotifData((prev) =>
      prev.map((notif, i) => (i === index ? { ...notif, seen: true } : notif))
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNotif(null);
  };

  return (
    <div className="font-yekan text-sm text-gray-700 pr-2 w-[250px] max-h-[400px] overflow-y-auto space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[#333333] font-bold text-[17px]">اعلان ها</p>
        <p className="text-blue-500 text-[13px] cursor-pointer">بستن همه</p>
      </div>
      <ul className="list-inside flex flex-col gap-4 transition-all duration-200 list-none text-xs *:text-[#333333] space-y-1">
        {notifdata.map((item, index) => (
          <div
            key={index}
            onClick={() => handleNotificationClick(index)}
            className="flex flex-col items-start hover:bg-gray-200 cursor-pointer transition-all duration-200 relative"
          >
            {!item.seen && (
              <span className="absolute top-2 left-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            )}
            <li className="text-[#333333] font-bold text-[13px]">
              {item.title}
            </li>
            <li className="description text-[11px] text-right leading-5 w-[200px]">
              {item.description}
            </li>
          </div>
        ))}
      </ul>

      {/* مودال آنت دیزاین */}
      <Modal
        className="font-yekan"
        title={"جزئیات اعلان"}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        {selectedNotif && (
          <div>
            <p className="text-[12.25px] text-[#000000A6]">عنوان:</p>
            <p className="text-[14px] text-[#2d2929a6] font-semibold">
              {selectedNotif.title}
            </p>
            <p className="text-[14px] text-[#151313a6] font-semibold">
              {selectedNotif.description}
            </p>
            <div className="flex justify-end mt-[2rem] font-yekan">
              <a href="https://igt.tipax.ir/home" target="_blank">
                <button className="w-[245px] h-[36px] rounded-lg bg-[#007041] text-white">
                  نمایش ویکی - تمام محتوای دانشی
                </button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationsPopover;
