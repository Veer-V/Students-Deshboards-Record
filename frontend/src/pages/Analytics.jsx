import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from 'recharts'

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isIndividual, setIsIndividual] = useState(false)
  const { studentName } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAnalytics()
  }, [studentName])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      let url = 'http://localhost:5000/analytics'
      if (studentName) {
        url = `http://localhost:5000/analytics/${encodeURIComponent(studentName)}`
        setIsIndividual(true)
      } else {
        setIsIndividual(false)
      }
      
      const response = await axios.get(url)
      setAnalyticsData(response.data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      if (error.response?.status === 404) {
        navigate('/analytics')
      }
    } finally {
      setLoading(false)
    }
  }

  // Formatters for charts
  const formatPerformanceTrend = (data) =>
    data.map((score, index) => ({
      name: `Assessment ${index + 1}`,
      score: score,
    }))

  const formatSubjectScores = (data) =>
    Object.entries(data).map(([subject, score]) => ({
      subject,
      score: Number(score.toFixed(2)),
    }))

  const formatAttendanceDistribution = (data) =>
    Object.entries(data).map(([range, count]) => ({
      range: String(range),
      count,
    }))

  const formatPassFailDistribution = (data) =>
    Object.entries(data).map(([result, count]) => ({
      name: result,
      value: count,
    }))

  const formatSubjectComparison = (data) =>
    Object.entries(data).map(([subject, scores]) => ({
      subject,
      student: scores.student,
      average: scores.average,
    }))

  const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28', '#FF8042']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          Loading analytics data...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-800 dark:text-white text-center"
      >
        {isIndividual ? `${analyticsData?.student_info?.name}'s Performance Analytics` : 'Performance Analytics'}
      </motion.h1>

      {isIndividual && analyticsData && (
        <>
          {/* Student Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Student ID</h3>
                <p className="text-blue-600 dark:text-blue-300">{analyticsData.student_info.id}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200">Prediction</h3>
                <p className="text-green-600 dark:text-green-300">
                  {analyticsData.prediction.result} ({analyticsData.prediction.score.toFixed(2)})
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200">Attendance</h3>
                <p className="text-purple-600 dark:text-purple-300">
                  {analyticsData.attendance_comparison.student}% (Avg: {analyticsData.attendance_comparison.average.toFixed(1)}%)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Performance Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Performance Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatPerformanceTrend(analyticsData.performance_trend)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Subject Comparison Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Subject Performance Comparison
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={formatSubjectComparison(analyticsData.subject_comparison)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Student"
                  dataKey="student"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Class Average"
                  dataKey="average"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Individual Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Detailed Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(analyticsData.individual_performance).map(([key, value]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Class Avg: {analyticsData.class_averages[key].toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance vs Class Average Scatter Plot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Performance vs Class Average
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="average" name="Class Average" />
                <YAxis type="number" dataKey="student" name="Student Score" />
                <ZAxis type="number" dataKey="difference" name="Difference" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Subject Comparison" data={formatSubjectComparison(analyticsData.subject_comparison)} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}

      {!isIndividual && analyticsData && (
        <>
          {/* Performance Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Performance Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={formatPerformanceTrend(analyticsData.performance_trend)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Subject Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Subject Scores
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={formatSubjectScores(analyticsData.subject_scores)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Attendance Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Attendance Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={formatAttendanceDistribution(
                  analyticsData.attendance_distribution
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pass/Fail Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Pass/Fail Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatPassFailDistribution(
                    analyticsData.pass_fail_distribution
                  )}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatPassFailDistribution(
                    analyticsData.pass_fail_distribution
                  ).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Analytics