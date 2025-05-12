# HBRS GO

A comprehensive student portal for Hochschule Bonn-Rhein-Sieg University of Applied Sciences, providing access to mensa menus, timetables, and student services.

## Features

- 📱 Responsive mobile-first interface
- 🍽️ Live mensa menu updates from the Studierendenwerk
- 📅 Student timetable integration
- 🌐 Multilingual support (English/German)
- 🌓 Dark/light mode
- 📚 Library services access

## Stack

- **Frontend**: Next.js with TypeScript
- **UI**: Tailwind CSS and Shadcn/UI components
- **Backend**: Node.js Express server with Python integration
- **Mensa Integration**: Custom Python scraper for Studierendenwerk Bonn

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.13
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Arnold-Dsouza/HBRS-GO.git
cd HBRS-GO

# Install dependencies
npm install
pip install -r requirements.txt

# Run development server
cd frontend
node server.js
```

In a separate terminal:
```bash
# Run frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Deployment

The application is configured for deployment on Render:

- API server: Mensa data and backend services
- Next.js frontend: React UI components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.