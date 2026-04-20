# Heidrun's Ledger

  A personal mead brewing tracker. Track batches from first pour to final glass — log gravity readings, feedings,
  ingredients, notes, and alerts across your active batches.

  ![Angular](https://img.shields.io/badge/Angular-20-dd0031?style=flat-square)
  ![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)

  ---

  ## Pages

  ### Dashboard
  Here you can keep track of all your mead batches.  
  Shows a simple list of batches.  
  Has counts for active, near target abv, and for alerts.  
  *( Alerts are not fully implemented yet )*

  ### Batches
  Batches gives you a list of all your batches with a little more info.  
  This page also groups your batches by status.  

  ### Batch Detail
  This is the page you see when you tap on a batch from any page.  
  This page is where you can see all information about your batch.  
  If a feeding, gravity reading, or ingredient has notes entered, there will be a  
  hightlight on the entry and if you tap it, it will expand so you can see your note.  
  You can set the status, add feedings, add gravity readings, add ingredients, Notes, and alerts.  
  *( Alerts are not fully implemented yet )*

  ---

  ## Getting Started

  ### Prerequisites

  | Tool | Version |
  |---|---|
  | Node.js | 18+ |
  | Angular CLI | `npm install -g @angular/cli` |
  | Firebase Account | [console.firebase.google.com](https://console.firebase.google.com) |

  ### Installation

  ```bash
  git clone https://github.com/xRuhRohx/heidruns-ledger.git
  cd heidruns-ledger
  npm install

  ---
  Firebase Setup

  1. Create a Firebase Project

  - Go to https://console.firebase.google.com and create a new project
  - Enable Google Authentication under Authentication → Sign-in method
  - Create a Firestore database in production mode (nam5 region recommended)
  - Go to Project Settings and copy your Firebase config

  2. Environment File

  Create src/environments/environment.ts:

  export const environment = {
    production: false,
    firebase: {
      apiKey: 'your-api-key',
      authDomain: 'your-app.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-app.firebasestorage.app',
      messagingSenderId: 'your-sender-id',
      appId: 'your-app-id'
    },
    allowedUid: 'your-firebase-uid'
  };

  ▎ Your Firebase UID can be found in Firebase Console → Authentication → Users after signing in once.

  3. Firestore Security Rules

  In Firebase Console → Firestore → Rules:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null
                           && request.auth.uid == 'your-firebase-uid';
      }
    }
  }

  4. Firestore Indexes

  The following composite indexes are required. Create them in Firebase Console → Firestore → Indexes:

  ┌─────────────────┬─────────────┬───────────────────┐
  │   Collection    │   Field 1   │      Field 2      │
  ├─────────────────┼─────────────┼───────────────────┤
  │ feedings        │ batchId ASC │ feedingNumber ASC │
  ├─────────────────┼─────────────┼───────────────────┤
  │ gravityReadings │ batchId ASC │ date ASC          │
  ├─────────────────┼─────────────┼───────────────────┤
  │ batchNotes      │ batchId ASC │ createdAt ASC     │
  ├─────────────────┼─────────────┼───────────────────┤
  │ alerts          │ batchId ASC │ dueDate ASC       │
  ├─────────────────┼─────────────┼───────────────────┤
  │ ingredients     │ batchId ASC │ addedDate ASC     │
  └─────────────────┴─────────────┴───────────────────┘

  ▎ When you first run the app, Firestore will display console links to create any missing indexes automatically. Click
  ▎ them as they appear.

  ---
  Running Locally

  ng serve

  Navigate to http://localhost:4200

  ---
  Building for Production

  ng build

  Output is in dist/heidruns-ledger/browser/. Deploy the contents of that folder to your web host.

  Apache Routing

  Add a .htaccess file alongside index.html for Angular client-side routing:

  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]

  ---
  Tech Stack

  ┌───────────┬───────────────────────────────────┐
  │   Layer   │            Technology             │
  ├───────────┼───────────────────────────────────┤
  │ Framework │ Angular 20 (Zoneless, Standalone) │
  ├───────────┼───────────────────────────────────┤
  │ Language  │ TypeScript                        │
  ├───────────┼───────────────────────────────────┤
  │ Database  │ Firebase Firestore                │
  ├───────────┼───────────────────────────────────┤
  │ Auth      │ Firebase Authentication (Google)  │
  ├───────────┼───────────────────────────────────┤
  │ Styling   │ SCSS with CSS custom properties   │
  ├───────────┼───────────────────────────────────┤
  │ State     │ Angular Signals                   │
  └───────────┴───────────────────────────────────┘
```
