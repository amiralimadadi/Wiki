import { useEffect, useState } from "react";
import { Row, Col } from "antd";
import logo2 from "/images/logo2.png";
import icon from "/images/icon.png";
import { Link, useNavigate } from "react-router-dom";
import { Popover } from "antd";
import { toPersianDigits } from "../../../src/utils/persianNu";
import NavTabs from "../common/NavTabs";
import NotificationsPopover from "../../data/dataFake";
import { getTabs } from "../common/TabsData";
import ProfilePopoverContent from "../common/ProfilePopoverContent";
// getProfilePicture
import { getNotif, getAdminListByUserId } from "../../services/auth";

import CustomIconNotif from "../../svgs/CustomIconNotif";

function Header() {
  type TabKey = ReturnType<typeof getTabs>[number]["key"];
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<TabKey>("knowledgeContent");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [accessList, setAccessList] = useState<string[]>([]);

  const tabs = getTabs(activeKey, accessList);


  let userDetailse = null;
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      userDetailse = JSON.parse(userString);
    }
  } catch (error) {
    console.error("خطا در پارس کردن اطلاعات کاربر از localStorage:", error);
    userDetailse = null;
  }
  const userId = userDetailse?.id;
  useEffect(() => {
    const fetchAccessList = async () => {
      try {
        if (!userId) return;
        const res = await getAdminListByUserId(userId);
        // { isSuccess: true, data: ["Project", "Proposal", "Wiki", ...] }
        if (res?.isSuccess && Array.isArray(res.data)) {
          setAccessList(res.data);
        }
      } catch (error) {
        console.error("خطا در گرفتن دسترسی ادمین:", error);
      }
    };

    fetchAccessList();
  }, [userId]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     const token = localStorage.getItem("sessionId");
  //     const user = JSON.parse(localStorage.getItem("user") || "{}");

  //     if (!token || !user.personId) {
  //       console.warn("توکن یا personId موجود نیست");
  //       return;
  //     }

  //     const requestData = { personId: user.personId };

  //     try {
  //       const response = await getProfilePicture(token, requestData);
  //       const pictures = response?.data || [];

  //       if (pictures.length > 0) {
  //         const latestPicPath = pictures[0].path;
  //         setProfilePicUrl(`https://integrationapi.tipax.ir${latestPicPath}`);
  //       }
  //     } catch (err) {
  //       console.error("خطا در دریافت عکس پروفایل:", err);
  //     }
  //   };

  //   fetch();
  // }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotif();
        if (response.data && Array.isArray(response.data)) {
          // تعداد نوتیفیکیشن‌های خوانده نشده (seen === false)
          const unread = response.data.filter(
            (item) => item.seen === false
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("خطا در گرفتن نوتیفیکیشن‌ها:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleClick = (key: string, path?: string) => {
    setActiveKey(key);
    if (path) {
      navigate(`/${path}`);
    } else {
      navigate(`/${key}`);
    }
  };

  return (
    <div className="bg-white max-w-[1800px] w-full md:w-full h-[67px] rounded-2xl p-3">
      <Row align="middle" gutter={24} className="h-full">
        <Col>
          <Link to="/knowledgeContent">
            <img
              src={logo2}
              alt="tipax logo"
              className="w-[99px] h-8 object-contain"
            />
          </Link>
        </Col>

        <Col>
          <a
            href="https://igt.tipax.ir/home"
            className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            <img src={icon} alt="icon" className="h-[23px] object-contain" />
            <p className="font-yekan text-[17.5px] font-bold m-0">خانه</p>
          </a>
        </Col>

        <Col flex="auto">
          <Row justify="space-between" align="middle" className="h-full ">
            <Col>
              <NavTabs
                activeKey={activeKey}
                tabs={tabs}
                onClick={handleClick}
              />
            </Col>

            <Col className="flex items-center">
              <div className="flex items-center ml-1">
                <Popover
                  content={<NotificationsPopover />}
                  trigger="hover"
                  placement="bottomRight"
                  arrow={false}
                  align={{
                    offset: [120, 0],
                  }}
                >
                  {/* تعداد نوتیف */}
                  <div className="relative cursor-pointer hover:bg-gray-200 transition-all duration-200 px-3 p-3 rounded-lg">
                    <CustomIconNotif color="#000000A6" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 left-9 bg-[#FF4D4F] w-[25px] h-5 font-bold text-white rounded-xl flex justify-center items-center text-[12px]">
                        {toPersianDigits(unreadCount.toString())}
                      </div>
                    )}
                  </div>
                </Popover>
              </div>

              <Popover
                content={<ProfilePopoverContent />}
                trigger="hover"
                placement="bottomRight"
                arrow={false}
                overlayClassName="custom-popover"
                align={{
                  offset: [50, 0],
                }}
              >
                <section className="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-100 rounded-md transition">
                  {/* <img
                    className="w-[32px] h-[25px] object-cover rounded-lg"
                    src={profilePicUrl || "/images/profille.jpg"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/profille.jpg";
                    }}
                    alt="pic profile"
                  /> */}

                  <div className="flex flex-col text-right font-yekan mr-2">
                    <p className="m-0 font-bold text-[#333333] text-[12px]">
                      {userDetailse?.fullName || "نام ثبت نشده"}
                    </p>
                    <p className="m-0 text-[#333333] text-[10px]">
                      {userDetailse?.userName || "نام کاربری ثبت نشده"}
                    </p>
                  </div>
                </section>
              </Popover>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
