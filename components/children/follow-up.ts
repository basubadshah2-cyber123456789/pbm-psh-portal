export type FollowUpRecord = {
  id: string;
  name: string;
  className: string;
  instituteName: string;
  passedFrom: string;
  boardRegistrationNumber: string;
  rollNumber: string;
  passingYear: string;
  totalMarks: string;
  obtainedMarks: string;
  pshRegistrationNumber: string;
  passedFromPsh: string;
};

export const createEmptyFollowUp = (overrides: Partial<FollowUpRecord> = {}): FollowUpRecord => ({
  id: '',
  name: '',
  className: '',
  instituteName: '',
  passedFrom: '',
  boardRegistrationNumber: '',
  rollNumber: '',
  passingYear: '',
  totalMarks: '',
  obtainedMarks: '',
  pshRegistrationNumber: '',
  passedFromPsh: '',
  ...overrides,
});
