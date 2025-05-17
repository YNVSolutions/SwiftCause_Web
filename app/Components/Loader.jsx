import React from 'react';

const Loader = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-18 h-18">
      <div className="banter-loader">
        {[...Array(9)].map((_, index) => (
          <div key={index} className={`banter-loader__box box-${index + 1}`} />
        ))}
      </div>
      <style type="text/css">
        {`
          .banter-loader {
            width: 72px;
            height: 72px;
          }

          .banter-loader__box {
            float: left;
            position: relative;
            width: 20px;
            height: 20px;
            margin-right: 6px;
          }

          .banter-loader__box::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: #fff; /* You can change the color here */
          }

          .banter-loader__box:nth-child(3n) {
            margin-right: 0;
            margin-bottom: 6px;
          }

          .banter-loader__box:nth-child(1)::before,
          .banter-loader__box:nth-child(4)::before {
            margin-left: 26px;
          }

          .banter-loader__box:nth-child(3)::before {
            margin-top: 52px;
          }

          .banter-loader__box:last-child {
            margin-bottom: 0;
          }

          @keyframes moveBox-1 {
            9.09% {
              transform: translate(-26px, 0);
            }
            18.18% {
              transform: translate(0, 0);
            }
            27.27% {
              transform: translate(0, 0);
            }
            36.36% {
              transform: translate(26px, 0);
            }
            45.45% {
              transform: translate(26px, 26px);
            }
            54.55% {
              transform: translate(26px, 26px);
            }
            63.64% {
              transform: translate(26px, 26px);
            }
            72.73% {
              transform: translate(26px, 0);
            }
            81.82% {
              transform: translate(0, 0);
            }
            90.91% {
              transform: translate(-26px, 0);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-1 {
            animation: moveBox-1 4s infinite;
          }

          @keyframes moveBox-2 {
            9.09% {
              transform: translate(0, 0);
            }
            18.18% {
              transform: translate(26px, 0);
            }
            27.27% {
              transform: translate(0, 0);
            }
            36.36% {
              transform: translate(26px, 0);
            }
            45.45% {
              transform: translate(26px, 26px);
            }
            54.55% {
              transform: translate(26px, 26px);
            }
            63.64% {
              transform: translate(26px, 26px);
            }
            72.73% {
              transform: translate(26px, 26px);
            }
            81.82% {
              transform: translate(0, 26px);
            }
            90.91% {
              transform: translate(0, 26px);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-2 {
            animation: moveBox-2 4s infinite;
          }

          @keyframes moveBox-3 {
            9.09% {
              transform: translate(-26px, 0);
            }
            18.18% {
              transform: translate(-26px, 0);
            }
            27.27% {
              transform: translate(0, 0);
            }
            36.36% {
              transform: translate(-26px, 0);
            }
            45.45% {
              transform: translate(-26px, 0);
            }
            54.55% {
              transform: translate(-26px, 0);
            }
            63.64% {
              transform: translate(-26px, 0);
            }
            72.73% {
              transform: translate(-26px, 0);
            }
            81.82% {
              transform: translate(-26px, -26px);
            }
            90.91% {
              transform: translate(0, -26px);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-3 {
            animation: moveBox-3 4s infinite;
          }

          @keyframes moveBox-4 {
            9.09% {
              transform: translate(-26px, 0);
            }
            18.18% {
              transform: translate(-26px, 0);
            }
            27.27% {
              transform: translate(-26px, -26px);
            }
            36.36% {
              transform: translate(0, -26px);
            }
            45.45% {
              transform: translate(0, 0);
            }
            54.55% {
              transform: translate(0, -26px);
            }
            63.64% {
              transform: translate(0, -26px);
            }
            72.73% {
              transform: translate(0, -26px);
            }
            81.82% {
              transform: translate(-26px, -26px);
            }
            90.91% {
              transform: translate(-26px, 0);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-4 {
            animation: moveBox-4 4s infinite;
          }

          @keyframes moveBox-5 {
            9.09% {
              transform: translate(0, 0);
            }
            18.18% {
              transform: translate(0, 0);
            }
            27.27% {
              transform: translate(0, 0);
            }
            36.36% {
              transform: translate(26px, 0);
            }
            45.45% {
              transform: translate(26px, 0);
            }
            54.55% {
              transform: translate(26px, 0);
            }
            63.64% {
              transform: translate(26px, 0);
            }
            72.73% {
              transform: translate(26px, 0);
            }
            81.82% {
              transform: translate(26px, -26px);
            }
            90.91% {
              transform: translate(0, -26px);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-5 {
            animation: moveBox-5 4s infinite;
          }

          @keyframes moveBox-6 {
            9.09% {
              transform: translate(0, 0);
            }
            18.18% {
              transform: translate(-26px, 0);
            }
            27.27% {
              transform: translate(-26px, 0);
            }
            36.36% {
              transform: translate(0, 0);
            }
            45.45% {
              transform: translate(0, 0);
            }
            54.55% {
              transform: translate(0, 0);
            }
            63.64% {
              transform: translate(0, 0);
            }
            72.73% {
              transform: translate(0, 26px);
            }
            81.82% {
              transform: translate(-26px, 26px);
            }
            90.91% {
              transform: translate(-26px, 0);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-6 {
            animation: moveBox-6 4s infinite;
          }

          @keyframes moveBox-7 {
            9.09% {
              transform: translate(26px, 0);
            }
            18.18% {
              transform: translate(26px, 0);
            }
            27.27% {
              transform: translate(26px, 0);
            }
            36.36% {
              transform: translate(0, 0);
            }
            45.45% {
              transform: translate(0, -26px);
            }
            54.55% {
              transform: translate(26px, -26px);
            }
            63.64% {
              transform: translate(0, -26px);
            }
            72.73% {
              transform: translate(0, -26px);
            }
            81.82% {
              transform: translate(0, 0);
            }
            90.91% {
              transform: translate(26px, 0);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-7 {
            animation: moveBox-7 4s infinite;
          }

          @keyframes moveBox-8 {
            9.09% {
              transform: translate(0, 0);
            }
            18.18% {
              transform: translate(-26px, 0);
            }
            27.27% {
              transform: translate(-26px, -26px);
            }
            36.36% {
              transform: translate(0, -26px);
            }
            45.45% {
              transform: translate(0, -26px);
            }
            54.55% {
              transform: translate(0, -26px);
            }
            63.64% {
              transform: translate(0, -26px);
            }
            72.73% {
              transform: translate(0, -26px);
            }
            81.82% {
              transform: translate(26px, -26px);
            }
            90.91% {
              transform: translate(26px, 0);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-8 {
            animation: moveBox-8 4s infinite;
          }

          @keyframes moveBox-9 {
            9.09% {
              transform: translate(-26px, 0);
            }
            18.18% {
              transform: translate(-26px, 0);
            }
            27.27% {
              transform: translate(0, 0);
            }
            36.36% {
              transform: translate(-26px, 0);
            }
            45.45% {
              transform: translate(0, 0);
            }
            54.55% {
              transform: translate(0, 0);
            }
            63.64% {
              transform: translate(-26px, 0);
            }
            72.73% {
              transform: translate(-26px, 0);
            }
            81.82% {
              transform: translate(-52px, 0);
            }
            90.91% {
              transform: translate(-26px, 0);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          .box-9 {
            animation: moveBox-9 4s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Loader;