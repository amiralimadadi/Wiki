import { QuestionCircleFilled } from "@ant-design/icons";
import FolderIcon from "../../svgs/FolderIcon";
import MyInboxIcon from "../../svgs/MyIconBox";
import ProjectIcon from "../../svgs/ProjectIcon";
import FolderIcon2 from "../../svgs/FolderIcon2";
import { SettingOutlined } from "@ant-design/icons";

export const getTabs = (activeKey: string, accessList: string[]) => {
  const hasAccess = (key: string) => accessList.includes(key);

  return [
    {
      key: "knowledgeContent",
      label: "محتوای دانشی",
      icon: (
        <FolderIcon
          isActive={activeKey === "knowledgeContent"}
          className="icon flex items-center"
        />
      ),
      path: "knowledgeContent",
    },
    {
      key: "questions",
      label: "پرسش و پاسخ",
      icon: <QuestionCircleFilled className="icon flex items-center" />,
      path: "questions",
    },
    {
      key: "proposal",
      label: "طرح",
      icon: (
        <MyInboxIcon
          isActive={activeKey === "proposal"}
          className="icon flex items-center"
        />
      ),
      path: "proposal",
    },
    {
      key: "project",
      label: "پروژه",
      icon: (
        <ProjectIcon
          isActive={activeKey === "project"}
          className="icon flex items-center"
        />
      ),
      path: "project",
    },
    {
      key: "documentation",
      label: "مستندات واحدی",
      icon: (
        <FolderIcon2
          isActive={activeKey === "documentation"}
          className="icon flex items-center"
        />
      ),
      path: "documentation",
    },

    // 🔥 شرط نمایش تب ادمین:
    ...(hasAccess("Wiki")
      ? [
          {
            key: "admin",
            label: "ادمین ویکی",
            icon: (
              <SettingOutlined className="icon flex items-center" />
            ),
            path: "admin",
          },
        ]
      : []),
  ];
};
