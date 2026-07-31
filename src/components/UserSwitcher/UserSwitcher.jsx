import React from 'react';
import { useChecklist } from '../../context/ChecklistContext';
import { UserCircle2, ShieldAlert } from 'lucide-react';
import './UserSwitcher.css';

const UserSwitcher = () => {
  const { users, currentUser, changeCurrentUser } = useChecklist();

  return (
    <div className="user-switcher">
      <div className="current-user-info">
        <UserCircle2 size={18} color="var(--text-secondary)" />
        <span className="user-name">{currentUser.name}</span>
        {currentUser.role === 'admin' && (
          <span className="role-badge admin">
            <ShieldAlert size={12} />
            Admin
          </span>
        )}
      </div>
      <select 
        className="user-select"
        value={currentUser.id}
        onChange={(e) => changeCurrentUser(e.target.value)}
        title="Switch user to test permissions"
      >
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSwitcher;
