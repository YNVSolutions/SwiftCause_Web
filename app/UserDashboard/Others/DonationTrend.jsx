import React from 'react'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DonationTrend = () => {
    const donationTrendData = {
        labels: ['13 Jan', '12 Feb', '22 Feb', '7 Mar', '9 Apr', '5 May', '30 May', '29 Jun', '30 Jul', '11 Aug', '14 Sept', '7 Oct', '31 Oct', '21 Dec'],
        datasets: [
            {
                label: 'Donations',
                data: [100, 600, 400, 700, 300, 650, 500, 200, 450, 750, 350, 550, 400, 600],
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
            },
        ],
    };
    const formatCurrency = (amount) => `£${amount.toLocaleString()}`;
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-400 mb-4">Donation Trend</h2>
            <div className="relative h-56">
                <Line
                    data={donationTrendData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                type: 'category',
                                ticks: { color: '#6b7280', autoSkip: true, maxRotation: 0 },
                                grid: { color: '#4b5563', drawBorder: false },
                            },
                            y: {
                                ticks: { color: '#6b7280', callback: (value) => `£${value > 1000 ? value / 1000 + 'k' : value}` },
                                grid: { color: '#4b5563', drawBorder: false },
                            },
                        },
                    }}
                />
            </div>
        </div>
    )
}

export default DonationTrend