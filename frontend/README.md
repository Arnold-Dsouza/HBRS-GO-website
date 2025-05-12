# HBRS Student Portal

A modern, responsive web application for students at Hochschule Bonn-Rhein-Sieg University of Applied Sciences.

## Features

- **Authentication System**: Simple email-based sign in/sign up
- **Dashboard**: Overview of important student information
- **Grades**: View and track academic performance
- **Timetable**: Class schedule management
- **Library**: Access library resources and book availability
- **Cafeteria Menu**: Daily food options
- **Deutschland-Semesterticket**: Information about student transportation
- **Student Services**: Access to various university services
- **Settings**:
  - Profile management
  - Theme customization (light/dark mode)
  - Language selection (English/German)
  - App updates

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: Custom components with [Tailwind CSS](https://tailwindcss.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context
- **Internationalization**: Custom implementation with JSON locale files

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd HBRS
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/              # Next.js application routes
│   ├── (app)/        # Protected application routes
│   ├── signin/       # Authentication pages
│   └── signup/
├── components/       # Reusable UI components
│   └── ui/           # Core UI components
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── locales/          # Internationalization files
└── services/         # API and service functions
```

## Authentication

The application uses a simplified authentication system that stores user information in the browser's local storage for demonstration purposes.

To sign in:
- Enter any email address
- Optionally, provide your name
- No password required (for demo purposes)

## Internationalization

The application supports English and German languages. Language settings can be changed in the Settings page.

## Design System

The application uses a consistent design system built on Tailwind CSS with custom UI components.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.