// ActionDropdown.tsx
import { useState } from "react";
import { Dropdown, Button, Menu, Modal } from "antd";
import type { MenuProps } from "antd";
import CreateKnowledgeContent from "../../forms/CreateKnowledgeContent";
import CreateKnowledgeNonStructured from "../module/CreateKnowledgeNonStructured";

const items: {
  key: string;
  label: string;
  form: (onClose: () => void) => React.ReactNode;
}[] = [
  {
    key: "structured",
    label: "+ محتوای ساختار یافته",
    form: (onClose) => <CreateKnowledgeContent onClose={onClose} />,
  },
  {
    key: "unstructured",
    label: "+ محتوای غیر ساختار یافته",
    form: (onClose) => <CreateKnowledgeNonStructured onClose={onClose} />,
  },
];

const labelToTitleMap: Record<string, string> = {
  "+ محتوای ساختار یافته": "ایجاد محتوای دانشی ساختار یافته",
  "+ محتوای غیر ساختار یافته": "ایجاد محتوای دانشی غیر ساختار یافته",
};

export default function ActionDropdown() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  const open = (label: string, form: (typeof items)[0]["form"]) => {
    setModalTitle(labelToTitleMap[label] || label);
    setModalContent(form(() => setIsModalOpen(false)));
    setIsModalOpen(true);
  };

  const menuProps: MenuProps = {
    onClick({ key }) {
      const item = items.find((i) => i.key === key)!;
      open(item.label, item.form);
    },
    items: items.map((i) => ({ key: i.key, label: i.label })),
  };

return (
  <>
    <Dropdown overlay={<Menu {...menuProps} />} trigger={["click"]}>
      <Button
        type="text"
        className="hover:bg-gray-100 border-[2px] w-[130px] border-gray-300"
      >
        افزودن محتوا
      </Button>
    </Dropdown>
    <Modal
      centered
      className="knowledge-modal" // 👈 اضافه کن
      open={isModalOpen}
      footer={null}
      onCancel={() => setIsModalOpen(false)}
      width={modalTitle.includes("ساختار یافته") ? 767 : 600}
      title={modalTitle}
      bodyStyle={{ maxHeight: "fit-content" }}
    >
      {modalContent}
    </Modal>
  </>
);

}
