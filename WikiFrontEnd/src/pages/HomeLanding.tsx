import { Button, Card, Col, List, Row, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTabs } from "../components/common/TabsData";
import { getTop50Content } from "../services/auth";
import UserIcon from "../svgs/UserIcon";
import LikeIcon from "../svgs/LikeIcon";
import CommentIcon from "../svgs/CommentIcon";
import ViewIcon from "../svgs/ViewIcon";
import gregorianToJalali from "../helpers/createDate";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const { Text } = Typography;

const getEntityTypeLabel = (entityType: number) => {
  switch (entityType) {
    case 0:
      return "پرسش و پاسخ";
    case 2:
      return "محتوای دانشی";
    case 4:
      return "طرح";
    case 6:
      return "پروژه";
    default:
      return "Unknown";
  }
};


type Top50Item = {
  entityId: number;
  entityType: number;
  title: string;
  text?: string | null;
  createdDate: string;
  pageViewCount?: number;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  user?: Top50User | null;
};
type Top50User = {
  id: number;
  fullName?: string | null;
};
export default function HomeLanding() {
  const navigate = useNavigate();
  const rawRoles = localStorage.getItem("accessList");
  const accessList: string[] = rawRoles ? JSON.parse(rawRoles) : [];
  const tabs = getTabs("", accessList);
  const [loadingTop, setLoadingTop] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [topItems, setTopItems] = useState<Top50Item[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoadingTop(true);
      setTopError(null);
      try {
        const res = await getTop50Content();
        if (!res.success) {
          setTopError(res.message || "خطا در دریافت داده‌ها");
          return;
        }
        const payload = res.data;
        if (!payload?.isSuccess) {
          setTopError(payload?.message || "OperationResult ناموفق بود");
          return;
        }
        setTopItems(payload.data || []);
      } finally {
        setLoadingTop(false);
      }
    };
    load();
  }, []);

  const tiles = useMemo(() => tabs.slice(0, 5), [tabs]);
  const sortedTop = useMemo(() => {
    return [...topItems].sort(
      (a, b) => (b.pageViewCount ?? 0) - (a.pageViewCount ?? 0)
    );
  }, [topItems]);


  const badgeStyle: React.CSSProperties = {
    backgroundColor: "#007041",
    color: "#ffffff",
    fontSize: 11,
    padding: "2px 10px",
    borderRadius: "12px 0px 0px 12px",
    fontWeight: 600,
    marginRight: "-13px",
    display: "inline-block",

  };




  return (
    <div style={{ padding: "24px 0 0 0"}}>
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Card
                style={{
                  width: "100%",
                  maxWidth: 520,
                  borderRadius: 16,
                  background: "transparent",
                  boxShadow: "none",
                  borderColor:"transparent"
                }}
              >
                <Row gutter={[12, 12]}>
                  {tiles.map((tab) => (
                    <Col span={8} key={tab.key}>
                      <Button
                        className="home-tile-btn"
                        onClick={() => navigate(`/${tab.path}`)}
                        style={{
                          height: 55,
                          width: "100%",
                          borderRadius: 20,
                          borderColor:"#118656ff"
                        }}
                      >
                        <Space>
                          {tab.icon}
                          <Text className="font-yekan">{tab.label}</Text>
                        </Space>
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card>
            </div>
          </Col>

          <Col xs={24} lg={14}>
            <Card
              className="top50-card"
              style={{ borderRadius: 16  ,background: "transparent",borderColor:"transparent"}}
            >
              {!loadingTop && !topError && (
                <div
                  className="top50-scroll"
                  style={{
                    maxHeight: "83vh",
                    overflowY: "auto",
                    paddingLeft: 15,
                  }}
                >
                  <List
                    dataSource={sortedTop}
                    renderItem={(x) => (
                      <List.Item style={{ padding: 5, border: "none" }}>
                        <Card
                          style={{ width: "100%", borderRadius: 16, position: "relative" }}
                          hoverable
                        >


                          <Space direction="vertical" size={6} style={{ width: "100%" }}>

                            <Space className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-1 justify-between w-full">
                                <div className="flex items-center gap-1">
                                  <UserIcon size={12.24} color="#000000A6" />
                                  <Text
                                    className="font-yekan"
                                    style={{
                                      fontSize: 12.25,
                                      color: "#000000A6",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {x.user.fullName}
                                  </Text>
                                </div>
                              </div>
                              <div>
                                <p
                                  className="text-[#000000A6] text-[14px]"
                                  style={{ margin: 0 }}
                                >
                                  {gregorianToJalali(x.createdDate)}
                                </p>
                              </div>
                            </Space>

                            <Space style={{ width: "100%", justifyContent: "space-between", marginTop: 12 }}>
                              <div style={{ minWidth: 0 }}>
                                <Text strong className="font-yekan" style={{ display: "block", color: "#007041" }}>
                                  {x.title}
                                </Text>
                              </div>
                            </Space>

                            <Space>
                              <div style={{ minWidth: 0 }}>
                                <Text className="font-yekan" style={{ display: "block", marginBottom: 12 }}>
                                  {x.text || "بدون متن"}
                                </Text>
                              </div>
                            </Space>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Space>
                                <span style={badgeStyle}>
                                  {getEntityTypeLabel(x.entityType)}
                                </span>
                              </Space>

                              <Space size={18}>
                                <Space size={6}>
                                  <ViewIcon />
                                  <Text className="font-yekan" style={{ fontSize: 12 }}>
                                    {x.pageViewCount ?? 0}
                                  </Text>
                                </Space>

                                <Space size={6}>
                                  {x.isLiked ? (
                                    <HeartFilled style={{ color: "#01a05eff", fontSize: 14 }} />
                                  ) : (
                                    <HeartOutlined style={{ color: "#000000A6", fontSize: 14 }} />
                                  )}

                                  <Text className="font-yekan" style={{ fontSize: 12 }}>
                                    {x.likeCount ?? 0}
                                  </Text>
                                </Space>

                                <Space size={6}>
                                  <CommentIcon />
                                  <Text className="font-yekan" style={{ fontSize: 12 }}>
                                    {x.commentCount ?? 0}
                                  </Text>
                                </Space>
                              </Space>
                            </div>


                          </Space>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}