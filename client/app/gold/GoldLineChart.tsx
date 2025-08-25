'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

// register เฉพาะที่ต้องใช้
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function GoldLineChart({ data, options }: { data: ChartData<'line'>; options: ChartOptions<'line'> }) {
  return <Line data={data} options={options} />
}