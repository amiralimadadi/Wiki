import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Space, Input, Dropdown, Button, Menu, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTabContext } from "../../context/TabProvider ";
import { fetchKnowledgeContent } from "../../redux/slices/knowledgeContentSlice";
import CreateKnowledgeContent from "../../forms/CreateKnowledgeContent";
import CreateKnowledgeNonStructured from "./CreateKnowledgeNonStructured";
import QuestionForm from "../common/QuestionForm";
import ProposalForm from "../../forms/ProposalForm";
import ProjectForm from "../../forms/ProjectForm";
import CreateUnitDocumentationForm from "../../forms/CreateUnitDocumentationForm";
import type { AppDispatch } from "../../redux/store";
import { useDispatch,  } from "react-redux";
import { clearResults, searchItems } from "../../redux/slices/searchSlice";

interface TabButton {
  key: string;
  label: string;
}

interface DropdownItem {
  key: string;
  label: string;
  form: (onClose: () => void) => React.ReactNode;
}

interface ActionButtonMap {
  [key: string]:
    | {
        type: "dropdown";
        items: DropdownItem[];
        buttonLabel: string;
      }
    | {
        type: "button";
        label: string;
        form: (onClose: () => void) => React.ReactNode;
      };
}

const actionButtonsMap: ActionButtonMap = {
  knowledgeContent: {
    type: "dropdown",
    items: [
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
    ],
    buttonLabel: "ثبت محتوای دانشی",
  },
  questions: {
    type: "button",
    label: "ثبت پرسش جدید",
    form: (onClose) => <QuestionForm onClose={onClose} />,
  },
  proposal: {
    type: "button",
    label: "ثبت طرح",
    form: (onClose) => <ProposalForm onClose={onClose} />,
  },
  project: {
    type: "button",
    label: "ثبت پروژه",
    form: (onClose) => <ProjectForm onClose={onClose} />,
  },
  documentation: {
    type: "button",
    label: "ثبت مستندات واحدی",
    form: (onClose) => <CreateUnitDocumentationForm onClose={onClose} />,
  },
};

const labelToTitleMap: Record<string, string> = {
  "+ محتوای ساختار یافته": "ایجاد محتوای دانشی ساختار یافته",
  "+ محتوای غیر ساختار یافته": "ایجاد محتوای دانشی غیر ساختار یافته",
  "ثبت پرسش جدید": "ایجاد پرسش جدید",
  "ثبت طرح": "ثبت طرح جدید",
  "ثبت پروژه": "ثبت پروژه جدید",
  "ثبت مستندات واحدی": "ایجاد مستند واحدی",
};

const tabButtonsMap: Record<string, TabButton[]> = {
  knowledgeContent: [
    { key: "all", label: "محتوای دانشی" },
    { key: "MyKnowledgeContent", label: "محتوا من" },
    { key: "MentionedKnowledgeContent", label: "ارجاع شده به من" },
    { key: "ExpertConfirm", label: "در انتظار تایید" },
  ],
  questions: [
    { key: "questions", label: "پرسش‌ها" },
    { key: "MyQuestions", label: "پرسش‌های من" },
    { key: "MentionedQuestions", label: "ارجاع شده به من" },
  ],
  proposal: [
    { key: "proposal", label: "طرح‌ها" },
    { key: "MyProposal", label: "طرح‌های من" },
  ],
  project: [
    { key: "project", label: "پروژه‌ها" },
    { key: "MyProject", label: "پروژه‌های من" },
  ],
  documentation: [
    { key: "documentation", label: "مستندات" },
    { key: "MyDocumentation", label: "مستندات من" },
    { key: "AwaitingConfirmation", label: "در انتظار تایید" },
    { key: "substitute", label: "تعیین جانشین" },
  ],
};

function Header2() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeKey, setActiveKey } = useTabContext();

  const currentPath = location.pathname.replace("/", "");
  const buttons = tabButtonsMap[currentPath];
  const action = actionButtonsMap[currentPath];

  // خواندن goalId و searchText از URL
  const searchParams = new URLSearchParams(location.search);
  const goalIdParam = searchParams.get("goalId");
  const goalId = goalIdParam ? Number(goalIdParam) : undefined;
  const searchTextFromUrl = searchParams.get("searchText") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalWidth, setModalWidth] = useState<number>(768);
  const [searchValue, setSearchValue] = useState<string>(searchTextFromUrl);

  // برای وقتی که از بیرون URL عوض شود (back/forward)
  useEffect(() => {
    const s = searchParams.get("searchText") || "";
    setSearchValue(s);
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  // دیباونس سرچ + همگام‌سازی با URL
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(location.search);

      if (searchValue.trim()) {
        // ✅ وقتی چیزی تایپ شده
        params.set("searchText", searchValue.trim());
        params.set("pageNo", "1");

        navigate(
          {
            pathname: location.pathname,
            search: params.toString(),
          },
          { replace: true }
        );

        dispatch(
          searchItems({
            searchText: searchValue.trim(),
            path: currentPath,
            goalId,
          })
        );
      } else {
        // ✅ وقتی ورودی خالی شد
        params.delete("searchText");
        params.set("pageNo", "1");

        navigate(
          {
            pathname: location.pathname,
            search: params.toString(),
          },
          { replace: true }
        );

        dispatch(clearResults());
        // دوباره لود بر اساس goalId
        window.dispatchEvent(
          new CustomEvent("knowledge:filter-by-goal", {
            detail: { goalId },
          })
        );
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchValue, currentPath, goalId, location.pathname, location.search, navigate, dispatch]);

  const openModal = (
    formFn: (onClose: () => void) => React.ReactNode,
    label: string
  ) => {
    setModalContent(formFn(closeModal));
    setModalTitle(labelToTitleMap[label] || "فرم ثبت");

    if (label === "ثبت پرسش جدید") {
      setModalWidth(521);
    } else if (label === "+ محتوای ساختار یافته") {
      setModalWidth(768);
    } else if (label === "ثبت طرح" || label === "ثبت پروژه") {
      setModalWidth(500);
    } else {
      setModalWidth(768);
    }

    setIsModalOpen(true);
  };

  // وقتی تب «همه» انتخاب می‌شود، دیتا لود کن (در صورت نیاز)
  useEffect(() => {
    if (activeKey === "all" && currentPath === "knowledgeContent") {
      dispatch(fetchKnowledgeContent());
    }
  }, [activeKey, currentPath, dispatch]);

  // تنظیم تب پیش‌فرض برای هر مسیر
  useEffect(() => {
    if (buttons && buttons.length > 0) {
      setActiveKey(buttons[0].key);
    }
  }, [currentPath, buttons, setActiveKey]);

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalTitle("");
  };

  if (!buttons) return null;

  return (
    <div className="w-full flex items-center justify-between gap-2 ">
      <div className="w-[884px] md:w-full max-w-[1500px] bg-white p-1 rounded-lg flex flex-col gap-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <Space wrap size={[8, 8]}>
            {buttons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveKey(btn.key)}
                className={`!w-[102.72px] !h-[43.02px] !text-[12.25px]  !font-semibold !py-1 !rounded-lg !transition-all ${
                  activeKey === btn.key
                    ? "!bg-[#007041] !text-white"
                    : "!text-[#414141] hover:!bg-gray-100 duration-150"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </Space>
          <div className="w-[200px]">
            <Input
              placeholder="جستجو"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              prefix={
                <SearchOutlined className="text-gray-700 text-[15px] font-bold" />
              }
              className="custom-input !rounded-lg !h-[43px] !text-[13px] !border hover:!border-gray-500 focus:!border-gray-500 focus:!shadow-none custom-input"
            />
          </div>
        </div>
      </div>

      {action?.type === "dropdown" ? (
        <Dropdown
          overlay={
            <Menu
              className="font-yekan"
              onClick={({ key }) => {
                const selectedItem =
                  "items" in action &&
                  action.items.find((item) => item.key === key);
                if (selectedItem) {
                  openModal(selectedItem.form, selectedItem.label);
                }
              }}
              items={
                "items" in action
                  ? action.items.map((item) => ({
                      key: item.key,
                      label: item.label,
                    }))
                  : []
              }
            />
          }
          trigger={["hover"]}
        >
          <Button
            className="
              !text-[#333] 
              w-[169.29px] 
              h-[50.48px] 
              font-bold 
              !border 
              border-green-600 
              !rounded-xl 
              font-yekan
              hover:!border-green-600 
              hover:!bg-gray-100  
            "
          >
            + {"buttonLabel" in action ? action.buttonLabel : ""}
          </Button>
        </Dropdown>
      ) : action?.type === "button" ? (
        <Button
          onClick={() => openModal(action.form, action.label)}
          className="
            !text-[#333] 
            w-[169.29px] 
            h-[50.48px] 
            font-bold 
            !border 
            border-green-600 
            !rounded-xl 
            font-yekan
            hover:!border-green-600 
            hover:!bg-gray-100  
          "
        >
          + {action.label}
        </Button>
      ) : null}

      <Modal
        className="font-yekan"
        open={isModalOpen}
        onCancel={closeModal}
        centered
        footer={null}
        title={modalTitle}
        width={modalWidth}
      >
        {modalContent}
      </Modal>
    </div>
  );
}

export default Header2;
