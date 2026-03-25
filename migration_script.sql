IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [AcademicClasses] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Order] int NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_AcademicClasses] PRIMARY KEY ([Id])
);

CREATE TABLE [AcademicSections] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_AcademicSections] PRIMARY KEY ([Id])
);

CREATE TABLE [AcademicStreams] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_AcademicStreams] PRIMARY KEY ([Id])
);

CREATE TABLE [AcademicYears] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [IsCurrent] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_AcademicYears] PRIMARY KEY ([Id])
);

CREATE TABLE [Countries] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Code] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Countries] PRIMARY KEY ([Id])
);

CREATE TABLE [Courses] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Code] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [OptionalFee] decimal(18,2) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Courses] PRIMARY KEY ([Id])
);

CREATE TABLE [Departments] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY ([Id])
);

CREATE TABLE [Designations] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Designations] PRIMARY KEY ([Id])
);

CREATE TABLE [EmployeeRoles] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_EmployeeRoles] PRIMARY KEY ([Id])
);

CREATE TABLE [Exams] (
    [Id] uniqueidentifier NOT NULL,
    [ExamName] nvarchar(max) NOT NULL,
    [AcademicYear] nvarchar(max) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Exams] PRIMARY KEY ([Id])
);

CREATE TABLE [FeeConfigurations] (
    [Id] uniqueidentifier NOT NULL,
    [MonthlyDueDay] int NOT NULL,
    [GracePeriodDays] int NOT NULL,
    [LateFeeType] nvarchar(max) NOT NULL,
    [LateFeeAmount] decimal(18,2) NOT NULL,
    [AutoCalculateLateFee] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [Frequency] nvarchar(max) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_FeeConfigurations] PRIMARY KEY ([Id])
);

CREATE TABLE [FeeDiscounts] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Category] nvarchar(max) NOT NULL,
    [CalculationType] nvarchar(max) NOT NULL,
    [Value] decimal(18,2) NOT NULL,
    [Frequency] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_FeeDiscounts] PRIMARY KEY ([Id])
);

CREATE TABLE [FeeHeads] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsSelective] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_FeeHeads] PRIMARY KEY ([Id])
);

CREATE TABLE [Labs] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Labs] PRIMARY KEY ([Id])
);

CREATE TABLE [LeaveTypes] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [MaxDaysPerYear] int NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_LeaveTypes] PRIMARY KEY ([Id])
);

CREATE TABLE [Lookups] (
    [Id] uniqueidentifier NOT NULL,
    [Type] int NOT NULL,
    [Code] nvarchar(max) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Lookups] PRIMARY KEY ([Id])
);

CREATE TABLE [MenuMasters] (
    [Id] uniqueidentifier NOT NULL,
    [Key] nvarchar(max) NOT NULL,
    [Label] nvarchar(max) NOT NULL,
    [Icon] nvarchar(max) NULL,
    [SortOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_MenuMasters] PRIMARY KEY ([Id])
);

CREATE TABLE [MenuPermissions] (
    [Id] uniqueidentifier NOT NULL,
    [RoleName] nvarchar(450) NULL,
    [UserId] uniqueidentifier NULL,
    [MenuKey] nvarchar(450) NOT NULL,
    [IsVisible] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_MenuPermissions] PRIMARY KEY ([Id])
);

CREATE TABLE [Organizations] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Domain] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Organizations] PRIMARY KEY ([Id])
);

CREATE TABLE [PendingRegistrations] (
    [Id] int NOT NULL IDENTITY,
    [UID] uniqueidentifier NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Mobile] nvarchar(max) NULL,
    [SchoolName] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [IsDeleted] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [OtpCode] nvarchar(max) NULL,
    [OtpExpiry] datetime2 NULL,
    CONSTRAINT [PK_PendingRegistrations] PRIMARY KEY ([Id])
);

CREATE TABLE [Rooms] (
    [Id] uniqueidentifier NOT NULL,
    [RoomNo] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NULL,
    [Capacity] int NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Rooms] PRIMARY KEY ([Id])
);

CREATE TABLE [SalaryStructures] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_SalaryStructures] PRIMARY KEY ([Id])
);

CREATE TABLE [Subjects] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(max) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Subjects] PRIMARY KEY ([Id])
);

CREATE TABLE [Users] (
    [Id] uniqueidentifier NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [MobileNumber] nvarchar(max) NOT NULL,
    [IsMobileVerified] bit NOT NULL,
    [IsEmailVerified] bit NOT NULL,
    [FailedLoginAttempts] int NOT NULL,
    [LockoutEnd] datetime2 NULL,
    [LastLoginAt] datetime2 NULL,
    [HasConsentedToTerms] bit NOT NULL,
    [ConsentDate] datetime2 NULL,
    [Role] nvarchar(max) NOT NULL,
    [RefreshToken] nvarchar(max) NULL,
    [RefreshTokenExpiryTime] datetime2 NULL,
    [ResetPasswordToken] nvarchar(max) NULL,
    [ResetPasswordExpiry] datetime2 NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [Students] (
    [Id] uniqueidentifier NOT NULL,
    [AdmissionNo] nvarchar(max) NOT NULL,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [Gender] nvarchar(max) NOT NULL,
    [DateOfBirth] datetime2 NULL,
    [BloodGroup] nvarchar(max) NULL,
    [StudentPhoto] nvarchar(max) NULL,
    [MobileNumber] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NULL,
    [AddressLine1] nvarchar(max) NULL,
    [AddressLine2] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [State] nvarchar(max) NULL,
    [Pincode] nvarchar(max) NULL,
    [ClassId] uniqueidentifier NULL,
    [SectionId] uniqueidentifier NULL,
    [RollNumber] nvarchar(max) NULL,
    [AdmissionDate] datetime2 NOT NULL,
    [AcademicYear] nvarchar(max) NULL,
    [PreviousSchool] nvarchar(max) NULL,
    [FatherName] nvarchar(max) NULL,
    [FatherMobile] nvarchar(max) NULL,
    [FatherEmail] nvarchar(max) NULL,
    [FatherOccupation] nvarchar(max) NULL,
    [MotherName] nvarchar(max) NULL,
    [MotherMobile] nvarchar(max) NULL,
    [MotherEmail] nvarchar(max) NULL,
    [MotherOccupation] nvarchar(max) NULL,
    [GuardianName] nvarchar(max) NULL,
    [GuardianMobile] nvarchar(max) NULL,
    [GuardianEmail] nvarchar(max) NULL,
    [GuardianRelation] nvarchar(max) NULL,
    [EmergencyContactName] nvarchar(max) NULL,
    [EmergencyContactNumber] nvarchar(max) NULL,
    [EmergencyContactRelation] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsMobileVerified] bit NOT NULL,
    [IsEmailVerified] bit NOT NULL,
    [ConsentAccepted] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Students] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Students_AcademicClasses_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [AcademicClasses] ([Id])
);

CREATE TABLE [States] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [CountryId] uniqueidentifier NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_States] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_States_Countries_CountryId] FOREIGN KEY ([CountryId]) REFERENCES [Countries] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Employees] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeCode] nvarchar(450) NOT NULL,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [Gender] nvarchar(max) NULL,
    [DateOfBirth] datetime2 NULL,
    [BloodGroup] nvarchar(max) NULL,
    [Nationality] nvarchar(max) NULL,
    [Religion] nvarchar(max) NULL,
    [MaritalStatus] nvarchar(max) NULL,
    [ProfilePhoto] nvarchar(max) NULL,
    [MobileNumber] nvarchar(max) NOT NULL,
    [WorkEmail] nvarchar(450) NOT NULL,
    [PersonalEmail] nvarchar(max) NULL,
    [EmergencyContactName] nvarchar(max) NULL,
    [EmergencyContactNumber] nvarchar(max) NULL,
    [AddressLine1] nvarchar(max) NULL,
    [AddressLine2] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [State] nvarchar(max) NULL,
    [Pincode] nvarchar(max) NULL,
    [PermanentAddressLine1] nvarchar(max) NULL,
    [PermanentAddressLine2] nvarchar(max) NULL,
    [PermanentCity] nvarchar(max) NULL,
    [PermanentState] nvarchar(max) NULL,
    [PermanentPincode] nvarchar(max) NULL,
    [DepartmentId] uniqueidentifier NULL,
    [DesignationId] uniqueidentifier NULL,
    [EmployeeRoleId] uniqueidentifier NULL,
    [DateOfJoining] datetime2 NOT NULL,
    [EmploymentType] int NOT NULL,
    [WorkLocation] nvarchar(max) NULL,
    [Status] int NOT NULL,
    [IsActive] bit NOT NULL,
    [DeactivationReason] nvarchar(max) NULL,
    [UserId] uniqueidentifier NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Employees] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Employees_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Employees_Designations_DesignationId] FOREIGN KEY ([DesignationId]) REFERENCES [Designations] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Employees_EmployeeRoles_EmployeeRoleId] FOREIGN KEY ([EmployeeRoleId]) REFERENCES [EmployeeRoles] ([Id]) ON DELETE SET NULL
);

CREATE TABLE [FeeStructures] (
    [Id] uniqueidentifier NOT NULL,
    [FeeHeadId] uniqueidentifier NOT NULL,
    [ClassId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Frequency] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_FeeStructures] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FeeStructures_AcademicClasses_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [AcademicClasses] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_FeeStructures_FeeHeads_FeeHeadId] FOREIGN KEY ([FeeHeadId]) REFERENCES [FeeHeads] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [SalaryComponents] (
    [Id] uniqueidentifier NOT NULL,
    [SalaryStructureId] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Type] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_SalaryComponents] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SalaryComponents_SalaryStructures_SalaryStructureId] FOREIGN KEY ([SalaryStructureId]) REFERENCES [SalaryStructures] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [PayrollRuns] (
    [Id] uniqueidentifier NOT NULL,
    [Year] int NOT NULL,
    [Month] int NOT NULL,
    [ProcessedDate] datetime2 NOT NULL,
    [ProcessedById] uniqueidentifier NULL,
    [Status] int NOT NULL,
    [TotalAmount] decimal(18,2) NOT NULL,
    [Remarks] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_PayrollRuns] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PayrollRuns_Users_ProcessedById] FOREIGN KEY ([ProcessedById]) REFERENCES [Users] ([Id])
);

CREATE TABLE [FeeDiscountAssignments] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [FeeDiscountId] uniqueidentifier NOT NULL,
    [AcademicYearId] uniqueidentifier NOT NULL,
    [RestrictedFeeHeadId] uniqueidentifier NULL,
    [Remarks] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_FeeDiscountAssignments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FeeDiscountAssignments_AcademicYears_AcademicYearId] FOREIGN KEY ([AcademicYearId]) REFERENCES [AcademicYears] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_FeeDiscountAssignments_FeeDiscounts_FeeDiscountId] FOREIGN KEY ([FeeDiscountId]) REFERENCES [FeeDiscounts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_FeeDiscountAssignments_FeeHeads_RestrictedFeeHeadId] FOREIGN KEY ([RestrictedFeeHeadId]) REFERENCES [FeeHeads] ([Id]),
    CONSTRAINT [FK_FeeDiscountAssignments_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [FeeTransactions] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [TransactionDate] datetime2 NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [AcademicYearId] uniqueidentifier NOT NULL,
    [Description] nvarchar(max) NULL,
    [ReferenceNumber] nvarchar(max) NULL,
    [PaymentMethod] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_FeeTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FeeTransactions_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [StudentAttendances] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [ClassId] uniqueidentifier NOT NULL,
    [SectionId] uniqueidentifier NOT NULL,
    [AttendanceDate] datetime2 NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [Remarks] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentAttendances] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentAttendances_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [StudentCourses] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [CourseId] uniqueidentifier NOT NULL,
    [BatchId] uniqueidentifier NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NULL,
    [Status] nvarchar(max) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentCourses] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentCourses_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_StudentCourses_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [StudentDocuments] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [DocumentType] nvarchar(max) NOT NULL,
    [DocumentName] nvarchar(max) NOT NULL,
    [DocumentUrl] nvarchar(max) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentDocuments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentDocuments_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [StudentExamResults] (
    [Id] uniqueidentifier NOT NULL,
    [ExamId] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [SubjectId] uniqueidentifier NOT NULL,
    [TotalMarks] decimal(18,2) NOT NULL,
    [PassingMarks] decimal(18,2) NOT NULL,
    [ObtainedMarks] decimal(18,2) NOT NULL,
    [Grade] nvarchar(max) NULL,
    [Remarks] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentExamResults] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentExamResults_Exams_ExamId] FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_StudentExamResults_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_StudentExamResults_Subjects_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [Subjects] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [StudentFeeAccounts] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [TotalAllocated] decimal(18,2) NOT NULL,
    [TotalPaid] decimal(18,2) NOT NULL,
    [TotalDiscount] decimal(18,2) NOT NULL,
    [LastTransactionDate] datetime2 NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentFeeAccounts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentFeeAccounts_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [StudentFeeSubscriptions] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [FeeHeadId] uniqueidentifier NOT NULL,
    [CustomAmount] decimal(18,2) NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentFeeSubscriptions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentFeeSubscriptions_FeeHeads_FeeHeadId] FOREIGN KEY ([FeeHeadId]) REFERENCES [FeeHeads] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_StudentFeeSubscriptions_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Cities] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [StateId] uniqueidentifier NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_Cities] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Cities_States_StateId] FOREIGN KEY ([StateId]) REFERENCES [States] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [EmployeeAttendances] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [AttendanceDate] datetime2 NOT NULL,
    [Status] int NOT NULL,
    [InTime] time NULL,
    [OutTime] time NULL,
    [Remarks] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_EmployeeAttendances] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EmployeeAttendances_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [EmployeeDocuments] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [FileName] nvarchar(max) NOT NULL,
    [Url] nvarchar(max) NOT NULL,
    [DocumentType] int NOT NULL,
    [Description] nvarchar(max) NULL,
    [FileSizeBytes] bigint NOT NULL,
    [UploadedAt] datetime2 NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_EmployeeDocuments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EmployeeDocuments_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [EmployeeSalaries] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [SalaryStructureId] uniqueidentifier NOT NULL,
    [GrossSalary] decimal(18,2) NOT NULL,
    [NetSalary] decimal(18,2) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_EmployeeSalaries] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EmployeeSalaries_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_EmployeeSalaries_SalaryStructures_SalaryStructureId] FOREIGN KEY ([SalaryStructureId]) REFERENCES [SalaryStructures] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [LeaveApplications] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [LeaveTypeId] uniqueidentifier NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Reason] nvarchar(max) NULL,
    [Status] int NOT NULL,
    [ApprovedById] uniqueidentifier NULL,
    [ActionDate] datetime2 NULL,
    [ActionRemarks] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_LeaveApplications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LeaveApplications_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_LeaveApplications_LeaveTypes_LeaveTypeId] FOREIGN KEY ([LeaveTypeId]) REFERENCES [LeaveTypes] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [LeaveBalances] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [LeaveTypeId] uniqueidentifier NOT NULL,
    [AcademicYearId] uniqueidentifier NOT NULL,
    [TotalDays] decimal(18,2) NOT NULL,
    [ConsumedDays] decimal(18,2) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_LeaveBalances] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LeaveBalances_AcademicYears_AcademicYearId] FOREIGN KEY ([AcademicYearId]) REFERENCES [AcademicYears] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_LeaveBalances_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_LeaveBalances_LeaveTypes_LeaveTypeId] FOREIGN KEY ([LeaveTypeId]) REFERENCES [LeaveTypes] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [TeacherProfiles] (
    [Id] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [HighestQualification] nvarchar(max) NULL,
    [QualificationInstitution] nvarchar(max) NULL,
    [QualificationYear] int NULL,
    [Specializations] nvarchar(max) NULL,
    [PreviousExperienceYears] int NULL,
    [PreviousSchools] nvarchar(max) NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_TeacherProfiles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TeacherProfiles_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [PayrollDetails] (
    [Id] uniqueidentifier NOT NULL,
    [PayrollRunId] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [GrossSalary] decimal(18,2) NOT NULL,
    [TotalDeductions] decimal(18,2) NOT NULL,
    [NetSalary] decimal(18,2) NOT NULL,
    [ComponentBreakdownDetails] nvarchar(max) NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_PayrollDetails] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PayrollDetails_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_PayrollDetails_PayrollRuns_PayrollRunId] FOREIGN KEY ([PayrollRunId]) REFERENCES [PayrollRuns] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [TeacherClassAssignments] (
    [Id] uniqueidentifier NOT NULL,
    [TeacherProfileId] uniqueidentifier NOT NULL,
    [ClassId] uniqueidentifier NOT NULL,
    [SectionId] uniqueidentifier NOT NULL,
    [AcademicYearId] uniqueidentifier NOT NULL,
    [IsClassTeacher] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_TeacherClassAssignments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TeacherClassAssignments_AcademicClasses_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [AcademicClasses] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeacherClassAssignments_AcademicSections_SectionId] FOREIGN KEY ([SectionId]) REFERENCES [AcademicSections] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeacherClassAssignments_AcademicYears_AcademicYearId] FOREIGN KEY ([AcademicYearId]) REFERENCES [AcademicYears] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeacherClassAssignments_TeacherProfiles_TeacherProfileId] FOREIGN KEY ([TeacherProfileId]) REFERENCES [TeacherProfiles] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [TeacherSubjectAssignments] (
    [Id] uniqueidentifier NOT NULL,
    [TeacherProfileId] uniqueidentifier NOT NULL,
    [SubjectId] uniqueidentifier NOT NULL,
    [AcademicYearId] uniqueidentifier NOT NULL,
    [EffectiveFrom] datetime2 NOT NULL,
    [EffectiveTo] datetime2 NULL,
    [IsActive] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_TeacherSubjectAssignments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TeacherSubjectAssignments_AcademicYears_AcademicYearId] FOREIGN KEY ([AcademicYearId]) REFERENCES [AcademicYears] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeacherSubjectAssignments_Subjects_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [Subjects] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeacherSubjectAssignments_TeacherProfiles_TeacherProfileId] FOREIGN KEY ([TeacherProfileId]) REFERENCES [TeacherProfiles] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_AcademicClasses_OrganizationId] ON [AcademicClasses] ([OrganizationId]);

CREATE INDEX [IX_AcademicSections_OrganizationId] ON [AcademicSections] ([OrganizationId]);

CREATE INDEX [IX_AcademicStreams_OrganizationId] ON [AcademicStreams] ([OrganizationId]);

CREATE INDEX [IX_AcademicYears_OrganizationId] ON [AcademicYears] ([OrganizationId]);

CREATE INDEX [IX_Cities_OrganizationId] ON [Cities] ([OrganizationId]);

CREATE INDEX [IX_Cities_StateId] ON [Cities] ([StateId]);

CREATE INDEX [IX_Countries_OrganizationId] ON [Countries] ([OrganizationId]);

CREATE INDEX [IX_Courses_OrganizationId] ON [Courses] ([OrganizationId]);

CREATE INDEX [IX_Departments_OrganizationId] ON [Departments] ([OrganizationId]);

CREATE INDEX [IX_Designations_OrganizationId] ON [Designations] ([OrganizationId]);

CREATE INDEX [IX_EmployeeAttendances_EmployeeId] ON [EmployeeAttendances] ([EmployeeId]);

CREATE INDEX [IX_EmployeeAttendances_OrganizationId] ON [EmployeeAttendances] ([OrganizationId]);

CREATE UNIQUE INDEX [IX_EmployeeAttendances_OrganizationId_EmployeeId_AttendanceDate] ON [EmployeeAttendances] ([OrganizationId], [EmployeeId], [AttendanceDate]);

CREATE INDEX [IX_EmployeeDocuments_EmployeeId] ON [EmployeeDocuments] ([EmployeeId]);

CREATE INDEX [IX_EmployeeDocuments_OrganizationId] ON [EmployeeDocuments] ([OrganizationId]);

CREATE INDEX [IX_EmployeeRoles_OrganizationId] ON [EmployeeRoles] ([OrganizationId]);

CREATE INDEX [IX_Employees_DepartmentId] ON [Employees] ([DepartmentId]);

CREATE INDEX [IX_Employees_DesignationId] ON [Employees] ([DesignationId]);

CREATE INDEX [IX_Employees_EmployeeCode] ON [Employees] ([EmployeeCode]);

CREATE INDEX [IX_Employees_EmployeeRoleId] ON [Employees] ([EmployeeRoleId]);

CREATE INDEX [IX_Employees_OrganizationId] ON [Employees] ([OrganizationId]);

CREATE UNIQUE INDEX [IX_Employees_OrganizationId_WorkEmail] ON [Employees] ([OrganizationId], [WorkEmail]);

CREATE INDEX [IX_EmployeeSalaries_EmployeeId] ON [EmployeeSalaries] ([EmployeeId]);

CREATE INDEX [IX_EmployeeSalaries_OrganizationId] ON [EmployeeSalaries] ([OrganizationId]);

CREATE INDEX [IX_EmployeeSalaries_SalaryStructureId] ON [EmployeeSalaries] ([SalaryStructureId]);

CREATE INDEX [IX_Exams_OrganizationId] ON [Exams] ([OrganizationId]);

CREATE INDEX [IX_FeeConfigurations_OrganizationId] ON [FeeConfigurations] ([OrganizationId]);

CREATE INDEX [IX_FeeDiscountAssignments_AcademicYearId] ON [FeeDiscountAssignments] ([AcademicYearId]);

CREATE INDEX [IX_FeeDiscountAssignments_FeeDiscountId] ON [FeeDiscountAssignments] ([FeeDiscountId]);

CREATE INDEX [IX_FeeDiscountAssignments_OrganizationId] ON [FeeDiscountAssignments] ([OrganizationId]);

CREATE INDEX [IX_FeeDiscountAssignments_RestrictedFeeHeadId] ON [FeeDiscountAssignments] ([RestrictedFeeHeadId]);

CREATE INDEX [IX_FeeDiscountAssignments_StudentId] ON [FeeDiscountAssignments] ([StudentId]);

CREATE INDEX [IX_FeeDiscounts_OrganizationId] ON [FeeDiscounts] ([OrganizationId]);

CREATE INDEX [IX_FeeHeads_OrganizationId] ON [FeeHeads] ([OrganizationId]);

CREATE INDEX [IX_FeeStructures_ClassId] ON [FeeStructures] ([ClassId]);

CREATE INDEX [IX_FeeStructures_FeeHeadId] ON [FeeStructures] ([FeeHeadId]);

CREATE INDEX [IX_FeeStructures_OrganizationId] ON [FeeStructures] ([OrganizationId]);

CREATE INDEX [IX_FeeTransactions_OrganizationId] ON [FeeTransactions] ([OrganizationId]);

CREATE INDEX [IX_FeeTransactions_StudentId] ON [FeeTransactions] ([StudentId]);

CREATE INDEX [IX_Labs_OrganizationId] ON [Labs] ([OrganizationId]);

CREATE INDEX [IX_LeaveApplications_EmployeeId] ON [LeaveApplications] ([EmployeeId]);

CREATE INDEX [IX_LeaveApplications_LeaveTypeId] ON [LeaveApplications] ([LeaveTypeId]);

CREATE INDEX [IX_LeaveApplications_OrganizationId] ON [LeaveApplications] ([OrganizationId]);

CREATE INDEX [IX_LeaveBalances_AcademicYearId] ON [LeaveBalances] ([AcademicYearId]);

CREATE INDEX [IX_LeaveBalances_EmployeeId] ON [LeaveBalances] ([EmployeeId]);

CREATE INDEX [IX_LeaveBalances_LeaveTypeId] ON [LeaveBalances] ([LeaveTypeId]);

CREATE INDEX [IX_LeaveBalances_OrganizationId] ON [LeaveBalances] ([OrganizationId]);

CREATE UNIQUE INDEX [IX_LeaveBalances_OrganizationId_EmployeeId_LeaveTypeId_AcademicYearId] ON [LeaveBalances] ([OrganizationId], [EmployeeId], [LeaveTypeId], [AcademicYearId]);

CREATE INDEX [IX_LeaveTypes_OrganizationId] ON [LeaveTypes] ([OrganizationId]);

CREATE INDEX [IX_Lookups_OrganizationId] ON [Lookups] ([OrganizationId]);

CREATE INDEX [IX_MenuPermissions_OrganizationId] ON [MenuPermissions] ([OrganizationId]);

CREATE INDEX [IX_MenuPermissions_RoleName_MenuKey] ON [MenuPermissions] ([RoleName], [MenuKey]) WHERE [RoleName] IS NOT NULL;

CREATE UNIQUE INDEX [IX_MenuPermissions_RoleName_UserId_MenuKey] ON [MenuPermissions] ([RoleName], [UserId], [MenuKey]) WHERE [RoleName] IS NOT NULL AND [UserId] IS NOT NULL;

CREATE INDEX [IX_MenuPermissions_UserId_MenuKey] ON [MenuPermissions] ([UserId], [MenuKey]) WHERE [UserId] IS NOT NULL;

CREATE INDEX [IX_PayrollDetails_EmployeeId] ON [PayrollDetails] ([EmployeeId]);

CREATE INDEX [IX_PayrollDetails_OrganizationId] ON [PayrollDetails] ([OrganizationId]);

CREATE INDEX [IX_PayrollDetails_PayrollRunId] ON [PayrollDetails] ([PayrollRunId]);

CREATE INDEX [IX_PayrollRuns_OrganizationId] ON [PayrollRuns] ([OrganizationId]);

CREATE INDEX [IX_PayrollRuns_ProcessedById] ON [PayrollRuns] ([ProcessedById]);

CREATE INDEX [IX_Rooms_OrganizationId] ON [Rooms] ([OrganizationId]);

CREATE INDEX [IX_SalaryComponents_OrganizationId] ON [SalaryComponents] ([OrganizationId]);

CREATE INDEX [IX_SalaryComponents_SalaryStructureId] ON [SalaryComponents] ([SalaryStructureId]);

CREATE INDEX [IX_SalaryStructures_OrganizationId] ON [SalaryStructures] ([OrganizationId]);

CREATE INDEX [IX_States_CountryId] ON [States] ([CountryId]);

CREATE INDEX [IX_States_OrganizationId] ON [States] ([OrganizationId]);

CREATE INDEX [IX_StudentAttendances_OrganizationId] ON [StudentAttendances] ([OrganizationId]);

CREATE UNIQUE INDEX [IX_StudentAttendances_OrganizationId_StudentId_AttendanceDate] ON [StudentAttendances] ([OrganizationId], [StudentId], [AttendanceDate]);

CREATE INDEX [IX_StudentAttendances_StudentId] ON [StudentAttendances] ([StudentId]);

CREATE INDEX [IX_StudentCourses_CourseId] ON [StudentCourses] ([CourseId]);

CREATE INDEX [IX_StudentCourses_OrganizationId] ON [StudentCourses] ([OrganizationId]);

CREATE INDEX [IX_StudentCourses_StudentId] ON [StudentCourses] ([StudentId]);

CREATE INDEX [IX_StudentDocuments_OrganizationId] ON [StudentDocuments] ([OrganizationId]);

CREATE INDEX [IX_StudentDocuments_StudentId] ON [StudentDocuments] ([StudentId]);

CREATE INDEX [IX_StudentExamResults_ExamId] ON [StudentExamResults] ([ExamId]);

CREATE INDEX [IX_StudentExamResults_OrganizationId] ON [StudentExamResults] ([OrganizationId]);

CREATE INDEX [IX_StudentExamResults_StudentId] ON [StudentExamResults] ([StudentId]);

CREATE INDEX [IX_StudentExamResults_SubjectId] ON [StudentExamResults] ([SubjectId]);

CREATE INDEX [IX_StudentFeeAccounts_OrganizationId] ON [StudentFeeAccounts] ([OrganizationId]);

CREATE INDEX [IX_StudentFeeAccounts_StudentId] ON [StudentFeeAccounts] ([StudentId]);

CREATE INDEX [IX_StudentFeeSubscriptions_FeeHeadId] ON [StudentFeeSubscriptions] ([FeeHeadId]);

CREATE INDEX [IX_StudentFeeSubscriptions_OrganizationId] ON [StudentFeeSubscriptions] ([OrganizationId]);

CREATE INDEX [IX_StudentFeeSubscriptions_StudentId] ON [StudentFeeSubscriptions] ([StudentId]);

CREATE INDEX [IX_Students_ClassId] ON [Students] ([ClassId]);

CREATE INDEX [IX_Students_OrganizationId] ON [Students] ([OrganizationId]);

CREATE INDEX [IX_Subjects_OrganizationId] ON [Subjects] ([OrganizationId]);

CREATE INDEX [IX_TeacherClassAssignments_AcademicYearId] ON [TeacherClassAssignments] ([AcademicYearId]);

CREATE INDEX [IX_TeacherClassAssignments_ClassId] ON [TeacherClassAssignments] ([ClassId]);

CREATE INDEX [IX_TeacherClassAssignments_OrganizationId] ON [TeacherClassAssignments] ([OrganizationId]);

CREATE INDEX [IX_TeacherClassAssignments_SectionId] ON [TeacherClassAssignments] ([SectionId]);

CREATE INDEX [IX_TeacherClassAssignments_TeacherProfileId] ON [TeacherClassAssignments] ([TeacherProfileId]);

CREATE UNIQUE INDEX [IX_TeacherProfiles_EmployeeId] ON [TeacherProfiles] ([EmployeeId]);

CREATE INDEX [IX_TeacherProfiles_OrganizationId] ON [TeacherProfiles] ([OrganizationId]);

CREATE INDEX [IX_TeacherSubjectAssignments_AcademicYearId] ON [TeacherSubjectAssignments] ([AcademicYearId]);

CREATE INDEX [IX_TeacherSubjectAssignments_OrganizationId] ON [TeacherSubjectAssignments] ([OrganizationId]);

CREATE INDEX [IX_TeacherSubjectAssignments_SubjectId] ON [TeacherSubjectAssignments] ([SubjectId]);

CREATE INDEX [IX_TeacherSubjectAssignments_TeacherProfileId] ON [TeacherSubjectAssignments] ([TeacherProfileId]);

CREATE INDEX [IX_Users_OrganizationId] ON [Users] ([OrganizationId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260325032738_InitialCreate', N'10.0.5');

COMMIT;
GO

BEGIN TRANSACTION;
ALTER TABLE [Students] DROP CONSTRAINT [FK_Students_AcademicClasses_ClassId];

DROP INDEX [IX_Students_ClassId] ON [Students];

DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Students]') AND [c].[name] = N'AcademicYear');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [Students] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [Students] DROP COLUMN [AcademicYear];

DECLARE @var1 nvarchar(max);
SELECT @var1 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Students]') AND [c].[name] = N'ClassId');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Students] DROP CONSTRAINT ' + @var1 + ';');
ALTER TABLE [Students] DROP COLUMN [ClassId];

DECLARE @var2 nvarchar(max);
SELECT @var2 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Students]') AND [c].[name] = N'RollNumber');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Students] DROP CONSTRAINT ' + @var2 + ';');
ALTER TABLE [Students] DROP COLUMN [RollNumber];

DECLARE @var3 nvarchar(max);
SELECT @var3 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Students]') AND [c].[name] = N'SectionId');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Students] DROP CONSTRAINT ' + @var3 + ';');
ALTER TABLE [Students] DROP COLUMN [SectionId];

ALTER TABLE [FeeDiscountAssignments] ADD [CustomCalculationType] nvarchar(max) NULL;

ALTER TABLE [FeeDiscountAssignments] ADD [CustomFrequency] nvarchar(max) NULL;

ALTER TABLE [FeeDiscountAssignments] ADD [CustomValue] decimal(18,2) NULL;

CREATE TABLE [StudentAcademics] (
    [Id] uniqueidentifier NOT NULL,
    [StudentId] uniqueidentifier NOT NULL,
    [ClassId] uniqueidentifier NOT NULL,
    [SectionId] uniqueidentifier NULL,
    [AcademicYear] nvarchar(max) NOT NULL,
    [RollNumber] nvarchar(max) NULL,
    [Status] nvarchar(max) NOT NULL,
    [IsCurrent] bit NOT NULL,
    [OrganizationId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] uniqueidentifier NULL,
    CONSTRAINT [PK_StudentAcademics] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentAcademics_AcademicClasses_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [AcademicClasses] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_StudentAcademics_AcademicSections_SectionId] FOREIGN KEY ([SectionId]) REFERENCES [AcademicSections] ([Id]),
    CONSTRAINT [FK_StudentAcademics_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_FeeTransactions_AcademicYearId] ON [FeeTransactions] ([AcademicYearId]);

CREATE INDEX [IX_StudentAcademics_ClassId] ON [StudentAcademics] ([ClassId]);

CREATE INDEX [IX_StudentAcademics_OrganizationId] ON [StudentAcademics] ([OrganizationId]);

CREATE INDEX [IX_StudentAcademics_SectionId] ON [StudentAcademics] ([SectionId]);

CREATE INDEX [IX_StudentAcademics_StudentId] ON [StudentAcademics] ([StudentId]);

ALTER TABLE [FeeTransactions] ADD CONSTRAINT [FK_FeeTransactions_AcademicYears_AcademicYearId] FOREIGN KEY ([AcademicYearId]) REFERENCES [AcademicYears] ([Id]) ON DELETE CASCADE;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260325040920_StudentAcademicMapping', N'10.0.5');

COMMIT;
GO

