import { useRef } from "react";
import type { Articles } from "../types/Interfaces";
import gregorianToJalali from "../helpers/createDate";

interface Props {
  article: Articles;
}
const PrintPage: React.FC<Props> = ({ article }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;

      const printWindow = window.open("", "_blank", "width=1000,height=800");
      if (!printWindow) {
        alert("پنجره پاپ‌آپ باز نشد. اجازه‌ی باز شدن پاپ‌آپ را بدهید.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <meta charset="utf-8" />
          <title>چاپ جدول</title>
          <style>
            body {
              font-family: BYekan, sans-serif;
              direction: rtl;
              padding: 20px;
              background: white;
              color: black;
            }

            * {
              box-sizing: border-box;
            }

            table, td, th {
              border: 1px solid #333;
              border-collapse: collapse;
              padding: 8px;
              text-align: center;
            }

            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .text-center { text-align: center; }

            img {
              max-width: 100px;
              height: auto;
            }

            .font-yekan {
              font-family: BYekan, sans-serif;
            }

            .border {
              border: 1px solid #666;
            }

            .border-b {
              border-bottom: 1px solid #666;
            }

            .border-l {
              border-left: 1px solid #666;
            }

            .p-2 { padding: 0.5rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }

            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .font-bold { font-weight: bold; }

            .leading-loose { line-height: 2; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <>
      <div
        style={{ fontFamily: "BYekan" }}
        className="bg-white p-4  rounded-3xl flex items-center justify-between"
      >
        <span className="text-[15.75px] text-[#333333] font-yekan font-bold">
          {article.title}
        </span>
        <button
          onClick={handlePrint}
          className="bg-[#007041] hover:bg-[#1f8259] w-[130px] p-1 cursor-pointer rounded-xl text-white"
        >
          پرینت
        </button>
      </div>

      <div
        ref={printRef}
        className="mt-6 border-[1px] border-gray-600 bg-white text-sm sm:text-base"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row border-b border-gray-600">
          <div className="w-full sm:w-2/12 p-2 flex justify-center items-center border-b sm:border-b-0">
            <img
              src="/images/logotabale.jpg"
              className="object-contain w-[100px] h-auto"
              alt="لوگو"
            />
          </div>
          <div className="w-full sm:w-8/12 flex items-center font-yekan justify-center text-base font-bold border-t sm:border-t-0 sm:border-x border-gray-600 py-2 text-center">
            فرم سند ساختاریافته
          </div>
          <div className="w-full sm:w-2/12 flex flex-col items-center justify-center text-xs border-t sm:border-t-0 py-2">
            <span className="font-yekan">تاریخ ثبت :</span>
            <span className="font-yekan">{gregorianToJalali(article.createdDate)}</span>

          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col sm:flex-row border-b border-gray-600 text-center">
          <div className="w-full sm:w-10/12 px-2 py-4 font-bold text-[15.75px] border-b sm:border-b-0 sm:border-l border-gray-600">
            {article.title}
          </div>
          <div className="w-full sm:w-2/12 py-4"> {article.user.fullName}</div>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row border-b border-gray-600 text-center">
          <div className="w-full sm:w-2/12 py-3 border-b sm:border-b-0 sm:border-l border-gray-600 text-[13px] font-semibold">
            چکیده
          </div >
          <div className="w-full py-3 text-[13px] leading-relaxed">
            {article.abstract}
          </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-col sm:flex-row border-b border-gray-600 text-center">
          <div className="w-full sm:w-2/12 py-3 border-b sm:border-b-0 sm:border-l border-gray-600 text-[13px] font-semibold">
            کلیدواژه
          </div>
     <div className="w-full py-3 text-[13px] leading-relaxed flex flex-wrap justify-center items-center gap-2">
    {article.tags?.length ? (
      article.tags.map((tag, i) => (
        <span
          key={i}
          className="px-2 py-[2px] bg-gray-100 border border-gray-300 rounded-md "
        >
          {tag.tagTitle}
        </span>
      ))
    ) : (
      <span className="text-gray-400">—</span>
    )}
  </div>
        </div>

        {/* Content */}
        <div className="flex flex-col sm:flex-row border-b border-gray-600">
          <div className="w-full sm:w-2/12 py-3 border-b sm:border-b-0 sm:border-l border-gray-600 flex flex-col items-center">
            <span className="text-sm">محتوای اصلی</span>
            <span className="text-sm">(متن)</span>
          </div>
          <div className="w-full text-justify p-2 font-yekan text-sm leading-loose">
            {article.text}
          </div>
        </div>

        {/* Resources */}
        <div className="flex flex-col sm:flex-row border-b border-gray-600 text-center">
          <div className="w-full sm:w-2/12 py-3 border-b sm:border-b-0 sm:border-l border-gray-600">
            منابع
          </div>
          <div className="w-full py-3">{article.references}</div>
        </div>

        {/* Knowledge Tree */}
        <div className="flex flex-col sm:flex-row text-center">
          <div className="w-full sm:w-2/12 py-3 border-b sm:border-b-0 sm:border-l border-gray-600">
            درخت دانش
          </div>
          <div className="w-full py-3">{article.goalTitle || "ندارد"}</div>
        </div>
      </div>
    </>
  );
};

export default PrintPage;
