import { useEffect, useState } from "react";
import { toPersianDigits } from "../../utils/persianNu";
import { UserOutlined } from "@ant-design/icons";
import type { BestUsers } from "../../types/Interfaces";
import { getBestUsers } from "../../services/auth";

const BestUsers: React.FC = () => {
  const [data, setData] = useState<BestUsers[]>([]);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      try {
        const response = await getBestUsers();
        if (!response?.data) {
          throw new Error("مشکل در دریافت لیست افراد برتر");
        }
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, []);

  return (
    <>
      {data.map((item) => (
        <div key={item.userId} className="mb-4 font-yekan">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-[15px] text-[#333333]" />
            <p className="text-[14px] text-[#333333] font-yekan font-semibold">
              {item.fullName}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-[12.25px] text-[#333333]">سطح</p>
            <p className="flex-1 border-b border-dashed mx-2 border-gray-400 text-[#33333333]"></p>
            <p className="text-[12.25px] text-[#333333]">{item.currentMedal}</p>
          </div>
          <div className="flex items-center mt-2">
            <p className="text-[12.25px] text-[#333333]">امتیاز</p>
            <p className="flex-1 border-b border-dashed mx-2 border-gray-400 text-[#33333333]"></p>
            <p className="text-[12.25px] text-[#333333]">
              {toPersianDigits(item.totalScoreAmount ?? 0)}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default BestUsers;
