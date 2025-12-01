import { Space } from "antd";
import type { Tab } from "../../types/Interfaces";

type Props = {
  activeKey: string;
  tabs: Tab[];
  onClick: (key: string, path?: string) => void;
};

export default function NavTabs({ activeKey, tabs, onClick }: Props) {
  function btnClass(isActive: boolean): string {
    return `
      font-yekan font-bold text-[13px] w-fit transition-all duration-200 h-[38px] rounded-xl flex whitespace-nowrap items-center px-3  gap-1
      ${
        isActive
          ? "bg-[#007041] text-white border border-transparent"
          : "bg-white text-[#333333] border border-gray-300"
      }
      hover:border-[#007041] transition-colors duration-200
    `;
  }

  return (
    <Space size="small">
      {tabs.map(({ key, label, icon, path }) => (
        <button
          key={key}
          className={btnClass(activeKey === key)}
          onClick={() => onClick(key, path)}
        >
          <span className="icon">{icon}</span>
          {label}
        </button>
      ))}
    </Space>
  );
}
