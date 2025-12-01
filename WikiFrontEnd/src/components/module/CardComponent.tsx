import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { getMyDocumentations } from "../../services/auth";
import NotFoundIcon from "../../svgs/NotIcon";
import gregorianToJalali from "../../helpers/createDate";
import { baseUrlForDownload } from "../../configs/api";
import IconPdf from "../../svgs/IconPdf";


interface Props {
  unitName: string;
  position: string;
  PositionId: number;
  title?: string;
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

const MiniCardComponent = () => {
  const [data, setData] = useState<Props | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMyDocumentations();
        console.log(result);

        if (result.isSuccess && result.data.length > 0) {
          setData(result.data[0]);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("❌ خطا در دریافت اطلاعات:", error);
        setData(null);
      }
    };

    fetchData();
  }, []);



  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 mt-[3rem]">
        <NotFoundIcon />
        <p className="text-gray-600">داده ای موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 bg-white mt-[1rem] rounded-xl">
      <div className="flex flex-col p-2 border shadow-sm rounded-xl bg-t-ascend-color/5 bg-t-bg-color">
        <div>
          {/* دسته و تاریخ */}
      
             <div className="flex justify-between mb-2">
          <div className="text-sm flex items-center w-full justify-between">
            <div className="flex items-center gap-1">
              <UserOutlined className="text-[12.25px] text-[#000000A6]" />
              <p className="text-[12.25px] text-[#000000A6]">
                {data.user.fullName}
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

    
    
<div className="flex justify-between">
          <div className="text-sm flex items-center w-full justify-between">
            <div>
              <p className="text-[13px] text-[#000000A6]">
                {data.position} _ {data.unitName}
              </p>
            </div>
          </div>
        </div>


          {/* توضیح یا چکیده */}
          <div className="p-2 my-2 rounded-lg bg-gray-50">
            <p className="block text-[12.25px] text-[#000000A6]">توضیح :</p>
            <p className="text-[14px] text-[#333333]">
              {data.text || "توضیحاتی درج نشده"}
            </p>
          </div>
        </div>

         {/* فایل پیوست */}
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
          <div className="flex items-center gap-1">
            {data.tags.map((items, index) => (
              <div className="flex items-center text-[11px] text-[#333333]">
                <p className="text-[15px]">#</p>
                <p key={index} className="flex">
                  {items.tagTitle}
                </p>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default MiniCardComponent;
