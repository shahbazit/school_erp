namespace SchoolERP.Domain.Enums;

public enum EmploymentType
{
    FullTime = 1,
    PartTime = 2,
    Contract = 3,
    Intern = 4
}

public enum EmployeeStatus
{
    Active = 1,
    Inactive = 2,
    OnLeave = 3,
    Terminated = 4
}

public enum DocumentType
{
    Resume = 1,
    Certificate = 2,
    IdProof = 3,
    EducationDocument = 4,
    ExperienceLetter = 5,
    Other = 6
}

public enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    HalfDay = 3,
    Late = 4,
    OnLeave = 5
}

public enum LeaveStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}

public enum SalaryComponentType
{
    Earning = 1,
    Deduction = 2
}

public enum PayrollStatus
{
    Draft = 1,
    Processed = 2,
    Approved = 3,
    Paid = 4,
    Rejected = 5
}

public enum LeaveDayType
{
    FullDay = 1,
    FirstHalf = 2,
    SecondHalf = 3,
    Quarter = 4
}
