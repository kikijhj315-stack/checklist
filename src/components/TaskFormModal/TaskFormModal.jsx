import React, { useState } from 'react';
import { useChecklist } from '../../context/ChecklistContext';
import { X, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../utils/firebase';
import './TaskFormModal.css';

const TaskFormModal = ({ isOpen, onClose, groupId }) => {
  const { users, currentUser, addTask, tasks } = useChecklist();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleToggleAssignee = (userId) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleAllAssignees = (e) => {
    if (e.target.checked) {
      setSelectedAssignees(users.map(u => u.id));
    } else {
      setSelectedAssignees([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAttachment(null);
      return;
    }
    
    // We can allow larger files now, e.g. 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기가 너무 큽니다. 최대 5MB까지만 첨부할 수 있습니다.");
      e.target.value = '';
      setAttachment(null);
      return;
    }

    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || uploading) return;

    setUploading(true);
    let attachmentData = null;

    if (attachment) {
      try {
        const fileRef = ref(storage, `attachments/${Date.now()}_${attachment.name}`);
        const snapshot = await uploadBytes(fileRef, attachment);
        const downloadURL = await getDownloadURL(snapshot.ref);
        attachmentData = {
          name: attachment.name,
          dataURL: downloadURL
        };
      } catch (error) {
        console.error("File upload failed", error);
        alert("파일 업로드에 실패했습니다. Firebase Storage 규칙(Rules)이 허용(allow read, write: if true;)되어 있는지 확인해주세요.");
        setUploading(false);
        return;
      }
    }

    // Determine max order in current group
    const groupTasks = tasks.filter(t => t.groupId === groupId);
    const maxOrder = groupTasks.length > 0 ? Math.max(...groupTasks.map(t => t.order)) : -1;

    const newTask = {
      id: `t_${Date.now()}`,
      groupId: groupId,
      order: maxOrder + 1,
      title: title.trim(),
      description: description.trim(),
      attachment: attachmentData,
      publisherId: currentUser.id,
      createdAt: new Date().toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      completedAt: null,
      status: 'Pending',
      assignees: selectedAssignees.map(userId => ({ userId, checked: false }))
    };

    await addTask(newTask);
    
    // Reset form and close
    setUploading(false);
    setTitle('');
    setDescription('');
    setAttachment(null);
    setDueDate(null);
    setSelectedAssignees([]);
    // Reset file input visually if needed (handled by uncontrolled input nature, but just in case, we could use a ref, but simple is fine here)
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>새 업무 등록</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>게시자</label>
            <input type="text" value={currentUser.name} disabled className="disabled-input" />
          </div>

          <div className="form-group">
            <label>게시글 (제목)</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="업무 제목을 입력하세요" 
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="상세 내용을 입력하세요" 
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>첨부하기 (파일 업로드)</label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="file-input"
            />
            <span className="file-hint">로컬 저장소 용량 제한으로 최대 1MB까지만 지원됩니다.</span>
          </div>

          <div className="form-group">
            <label>완료기일날짜 (선택)</label>
            <DatePicker 
              selected={dueDate} 
              onChange={(date) => setDueDate(date)} 
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="시간"
              dateFormat="yyyy년 MM월 dd일 h:mm aa"
              placeholderText="날짜와 시간을 선택하세요"
              className="date-picker-input"
              isClearable
            />
          </div>

          <div className="form-group">
            <div className="assignees-header">
              <label>담당자 지정</label>
              <label className="assignee-checkbox-label select-all">
                <input 
                  type="checkbox" 
                  checked={selectedAssignees.length === users.length && users.length > 0}
                  onChange={handleToggleAllAssignees}
                />
                <span>전체 선택</span>
              </label>
            </div>
            <div className="assignees-selection">
              {users.map(user => (
                <label key={user.id} className="assignee-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedAssignees.includes(user.id)}
                    onChange={() => handleToggleAssignee(user.id)}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={uploading}>취소</button>
            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? <Loader2 size={16} className="spinner" /> : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
