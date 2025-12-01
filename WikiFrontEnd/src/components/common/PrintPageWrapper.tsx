import { useParams } from "react-router-dom";
import PrintPage from "../../pages/PrintPage";
import NotFoundPage from "../module/NotFoundPage";
import type { Articles } from "../../types/Interfaces";

interface Props {
  articles: {
    data: Articles[];
    isSuccess: boolean;
    message: string;
  };
}

const PrintPageWrapper = ({ articles }: Props) => {
  const { id } = useParams();

  const articleId = id ? parseInt(id) : null;

  const article = articles?.data?.find((item) => item.id === articleId);

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <div className="p-4">
      <PrintPage article={article} />
    </div>
  );
};

export default PrintPageWrapper;
