import { useTabContext } from "../context/TabProvider ";
import NotFoundPage from "../components/module/NotFoundPage";
import type { JSX } from "react";
import MyProject from "./MyProject";
import AllProjects from "./AllProjects";

function Projects() {
  const { activeKey } = useTabContext();

  const components: Record<string, JSX.Element> = {
    project: <AllProjects />,
    MyProject: <MyProject />,
  };

  return components[activeKey] ?? <NotFoundPage />;
}

export default Projects;
