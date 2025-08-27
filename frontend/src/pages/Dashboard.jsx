import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const Dashboard = () => {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    avgPerformance: 0,
    attendanceRate: 0,
    topAchievers: 0
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/students')
      setStudents(response.data)
      calculateMetrics(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const calculateMetrics = (studentsData) => {
    const total = studentsData.length
    const avgPerformance = studentsData.reduce((sum, student) => 
      sum + ((student.Internal_Assessment_1 + student.Internal_Assessment_2) / 2), 0) / total
    const attendanceRate = studentsData.reduce((sum, student) => 
      sum + student.Attendance_Percentage, 0) / total
    const topAchievers = studentsData.filter(student => 
      (student.Internal_Assessment_1 + student.Internal_Assessment_2) / 2 >= 15
    ).length

    setMetrics({
      totalStudents: total,
      avgPerformance: avgPerformance.toFixed(1),
      attendanceRate: attendanceRate.toFixed(1),
      topAchievers
    })
  }

  const filteredStudents = students.filter(student =>
    student.Name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const metricCards = [
    {
      title: 'Total Students',
      value: metrics.totalStudents,
      icon: '👥',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Avg. Performance (%)',
      value: metrics.avgPerformance,
      icon: '📊',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Attendance Rate (%)',
      value: metrics.attendanceRate,
      icon: '📅',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Top Achievers',
      value: metrics.topAchievers,
      icon: '⭐',
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const quickActions = [
    { label: 'Generate Report', icon: '📄', action: () => alert('Generate Report') },
    { label: 'Add Student', icon: '➕', action: () => alert('Add Student') },
    { label: 'Schedule Exam', icon: '📝', action: () => alert('Schedule Exam') }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Student Performance Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and analyze student performance with comprehensive insights
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center"
      >
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="🔍 Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${metric.color} rounded-xl p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm opacity-90">{metric.title}</p>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Students List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Students ({filteredStudents.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Internal 1</th>
                <th className="text-left py-3 px-4">Internal 2</th>
                <th className="text-left py-3 px-4">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 5).map((student) => (
                <tr key={student.Student_ID} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">{student.Name}</td>
                  <td className="py-3 px-4">{student.Internal_Assessment_1}</td>
                  <td className="py-3 px-4">{student.Internal_Assessment_2}</td>
                  <td className="py-3 px-4">{student.Attendance_Percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
