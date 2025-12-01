import React, { useEffect, useState, useRef } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getProfileDataAll } from "../../services/auth";
import CustomIcon from "../../iconSaidbar/CustomIcon";
import RedoIcon from "../../iconSaidbar/RedoIcon";
import PrinterIcon from "../../iconSaidbar/PrinterIcon";

interface UserScore {
  userId: number;
  fullName: string;
  userName: string;
  totalScoreAmount: number;
  currentMedal?: string | null;
}

const toFarsiNumber = (n: string | number) => {
  const numStr = n.toString();
  return numStr.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};

const ScoreTable: React.FC = () => {
  const [data, setData] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(false);

  // state برای کنترل نمایش پنل چک‌باکس
  const [showCheckboxPanel, setShowCheckboxPanel] = useState(false);

  // state برای کنترل ستون‌های فعال (تیک خورده)
  const [visibleColumns, setVisibleColumns] = useState({
    index: true,
    fullName: true,
    userName: true,
    currentMedal: true,
    totalScoreAmount: true,
  });

  const fetchScores = async () => {
    setLoading(true);
    const result = await getProfileDataAll();
    if (result?.isSuccess && Array.isArray(result.data)) {
      setData(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const formatWithCommas = (num: number) => {
    const enStr = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return toFarsiNumber(enStr);
  };

  // تعریف ستون‌ها به شرط دیده شدن آنها
  const columns: ColumnsType<UserScore> = [];

  if (visibleColumns.index) {
    columns.push({
      title: <span className="text-[12px] font-bold">ردیف</span>,
      key: "index",
      render: (_text, _record, index) => <div>{toFarsiNumber(index + 1)}</div>,
      width: 30,
      align: "center",
      className: "compact-column",
    });
  }

  if (visibleColumns.fullName) {
    columns.push({
      title: <span className="text-[12px] font-bold">نام</span>,
      dataIndex: "fullName",
      key: "fullName",
      width: 10,
      className: "compact-column",
    });
  }

  if (visibleColumns.userName) {
    columns.push({
      title: <span className="text-[12px] font-bold">نام کاربری</span>,
      dataIndex: "userName",
      key: "userName",
      width: 180,
    });
  }

  if (visibleColumns.currentMedal) {
    columns.push({
      title: <span className="text-[12px] font-bold">سطح</span>,
      dataIndex: "currentMedal",
      key: "currentMedal",
      width: 60,
      align: "center",
      render: (value) => <span>{value ? value : "بدون مدال"}</span>,
    });
  }

  if (visibleColumns.totalScoreAmount) {
    columns.push({
      title: <span className="text-[12px] font-bold">امتیاز</span>,
      dataIndex: "totalScoreAmount",
      key: "totalScoreAmount",
      width: 60,
      align: "center",
      render: (value) => {
        const roundedValue = Math.round(value);
        return (
          <span>
            {roundedValue === 0
              ? toFarsiNumber("0")
              : formatWithCommas(roundedValue)}
          </span>
        );
      },
    });
  }

  const handlePrint = () => {
    const printContent = document.getElementById("print-area");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>چاپ جدول</title>
          <style>
            body {
              font-family: "Vazirmatn", sans-serif;
              padding: 20px;
              direction: rtl;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 12px;
            }
            th, td {
              padding: 8px;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f5f5f5;
            }
            tr:hover {
              background-color: #e8f4ff;
            }
            th {
              background-color: #e0e0e0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // رفرنس برای کنترل خارج کلیک روی پنل
  const panelRef = useRef<HTMLDivElement>(null);

  // بسته شدن پنل هنگام کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowCheckboxPanel(false);
      }
    };
    if (showCheckboxPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCheckboxPanel]);

  // هندلر تغییر چک‌باکس‌ها
  const handleCheckboxChange = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="score-wrapper  max-w-full mx-auto mr-[10rem] relative">
      <div className="score-header flex flex-col md:flex-row justify-between items-center mb-4 px-2 md:px-0">
        <div className="left-buttons flex flex-col gap-5 relative">
          <h2 className="score-title text-[21px] text-[#007041]">امتیازها</h2>

          <div
            className="flex items-center gap-1 bg-[#E5E5E5] rounded-xl justify-center w-[130px] cursor-pointer select-none relative"
            onMouseEnter={() => setShowCheckboxPanel(true)}
            onMouseLeave={() => setShowCheckboxPanel(false)}
          >
            <CustomIcon size={10.49} color="#575759" />
            <button
              className="text-[10.49px] font-bold text-[#575759] outline-none"
              onClick={() => setShowCheckboxPanel((prev) => !prev)}
              type="button"
            >
              تغییر ستون ها
            </button>

            {/* پنل چک‌باکس ها */}
            {showCheckboxPanel && (
              <div
                ref={panelRef}
                className="absolute top-full right-0 mt-1 w-fit bg-white border border-gray-300 rounded-md shadow-lg z-50 p-3"
                onMouseEnter={() => setShowCheckboxPanel(true)}
                onMouseLeave={() => setShowCheckboxPanel(false)}
              >
                {[
                  { key: "index", label: "ردیف" },
                  { key: "fullName", label: "نام" },
                  { key: "userName", label: "نام کاربری" },
                  { key: "currentMedal", label: "سطح" },
                  { key: "totalScoreAmount", label: "امتیاز" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 mb-1 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={
                        visibleColumns[key as keyof typeof visibleColumns]
                      }
                      onChange={() =>
                        handleCheckboxChange(key as keyof typeof visibleColumns)
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 bg-green-500 transition "
                    />
                    <span className="text-[13px]">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex items-center gap-1 font-bold text-[#575759] text-[10.49px] cursor-pointer select-none">
            <RedoIcon />
            <button onClick={fetchScores}>به‌روزرسانی</button>
          </div>
          <div className="flex items-center gap-1 font-bold text-[#575759] text-[10.49px] cursor-pointer select-none">
            <PrinterIcon />
            <button onClick={handlePrint}>پرینت</button>
          </div>
        </div>
      </div>

      <div id="print-area" className="overflow-x-auto">
        <Table
          className="score-table custom-score-table"
          columns={columns}
          dataSource={data}
          rowKey="userId"
          pagination={false}
          loading={loading}
          bordered={false}
          scroll={{ x: 600 }}
        />
      </div>
    </div>
  );
};

export default ScoreTable;
