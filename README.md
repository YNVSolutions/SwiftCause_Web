![logo](https://github.com/YNVSolutions/SwiftCause_Web/blob/main/logo.png)

# Swift Cause

Modern Donation Platform for UK-Based Nonprofits 

[Vercel](https://swift-cause-web.vercel.app)

## Tech Stack

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) 
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%231572B6.svg?style=for-the-badge&logo=tailwindcss&logoColor=white) 
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)


## Author

* [Dharmandra Singh](https://github.com/dp-singh) 
* [Shipra Rawat](https://github.com/rwt-shipra)
* [Manav](https://github.com/Manav0501) 
* [Yash Raghuvanshi](https://github.com/Yashraghuvans) 
* [Jitesh Singh](https://github.com/CodrJitesh)
* [Priya Singh](https://github.com/1993Pri)

## Setup

## Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Yashraghuvans/SwiftCause.git
cd SwiftCause
```

### 2. Install Dependencies

```bash

npm install


cd functions
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory with your environment variables.


### 4. Firebase Setup

#### 4.1 Login to Firebase

```bash
firebase login
```

#### 4.2 Set Firebase Project

```bash
firebase use swiftcause-app
```

#### 4.3 Deploy Firebase Functions

```bash

firebase deploy --only functions
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

## 🧪 Testing the Application

Use these Stripe test card numbers:

| Card Type | Number | Expected Result |
|-----------|--------|-----------------|
| **Success** | `4242 4242 4242 4242` | Payment succeeds |
| **Decline** | `4000 0000 0000 0002` | Payment declined |
| **Insufficient Funds** | `4000 0000 0000 9995` | Insufficient funds |
| **Expired Card** | `4000 0000 0000 0069` | Expired card error |

**Test Card Details:**
- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)


### Build for Production

```bash
npm run build

firebase deploy --only hosting
```

## 📁 Project Structure

```
SwiftCause/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── features/           # Feature-based modules
│   ├── providers/          # Context providers
│   ├── lib/               # Utility libraries
│   └── App.tsx            # Main application component
├── functions/              # Firebase Functions
│   ├── src/               # TypeScript source
│   ├── package.json       # Functions dependencies
│   └── tsconfig.json      # TypeScript config
├── public/                # Static assets
├── dist/                  # Build output
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project settings
└── package.json          # Frontend dependencies
```




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

## Recommendations 

1. You may use the extension Draw.io Integration on VScode to view the .drawio file.
2. Prettier formatter recommended for code formatting.
3. Use Tailwind CSS IntelliSense extension for Tailwind suggestions while coding.
4. The project is using the latest versions of all the libraries mentioned above.
5. Create and/or assign an issue to yourself before working on any feature.
