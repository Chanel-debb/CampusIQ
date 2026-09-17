export const PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
] as const;

export const USER_ROLES = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "counselor", label: "Counselor" },
] as const;

export const JOB_OUTLOOK_TONE: Record<string, "green" | "blue" | "amber" | "red"> = {
  bright: "green",
  growing: "blue",
  stable: "amber",
  declining: "red",
};
