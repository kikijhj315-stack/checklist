import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockGroups, mockUsers } from '../utils/mockData';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

const ChecklistContext = createContext();

export const useChecklist = () => useContext(ChecklistContext);

export const ChecklistProvider = ({ children }) => {
  const [groups] = useState(mockGroups);
  const [dbUsers, setDbUsers] = useState([]);
  const [users, setUsers] = useState(mockUsers);
  const [currentUser, setCurrentUser] = useState(null); // Start with no user logged in
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync users_auth for password changes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users_auth'), (snapshot) => {
      const authData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbUsers(authData);
    });
    return () => unsubscribe();
  }, []);

  // Merge dbUsers with mockUsers to get the latest passwords
  useEffect(() => {
    const merged = mockUsers.map(mu => {
      const dbUser = dbUsers.find(du => du.id === mu.id);
      return dbUser ? { ...mu, pw: dbUser.pw } : mu;
    });
    setUsers(merged);
  }, [dbUsers]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error: ", error);
      alert("Firestore에 접근할 수 없습니다. Firebase 콘솔에서 Database 규칙(Rules)이 허용(allow read, write: if true;)되어 있는지 확인해주세요.");
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Ping SQLite backend for access logging
  useEffect(() => {
    if (currentUser) {
      fetch('http://localhost:3000/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, username: currentUser.name })
      }).catch(err => console.error("Access log server not reachable", err));
    }
  }, [currentUser]);

  const addTask = async (newTask) => {
    try {
      await setDoc(doc(db, 'tasks', newTask.id), newTask);
    } catch (e) {
      console.error("Error adding task: ", e);
      alert("업무 등록 실패: Firebase Database 규칙을 확인해주세요.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (e) {
      console.error("Error deleting task: ", e);
    }
  };

  const updateTaskOrder = async (groupId, reorderedTasks) => {
    try {
      const batch = writeBatch(db);
      reorderedTasks.forEach(task => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.update(taskRef, { order: task.order });
      });
      await batch.commit();
    } catch (e) {
      console.error("Error updating order: ", e);
    }
  };

  const toggleAssigneeCheck = async (taskId, userId, submittedUrl = null) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    let allChecked = true;
    const updatedAssignees = task.assignees.map(a => {
      if (a.userId === userId) {
        const newChecked = !a.checked;
        if (!newChecked) allChecked = false;
        return { ...a, checked: newChecked, submittedUrl: newChecked ? submittedUrl : null };
      }
      if (!a.checked) allChecked = false;
      return a;
    });

    let status = task.status;
    let completedAt = task.completedAt;
    
    // Check if all assignees are checked and there's at least one assignee
    if (allChecked && task.assignees.length > 0) {
      status = 'Completed';
      completedAt = new Date().toISOString();
    } else if (status === 'Completed') {
       status = 'In Progress';
       completedAt = null;
    }

    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        assignees: updatedAssignees,
        status,
        completedAt
      });
    } catch (e) {
      console.error("Error toggling check: ", e);
    }
  };

  const markTaskCompleted = async (taskId, isCompleted) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: isCompleted ? 'Completed' : 'In Progress',
        completedAt: isCompleted ? new Date().toISOString() : null,
        assignees: task.assignees.map(a => ({ ...a, checked: isCompleted }))
      });
    } catch (e) {
      console.error("Error marking completed: ", e);
    }
  };

  // setCurrentUser is now exported directly

  const value = {
    groups,
    tasks,
    users,
    currentUser,
    loading,
    addTask,
    deleteTask,
    updateTaskOrder,
    toggleAssigneeCheck,
    markTaskCompleted,
    setCurrentUser
  };

  return (
    <ChecklistContext.Provider value={value}>
      {children}
    </ChecklistContext.Provider>
  );
};
