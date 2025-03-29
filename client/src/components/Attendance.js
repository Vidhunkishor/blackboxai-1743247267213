import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/students');
      const studentsWithAttendance = await Promise.all(
        response.data.map(async (student) => {
          const attendanceRes = await axios.get(
                        `http://localhost:5000/attendance?studentId=${student.id}&date=${selectedDate}`

          );
          return {
            ...student,
            status: attendanceRes.data.status || 'absent'
          };
        })
      );
      setStudents(studentsWithAttendance);
    } catch (err) {
      setError('Failed to load attendance data');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
    }, [selectedDate]);


  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await axios.post('http://localhost:5000/attendance', {
        studentId,
                date: selectedDate,

        status: newStatus
      });
      fetchStudents();
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Student</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="py-2 px-4 border-b">{student.name}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={student.status}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;