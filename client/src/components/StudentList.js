import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaSort, FaSortUp, FaSortDown, FaUser, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';


const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [deleteModal, setDeleteModal] = useState({ show: false, studentId: null, studentName: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/students');
      setStudents(response.data);
    } catch (error) {
      setError('Failed to fetch students. Please try again.');
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async () => {
    if (!newName.trim()) {
      setError('Student name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/students', { name: newName });
      setNewName('');
      setSuccess('Student added successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (error) {
      setError('Failed to add student. Please try again.');
      console.error('Error adding student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const updateStudent = async () => {
    if (!editName.trim()) {
      setError('Student name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await axios.put(`http://localhost:5000/students/${editingId}`, { name: editName });
      setEditingId(null);
      setEditName('');
      setSuccess('Student updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (error) {
      setError('Failed to update student. Please try again.');
      console.error('Error updating student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (student) => {
    setDeleteModal({
      show: true,
      studentId: student.id,
      studentName: student.name
    });
  };

  const deleteStudent = async () => {
    setIsLoading(true);
    setError('');
    try {
      await axios.delete(`http://localhost:5000/students/${deleteModal.studentId}`);
      setDeleteModal({ show: false, studentId: null, studentName: '' });
      setSuccess('Student deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (error) {
      setError('Failed to delete student. Please try again.');
      console.error('Error deleting student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1" /> 
      : <FaSortDown className="ml-1" />;
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredStudents = sortedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-blue-700 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FaUser className="mr-2" />
          Student Management
        </h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
          <div className="flex">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New student name"
              className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addStudent()}
            />
            <button 
              onClick={addStudent}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg flex items-center transition-colors"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
            <FaCheckCircle className="mr-2" />
            {success}
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No matching students found' : 'No students available'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && updateStudent()}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === student.id ? (
                        <>
                          <button
                            onClick={updateStudent}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(student)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => confirmDelete(student)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete student: <span className="font-semibold">{deleteModal.studentName}</span>?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, studentId: null, studentName: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteStudent}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;