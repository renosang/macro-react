import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './AnalyticsDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [topMacros, setTopMacros] = useState<any[]>([]);
  const [leastUsedMacros, setLeastUsedMacros] = useState<any[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<any[]>([]);
  const [usageOverTime, setUsageOverTime] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState('month');

  useEffect(() => {
    fetch(`/api/analytics/top-macros?period=${timePeriod}`).then(res => res.json()).then(setTopMacros);
    fetch('/api/analytics/least-used-macros').then(res => res.json()).then(setLeastUsedMacros);
    fetch('/api/analytics/category-usage').then(res => res.json()).then(setCategoryUsage);
    fetch('/api/analytics/usage-over-time').then(res => res.json()).then(setUsageOverTime);
  }, [timePeriod]);

  const categoryChartData = {
    labels: categoryUsage.map(c => c.name),
    datasets: [{
      label: 'Số lượt sử dụng',
      data: categoryUsage.map(c => c.count),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };
  
  const usageOverTimeChartData = {
    labels: usageOverTime.map(u => u.date),
    datasets: [{
      label: 'Số lượt sao chép hàng ngày',
      data: usageOverTime.map(u => u.count),
      fill: false,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
    }],
  };


  return (
    <div className="analytics-dashboard">
      <h1>Bảng điều khiển phân tích</h1>
      
      <div className="analytics-grid">
        <div className="chart-container card">
          <h3>Thống kê sử dụng theo Danh mục</h3>
          <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        
        <div className="chart-container card wide">
          <h3>Lượt sử dụng trong 30 ngày qua</h3>
          <Line data={usageOverTimeChartData} options={{ responsive: true, maintainAspectRatio: false }}/>
        </div>

        <div className="list-container card">
          <h3>
            Top 10 Macro được dùng nhiều nhất
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option value="month">Tháng này</option>
              <option value="week">Tuần này</option>
            </select>
          </h3>
          <ol>
            {topMacros.map(macro => (
              <li key={macro._id}>
                <span>{macro.title}</span>
                <span className="count-badge">{macro.count}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="list-container card">
          <h3>Macro ít được sử dụng nhất</h3>
          <ol>
            {leastUsedMacros.map(macro => (
              <li key={macro._id}>
                <span>{macro.title}</span>
                <span className="count-badge">{macro.useCount}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;