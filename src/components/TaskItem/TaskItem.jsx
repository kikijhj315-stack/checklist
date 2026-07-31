import React from 'react';
import { useChecklist } from '../../context/ChecklistContext';
import { Draggable } from '@hello-pangea/dnd';
import { format, isPast, parseISO } from 'date-fns';
import { GripVertical, Calendar, CheckCircle2, Circle, Paperclip, User, Trash2 } from 'lucide-react';
import './TaskItem.css';

const TaskItem = ({ task, index }) => {
  const { toggleAssigneeCheck, markTaskCompleted, currentUser, users, deleteTask } = useChecklist();
  const isAdmin = currentUser.role === 'admin';
  const canDelete = isAdmin || currentUser.id === task.publisherId;

  const completedAssignees = task.assignees.filter(a => a.checked);
  const pendingAssignees = task.assignees.filter(a => !a.checked);

  const completedAssigneesCount = completedAssignees.length;
  const totalAssigneesCount = task.assignees.length;
  const progressPercent = totalAssigneesCount === 0 ? 0 : Math.round((completedAssigneesCount / totalAssigneesCount) * 100);

  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'Completed';

  const handleToggleAssignee = (userId) => {
    // Permission check: only admin or the specific assignee can check their own box
    if (isAdmin || currentUser.id === userId) {
      toggleAssigneeCheck(task.id, userId);
    } else {
      alert("You only have permission to check your own assignments.");
    }
  };

  const handleToggleAll = () => {
    if (isAdmin) {
      markTaskCompleted(task.id, task.status !== 'Completed');
    } else {
      alert("Only an admin can force complete/reopen a task.");
    }
  };

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={!isAdmin}>
      {(provided, snapshot) => (
        <div
          className={`task-item ${snapshot.isDragging ? 'dragging' : ''} ${task.status === 'Completed' ? 'completed' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="task-drag-handle" {...provided.dragHandleProps} style={{ cursor: isAdmin ? 'grab' : 'not-allowed' }}>
            <GripVertical size={18} color="var(--text-muted)" />
          </div>

          <div className="task-content">
            <div className="task-main">
              <button className="task-complete-btn" onClick={handleToggleAll} disabled={!isAdmin}>
                {task.status === 'Completed' ? (
                  <CheckCircle2 size={22} className="text-completed" />
                ) : (
                  <Circle size={22} className="text-muted" />
                )}
              </button>
              
              <div className="task-details">
                <div className="task-title-row">
                  <h3 className={`task-title ${task.status === 'Completed' ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  {canDelete && (
                    <button className="task-delete-btn" onClick={() => deleteTask(task.id)} title="업무 삭제">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  <span className="meta-item">
                    <span className="meta-label">Created:</span>
                    {format(parseISO(task.createdAt), 'MMM d, yyyy')}
                  </span>
                  
                  {task.publisherId && (
                    <span className="meta-item">
                      <User size={12} />
                      <span className="meta-label">By:</span>
                      {users.find(u => u.id === task.publisherId)?.name || 'Unknown'}
                    </span>
                  )}

                  {task.attachment && (
                    <a 
                      href={task.attachment.dataURL} 
                      download={task.attachment.name}
                      className="meta-item attachment-badge" 
                      title={`${task.attachment.name} (클릭하여 다운로드)`}
                    >
                      <Paperclip size={12} />
                      {task.attachment.name.length > 15 ? task.attachment.name.substring(0, 15) + '...' : task.attachment.name}
                    </a>
                  )}
                  
                  {task.dueDate && (
                    <span className={`meta-item ${isOverdue ? 'overdue' : ''}`}>
                      <Calendar size={12} />
                      <span className="meta-label">Due:</span>
                      {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}

                  {task.completedAt && (
                    <span className="meta-item completed-date">
                      <CheckCircle2 size={12} />
                      <span className="meta-label">Done:</span>
                      {format(parseISO(task.completedAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="task-assignees-section">
              <div className="progress-container">
                <div className="progress-text">{progressPercent}%</div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? 'var(--status-completed)' : 'var(--accent-primary)' }}
                  />
                </div>
              </div>

              <div className="assignees-status-list">
                {totalAssigneesCount > 0 && (
                  <>
                    <div className="status-row">
                      <span className="status-label completed">완료:</span>
                      <span className="status-names">
                        {completedAssignees.length > 0 
                          ? completedAssignees.map(a => users.find(u => u.id === a.userId)?.name).join(', ') 
                          : '-'}
                      </span>
                    </div>
                    <div className="status-row">
                      <span className="status-label pending">미완료:</span>
                      <span className="status-names">
                        {pendingAssignees.length > 0 
                          ? pendingAssignees.map(a => users.find(u => u.id === a.userId)?.name).join(', ') 
                          : '-'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="assignees-list">
                {task.assignees.map(assignee => {
                  const userDetails = users.find(u => u.id === assignee.userId);
                  if (!userDetails) return null;
                  
                  const initials = userDetails.name.substring(0, 2); // Taking first 2 characters for Korean names typically
                  const canCheck = isAdmin || currentUser.id === assignee.userId;
                  
                  return (
                    <div 
                      key={assignee.userId} 
                      className={`assignee-avatar ${assignee.checked ? 'checked' : ''} ${!canCheck ? 'disabled' : ''}`}
                      onClick={() => handleToggleAssignee(assignee.userId)}
                      title={`${userDetails.name} - ${assignee.checked ? 'Checked' : 'Pending'}`}
                    >
                      {initials}
                      {assignee.checked && (
                        <div className="assignee-check-badge">
                          <CheckCircle2 size={10} color="white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;
