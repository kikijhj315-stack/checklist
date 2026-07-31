import React from 'react';
import { useChecklist } from '../../context/ChecklistContext';
import { LayoutDashboard, Users, Folder, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ selectedGroupId, onSelectGroup }) => {
  const { groups } = useChecklist();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <LayoutDashboard size={24} color="var(--accent-primary)" />
        </div>
        <span className="logo-text">TaskFlow</span>
      </div>
      
      <div className="sidebar-menu">
        <div className="menu-label">Workspace</div>
        <ul className="group-list">
          <li 
            className={`group-item ${selectedGroupId === null ? 'active' : ''}`}
            onClick={() => onSelectGroup(null)}
          >
            <div className="group-item-content">
              <Folder size={18} />
              <span>전체 업무</span>
            </div>
          </li>
          <li 
            className={`group-item ${selectedGroupId === 'incomplete' ? 'active' : ''}`}
            onClick={() => onSelectGroup('incomplete')}
          >
            <div className="group-item-content">
              <LayoutDashboard size={18} />
              <span>미완료 업무</span>
            </div>
            {selectedGroupId === 'incomplete' && <ChevronRight size={16} className="active-indicator" />}
          </li>
          
          <div className="menu-label mt-4">업무관리</div>
          {groups.map(group => (
            <li 
              key={group.id} 
              className={`group-item ${selectedGroupId === group.id ? 'active' : ''}`}
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="group-item-content">
                <Users size={18} />
                <span>{group.name}</span>
              </div>
              {selectedGroupId === group.id && <ChevronRight size={16} className="active-indicator" />}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
