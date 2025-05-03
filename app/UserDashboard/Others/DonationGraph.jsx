"use client";
import React from 'react'
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar ,Doughnut} from 'react-chartjs-2'
import DonationData from './DonationData.json'

const DonationGraph = () => {

  return (
    <>
      <div className='w-full'>
        <Bar
          data={{
            labels: DonationData.map((data) => data.Orgination),
            datasets: [
              {
                label: "Donation Amount",
                data: DonationData.map((data) => data.Value),
                borderWidth: 1,
                backgroundColor:[
                  "rgba(66, 165, 245, 1)",
                  "rgba(102, 187, 106, 1)",
                  "rgba(92, 107, 192, 1)"
                ]
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Donation Graph', 
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Organizations', 
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Donation Value (in USD)',
                },
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </>
  )
}

export default DonationGraph