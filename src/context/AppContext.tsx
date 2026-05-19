import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role, ResidentApartment, StudentApartment, Business } from '../types';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  residents: ResidentApartment[];
  students: StudentApartment[];
  businesses: Business[];
  buildings: any[];
  employees: any[];
  expenses: any[];
  maintenanceIssues: any[];
  updateResident: (id: string, data: Partial<ResidentApartment>) => Promise<void>;
  batchUpdateResidents: (data: any[]) => Promise<void>;
  updateStudent: (id: string, data: Partial<StudentApartment>) => Promise<void>;
  batchUpdateStudents: (data: any[]) => Promise<void>;
  updateBusiness: (id: string, data: Partial<Business>) => Promise<void>;
  softDeleteResident: (id: string) => Promise<void>;
  softDeleteStudent: (id: string) => Promise<void>;
  softDeleteBusiness: (id: string) => Promise<void>;
  splitResident: (id: string) => Promise<void>;
  addEmployee: (data: any) => Promise<void>;
  updateEmployee: (id: string, data: any) => Promise<void>;
  softDeleteEmployee: (id: string) => Promise<void>;
  addExpense: (data: any) => Promise<void>;
  updateExpense: (id: string, data: any) => Promise<void>;
  softDeleteExpense: (id: string) => Promise<void>;
  addMaintenanceIssue: (data: any) => Promise<void>;
  softDeleteMaintenanceIssue: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (window.location.origin.includes('5173') ? 'http://localhost:3000/api' : '/api');

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('Editor');
  const [residents, setResidents] = useState<ResidentApartment[]>([]);
  const [students, setStudents] = useState<StudentApartment[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [resData, stuData, bizData, mapData, empData, expData, maintData] = await Promise.all([
        fetch(`${API_URL}/residents`).then(r => r.json()),
        fetch(`${API_URL}/students`).then(r => r.json()),
        fetch(`${API_URL}/businesses`).then(r => r.json()),
        fetch(`${API_URL}/buildings`).then(r => r.json()),
        fetch(`${API_URL}/employees`).then(r => r.json()),
        fetch(`${API_URL}/expenses`).then(r => r.json()),
        fetch(`${API_URL}/maintenance`).then(r => r.json()),
      ]);
      setResidents(resData);
      setStudents(stuData);
      setBusinesses(bizData);
      setBuildings(mapData);
      setEmployees(empData);
      setExpenses(expData);
      setMaintenanceIssues(maintData);
    } catch (e) {
      console.error('Failed to load data from server:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateResident = async (id: string, data: Partial<ResidentApartment>) => {
    const res = await fetch(`${API_URL}/residents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setResidents(prev => prev.map(r => r.id === id ? updated : r));
    }
  };

  const batchUpdateResidents = async (data: any[]) => {
    const res = await fetch(`${API_URL}/residents/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updatedList = await res.json();
      setResidents(prev => {
        const copy = [...prev];
        updatedList.forEach((updated: any) => {
          const idx = copy.findIndex(r => r.id === updated.id);
          if (idx !== -1) copy[idx] = updated;
        });
        return copy;
      });
    }
  };

  const updateStudent = async (id: string, data: Partial<StudentApartment>) => {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setStudents(prev => prev.map(s => s.id === id ? updated : s));
    }
  };

  const batchUpdateStudents = async (data: any[]) => {
    const res = await fetch(`${API_URL}/students/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updatedList = await res.json();
      setStudents(prev => {
        const copy = [...prev];
        updatedList.forEach((updated: any) => {
          const idx = copy.findIndex(s => s.id === updated.id);
          if (idx !== -1) copy[idx] = updated;
        });
        return copy;
      });
    }
  };

  const updateBusiness = async (id: string, data: Partial<Business>) => {
    const res = await fetch(`${API_URL}/businesses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
    }
  };

  const softDeleteResident = async (id: string) => {
    const res = await fetch(`${API_URL}/residents/${id}`, { method: 'DELETE' });
    if (res.ok) setResidents(prev => prev.filter(r => r.id !== id));
  };

  const softDeleteStudent = async (id: string) => {
    const res = await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
    if (res.ok) setStudents(prev => prev.filter(s => s.id !== id));
  };

  const softDeleteBusiness = async (id: string) => {
    const res = await fetch(`${API_URL}/businesses/${id}`, { method: 'DELETE' });
    if (res.ok) setBusinesses(prev => prev.filter(b => b.id !== id));
  };

  const splitResident = async (id: string) => {
    const res = await fetch(`${API_URL}/residents/${id}/split`, { method: 'POST' });
    if (res.ok) {
      const newApt = await res.json();
      setResidents(prev => {
        const targetIndex = prev.findIndex(r => r.id === id);
        if (targetIndex === -1) return prev;
        const copy = [...prev];
        copy.splice(targetIndex + 0, 0, newApt);
        return copy;
      });
    }
  };

  const addEmployee = async (data: any) => {
    const res = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const added = await res.json();
      setEmployees(prev => [...prev, added]);
    }
  };

  const updateEmployee = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const softDeleteEmployee = async (id: string) => {
    const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
    if (res.ok) setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const addExpense = async (data: any) => {
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const added = await res.json();
      setExpenses(prev => [...prev, added]);
    }
  };

  const updateExpense = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const softDeleteExpense = async (id: string) => {
    const res = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addMaintenanceIssue = async (data: any) => {
    const res = await fetch(`${API_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const added = await res.json();
      setMaintenanceIssues(prev => [...prev, added]);
    }
  };

  const softDeleteMaintenanceIssue = async (id: string) => {
    const res = await fetch(`${API_URL}/maintenance/${id}`, { method: 'DELETE' });
    if (res.ok) setMaintenanceIssues(prev => prev.filter(m => m.id !== id));
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      residents, students, businesses, buildings, employees, expenses, maintenanceIssues,
      updateResident, batchUpdateResidents, updateStudent, batchUpdateStudents, updateBusiness,
      softDeleteResident, softDeleteStudent, softDeleteBusiness,
      splitResident,
      addEmployee, updateEmployee, softDeleteEmployee,
      addExpense, updateExpense, softDeleteExpense,
      addMaintenanceIssue, softDeleteMaintenanceIssue
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
