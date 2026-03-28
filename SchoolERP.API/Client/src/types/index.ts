// API Types configuration

export interface LoginRequest {
  email: string;
  password?: string;
  schoolDomain?: string;
}

export interface RegisterRequest {
  email: string;
  mobileNumber: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RegisterStepOneRequest {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password?: string;
}

export interface FinalizeRegistrationRequest {
  registrationUid: string;
  schoolName: string;
  schoolDomain: string;
  city: string;
  address: string;
  otp: string;
}

export interface GenerateOtpRequest {
  mobileNumber: string;
}

export interface VerifyOtpRequest {
  mobileNumber: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  errors?: string[];
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface StudentCourseDto {
  courseId: string;
  courseName: string;
  batchId?: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export interface AssignCourseDto {
  courseId: string;
  batchId?: string;
}

export interface Student {
  id?: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  studentPhoto?: string;
  mobileNumber: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  classId: string;
  sectionId: string;
  rollNumber?: string;
  admissionDate: string;
  academicYear: string;
  previousSchool?: string;
  fatherName?: string;
  fatherMobile?: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherMobile?: string;
  motherEmail?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  isActive: boolean;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
  enrolledCourses: StudentCourseDto[];
  ledgerNumber?: string;
  srnNumber?: string;
  permanentEducationNo?: string;
  familyId?: string;
  apaarId?: string;
  medium?: string;
  enrollmentSchoolName?: string;
  openingBalance?: number;
  admissionScheme?: string;
  admissionType?: string;
  religion?: string;
  category?: string;
  caste?: string;
  placeOfBirth?: string;
  heightInCM?: number | string;
  weightInKG?: number | string;
  colorVision?: string;
  previousClass?: string;
  tcNo?: string;
  tcDate?: string;
  houseName?: string;
  isCaptain?: boolean;
  isMonitor?: boolean;
  bus?: string;
  routeName?: string;
  stoppageName?: string;
  busFee?: number;
  studentAadharNo?: string;
  studentBankAccountNo?: string;
  studentBankName?: string;
  studentIFSCCODE?: string;
  fatherAadharNo?: string;
  parentAccountNo?: string;
  parentBankName?: string;
  parentBankIFSCCODE?: string;
  motherAadharNo?: string;
  registrationNumber?: string;
  annualIncome?: number;
  fatherQualification?: string;
  motherQualification?: string;
  parentMobileNumber?: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentQualification?: string;
  smsFacility?: boolean;
  smsMobileNumber?: string;
  permanentAddress?: string;
  feeSubscriptions: any[];
  feeDiscounts: any[];
}

export interface CreateStudentDto {
  admissionNo?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  mobileNumber: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  classId: string;
  sectionId: string;
  rollNumber?: string;
  admissionDate: string;
  academicYear: string;
  fatherName: string;
  fatherMobile: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName: string;
  motherMobile: string;
  motherEmail?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  consentAccepted: boolean;
  courseIds: AssignCourseDto[];
  ledgerNumber?: string;
  srnNumber?: string;
  permanentEducationNo?: string;
  familyId?: string;
  apaarId?: string;
  medium?: string;
  enrollmentSchoolName?: string;
  openingBalance?: number;
  admissionScheme?: string;
  admissionType?: string;
  religion?: string;
  category?: string;
  caste?: string;
  placeOfBirth?: string;
  heightInCM?: number | string;
  weightInKG?: number | string;
  colorVision?: string;
  previousClass?: string;
  tcNo?: string;
  tcDate?: string;
  houseName?: string;
  isCaptain?: boolean;
  isMonitor?: boolean;
  bus?: string;
  routeName?: string;
  stoppageName?: string;
  busFee?: number;
  studentAadharNo?: string;
  studentBankAccountNo?: string;
  studentBankName?: string;
  studentIFSCCODE?: string;
  fatherAadharNo?: string;
  parentAccountNo?: string;
  parentBankName?: string;
  parentBankIFSCCODE?: string;
  motherAadharNo?: string;
  registrationNumber?: string;
  annualIncome?: number;
  fatherQualification?: string;
  motherQualification?: string;
  parentMobileNumber?: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentQualification?: string;
  smsFacility?: boolean;
  smsMobileNumber?: string;
  permanentAddress?: string;
  feeSubscriptions: any[];
  feeDiscounts: any[];
}

export interface UpdateStudentDto {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  mobileNumber: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  classId: string;
  sectionId: string;
  rollNumber?: string;
  academicYear: string;
  fatherName: string;
  fatherMobile: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName: string;
  motherMobile: string;
  motherEmail?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  isActive: boolean;
  courseIds: AssignCourseDto[];
  ledgerNumber?: string;
  srnNumber?: string;
  permanentEducationNo?: string;
  familyId?: string;
  apaarId?: string;
  medium?: string;
  enrollmentSchoolName?: string;
  openingBalance?: number;
  admissionScheme?: string;
  admissionType?: string;
  religion?: string;
  category?: string;
  caste?: string;
  placeOfBirth?: string;
  heightInCM?: number | string;
  weightInKG?: number | string;
  colorVision?: string;
  previousClass?: string;
  tcNo?: string;
  tcDate?: string;
  houseName?: string;
  isCaptain?: boolean;
  isMonitor?: boolean;
  bus?: string;
  routeName?: string;
  stoppageName?: string;
  busFee?: number;
  studentAadharNo?: string;
  studentBankAccountNo?: string;
  studentBankName?: string;
  studentIFSCCODE?: string;
  fatherAadharNo?: string;
  parentAccountNo?: string;
  parentBankName?: string;
  parentBankIFSCCODE?: string;
  motherAadharNo?: string;
  registrationNumber?: string;
  annualIncome?: number;
  fatherQualification?: string;
  motherQualification?: string;
  parentMobileNumber?: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentQualification?: string;
  smsFacility?: boolean;
  smsMobileNumber?: string;
  permanentAddress?: string;
  admissionDate: string;
  feeSubscriptions: any[];
  feeDiscounts: any[];
}

export enum LookupType {
  Relation = 0,
  BloodGroup = 1,
  Gender = 2,
  Category = 3,
  Religion = 4,
  Language = 5,
  EmploymentType = 6,
  PaymentMode = 7,
  Bank = 8,
  AttendanceStatus = 9,
  LeaveType = 10,
  Route = 11,
  Stop = 12,
  Vehicle = 13,
  ExamType = 14,
  Grade = 15,
  ResultStatus = 16,
  NotificationType = 17
}

export interface Lookup {
  id: string;
  type: LookupType;
  typeName: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateLookupDto {
  type: LookupType;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Master {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export interface AcademicClass extends Master {
  order: number;
}

export interface Subject extends Master {
  code: string;
}

export interface AcademicYear extends Master {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Room extends Master {
  roomNo: string;
  type?: string;
  capacity: number;
}

export interface Country extends Master {
  code?: string;
}

export interface State extends Master {
  countryId: string;
}

export interface City extends Master {
  stateId: string;
}

