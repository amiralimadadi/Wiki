import { lazy, Suspense, useEffect, useState } from "react";
import { useTabContext } from "../../context/TabProvider ";
import MyKnowledge from "../../pages/MyKnowledge";
import MentionedKnowledge from "../../pages/MentionedKnowledge";
import ExpertConfirm from "../../pages/ExpertConfirm";
import Questions from "../../pages/Questions";
import Proposals from "./Proposals";
import Projects from "../../pages/Projects";
import Substitute from "./Substitute";
import { useParams } from "react-router-dom";
import { getGoalTree } from "../../services/auth";
import type { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import type { Articles } from "../../types/Interfaces";
import NotFoundPage from "./NotFoundPage";
import CardComponent from "./CardComponent";
import AwaitingConfirmation from "../module/AwaitingConfirmation";
import DocumentsComponents from "../../pages/DocumentsComponents";

// lazy import
const AllKnowledge = lazy(() => import("../../pages/AllKnowledge"));
const Documents = lazy(() => import("../../pages/DocumentsComponents"));
// @ts-expect-error tsx

const AllQuastion = lazy(() => import("../../pages/DocumentsComponents"));

export default function ContentArea() {
  // @ts-expect-error tsx
  const [goalDetail, setGoalDetail] = useState<null>(null);
  const { activeKey } = useTabContext();
  const { id } = useParams();

  const { data: reduxData } = useSelector(
    (state: RootState) => state.knowledgeContent
  );
  // @ts-expect-error tsx

  const articlesArray = reduxData?.data;
  // @ts-expect-error tsx
  const articles: Articles[] = Array.isArray(articlesArray)
    ? articlesArray.map((item) => ({
        id: item.id,
        knowledgeContentType: item.knowledgeContentType,
        title: item.title,
        text: item.text,
        abstract: item.abstract,
        goalTitle: item.goalTitle,
        createdDate: item.createdDate,
        goalId: item.goalId,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        isLiked: item.isLiked,
        isConfirm: item.isConfirm,
        isActive: item.isActive,
        user: item.user,
        attachments: item.attachments,
        tags: item.tags,
        mentions: item.mentions,
        mentionUserIds: item.mentionUserIds,
        references: item.references,
      }))
    : [];

  useEffect(() => {
    if (id) {
      // دریافت اطلاعات هدف از API
      const fetchGoalDetail = async () => {
        try {
          // @ts-expect-error tsx
          const data = await getGoalTree(id);
          setGoalDetail(data);
        } catch (error) {
          console.error("خطا در دریافت اطلاعات هدف:", error);
        }
      };
      fetchGoalDetail();
    }
  }, [id]);

  const renderContent = () => {
    switch (activeKey) {
      // knowledgeContent
      case "all":
        return <AllKnowledge articles={articles} />;
      case "MyKnowledgeContent":
        return <MyKnowledge />;
      case "MentionedKnowledgeContent":
        return <MentionedKnowledge />;
      case "ExpertConfirm":
        return <ExpertConfirm />;
      case "questions":
      case "MyQuestions":
      case "MentionedQuestions":
        // @ts-expect-error tsx

        return <Questions activeKey={activeKey} />;

      // proposal
      case "proposal":
      case "MyProposal":
        // @ts-expect-error tsx

        return <Proposals activeKey={activeKey} />;

      // project
      case "project":
      case "MyProject":
        // @ts-expect-error tsx

        return <Projects activeKey={activeKey} />;

      // documentation
      case "documentation":
        return <DocumentsComponents />;
      case "MyDocumentation":
        return <CardComponent />;
      case "AwaitingConfirmation":
        return <AwaitingConfirmation />;
        // @ts-expect-error tsx

        return <Documents activeKey={activeKey} />;
      case "substitute":
        return <Substitute />;

      default:
        return <p>موردی یافت نشد.</p>;
    }
  };

  return <Suspense fallback={<NotFoundPage />}>{renderContent()}</Suspense>;
}
