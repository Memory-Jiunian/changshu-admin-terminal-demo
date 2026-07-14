import type { StudentProfileFilterQuery } from "@/types/studentProfile";

export type StudentProfileReturnState = {
  query: StudentProfileFilterQuery;
  page: number;
  selectedStudentId: string | null;
  drawerOpen: boolean;
  drawerView: "profile" | "case_detail";
  selectedCaseId?: string;
  profileScrollTop: number;
  caseDetailScrollTop: number;
  expandedRecordSections: string[];
  browsePageBeforeSearch: number;
};

export type StudentProfileWarningReturnContext = {
  source: "student-profile";
  warningId: string;
  profileState: StudentProfileReturnState;
};
