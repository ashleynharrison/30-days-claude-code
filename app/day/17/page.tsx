import { GraduationCap, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'student_lookup', description: 'Search students by name, major, year, or status. Returns academic info, GPA, current enrollments, and performance summary.' },
  { name: 'course_roster', description: 'View course details and enrolled students with grades, attendance, and last activity. Filter by course code, department, or instructor.' },
  { name: 'grade_book', description: 'View assignment grades and submissions for a course or student. Shows scores, missing work, and grade trends.' },
  { name: 'at_risk_students', description: 'Identify students falling behind — low grades, poor attendance, missing assignments, or inactivity. Configurable thresholds.' },
  { name: 'assignment_tracker', description: 'View assignments by course with due dates, submission rates, average scores, and upcoming deadlines.' },
  { name: 'course_analytics', description: 'Department and course-level analytics — enrollment trends, grade distributions, attendance patterns, and instructor workload.' },
];

const exampleQueries = [
  'Which students are falling behind in the Python course?',
  'Show me all missing assignments across CS101',
  'What\u2019s the grade distribution for Machine Learning Fundamentals?',
  'Which courses have the lowest average attendance?',
  'Show me Emma Rodriguez\u2019s grades across all her courses',
  'What assignments are due this week?',
];

export default function Day17Page() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-cream/90 backdrop-blur-md border-b border-sand/50 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-clay tracking-wider hover:text-terracotta transition-colors">
            30 DAYS OF CLAUDE CODE
          </Link>
          <div className="flex items-center gap-4">
            <a href="https://tellavsn.com" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal hover:text-terracotta transition-colors">
              tellavsn.com
            </a>
            <a href="https://github.com/ashleynharrison/30-days-claude-code" target="_blank" rel="noopener noreferrer" className="text-charcoal hover:text-terracotta transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-clay hover:text-terracotta transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to all days
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 17 &mdash; Education</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Education Course & Student Manager</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Track courses, students, grades, assignments, and the question every instructor actually cares about &mdash; who&apos;s falling behind?
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that gives instructors and administrators instant answers about their courses. Grade distributions,
            missing assignments, at-risk students, attendance trends. Ask a question, get the answer.
          </p>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Example Queries</p>
          <div className="grid gap-3">
            {exampleQueries.map((query) => (
              <div key={query} className="p-4 bg-linen border border-sand rounded-lg font-mono text-sm text-charcoal">
                &ldquo;{query}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Tools</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 MCP Tools</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sand">
                  <th className="pb-3 font-mono text-xs text-clay tracking-wider uppercase">Tool</th>
                  <th className="pb-3 font-mono text-xs text-clay tracking-wider uppercase">What It Does</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.name} className="border-b border-sand/50">
                    <td className="py-3 pr-6 font-mono text-sm text-terracotta whitespace-nowrap">{tool.name}</td>
                    <td className="py-3 text-sm text-charcoal">{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Course Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Courses</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">8 Courses Across 4 Departments</h2>
          <div className="grid gap-4">
            {[
              { code: 'CS101', title: 'Introduction to Python', dept: 'Computer Science', level: 'Beginner', enrolled: 7, max: 30, avg: 72 },
              { code: 'CS201', title: 'Data Structures & Algorithms', dept: 'Computer Science', level: 'Intermediate', enrolled: 4, max: 25, avg: 83 },
              { code: 'DS301', title: 'Machine Learning Fundamentals', dept: 'Data Science', level: 'Advanced', enrolled: 5, max: 20, avg: 81 },
              { code: 'CS310', title: 'Full-Stack Web Development', dept: 'Computer Science', level: 'Advanced', enrolled: 3, max: 20, avg: 86 },
              { code: 'DES150', title: 'UI/UX Design Principles', dept: 'Design', level: 'Beginner', enrolled: 4, max: 25, avg: 87 },
              { code: 'BUS310', title: 'Product Management', dept: 'Business', level: 'Advanced', enrolled: 4, max: 25, avg: 79 },
            ].map((course) => (
              <div key={course.code} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{course.code} &mdash; {course.title}</h3>
                    <p className="text-sm text-clay">{course.dept}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                    course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {course.level}
                  </span>
                </div>
                <div className="flex items-center gap-6 mb-3">
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{course.enrolled}</span>
                    <span className="text-xs text-clay ml-1">of {course.max}</span>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-terracotta">{course.avg}%</span>
                    <span className="text-xs text-clay ml-1">avg grade</span>
                  </div>
                </div>
                <div className="w-full bg-sand/50 rounded-full h-2">
                  <div className={`h-2 rounded-full ${course.avg >= 80 ? 'bg-green-500' : course.avg >= 70 ? 'bg-terracotta' : 'bg-red-400'}`}
                    style={{ width: `${course.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Course Management?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every instructor knows there are students falling behind. The data is in the LMS &mdash; low quiz scores,
              missed assignments, declining attendance. But finding the patterns takes time nobody has. By week 8,
              the intervention window has already closed.
            </p>
            <p>
              The typical workflow: export a CSV, sort by grade, cross-reference with attendance, check the assignment
              log, then send an email. Multiply that by four sections and it&apos;s an afternoon gone. The students who
              needed help two weeks ago are now a retention statistic.
            </p>
            <p className="font-medium text-ink">
              This server makes academic data conversational. Ask who&apos;s falling behind, check grade distributions,
              see which assignments have the highest missing rates, and get it all in seconds. Twenty students, eight
              courses, five instructors, and the kind of realistic data that makes the tool immediately useful for
              anyone running a course.
            </p>
          </div>
        </div>
      </section>

      {/* Data Overview */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Data</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What&apos;s Inside</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Students', value: '20' },
              { label: 'Courses', value: '8' },
              { label: 'Assignments', value: '27' },
              { label: 'Submissions', value: '90+' },
              { label: 'Instructors', value: '5' },
              { label: 'Enrollments', value: '35' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            20 students spanning freshmen to seniors across Computer Science, Data Science, Business, and Design.
            Eight courses from Intro Python to Full-Stack Web Dev and Machine Learning. Realistic grade spreads including
            A-students, struggling students on academic probation, and everything in between. Missing assignments, late
            submissions, and detailed instructor feedback.
          </p>
        </div>
      </section>

      {/* Setup */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Setup</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Try It Locally</h2>
          <div className="bg-ink rounded-lg p-6 overflow-x-auto">
            <pre className="font-mono text-sm text-cream leading-relaxed">
              <code>{`cd day17-education
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need a smarter way to manage your courses?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your instructors are still exporting CSVs to find who&apos;s falling behind, let&apos;s talk about what&apos;s possible.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:ashley@tellavsn.com" className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors">
              <Mail className="w-4 h-4" />
              ashley@tellavsn.com
            </a>
            <a href="https://tellavsn.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-sand text-charcoal rounded-lg font-medium hover:border-terracotta hover:text-terracotta transition-colors">
              tellavsn.com
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-charcoal font-medium">Tell a Vsn</p>
            <p className="text-xs text-clay">Talk to your business.</p>
          </div>
          <p className="text-xs text-clay">Day 17 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
