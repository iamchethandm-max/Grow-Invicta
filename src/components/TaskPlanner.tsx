/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Calendar, Clipboard, AlertCircle, CheckCircle, 
  MessageSquare, User, Clock, Bell, Info, X
} from 'lucide-react';
import { Task, Project } from '../types';

interface TaskPlannerProps {
  tasks: Task[];
  projects: Project[];
  currentUsername: string;
  onAddTask: (newTask: Task) => void;
  onEditTask: (updatedTask: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskPlanner({ tasks, projects, currentUsername, onAddTask, onEditTask, onDeleteTask }: TaskPlannerProps) {
  const [activePlannerTab, setActivePlannerTab] = useState<'Daily' | 'Weekly' | 'All_Tasks'>('All_Tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null);

  // Reminders notifications logger simulation
  const [taskReminders, setTaskReminders] = useState<Array<{ id: string; title: string; time: string; snoozed: number }>>([
    { id: 'tr_1', title: 'Audit Google Maps billing quota caps', time: 'Today 14:00', snoozed: 0 },
    { id: 'tr_2', title: 'Export Vector Logos for Packaging', time: 'Tomorrow 10:30', snoozed: 1 }
  ]);

  // Form modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Add Task Forms state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProj, setFormProj] = useState(projects[0]?.name || 'Apex Omnichannel Portal');
  const [formAssigned, setFormAssigned] = useState(currentUsername);
  const [formDate, setFormDate] = useState('2026-06-21');
  const [formPriority, setFormPriority] = useState<Task['priority']>('Medium');
  const [formStatus, setFormStatus] = useState<Task['status']>('Pending');

  // Reminder trigger form
  const [reminderTitleInput, setReminderTitleInput] = useState('');
  const [reminderTimeInput, setReminderTimeInput] = useState('Today 18:00');

  // Weekly Planner column mappings (2026-06-19 is Friday)
  const weekdays = [
    { label: 'Monday 15th', dateStr: '2026-06-15' },
    { label: 'Tuesday 16th', dateStr: '2026-06-16' },
    { label: 'Wednesday 17th', dateStr: '2026-06-17' },
    { label: 'Thursday 18th', dateStr: '2026-06-18' },
    { label: 'Friday 19th (Today)', dateStr: '2026-06-19' },
    { label: 'Saturday 20th', dateStr: '2026-06-20' },
    { label: 'Sunday 21st', dateStr: '2026-06-21' }
  ];

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormDesc('');
    setFormProj(projects[0]?.name || 'Apex Omnichannel Portal');
    setFormAssigned('Siddharth Roy');
    setFormDate('2026-06-19');
    setFormPriority('Medium');
    setFormStatus('Pending');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setFormTitle(t.title);
    setFormDesc(t.description);
    setFormProj(t.project);
    setFormAssigned(t.assignedTo);
    setFormDate(t.dueDate);
    setFormPriority(t.priority);
    setFormStatus(t.status);
    setIsEditOpen(true);
  };

  const submitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const newTaskObj: Task = {
      id: `task_${Date.now()}`,
      title: formTitle,
      description: formDesc,
      assignedTo: formAssigned,
      project: formProj,
      dueDate: formDate,
      priority: formPriority,
      status: formStatus,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddTask(newTaskObj);
    setSelectedTask(newTaskObj);
    setIsAddOpen(false);
  };

  const submitEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const updatedTaskObj: Task = {
      ...selectedTask,
      title: formTitle,
      description: formDesc,
      project: formProj,
      assignedTo: formAssigned,
      dueDate: formDate,
      priority: formPriority,
      status: formStatus
    };

    onEditTask(updatedTaskObj);
    setSelectedTask(updatedTaskObj);
    setIsEditOpen(false);
  };

  // Quick state toggle
  const toggleQuickTaskStatus = (t: Task, status: Task['status']) => {
    const updated = { ...t, status };
    onEditTask(updated);
    if (selectedTask?.id === t.id) {
      setSelectedTask(updated);
    }
  };

  const handleAddReminder = () => {
    if (!reminderTitleInput) return;
    setTaskReminders([
      ...taskReminders,
      { id: `tr_user_${Date.now()}`, title: reminderTitleInput, time: reminderTimeInput, snoozed: 0 }
    ]);
    setReminderTitleInput('');
  };

  const handleSnoozeReminder = (id: string) => {
    setTaskReminders(taskReminders.map(rem => {
      if (rem.id === id) {
        return { ...rem, snoozed: rem.snoozed + 1, time: 'In 15 Minutes' };
      }
      return rem;
    }));
  };

  return (
    <div id="task-planning-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      
      {/* Tab controls header */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          {(['All_Tasks', 'Daily', 'Weekly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActivePlannerTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                activePlannerTab === tab 
                  ? 'bg-slate-950 border-slate-700 text-indigo-400 shadow-xs' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-850'
              }`}
            >
              {tab === 'All_Tasks' ? 'Sprint Backup' : tab === 'Daily' ? 'Today Checklist' : 'Weekly Planner Matrix'}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task Ticket</span>
        </button>
      </div>

      {/* RENDER VIEW 1: MASTER SPRINT VIEW WITH SELECTED DETAILS */}
      {activePlannerTab === 'All_Tasks' && (
        <>
          {/* Main tasks list column */}
          <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col h-[650px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase font-mono">Team Task Queue</h3>
              <span className="text-[10px] font-mono text-slate-500">{tasks.length} active logs</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTask?.id === t.id 
                      ? 'bg-slate-950 border-indigo-500/80 shadow-md' 
                      : 'bg-slate-900/40 border-slate-850 hover:bg-slate-950/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className={`text-xs font-semibold text-slate-100 ${t.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono italic">{t.project}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono leading-none ${
                      t.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      t.priority === 'High' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                    <span className="text-slate-500">Assign: <strong className="text-slate-300 font-normal">{t.assignedTo}</strong></span>
                    <span className="text-slate-400">{t.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Task Details Sheet */}
          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 h-[650px] flex flex-col justify-between">
            {selectedTask ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono uppercase block mb-1">{selectedTask.project}</span>
                      <h2 className="text-md font-bold text-white tracking-tight leading-snug">{selectedTask.title}</h2>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">Due Date: <strong className="text-indigo-400 font-semibold">{selectedTask.dueDate}</strong></p>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(selectedTask)}
                        className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-850 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Archive task ticket for ${selectedTask.title}?`)) {
                            onDeleteTask(selectedTask.id);
                            setSelectedTask(tasks.find(tk => tk.id !== selectedTask.id) || null);
                          }
                        }}
                        className="p-1 px-2 text-xs text-rose-450 bg-rose-950/20 border border-rose-500/20 rounded-lg hover:bg-rose-900/40 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Property tags matrix */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Assigned Engineer</span>
                      <span className="text-slate-200">{selectedTask.assignedTo}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Priority Weight</span>
                      <span className="text-amber-500 font-semibold">{selectedTask.priority}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Current Status</span>
                      <span className="text-indigo-400 font-bold">{selectedTask.status}</span>
                    </div>
                  </div>

                  {/* Task Instructions block */}
                  <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-xl">
                    <span className="text-[9.5px] uppercase font-mono text-slate-500 tracking-wider block mb-1">Execution Brief</span>
                    <p className="text-xs text-slate-300">
                      {selectedTask.description || 'No execution descriptions formulated for task ticket.'}
                    </p>
                  </div>
                </div>

                {/* Workflow step transitions */}
                <div className="pt-4 border-t border-slate-850/80 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Status Transition Gateway</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Toggle live pipeline stages.</p>
                    </div>
                    <div className="flex gap-2.5">
                      {(['Pending', 'In Progress', 'Review', 'Completed'] as Task['status'][]).map(st => (
                        <button
                          key={st}
                          onClick={() => toggleQuickTaskStatus(selectedTask, st)}
                          className={`px-3 py-1 bg-slate-950 border text-xs font-mono rounded-lg hover:border-slate-500 transition-colors cursor-pointer ${
                            selectedTask.status === st 
                              ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-950/20' 
                              : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-slate-500 text-xs font-mono text-center p-8">No tasks loaded in active scope.</p>
            )}
          </div>
        </>
      )}

      {/* RENDER VIEW 2: DAILY CHECKLIST SCRATCHPAD */}
      {activePlannerTab === 'Daily' && (
        <div className="lg:col-span-12 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-830 pb-3">
            <h3 className="text-sm font-semibold text-white">Daily Operational Checklist</h3>
            <p className="text-slate-400 text-xs mt-0.5">Focusing solely on tasks targeting launch on the current schedule block.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {tasks.filter(t => t.dueDate === '2026-06-19' || t.status !== 'Completed').map(tk => (
                <div key={tk.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs hover:border-slate-700">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={tk.status === 'Completed'} 
                      onChange={() => toggleQuickTaskStatus(tk, tk.status === 'Completed' ? 'Pending' : 'Completed')}
                      className="rounded border-slate-805 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className={`text-slate-200 font-medium ${tk.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>{tk.title}</span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tk.project} &bull; Assign: {tk.assignedTo}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-mono text-[9px] rounded font-semibold ${
                    tk.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tk.priority}
                  </span>
                </div>
              ))}
            </div>

            {/* Simulated Notifications and reminders console */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px] font-semibold uppercase">
                  <Bell className="w-4 h-4" />
                  <span>Interactive Reminders</span>
                </div>

                <div className="divide-y divide-slate-900 space-y-2 max-h-40 overflow-y-auto">
                  {taskReminders.map(rem => (
                    <div key={rem.id} className="py-2.5 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-slate-200 block font-sans truncate max-w-[170px]">{rem.title}</span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{rem.time} {rem.snoozed > 0 && `(Snoozed x${rem.snoozed})`}</p>
                      </div>
                      <button
                        onClick={() => handleSnoozeReminder(rem.id)}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      >
                        Snooze
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <input 
                    type="text" 
                    placeholder="New alert summary..." 
                    value={reminderTitleInput}
                    onChange={(e) => setReminderTitleInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-1 rounded text-xs text-white"
                  />
                  <button 
                    onClick={handleAddReminder}
                    className="w-full bg-indigo-600 hover:bg-indigo-755 text-white py-1 rounded text-xs font-semibold cursor-pointer"
                  >
                    Enable Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 3: WEEKLY matrix TRACKINGS */}
      {activePlannerTab === 'Weekly' && (
        <div className="lg:col-span-12 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 h-[550px] overflow-hidden flex flex-col">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">Weekly Execution Calendar Matrix</h3>
            <p className="text-slate-400 text-xs mt-0.5">Map team tasks calendar blocks across day timelines cleanly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 flex-1 overflow-x-auto">
            {weekdays.map(day => {
              const dayTasks = tasks.filter(t => t.dueDate === day.dateStr);
              return (
                <div key={day.dateStr} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col justify-between min-w-[120px]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight block pb-1 border-b border-slate-900">{day.label}</span>
                    <div className="space-y-2 mt-3 overflow-y-auto max-h-72">
                      {dayTasks.map(tk => (
                        <div key={tk.id} className="p-2 bg-slate-900 border border-slate-850 rounded-lg text-[10px]">
                          <span className="font-semibold text-slate-200 block truncate">{tk.title}</span>
                          <span className="text-slate-500 font-mono uppercase text-[8px] mt-0.5 block">{tk.assignedTo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form overlays */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-805 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Create Task Ticket</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAddTask} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Task Title *</label>
                <input 
                  type="text" 
                  required 
                  value={formTitle} 
                  onChange={e => setFormTitle(e.target.value)} 
                  placeholder="Audit quota metrics in production sandbox..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Task Description</label>
                <textarea 
                  value={formDesc} 
                  onChange={e => setFormDesc(e.target.value)} 
                  placeholder="Enter explicit setup instructions, URLs, metrics tracking specs..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Project Sandbox Association</label>
                  <select 
                    value={formProj} 
                    onChange={e => setFormProj(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Assign Engineer</label>
                  <input 
                    type="text" 
                    value={formAssigned} 
                    onChange={e => setFormAssigned(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Target Due Date</label>
                  <input 
                    type="date" 
                    value={formDate} 
                    onChange={e => setFormDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Priority Weight</label>
                  <select 
                    value={formPriority} 
                    onChange={e => setFormPriority(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Status Ticket</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    <option value="Pending">Pending Queue</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">QA Review</option>
                    <option value="Completed">Completed Task</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-medium"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-805 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Edit Task Parameters</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitEditTask} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Task Title</label>
                <input 
                  type="text" 
                  required 
                  value={formTitle} 
                  onChange={e => setFormTitle(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Task Description</label>
                <textarea 
                  value={formDesc} 
                  onChange={e => setFormDesc(e.target.value)} 
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Project Sandbox Association</label>
                  <select 
                    value={formProj} 
                    onChange={e => setFormProj(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Assign Engineer</label>
                  <input 
                    type="text" 
                    value={formAssigned} 
                    onChange={e => setFormAssigned(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Target Due Date</label>
                  <input 
                    type="date" 
                    value={formDate} 
                    onChange={e => setFormDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Priority Weight</label>
                  <select 
                    value={formPriority} 
                    onChange={e => setFormPriority(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Status Ticket</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    <option value="Pending">Pending Queue</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">QA Review</option>
                    <option value="Completed">Completed Task</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
