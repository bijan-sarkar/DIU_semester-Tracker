import asyncio
import os
from sqlalchemy.future import select

from app.database import AsyncSessionLocal, init_db, engine, Base
from app.models.user import User
from app.models.course import Course
from app.models.topic import Topic
from app.models.enrollment import UserCourseEnrollment
from app.models.progress import UserTopicProgress
from app.auth import get_password_hash

# OFFICIAL DIU CSE 12-SEMESTER CURRICULUM (From DIU Official Course Distribution)
DIU_SEMESTER_COURSES = [
    # Level-1, Term-1 (12.0 Credits)
    {"code": "ENG-101", "title": "Basic Functional English and English Spoken", "credits": 3.0, "semester_level": "Level 1 Term 1"},
    {"code": "MAT-101", "title": "Mathematics - I", "credits": 3.0, "semester_level": "Level 1 Term 1"},
    {"code": "CSE-112", "title": "Computer Fundamentals", "credits": 3.0, "semester_level": "Level 1 Term 1"},
    {"code": "BDS-101", "title": "Bangladesh Studies and History of Bengal", "credits": 3.0, "semester_level": "Level 1 Term 1"},

    # Level-1, Term-2 (13.5 Credits)
    {"code": "ENG-102", "title": "Writing and Comprehension", "credits": 3.0, "semester_level": "Level 1 Term 2"},
    {"code": "MAT-102", "title": "Mathematics-II: Calculus, Complex Variables and Linear Algebra", "credits": 3.0, "semester_level": "Level 1 Term 2"},
    {"code": "CSE-113", "title": "Programming and Problem Solving", "credits": 3.0, "semester_level": "Level 1 Term 2"},
    {"code": "CSE-114", "title": "Programming and Problem Solving Lab", "credits": 1.5, "semester_level": "Level 1 Term 2"},
    {"code": "PHY-101", "title": "Physics-I", "credits": 3.0, "semester_level": "Level 1 Term 2"},

    # Level-1, Term-3 (13.5 Credits)
    {"code": "PHY-102", "title": "Physics - II", "credits": 3.0, "semester_level": "Level 1 Term 3"},
    {"code": "PHY-103", "title": "Physics - II Lab", "credits": 1.5, "semester_level": "Level 1 Term 3"},
    {"code": "CSE-121", "title": "Electrical Circuits", "credits": 3.0, "semester_level": "Level 1 Term 3"},
    {"code": "CSE-122", "title": "Electrical Circuits Lab", "credits": 1.5, "semester_level": "Level 1 Term 3"},
    {"code": "CSE-123", "title": "Data Structure", "credits": 3.0, "semester_level": "Level 1 Term 3"},
    {"code": "CSE-124", "title": "Data Structure Lab", "credits": 1.5, "semester_level": "Level 1 Term 3"},

    # Level-2, Term-1 (13.5 Credits)
    {"code": "MAT-211", "title": "Engineering Mathematics", "credits": 3.0, "semester_level": "Level 2 Term 1"},
    {"code": "CSE-212", "title": "Discrete Mathematics", "credits": 3.0, "semester_level": "Level 2 Term 1"},
    {"code": "CSE-213", "title": "Algorithms", "credits": 3.0, "semester_level": "Level 2 Term 1"},
    {"code": "CSE-214", "title": "Algorithms Lab", "credits": 1.5, "semester_level": "Level 2 Term 1"},
    {"code": "GED-201", "title": "Bangladesh Studies and Contemporary Issues", "credits": 3.0, "semester_level": "Level 2 Term 1"},

    # Level-2, Term-2 (12.0 Credits)
    {"code": "AOL-101", "title": "Art of Living", "credits": 3.0, "semester_level": "Level 2 Term 2"},
    {"code": "CSE-215", "title": "Electronic Devices and Circuits", "credits": 3.0, "semester_level": "Level 2 Term 2"},
    {"code": "CSE-216", "title": "Electronic Devices and Circuits Lab", "credits": 1.5, "semester_level": "Level 2 Term 2"},
    {"code": "CSE-221", "title": "Object Oriented Programming", "credits": 3.0, "semester_level": "Level 2 Term 2"},
    {"code": "CSE-222", "title": "Object Oriented Programming Lab", "credits": 1.5, "semester_level": "Level 2 Term 2"},

    # Level-2, Term-3 (13.5 Credits)
    {"code": "CSE-223", "title": "Digital Logic Design", "credits": 3.0, "semester_level": "Level 2 Term 3"},
    {"code": "CSE-224", "title": "Digital Logic Design Lab", "credits": 1.5, "semester_level": "Level 2 Term 3"},
    {"code": "CSE-225", "title": "Data Communication", "credits": 3.0, "semester_level": "Level 2 Term 3"},
    {"code": "CSE-228", "title": "Theory of Computation", "credits": 3.0, "semester_level": "Level 2 Term 3"},
    {"code": "CSE-227", "title": "Systems Analysis and Design", "credits": 3.0, "semester_level": "Level 2 Term 3"},

    # Level-3, Term-1 (12.0 Credits)
    {"code": "CSE-226", "title": "Numerical Methods", "credits": 3.0, "semester_level": "Level 3 Term 1"},
    {"code": "CSE-311", "title": "Database Management System", "credits": 3.0, "semester_level": "Level 3 Term 1"},
    {"code": "CSE-312", "title": "Database Management System Lab", "credits": 1.5, "semester_level": "Level 3 Term 1"},
    {"code": "CSE-313", "title": "Compiler Design", "credits": 3.0, "semester_level": "Level 3 Term 1"},
    {"code": "CSE-314", "title": "Compiler Design Lab", "credits": 1.5, "semester_level": "Level 3 Term 1"},

    # Level-3, Term-2 (13.5 Credits)
    {"code": "CSE-315", "title": "Software Engineering", "credits": 3.0, "semester_level": "Level 3 Term 2"},
    {"code": "CSE-317", "title": "Microprocessor and Microcontrollers", "credits": 3.0, "semester_level": "Level 3 Term 2"},
    {"code": "CSE-321", "title": "Computer Networks", "credits": 3.0, "semester_level": "Level 3 Term 2"},
    {"code": "CSE-322", "title": "Computer Networks Lab", "credits": 1.5, "semester_level": "Level 3 Term 2"},
    {"code": "ACT-327", "title": "Financial and Managerial Accounting", "credits": 3.0, "semester_level": "Level 3 Term 2"},

    # Level-3, Term-3 (13.5 Credits)
    {"code": "STA-101", "title": "Statistics and Probability", "credits": 3.0, "semester_level": "Level 3 Term 3"},
    {"code": "CSE-316", "title": "Artificial Intelligence", "credits": 3.0, "semester_level": "Level 3 Term 3"},
    {"code": "CSE-323", "title": "Operating Systems", "credits": 3.0, "semester_level": "Level 3 Term 3"},
    {"code": "CSE-324", "title": "Operating Systems Lab", "credits": 1.5, "semester_level": "Level 3 Term 3"},
    {"code": "CSE-E01", "title": "Elective-I", "credits": 3.0, "semester_level": "Level 3 Term 3"},

    # Level-4, Term-1 (13.5 Credits)
    {"code": "CSE-325", "title": "Instrumentation and Control", "credits": 3.0, "semester_level": "Level 4 Term 1"},
    {"code": "CSE-326", "title": "Social and Professional Issues in Computing", "credits": 3.0, "semester_level": "Level 4 Term 1"},
    {"code": "CSE-411", "title": "Computer Graphics", "credits": 3.0, "semester_level": "Level 4 Term 1"},
    {"code": "CSE-412", "title": "Computer Graphics Lab", "credits": 1.5, "semester_level": "Level 4 Term 1"},
    {"code": "CSE-E02", "title": "Elective-II", "credits": 3.0, "semester_level": "Level 4 Term 1"},

    # Level-4, Term-2 (12.0 Credits)
    {"code": "CSE-E03", "title": "Elective-III", "credits": 3.0, "semester_level": "Level 4 Term 2"},
    {"code": "CSE-E04", "title": "Elective-IV", "credits": 3.0, "semester_level": "Level 4 Term 2"},
    {"code": "CSE-498", "title": "Capstone Project (Phase I, to be completed in Level-4 Term-2)", "credits": 3.0, "semester_level": "Level 4 Term 2"},
    {"code": "CSE-490", "title": "Research Project / Industry Immersion", "credits": 3.0, "semester_level": "Level 4 Term 2"},

    # Level-4, Term-3 (12.0 Credits)
    {"code": "ECO-426", "title": "Engineering Economics", "credits": 3.0, "semester_level": "Level 4 Term 3"},
    {"code": "CSE-E05", "title": "Elective-V", "credits": 3.0, "semester_level": "Level 4 Term 3"},
    {"code": "CSE-E06", "title": "Elective-VI", "credits": 3.0, "semester_level": "Level 4 Term 3"},
    {"code": "CSE-499", "title": "Capstone Project (Phase I, continued from Level-4 Term-1)", "credits": 3.0, "semester_level": "Level 4 Term 3"}
]

# DETAILED DIU EXAM RECURRENT QUESTIONS (Using simple student-friendly terms)
CORE_TOPICS = {
    # CSE-113: Programming and Problem Solving (L1T2)
    "CSE-113": [
        # Midterm Syllabus
        {
            "title": "Decision Making & Menu Programs (If-Else & Switch)",
            "description": "DIU Exam Pattern: Menu-driven calculator, electricity bill calculation, leap year logic, switch-case fallthrough.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": False,
            "global_benchmarks": {"code": "Harvard CS50x W1", "notes": "Control flow and boolean logic branching"},
            "resources": [
                {"title": "C Decision Making & Switch Tutorial", "url": "https://www.geeksforgeeks.org/c-decision-making-switch-if-else/", "type": "article"}
            ]
        },
        {
            "title": "Looping & Triangle Patterns (Pyramid, Pascal, Prime Test)",
            "description": "DIU Exam Pattern: Printing nested star pyramids, Pascal triangles, checking prime numbers in a range.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": False,
            "global_benchmarks": {"code": "LeetCode Basics", "notes": "2D loop coordination and iteration patterns"},
            "resources": [
                {"title": "Pattern Printing in C", "url": "https://www.programiz.com/c-programming/examples/pyramid-pattern", "type": "problem_set"}
            ]
        },
        {
            "title": "1D & 2D Arrays (Matrix Addition & Multiplication)",
            "description": "DIU Exam Pattern: Row-column condition check for matrix multiplication, diagonal elements sum, transpose.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.087", "notes": "Contiguous array memory layout"},
            "resources": [
                {"title": "Matrix Multiplication in C", "url": "https://www.geeksforgeeks.org/c-program-multiply-two-matrices/", "type": "article"}
            ]
        },
        {
            "title": "User-Defined Functions & Variable Scope",
            "description": "DIU Exam Pattern: Call by value vs Call by reference simulation, local vs global vs static variables.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 85,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Stanford CS106B", "notes": "Procedural decomposition and stack frame creation"},
            "resources": [
                {"title": "C Functions Guide", "url": "https://en.cppreference.com/w/c/language/functions", "type": "documentation"}
            ]
        },
        {
            "title": "Strings & Manual String Functions",
            "description": "DIU Exam Pattern: Checking palindrome without library function, manual string length and concatenation.",
            "exam_stage": "midterm",
            "priority": "medium",
            "probability_score": 80,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "LeetCode 125", "notes": "Valid Palindrome string manipulation"},
            "resources": [
                {"title": "C Strings Guide", "url": "https://www.geeksforgeeks.org/strings-in-c/", "type": "article"}
            ]
        },
        # Final Syllabus
        {
            "title": "Pointers & Pointer Arithmetic",
            "description": "DIU Exam Pattern: Output tracing with *(ptr + i), pointers to arrays, double pointers (**ptr).",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Harvard CS50x W4", "notes": "Pointers and direct computer memory addresses"},
            "resources": [
                {"title": "Pointers Explained Visually", "url": "https://www.youtube.com/watch?v=zuegQmMdy8M", "type": "youtube"}
            ]
        },
        {
            "title": "Dynamic Memory Allocation (malloc, calloc, realloc, free)",
            "description": "DIU Exam Pattern: Dynamic 1D/2D arrays, memory leak avoidance, dangling pointer risks.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Valgrind Memory Debugger", "notes": "Heap memory management and leak detection"},
            "resources": [
                {"title": "Dynamic Memory Allocation in C", "url": "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-realloc/", "type": "article"}
            ]
        },
        {
            "title": "Structures & Unions (Array of Student Records)",
            "description": "DIU Exam Pattern: Student database with CGPA sorting, memory difference between struct and union.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.087", "notes": "Custom composite data structures"},
            "resources": [
                {"title": "C Structures Guide", "url": "https://www.programiz.com/c-programming/c-structures", "type": "article"}
            ]
        },
        {
            "title": "File Handling in C (fopen, fscanf, fprintf, fread, fwrite)",
            "description": "DIU Exam Pattern: Reading records from input.txt, saving filtered grades to result.txt.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 85,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Unix Systems", "notes": "File stream IO operations"},
            "resources": [
                {"title": "C File Operations", "url": "https://www.geeksforgeeks.org/basics-file-handling-c/", "type": "documentation"}
            ]
        },
        {
            "title": "Recursion & Call Stack Tracing",
            "description": "DIU Exam Pattern: Factorial, Fibonacci, Tower of Hanoi recursion tree tracing.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 88,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Stanford CS106B", "notes": "Recursive thinking and stack depth"},
            "resources": [
                {"title": "Recursion Call Stack Visualizer", "url": "https://pythontutor.com/c.html", "type": "article"}
            ]
        }
    ],

    # CSE-123: Data Structure (L1T3)
    "CSE-123": [
        # Midterm Syllabus
        {
            "title": "Big-O Notation & Asymptotic Time Complexity",
            "description": "DIU Exam Pattern: Finding Big-O of nested loops, best/worst/average cases, recurrence relations.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L1", "notes": "Asymptotic analysis and efficiency bounds"},
            "resources": [
                {"title": "Big-O Cheat Sheet", "url": "https://www.bigocheatsheet.com/", "type": "documentation"}
            ]
        },
        {
            "title": "Singly & Doubly Linked Lists (Insert, Delete, Reverse)",
            "description": "DIU Exam Pattern: Insert at head/tail/position, delete node by key, reverse linked list in O(N).",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "LeetCode 206", "notes": "Reverse Linked List & Fast/Slow Pointers"},
            "resources": [
                {"title": "Linked List Visualizer", "url": "https://visualgo.net/en/list", "type": "article"}
            ]
        },
        {
            "title": "Stack: Infix to Postfix & Balanced Parentheses",
            "description": "DIU Exam Pattern: Operator precedence stack conversion table, evaluating postfix expressions.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "LeetCode 20", "notes": "Valid Parentheses with Monotonic Stack"},
            "resources": [
                {"title": "Infix to Postfix Conversion", "url": "https://www.geeksforgeeks.org/convert-infix-expression-to-postfix-expression/", "type": "article"}
            ]
        },
        {
            "title": "Circular Queue Implementation & Boundary Conditions",
            "description": "DIU Exam Pattern: Front/rear wrap-around formula (rear + 1) % size, overflow vs underflow checks.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 85,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Stanford CS106B", "notes": "FIFO Queues and BFS buffering"},
            "resources": [
                {"title": "Circular Queue Implementation", "url": "https://www.programiz.com/dsa/circular-queue", "type": "article"}
            ]
        },
        # Final Syllabus
        {
            "title": "Binary Search Trees (BST): Insert, Delete 3 Cases, Traversals",
            "description": "DIU Exam Pattern: Node deletion (leaf, one child, two children with in-order successor), Inorder/Preorder/Postorder traversals.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L5", "notes": "Binary Search Trees and BST Invariants"},
            "resources": [
                {"title": "BST Visualizer", "url": "https://visualgo.net/en/bst", "type": "article"}
            ]
        },
        {
            "title": "AVL Trees & Balance Rotations (LL, RR, LR, RL)",
            "description": "DIU Exam Pattern: Balance Factor calculation (Height L - Height R), single vs double rotation steps.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L6", "notes": "Self-balancing binary trees"},
            "resources": [
                {"title": "AVL Tree Rotation Step-by-Step", "url": "https://www.geeksforgeeks.org/insertion-in-an-avl-tree/", "type": "article"}
            ]
        },
        {
            "title": "Binary Heap & Heap Sort",
            "description": "DIU Exam Pattern: Max-heap / Min-heap array representation, heapify algorithm O(N), HeapSort trace.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 85,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "LeetCode 215", "notes": "Priority Queues and Kth Largest Element"},
            "resources": [
                {"title": "Heap Sort Visualized", "url": "https://www.youtube.com/watch?v=2DmK_H7IdTo", "type": "youtube"}
            ]
        },
        {
            "title": "Graph Traversals: Breadth-First (BFS) & Depth-First (DFS)",
            "description": "DIU Exam Pattern: Adjacency matrix vs list representation, BFS queue trace, DFS stack/recursion trace.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "NeetCode 150", "notes": "Graph Traversal Mastery for Technical Interviews"},
            "resources": [
                {"title": "Graph Traversal Algorithms", "url": "https://visualgo.net/en/dfsbfs", "type": "article"}
            ]
        },
        {
            "title": "Hashing & Collision Resolution Techniques",
            "description": "DIU Exam Pattern: Separate chaining vs Open Addressing (Linear Probing, Quadratic Probing), load factor.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 85,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L8", "notes": "Hash tables and amortized O(1) lookups"},
            "resources": [
                {"title": "Hashing Collision Resolution", "url": "https://www.geeksforgeeks.org/hashing-set-2-separate-chaining/", "type": "article"}
            ]
        }
    ],

    # CSE-213: Algorithms (L2T1)
    "CSE-213": [
        # Midterm Syllabus
        {
            "title": "Divide & Conquer: Merge Sort and Quick Sort",
            "description": "DIU Exam Pattern: Step-by-step trace of Quick Sort partition, Merge Sort recurrence relation T(n) = 2T(n/2) + O(n), best vs worst case.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L3", "notes": "Divide and Conquer, Master Theorem"},
            "resources": [
                {"title": "Merge Sort & Quick Sort Visualizer", "url": "https://visualgo.net/en/sorting", "type": "article"}
            ]
        },
        {
            "title": "Greedy Algorithms: Fractional Knapsack & Activity Selection",
            "description": "DIU Exam Pattern: Sorting by value-to-weight ratio, greedy choice property, optimal substructure.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Stanford CS161", "notes": "Greedy Strategy and Interval Scheduling"},
            "resources": [
                {"title": "Fractional Knapsack Step-by-Step", "url": "https://www.geeksforgeeks.org/fractional-knapsack-problem/", "type": "article"}
            ]
        },
        {
            "title": "Minimum Spanning Tree (Kruskal & Prim Algorithms)",
            "description": "DIU Exam Pattern: Edge weight table, Disjoint Set Union (DSU) cycle check, Prim priority queue trace.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L12", "notes": "Minimum Spanning Trees and Cut Property"},
            "resources": [
                {"title": "Kruskal & Prim Visualization", "url": "https://visualgo.net/en/mst", "type": "article"}
            ]
        },
        # Final Syllabus
        {
            "title": "Dynamic Programming: 0/1 Knapsack Problem",
            "description": "DIU Exam Pattern: DP table formulation V[i, w], item inclusion vs exclusion decision, backtracking selected items.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L15", "notes": "Dynamic Programming: Subproblems and Memoization"},
            "resources": [
                {"title": "0/1 Knapsack Problem DP", "url": "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", "type": "article"}
            ]
        },
        {
            "title": "Dynamic Programming: Longest Common Subsequence (LCS)",
            "description": "DIU Exam Pattern: 2D table construction, arrow pointers for diagonal matches, printing the actual LCS string.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "LeetCode 1143", "notes": "Longest Common Subsequence 2D DP pattern"},
            "resources": [
                {"title": "LCS DP Table Construction", "url": "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/", "type": "article"}
            ]
        },
        {
            "title": "Single-Source Shortest Paths: Dijkstra & Bellman-Ford",
            "description": "DIU Exam Pattern: Dijkstra relaxation table step-by-step, detecting negative weight cycles with Bellman-Ford.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "MIT 6.006 L10", "notes": "Shortest Paths and Edge Relaxation"},
            "resources": [
                {"title": "Dijkstra Algorithm Visualizer", "url": "https://visualgo.net/en/sssp", "type": "article"}
            ]
        }
    ],

    # CSE-221: Object Oriented Programming (L2T2)
    "CSE-221": [
        # Midterm Syllabus
        {
            "title": "OOP Fundamentals & Class/Object Modeling",
            "description": "DIU Exam Pattern: Differences between procedural and OOP, creating classes, instance variables and methods.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Stanford CS106A", "notes": "Object-Oriented Programming Paradigms"},
            "resources": [
                {"title": "Java OOP Basics", "url": "https://www.w3schools.com/java/java_classes.asp", "type": "article"}
            ]
        },
        {
            "title": "Constructors, 'this' Keyword & Constructor Chaining",
            "description": "DIU Exam Pattern: Default vs parameterized constructor, this() chaining, copy constructor.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Oracle Java Standard", "notes": "Object Lifecycle and Instantiation"},
            "resources": [
                {"title": "Constructors in Java", "url": "https://www.geeksforgeeks.org/constructors-in-java/", "type": "article"}
            ]
        },
        {
            "title": "Encapsulation & Access Modifiers (public, private, protected)",
            "description": "DIU Exam Pattern: Data hiding, getter/setter validation, package visibility.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 88,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Clean Code", "notes": "Information hiding and encapsulation"},
            "resources": [
                {"title": "Access Modifiers in Java", "url": "https://www.programiz.com/java-programming/access-modifiers", "type": "article"}
            ]
        },
        {
            "title": "Polymorphism: Method Overloading vs Overriding",
            "description": "DIU Exam Pattern: Compile-time vs run-time polymorphism, dynamic method dispatch, @Override.",
            "exam_stage": "midterm",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Design Patterns", "notes": "Polymorphism and Interface Segregation"},
            "resources": [
                {"title": "Polymorphism in Java", "url": "https://www.geeksforgeeks.org/polymorphism-in-java/", "type": "article"}
            ]
        },
        # Final Syllabus
        {
            "title": "Inheritance & 'super' Keyword Mechanics",
            "description": "DIU Exam Pattern: 'extends' relationship, calling superclass constructor super(), resolving ambiguity.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Effective Java", "notes": "Inheritance hierarchies and composition"},
            "resources": [
                {"title": "Java Inheritance & super", "url": "https://www.geeksforgeeks.org/super-keyword/", "type": "article"}
            ]
        },
        {
            "title": "Abstract Classes vs Interfaces",
            "description": "DIU Exam Pattern: Complete comparison table, multiple interface inheritance, default methods.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "SOLID Principles", "notes": "Abstract Data Types and Loose Coupling"},
            "resources": [
                {"title": "Abstract Class vs Interface", "url": "https://www.baeldung.com/java-interface-vs-abstract-class", "type": "article"}
            ]
        },
        {
            "title": "Exception Handling (try-catch-finally, custom exceptions)",
            "description": "DIU Exam Pattern: Checked vs unchecked exceptions, throw vs throws, creating custom StudentException.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 90,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "Production Java", "notes": "Robust error handling and fault tolerance"},
            "resources": [
                {"title": "Java Exceptions Best Practices", "url": "https://www.geeksforgeeks.org/exceptions-in-java/", "type": "article"}
            ]
        },
        {
            "title": "Java Collections Framework (ArrayList, HashMap, HashSet)",
            "description": "DIU Exam Pattern: ArrayList vs LinkedList, internal working of HashMap, iterating collections.",
            "exam_stage": "final",
            "priority": "high",
            "probability_score": 95,
            "is_industry_essential": True,
            "global_benchmarks": {"code": "LeetCode Standard", "notes": "Collections for Technical Interviews"},
            "resources": [
                {"title": "Java Collections Overview", "url": "https://www.baeldung.com/java-collections-framework-overview", "type": "article"}
            ]
        }
    ]
}

async def seed_database():
    print("Resetting and Seeding Database with Official DIU Syllabus...")
    async with engine.begin() as conn:
        # Recreate tables to ensure fresh schema sync
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        course_map = {}

        # Insert Official DIU Curriculum Courses
        for c_data in DIU_SEMESTER_COURSES:
            course = Course(
                code=c_data["code"],
                title=c_data["title"],
                credits=c_data["credits"],
                semester_level=c_data["semester_level"],
                department="CSE"
            )
            session.add(course)
            await session.flush()
            course_map[course.code] = course

        await session.commit()
        print(f"Seeded {len(course_map)} official DIU courses across 12 semesters.")

        # Insert Core DIU Exam Topics
        topic_count = 0
        for course_code, topics in CORE_TOPICS.items():
            course = course_map.get(course_code)
            if not course:
                continue

            for t_data in topics:
                topic = Topic(
                    course_id=course.id,
                    title=t_data["title"],
                    description=t_data.get("description"),
                    exam_stage=t_data["exam_stage"],
                    priority=t_data["priority"],
                    probability_score=t_data["probability_score"],
                    is_industry_essential=t_data["is_industry_essential"],
                    global_benchmarks=t_data.get("global_benchmarks"),
                    resources=t_data.get("resources")
                )
                session.add(topic)
                topic_count += 1

        await session.commit()
        print(f"Seeded {topic_count} DIU exam recurrent questions and topics.")

        # Seed Demo DIU Student in Level 2 Term 1
        demo_email = "demo.student@diu.edu.bd"
        demo_user = User(
            email=demo_email,
            full_name="Tanvir Ahmed (DIU CSE Demo)",
            student_id="231-15-4521",
            current_semester="Level 2 Term 1",
            hashed_password=get_password_hash("diu123456")
        )
        session.add(demo_user)
        await session.commit()
        await session.refresh(demo_user)
        print(f"Created Demo Student: {demo_user.email}")

        # Enroll demo student in Level 2 Term 1 core courses: CSE-213 (Algorithms) & CSE-212 (Discrete Math)
        for code in ["CSE-213", "CSE-212"]:
            c = course_map.get(code)
            if c:
                enr = UserCourseEnrollment(user_id=demo_user.id, course_id=c.id)
                session.add(enr)
                print(f"Enrolled demo student in {c.code} ({c.title})")

        await session.commit()

        # Seed initial topic progress for demo student in Algorithms (CSE-213)
        algo_course = course_map.get("CSE-213")
        if algo_course:
            t_res = await session.execute(select(Topic).where(Topic.course_id == algo_course.id))
            algo_topics = t_res.scalars().all()

            for t in algo_topics:
                if "Merge Sort" in t.title:
                    p = UserTopicProgress(
                        user_id=demo_user.id,
                        topic_id=t.id,
                        status="completed",
                        notes="Mastered Divide and Conquer recurrence formula. Solved DIU 2023 & 2024 midterm question."
                    )
                    session.add(p)
                elif "Greedy" in t.title:
                    p = UserTopicProgress(
                        user_id=demo_user.id,
                        topic_id=t.id,
                        status="in_progress",
                        notes="Practiced value/weight ratio sorting table. Need to review activity selection proof."
                    )
                    session.add(p)
                elif "Minimum Spanning Tree" in t.title:
                    p = UserTopicProgress(
                        user_id=demo_user.id,
                        topic_id=t.id,
                        status="review",
                        notes="Revise Kruskal Disjoint Set cycle detection before midterm exam."
                    )
                    session.add(p)

        await session.commit()
        print("Official DIU Syllabus database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
