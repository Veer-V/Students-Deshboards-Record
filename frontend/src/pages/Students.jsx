import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Students = () => {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setUploadMessage(response.data.message)
      fetchStudents() // Refresh the student list
    } catch (error) {
      setUploadMessage(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
  }

  const viewAnalytics = () => {
    if (selectedStudent) {
      navigate(`/analytics/${encodeURIComponent(selectedStudent.Name)}`)
    }
  }

  const filteredStudents = students.filter(student =>
    student.Name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const downloadData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/download')
      alert(response.data.message)
      // In a real app, you would trigger a file download here
    } catch (error) {
      console.error('Error downloading data:', error)
    }
  }

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-800 dark:text-white text-center"
      >
        Student Management
      </motion.h1>

      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Upload Student Data
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <label className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <div className="cursor-pointer p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
              <div className="text-center">
                <span className="text-2xl">📤</span>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {uploading ? 'Uploading...' : 'Click to upload CSV file'}
                </p>
              </div>
            </div>
          </label>

          <button
            onClick={downloadData}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
          >
            📥 Download Data
          </button>
        </div>

        {uploadMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            uploadMessage.includes('success') 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {uploadMessage}
          </div>
        )}
      </motion.div>

      {/* Selected Student Actions */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-blue-50 dark:bg-blue-900 rounded-xl p-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Selected Student
              </h3>
              <p className="text-blue-600 dark:text-blue-300">
                {selectedStudent.Name} (ID: {selectedStudent.Student_ID})
              </p>
            </div>
            <button
              onClick={viewAnalytics}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              📊 View Analytics
            </button>
          </div>
        </motion.div>
      )}

      {/* Search and Student List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Students ({filteredStudents.length})
          </h2>
          
          <input
            type="text"
            placeholder="🔍 Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Internal 1</th>
                <th className="text-left py-3 px-4">Internal 2</th>
                <th className="text-left py-3 px-4">Attendance</th>
                <th className="text-left py-3 px-4">Previous Grade</th>
                <th className="text-left py-3 px-4">Participation</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr 
                  key={student.Student_ID} 
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedStudent?.Student_ID === student.Student_ID ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                >
                  <td className="py-3 px-4">{student.Student_ID}</td>
                  <td className="py-3 px-4 font-medium">{student.Name}</td>
                  <td className="py-3 px-4">{student.Internal_Assessment_1}</td>
                  <td className="py-3 px-4">{student.Internal_Assessment_2}</td>
                  <td className="py-3 px-4">{student.Attendance_Percentage}%</td>
                  <td className="py-3 px-4">{student.Previous_Semester_Grade}</td>
                  <td className="py-3 px-4">{student.Participation_Score}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleStudentSelect(student)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStudent?.Student_ID === student.Student_ID
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-blue-500 hover:text-white'
                      } transition-colors duration-200`}
                    >
                      {selectedStudent?.Student_ID === student.Student_ID ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No students found matching your search.
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Students
