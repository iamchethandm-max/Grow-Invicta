import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, CheckSquare, 
  MessageSquare, Paperclip, Clipboard, Play, 
  AlertCircle, X, ArrowLeft, ArrowRight, MoreHorizontal, Maximize2, Tag,
  Clock, Eye
} from 'lucide-react';
import { Project, UserRole } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { formatIndianDate } from '../utils/dateUtils';

// Helpers to match visual aesthetics from screenshot
const getPillColor = (proj: Project) => {
  const colors = [
    'bg-[#2563eb]', // Royal Blue
    'bg-[#db2777]', // Hot Pink / Magenta
    'bg-[#06b6d4]', // Bright Cyan
    'bg-[#e11d48]', // Rose / Pinkish Red
    'bg-[#f59e0b]', // Golden Amber
    'bg-[#10b981]', // Emerald Green
  ];
  let hash = 0;
  const str = proj.clientName + proj.name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const formatDate = (dateStr: string) => {
  return formatIndianDate(dateStr);
};

const getInitials = (proj: Project) => {
  if (proj.teamMembers && proj.teamMembers.length > 0) {
    const firstTeamMember = proj.teamMembers[0];
    const parts = firstTeamMember.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0]) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }
  return 'CN'; // Fallback signature initials as seen in screenshot
};


interface ProjectsKanbanProps {
  projects: Project[];
  currentUserRole: UserRole;
  currentUsername: string;
  onAddProject: (newProj: Project) => void;
  onEditProject: (updatedProj: Project) => void;
  onDeleteProject: (id: string) => void;
  theme?: 'dark' | 'light';
}

export default function ProjectsKanban({ 
  projects, 
  currentUserRole, 
  currentUsername, 
  onAddProject, 
  onEditProject, 
  onDeleteProject,
  theme = 'dark'
}: ProjectsKanbanProps) {
  const isLight = theme === 'light';

  // 1. Dynamic Columns (Trello Lists) loaded/saved to localStorage
  const [columns, setColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('growinvicta_kanban_cols');
    return saved ? JSON.parse(saved) : ['Not Started', 'In Progress', 'On Hold', 'Completed'];
  });

  useEffect(() => {
    localStorage.setItem('growinvicta_kanban_cols', JSON.stringify(columns));
  }, [columns]);

  // View States
  const [activeBoardView, setActiveBoardView] = useState<'Kanban' | 'Timeline' | 'Grid'>('Kanban');
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  // Dynamic Column actions
  const [newColName, setNewColName] = useState('');
  const [editingColIdx, setEditingColIdx] = useState<number | null>(null);
  const [editingColName, setEditingColName] = useState('');

  // Inline rapid card creater states
  const [activeQuickAddCol, setActiveQuickAddCol] = useState<string | null>(null);
  const [quickCardName, setQuickCardName] = useState('');

  // Full detailed modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Standard Form states
  const [formName, setFormName] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formType, setFormType] = useState<Project['type']>('Website Development');
  const [formBudget, setFormBudget] = useState<number>(350000);
  const [formStart, setFormStart] = useState('2026-06-19');
  const [formEnd, setFormEnd] = useState('2026-08-30');
  const [formPriority, setFormPriority] = useState<Project['priority']>('Medium');
  const [formStatus, setFormStatus] = useState<string>('Not Started');
  const [formTeam, setFormTeam] = useState('Siddharth Roy, Nisha Sen');

  // Interactive comments & checklists
  const [commentInput, setCommentInput] = useState('');
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('2026-07-20');

  // Interactive label tags state
  const [availableTags] = useState(['Front-end', 'Database', 'API Integration', 'UI Redesign', 'Marketing SEO', 'Shopify Store']);
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('growinvicta_kanban_tags');
    return saved ? JSON.parse(saved) : {
      'p1': ['Front-end', 'UI Redesign'],
      'p2': ['API Integration', 'Database'],
      'p4': ['Shopify Store']
    };
  });

  useEffect(() => {
    localStorage.setItem('growinvicta_kanban_tags', JSON.stringify(selectedTags));
  }, [selectedTags]);

  const projectTypes: Project['type'][] = [
    'Website Development', 'Shopify Store', 'SEO', 'Social Media Management', 'Google Ads', 'Branding', 'Graphic Design'
  ];

  // Align selected project if the projects list changes
  useEffect(() => {
    if (selectedProject) {
      const refreshed = projects.find(p => p.id === selectedProject.id);
      if (refreshed) {
        setSelectedProject(refreshed);
      }
    }
  }, [projects]);

  // Adding Custom list
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    if (columns.includes(newColName.trim())) {
      alert("Oops! A Kanban list with this title already exists.");
      return;
    }
    setColumns([...columns, newColName.trim()]);
    setNewColName('');
  };

  // Renaming custom list
  const handleRenameColumn = (index: number) => {
    if (!editingColName.trim()) return;
    const oldName = columns[index];
    const newName = editingColName.trim();

    // 1. Update columns array
    const updated = [...columns];
    updated[index] = newName;
    setColumns(updated);

    // 2. Map all existing projects associated with the old column name to the new name!
    projects.forEach(p => {
      if (p.status === oldName) {
        onEditProject({ ...p, status: newName as any });
      }
    });

    setEditingColIdx(null);
    setEditingColName('');
  };

  // Deleting custom list
  const handleDeleteColumn = (colName: string) => {
    // Re-assign cards to first column
    const defaultDest = columns.find(c => c !== colName) || 'Not Started';
    projects.forEach(p => {
      if (p.status === colName) {
        onEditProject({ ...p, status: defaultDest as any });
      }
    });
    setColumns(columns.filter(c => c !== colName));
  };

  // Rapid Inline Card Creation
  const handleQuickAddCard = (colName: string) => {
    if (!quickCardName.trim()) return;

    const newCard: Project = {
      id: `p_${Date.now()}`,
      name: quickCardName.trim(),
      clientName: 'Walk-in Client',
      type: 'Website Development',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days later
      budget: 150000,
      teamMembers: [currentUsername],
      priority: 'Medium',
      status: colName as any,
      progress: 0,
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Define brief specifications', dueDate: new Date().toISOString().split('T')[0], completed: false }
      ],
      comments: [
        { id: `c_${Date.now()}_1`, author: currentUsername, role: currentUserRole, text: 'Card created via inline workspace tracker.', timestamp: 'Just now' }
      ]
    };

    onAddProject(newCard);
    setSelectedProject(newCard);
    setQuickCardName('');
    setActiveQuickAddCol(null);
  };

  // Move Card cleanly
  const handleShiftCard = (p: Project, direction: 'left' | 'right' | string) => {
    const currentIdx = columns.indexOf(p.status);
    let targetStatus = '';

    if (direction === 'left' && currentIdx > 0) {
      targetStatus = columns[currentIdx - 1];
    } else if (direction === 'right' && currentIdx < columns.length - 1) {
      targetStatus = columns[currentIdx + 1];
    } else if (columns.includes(direction)) {
      targetStatus = direction;
    } else {
      return; // Invalid move
    }

    const updated = {
      ...p,
      status: targetStatus as any,
      progress: targetStatus === 'Completed' ? 100 : p.progress
    };

    onEditProject(updated);
    if (selectedProject?.id === p.id) {
      setSelectedProject(updated);
    }
  };

  // Card Drag and Drop handler
  const handleCardDrop = (projId: string, targetCol: string) => {
    const proj = projects.find(p => p.id === projId);
    if (proj && proj.status !== targetCol) {
      const updated = {
        ...proj,
        status: targetCol as any,
        progress: targetCol === 'Completed' ? 100 : proj.progress
      };
      onEditProject(updated);
      if (selectedProject?.id === proj.id) {
        setSelectedProject(updated);
      }
    }
  };

  // Form management
  const handleOpenAdd = () => {
    setFormName('');
    setFormClient('');
    setFormType('Website Development');
    setFormBudget(400000);
    setFormStart(new Date().toISOString().split('T')[0]);
    setFormEnd('2026-09-01');
    setFormPriority('Medium');
    setFormStatus(columns[0] || 'Not Started');
    setFormTeam('Siddharth Roy, Nisha Sen');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setFormName(p.name);
    setFormClient(p.clientName);
    setFormType(p.type);
    setFormBudget(p.budget);
    setFormStart(p.startDate);
    setFormEnd(p.endDate);
    setFormPriority(p.priority);
    setFormStatus(p.status);
    setFormTeam(p.teamMembers.join(', '));
    setIsEditOpen(true);
  };

  const submitProjectAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formClient) return;

    const newProj: Project = {
      id: `p_${Date.now()}`,
      name: formName,
      clientName: formClient,
      type: formType,
      startDate: formStart,
      endDate: formEnd,
      budget: Number(formBudget),
      teamMembers: formTeam.split(',').map(n => n.trim()).filter(Boolean),
      priority: formPriority,
      status: formStatus as any,
      progress: formStatus === 'Completed' ? 100 : 0,
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Kickoff and discovery lock', dueDate: formStart, completed: false }
      ],
      comments: [
        { id: `c_${Date.now()}_1`, author: currentUsername, role: currentUserRole, text: 'Project card bootstrapped.', timestamp: 'Just now' }
      ]
    };

    onAddProject(newProj);
    setSelectedProject(newProj);
    setIsAddOpen(false);
  };

  const submitProjectEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const updated = {
      ...selectedProject,
      name: formName,
      clientName: formClient,
      type: formType,
      budget: Number(formBudget),
      startDate: formStart,
      endDate: formEnd,
      priority: formPriority,
      status: formStatus as any,
      teamMembers: formTeam.split(',').map(n => n.trim()).filter(Boolean),
      progress: formStatus === 'Completed' ? 100 : selectedProject.progress
    };

    onEditProject(updated);
    setSelectedProject(updated);
    setIsEditOpen(false);
  };

  // Toggle checklist item
  const handleToggleMilestone = (milestoneId: string) => {
    if (!selectedProject) return;
    const currentMilestones = selectedProject.milestones.map(m => {
      if (m.id === milestoneId) return { ...m, completed: !m.completed };
      return m;
    });

    const completedCount = currentMilestones.filter(m => m.completed).length;
    const computedProgress = Math.round((completedCount / currentMilestones.length) * 100);

    const updated = {
      ...selectedProject,
      milestones: currentMilestones,
      progress: computedProgress
    };
    onEditProject(updated);
    setSelectedProject(updated);
  };

  // Delete checklist item (Milestone/Task)
  const handleDeleteMilestone = (milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering toggle on click
    if (!selectedProject) return;
    const currentMilestones = selectedProject.milestones.filter(m => m.id !== milestoneId);

    const completedCount = currentMilestones.length > 0 ? currentMilestones.filter(m => m.completed).length : 0;
    const computedProgress = currentMilestones.length > 0 ? Math.round((completedCount / currentMilestones.length) * 100) : 0;

    const updated = {
      ...selectedProject,
      milestones: currentMilestones,
      progress: computedProgress
    };
    onEditProject(updated);
    setSelectedProject(updated);
  };

  // Add checklist item (Milestone)
  const handleAddMilestone = () => {
    if (!selectedProject || !newMilestoneText.trim()) return;
    const newM = {
      id: `ms_${Date.now()}`,
      title: newMilestoneText.trim(),
      dueDate: newMilestoneDate,
      completed: false
    };

    const updatedMilestones = [...selectedProject.milestones, newM];
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const computedProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    const updated = {
      ...selectedProject,
      milestones: updatedMilestones,
      progress: computedProgress
    };
    onEditProject(updated);
    setSelectedProject(updated);
    setNewMilestoneText('');
  };

  // Add Comment
  const handleAddComment = () => {
    if (!selectedProject || !commentInput.trim()) return;
    const commentObj = {
      id: `cmt_${Date.now()}`,
      author: currentUsername,
      role: currentUserRole,
      text: commentInput.trim(),
      timestamp: 'Just now'
    };
    const updated = {
      ...selectedProject,
      comments: [commentObj, ...selectedProject.comments]
    };
    onEditProject(updated);
    setSelectedProject(updated);
    setCommentInput('');
  };

  // Toggle label tags on selected project
  const handleToggleTag = (tag: string) => {
    if (!selectedProject) return;
    const projTags = selectedTags[selectedProject.id] || [];
    const updated = projTags.includes(tag) 
      ? projTags.filter(t => t !== tag) 
      : [...projTags, tag];
    
    setSelectedTags({
      ...selectedTags,
      [selectedProject.id]: updated
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Toolbar Controls */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${
        isLight ? 'bg-white border-gray-200 shadow-xs text-gray-900' : 'bg-slate-900 border-slate-850'
      }`}>
        <div className="flex gap-2">
          {(['Kanban', 'Timeline', 'Grid'] as const).map(style => (
            <button
              key={style}
              onClick={() => setActiveBoardView(style)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                activeBoardView === style 
                  ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' 
                  : isLight ? 'bg-transparent border-transparent text-gray-600 hover:bg-gray-100' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800'
              }`}
            >
              {style} Board
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Quick List form inline */}
          {currentUserRole !== 'Employee' && (
            <form onSubmit={handleAddColumn} className="flex gap-2 items-center flex-1 md:flex-grow-0">
              <input 
                type="text" 
                placeholder="New List structure (e.g. In Review)"
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className={`text-xs pl-3 pr-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-44 ${
                  isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'
                }`}
              />
              <button 
                type="submit"
                className="p-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs cursor-pointer flex-shrink-0"
                title="Add new Trello lane column"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          )}

          {currentUserRole !== 'Employee' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN KANBAN BOARD VIEW */}
      {activeBoardView === 'Kanban' && (
        <div className={`p-6 rounded-2xl border transition-all ${
          isLight 
            ? 'bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/20 border-indigo-100 shadow-sm' 
            : 'bg-gradient-to-br from-[#121320] via-[#24133b] to-[#121320] border-slate-900 shadow-2xl'
        }`}>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 select-none">
            {columns.map((col, index) => {
              const columnProjects = projects.filter(p => p.status === col);
              const isEditing = editingColIdx === index;

              return (
                <div 
                  key={col} 
                  className={`w-72 p-4 rounded-2xl border flex flex-col flex-shrink-0 transition-all ${
                    isLight 
                      ? 'bg-white/80 border-gray-200 shadow-xs' 
                      : 'bg-[#0c0d10]/95 border-slate-900 shadow-lg'
                  }`}
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                >
                  
                  {/* Column header */}
                  <div className="flex justify-between items-center mb-4 pl-1 pr-0.5 flex-shrink-0">
                    <div className="flex-1 min-w-0 pr-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editingColName}
                          onChange={e => setEditingColName(e.target.value)}
                          onBlur={() => handleRenameColumn(index)}
                          onKeyDown={e => e.key === 'Enter' && handleRenameColumn(index)}
                          autoFocus
                          className={`text-xs font-bold leading-normal w-full px-1.5 py-0.5 rounded outline-none ${
                            isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-950 text-white border-slate-800'
                          }`}
                        />
                      ) : (
                        <h3 
                          onClick={() => {
                            if (currentUserRole !== 'Employee') {
                              setEditingColIdx(index);
                              setEditingColName(col);
                            }
                          }}
                          className={`text-[13px] font-semibold tracking-wide font-sans truncate cursor-pointer hover:underline ${
                            isLight ? 'text-slate-800' : 'text-slate-100'
                          }`}
                          title="Click to rename list"
                        >
                          {col}
                        </h3>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[11px] font-sans font-medium ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {columnProjects.length}
                      </span>
                      
                      {/* Three-dots column actions menu */}
                      <div className="relative group/colmenu">
                        <button 
                          className="text-slate-500 hover:text-slate-350 cursor-pointer p-0.5 rounded hover:bg-slate-800/30 transition-colors"
                          title="List Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {currentUserRole !== 'Employee' && (
                          <div className="absolute right-0 top-full mt-1 hidden group-hover/colmenu:block bg-slate-950 border border-slate-850 rounded-lg shadow-xl py-1.5 w-32 z-50 text-left">
                            <button
                              onClick={() => {
                                setEditingColIdx(index);
                                setEditingColName(col);
                              }}
                              className="w-full text-[10.5px] text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-1.5 text-left"
                            >
                              Rename list
                            </button>
                            <button 
                              onClick={() => handleDeleteColumn(col)}
                              className="w-full text-[10.5px] text-rose-450 hover:text-rose-350 hover:bg-rose-950/20 px-3 py-1.5 text-left"
                            >
                              Delete list
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const projId = e.dataTransfer.getData('text/plain');
                      if (projId) handleCardDrop(projId, col);
                    }}
                    className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1"
                  >
                    {columnProjects.map(proj => {
                      const tags = selectedTags[proj.id] || [];
                      const isSelected = selectedProject?.id === proj.id;

                      return (
                        <div
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          draggable="true"
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', proj.id);
                          }}
                          className={`rounded-xl p-3 border transition-all cursor-pointer text-left relative group ${
                            isSelected 
                              ? isLight 
                                ? 'bg-white border-indigo-500 ring-1 ring-indigo-500/30' 
                                : 'bg-[#1e2026] border-indigo-500/80 ring-1 ring-indigo-500/30'
                              : isLight 
                                ? 'bg-white hover:bg-slate-50 border-gray-150 shadow-xs' 
                                : 'bg-[#18191d] hover:bg-[#1f2025] border-slate-900/60 shadow-md'
                          }`}
                        >
                          {/* Top Row: Colored Pill Capsule + hover edit/delete actions */}
                          <div className="flex justify-between items-center mb-2.5">
                            {/* Accent pill capsule */}
                            <div className={`h-1.5 w-9 rounded-full ${getPillColor(proj)}`} />
                            
                            {/* Action icons, showing smoothly on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(proj);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit specs"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {currentUserRole !== 'Employee' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectToDelete({ id: proj.id, name: proj.name });
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                                  title="Archive Card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Task Card Title */}
                          <h4 className={`text-[13px] font-medium leading-snug font-sans tracking-wide ${
                            isLight ? 'text-slate-800' : 'text-slate-100'
                          }`}>
                            {proj.name}
                          </h4>

                          {/* Sub-label/Client Name */}
                          <p className={`text-[11px] mt-0.5 font-sans ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {proj.clientName}
                          </p>

                          {/* Render tag pill labels if available */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tags.map((t, i) => (
                                <span 
                                  key={i} 
                                  className="text-[8px] font-sans font-semibold leading-none px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Bottom Row: Date Badge + Checklist Progress + Assignee Avatar */}
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900/40">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Red/Coral Date Badge */}
                              {proj.endDate && (
                                <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-sans font-medium ${
                                  isLight 
                                    ? 'bg-red-50 text-red-600 border border-red-100' 
                                    : 'bg-[#2a1b1b] text-red-300 border border-red-950/40'
                                }`}>
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span>{formatDate(proj.endDate)}</span>
                                </div>
                              )}

                              {/* Checklist Progress Badge */}
                              {proj.milestones && proj.milestones.length > 0 && (
                                <div className={`flex items-center gap-1.5 text-[10px] font-medium font-sans ${
                                  isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}>
                                  <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                                  <span>
                                    {proj.milestones.filter(m => m.completed).length}/{proj.milestones.length}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Assignee initials badge */}
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs select-none ${
                                proj.priority === 'Critical' ? 'bg-rose-600' :
                                proj.priority === 'High' ? 'bg-amber-500' :
                                'bg-indigo-600'
                              }`}
                              title={`Assigned to: ${proj.teamMembers.join(', ')}`}
                            >
                              {getInitials(proj)}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Column Footer: + Add card action exactly like the screenshot */}
                  <div className="mt-3 pt-1 flex-shrink-0">
                    {activeQuickAddCol === col ? (
                      <div className="space-y-2 animate-fadeIn">
                        <input 
                          type="text" 
                          placeholder="Define item title..."
                          value={quickCardName}
                          onChange={e => setQuickCardName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleQuickAddCard(col)}
                          autoFocus
                          className={`w-full text-xs p-2.5 rounded-lg outline-none ${
                            isLight ? 'bg-white border border-gray-300 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'
                          }`}
                        />
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleQuickAddCard(col)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-semibold rounded-lg cursor-pointer"
                          >
                            Add Card
                          </button>
                          <button 
                            onClick={() => { setActiveQuickAddCol(null); setQuickCardName(''); }}
                            className={`px-3 py-1 text-[11px] rounded-lg ${isLight ? 'text-gray-600 hover:bg-gray-200' : 'text-slate-400 hover:bg-slate-850'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setActiveQuickAddCol(col)}
                          className={`text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer text-slate-400 hover:text-slate-200 py-1.5`}
                        >
                          <Plus className="w-4 h-4 text-slate-400" />
                          <span>Add a card</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveQuickAddCol(col)}
                          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
                          title="Quick clipboard item"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2.2 TIMELINE Gantt View */}
      {activeBoardView === 'Timeline' && (
        <div className={`p-6 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold">Trello Scheduler Timeline</h3>
              <p className="text-slate-500 text-xs mt-0.5">Visually track project phases across months based on planned intervals.</p>
            </div>
            <span className="text-xs font-mono text-indigo-505">Quarter 2 (2026)</span>
          </div>

          <div className="space-y-4">
            {projects.map(proj => (
              <div key={proj.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="md:col-span-3 text-xs font-bold">
                  {proj.name}
                  <p className="text-[10px] text-slate-400 font-mono font-normal">{proj.startDate} to {proj.endDate}</p>
                </div>
                <div className={`md:col-span-9 p-2 rounded-xl flex items-center h-10 border ${
                  isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-850'
                }`}>
                  <div className="w-full bg-slate-900 h-4 rounded ml-4 relative">
                    <div 
                      className="h-full rounded text-[8px] font-bold text-slate-100 flex items-center pl-2 font-mono bg-indigo-600/40 text-indigo-300"
                      style={{ 
                        marginLeft: proj.id === 'p1' ? '8%' : proj.id === 'p2' ? '25%' : proj.id === 'p3' ? '30%' : '15%',
                        width: `${Math.max(20, proj.progress)}%` 
                      }}
                    >
                      {proj.status} ({proj.progress}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.3 ARCHIVE GRID View */}
      {activeBoardView === 'Grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProject(p)}
              className={`p-5 border rounded-xl hover:border-indigo-550 transition-all cursor-pointer space-y-3 font-sans ${
                isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span className="uppercase font-bold">{p.type}</span>
                <span className="font-semibold text-indigo-505">INR {p.budget.toLocaleString('en-IN')}</span>
              </div>
              <h4 className="text-xs font-bold font-display">{p.name}</h4>
              <p className="text-slate-400 text-[11px] italic">Staff: {p.teamMembers.join(', ')}</p>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. CARD EDITING WORKSPACE: SUB-ITEMS CHECKLIST, CHANNELS, LABELS PANEL */}
      {selectedProject ? (
        <div className={`p-6 rounded-2xl border grid grid-cols-1 lg:grid-cols-12 gap-6 ${
          isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-indigo-500/10 text-white'
        }`}>
          
          {/* Details & Checklists */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
              <div>
                <span className="text-[10px] text-indigo-500 font-mono uppercase tracking-wider font-bold">{selectedProject.type} specSheet</span>
                <h2 className="text-lg font-bold font-display tracking-tight leading-snug">{selectedProject.name}</h2>
                <p className="text-slate-400 text-xs mt-1">CRM Client Account: <span className="font-semibold text-indigo-400">{selectedProject.clientName}</span></p>
              </div>

              <div className="flex gap-2">
                {currentUserRole !== 'Employee' && (
                  <button
                    onClick={() => handleOpenEdit(selectedProject)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer border ${
                      isLight ? 'bg-gray-100 hover:bg-gray-250 text-gray-700 border-gray-250' : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-800'
                    }`}
                  >
                    Edit specifications
                  </button>
                )}
                {currentUserRole === 'Super Admin' && (
                  <button
                    onClick={() => {
                      if (selectedProject) {
                        setProjectToDelete({ id: selectedProject.id, name: selectedProject.name });
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg hover:bg-rose-900/40 cursor-pointer"
                  >
                    Archive deliverable
                  </button>
                )}
              </div>
            </div>

            {/* In-Card Tags management (Trello-style Labels) */}
            <div className="space-y-2">
              <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-1">Trello Color Labels</span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => {
                  const hasTag = (selectedTags[selectedProject.id] || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
                        hasTag 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold shadow-xs' 
                          : isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-slate-950 border-slate-850 text-slate-450 hover:bg-slate-850'
                      }`}
                    >
                      <Tag className="w-3 h-3 text-indigo-400" />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logistics summary block */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl text-xs font-mono ${
              isLight ? 'bg-gray-50 border border-gray-200' : 'bg-slate-950'
            }`}>
              <div>
                <span className="text-[8.5px] text-slate-500 uppercase block mb-1">Gantt Budget</span>
                <span className="font-bold text-slate-200 font-sans block text-[13px]">₹{selectedProject.budget.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-slate-500 uppercase block mb-1">Target End</span>
                <span className="text-indigo-400 font-semibold">{selectedProject.endDate}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-slate-500 uppercase block mb-1">Staff Allocated</span>
                <span className="text-slate-350 block truncate">{selectedProject.teamMembers.join(', ')}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-slate-500 uppercase block mb-1">State Lane</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedProject.status}</span>
              </div>
            </div>

            {/* Trello Checklist item */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950/20 p-2 rounded-t-xl mb-1">
                <h3 className="text-xs font-bold uppercase text-slate-400 font-mono flex items-center gap-1">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <span>Card Checklist & Deliverables</span>
                </h3>
                <span className="text-xs font-mono text-indigo-400 font-bold">{selectedProject.progress}% Done</span>
              </div>

              <div className="space-y-2">
                {selectedProject.milestones && selectedProject.milestones.map(mile => (
                  <div
                    key={mile.id}
                    onClick={() => handleToggleMilestone(mile.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs hover:border-slate-500 cursor-pointer ${
                      isLight ? 'bg-gray-50 border-gray-200 shadow-sm' : 'bg-slate-950 border-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={mile.completed}
                        onChange={() => {}} // handled by click line
                        className="rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className={`${isLight ? 'text-gray-900 font-medium' : 'text-slate-200'} ${mile.completed ? 'line-through text-slate-500 opacity-60' : ''}`}>
                        {mile.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9.5px] text-slate-500 font-mono">{mile.dueDate}</span>
                      <button
                        onClick={(e) => handleDeleteMilestone(mile.id, e)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-500/15 transition-colors cursor-pointer"
                        title="Delete task milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* checklist adding box */}
              <div className={`p-3 rounded-xl border flex flex-col md:flex-row gap-2 ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-850'
              }`}>
                <input
                  type="text"
                  placeholder="E.g. Code Review setup, API parameters check..."
                  value={newMilestoneText}
                  onChange={(e) => setNewMilestoneText(e.target.value)}
                  className={`flex-1 text-xs px-3 py-1.5 rounded-lg outline-none ${
                    isLight ? 'bg-white border border-gray-300 text-gray-900' : 'bg-slate-900 border border-slate-800 text-white'
                  }`}
                />
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className={`w-full md:w-36 text-xs px-3 py-1.5 rounded-lg font-mono outline-none ${
                    isLight ? 'bg-white border border-gray-300 text-gray-900' : 'bg-slate-900 border border-slate-800 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Create Deliverable
                </button>
              </div>
            </div>

            {/* comments discussions */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 font-mono">Card discussion logs</h3>
              
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {selectedProject.comments && selectedProject.comments.map(cmt => (
                  <div key={cmt.id} className={`p-3 rounded-xl border text-xs ${
                    isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-850'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold">
                        {cmt.author} <strong className="text-[10px] text-slate-500 font-normal">({cmt.role})</strong>
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{cmt.timestamp}</span>
                    </div>
                    <p className={`font-sans leading-normal ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>{cmt.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Share details on card blockages or task completes..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  className={`flex-1 text-xs px-3.5 py-2 rounded-xl outline-none ${
                    isLight ? 'bg-gray-105 border border-gray-300 text-gray-900' : 'bg-slate-950 border border-slate-800 text-slate-205'
                  }`}
                />
                <button 
                  onClick={handleAddComment}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>

          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-4 rounded-xl border space-y-3.5 ${
              isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-855'
            }`}>
              <h3 className="text-xs font-bold uppercase text-indigo-400 font-mono flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Move & Positioning</span>
              </h3>
              
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] text-slate-500 font-mono block">Align with Kanban List:</span>
                <select
                  value={selectedProject.status}
                  onChange={e => handleShiftCard(selectedProject, e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg outline-none ${
                    isLight ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-[9px] text-slate-500 font-mono italic mt-1 leading-normal">
                  Changing list position triggers instantaneous board refresh. Invoices index milestones accordingly.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 text-xs font-mono leading-relaxed ${
              isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-850'
            }`}>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Guidance & Compliance</span>
              <p className="text-slate-400 font-medium font-sans">
                Trello card parameters are persistent locally. Members are alerted automatically of approaching SLA target dates.
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className={`p-8 text-center text-xs font-mono rounded-2xl border border-dashed ${
          isLight ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          Select an active card deliverable card below to manage checklists, members, descriptions or tag lists.
        </div>
      )}

      {/* 4. MODALS FOR FULL SPEC INITIATES */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto font-sans">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Initiate Professional Trello Card</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitProjectAdd} className="p-5 space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Card Deliverable Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    placeholder="E.g. API Gateway integration"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Client CRM Owner Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formClient} 
                    onChange={e => setFormClient(e.target.value)} 
                    placeholder="E.g. GrowInvicta Agency"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Deliverable Category</label>
                  <select 
                    value={formType} 
                    onChange={e => setFormType(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white"
                  >
                    {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Project Budget (INR) *</label>
                  <input 
                    type="number" 
                    required 
                    value={formBudget || ''} 
                    onChange={e => setFormBudget(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Urgency Priority</label>
                  <select 
                    value={formPriority} 
                    onChange={e => setFormPriority(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Target Start Date</label>
                  <input 
                    type="date" 
                    value={formStart} 
                    onChange={e => setFormStart(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-855 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Plan Deadline Date</label>
                  <input 
                    type="date" 
                    value={formEnd} 
                    onChange={e => setFormEnd(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-855 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Active List Column Destination</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white"
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Team Assignments (comma separated lists)</label>
                <input 
                  type="text" 
                  value={formTeam} 
                  onChange={e => setFormTeam(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-semibold"
                >
                  Create Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project specs modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto font-sans">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Edit deliverable parameters</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitProjectEdit} className="p-5 space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Project Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Client CRM Owner</label>
                  <input 
                    type="text" 
                    required 
                    value={formClient} 
                    onChange={e => setFormClient(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Type</label>
                  <select 
                    value={formType} 
                    onChange={e => setFormType(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white"
                  >
                    {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Project Budget (INR)</label>
                  <input 
                    type="number" 
                    required 
                    value={formBudget || ''} 
                    onChange={e => setFormBudget(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Priority</label>
                  <select 
                    value={formPriority} 
                    onChange={e => setFormPriority(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={formStart} 
                    onChange={e => setFormStart(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Deadline Date</label>
                  <input 
                    type="date" 
                    value={formEnd} 
                    onChange={e => setFormEnd(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Kanban List Destination</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white"
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Team Assignments</label>
                <input 
                  type="text" 
                  value={formTeam} 
                  onChange={e => setFormTeam(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-semibold"
                >
                  Save deliverable Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (projectToDelete) {
            onDeleteProject(projectToDelete.id);
            if (selectedProject?.id === projectToDelete.id) {
              const remaining = projects.filter(p => p.id !== projectToDelete.id);
              setSelectedProject(remaining[0] || null);
            }
          }
        }}
        title="Archive Project"
        message="Are you sure you want to archive this project? It will be moved to the Archive Center."
        itemName={projectToDelete?.name}
      />

    </div>
  );
}
