import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM submissions;
  DELETE FROM assignments;
  DELETE FROM enrollments;
  DELETE FROM students;
  DELETE FROM courses;
  DELETE FROM instructors;
`);

// ── Instructors ────────────────────────────────────────────────────
const insertInstructor = db.prepare(`INSERT INTO instructors (name, email, department, title, status) VALUES (?, ?, ?, ?, ?)`);

const i1 = insertInstructor.run('Dr. Sarah Mitchell', 's.mitchell@university.edu', 'Computer Science', 'Associate Professor', 'active').lastInsertRowid;
const i2 = insertInstructor.run('Prof. James Park', 'j.park@university.edu', 'Computer Science', 'Professor', 'active').lastInsertRowid;
const i3 = insertInstructor.run('Dr. Maria Gonzalez', 'm.gonzalez@university.edu', 'Data Science', 'Assistant Professor', 'active').lastInsertRowid;
const i4 = insertInstructor.run('Dr. Kevin O\'Brien', 'k.obrien@university.edu', 'Business', 'Associate Professor', 'active').lastInsertRowid;
const i5 = insertInstructor.run('Prof. Aisha Patel', 'a.patel@university.edu', 'Design', 'Professor', 'active').lastInsertRowid;

// ── Courses ────────────────────────────────────────────────────
const insertCourse = db.prepare(`INSERT INTO courses (code, title, department, instructor_id, level, max_students, start_date, end_date, schedule, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const c1 = insertCourse.run('CS101', 'Introduction to Python', 'Computer Science', i1, 'beginner', 30, '2026-01-13', '2026-05-08', 'Mon/Wed 10:00-11:30', 'active', 'Fundamentals of programming using Python. Variables, loops, functions, and basic data structures.').lastInsertRowid;
const c2 = insertCourse.run('CS201', 'Data Structures & Algorithms', 'Computer Science', i2, 'intermediate', 25, '2026-01-13', '2026-05-08', 'Tue/Thu 13:00-14:30', 'active', 'Arrays, linked lists, trees, graphs, sorting, and algorithm analysis.').lastInsertRowid;
const c3 = insertCourse.run('DS301', 'Machine Learning Fundamentals', 'Data Science', i3, 'advanced', 20, '2026-01-13', '2026-05-08', 'Mon/Wed 14:00-15:30', 'active', 'Supervised and unsupervised learning, neural networks, model evaluation.').lastInsertRowid;
const c4 = insertCourse.run('BUS210', 'Digital Marketing Analytics', 'Business', i4, 'intermediate', 35, '2026-01-13', '2026-05-08', 'Tue/Thu 10:00-11:30', 'active', 'Marketing metrics, A/B testing, attribution models, and campaign optimization.').lastInsertRowid;
const c5 = insertCourse.run('DES150', 'UI/UX Design Principles', 'Design', i5, 'beginner', 25, '2026-01-13', '2026-05-08', 'Wed/Fri 10:00-11:30', 'active', 'User research, wireframing, prototyping, usability testing, and design systems.').lastInsertRowid;
const c6 = insertCourse.run('CS310', 'Full-Stack Web Development', 'Computer Science', i1, 'advanced', 20, '2026-01-13', '2026-05-08', 'Tue/Thu 16:00-17:30', 'active', 'React, Node.js, databases, authentication, deployment. Build a production app.').lastInsertRowid;
const c7 = insertCourse.run('DS101', 'Statistics for Data Science', 'Data Science', i3, 'beginner', 30, '2026-01-13', '2026-05-08', 'Tue/Thu 10:00-11:30', 'active', 'Probability, distributions, hypothesis testing, regression, and Bayesian thinking.').lastInsertRowid;
const c8 = insertCourse.run('BUS310', 'Product Management', 'Business', i4, 'advanced', 25, '2026-01-13', '2026-05-08', 'Mon/Wed 16:00-17:30', 'active', 'Product strategy, roadmapping, prioritization frameworks, and stakeholder management.').lastInsertRowid;

// ── Students ────────────────────────────────────────────────────
const insertStudent = db.prepare(`INSERT INTO students (name, email, student_id, major, year, gpa, status, enrolled_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

const s1 = insertStudent.run('Emma Rodriguez', 'e.rodriguez@student.edu', 'STU-2024-001', 'Computer Science', 'sophomore', 3.7, 'active', '2024-08-25').lastInsertRowid;
const s2 = insertStudent.run('Liam Chen', 'l.chen@student.edu', 'STU-2023-015', 'Computer Science', 'junior', 3.9, 'active', '2023-08-28').lastInsertRowid;
const s3 = insertStudent.run('Sophia Williams', 's.williams@student.edu', 'STU-2024-023', 'Data Science', 'sophomore', 3.5, 'active', '2024-08-25').lastInsertRowid;
const s4 = insertStudent.run('Noah Kim', 'n.kim@student.edu', 'STU-2023-042', 'Business', 'junior', 3.2, 'active', '2023-08-28').lastInsertRowid;
const s5 = insertStudent.run('Olivia Foster', 'o.foster@student.edu', 'STU-2025-003', 'Design', 'freshman', 3.8, 'active', '2025-08-25').lastInsertRowid;
const s6 = insertStudent.run('Marcus Johnson', 'm.johnson@student.edu', 'STU-2024-011', 'Computer Science', 'sophomore', 2.8, 'active', '2024-08-25').lastInsertRowid;
const s7 = insertStudent.run('Ava Patel', 'a.patel@student.edu', 'STU-2023-008', 'Data Science', 'junior', 3.6, 'active', '2023-08-28').lastInsertRowid;
const s8 = insertStudent.run('Ethan Brooks', 'e.brooks@student.edu', 'STU-2024-019', 'Computer Science', 'sophomore', 2.4, 'active', '2024-08-25').lastInsertRowid;
const s9 = insertStudent.run('Isabella Torres', 'i.torres@student.edu', 'STU-2022-031', 'Business', 'senior', 3.4, 'active', '2022-08-29').lastInsertRowid;
const s10 = insertStudent.run('James Wright', 'j.wright@student.edu', 'STU-2025-017', 'Computer Science', 'freshman', 3.1, 'active', '2025-08-25').lastInsertRowid;
const s11 = insertStudent.run('Mia Nakamura', 'm.nakamura@student.edu', 'STU-2024-005', 'Design', 'sophomore', 3.9, 'active', '2024-08-25').lastInsertRowid;
const s12 = insertStudent.run('Daniel Garcia', 'd.garcia@student.edu', 'STU-2023-027', 'Data Science', 'junior', 2.9, 'active', '2023-08-28').lastInsertRowid;
const s13 = insertStudent.run('Charlotte Lee', 'c.lee@student.edu', 'STU-2024-033', 'Computer Science', 'sophomore', 3.3, 'active', '2024-08-25').lastInsertRowid;
const s14 = insertStudent.run('Ryan O\'Connor', 'r.oconnor@student.edu', 'STU-2023-019', 'Business', 'junior', 2.6, 'active', '2023-08-28').lastInsertRowid;
const s15 = insertStudent.run('Zoe Andersen', 'z.andersen@student.edu', 'STU-2024-041', 'Data Science', 'sophomore', 3.7, 'active', '2024-08-25').lastInsertRowid;
const s16 = insertStudent.run('Tyler Washington', 't.washington@student.edu', 'STU-2022-009', 'Computer Science', 'senior', 3.0, 'active', '2022-08-29').lastInsertRowid;
const s17 = insertStudent.run('Hannah Murphy', 'h.murphy@student.edu', 'STU-2025-022', 'Design', 'freshman', null, 'active', '2025-08-25').lastInsertRowid;
const s18 = insertStudent.run('Alex Rivera', 'a.rivera@student.edu', 'STU-2024-028', 'Computer Science', 'sophomore', 2.1, 'probation', '2024-08-25').lastInsertRowid;
const s19 = insertStudent.run('Grace Kim', 'g.kim@student.edu', 'STU-2023-035', 'Business', 'junior', 3.8, 'active', '2023-08-28').lastInsertRowid;
const s20 = insertStudent.run('Lucas Martin', 'l.martin@student.edu', 'STU-2024-015', 'Data Science', 'sophomore', 3.4, 'active', '2024-08-25').lastInsertRowid;

// ── Enrollments ────────────────────────────────────────────────────
const insertEnrollment = db.prepare(`INSERT INTO enrollments (student_id, course_id, enrolled_date, status, current_grade, attendance_pct, last_activity) VALUES (?, ?, ?, ?, ?, ?, ?)`);

// CS101 - Intro Python (popular, mixed levels)
insertEnrollment.run(s1, c1, '2026-01-10', 'enrolled', 92, 95, '2026-03-11');
insertEnrollment.run(s6, c1, '2026-01-10', 'enrolled', 68, 75, '2026-03-09');
insertEnrollment.run(s8, c1, '2026-01-10', 'enrolled', 55, 60, '2026-02-28');
insertEnrollment.run(s10, c1, '2026-01-10', 'enrolled', 78, 90, '2026-03-11');
insertEnrollment.run(s13, c1, '2026-01-10', 'enrolled', 85, 100, '2026-03-11');
insertEnrollment.run(s17, c1, '2026-01-10', 'enrolled', 88, 95, '2026-03-11');
insertEnrollment.run(s18, c1, '2026-01-10', 'enrolled', 42, 50, '2026-02-20');

// CS201 - Data Structures (intermediate)
insertEnrollment.run(s1, c2, '2026-01-10', 'enrolled', 88, 100, '2026-03-11');
insertEnrollment.run(s2, c2, '2026-01-10', 'enrolled', 96, 100, '2026-03-11');
insertEnrollment.run(s13, c2, '2026-01-10', 'enrolled', 74, 85, '2026-03-10');
insertEnrollment.run(s16, c2, '2026-01-10', 'enrolled', 72, 80, '2026-03-08');

// DS301 - ML Fundamentals (advanced)
insertEnrollment.run(s2, c3, '2026-01-10', 'enrolled', 94, 100, '2026-03-11');
insertEnrollment.run(s3, c3, '2026-01-10', 'enrolled', 82, 90, '2026-03-11');
insertEnrollment.run(s7, c3, '2026-01-10', 'enrolled', 87, 95, '2026-03-10');
insertEnrollment.run(s12, c3, '2026-01-10', 'enrolled', 63, 70, '2026-03-05');
insertEnrollment.run(s15, c3, '2026-01-10', 'enrolled', 79, 85, '2026-03-11');

// BUS210 - Digital Marketing
insertEnrollment.run(s4, c4, '2026-01-10', 'enrolled', 81, 90, '2026-03-11');
insertEnrollment.run(s9, c4, '2026-01-10', 'enrolled', 90, 100, '2026-03-11');
insertEnrollment.run(s14, c4, '2026-01-10', 'enrolled', 58, 65, '2026-03-03');
insertEnrollment.run(s19, c4, '2026-01-10', 'enrolled', 93, 100, '2026-03-11');

// DES150 - UI/UX Design
insertEnrollment.run(s5, c5, '2026-01-10', 'enrolled', 91, 100, '2026-03-11');
insertEnrollment.run(s11, c5, '2026-01-10', 'enrolled', 95, 100, '2026-03-11');
insertEnrollment.run(s17, c5, '2026-01-10', 'enrolled', 84, 90, '2026-03-11');
insertEnrollment.run(s3, c5, '2026-01-10', 'enrolled', 76, 85, '2026-03-09');

// CS310 - Full-Stack Web Dev
insertEnrollment.run(s2, c6, '2026-01-10', 'enrolled', 98, 100, '2026-03-11');
insertEnrollment.run(s16, c6, '2026-01-10', 'enrolled', 75, 85, '2026-03-08');
insertEnrollment.run(s1, c6, '2026-01-10', 'enrolled', 84, 90, '2026-03-11');

// DS101 - Stats for Data Science
insertEnrollment.run(s3, c7, '2026-01-10', 'enrolled', 88, 95, '2026-03-11');
insertEnrollment.run(s15, c7, '2026-01-10', 'enrolled', 91, 100, '2026-03-11');
insertEnrollment.run(s20, c7, '2026-01-10', 'enrolled', 80, 90, '2026-03-10');
insertEnrollment.run(s12, c7, '2026-01-10', 'enrolled', 65, 75, '2026-03-06');

// BUS310 - Product Management
insertEnrollment.run(s9, c8, '2026-01-10', 'enrolled', 88, 95, '2026-03-11');
insertEnrollment.run(s4, c8, '2026-01-10', 'enrolled', 76, 85, '2026-03-10');
insertEnrollment.run(s19, c8, '2026-01-10', 'enrolled', 92, 100, '2026-03-11');
insertEnrollment.run(s14, c8, '2026-01-10', 'enrolled', 61, 70, '2026-03-04');

// ── Assignments ────────────────────────────────────────────────────
const insertAssignment = db.prepare(`INSERT INTO assignments (course_id, title, type, due_date, max_points, weight, description) VALUES (?, ?, ?, ?, ?, ?, ?)`);

// CS101 Assignments
const a1 = insertAssignment.run(c1, 'Variables & Data Types Quiz', 'quiz', '2026-01-27', 50, 0.5, 'Quiz on Python primitives, type casting, and string operations.').lastInsertRowid;
const a2 = insertAssignment.run(c1, 'Loops & Functions Lab', 'lab', '2026-02-10', 100, 1.0, 'Build 5 functions using for/while loops and conditionals.').lastInsertRowid;
const a3 = insertAssignment.run(c1, 'Data Structures Project', 'project', '2026-03-03', 150, 1.5, 'Build a contact manager using lists, dicts, and file I/O.').lastInsertRowid;
const a4 = insertAssignment.run(c1, 'Midterm Exam', 'exam', '2026-03-10', 200, 2.0, 'Covers weeks 1-8. Multiple choice + coding problems.').lastInsertRowid;
const a5 = insertAssignment.run(c1, 'OOP & Classes Lab', 'lab', '2026-03-24', 100, 1.0, 'Implement a library system using classes and inheritance.').lastInsertRowid;

// CS201 Assignments
const a6 = insertAssignment.run(c2, 'Array & LinkedList Implementation', 'lab', '2026-02-03', 100, 1.0, 'Implement dynamic array and singly linked list from scratch.').lastInsertRowid;
const a7 = insertAssignment.run(c2, 'Tree Traversal Problem Set', 'homework', '2026-02-17', 80, 0.8, 'BST operations, BFS, DFS, and balanced tree checks.').lastInsertRowid;
const a8 = insertAssignment.run(c2, 'Graph Algorithms Project', 'project', '2026-03-07', 150, 1.5, 'Implement Dijkstra and A* for a pathfinding visualizer.').lastInsertRowid;
const a9 = insertAssignment.run(c2, 'Midterm Exam', 'exam', '2026-03-12', 200, 2.0, 'Big-O analysis, implementation questions, algorithm design.').lastInsertRowid;

// DS301 Assignments
const a10 = insertAssignment.run(c3, 'Linear Regression Analysis', 'lab', '2026-01-31', 100, 1.0, 'Build and evaluate a linear regression model on housing data.').lastInsertRowid;
const a11 = insertAssignment.run(c3, 'Classification Challenge', 'project', '2026-02-21', 150, 1.5, 'Compare 3 classifiers on a real-world dataset. Write-up required.').lastInsertRowid;
const a12 = insertAssignment.run(c3, 'Neural Network From Scratch', 'project', '2026-03-14', 200, 2.0, 'Implement a 2-layer neural net in NumPy. No frameworks.').lastInsertRowid;

// BUS210 Assignments
const a13 = insertAssignment.run(c4, 'Campaign Metrics Report', 'homework', '2026-02-07', 100, 1.0, 'Analyze a sample ad campaign. Calculate CPA, ROAS, and CTR.').lastInsertRowid;
const a14 = insertAssignment.run(c4, 'A/B Test Design', 'project', '2026-03-06', 150, 1.5, 'Design and analyze an A/B test for a landing page.').lastInsertRowid;
const a15 = insertAssignment.run(c4, 'Midterm Exam', 'exam', '2026-03-11', 200, 2.0, 'Marketing analytics concepts, attribution models, statistical significance.').lastInsertRowid;

// DES150 Assignments
const a16 = insertAssignment.run(c5, 'User Research Report', 'homework', '2026-02-05', 100, 1.0, 'Conduct 3 user interviews and synthesize findings into personas.').lastInsertRowid;
const a17 = insertAssignment.run(c5, 'Wireframe & Prototype', 'project', '2026-02-28', 150, 1.5, 'Design a mobile app prototype in Figma. Include 5+ screens.').lastInsertRowid;
const a18 = insertAssignment.run(c5, 'Usability Test & Iteration', 'project', '2026-03-21', 200, 2.0, 'Run usability tests on your prototype. Document findings and iterate.').lastInsertRowid;

// CS310 Assignments
const a19 = insertAssignment.run(c6, 'REST API Design', 'lab', '2026-02-03', 100, 1.0, 'Build a RESTful API with Express and PostgreSQL.').lastInsertRowid;
const a20 = insertAssignment.run(c6, 'React Frontend Sprint', 'project', '2026-02-24', 150, 1.5, 'Build a React frontend that consumes your API. Auth included.').lastInsertRowid;
const a21 = insertAssignment.run(c6, 'Full-Stack Capstone', 'project', '2026-04-18', 300, 3.0, 'Ship a production-ready full-stack app. Deployed and tested.').lastInsertRowid;

// DS101 Assignments
const a22 = insertAssignment.run(c7, 'Probability & Distributions Quiz', 'quiz', '2026-01-30', 50, 0.5, 'Normal, binomial, Poisson distributions and probability rules.').lastInsertRowid;
const a23 = insertAssignment.run(c7, 'Hypothesis Testing Lab', 'lab', '2026-02-20', 100, 1.0, 'T-tests, chi-square tests, and p-value interpretation.').lastInsertRowid;
const a24 = insertAssignment.run(c7, 'Regression Analysis Project', 'project', '2026-03-13', 150, 1.5, 'Build a multiple regression model. Interpret coefficients.').lastInsertRowid;

// BUS310 Assignments
const a25 = insertAssignment.run(c8, 'Product Brief', 'homework', '2026-02-03', 100, 1.0, 'Write a product brief for a new feature. Include user stories.').lastInsertRowid;
const a26 = insertAssignment.run(c8, 'Roadmap & Prioritization', 'project', '2026-03-03', 150, 1.5, 'Build a quarterly roadmap using RICE scoring.').lastInsertRowid;
const a27 = insertAssignment.run(c8, 'Stakeholder Presentation', 'project', '2026-04-07', 200, 2.0, 'Present product strategy to a mock executive panel.').lastInsertRowid;

// ── Submissions ────────────────────────────────────────────────────
const insertSubmission = db.prepare(`INSERT INTO submissions (assignment_id, student_id, submitted_date, score, status, feedback) VALUES (?, ?, ?, ?, ?, ?)`);

// CS101 submissions
insertSubmission.run(a1, s1, '2026-01-26', 48, 'graded', 'Excellent work. Minor string formatting issue.');
insertSubmission.run(a1, s6, '2026-01-27', 35, 'graded', 'Missed type casting questions. Review chapter 3.');
insertSubmission.run(a1, s8, '2026-01-28', 22, 'graded', 'Late submission. Significant gaps in fundamentals.');
insertSubmission.run(a1, s10, '2026-01-27', 41, 'graded', 'Good effort. Work on string slicing.');
insertSubmission.run(a1, s13, '2026-01-26', 45, 'graded', 'Strong understanding. Clean code.');
insertSubmission.run(a1, s17, '2026-01-27', 44, 'graded', 'Great start for a freshman!');
insertSubmission.run(a1, s18, '2026-01-29', 18, 'graded', 'Late. Many incorrect answers. Please attend office hours.');

insertSubmission.run(a2, s1, '2026-02-09', 92, 'graded', 'Excellent use of list comprehensions.');
insertSubmission.run(a2, s6, '2026-02-10', 65, 'graded', 'Functions work but nested loops need cleanup.');
insertSubmission.run(a2, s8, '2026-02-12', 48, 'graded', 'Late. 3 of 5 functions incomplete.');
insertSubmission.run(a2, s10, '2026-02-10', 78, 'graded', 'Solid work. Consider edge cases.');
insertSubmission.run(a2, s13, '2026-02-09', 88, 'graded', 'Well-structured. Good error handling.');
insertSubmission.run(a2, s17, '2026-02-10', 85, 'graded', 'Impressive for your level!');
insertSubmission.run(a2, s18, null, null, 'missing', null);

insertSubmission.run(a3, s1, '2026-03-02', 140, 'graded', 'Exceeds expectations. File I/O implementation is clean.');
insertSubmission.run(a3, s6, '2026-03-04', 95, 'graded', 'Late but functional. Dict usage needs work.');
insertSubmission.run(a3, s8, null, null, 'missing', null);
insertSubmission.run(a3, s10, '2026-03-03', 115, 'graded', 'Good project. Search feature works well.');
insertSubmission.run(a3, s13, '2026-03-02', 130, 'graded', 'Great architecture. OOP concepts applied early.');
insertSubmission.run(a3, s17, '2026-03-03', 125, 'graded', 'Strong project for a first-semester student.');
insertSubmission.run(a3, s18, null, null, 'missing', null);

insertSubmission.run(a4, s1, '2026-03-10', 185, 'graded', 'A-range. Solid across all sections.');
insertSubmission.run(a4, s6, '2026-03-10', 130, 'graded', 'Coding section strong. Theory needs review.');
insertSubmission.run(a4, s8, '2026-03-10', 98, 'graded', 'Below passing. Schedule advising meeting.');
insertSubmission.run(a4, s10, '2026-03-10', 155, 'graded', 'Good performance. Functions section strongest.');
insertSubmission.run(a4, s13, '2026-03-10', 172, 'graded', 'Excellent. Near-perfect on coding problems.');
insertSubmission.run(a4, s17, '2026-03-10', 168, 'graded', 'Outstanding midterm performance.');
insertSubmission.run(a4, s18, '2026-03-10', 76, 'graded', 'Failing. Academic probation review triggered.');

// CS201 submissions
insertSubmission.run(a6, s1, '2026-02-02', 90, 'graded', 'Clean implementation. Good use of generics.');
insertSubmission.run(a6, s2, '2026-02-01', 98, 'graded', 'Perfect implementation with edge case handling.');
insertSubmission.run(a6, s13, '2026-02-03', 75, 'graded', 'LinkedList works but memory management needs work.');
insertSubmission.run(a6, s16, '2026-02-03', 72, 'graded', 'Functional but missing error handling.');

insertSubmission.run(a7, s1, '2026-02-16', 72, 'graded', 'BFS/DFS correct. BST balance check incomplete.');
insertSubmission.run(a7, s2, '2026-02-16', 78, 'graded', 'All correct. Elegant recursive solutions.');
insertSubmission.run(a7, s13, '2026-02-17', 58, 'graded', 'DFS correct but BFS has a bug. Review queue usage.');
insertSubmission.run(a7, s16, '2026-02-18', 52, 'graded', 'Late. BST operations incomplete.');

insertSubmission.run(a8, s1, '2026-03-06', 130, 'graded', 'Great visualizer. A* heuristic well-chosen.');
insertSubmission.run(a8, s2, '2026-03-05', 148, 'graded', 'Exceptional. Added bidirectional search as bonus.');
insertSubmission.run(a8, s13, '2026-03-07', 108, 'graded', 'Dijkstra works. A* has edge case bug.');
insertSubmission.run(a8, s16, '2026-03-08', 100, 'graded', 'Late. Dijkstra only — no A* implementation.');

// DS301 submissions
insertSubmission.run(a10, s2, '2026-01-30', 95, 'graded', 'Excellent feature engineering and model evaluation.');
insertSubmission.run(a10, s3, '2026-01-31', 82, 'graded', 'Good analysis. Consider feature scaling next time.');
insertSubmission.run(a10, s7, '2026-01-30', 88, 'graded', 'Strong residual analysis. Nice visualizations.');
insertSubmission.run(a10, s12, '2026-02-02', 60, 'graded', 'Late. Model works but no cross-validation.');
insertSubmission.run(a10, s15, '2026-01-31', 78, 'graded', 'Solid baseline. Try regularization for improvement.');

insertSubmission.run(a11, s2, '2026-02-20', 145, 'graded', 'Outstanding comparison. Publication-quality write-up.');
insertSubmission.run(a11, s3, '2026-02-21', 122, 'graded', 'Good classifier choices. Feature importance analysis excellent.');
insertSubmission.run(a11, s7, '2026-02-20', 130, 'graded', 'Strong methodology. Cross-validation well-implemented.');
insertSubmission.run(a11, s12, '2026-02-23', 85, 'graded', 'Late. Only 2 classifiers compared. Needs more depth.');
insertSubmission.run(a11, s15, '2026-02-21', 118, 'graded', 'Good work. Consider ensemble methods.');

// BUS210 submissions
insertSubmission.run(a13, s4, '2026-02-07', 82, 'graded', 'Good metrics calculation. Attribution analysis could be deeper.');
insertSubmission.run(a13, s9, '2026-02-06', 95, 'graded', 'Excellent. Real-world examples strengthen the analysis.');
insertSubmission.run(a13, s14, '2026-02-09', 55, 'graded', 'Late. CPA calculation incorrect. Review formula.');
insertSubmission.run(a13, s19, '2026-02-07', 92, 'graded', 'Strong analytical thinking. Well-formatted report.');

insertSubmission.run(a14, s4, '2026-03-06', 120, 'graded', 'Good test design. Sample size calculation accurate.');
insertSubmission.run(a14, s9, '2026-03-05', 140, 'graded', 'Excellent. Statistical rigor and practical insights.');
insertSubmission.run(a14, s14, null, null, 'missing', null);
insertSubmission.run(a14, s19, '2026-03-06', 138, 'graded', 'Strong methodology. Great presentation.');

// DES150 submissions
insertSubmission.run(a16, s5, '2026-02-04', 92, 'graded', 'Thorough interviews. Personas well-developed.');
insertSubmission.run(a16, s11, '2026-02-04', 98, 'graded', 'Exceptional empathy mapping. Best in class.');
insertSubmission.run(a16, s17, '2026-02-05', 80, 'graded', 'Good start. Push deeper in follow-up questions.');
insertSubmission.run(a16, s3, '2026-02-06', 72, 'graded', 'Late. Personas need more detail.');

insertSubmission.run(a17, s5, '2026-02-27', 138, 'graded', 'Beautiful prototype. Micro-interactions are a nice touch.');
insertSubmission.run(a17, s11, '2026-02-27', 145, 'graded', 'Outstanding. Design system thinking already showing.');
insertSubmission.run(a17, s17, '2026-02-28', 115, 'graded', 'Good flow. Needs more attention to typography.');
insertSubmission.run(a17, s3, '2026-02-28', 105, 'graded', 'Functional but visual hierarchy needs work.');

// CS310 submissions
insertSubmission.run(a19, s2, '2026-02-02', 98, 'graded', 'Clean API design. Good error handling and validation.');
insertSubmission.run(a19, s16, '2026-02-04', 78, 'graded', 'Works but missing input validation on 2 endpoints.');
insertSubmission.run(a19, s1, '2026-02-03', 88, 'graded', 'Good structure. Consider adding rate limiting.');

insertSubmission.run(a20, s2, '2026-02-23', 148, 'graded', 'Production-quality frontend. Excellent state management.');
insertSubmission.run(a20, s16, '2026-02-25', 105, 'graded', 'Late. UI works but auth flow has edge case bugs.');
insertSubmission.run(a20, s1, '2026-02-24', 128, 'graded', 'Strong React skills. Component architecture is clean.');

// DS101 submissions
insertSubmission.run(a22, s3, '2026-01-30', 45, 'graded', 'Strong probability fundamentals.');
insertSubmission.run(a22, s15, '2026-01-29', 48, 'graded', 'Near perfect. Great understanding of distributions.');
insertSubmission.run(a22, s20, '2026-01-30', 40, 'graded', 'Good. Review Poisson distribution.');
insertSubmission.run(a22, s12, '2026-01-31', 30, 'graded', 'Late. Gaps in conditional probability.');

insertSubmission.run(a23, s3, '2026-02-19', 90, 'graded', 'Excellent hypothesis testing methodology.');
insertSubmission.run(a23, s15, '2026-02-20', 95, 'graded', 'Outstanding. P-value interpretation is textbook-perfect.');
insertSubmission.run(a23, s20, '2026-02-20', 78, 'graded', 'Good work. Chi-square section needs review.');
insertSubmission.run(a23, s12, '2026-02-22', 58, 'graded', 'Late. T-test execution correct but interpretation weak.');

// BUS310 submissions
insertSubmission.run(a25, s9, '2026-02-02', 92, 'graded', 'Clear user stories. Strong problem framing.');
insertSubmission.run(a25, s4, '2026-02-03', 78, 'graded', 'Good brief. User stories need more acceptance criteria.');
insertSubmission.run(a25, s19, '2026-02-02', 95, 'graded', 'Exceptional. Market context well-researched.');
insertSubmission.run(a25, s14, '2026-02-05', 60, 'graded', 'Late. Brief is thin. Needs stakeholder analysis.');

insertSubmission.run(a26, s9, '2026-03-02', 135, 'graded', 'Well-structured roadmap. RICE scores well-justified.');
insertSubmission.run(a26, s4, '2026-03-03', 110, 'graded', 'Good prioritization. Timeline feels aggressive.');
insertSubmission.run(a26, s19, '2026-03-02', 140, 'graded', 'Best roadmap in class. Clear trade-off documentation.');
insertSubmission.run(a26, s14, '2026-03-05', 82, 'graded', 'Late again. RICE scoring incomplete for 3 features.');

// Count and log
const instructorCount = (db.prepare('SELECT COUNT(*) as c FROM instructors').get() as any).c;
const courseCount = (db.prepare('SELECT COUNT(*) as c FROM courses').get() as any).c;
const studentCount = (db.prepare('SELECT COUNT(*) as c FROM students').get() as any).c;
const enrollmentCount = (db.prepare('SELECT COUNT(*) as c FROM enrollments').get() as any).c;
const assignmentCount = (db.prepare('SELECT COUNT(*) as c FROM assignments').get() as any).c;
const submissionCount = (db.prepare('SELECT COUNT(*) as c FROM submissions').get() as any).c;

console.log(`Seeded: ${instructorCount} instructors, ${courseCount} courses, ${studentCount} students, ${enrollmentCount} enrollments, ${assignmentCount} assignments, ${submissionCount} submissions`);
