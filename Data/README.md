# DataScience Academy

A professional and job-ready educational Progressive Web App (PWA) focused on Data Science learning through video lectures, simulators, and real projects.

## Features

### Student Features
- **Dashboard**: View profile, progress, and statistics
- **Topics**: Browse available course topics
- **Video Lectures**: Watch embedded YouTube/Vimeo videos with progress tracking
- **Practice Simulators**: Code editor for practicing Python, SQL, and ML models
- **Project Lab**: View and submit data science projects
- **Certificates**: Earn and view completion certificates
- **Leaderboard**: Compete with other students
- **AI Mentor**: Chatbot assistant for Data Science questions

### Admin Features
- **Admin Dashboard**: Overview of platform statistics
- **Lecture Management**: Add, edit, and delete topics and video lectures
- **Student Management**: View student progress and export data
- **Project Management**: Add and manage projects

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI**: Modern dark theme with orange accents (#DC4D01)
- **Icons**: Lucide React
- **Video Player**: React Player

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Data
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config to `src/firebase/config.js`

4. Update Firebase Configuration:
   Edit `src/firebase/config.js` with your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Create Admin Account:
   - Sign up with email: `datascience1424@gmail.com`
   - Password: `Science@1424`
   - Or use Firebase Console to create this user manually

## Running the Application

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable components
├── firebase/           # Firebase configuration
├── layouts/            # Layout components (Student, Admin)
├── pages/
│   ├── admin/         # Admin panel pages
│   ├── student/       # Student pages
│   └── Login.jsx      # Login page
├── App.jsx            # Main app component with routing
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Database Structure

### Collections

#### lectures
```javascript
{
  topic_id: string,
  topic_name: string,
  total_videos: number,
  video_links: [{ title: string, url: string }],
  description: string,
  createdAt: string
}
```

#### students
```javascript
{
  student_id: string,
  name: string,
  email: string,
  completed_videos: number,
  xp_points: number,
  completed_videos_by_topic: { [topicId]: number[] },
  certificates: [{ course_name: string, date_issued: string }],
  createdAt: string
}
```

#### projects
```javascript
{
  project_id: string,
  title: string,
  description: string,
  difficulty: string,
  dataset_link: string,
  status: string,
  createdAt: string
}
```

## Admin Credentials

- **Email**: datascience1424@gmail.com
- **Password**: Science@1424

## Sample Data

After setting up Firebase, you can add sample data through the admin panel:
1. Login as admin
2. Go to "Lectures" section
3. Click "Add New Topic"
4. Add topics like "Statistics", "Machine Learning", "Deep Learning", etc.
5. Add video URLs (YouTube/Vimeo links)

## Features in Detail

### Video Progress Tracking
- Automatically tracks which videos students have completed
- Updates XP points when videos are finished
- Shows progress percentage per topic

### Gamification
- XP points for completing videos
- Leaderboard ranking
- Certificate generation upon course completion

### AI Mentor
- Placeholder for Gemini API integration
- Responds to Data Science related questions
- Filters out-of-scope questions

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Collapsible sidebar navigation
- Modern dark theme with orange accents

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

1. Build the project: `npm run build`
2. Deploy `dist` folder to your hosting service (Firebase Hosting, Vercel, Netlify, etc.)

For Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## License

This project is created for educational purposes.

## Support

For issues or questions, please open an issue in the repository.
