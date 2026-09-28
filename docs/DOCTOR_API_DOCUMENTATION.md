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

---

## 3. Endpoints & Workflows

### 3.1 Apply as Doctor
- **Method**: `POST`
- **Path**: `/api/v1/doctor/apply-as-doctor`
- **Content-Type**: `multipart/form-data`
- **Access**: Public

#### Form Fields:
- `data`: JSON string matching `ApplyAsDoctorValidationZodSchema`
  ```json
  {
    "user": {
      "name": "Dr. John Doe",
      "email": "dr.john@example.com"
    },
    "doctor": {
      "specialization": "Cardiology",
      "licenseNumber": "MED-123456",
      "qualifications": "MBBS, FCPS (Cardiology)",
      "experienceYears": 8,
      "bio": "Specialist cardiologist with 8 years of clinical experience.",
      "consultationFee": 1200,
      "contactNumber": "+8801700000000",
      "address": "Dhaka, Bangladesh"
    }
  }
  ```
- `resume`: File (`maxCount: 1`) - PDF or document.
- `additionalFiles`: Files (`maxCount: 10`) - Certifications, medical degrees, awards.

#### Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Applied As Doctor Successfully",
  "data": { ... }
}
```

---

### 3.2 Verify Doctor Email
- **Method**: `POST`
- **Path**: `/api/v1/doctor/apply-as-doctor/verify-email`
- **Content-Type**: `application/json`
- **Access**: Public

#### Request Body:
```json
{
  "email": "dr.john@example.com",
  "otp": "123456"
}
```

#### Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Doctor Email Verified Successfully",
  "data": { ... }
}
```

---

### 3.3 Approve / Reject Doctor Application
- **Method**: `POST`
- **Path**: `/api/v1/doctor/approve-doctor`
- **Content-Type**: `application/json`
- **Access**: `ADMIN`, `SUPER_ADMIN`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`

#### Request Body (Approve):
```json
{
  "doctorId": "uuid-doctor-id",
  "verificationStatus": "APPROVED"
}
```

#### Request Body (Reject):
```json
{
  "doctorId": "uuid-doctor-id",
  "verificationStatus": "REJECTED",
  "rejectionReason": "Missing verified medical board credentials."
}
```

#### Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Doctor Application Reviewed Successfully",
  "data": { ... }
}
```

---

### 3.4 Get All Doctors (Paginated & Filtered)
- **Method**: `GET`
- **Path**: `/api/v1/doctor/all-doctors`
- **Access**: `ADMIN`, `SUPER_ADMIN`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`

#### Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Records per page |
| `sortBy` | `string` | `"createdAt"` | Sorting attribute |
| `sortOrder` | `"asc" \| "desc"` | `"desc"` | Sort direction |
| `searchTerm` | `string` | - | Search by name, email, specialization, license |
| `specialization` | `string` | - | Filter by exact specialization |
| `licenseNumber` | `string` | - | Filter by license number |
| `verificationStatus` | `string` | - | Filter by `PENDING`, `APPROVED`, `REJECTED` |

#### Example cURL:
```bash
curl -X GET "http://localhost:5000/api/v1/doctor/all-doctors?page=1&limit=10&searchTerm=cardio" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```


