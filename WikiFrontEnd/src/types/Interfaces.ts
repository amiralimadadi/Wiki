import type { Mention } from "../components/common/ArticleCard";

export interface Tab {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
}

export interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
}

export interface TabsNavProps {
  tabs: TabItem[];
  activeKey: string;
  onTabClick: (key: string, path?: string) => void;
}

export interface NotificationItem {
  title: string;
  description: string;
}

export interface NotificationListProps {
  items: NotificationItem[];
  onClearAll?: () => void;
}

export interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface MenuItemType {
  key: string;
  title: string;
  path?: string;
  children?: MenuItemType[];
}

export interface ReactNode {
  children: ReactNode;
}

// -------------------------------------------------------------------------//
// types/Interfaces.ts
export interface GoalItem {
  id: number;
  goalTitle: string;
  goalDescription: string;
  parentId: number | null;
  parentTitle: string | null;
}

export interface MenuItemType {
  key: string;
  title: string;
  path?: string;
  children?: MenuItemType[];
}

// -------------------------------------------------------------------------//
// گرفتن دیتاهای صفحه اول
export type KnowledgeContentFilterType =
  | "AllKnowledgeContent"
  | "Structured"
  | "NonStructured"
  | "MyKnowledgeContent"
  | "MentionedKnowledgeContent"
  | "ExpertConfirm";

export interface GetKnowledgeContentParams {
  knowledgeContentFilter?: KnowledgeContentFilterType;
  searchText?: string;
  goalId?: number;
  pageNo?: number;
}

export interface KnowledgeContent {
  id: number;
  title: string;
  abstract: string;
  text: string;
  type: "Structured" | "NonStructured";
  createdAt: string;
}

interface User {
  igtUserId: number;
  id: number;
  fullName: string;
  userName: string;
}

interface Tag {
  tagTitle: string;
  createdUserId: string;
}

export interface Articles {
  id: number;
  title: string;
  knowledgeContentType: string;
  createdDate: string;
  code: string;
  user: {
    fullName: string;
  };
  goalTitle: string;
  abstract: string;
  text: string;
  attachments?: {
    id?: number;
    address?: string;
    name?: string;
  }[];
  commentCount?: number;
  isLiked?: boolean;
  likeCount?: number;
  pageViewCount?: number;
  tags: {
    tagTitle: string;
  }[];
  mentions?: {
    userId: number;
    fullName?: string;
  }[];
  references: string;
}

// کامنت های صفحه اول

export interface CreateCommentParams {
  commentText: string;
  userId: number;
  knowledgeContentId: number;
  mentionUserIds?: number[];
  tags?: string[];
  commentAttachments?: File[];
}

export interface CreateAnswerParams {
  answerText: string;
  userId: number;
  questionId: number;
  mentionUserId?: number[];
  tags?: string[];
  answerAttachments?: File[];
}
//---------------------------------------Projects

export interface Project {
  id: number;
  title: string | null;
  abstract: string | null;
  goalTitle: string | null;
  proposalCode: string | null;
  goalId: number;
  code: string;
  createdDate: string;
  likeCount: number | null;
  commentCount: number | null;
  ideaCode: string | null;
  isLiked: boolean;
  user: User | null;
  tags: Tag[];
  attachments: Attachment[];
}

//---------------------------------------Prposals

export interface Proposal {
  id: number;
  title: string | null;
  abstract: string | null;
  goalTitle: string | null;
  goalId: number;
  code: string;
  createdDate: string;
  likeCount: number | null;
  commentCount: number | null;
  isLiked: boolean;
  ideaCode: string | null;
  user: User | null;
  pageViewCount?: number;
  tags: Tag[];
  attachments: Attachment[];
}

// --------------------------------------quastions

export interface Question {
  id: number;
  questionTitle: string;
  questionText: string;
  questionType: string;
  goalTile: string[];
  questionAnswers: [];
  user: User;
  attachments?: {
    id?: number;
    address?: string;
    name?: string;
  }[];
  tags: Tag[];
  mentions: [] | null;
  likeCount: number;
  answerCount: number;
  isLiked: boolean;
  mentionUserIds: number[] | null;

  goalTitle: null | string;
  createdDate: string;
  commentCount: string;
}

interface Tag {
  tagTitle: string;
  createdUserId: string;
}

interface User {
  id: number;
  igtUserId: number;
  fullName: string;
  userName: string;
}


// --------------------------------------quastions

export interface Answer {
  id: number;
  answerText: string;
  likeCount: number;
  isLiked: boolean;
  tags: Tag[];
  user: User;
  mentions: [] | null;
  attachments?: {
    id?: number;
    address?: string;
    name?: string;
  }[];
  createdDate: string;
  mentionUserIds: number[] | null;
}

// -------------افراد برتر
export interface BestUsers {
  currentMedal: string;
  firstName: string | null;
  fullName: string;
  remainingScoreText: null;
  totalScoreAmount: number;
  userId: number;
  userName: string;
}

// اطلاعات اولیه کاربر

export interface dataUserCurrent {
  currentMedal: string;
  firstName: string;
  fullName: string;
  remainingScoreText: string;
  totalScoreAmount: string;
  userId: number;
  userName: string;
}

// نوتیفیکیشن

export interface Notification {
  contextId: number;
  creationDate: string;
  creationTime: string;
  creator: string;
  creatorId: number;
  description: string;
  frontendRoute: string | null;
  frontendRouteId: number;
  fullName: string;
  id: number;
  isActive: boolean;
  modificationDate: string;
  modificationTime: string;
  modifier: string;
  modifierId: number;
  personId: number;
  seen: boolean;
  sendDate: string;
  sendInApp: boolean;
  sendSMS: boolean;
  title: string;
  userId: number;
}

// ---------------------کامنت ها
export interface CommentUser {
  igtUserId: number;
  id: number;
  fullName: string;
  userName: string;
}

export interface CommentTag {
  id: number;
  tagTitle: string;
}

export interface CommentItem {
  id: number;
  commentText: string;
  likeCount: number;
  isLiked: boolean;
  tags: CommentTag[];
  attachments: [];
  mentionUserIds: number[] | null;
  mentions: null;
  user: CommentUser;
}

export interface PagingInfo {
  pageId: number;
  pageCount: number;
  allEntitiesCount: number;
  startPage: number;
  endPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetCommentsResponse {
  data: CommentItem[];
  isSuccess: boolean;
  message: string;
  modelErrors: string[];
  pagingInfo: PagingInfo;
}

export interface GetAnswerResponse {
  data: Answer[];
  isSuccess: boolean;
  message: string;
  modelErrors: string[];
  pagingInfo: PagingInfo;
}

// -------------------------------کامنت قسمت پرسش
export interface CommentResponse {
  data: {
    id: number;
    commentText: string;
    isLiked: boolean;
    likeCount: number;
    mentions: Mention[];
    tags: Tag[];
    user: {
      fullName: string;
      id: number;
      igtUserId: number;
      userName: string;
    };
    attachments?: [];
  }[];
  isSuccess?: boolean;
  message?: string;
  modelErrors?: string;
  pagingInfo?: string;
}

//-----------------------------طرح ها

interface Attachment {
  id: number;
  name: string;
  address: string;
}

interface Tag {
  // مشخصات تگ ها را خودت کامل کن اگر داری
  // مثال:
  id?: number;
  name?: string;
}

interface User {
  igtUserId: number;
  id: number;
  fullName: string;
  userName: string;
}

interface ProposalItem {
  id: number;
  code: string;
  ideaCode: string;
  title: string;
  abstract: string;
  createdDate: string;
  goalId: number;
  goalTitle: string;
  attachments: Attachment[];
  commentCount: number;
  isCreator: boolean;
  isLiked: boolean;
  likeCount: number;
  tags: Tag[];
  user: User;
  goalTile: string;
}

interface PagingInfos {
  pageNo?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface ProposalResponse {
  isSuccess: boolean;
  data: ProposalItem[];
  message: string;
  modelErrors: [];
  pagingInfo: PagingInfos;
}

// allpersonal
export interface CommentsP {
  id: number;
  user: {
    fullName: string;
  };
  commentText: string;
  createdDate: string;
  isLiked: boolean;
  likeCount: number;
  mentions?: Mention[];
  tags?: { tagTitle: string }[];
  attachments?: Attachment[];
}

export interface ProfilePic {
  title: string;
  path: string;
  isDefault: boolean;
}

export interface ProfilePicResponse {
  isSuccess: boolean;
  data: ProfilePic[];
  message?: string;
}

export interface CreateQuestionPayload {
  goalIds: number[];
  questionTitle: string;
  questionText: string;
  Tags?: string[];
  tags?: string[];
  mentionUserIds?: number[];
  attachments?: File[];
}

export interface QuestionData {
  key: number;
  row: number;
  category: string;
  title: string;
  text: string;
  registrar: string;
  deleted: string;
  active: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  modelErrors: null;
  pagingInfo: null;
}

interface UserViewer {
  userId: number;
  fullName: string;
}

export interface UserGeneratorItem {
  id: number;
  kind: string;
  userViewer: UserViewer[];
}

export interface AddUserToGeneratorPayload {
  UserId: number[];
  Kind: number;
}
