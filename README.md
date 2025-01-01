# Teneo Community Node Script

Script to automatically farm teneo points 24/7

## Features

- Automated login
- Login using `Email and Password` or `Access Token`
- Real-time balance monitoring
- Express server for status monitoring

## Prerequisites

- Node.js (Target Ver.: v22, Min.: v14)
- npm (Node Package Manager) or yarn (Yarn Package Manager)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/lester51/teneo-node-script.git
   cd teneo-node-script
   ```

2. Install dependencies:

   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Set up the environment variables:
   - Copy the `.env_token_example` or `.env_creds_example` file to `.env`:
     ```
     cp .env_token_example .env
     ```
   - Edit the `.env` file and replace test values with your actual credentials or tokens
   - Optionally, you can change the `PORT` if you want the server to run on a different port

## Usage

To start the Teneo Script:

```
npm start
```

For development with auto-restart on file changes:

```
npm run dev
```
## API Endpoints

- `GET /`: Returns a simple message indicating that the server is running
- `GET /login`: loginform to get your access token used for logging in without email and password

## Important Notes

- This tool is designed for educational purposes only. Use it responsibly and in accordance with the terms of service of the target website.
- Keep your information secure and do not share it with others.
- The tool uses a custom logging system. Check the console output for real-time updates and any error messages.

## License

This project is licensed under the MIT License.

## Author

[lester51](https://github.com/lester51)

## Disclaimer

This project is not affiliated with or endorsed by Teneo Community Node. Use at your own risk.
