'use client';

import React, { useEffect, useState } from 'react';
import { ContactRound, Download, Edit2, Eye, Search, Trash2, Users, X } from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';

interface EmployeeDirectoryEntry {
  id: string;
  srNo: number;
  name: string;
  designation: string;
  idCardNo: string;
}

export function EmployeeDataManagement() {
  const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [designation, setDesignation] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDirectoryEntry | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDirectoryEntry | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (designation !== 'ALL') params.set('designation', designation);
        const response = await fetch(`/api/employee-data?${params.toString()}`, { signal: controller.signal });
        const data = await response.json();
        if (data.success) {
          const fetchedEmployees = data.employees as EmployeeDirectoryEntry[];
          setEmployees(fetchedEmployees);
          setDesignations((current) => current.length ? current : [...new Set<string>(fetchedEmployees.map((employee) => employee.designation))].sort());
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error('Employee data fetch error:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadEmployees();
    return () => controller.abort();
  }, [search, designation]);

  const exportExcel = () => {
    exportToExcelFile(
      employees.map((employee) => ({
        'SR No': employee.srNo,
        'Employee Name': employee.name,
        Designation: employee.designation,
        'ID Card No': employee.idCardNo,
      })),
      'Pakistan_Sweet_Home_Multan_Employee_Data'
    );
  };

  const saveEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingEmployee) return;
    const response = await fetch('/api/employee-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEmployee),
    });
    if (response.ok) {
      setEditingEmployee(null);
      setSearch((current) => current);
      window.location.reload();
    }
  };

  const deleteEmployee = async (employee: EmployeeDirectoryEntry) => {
    if (!window.confirm(`Delete ${employee.name} from employee data?`)) return;
    const response = await fetch('/api/employee-data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: employee.id }),
    });
    if (response.ok) setEmployees((current) => current.filter((item) => item.id !== employee.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Employee Data</h1>
            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {employees.length} Records
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">Pakistan Bait-ul-Mal - Pakistan Sweet Home Multan</p>
        </div>
        <button
          type="button"
          onClick={exportExcel}
          disabled={!employees.length}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4 text-emerald-700" />
          Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, designation, or ID card number"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500" htmlFor="designation-filter">
            Designation
          </label>
          <select
            id="designation-filter"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Designations</option>
            {designations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <ContactRound className="h-5 w-5 text-emerald-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Institutional Employee Directory</h2>
            <p className="text-[11px] text-slate-500">Official employee identification records</p>
          </div>
          <Users className="ml-auto h-4 w-4 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="w-20 px-4 py-3 font-bold">SR No</th>
                <th className="px-4 py-3 font-bold">Employee Name</th>
                <th className="px-4 py-3 font-bold">Designation</th>
                <th className="px-4 py-3 font-bold">ID Card No</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading employee data...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No employee records match your search.</td></tr>
              ) : employees.map((employee) => (
                <tr key={employee.id} className="transition-colors hover:bg-emerald-50/40">
                  <td className="px-4 py-3 font-semibold text-slate-500">{employee.srNo}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{employee.name}</td>
                  <td className="px-4 py-3 text-emerald-800">{employee.designation}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{employee.idCardNo}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => setSelectedEmployee(employee)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100" title="View employee"><Eye className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => setEditingEmployee({ ...employee })} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50" title="Edit employee"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => deleteEmployee(employee)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50" title="Delete employee"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(selectedEmployee || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">{editingEmployee ? 'Edit Employee Data' : 'Employee Data'}</h2>
              <button type="button" onClick={() => { setSelectedEmployee(null); setEditingEmployee(null); }} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            {editingEmployee ? (
              <form onSubmit={saveEmployee} className="mt-4 space-y-3 text-xs">
                <input value={editingEmployee.name} onChange={(event) => setEditingEmployee({ ...editingEmployee, name: event.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="Employee name" required />
                <input value={editingEmployee.designation} onChange={(event) => setEditingEmployee({ ...editingEmployee, designation: event.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="Designation" required />
                <input value={editingEmployee.idCardNo} onChange={(event) => setEditingEmployee({ ...editingEmployee, idCardNo: event.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="ID card number" required />
                <button type="submit" className="w-full rounded-lg bg-emerald-700 px-3 py-2.5 font-bold text-white hover:bg-emerald-800">Save Changes</button>
              </form>
            ) : selectedEmployee && (
              <dl className="mt-4 space-y-3 text-xs">
                <div><dt className="font-semibold text-slate-500">SR No</dt><dd className="mt-1 text-slate-900">{selectedEmployee.srNo}</dd></div>
                <div><dt className="font-semibold text-slate-500">Employee Name</dt><dd className="mt-1 text-slate-900">{selectedEmployee.name}</dd></div>
                <div><dt className="font-semibold text-slate-500">Designation</dt><dd className="mt-1 text-slate-900">{selectedEmployee.designation}</dd></div>
                <div><dt className="font-semibold text-slate-500">ID Card No</dt><dd className="mt-1 font-mono text-slate-900">{selectedEmployee.idCardNo}</dd></div>
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
