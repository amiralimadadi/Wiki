import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { addPosition, fetchDepartments } from "../services/auth";
import toast, { Toaster } from "react-hot-toast";

interface AddPositionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void; //
}

interface Department {
  id: number;
  departmentTitle: string;
}

const AddUserGroup: React.FC<AddPositionModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState<Department[]>([]);

  const handleFinish = async (values: {
    PositionName: string;
    UnitId: number;
  }) => {
    try {
      const res = await addPosition(values);

      if (res.isSuccess) {
        toast.success("موقعیت با موفقیت ثبت شد.");
        form.resetFields();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error("خطا: " + res.message);
      }
    } catch (error) {
      console.error("❌ خطا در ثبت:", error);
      toast.error("ثبت موقعیت با خطا مواجه شد.");
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetchDepartments();
        if (res?.data && Array.isArray(res.data)) {
          setDepartments(res.data);
        }
      } catch (err) {
        toast.error("خطا در دریافت لیست واحدها");
      }
    };
    fetch();
  }, []);

  return (
    <Modal
      title="افزودن موقعیت جدید"
      visible={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      centered
      destroyOnClose
      className="print:hidden"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        dir="rtl"
         className="mt-2 font-yekan csstom-form"
      >
        <Form.Item
          label="عنوان سمت"
          name="PositionName"
          rules={[{ required: true, message: "لطفا عنوان سمت را وارد کنید" }]}
        >
          <Input className="custom-input" placeholder="مثلاً مدیر توسعه محصول" />
        </Form.Item>

        <Form.Item
          label="واحد"
          name="UnitId"
          rules={[{ required: true, message: "لطفا یک واحد انتخاب کنید" }]}
        >
          <Select
            placeholder="انتخاب واحد"
            showSearch
            className="custom-select"
            optionFilterProp="children"
            filterOption={(input, option) =>
              // @ts-expect-error tsx
              (option?.children as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.departmentTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={() => {
              form.resetFields();
              onClose();
            }}
            className="px-6 w-[120px]"
          >
            بازگشت
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="px-6 w-[120px] bg-[#007041]"
          >
            ثبت
          </Button>
        </div>
      </Form>
      <Toaster position="bottom-left" />
    </Modal>
  );
};

export default AddUserGroup;
