'use client'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import type { GoldPrice } from '@server/interface/goldInterface'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function GoldChartPage() {
  const [goldData, setGoldData] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGold = async () => {
      try {
        const data = await res.json()

        if (data.success) {
          setGoldData(data.data)
        } else {
          console.error('Error:', data.message)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGold()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
              ⚡ Albion Online Gold Market ⚡
            </h1>
            <p className="text-slate-300 text-xl font-medium">Professional Trading Dashboard</p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Loading Container */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl blur opacity-25 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl border border-slate-600 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-800/30 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-800/30 rounded-lg w-1/2"></div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400/20 border-t-yellow-400 mx-auto mb-6"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-yellow-400/40 mx-auto"></div>
                  </div>
                  <p className="text-slate-300 text-xl font-medium mb-2">Loading chart data...</p>
                  <p className="text-slate-400 text-sm">Fetching real-time market data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!goldData || goldData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
              ⚡ Albion Online Gold Market ⚡
            </h1>
            <p className="text-slate-300 text-xl font-medium">Professional Trading Dashboard</p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Error Container */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-3xl blur opacity-25"></div>
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl border border-red-600/50 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 p-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-900 rounded-xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">No Gold Price Data</h2>
                    <p className="text-gray-800 font-medium">Unable to load market data</p>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="mb-6">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-red-400 text-xl font-bold mb-2">Data Unavailable</p>
                  <p className="text-slate-400 text-sm mb-6">Please check your connection and try again</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-600 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-700 transition-all duration-200 shadow-lg"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: goldData.map((item) => new Date(item.timestamp).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })),
    datasets: [
      {
        label: 'Gold Price',
        data: goldData.map((item) => item.price),
        fill: true,
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f1f5f9',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#fbbf24',
        bodyColor: '#f1f5f9',
        borderColor: '#fbbf24',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: any) => `Price: ${context.parsed.y.toLocaleString()} Gold`,
          title: (context: any) => `Time: ${context[0].label}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 12,
          },
          callback: function (value: any) {
            return value.toLocaleString() + ' Gold'
          },
        },
        title: {
          display: true,
          text: 'Price (Gold)',
          color: '#fbbf24',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 11,
          },
          maxTicksLimit: 8,
        },
        title: {
          display: true,
          text: 'Time',
          color: '#fbbf24',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
            ⚡ Albion Online Gold Market ⚡
          </h1>
          <p className="text-slate-300 text-xl font-medium">Professional Trading Dashboard</p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Chart Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl border border-slate-600 overflow-hidden backdrop-blur-sm">

            {/* Chart Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-900 rounded-xl shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gold Price Chart</h2>
                    <p className="text-gray-800 font-medium">Real-time market analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {goldData.length > 0 ? goldData[goldData.length - 1].price.toLocaleString() : '---'}
                  </div>
                  <div className="text-sm text-gray-800 font-medium">Current Price</div>
                </div>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
                <div className="h-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-amber-600/5 rounded-2xl"></div>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm">Highest Price</p>
                      <p className="text-white text-xl font-bold">
                        {goldData.length > 0 ? Math.max(...goldData.map(item => item.price)).toLocaleString() : '---'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm">Lowest Price</p>
                      <p className="text-white text-xl font-bold">
                        {goldData.length > 0 ? Math.min(...goldData.map(item => item.price)).toLocaleString() : '---'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm">Data Points</p>
                      <p className="text-white text-xl font-bold">{goldData.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}