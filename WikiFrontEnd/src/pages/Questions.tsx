import { useTabContext } from "../context/TabProvider ";
import AllQuastion from "./AllQuastion";
import MyQuestions from "./MyQuestions";
import MentionedQuestions from "./MentionedQuestions";
import NotFoundPage from "../components/module/NotFoundPage";
import type { JSX } from "react";

function QuestionsPage() {
  const { activeKey } = useTabContext();

  const components: Record<string, JSX.Element> = {
    questions: <AllQuastion />,
    MyQuestions: <MyQuestions />,
    MentionedQuestions: <MentionedQuestions />,
  };

  return components[activeKey] ?? <NotFoundPage />;
}

export default QuestionsPage;
