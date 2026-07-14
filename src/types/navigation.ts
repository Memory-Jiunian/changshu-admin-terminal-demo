import type { StudentProfileFilterQuery } from "@/types/studentProfile";

export type StudentProfileReturnState = {
  query: StudentProfileFilterQuery;
  page: number;
  selectedStudentId: string | null;
  drawerOpen: boolean;
  drawerScrollTop: number;
  browsePageBeforeSearch: number;
};

export type StudentProfileWarningReturnContext = {
  source: "student-profile";
  warningId: string;
  profileState: StudentProfileReturnState;
};
