import React, { useMemo, useState } from 'react';
import { useChecklist } from '../../context/ChecklistContext';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskItem from '../TaskItem/TaskItem';
import TaskFormModal from '../TaskFormModal/TaskFormModal';
import { Layers, Plus } from 'lucide-react';
import './Board.css';

const Board = ({ selectedGroupId }) => {
  const { tasks, updateTaskOrder, currentUser, groups } = useChecklist();
  const isAdmin = currentUser.role === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tasks by selected group and sort by order
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedGroupId === 'incomplete') {
      result = tasks.filter(t => t.status !== 'Completed');
    } else if (selectedGroupId) {
      result = tasks.filter(t => t.groupId === selectedGroupId);
    }
    // Sort by order
    return result.sort((a, b) => a.order - b.order);
  }, [tasks, selectedGroupId]);

  const currentGroupName = useMemo(() => {
    if (selectedGroupId === 'incomplete') return '미완료 업무';
    if (!selectedGroupId) return '전체 업무';
    return groups.find(g => g.id === selectedGroupId)?.name || '업무관리';
  }, [selectedGroupId, groups]);

  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Only allow reordering if looking at a specific group
    if (!selectedGroupId) {
      alert("You can only reorder tasks when viewing a specific group.");
      return;
    }

    if (!isAdmin) {
      alert("Only admins can reorder tasks.");
      return;
    }

    const reordered = Array.from(filteredTasks);
    const [movedTask] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, movedTask);

    // Update the 'order' property for the reordered tasks
    const updatedTasks = reordered.map((t, index) => ({ ...t, order: index }));

    updateTaskOrder(selectedGroupId, updatedTasks);
  };

  return (
    <div className="board">
      <div className="board-header">
        <h2 className="board-title">
          <Layers className="text-accent" />
          {currentGroupName}
        </h2>
        <div className="board-actions">
          <span className="task-count">{filteredTasks.length} tasks</span>
          {selectedGroupId && selectedGroupId !== 'incomplete' && (
            <button className="btn-add-task" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              등록하기
            </button>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board-droppable" isDropDisabled={!isAdmin || !selectedGroupId}>
          {(provided, snapshot) => (
            <div 
              className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <TaskItem key={task.id} task={task} index={index} />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <p>No tasks found in this group.</p>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={selectedGroupId}
      />
    </div>
  );
};

export default Board;
