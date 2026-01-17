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

A live version of the project is deployed:

[**SwiftCause**](https://swiftcause--swiftcause-app.us-east4.hosted.app/)

## 🛠️ Tech Stack

This project uses a modern architecture with a Next.js frontend and a Firebase backend.

| Area | Technology | Badge |
| :--- | :--- | :--- |
| **Framework** | Next.js | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) |
| **Frontend** | React 19 | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) |
| **Language** | TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| **Styling** | Tailwind CSS 4 | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%231572B6.svg?style=for-the-badge&logo=tailwindcss&logoColor=white) |
| **UI Components** | Radix UI | ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radix-ui&logoColor=white) |
| **Icons** | Lucide React | ![Lucide](https://img.shields.io/badge/Lucide-222222?logo=lucide&logoColor=white) |
| **Charts** | Recharts | ![Recharts](https://img.shields.io/badge/Recharts-232F3E?logo=recharts&logoColor=white) |
| **Notifications** | Sonner | ![Sonner](https://img.shields.io/badge/Sonner-87CEEB?logo=sonner&logoColor=white) |
| **Backend** | Firebase 11 | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black) |
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
* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) package manager
* [Firebase CLI](https://firebase.google.com/docs/cli) (for backend functions)

You will also need accounts and API keys for:
* Firebase account and API keys
* Stripe account and publishable key

### Environment Setup

This project requires environment variables for its services.

1.  Create a `.env.local` file in the root directory.
2.  Copy the contents of `.env.example` (if available) or add the following keys. You must get these values from your service provider dashboards (Firebase, Stripe).

    ```bash
    # Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY

    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YNVSolutions/SwiftCause_Web.git
    cd SwiftCause_Web
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    *or if using pnpm:*
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your Firebase and Stripe credentials as shown in the [Environment Setup](#environment-setup) section.

### Running Locally

Start the development server:

```bash
npm run dev
```
*or if using pnpm:*
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

**Note:** If you're using Firebase Cloud Functions for the backend, you may need to run the Firebase emulator in a separate terminal:

```bash
cd backend/functions
npm install
cd ../..
firebase emulators:start
```


## 🤝 Contributing

Contributions are welcome! If you'd like to help improve SwiftCause, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes, adhering to the [FSD Architecture](docs/FSD_ARCHITECTURE.md).
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## Visual Studio Code 

You would need to have the latest version of [VS Code](https://code.visualstudio.com) installed.

For Next.js debugging in VS Code, you can use the built-in Node.js debugger. Add the block below to your `launch.json` file inside the `.vscode` folder in your app's root directory.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"],
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

Start debugging in VS Code by pressing `F5` or by clicking the green debug icon. You can now write code, set breakpoints, make changes to the code, and debug your newly modified code—all from your editor.


## Supported Browsers

By default, the generated project uses the latest version of React 19 and Next.js 16.

You can refer [to the React documentation](https://react.dev/learn) for more information about supported browsers.

## Styling with Tailwind CSS

This project uses Tailwind CSS v4.0 for styling. The configuration is already set up in `tailwind.config.js` with custom colors, border radius, and other design tokens.

**Developer Recommendations:**
* Use [Prettier](https://prettier.io/) for code formatting.
* Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension for VS Code.
* Install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension for VS Code for better code quality.
* Before starting work, please create and/or assign an issue to yourself.

## ©️ License

This project is distributed under the license found in the `LICENCE` file.

## 👥 Authors

* [Dharmandra Singh](https://github.com/dp-singh)
* [Yash Raghuvanshi](https://github.com/Yashraghuvans)
* [Jitesh Singh](https://github.com/CodrJitesh)
