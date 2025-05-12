# HBRS GO Application

A full-stack application for managing and displaying HBRS information.

## Project Structure

```
├── frontend/               # Next.js frontend application
│   ├── pages/             # Next.js pages
│   ├── public/            # Static assets
│   ├── src/              # Source code
│   └── tests/            # Test files
├── BackEnd/              # Python backend
│   └── Sankt_Augustin_mensa/  # Backend services
├── src/                  # Shared source code
│   ├── app/             # Application code
│   └── services/        # Shared services
└── Procfile             # Heroku deployment configuration
```

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Heroku CLI (for deployment)

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the BackEnd directory:
   ```bash
   cd BackEnd
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python app.py
   ```

## Deployment

The application is configured for Heroku deployment. The `Procfile` contains the necessary configuration for both frontend and backend services.

### Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=production
```

## Development

- Frontend runs on port 9002 in development
- Backend runs on port 5000 in development
- Use `npm run build` to build the frontend for production
- Use `npm start` to start the frontend in production mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Developer
Arnold Dsouza - arnolddsouza1999@gmail.com 