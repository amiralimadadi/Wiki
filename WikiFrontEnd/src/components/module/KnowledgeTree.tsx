import { useState } from "react";
import { CSSTransition } from "react-transition-group";
import type { MenuItemType } from "../../types/Interfaces";
import { ChevronRight } from "lucide-react";

interface KnowledgeTreeProps {
  items: MenuItemType[];
  selectedKey: string;
  onSelect: (key: string) => void;
  title?: string;
}

export default function KnowledgeTree({
  items,
  selectedKey,
  onSelect,
  title = "درخت دانش",
}: KnowledgeTreeProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderMenuItems = (items: MenuItemType[], level = 0) => {
    return items.map((item) => {
      const hasChildren = !!item.children && item.children.length > 0;
      const isExpanded = expandedKeys.has(item.key);

      const handleClick = () => {
        // به پرنت می‌گیم چه key انتخاب شده
        onSelect(item.key);

        // اگر بچه دارد باز/بسته کن
        if (hasChildren) {
          toggleExpand(item.key);
        }
      };

      return (
        <div
          key={item.key}
          style={{
            paddingRight: `${level * 9 + (level >= 2 ? 26 : 0)}px`,
          }}
        >
          <div
            className="w-[200px]"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "3px 10px",
              backgroundColor:
                selectedKey === item.key ? "#fff" : "transparent",
              cursor: "pointer",
              borderRadius: "4px",
              margin: "2px 0",
            }}
            onClick={handleClick}
          >
            {hasChildren && (
              <ChevronRight
                size={12}
                style={{
                  marginLeft: "20px",
                  transition: "transform 0.25s ease",
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            )}

            {item.path ? (
              <p
                className="text-[13.25px] hover:bg-gray-100 duration-200 ease-linear rounded-xl"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  flex: 1,
                }}
              >
                {item.title}
              </p>
            ) : (
              <span style={{ flex: 1 }}>{item.title}</span>
            )}
          </div>

          {hasChildren && (
            <CSSTransition
              in={isExpanded}
              timeout={300}
              classNames="collapse"
              unmountOnExit
            >
              <div>{renderMenuItems(item.children!, level + 1)}</div>
            </CSSTransition>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <style>{`
  .collapse-enter {
    max-height: 0;
    overflow: hidden;
    transition: max-height 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .collapse-enter-active {
    max-height: 1000px; 
  }
  .collapse-exit {
    max-height: 1000px;
    overflow: hidden;
    transition: max-height 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .collapse-exit-active {
    max-height: 0;
  }
`}</style>

      <div
        className="text-[12.25px]"
        style={{
          width: "206px",
          borderRadius: "8px",
          fontFamily: "BYekan, sans-serif",
          backgroundColor: "#fff",
          maxHeight: "400px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            padding: "6px 8px",
            fontWeight: "bold",
            fontSize: "14px",
            position: "sticky",
            width: "175px",
            margin: "0 10px",
            top: 0,
            backgroundColor: "#fff",
            zIndex: 1,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {title}
        </div>
        <div style={{ padding: "3px 0" }}>{renderMenuItems(items)}</div>
      </div>
    </>
  );
}
