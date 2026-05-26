# 🚑 MedRide – Passenger Emergency Response Network

## 📖 Project Overview

MedRide is a real-time emergency response and intelligent passenger alert system developed to improve road safety and emergency vehicle coordination.

The application uses live GPS tracking, Firebase real-time synchronization, push notifications, and Google Maps integration to provide direction-aware and proximity-based emergency alerts.

Unlike traditional emergency systems, MedRide alerts only relevant nearby users based on:
- Distance
- Vehicle movement direction
- Real-time emergency activity

This reduces unnecessary alerts and creates a smarter and more efficient emergency response ecosystem.

---

# 🚀 Features

## 👤 User Features

✅ Real-time emergency triggering  
✅ Live GPS location tracking  
✅ Direction-aware emergency alerts  
✅ Proximity-based alert system  
✅ Google Maps integration  
✅ Push notification support  
✅ Emergency status tracking  
✅ Live ambulance tracking  

---

## 🛡️ Admin Features

✅ Verify emergencies  
✅ Reject false emergencies  
✅ Monitor active emergency requests  
✅ View emergency map dashboard  
✅ Real-time emergency monitoring  

---

## 🏥 Hospital Features

✅ Receive verified emergency alerts  
✅ Dispatch ambulances  
✅ Monitor live emergency status  
✅ Real-time ambulance tracking  

---

# 🛠️ Technology Stack

## Frontend
- React Native
- Expo
- TypeScript

## Backend & Database
- Firebase Authentication
- Firebase Realtime Database

## Maps & Location
- Google Maps API
- Expo Location

## Notifications
- Expo Notifications
- Expo Device

---

# 📂 Project Structure

```bash
MedRide-Passenger_Emergency_Response_Network/
│
├── app/
│   ├── assets/
│   ├── src/
│   ├── app.json
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── diagrams/
│   ├── activity-diagram.png
│   ├── class-diagram.png
│   ├── dataflow-diagram.png
│   ├── sequence-diagram-1.png
│   ├── sequence-diagram-2.png
│   ├── system-architecture.png
│   └── use-case-diagram.png
│
├── README.md
└── .gitignore
```

---

# 🔧 Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/bhargavi-30-git/MedRide-Passenger_Emergency_Response_Network.git
```

---

## 2. Navigate to the Project Directory

```bash
cd MedRide-Passenger_Emergency_Response_Network/app
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file and add your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 5. Start the Application

```bash
npx expo start
```

---

# 📱 System Workflow

## 👤 User Workflow

1. User logs into the application.
2. Live GPS tracking continuously updates location.
3. User triggers emergency using the emergency button.
4. Emergency data is stored in Firebase Realtime Database.
5. Nearby users are identified using proximity filtering.
6. Push notifications are sent to nearby users and traffic authorities.
7. User receives live emergency tracking updates.

---

## 🛡️ Admin Workflow

1. Admin monitors active emergencies from dashboard.
2. Emergency location appears on live map.
3. Admin verifies or rejects the emergency.

### If Verified:
- Hospitals receive emergency notifications.
- Ambulance dispatch process begins.

### If Rejected:
- Emergency status changes to rejected.
- Emergency tracking is terminated.

---

## 🏥 Hospital Workflow

1. Hospital receives verified emergency request.
2. Ambulance is dispatched.
3. Ambulance tracking starts in real time.
4. User receives live ambulance tracking updates.
5. Emergency status updates until resolution.

---

# 📡 Core Functionalities

## 🚨 Emergency Trigger System
- Real-time emergency activation
- Live emergency status management
- Emergency lifecycle handling:
  - Pending
  - Verified
  - Rejected
  - Resolved

---

## 📍 Proximity-Based Alerts
- Nearby users are detected within emergency radius.
- Users outside the range stop receiving updates.
- Emergency markers disappear automatically after resolution.

---

## 🧭 Direction-Aware Notifications
The system intelligently identifies:
- Users ahead of the emergency vehicle
- Users beside the vehicle
- Users behind the vehicle

Only relevant nearby users receive alerts.

---

## 🗺️ Real-Time Map Tracking
Integrated map features include:
- Live user location
- Emergency vehicle markers
- Real-time ambulance movement
- Dynamic emergency visualization

---

## 🔔 Push Notification System

Implemented using Expo Notifications.

### Features
- Real-time emergency notifications
- Push token generation
- Background notification support
- Platform-aware notification behavior

---

# 🔥 Firebase Features Used

- Firebase Authentication
- Firebase Realtime Database
- Real-time listeners
- Live synchronization
- Push notification token management

---


# 🚀 Future Enhancements

- AI-based route optimization
- Ambulance traffic prioritization
- Voice-based emergency activation
- Multi-emergency handling
- Advanced analytics dashboard
- Offline emergency support
- Cloud Functions integration
- Dedicated production notification server

---

# 🎯 Project Highlights

✅ Real-time GPS tracking  
✅ Firebase real-time synchronization  
✅ Google Maps integration  
✅ Direction-aware emergency alerts  
✅ Push notification integration  
✅ Role-based access system  
✅ Admin verification dashboard  
✅ Live emergency monitoring  

---

# 📄 License

This project is created for educational and research purposes.