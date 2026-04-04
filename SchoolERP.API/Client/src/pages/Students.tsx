import { useEffect, useState, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { Search, Plus, Edit2, Trash2, Eye, UserPlus, Users, GraduationCap, ArrowUpDown, CreditCard, FileText, Filter } from 'lucide-react';
import StudentModal from '../components/StudentModal';
import StudentDetailPanel from '../components/StudentDetailPanel';
import { Student } from '../types';
import { toast } from 'react-toastify';
import { masterApi } from '../api/masterApi';

export default function Students({ checkWritePermission }: { checkWritePermission: (key: string) => boolean }) {
  const { students, fetchStudents, loading, error, removeStudent, addStudent, updateStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('student_search') || '');
  const [selectedSession, setSelectedSession] = useState(() => localStorage.getItem('student_session') || '');
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('student_class') || '');
  const [selectedSection, setSelectedSection] = useState(() => localStorage.getItem('student_section') || '');
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalDefaultTab, setModalDefaultTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('student_search', searchTerm);
    localStorage.setItem('student_session', selectedSession);
    localStorage.setItem('student_class', selectedClass);
    localStorage.setItem('student_section', selectedSection);
  }, [searchTerm, selectedSession, selectedClass, selectedSection]);

  // Masters mapping
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch master data for mapping IDs to Names
    masterApi.getAll('academic-years').then(years => {
      setAcademicYearsList(years);
      // Pre-select current session if none selected
      const current = years.find((y: any) => y.isCurrent);
      if (current && !selectedSession) {
        setSelectedSession(current.name);
      }
    }).catch(console.error);

    masterApi.getAll('classes').then(setClassesList).catch(console.error);
    masterApi.getAll('sections').then(setSectionsList).catch(console.error);
  }, []);

  useEffect(() => {
    // Don't fetch until we have academic years to determine the default session
    // otherwise it will double-load (once for "all" then again for "current")
    if (academicYearsList.length === 0) return;

    const filters: any = { pageSize: 1000 };
    if (selectedSession) filters.academicYear = selectedSession;
    if (selectedClass) filters.classId = selectedClass;
    if (selectedSection) filters.sectionId = selectedSection;
    
    fetchStudents(filters);
  }, [fetchStudents, selectedSession, selectedClass, selectedSection, academicYearsList.length]);

  const classMap = useMemo(() => {
    return classesList.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
  }, [classesList]);

  const sectionMap = useMemo(() => {
    return sectionsList.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
  }, [sectionsList]);

  const academicYearMap = useMemo(() => {
    return academicYearsList.reduce((acc, y) => ({ ...acc, [y.id]: y.name }), {} as Record<string, string>);
  }, [academicYearsList]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Quick Stats Calculate
  const stats = useMemo(() => {
    const active = students.filter(s => s.isActive).length;
    return {
      total: students.length,
      active,
      inactive: students.length - active,
      newThisMonth: students.filter(s => {
        const d = new Date(s.admissionDate);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length
    };
  }, [students]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setModalDefaultTab(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student, tab?: string) => {
    setEditingStudent(student);
    setModalDefaultTab(tab);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (studentData: any) => {
    try {
      if (editingStudent && editingStudent.id) {
        const result = await updateStudent(editingStudent.id, studentData);
        if (result) {
          toast.success(`Student "${studentData.firstName}" successfully updated.`);
          if (selectedStudent?.id === editingStudent.id) {
            setSelectedStudent({ ...studentData, id: editingStudent.id });
          }
        }
      } else {
        const result = await addStudent(studentData);
        if (result) {
          toast.success(`New student "${studentData.firstName}" enrolled successfully.`);
        }
      }
    } catch (err) {
      // Errors handled globally by apiClient
    }
  };

  // Helper for generating avatar colors based on initials
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 
      'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const writeAllowed = useMemo(() => checkWritePermission('student_directory'), [checkWritePermission]);

  return (
    <div className={`max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 ${!writeAllowed ? 'is-read-only-view' : ''}`}>
      
      {/* Header & Stats Strip */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" />
            Student Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage enrollments, profiles, and academic records.</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto custom-scrollbar text-sm divide-x divide-slate-100 w-full lg:w-auto">
          <div className="px-5 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Enrolled</p>
              <p className="text-lg font-bold text-slate-700 leading-tight">{stats.total}</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center gap-3 hidden sm:flex">
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Status</p>
              <p className="text-lg font-bold text-slate-700 leading-tight">{stats.active}</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center gap-3 hidden md:flex">
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">New This Month</p>
              <p className="text-lg font-bold text-slate-700 leading-tight">{stats.newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-2xl">
          {/* Quick Filter: Academic Session */}
          <div className="relative w-full sm:w-48 shrink-0">
            <Filter className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium appearance-none"
            >
              <option value="">All Sessions</option>
              {academicYearsList.map(y => (
                <option key={y.id} value={y.name}>{y.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>

          {/* Quick Filter: Class */}
          <div className="relative w-full sm:w-40 shrink-0">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none transition-all font-medium appearance-none"
            >
              <option value="">All Classes</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>

          {/* Quick Filter: Section */}
          <div className="relative w-full sm:w-32 shrink-0">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none transition-all font-medium appearance-none"
            >
              <option value="">All Sections</option>
              {sectionsList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>

          <div className="relative w-full">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, adm no, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {writeAllowed && (
            <button onClick={handleOpenAddModal} className="btn-primary flex-1 sm:flex-none py-2.5 px-5 shadow-sm shadow-primary-500/20">
              <Plus className="h-4 w-4 mr-2" />
              New Student
            </button>
          )}
        </div>
      </div>


      {/* Data Table */}
      <div className="glass-card overflow-hidden max-w-full">
        <div className="overflow-x-auto min-h-[400px] custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 uppercase text-[10px] font-bold tracking-widest text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Adm No.</th>
                <th className="px-6 py-4">Class & Section</th>
                <th className="px-6 py-4">Parent Contact</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-10 w-10 bg-slate-200 rounded-full mb-3"></div>
                      <p className="text-sm font-medium">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-3">
                      <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No students found matching your criteria.</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center cursor-pointer" onClick={() => setSelectedStudent(student)}>
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mr-3 ring-2 ring-white shadow-sm ${getAvatarColor(student.firstName)}`}>
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{student.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {student.admissionNo || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                          {classMap[student.classId] || '—'}
                        </span>
                        <span className="text-slate-400 text-xs">-</span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                          {sectionMap[student.sectionId] || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium">{student.fatherName || student.motherName || student.guardianName || '—'}</p>
                      <p className="text-slate-500 text-xs">{student.fatherMobile || student.motherMobile || student.guardianMobile || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Promoted' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        student.status === 'Detained' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        student.status === 'Completed' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                        student.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {student.status || (student.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {writeAllowed && (
                          <>
                            <button 
                              onClick={() => window.location.href = `/fees/student/${student.id}`}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Collect Fee"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenEditModal(student)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to deactivate ${student.firstName}?`)) {
                                  removeStudent(student.id!);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Strip (Placeholder UI for future) */}
        {!loading && students.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-medium text-slate-500">
            <p>Showing {filteredStudents.length} of {students.length} entries</p>
            <div className="flex gap-1">
              <button disabled className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-300 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 border border-primary-600 rounded-md bg-primary-600 text-white shadow-sm">1</button>
              <button disabled className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-300 cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create/Edit Modal */}
      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        defaultTab={modalDefaultTab}
      />

      {/* Slide-out Detail Panel */}
      <StudentDetailPanel
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        canEdit={writeAllowed}
        onEdit={(s) => {
          setSelectedStudent(null);
          handleOpenEditModal(s);
        }}
        className={selectedStudent?.classId ? classMap[selectedStudent.classId] : ''}
        sectionName={selectedStudent?.sectionId ? sectionMap[selectedStudent.sectionId] : ''}
        academicYearName={selectedStudent?.academicYear ? (academicYearMap[selectedStudent.academicYear] || selectedStudent.academicYear) : ''}
      />

    </div>
  );
}
