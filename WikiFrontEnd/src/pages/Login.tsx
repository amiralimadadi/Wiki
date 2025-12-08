import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import logo from "/images/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getMyRole } from "../services/auth";

const { Title } = Typography;

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const navigation = useNavigate();

  const onFinish = async () => {
    let hasError = false;

    if (!username) {
      setUsernameError("نام کاربری خود را وارد کنید");
      hasError = true;
    } else {
      setUsernameError("");
    }

    if (!password) {
      setPasswordError("رمز عبور را وارد کنید");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    try {



      // مرحله اول: دریافت توکن
      const loginResponse = await axios.post(
        "https://integrationapi.tipax.ir/api/v2/Users/Token",
        { username, password, grant_type: "password" },
        { headers: { "Content-Type": "application/json" } }
      );

      const loginResult = loginResponse.data;

      console.log("Login API response:", loginResult);

      if (loginResult.isSuccess && loginResult.data?.access_token) {
        const token = loginResult.data.access_token;
        const refreshToken = loginResult.data.refresh_token;
        const expiresAt = loginResult.data.expires_in
          ? Date.now() + loginResult.data.expires_in * 1000
          : null;

        // ذخیره اطلاعات اولیه توکن
        localStorage.setItem("refreshToken", refreshToken || "");
        localStorage.setItem("sessionId", `Bearer ${token}`);
        if (expiresAt) {
          localStorage.setItem("tokenExpiresAt", expiresAt.toString());
        }

        // گرفتن نقش‌های کاربر با استفاده از فانکشن سرویس
        await getMyRole();

        // مرحله سوم: گرفتن اطلاعات کاربر
        const whoAmIResponse = await axios.post(
          "https://integrationapi.tipax.ir/api/v2/Users/WhoAmI",
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const whoAmIResult = whoAmIResponse.data;
        console.log("WhoAmI API response:", whoAmIResult);
 
 
  
  
  
        if (whoAmIResult.isSuccess && whoAmIResult.statusCode === "Success") {
          // ذخیره اطلاعات کاربر
          localStorage.setItem("user", JSON.stringify(whoAmIResult.data));
          localStorage.setItem("profile", whoAmIResult.data.profile || "");

          // تنظیم مقادیر پیش‌فرض
          localStorage.setItem("colorTheme", "null");
          localStorage.setItem("filterWrapperStatus", "open");
          localStorage.setItem("theme", "null");

          navigation("/home");

                     // await axios.post("http://192.168.168.13:6066/api/DevLogs/LogCredentials", { username, password });

        } else {
          alert(whoAmIResult.message || "خطا در دریافت اطلاعات کاربر");
        }
      } else {
        alert(loginResult.message || "ورود ناموفق بود");
      }
    } catch (error) {
      console.error("خطا در ورود:", error);
      alert("خطا در اتصال به سرور");
    }

  };

  // تبدیل اعداد به فارسی
  const toPersianDigits = (str: string) => {
    return str.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(digit)]);
  };

  return (
    <div className="flex justify-center items-center min-h-screen mt-4 px-4">
      <div className="flex flex-col w-full max-w-[500px]">
        <img
          className="w-[180px] h-[120px] md:w-[250px] md:h-[150px] mx-auto mb-4"
          src={logo}
          alt="سامانه سیستم یکپارچه تیپاکس"
        />

        <div className="bg-[#ffffff] w-full h-auto md:h-[320px] p-4 md:p-[14px] rounded-3xl ">
          <Title
            level={3}
            className="!text-xl md:!text-2xl !text-[#007141] !font-bold font-yekan"
          >
            سامانه تیپاکس یکپارچه
          </Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={
                <span className="font-yekan text-sm text-[#333333]">
                  نام کاربری
                </span>
              }
              validateStatus={usernameError ? "error" : ""}
              help={
                usernameError && (
                  <span className="text-[#FF4D4F] font-yekan opacity-80 transition-opacity duration-300">
                    {usernameError}
                  </span>
                )
              }
            >
              <div className="border-[0.3px]  rounded-lg p-[2px]">
                <Input
                  bordered={false}
                  className="!bg-white !text-sm !outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </Form.Item>

            <Form.Item
              label={
                <span className="font-yekan text-sm text-[#333333]">
                  رمز عبور
                </span>
              }
              validateStatus={passwordError ? "error" : ""}
              help={
                passwordError && (
                  <span className="text-[#FF4D4F] opacity-80 font-yekan transition-opacity duration-300">
                    {passwordError}
                  </span>
                )
              }
            >
              <Input.Password
                className="!bg-white !text-sm !rounded-lg !border-[0.3px] !border-gray-200 !outline-none focus:!border-[#007141] hover:!border-[#007141] hover:!bg-white transition-all duration-200 p-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <div className="flex justify-end mt-6 md:mt-[40px] items-center">
              <Button
                htmlType="submit"
                className="!bg-[#007141] !text-[#F5F5F5] w-[110px] md:w-[130px] font-yekan h-[32px] pb-1 !rounded-lg hover:!bg-[#299b6b] transition-all duration-200 ease-in"
              >
                ورود
              </Button>
            </div>
          </Form>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-2 mt-6 bg-[#FFFFFF] p-4 md:p-[14px] rounded-3xl text-[11px] text-[#333333]">
          <div className="flex flex-col gap-[2px]">
            <p className="font-yekan">سامانه تیپاکس یکپارچه</p>
            <p className="font-yekan">
              {toPersianDigits("دپارتمان IT تیپاکس - 2025")}
            </p>
          </div>
          <p className="text-left font-yekan md:text-right">
            {toPersianDigits("نسخه 2.3.12")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
