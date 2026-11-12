# DIU CSE Semester & Exam Tracker — Project Specification & Antigravity Master Guide

A comprehensive, production-ready specification and prompt documentation for building the **DIU CSE Semester & Exam Tracker** Progressive Web Application (PWA) using **Google Antigravity IDE**, **FastAPI**, and **Supabase (PostgreSQL)**.

---

## 1. Master Prompt for Google Antigravity IDE

> **Instructions**: Copy and paste the prompt block below directly into the agent input box (`Ask anything, @ to mention, / for actions`) inside Antigravity IDE.

```text
You are an expert full-stack engineer and software architect. Build a production-grade Progressive Web Application (PWA) called "DIU Semester Tracker" tailored specifically for Daffodil International University (DIU) Computer Science & Engineering (CSE) students.

### Project Objective:
The app enables DIU CSE students to start their semester with a structured, data-driven roadmap. It breaks down each semester's courses into granular topics categorized by Midterm vs. Final exam syllabus, predicts exam appearance probability based on DIU Question Bank (DIUQBank) patterns, provides an interactive topic checklist tracker with real-time percentage progress, and bridges university academics with global computer science curricula (MIT, Stanford) and industry-standard skills (LeetCode, competitive programming, Docker, cloud).

### Tech Stack Specifications:
1. Backend:
   - Framework: Python 3.11+ with FastAPI.
   - Schemas & Validation: Pydantic v2 schemas for request/response validation.
   - ORM & Database: SQLAlchemy (async) or SQLModel connected to PostgreSQL (Supabase ready).
   - Authentication: JWT-based authentication (passlib / bcrypt for password hashing, python-jose for tokens).
   - API Architecture: Modular routers (/api/v1/auth, /api/v1/courses, /api/v1/tracker, /api/v1/analytics).

2. Frontend:
   - Framework: React 18+ (bootstrapped with Vite) + TypeScript or modern ES6+.
   - Styling: Tailwind CSS with Lucide React icons, dark/light theme support, clean typography.
   - PWA Capabilities: Web App Manifest and Service Worker for offline support and mobile "Add to Home Screen".
   - State Management & Data Fetching: TanStack Query (React Query) and Axios.

3. DevOps & Deployment:
   - Dockerfile for FastAPI backend and static frontend build.
   - docker-compose.yml for running FastAPI + PostgreSQL locally in one command.
   - Configuration files for deployment on Render.

### Core Functional Modules:

1. Authentication & Student Profile:
   - Student Sign Up / Login with email, name, student ID, and password.
   - Semester selector: Level 1 Term 1 through Level 4 Term 3 (12 semesters standard DIU CSE structure).
   - Course enrollment manager: Select taking courses for the active term.

2. Course & Topic Engine (DIUQBank Analysis):
   - Hierarchical data structure: Semester -> Course -> Topics.
   - Each topic must store:
     * exam_stage: "midterm" | "final" | "both"
     * priority: "high" | "medium" | "low"
     * probability_score: integer percentage (e.g., 90% for Binary Search Tree traversal, 85% for Pointer arithmetic)
     * is_industry_essential: boolean (flags concepts essential for tech interviews / USA university equivalents)
     * resources: array of objects with title, url, type ("youtube", "documentation", "article", "problem_set")
     * global_benchmark: text notes linking topic to MIT 6.006, Stanford CS106B, or NeetCode / LeetCode benchmarks.

3. Interactive Topic Tracker & Analytics:
   - Mark individual topics as "Completed", "In Progress", or "Review Needed".
   - Progress bar displaying overall course completion percentage.
   - Split metric: "Midterm Readiness %" vs "Final Exam Readiness %" vs "Global Depth %".
   - Quick filters: "High Yield Exam Topics", "Frequently Repeated Questions", "Optional Industry Depth".

4. Curated Mock & Seed Data:
   - Include a robust `seed_data.py` script populating at least 3 foundational DIU courses with authentic DIUQBank question trends:
     a) Structured Programming (C) (Course Code: CSE112/CSE113)
     b) Data Structures (Course Code: CSE212/CSE213)
     c) Object-Oriented Programming (Java/C++) (Course Code: CSE122/CSE123)

### Execution Plan for Antigravity Agent:
1. Create an Implementation Plan artifact detailing the project file structure, database schema, and REST API endpoints.
2. Initialize the backend directory with virtual environment configuration, requirements.txt, FastAPI routes, and database models.
3. Initialize the frontend directory with Vite, Tailwind CSS, responsive components, and API service layer.
4. Populate seed data with accurate topic probabilities and learning references.
5. Spin up local servers and verify end-to-end functionality via automated browser verification (login -> course selection -> topic tracking checklist).
```

---

## 2. Database Schema Design (PostgreSQL / Supabase)

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Student email |
| `full_name` | VARCHAR(150) | NOT NULL | Student name |
| `student_id` | VARCHAR(50) | NULLABLE | DIU Student ID (e.g., 231-15-xxx) |
| `hashed_password`| VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `current_semester`| VARCHAR(50) | DEFAULT 'Level 1 Term 1' | Active semester |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation date |

### Table: `courses`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique course identifier |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | Course code (e.g., CSE212) |
| `title` | VARCHAR(200) | NOT NULL | Course title (e.g., Data Structures) |
| `credits` | NUMERIC(3, 1)| DEFAULT 3.0 | Credit hours |
| `semester_level` | VARCHAR(50) | NOT NULL | Academic term (e.g., L2T1) |
| `department` | VARCHAR(50) | DEFAULT 'CSE' | Department name |

### Table: `topics`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique topic identifier |
| `course_id` | UUID | FOREIGN KEY -> courses(id) | Linked course |
| `title` | VARCHAR(255) | NOT NULL | Topic name (e.g., Binary Search Tree) |
| `description` | TEXT | NULLABLE | Concept description & question pattern |
| `exam_stage` | VARCHAR(20) | NOT NULL | 'midterm' \| 'final' \| 'both' |
| `priority` | VARCHAR(20) | DEFAULT 'medium' | 'high' \| 'medium' \| 'low' |
| `probability_score` | INTEGER | CHECK (0-100) | Probability of appearing in next exam |
| `is_industry_essential`| BOOLEAN | DEFAULT FALSE | Recommended for interviews/FAANG |
| `global_benchmarks` | JSONB | NULLABLE | MIT/Stanford course codes, notes |
| `resources` | JSONB | NULLABLE | Recommended links, YouTube, docs |

### Table: `user_course_enrollments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique enrollment ID |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Student reference |
| `course_id` | UUID | FOREIGN KEY -> courses(id) | Enrolled course |
| `enrolled_at` | TIMESTAMPTZ | DEFAULT NOW() | Enrollment date |

### Table: `user_topic_progress`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique progress record |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Student reference |
| `topic_id` | UUID | FOREIGN KEY -> topics(id) | Topic reference |
| `status` | VARCHAR(20) | DEFAULT 'not_started' | 'completed' \| 'in_progress' \| 'review' |
| `notes` | TEXT | NULLABLE | Student personal study notes |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last status update |

---

## 3. Curated DIU CSE Sample Course & Topic Data

### Course 1: Structured Programming Language (C)
- **Course Code**: CSE112 / CSE113
- **Credits**: 3.0 (Theory)
- **Midterm High Probability Topics**:
  1. *Conditionals & Nested Loops*: Pattern printing, prime number tests (Probability: 95%, High Priority).
  2. *1D & 2D Arrays*: Matrix addition, multiplication, diagonal elements (Probability: 90%, High Priority).
  3. *User Defined Functions*: Call by value vs reference, modular programming (Probability: 85%, High Priority).
- **Final Exam High Probability Topics**:
  1. *Pointers & Pointer Arithmetic*: Double pointers, dynamic memory allocation (`malloc`, `calloc`, `free`) (Probability: 95%, High Priority).
  2. *Structures & Unions*: Nested structures, array of structures for student record systems (Probability: 90%, High Priority).
  3. *File Handling*: Reading/writing formatted data with `fscanf`, `fprintf`, `fread`, `fwrite` (Probability: 85%, High Priority).
- **Industry & Global Extension**:
  - Memory leak debugging with Valgrind, basic stack simulation in C.
  - Global Benchmark: Harvard CS50x Weeks 1-5, MIT 6.087 (Practical C Programming).

### Course 2: Data Structures
- **Course Code**: CSE212 / CSE213
- **Credits**: 3.0 (Theory)
- **Midterm High Probability Topics**:
  1. *Asymptotic Analysis & Big-O*: Time & Space complexity calculation of nested loops and recurrences (Probability: 90%, High Priority).
  2. *Singly & Doubly Linked Lists*: Node insertion, deletion, reversal, cycle detection (Probability: 95%, High Priority).
  3. *Stack & Queue Applications*: Infix to Postfix conversion, balanced parentheses, circular queues (Probability: 90%, High Priority).
- **Final Exam High Probability Topics**:
  1. *Binary Search Trees (BST)*: Insertion, deletion (3 cases), in-order/pre-order/post-order traversals (Probability: 95%, High Priority).
  2. *AVL Trees & Rotations*: LL, RR, LR, RL balancing rotations, balance factor calculation (Probability: 85%, High Priority).
  3. *Heap & Priority Queues*: Max-heap construction, Heap Sort algorithm, deletion from heap (Probability: 80%, Medium Priority).
  4. *Graph Traversals*: Breadth-First Search (BFS) and Depth-First Search (DFS) with adjacency matrices/lists (Probability: 90%, High Priority).
- **Industry & Global Extension**:
  - Competitive programming patterns: Two Pointers, Sliding Window, Monotonic Stack.
  - Global Benchmark: Stanford CS106B, MIT 6.006 (Introduction to Algorithms), NeetCode 150 roadmap.

---

## 4. Antigravity IDE Workflow Best Practices

1. **Review Implementation Plan Before Approval**:
   - When Antigravity generates its initial architecture plan, review the suggested folder layout. Ensure backend routes are separated into `routes/`, database models into `models/`, and Pydantic schemas into `schemas/`.

2. **Leverage the Integrated Browser Agent**:
   - The Antigravity agent can open Chromium inside the IDE, interact with the rendered PWA, click checkboxes, and inspect console logs.
   - When testing the topic completion bar, observe the glowing screen border indicating the agent is performing UI validation.

3. **Supabase Integration**:
   - Provide your Supabase database connection string in a `.env` file:
     ```env
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     JWT_SECRET=super_secret_jwt_key_2026
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=1440
     ```

4. **Iterative Feature Additions**:
   - Prompt the agent in phases:
     * **Phase 1**: Database schema + FastAPI authentication + CRUD endpoints for courses and topics.
     * **Phase 2**: Frontend UI dashboard + course checklist + progress tracking calculation.
     * **Phase 3**: DIUQBank probability filter + MIT/Stanford global benchmark cards.
     * **Phase 4**: PWA service worker configuration and Docker containerization.
