import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

const Predictions = () => {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const predictPerformance = async (student) => {
    setLoading(true)
    setSelectedStudent(student)
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        Internal_Assessment_1: student.Internal_Assessment_1,
        Internal_Assessment_2: student.Internal_Assessment_2,
        Attendance_Percentage: student.Attendance_Percentage,
        Previous_Semester_Grade: student.Previous_Semester_Grade,
        Participation_Score: student.Participation_Score
      })
      setPrediction(response.data)
    } catch (error) {
      console.error('Error predicting performance:', error)
    }
    setLoading(false)
  }

  const generateRecommendation = (student, prediction) => {
    const recommendations = []
    
    if (student.Attendance_Percentage < 60) {
      recommendations.push("📌 Improve attendance to at least 60%")
    }
    if (student.Internal_Assessment_1 < 15) {
      recommendations.push("📝 Focus on improving Internal Assessment 1 scores")
    }
    if (student.Participation_Score < 5) {
      recommendations.push("🙋‍♂️ Increase class participation")
    }
    if (student.Previous_Semester_Grade < 10) {
      recommendations.push("📚 Review previous semester materials")
    }

    if (recommendations.length === 0) {
      return "🎯 You're on track! Keep up the good work!"
    }

    return recommendations.join("\n")
  }

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-800 dark:text-white text-center"
      >
        Performance Predictions
      </motion.h1>

      {/* Student Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Select Student
        </h2>
        <select
          onChange={(e) => {
            const student = students.find(s => s.Student_ID === e.target.value)
            if (student) predictPerformance(student)
          }}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          <option value="">Choose a student...</option>
          {students.map((student) => (
            <option key={student.Student_ID} value={student.Student_ID}>
              {student.Name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Prediction Result */}
      {selectedStudent && prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Prediction Result for {selectedStudent.Name}
          </h2>
          
          <div className={`p-4 rounded-lg mb-4 ${
            prediction.prediction === 'Pass' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {prediction.prediction === 'Pass' ? '✅' : '❌'}
              </span>
              <span className="text-lg font-bold">
                {prediction.prediction === 'Pass' ? 'PASS' : 'FAIL'}
              </span>
              <span className="text-sm">
                (Score: {prediction.score.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Internal 1</div>
              <div className="font-semibold">{selectedStudent.Internal_Assessment_1}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Internal 2</div>
              <div className="font-semibold">{selectedStudent.Internal_Assessment_2}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Attendance</div>
              <div className="font-semibold">{selectedStudent.Attendance_Percentage}%</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Participation</div>
              <div className="font-semibold">{selectedStudent.Participation_Score}</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 Recommendations
            </h3>
            <p className="text-blue-700 dark:text-blue-300 whitespace-pre-line">
              {generateRecommendation(selectedStudent, prediction)}
            </p>
          </div>
        </motion.div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Analyzing performance...</p>
        </motion.div>
      )}
    </div>
  )
}

export default Predictions
