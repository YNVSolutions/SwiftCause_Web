import React from 'react'
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DonationDistrbution = () => {
    const donationDistributionData = {
        labels: ['£0 - £99', '£100 - £199', '£200 - £299', '£300 - £399', '£400+'],
        datasets: [
            {
                label: 'Amount',
                data: [500, 4600, 4600, 7000, 8400],
                backgroundColor: '#14b8a6',
                borderRadius: 5,
            },
        ],
    };
    const formatCurrency = (amount) => `£${amount.toLocaleString()}`;
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-400 mb-4">Donation Distribution</h2>
            <div className="relative h-56">
                <Bar
                    data={donationDistributionData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                type: 'category',
                                ticks: { color: '#6b7280' },
                                grid: { color: '#4b5563', drawBorder: false },
                            },
                            y: {
                                ticks: { color: '#6b7280', beginAtZero: true, callback: (value) => (value > 0 ? `${value / 1000}k` : '0') },
                                grid: { color: '#4b5563', drawBorder: false },
                            },
                        },
                    }}
                />
            </div>
        </div>
    )
}

export default DonationDistrbution