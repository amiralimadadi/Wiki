import axios from "axios";
import api from "../configs/api";
import type {
  // AddUserToGeneratorPayload,
  // @ts-expect-error tsx
  ApiResponse,
  CreateAnswerParams,
  CreateCommentParams,
  GetAnswerResponse,
  GetCommentsResponse,
  UserGeneratorItem,
} from "../types/Interfaces";

const getGoalTree = async () => {
  try {
    const response = await api.get("General/GetTotalGoalTree");

    if (!response.data) {
      throw new Error("داده‌ای دریافت نشد");
    }

    return response.data;
  } catch (error) {
    console.error("getGoalTree error:", error);
    throw new Error("خطا در دریافت درخت هدف");
  }
};

export { getGoalTree };

// گرفتن تمام مقادیر محتوای دانشی
const getAllKnow = async () => {
  try {
    const response = await api.get("KnowledgeContent/GetKnowledgeContent", {
      params: {
        knowledgeContentFilter: "All",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getAllKnow };

const MyKnowledgeContent = async () => {
  try {
    const response = await api.get("KnowledgeContent/GetKnowledgeContent", {
      params: {
        knowledgeContentFilter: "MyKnowledgeContent",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { MyKnowledgeContent };

const MentionedKnowledgeContent = async () => {
  try {
    const response = await api.get("KnowledgeContent/GetKnowledgeContent", {
      params: {
        knowledgeContentFilter: "MentionedKnowledgeContent",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { MentionedKnowledgeContent };

const expertConfirm = async () => {
  try {
    const response = await api.get("KnowledgeContent/GetKnowledgeContent", {
      params: {
        knowledgeContentFilter: "ExpertConfirm",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { expertConfirm };

const MyconstGetAllKnow = async (knowledgeContentId: number) => {
  try {
    const response = await api.get("KnowledgeContent/GetKnowledgeContentById", {
      params: {
        knowledgeContentId: knowledgeContentId,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { MyconstGetAllKnow };




// پست کردن کامنت

const createComment = async ({
  commentText,
  userId,
  knowledgeContentId,
  mentionUserIds = [],
  tags = [],
  commentAttachments = [],
}: CreateCommentParams) => {
  try {
    const formData = new FormData();
    formData.append("CommentText", commentText);
    formData.append("UserId", userId.toString());
    formData.append("KnowledgeContentId", knowledgeContentId.toString());
    mentionUserIds.forEach((id) => {
      formData.append("MentionUserId", id.toString());
    });

    tags.forEach((tag) => {
      formData.append("Tags", tag);
    });

    commentAttachments.forEach((file) => {
      formData.append("CommentAttachments", file);
    });

    const response = await api.post(
      "KnowledgeContent/CreateComment",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال کامنت:", error);
    throw error;
  }
};

export { createComment };

const createKnowledgeContent = async (formData: FormData, token: string) => {
  return await api.post(
    `KnowledgeContent/CreateKnowledgeContentStructured`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export { createKnowledgeContent };

const CreateKnowledgeNon = async (formData: FormData, token: string) => {
  return await api.post(
    `KnowledgeContent/CreateKnowledgeContentNonStructured`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export { CreateKnowledgeNon };

// ساخت کامن پاسخ ها

const CreateAnswer = async ({
  answerText,
  userId,
  questionId,
  mentionUserId = [],
  tags = [],
  answerAttachments = [],
}: CreateAnswerParams) => {
  try {
    const formData = new FormData();

    if (!answerText?.trim()) {
      throw new Error("متن پاسخ نباید خالی باشد");
    }

    formData.append("AnswerText", answerText.trim());
    formData.append("UserId", userId.toString());
    formData.append("QuestionId", questionId.toString());

    // 👇 ارسال آرایه‌ها با ایندکس برای سازگاری بهتر با بک‌اند
    mentionUserId.forEach((id, index) => {
      formData.append(`MentionUserId[${index}]`, id.toString());
    });

    tags.forEach((tag, index) => {
      formData.append(`Tags[${index}]`, tag);
    });

    answerAttachments
      .filter(f => f instanceof File)
      .forEach(file => formData.append("AnswerAttachments", file, file.name));

    const response = await api.post(
      "QuestionAndAnswer/CreateAnswer",
      formData,
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ خطا در ارسال کامنت:", error);
    throw error;
  }
};

export { CreateAnswer };

const fetchCategorys = async () => {
  try {
    const raw = localStorage.getItem("sessionId");
    const auth = raw
      ? (raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`) // اگر API Bearer می‌خواهد
      : undefined;
    const response = await axios.get(
      "https://wikiapi.tipax.ir/api/General/GetGoalsTreeBeyondSecondLevel",
      {
        headers: auth ? { Authorization: auth } : undefined,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export { fetchCategorys };


// گرفتن تگ ها
const getTagSelecteddAll = async () => {
  try {
    const response = await api.get(
      "General/GetAllTags"
    );

    if (!response.data) {
      throw new Error("داده‌ای دریافت نشد");
    }

    return response.data;
  } catch (error) {
    console.error("getTagSelected error:", error);
    throw new Error("خطا در دریافت درخت هدف");
  }
};

export { getTagSelecteddAll };

const searchFormName = async (searchText: string) => {
  try {
    const response = await api.post(
      "https://integrationapi.tipax.ir/api/v2/Users/Search",
      {
        fullName: searchText,
        recordsPerPage: 50,
      }
    );

    if (!response.data) {
      throw new Error("داده‌ای دریافت نشد");
    }

    return response.data.data;
  } catch (error) {
    console.error("getTagSelected error:", error);
    throw new Error("خطا در دریافت لیست کاربران");
  }
};

export { searchFormName };

const getAllQuestions = async (
  pageNo: number = 1,
  pageSize: number = 10,
  goalId?: number | null,
  searchText?: string | null
) => {
  try {
    const params: any = {
      questionFilter: "AllQuestions",
      pageNo,
      pageSize,
    };

    // فقط وقتی سرچ داری ارسال شود
    if (searchText && searchText.trim() !== "") {
      params.searchText = searchText.trim();
    }

    // فقط وقتی goalId داری ارسال شود (undefined یا null نباشد)
    if (goalId !== undefined && goalId !== null) {
      params.goalId = goalId;
    }

    const response = await api.get("QuestionAndAnswer/GetQuestions", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("⚠️ Error fetching questions:", error);
    throw error;
  }
};

export { getAllQuestions };


const getMyQuestion = async () => {
  try {
    const response = await api.get("QuestionAndAnswer/GetQuestions", {
      params: {
        questionFilter: "MyQuestions",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getMyQuestion };



const getAdminListByUserId = async (userId: number) => {
  try {
    const response = await api.get("General/GetAdminListByUserId", {
      params: {
        userId,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getAdminListByUserId };

const MentionedQuestions = async () => {
  try {
    const response = await api.get("QuestionAndAnswer/GetQuestions", {
      params: {
        questionFilter: "MentionedQuestions",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { MentionedQuestions };

const getAllProjects = async (
  searchText: string,
  pageNo: number = 1,
  pageSize: number = 9
) => {
  try {
    const response = await api.get("Project/GetAllProject", {
      params: {
        projectFilter: "AllProject",
        searchText,
        goalId: "",
        pageNo,
        pageSize,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Project contents:", error);
    throw error;
  }
};

export { getAllProjects };

const getAllProjectsAndpersonal = async () => {
  try {
    const response = await api.get("ProjectAndProposal/GetAllProposal", {
      params: {
        proposalFilter: "AllProposal",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getAllProjectsAndpersonal };

const getAllProjectsAndpersonalComments = async (
  proposalId: number,
  pageNo: number
) => {
  try {
    const response = await api.get("ProjectAndProposal/GetCommentOfProposal", {
      params: {
        proposalId,
        pageNo,
      },
    });

    return response.data;
  } catch (error) {
    console.error("خطا در دریافت کامنت‌ها:", error);
    throw error;
  }
};

export { getAllProjectsAndpersonalComments };

const getMyProjects = async () => {
  try {
    const response = await api.get("Project/GetAllProject", {
      params: {
        projectFilter: "MyProject",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getMyProjects };

// گرفتن افرادر برتر
const getBestUsers = async () => {
  try {
    const response = await api.get(
      "https://wikiapi.tipax.ir/api/General/GetTopThreeUsersByScore"
    );

    if (!response.data) {
      throw new Error("داده‌ای دریافت نشد");
    }

    return response.data;
  } catch (error) {
    console.error("getTagSelected error:", error);
    throw new Error("خطا در دریافت درخت هدف");
  }
};

export { getBestUsers };

const getProfileDataForCurrent = async () => {
  try {
    const response = await api.get(
      "https://wikiapi.tipax.ir/api/General/GetProfileDataForCurrentUser"
    );

    if (!response.data) {
      throw new Error("داده‌ای دریافت نشد");
    }

    return response.data;
  } catch (error) {
    console.error("getTagSelected error:", error);
    throw new Error("خطا در دریافت درخت هدف");
  }
};

export { getProfileDataForCurrent };

const getNotif = async () => {
  try {
    const response = await api.post(
      "https://integrationapi.tipax.ir/api/v2/Notification/GetMyNotifications",
      {
        page: 1,
        pageSize: 100,
      }
    );

    if (!response.data) {
      throw new Error("داده‌ای دریافت نشد");
    }

    return response.data;
  } catch (error) {
    console.error("getTagSelected error:", error);
    throw new Error("خطا در دریافت درخت هدف");
  }
};

export { getNotif };

const markNotificationAsSeen = async (notificationId: number) => {
  try {
    await api.post("/Notification/MarkAsSeen", { notificationId });
  } catch (error) {
    console.error("Error marking notification as seen:", error);
  }
};

export { markNotificationAsSeen };

const getComments = async (id: number): Promise<GetCommentsResponse | null> => {
  try {
    const res = await api.get(
      `/KnowledgeContent/GetCommentOfKnowledgeContent`,
      {
        params: { knowledgeContentId: id },
      }
    );

    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export { getComments };

const getCommentsAnswer = async (id: number): Promise<GetAnswerResponse | null> => {
  try {
    const res = await api.get(
      `QuestionAndAnswer/GetAnswersOfQuestion`,
      {
        params: { questionId: id },
      });

    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export { getCommentsAnswer };

const fetchComments = async (questionId: number) => {
  try {
    const response = await api.get(`QuestionAndAnswer/GetAnswersOfQuestion`, {
      params: {
        questionId: questionId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export { fetchComments };

// گرفتن طرح تستی

const fetchProposals = async () => {
  try {
    const response = await api.get(
      "https://wikiapi.tipax.ir/api/ProjectAndProposal/GetAllProposal",
      {
        params: {
          proposalFilter: "AllProposal",
          pageNo: 1,
          searchText: "تست",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching proposals:", error);
    throw error;
  }
};

export { fetchProposals };


const getAllProposals = async (proposalFilter = "AllProposal", pageNo = 1) => {
  try {
    const response = await api.get("ProjectAndProposal/GetAllProposal", {
      params: {
        proposalFilter,
        pageNo,
      },
    });

    if (response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: "No data received" };
    }
  } catch (error) {
    console.error("خطا در دریافت پروپوزال‌ها:", error);
    return { success: false, message: error.message };
  }
};

export { getAllProposals };

const getMyProposals = async (proposalFilter = "MyProposal", pageNo = 1) => {
  try {
    const response = await api.get("ProjectAndProposal/GetAllProposal", {
      params: {
        proposalFilter,
        pageNo,
      },
    });

    if (response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: "No data received" };
    }
  } catch (error) {
    console.error("خطا در دریافت پروپوزال‌ها:", error);
    return { success: false, message: error.message };
  }
};

export { getMyProposals };

const likeProjectAndProposal = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "4");

    const response = await api.post(
      "ProjectAndProposal/LikeProposal",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { likeProjectAndProposal };

const unLikeProjectAndProposal = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "4");

    const response = await api.post(
      "ProjectAndProposal/UnlikeProposal",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { unLikeProjectAndProposal };

const fetchCommentsProposal = async (proposalId, pageNo = 1) => {
  try {
    const response = await api.get("ProjectAndProposal/GetCommentOfProposal", {
      params: {
        proposalId,
        pageNo,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export { fetchCommentsProposal };

// دانلود فایل pdf
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "downloaded-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("خطا در دانلود فایل:", error);
  }
};

export { downloadFile };

// like
const likeProposalComments = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "5");

    const response = await api.post(
      "ProjectAndProposal/LikeProposalComment",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { likeProposalComments };

// unlike

const unlikeProposalComments = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "5");

    const response = await api.post(
      "ProjectAndProposal/UnlikeProposalComment",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { unlikeProposalComments };

const commentQuastionLike = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "1");

    const response = await api.post("QuestionAndAnswer/LikeQuestionAnswer", formData, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { commentQuastionLike };



const CommentProjectPer = async (formData: FormData, token: string) => {
   return await api.post(
    'ProjectAndProposal/CreateCommentProposal',
formData,
{
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export { CommentProjectPer };


const CommentProjectPer2 = async ({
  commentText,
  userId,
  proposalId,
  tags = [],
  commentAttachments = [],
}: {
  commentText: string;
  userId: number;
  proposalId: number;
  tags?: string[];
  commentAttachments?: File[];
}) => {
  try {
    const formData = new FormData();

    formData.append("CommentText", commentText || "");
    formData.append("UserId", userId?.toString() || "0");
    formData.append("ProposalId", proposalId?.toString() || "0");

    tags.forEach((tag) => {
      if (tag) formData.append("Tags", tag);
    });

    commentAttachments.forEach((file) => {
      if (file) formData.append("ProposalCommentAttachments", file);
    });

    const response = await api.post(
      "/ProjectAndProposal/CreateCommentProposal",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ خطا در ارسال کامنت پروپوزال:", error);
    throw error;
  }
};

export { CommentProjectPer2 };




// گرفتن دپارتمان

const API_URL =
  "https://igtgatewayapi.tipax.ir/api/Hr/OrganizationChart/Department";

const token = localStorage.getItem("sessionId");

const fetchDepartments = async () => {
  const token = localStorage.getItem("sessionId");
  try {
    if (!token) throw new Error("❌ Token not found in localStorage");

    const response = await axios.post(
      API_URL,
      {},
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Departments response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch departments:", error.response ?? error);
    throw error;
  }
};

export { fetchDepartments };

const CreateQuestion = async (formData: FormData, token: string) => {
  return await api.post(`QuestionAndAnswer/CreateQuestion`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export { CreateQuestion };

const CreatePersonal = async (formData: FormData, token: string) => {
  return await api.post(`ProjectAndProposal/CreateProposal`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export { CreatePersonal };

const CreateProject = async (formData: FormData, token: string) => {
  return await api.post(`Project/CreateProject`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export { CreateProject };

const getMyRole = async () => {
  try {
    const token = localStorage.getItem("sessionId");

    const response = await api.get(
      "https://integrationapi.tipax.ir/api/v2/Role/GetMyRoles",
      {
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.isSuccess) {
      const roles = response.data.data;
      localStorage.setItem("roles", JSON.stringify(roles));
      return roles;
    } else {
      console.error("❌ خطا در دریافت نقش‌ها:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("❌ خطای ارتباط با GetMyRoles:", error);
    return [];
  }
};

export { getMyRole };

const getProfileDataAll = async () => {
  try {
    console.log("در حال دریافت اطلاعات کاربران...");

    const response = await api.get("General/GetProfileDataForAllUsers");

    if (response.status === 200) {
      console.log("دریافت موفقیت‌آمیز اطلاعات کاربران");
      return response.data; // اطلاعات کاربران
    } else {
      console.warn("درخواست با وضعیت غیرمنتظره‌ای بازگشت:", response.status);
      return null;
    }
  } catch (error) {
    console.error("خطا در دریافت اطلاعات کاربران:", error);
    return null;
  }
};

export { getProfileDataAll };

const getAllAdmins = async () => {
  try {
    // وضعیت بارگذاری شروع می‌شود (در صورت نیاز)
    console.log("در حال دریافت اطلاعات کاربران...");

    const response = await api.get("ProcessProfessional/GetAllAdmins");

    if (response.status === 200) {
      console.log("دریافت موفقیت‌آمیز اطلاعات کاربران");
      return response.data; // اطلاعات کاربران
    } else {
      console.warn("درخواست با وضعیت غیرمنتظره‌ای بازگشت:", response.status);
      return null;
    }
  } catch (error) {
    console.error("خطا در دریافت اطلاعات کاربران:", error);
    return null;
  }
};

export { getAllAdmins };

const GetAllOwners = async () => {
  try {
    // وضعیت بارگذاری شروع می‌شود (در صورت نیاز)
    console.log("در حال دریافت اطلاعات کاربران...");

    const response = await api.get("ProcessProfessional/GetAllOwners");

    if (response.status === 200) {
      console.log("دریافت موفقیت‌آمیز اطلاعات کاربران");
      return response.data; // اطلاعات کاربران
    } else {
      console.warn("درخواست با وضعیت غیرمنتظره‌ای بازگشت:", response.status);
      return null;
    }
  } catch (error) {
    console.error("خطا در دریافت اطلاعات کاربران:", error);
    return null;
  }
};

export { GetAllOwners };

const GetAllExperts = async () => {
  try {
    // وضعیت بارگذاری شروع می‌شود (در صورت نیاز)
    console.log("در حال دریافت اطلاعات کاربران...");

    const response = await api.get("ProcessProfessional/GetAllExperts");

    if (response.status === 200) {
      console.log("دریافت موفقیت‌آمیز اطلاعات کاربران");
      return response.data; // اطلاعات کاربران
    } else {
      console.warn("درخواست با وضعیت غیرمنتظره‌ای بازگشت:", response.status);
      return null;
    }
  } catch (error) {
    console.error("خطا در دریافت اطلاعات کاربران:", error);
    return null;
  }
};

export { GetAllExperts };

const createGoal = async (goalData) => {
  try {
    const response = await api.post("General/CreateGoal", goalData);
    return response.data;
  } catch (error) {
    console.error("❌ خطا در ارسال هدف:", error);
    throw error;
  }
};

export { createGoal };

const deleteTree = async (id) => {
  try {
    const response = await api.post(`General/DeleteGoal/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ خطا در حذف هدف:", error);
    throw error;
  }
};

export { deleteTree };

const getQuestionsForAdminConfirm = async () => {
  try {
    const response = await api.get(
      "QuestionAndAnswer/GetQuestionsForAdminConfirm"
    );

    if (!response.data?.isSuccess) {
      throw new Error("دریافت سوالات تایید نشده با خطا مواجه شد");
    }

    return response.data.data;
  } catch (error) {
    console.error("❌ خطا در دریافت سوالات تایید نشده:", error);
    throw error;
  }
};

export { getQuestionsForAdminConfirm };

const getCommentsAnuser = async (
  id: number
): Promise<GetCommentsResponse | null> => {
  try {
    const res = await api.get(`QuestionAndAnswer/GetAnswersOfQuestion`, {
      params: { questionId: id },
    });

    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export { getCommentsAnuser };

const createQuestion = async (formData: FormData, token: string) => {
  return await api.post(
    `QuestionAndAnswer/CreateQuestion`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export { createQuestion };



interface FetchQuestionsParams {
  questionFilter?: "AllQuestions" | "MyQuestions" | "MentionedQuestions";
  searchText?: string;
  goalId?: number;
  pageNo?: number;
}

const fetchQuestions = async (params: FetchQuestionsParams) => {
  try {
    const response = await api.get("QuestionAndAnswer/GetQuestions", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت سوالات:", error.response?.data || error);
    throw error;
  }
};

export { fetchQuestions };

const getUnconfirmedAnswers = async (questionId, pageNo = 1) => {
  try {
    const response = await axios.get(`QuestionAndAnswer/GetAnswersOfQuestion`, {
      params: {
        questionId,
        pageNo,
      },
      headers: {
        Authorization: `Bearer <your_token_here>`,
        Accept: "*/*",
      },
    });

    if (response.data?.isSuccess) {
      return response.data.data; // لیست پاسخ‌ها
    } else {
      console.error("خطا در دریافت پاسخ‌ها:", response.data?.message);
      return [];
    }
  } catch (error) {
    console.error("خطای سرور یا شبکه:", error);
    return [];
  }
};

export { getUnconfirmedAnswers };

const getQuestionStats = async (questionId: number) => {
  try {
    const res = await fetchComments(questionId);
    const answers = res?.data || [];

    const answersCount = answers.length;
    const likesCount = answers.reduce(
      (sum, answer) => sum + (answer.likeCount || 0),
      0
    );

    return { answersCount, likesCount };
  } catch (err) {
    console.error("خطا در گرفتن آمار سوال:", err);
    return { answersCount: 0, likesCount: 0 };
  }
};

export { getQuestionStats };

interface LikeResponse {
  isSuccess: boolean;
  message?: string;
  data?: [];
  modelErrors?: [];
}

export const sendLike = async (
  entityId: number,
  userId: number,
  entityType: "Question" | "Answer" = "Answer",
  token: string
): Promise<LikeResponse> => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", entityType);

    const response = await api.post(
      "QuestionAndAnswer/LikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);
    return {
      isSuccess: false,
      message: error.response?.data?.message || error.message,
      modelErrors: error.response?.data?.modelErrors || [],
    };
  }
};

const sendUnlike = async (
  entityId: number,
  userId: number,
  entityType: "Question" | "Answer" = "Answer",
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", entityType);

    const response = await api.post(
      "QuestionAndAnswer/UnlikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال آن‌لایک:", error);
    return {
      isSuccess: false,
      message: error.response?.data?.message || error.message,
      modelErrors: error.response?.data?.modelErrors || [],
    };
  }
};

export { sendUnlike };

const createQuestionsAdmin = async (
  formData: {
    goalIds: number[];
    questionTitle: string;
    questionText: string;
    tags: string[];
    mentionUserIds?: number[];
    attachments?: File[];
  },
  token: string
) => {
  try {
    const data = new FormData();

    formData.goalIds.forEach((id) => data.append("GoalIds", id.toString()));
    data.append("QuestionTitle", formData.questionTitle);
    data.append("QuestionText", formData.questionText);

    formData.tags.forEach((tag) => data.append("Tags", tag));

    if (formData.mentionUserIds) {
      formData.mentionUserIds.forEach((id) =>
        data.append("MentionUserId", id.toString())
      );
    }

    if (formData.attachments) {
      formData.attachments.forEach((file) =>
        data.append("QuestionAttachments", file)
      );
    }

    const response = await api.post("QuestionAndAnswer/CreateQuestion", data, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پرسش:", error);
    throw error;
  }
};

export { createQuestionsAdmin };

const getPendingQuestions = async () => {
  try {
    const response = await api.get(
      "QuestionAndAnswer/GetQuestionsForAdminConfirm"
    );
    return response.data;
  } catch (error) {
    console.error("❌ خطا در دریافت پرسش‌های در انتظار تأیید:", error);
    throw error;
  }
};

export { getPendingQuestions };

const acceptOrDeleteAnswerByAdmin = async (
  answerId: number, 
  index: string
) => {
  try {
    const response = await api.post(
     
      `QuestionAndAnswer/AcceptOrDeleteAnswerByAdmin`,
       null,
       {
      params: { answerId, index },
      headers: {
         Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("خطا در ارسال درخواست:", error);
    return null;
  }
};

export { acceptOrDeleteAnswerByAdmin };

const acceptOrDeleteQuestionByAdmin = async (
  questionId: number,
  index: string,
  goalId?: number | null
) => {
  try {
    const response = await api.post(
      `QuestionAndAnswer/AcceptOrDeleteQuestionByAdmin`,
      null,
      {
        params: { questionId, index, goalId: goalId ?? null, },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",

        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در ارسال درخواست:", error);
    return null;
  }
};

export { acceptOrDeleteQuestionByAdmin };

const getCommentsAdmin = async () => {
  try {
    const response = await api.get(
      "QuestionAndAnswer/GetAnswersForAdminConfirm "
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت سوالات:", error.response?.data || error);
    throw error;
  }
};

const getQuestionById = async (id: number): Promise<any | null> => {
  try {
    const res = await api.get("QuestionAndAnswer/GetQuestionById", {
      params: { questionId: id },
    });
    return res.data;
  } catch (err) {
    console.error("Error in getQuestionById:", err);
    return null;
  }
};

export { getQuestionById };

export { getCommentsAdmin };

const getAdminKnowledgeContent = async (
  goalId: number,
  searchText: string,
  pageNo: number = 1,
  pageSize: number = 9
) => {
  try {
    const response = await api.get(`KnowledgeContent/GetAllKnowledgeContentForAdmin`, {
        params: { 
        searchText,
        goalId,
        pageNo,
        pageSize,

         },
      }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت محتوای دانشی:", error);
    throw error;
  }
};

export { getAdminKnowledgeContent };

const deactivateKnowledgeContent = async (knowledgeContentId: number) => {
  try {
    const response = await api.post(
      `KnowledgeContent/DeactivateKnowledgeContent?knowledgeContentId=${knowledgeContentId}`,
      null, // چون body نداره
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deactivating content:", error);
    throw error;
  }
};
export { deactivateKnowledgeContent };

const getUsersGenerator = async (): Promise<
  ApiResponse<UserGeneratorItem>[]
> => {
  try {
    const response = await api.get("ProjectAndProposal/GetUsersGenerator");
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("داده‌ای دریافت نشد یا خطا در پاسخ API");
    }
  } catch (error) {
    console.error("خطا در دریافت کاربران تولیدکننده:", error);
    throw error;
  }
};

export default getUsersGenerator;

interface AddUserToGeneratorPayload {
  UserId: number[];
  Kind: string;
}

interface AddUserToGeneratorResponse {
  isSuccess: boolean;
  data: any;
  message: string;
  modelErrors?: any;
  pagingInfo?: any;
}

const addUserToGenerator = async (
  payload: AddUserToGeneratorPayload
): Promise<AddUserToGeneratorResponse> => {
  const formData = new FormData();

  payload.UserId.forEach((id) => {
    formData.append("UserId", id.toString());
  });

  formData.append("Kind", payload.Kind);

  try {
    const response = await api.post<AddUserToGeneratorResponse>(
      "ProjectAndProposal/AddUserToGenerator",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export { addUserToGenerator };

const deleteUserFromGenerator = async (id: number) => {
  try {
    const response = await api.post(
      `ProjectAndProposal/DeleteUsersGeneratorById/${id}`
    );
    if (response.status === 200) {
      console.log("کاربر با موفقیت حذف شد.");
    } else {
      console.warn("حذف کاربر موفق نبود:", response);
    }
  } catch (error) {
    console.error("خطا در حذف کاربر:", error);
    throw error;
  }
};

export { deleteUserFromGenerator };

const getAdminProjectAndpro = async () => {
  try {
    const response = await api.get(
      `ProjectAndProposal/GetProposalsForAdminConfirm`
    );

    if (response.data?.isSuccess) {
      return response.data.data;
    } else {
      console.error("خطا در دریافت پاسخ‌ها:", response.data?.message);
      return [];
    }
  } catch (error) {
    console.error("خطای سرور یا شبکه:", error);
    return [];
  }
};

export { getAdminProjectAndpro };

interface ConfirmProposalPayload {
  userIds: number[];
  entityId: number;
  goalId: number;
  unitIds: number[];
  title: string;
  abstract: string;
  ideaCode: string;
  proposalCode: string;
}

const confirmProposal = async (payload: ConfirmProposalPayload) => {
  try {
    const formData = new FormData();

    payload.userIds.forEach((id) => formData.append("UserId", id.toString()));
    payload.unitIds.forEach((id) => formData.append("UnitId", id.toString()));

    formData.append("EntityId", payload.entityId.toString());
    formData.append("GoalId", payload.goalId.toString());
    formData.append("Title", payload.title);
    formData.append("Abstract", payload.abstract);
    formData.append("IdeaCode", payload.ideaCode);
    formData.append("ProposalCode", payload.proposalCode);

    const response = await api.post(
      "ProjectAndProposal/ConfirmProposal",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پیشنهاد:", error);
    throw error;
  }
};

export { confirmProposal };


const confirmProject = async (payload: ConfirmProposalPayload) => {
  try {
    const formData = new FormData();

    payload.userIds.forEach((id) => formData.append("UserId", id.toString()));
    payload.unitIds.forEach((id) => formData.append("UnitId", id.toString()));

    formData.append("EntityId", payload.entityId.toString());
    formData.append("GoalId", payload.goalId.toString());
    formData.append("Title", payload.title);
    formData.append("Abstract", payload.abstract);
    formData.append("IdeaCode", payload.ideaCode);
    formData.append("ProposalCode", payload.proposalCode);

    const response = await api.post(
      "Project/ConfirmProject",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پیشنهاد:", error);
    throw error;
  }
};

export { confirmProject };



const getProjectAdmin = async () => {
  try {
    const response = await api.get(`Project/GetProjectsForAdminConfirm`);

    if (response.data?.isSuccess) {
      return response.data.data;
    } else {
      console.error("خطا در دریافت پاسخ‌ها:", response.data?.message);
      return [];
    }
  } catch (error) {
    console.error("خطای سرور یا شبکه:", error);
    return [];
  }
};

export { getProjectAdmin };

const getGroupWork = async () => {
  try {
    const response = await api.get(`Documentation/GetAllPositions`);

    if (response.data?.isSuccess) {
      return response.data; // کل آبجکت برمی‌گرده
    } else {
      console.error("خطا در دریافت پاسخ‌ها:", response.data?.message);
      return {
        isSuccess: false,
        data: [],
        message: response.data?.message || "خطا",
      };
    }
  } catch (error) {
    console.error("خطای سرور یا شبکه:", error);
    return { isSuccess: false, data: [], message: "خطای سرور یا شبکه" };
  }
};

export { getGroupWork };



const getPositionsForCurrentDepartment = async () => {
  try {
    const response = await api.get(`Documentation/GetPositionsForCurrentDepartment`);

    if (response.data?.isSuccess) {
      return response.data; // کل آبجکت برمی‌گرده
    } else {
      console.error("خطا در دریافت پاسخ‌ها:", response.data?.message);
      return {
        isSuccess: false,
        data: [],
        message: response.data?.message || "خطا",
      };
    }
  } catch (error) {
    console.error("خطای سرور یا شبکه:", error);
    return { isSuccess: false, data: [], message: "خطای سرور یا شبکه" };
  }
};

export { getPositionsForCurrentDepartment };



interface AddPositionPayload {
  PositionName: string;
  UnitId: number;
}

const addPosition = async (payload: AddPositionPayload): Promise<any> => {
  const formData = new FormData();
  formData.append("PositionName", payload.PositionName);
  formData.append("UnitId", payload.UnitId.toString());

  try {
    const response = await api.post("Documentation/AddPosition", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("خطا در ارسال موقعیت:", error);
    throw error;
  }
};

export { addPosition };

const deleteGroupWork = async (positionId: number): Promise<void> => {
  try {
    const response = await api.post(`Documentation/DeletePosition`, null, {
      params: { positionId },
    });
    if (response.status === 200) {
      console.log("کاربر با موفقیت حذف شد.");
    } else {
      console.warn("حذف کاربر موفق نبود:", response);
    }
  } catch (error) {
    console.error("خطا در حذف کاربر:", error);
    throw error;
  }
};

export { deleteGroupWork };

const addUserToOwner = async (userId: number, goalId: number) => {
  try {
    const formData = new FormData();
    formData.append("UserId", userId.toString());
    formData.append("GoalId", goalId.toString());

    const response = await api.post(
      "ProcessProfessional/AddUserToOwner",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در افزودن مالک فرایند:", error);
    return null;
  }
};

export { addUserToOwner };

const deleteExpertOrOwner = async (userId: number, goalId: number) => {
  try {
    const response = await api.post(
      `ProcessProfessional/DeleteExpertOrOwner/${userId}?goalId=${goalId}`,
      null, // body خالی است
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در حذف Expert یا Owner:", error);
    return {
      isSuccess: false,
      message: error.response?.data?.message || "خطا در ارتباط با سرور",
    };
  }
};
export { deleteExpertOrOwner };

const addUserToExpert = async (userId: number, goalId: number) => {
  try {
    const formData = new FormData();
    formData.append("UserId", userId.toString());
    formData.append("GoalId", goalId.toString());

    const response = await api.post(
      "ProcessProfessional/AddUserToExpert",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در افزودن کاربر به خبره:", error);
    return null;
  }
};

export { addUserToExpert };

const addUserToAdmins = async ({
  UserId,
  Kind,
}: {
  UserId: number;
  Kind: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("UserId", UserId.toString());
    formData.append("Kind", Kind);

    const response = await api.post(
      "ProcessProfessional/AddUserToAdmins",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در افزودن کاربر:", error);
    return { isSuccess: false, message: "خطا در ارسال اطلاعات" };
  }
};

export { addUserToAdmins };

const deleteAdminById = async (id: number) => {
  try {
    const response = await api.post(
      `ProcessProfessional/DeleteAdminById/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(" خطا در حذف ادمین:", error);
    return { isSuccess: false, message: "خطا در حذف ادمین" };
  }
};

export { deleteAdminById };

const createProposal = async (payload: {
  goalId: number;
  title: string;
  abstract: string;
  ideaCode: string;
  tags: string[];
  proposalAttachments: File[];
}) => {
  try {
    const formData = new FormData();

    formData.append("GoalId", String(payload.goalId));
    formData.append("Title", payload.title);
    formData.append("Abstract", payload.abstract);
    formData.append("IdeaCode", payload.ideaCode);

    // افزودن تگ‌ها
    payload.tags.forEach((tag) => {
      formData.append("Tags", tag);
    });

    payload.proposalAttachments.forEach((file) => {
      formData.append("ProposalAttachments", file);
    });

    const response = await api.post(
      "ProjectAndProposal/CreateProposal",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پروپوزال:", error);
    return { isSuccess: false, message: "ارسال پروپوزال ناموفق بود" };
  }
};

export { createProposal };

const getProfilePicture = async (token: string, requestData: any) => {
  try {
    const response = await axios.post(
      "https://integrationapi.tipax.ir/api/v2/PersonProfilePicture/Search",
      requestData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در دریافت عکس پروفایل:", error);
    throw error;
  }
};

export { getProfilePicture };

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface KnowledgeContent {
  id: number;
  title: string;
  // بقیه فیلدها ...
}

const fetchAwaitingConfirmationKnowledgeContent = async (
  pageNo: number = 1
): Promise<ApiResponse<KnowledgeContent[]>> => {
  try {
    const response = await api.get<ApiResponse<KnowledgeContent[]>>(
      "KnowledgeContent/GetAwaitingConfirmationKnowledgeContent",
      {
        params: { pageNo },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در دریافت داده‌ها:", error);
    return {
      data: [],
      success: false,
      message: (error as Error).message,
    };
  }
};

export { fetchAwaitingConfirmationKnowledgeContent };

const confirmKnowledgeContent = async (knowledgeContentId: number) => {
  try {
    const response = await api.post(
      `KnowledgeContent/ConfirmOrNotConfirmKnowledgeContent?knowledgeContentId=${knowledgeContentId}`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در تایید محتوا:", error);
    throw error;
  }
};

export { confirmKnowledgeContent };

const searchKnowledgeContents = async (
  searchText: string,
  pageNo: number = 1,
  pageSize: number = 9,
  goalId?: number | null          // 👈 عدد یا null/undefined
) => {
  try {
    const params: any = {
      knowledgeContentFilter: "All",
      searchText,
      pageNo,
      pageSize,
      
    };

    // فقط وقتی goalId داری بفرست
    if (goalId !== undefined && goalId !== null) {
      params.goalId = goalId;     // 👈 اینجا عدد میره، نه رشته
    }

    const response = await api.get("KnowledgeContent/GetKnowledgeContent", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge contents:", error);
    throw error;
  }
};

export { searchKnowledgeContents };


interface GetUnitDocumentationParams {
  documentationFilter: string;
  searchText?: string;
  pageNo?: number;
}

const getUnitDocumentation = async ({
  documentationFilter,
  searchText = "",
  pageNo = 1,
}: GetUnitDocumentationParams) => {
  try {
    const response = await api.get("Documentation/GetUnitDocumentation", {
      params: {
        documentationFilter,
        searchText,
        pageNo,
      },
    });

    return response.data;
  } catch (error) {
    console.error("خطا در دریافت مستندات واحد:", error);
    throw error;
  }
};

const getMyDocumentations = async () => {
  try {
    const response = await api.get("Documentation/GetUnitDocumentation", {
      params: {
        documentationFilter: "MyDocumentation",
        searchText: "",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ خطا در دریافت مستندات من:", error);
    throw error;
  }
};

export { getMyDocumentations };

export { getUnitDocumentation };

interface ChangeKnowledgeContentTypeParams {
  KnowledgeContentId: number;
  Title: string;
  Abstract: string;
  Text: string;
  Tags?: string[];
  MentionUserId?: number[];
  References?: string[];
  KnowledgeContentAttachments?: File[];
}

const changeKnowledgeContentType = async (
  params: ChangeKnowledgeContentTypeParams,
  token: string
): Promise<any> => {
  const formData = new FormData();

  formData.append("KnowledgeContentId", params.KnowledgeContentId.toString());
  formData.append("Title", params.Title);
  formData.append("Abstract", params.Abstract);
  formData.append("Text", params.Text);

  params.Tags?.forEach((tag) => formData.append("Tags", tag));
  params.MentionUserId?.forEach((id) =>
    formData.append("MentionUserId", id.toString())
  );
  params.References?.forEach((ref) => formData.append("References", ref));
  params.KnowledgeContentAttachments?.forEach((file) =>
    formData.append("KnowledgeContentAttachments", file)
  );

  try {
    const response = await api.post(
      "KnowledgeContent/ChangeKnowledgeContentType",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing knowledge content type:", error);
    throw error;
  }
};

export { changeKnowledgeContentType };

interface UpdateGoalData {
  Id: number;
  GoalTitle: string;
  GoalDescription: string;
  StartPersianDate: string;
  EndPersianDate: string;
  GoalType: number;
  ParentId: number;
  UserId: number;
}

const updateGoal = async (goalData: UpdateGoalData) => {
  try {
    const formData = new FormData();

    if (goalData.Id === undefined) throw new Error("Id is undefined");
    formData.append("Id", goalData.Id.toString());

    if (!goalData.GoalTitle) throw new Error("GoalTitle is missing");
    formData.append("GoalTitle", goalData.GoalTitle);

    formData.append("GoalDescription", goalData.GoalDescription || "");

    formData.append("StartPersianDate", goalData.StartPersianDate || "");

    formData.append("EndPersianDate", goalData.EndPersianDate || "");

    if (goalData.GoalType === undefined)
      throw new Error("GoalType is undefined");
    formData.append("GoalType", goalData.GoalType.toString());

    if (goalData.ParentId === undefined)
      throw new Error("ParentId is undefined");
    formData.append("ParentId", goalData.ParentId.toString());

    if (goalData.UserId === undefined) throw new Error("UserId is undefined");
    formData.append("UserId", goalData.UserId.toString());

    const response = await api.post("General/UpdateGoal", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("خطا در آپدیت هدف:", error);
    throw error;
  }
};

export { updateGoal };

const getUnitDocumentations = async () => {
  try {
    const response = await api.get("Documentation/GetUnitDocumentation", {
      params: {
        documentationFilter: "AllDocumentation",
        searchText: "",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ خطا در دریافت مستندات:", error);
    throw error;
  }
};

export { getUnitDocumentations };

const getUnitDocumentationsAwait = async () => {
  try {
    const response = await api.get("Documentation/GetUnitDocumentation", {
      params: {
        documentationFilter: "AwaitingConfirmation",
        searchText: "",
        pageNo: 1,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ خطا در دریافت مستندات:", error);
    throw error;
  }
};

export { getUnitDocumentationsAwait };



 const acceptDocumentation = async (model: {
  documentationId: number;
  title?: string;
  text?: string;
}) => {
  const formData = new FormData();
  formData.append("DocumentationId", String(model.documentationId));
  if (model.title !== undefined) formData.append("Title", model.title);
  if (model.text !== undefined) formData.append("Text", model.text);

  const res = await api.post("/Documentation/AcceptDocumentation", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // { isSuccess, data, message, ... }
};

export { acceptDocumentation  };

const addSubstituteToDepartment = async (userIds: number[]) => {
  try {
    const formData = new FormData();
    userIds.forEach((id) => formData.append("UserIds", id.toString()));

    const response = await api.post(
      "Documentation/AddSubstituteToDepartment",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در اضافه کردن جانشین:", error);
    throw error;
  }
};


export { addSubstituteToDepartment };


const CommentProject = async (formData: FormData, token: string) => {
   return await api.post(
    'Project/CreateProjectComment',
formData,
{
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export { CommentProject };



const getCommentOfProject = async (
  projectId: number,
  pageNo: number
) => {
  try {
    const response = await api.get("Project/GetCommentOfProject", {
      params: {
        projectId,
        pageNo,
      },
    });

    return response.data;
  } catch (error) {
    console.error("خطا در دریافت کامنت‌ها:", error);
    throw error;
  }
};

export { getCommentOfProject };

const likeProjectComment = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "7");

    const response = await api.post(
      "Project/LikeProjectComment",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { likeProjectComment };

const unlikeProjectComment = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "7");

    const response = await api.post(
      "Project/UnlikeProjectComment",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { unlikeProjectComment };


const likeProject = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "6");

    const response = await api.post(
      "Project/LikeProject",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { likeProject };

const unLikeProject = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "6");

    const response = await api.post(
      "Project/UnlikeProject",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { unLikeProject };



// ------------ LIKE --------------------------------
const likeKnowledgeContent = async (entityId: number, userId: number, token: string) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "2");

    const response = await api.post(
      "KnowledgeContent/LikeKnowledgeContent",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { likeKnowledgeContent };

const unlikeKnowledgeContent = async (entityId: number, userId: number, token: string) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "2");

    const response = await api.post(
      "KnowledgeContent/UnlikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { unlikeKnowledgeContent };


const likeComment = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "3");

    const response = await api.post("KnowledgeContent/LikeComment", formData, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { likeComment };


const UnlikeComment = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "3");

    const response = await api.post(
      "KnowledgeContent/UnlikeComment",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { UnlikeComment };


const likeQuestion = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "0");

    const response = await api.post(
      "QuestionAndAnswer/LikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { likeQuestion };


const unlikeQuestion = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "0");

    const response = await api.post(
      "QuestionAndAnswer/UnlikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn("⚠️ Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error("modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { unlikeQuestion };


const likeAnswer = async (
  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "1");

    const response = await api.post(
      "QuestionAndAnswer/LikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { likeAnswer };

const unlikeAnswer = async (

  entityId: number,
  userId: number,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", "1");

    const response = await api.post(
      "QuestionAndAnswer/UnlikeQuestionAnswer",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn(" Like not successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("خطا در ارسال لایک:", error);

    if (error.response?.data?.modelErrors) {
      console.error(" modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};
export { unlikeAnswer };



const addVisitPageView = async (
  entityId: number,
  userId: number,
  entityType: number,   
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("EntityId", entityId.toString());
    formData.append("UserId", userId.toString());
    formData.append("EntityType", entityType.toString()); 

    const response = await api.post(
      "General/AddVisitPageView",
      formData,
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess) {
      return { success: true, data: response.data };
    } else {
      console.warn("successful:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error: any) {
    console.error("خطا:", error);

    if (error.response?.data?.modelErrors) {
      console.error("modelErrors:", error.response.data.modelErrors);
    }

    return { success: false, message: error.message };
  }
};

export { addVisitPageView };




//----------  Documentation ----------------

const CreateUnitDocumentation = async (formData: FormData, token: string) => {
  return await api.post(
    `Documentation/CreateUnitDocumentation`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export { CreateUnitDocumentation };
