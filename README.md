<div align="center">
  <img src="./logo.png" alt="SwiftCause Logo" width="250" height="250">

  <h1>SwiftCause</h1>

  <p>
    A modern, scalable donation platform for UK-based nonprofits.
  </p>

  <p>
    <a href="https://swift-cause-web.vercel.app"><img src="https://img.shields.io/badge/deployment-Vercel-black.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Deployment"></a>
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/firebase-%23FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
    <img src="https://img.shields.io/badge/stripe-%23626CD9.svg?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe">
  </p>

</div>

---

## ✨ Key Features

Based on the project structure, SwiftCause includes:

* **Nonprofit Campaign Management:** A full admin dashboard to create, edit, and manage fundraising campaigns.
* **Secure Payments:** Integration with Stripe for secure and reliable donation processing.
* **Analytics Dashboard:** A rich dashboard for visualizing donation data, device performance, and user metrics.
* **Kiosk Device Management:** Support for managing physical kiosk devices for in-person donations.
* **User & Auth Management:** Robust authentication and user management for admins and donors.

## 🚀 Live Demo

A live version of the project is deployed on Vercel:

[**https://swift-cause-web.vercel.app**](https://swift-cause-web.vercel.app)

## 🛠️ Tech Stack

This project uses a modern monorepo-like structure with a React/Vite frontend and a Firebase backend.

| Area | Technology | Badge |
| :--- | :--- | :--- |
| **Frontend** | React | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) |
| **Language** | TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| **Build Tool** | Vite | ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) |
| **Styling** | Tailwind CSS | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%231572B6.svg?style=for-the-badge&logo=tailwindcss&logoColor=white) |
| **UI Components** | Radix UI | ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radix-ui&logoColor=white) |
| **Backend** | Firebase | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black) |
| **Payments** | Stripe | ![Stripe](https://img.shields.io/badge/Stripe-626CD9?logo=stripe&logoColor=white) |
| **Deployment** | Vercel | ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) |
| **CI/CD** | GitHub Actions | ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white) |



## 🏛️ Architecture

This project implements **Feature-Sliced Design (FSD)**, a scalable and modular architectural methodology for frontend applications.

The code is organized into a clear hierarchy of layers, which enforces a one-way dependency rule (`app` → `pages` → `widgets` → `features` → `entities` → `shared`). This structure improves code organization, reusability, and makes the codebase easier to maintain and scale.

For a detailed explanation of the FSD structure and its implementation in this project, please read the full [**Architecture Documentation**](docs/FSD_ARCHITECTURE.md).

## 🏁 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

You must have the following tools installed:
* [Node.js](https://nodejs.org/) (v22 or later recommended)
* [pnpm](https://pnpm.io/) (or `npm`)
* [Firebase CLI](https://firebase.google.com/docs/cli) (for backend functions)

You will also need accounts and API keys for:
* Firebase
* Stripe

### Environment Setup

This project requires environment variables for its services.

1.  Create a `.env` file in the root directory.
2.  Copy the contents of `.env.example` (if available) or add the following keys. You must get these values from your service provider dashboards (Firebase, Supabase, Stripe).

    ```bash
    # Supabase
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # Stripe
    VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY

    # Firebase
    VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YNVSolutions/SwiftCause_Web.git](https://github.com/YNVSolutions/SwiftCause_Web.git)
    cd SwiftCause_Web
    ```

2.  **Install Frontend Dependencies:**
    (From the root directory)
    ```bash
    pnpm install
    ```
    *or*
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd backend/functions
    pnpm install
    ```
    *or*
    ```bash
    npm install
    ```

### Running Locally

You will need to run the frontend development server and the backend functions emulator in two separate terminals.

1.  **Terminal 1: Start the Frontend (Vite):**
    (From the root directory)
    ```bash
    pnpm dev
    ```
     *or*
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.


## 🤝 Contributing

Contributions are welcome! If you'd like to help improve SwiftCause, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes, adhering to the [FSD Architecture](docs/FSD_ARCHITECTURE.md).
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## Visual Studio Code 

You would need to have the latest version of [VS Code](https://code.visualstudio.com) and VS Code [Chrome Debugger Extension](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) installed.

Then add the block below to your `launch.json` file and put it inside the `.vscode` folder in your app’s root directory.

```json
{
  "version": "0.2.0",
  "configurations": [{
    "name": "Chrome",
    "type": "chrome",
    "request": "launch",
    "url": "http://localhost:3000",
    "webRoot": "${workspaceRoot}/src",
    "sourceMapPathOverrides": {
      "webpack:///src/*": "${webRoot}/*"
    }
  }]
}
```
>Note: the URL may be different if you've made adjustments via the [HOST or PORT environment variables](#advanced-configuration).

Start your app by running `npm start`, and start debugging in VS Code by pressing `F5` or by clicking the green debug icon. You can now write code, set breakpoints, make changes to the code, and debug your newly modified code—all from your editor.

Having problems with VS Code Debugging? Please see their [troubleshooting guide](https://github.com/Microsoft/vscode-chrome-debug/blob/master/README.md#troubleshooting).


## Supported Browsers

By default, the generated project usee the latest version of React.

You can refer [to the React documentation](https://react.dev/learn) for more information about supported browsers.

## Install TailwindCSS (v4.0)

1. Go to https://tailwindcss.com/
2. Get started
3. Under framework guides, select Next.js
4. Follow the steps mentioned there to start using TailwindCSS 

**Developer Recommendations:**
* Use [Prettier](https://prettier.io/) for code formatting.
* Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension for VS Code.
* Before starting work, please create and/or assign an issue to yourself.

## ©️ License

This project is distributed under the license found in the `LICENCE` file.

## 👥 Authors

* [Dharmandra Singh](https://github.com/dp-singh)
* [Yash Raghuvanshi](https://github.com/Yashraghuvans)
* [Jitesh Singh](https://github.com/CodrJitesh)
