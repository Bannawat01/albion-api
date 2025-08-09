'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function GoldChartPage() {
  const [goldData, setGoldData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGold = async () => {
      try {
        const res = await fetch('https://localhost:8800/api/gold?count=10');
        const data = await res.json();

        if (data.success) {
          setGoldData(data.data);
        } else {
          console.error('Error:', data.message);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGold();
  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-8">กำลังโหลดข้อมูลกราฟ...</p>;

  if (!goldData || goldData.length === 0)
    return <p className="text-center text-red-500 mt-8">ไม่มีข้อมูลราคาทอง</p>;

  const chartData = {
    labels: goldData.map((item) => item.date),
    datasets: [
      {
        label: 'ราคาทอง (gold)',
        data: goldData.map((item) => item.price),
        fill: false,
        borderColor: 'gold',
        backgroundColor: 'orange',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `ราคา: ${context.parsed.y} gold`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'gold',
        },
      },
      x: {
        title: {
          display: true,
          text: 'เวลา',
        },
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span role="img" aria-label="bar chart">📊</span>
        กราฟราคาgold
      </h1>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}