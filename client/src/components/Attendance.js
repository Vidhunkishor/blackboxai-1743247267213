import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaCheck, FaTimes, FaClock, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [date]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/students');
      const studentsWithAttendance = await Promise.all(
        response.data.map(async (student) => {
          const attendanceRes = await axios.get(
            `http://localhost:5000/attendance?studentId=${student.id}&date=${date}`
          );
          return {
            ...student,
            status: attendanceRes.data.status || 'absent'
          };
        })
      );
      setStudents(studentsWithAttendance);
    } catch (error) {
      setError('Failed to load attendance data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/attendance', {
        studentId,
        date,
        status: newStatus
      });
      setSuccess('Attendance updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (error) {
      setError('Failed to update attendance');
      console.error('Error updating attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const bulkUpdateStatus = async (status) => {
    setIsLoading(true);
    setError('');
    try {
      await Promise.all(
        students.map(student => 
          axios.post('http://localhost:5000/attendance', {
            studentId: student.id,
            date,
            status
          })
        )
      );
      setSuccess(`All students marked as ${status}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchStudents();
    } catch (error) {
      setError('Failed to bulk update attendance');
      console.error('Error bulk updating attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusCounts = () => {
    return students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, { present: 0, absent: 0, late: 0 });
  };

  const statusCounts = getStatusCounts();

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch(status) {
      case 'present':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}><FaCheck className="mr-1" /> Present</span>;
      case 'absent':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}><FaTimes className="mr-1" /> Absent</span>;
      case 'late':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><FaClock className="mr-1" /> Late</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-blue-700 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FaCalendarAlt className="mr-2" />
          Attendance
        </h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow max-w-xs">
            <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaCalendarAlt className="absolute left-3 top-11 text-gray-400" />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => bulkUpdateStatus('present')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center transition-colors"
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
              Mark All Present
            </button>
            <button
              onClick={() => bulkUpdateStatus('absent')}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center transition-colors"
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
              Mark All Absent
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-800 font-bold text-xl">{statusCounts.present}</div>
            <div className="text-green-600">Present</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-red-800 font-bold text-xl">{statusCounts.absent}</div>
            <div className="text-red-600">Absent</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-800 font-bold text-xl">{statusCounts.late}</div>
            <div className="text-yellow-600">Late</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                    <div className="mt-2 md:hidden">
                      {getStatusBadge(student.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;