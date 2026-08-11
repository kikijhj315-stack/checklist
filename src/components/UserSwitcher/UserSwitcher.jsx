import React, { useState } from 'react';
import { useChecklist } from '../../context/ChecklistContext';
import { UserCircle2, ShieldAlert, KeyRound, LogOut, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import './UserSwitcher.css';

const UserSwitcher = () => {
  const { users, currentUser, setCurrentUser } = useChecklist();

  const [loginModal, setLoginModal] = useState({ isOpen: false, targetUserId: '' });
  const [loginPw, setLoginPw] = useState('');

  const [pwModal, setPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handleUserChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    setLoginModal({ isOpen: true, targetUserId: selectedId });
    e.target.value = currentUser ? currentUser.id : '';
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === loginModal.targetUserId);
    if (targetUser && targetUser.pw === loginPw) {
      setCurrentUser(targetUser);
      setLoginModal({ isOpen: false, targetUserId: '' });
      setLoginPw('');
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleChangePwSubmit = async (e) => {
    e.preventDefault();
    if (currentPw !== currentUser.pw) {
      alert("현재 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!newPw.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await setDoc(doc(db, 'users_auth', currentUser.id), { pw: newPw.trim() });
      alert("비밀번호가 성공적으로 변경되었습니다!");
      setPwModal(false);
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      console.error(err);
      alert("비밀번호 변경 실패 (Firebase Database 규칙을 확인해주세요).");
    }
  };

  return (
    <div className="user-switcher-container">
      <div className="user-switcher">
        {currentUser ? (
          <>
            <div className="current-user-info">
              <UserCircle2 size={18} color="var(--text-secondary)" />
              <span className="user-name">{currentUser.name}</span>
              {currentUser.role.includes('admin') && (
                <span className="role-badge admin">
                  <ShieldAlert size={12} />
                  Admin
                </span>
              )}
            </div>
            
            <div className="user-actions">
              <button className="icon-btn" onClick={() => setPwModal(true)} title="비밀번호 변경">
                <KeyRound size={14} />
              </button>
              <button className="icon-btn logout-btn" onClick={handleLogout} title="로그아웃">
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="current-user-info">
            <span className="user-name">로그인 해주세요 👉</span>
          </div>
        )}

        <select 
          className="user-select"
          value={currentUser ? currentUser.id : ''}
          onChange={handleUserChange}
          title="사용자 전환"
        >
          <option value="" disabled>계정 선택</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
        </select>
      </div>

      {/* Login Modal */}
      {loginModal.isOpen && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <div className="auth-modal-header">
              <h3>로그인</h3>
              <button className="close-btn" onClick={() => { setLoginModal({ isOpen: false, targetUserId: '' }); setLoginPw(''); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div className="auth-form-group">
                <label>비밀번호</label>
                <input 
                  type="password" 
                  value={loginPw} 
                  onChange={(e) => setLoginPw(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                />
              </div>
              <button type="submit" className="auth-submit-btn">접속하기</button>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {pwModal && currentUser && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <div className="auth-modal-header">
              <h3>비밀번호 변경</h3>
              <button className="close-btn" onClick={() => { setPwModal(false); setCurrentPw(''); setNewPw(''); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePwSubmit}>
              <div className="auth-form-group">
                <label>현재 비밀번호</label>
                <input 
                  type="password" 
                  value={currentPw} 
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  autoFocus
                />
              </div>
              <div className="auth-form-group">
                <label>새 비밀번호</label>
                <input 
                  type="password" 
                  value={newPw} 
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="새로운 비밀번호 입력"
                />
              </div>
              <button type="submit" className="auth-submit-btn">변경하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
