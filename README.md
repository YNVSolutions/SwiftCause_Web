![logo](https://github.com/Yashraghuvans/SwiftCause/blob/main/public/banner.png)

# Swift Cause

Modern Donation Platform for Nonprofits

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
* [Manav](https://github.com/Manav0501) 
* [Yash Raghuvanshi](https://github.com/Yashraghuvans) 
* [Jitesh Singh](https://github.com/CodrJitesh)
* [Priya Singh](https://github.com/1993Pri)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Yashraghuvans/SwiftCause.git
    cd SwiftCause
    ```

2.  **Install dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    Using pnpm:

    ```bash
    pnpm install
    ```

## Run Locally

1.  **Start the development server:**

    Using npm:

    ```bash
    npm run dev
    ```

    Using pnpm:

    ```bash
    pnpm dev
    ```

2.  **Open your browser:**

    Navigate to `http://localhost:3000` to view the application.


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
