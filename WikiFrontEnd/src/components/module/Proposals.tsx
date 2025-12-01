import { useTabContext } from "../../context/TabProvider ";
import NotFoundPage from "./NotFoundPage";
import type { JSX } from "react";
import AllProposal from "../../pages/AllProposal";
import MyProposal from "../../pages/MyProposal";

function QuestionsPage() {
  const { activeKey } = useTabContext();

  const components: Record<string, JSX.Element> = {
    proposal: <AllProposal />,
    MyProposal: <MyProposal />,
  };

  return components[activeKey] ?? <NotFoundPage />;
}

export default QuestionsPage;
