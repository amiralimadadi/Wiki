import React, { useEffect,  useState } from "react";
import { Modal, Form, Select, Button, Typography } from "antd";
import { addUserToExpert, fetchCategorys, searchFormName } from "../../services/auth";

const { Title } = Typography;

// —————————————————— Types ——————————————————

type User = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  mobileNumber: string;
};

interface AddProcessOwnerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { category: number; userId: number }) => void;
}

// —————————————————— Helpers ——————————————————
const isSsoAccount = (u: User) => {
  const email = (u.email || "").trim();
  const local = (email.split("@")[0] || "").toLowerCase();
  const username = (u.userName || "").toLowerCase();
  return local.startsWith("sso") || username.startsWith("sso");
};

const normalize = (s: string) =>
  (s || "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();


// —————————————————— Component ——————————————————
const AddProcessNews: React.FC<AddProcessOwnerModalProps> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  // دسته‌بندی
  const [category, setCategory] = useState<{ id: number; goalTitle: string }[]>([]);

  // کاربر
  type Option = { value: number; label: string };
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // لود دسته‌بندی‌ها
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategorys();
        if (Array.isArray(data)) setCategory(data);
        else if (Array.isArray(data?.data)) setCategory(data.data);
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, []);

  // سرچ کاربر
  const onSearchUser = async (q: string) => {
    setUserSearch(q);
    if (!q) return setUserOptions([]);
    setUserLoading(true);
    try {
      const data: User[] = Array.isArray(await searchFormName(q)) ? await searchFormName(q) : [];
      const normQ = normalize(q);
      const filtered = data
        .filter(u => !isSsoAccount(u))
        .filter(u =>
          [u.fullName, u.userName, u.email, u.mobileNumber]
            .some(f => normalize(f || "").includes(normQ))
        );

      setUserOptions(
        filtered.map(u => ({
          value: u.id,
          label: `${u.fullName} — ${u.email || u.userName || ""}`,
        }))
      );
    } catch {
      setUserOptions([]);
    } finally {
      setUserLoading(false);
    }
  };



  // ثبت
  const handleFinish = async (values: { category: number; user: { value: number; label: string } }) => {
    const goalId = values.category;
    const userId = values.user?.value;

    if (!goalId || !userId) return;

    const result = await addUserToExpert(userId, goalId);
    if (result?.isSuccess) {
      onSubmit({ category: goalId, userId });
      form.resetFields();
      onClose();
    } else {
      // اگر سرور پیام داد، همین‌جا لاگ کن
      console.error(result?.message || "خطا در ثبت خبره");
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} closable className="rtl" destroyOnClose>
      <div className="pb-2 border-b border-gray-200">
        <Title level={5} className="mb-0">افزودن خبره فرایند</Title>
      </div>

      <div className="pt-4">
        <Form form={form} layout="vertical" onFinish={handleFinish} className="rtl">
          {/* دسته‌بندی */}
           <Form.Item
              label="دسته بندی"
              name="category"
              rules={[{ required: true, message: "دسته بندی تعیین نشده است" }]}
            >
              <Select
                className="custom-select"
                placeholder="انتخاب کنید"
                showSearch
                allowClear
                optionFilterProp="children"
              >
                {category.map((dep) => (
                  <Select.Option key={dep.id} value={dep.id}>
                    {dep.goalTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

          {/* کاربر */}
          <Form.Item
            label="کاربر"
            name="user"
            rules={[{ required: true, message: "کاربر را انتخاب کنید" }]}
          >
            <Select
              className="custom-input"
              labelInValue           // ← مقدار به صورت {value,label} خواهد بود (نه string)
              showSearch
              allowClear
              placeholder="نام فرد را وارد کنید"
              filterOption={false}   // سرچ سمت سرور
              onSearch={onSearchUser}
              searchValue={userSearch}
              onChange={() => setUserSearch("")}
              notFoundContent={userLoading ? "در حال جستجو..." : "نتیجه‌ای یافت نشد"}
              options={userOptions}  // ← هیچ تبدیل اشتباهی به string انجام نمی‌دهیم
            />
          </Form.Item>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <Button
              htmlType="button"
              onClick={() => {
                form.resetFields();
                onClose();
              }}
              className="px-6 w-[120px]"
            >
              بازگشت
            </Button>
            <Button type="primary" htmlType="submit" className="px-6 bg-[#007041] w-[120px]">
              ثبت
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddProcessNews;
