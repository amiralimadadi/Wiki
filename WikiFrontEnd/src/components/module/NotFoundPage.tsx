import NotFoundIcon from "../../svgs/NotIcon";

function NotFoundPage() {
  return (
    <div className="flex justify-center items-center h-[50%]">
      <div className="flex flex-col items-center">
        <NotFoundIcon />
        <p className="font-yekan text-[14px] text-[#000000A6]">
          داده‌ای موجود نیست
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
