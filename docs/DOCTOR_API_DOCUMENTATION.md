# MediConnect - Doctor Module Documentation

## 1. Overview
The **Doctor Module** provides endpoints and services for onboarding medical doctors to the MediConnect healthcare platform, handling:
- Doctor application submission with document & resume uploads to Cloudinary.
- Email verification using Redis-backed 6-digit OTPs.
- Admin review workflows (approving or rejecting doctor applications).
- Filtered, paginated listing of verified and pending doctors.

---

## 2. Architecture & Data Model

### Prisma Doctor Model
```prisma
model Doctor {
  id                 String                   @id @default(uuid())
  name               String
  email              String                   @unique
  contactNumber      String?
  address            String?
  specialization     String
  licenseNumber      String                   @unique
  qualifications     String
  experienceYears    Int
  bio                String?
  consultationFee    Float?                   @default(0)
  resume             String
  resumePublicId     String
  additionalFiles    Json?
  verificationStatus DoctorVerificationStatus @default(PENDING)
  rejectionReason    String?
  reviewedBy         String?
  reviewedAt         DateTime?
  isDeleted          Boolean                  @default(false)
  deletedAt          DateTime?
  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt

  // relations
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@index([email], name: "idx_doctor_email")
  @@index([specialization], name: "idx_doctor_specialization")
  @@index([licenseNumber], name: "idx_doctor_licenseNumber")
  @@index([isDeleted], name: "idx_doctor_isDeleted")
  @@map("doctors")
}
```

### Doctor Verification Status Enum
```prisma
enum DoctorVerificationStatus {
  PENDING
  APPROVED
  REJECTED
}
```
