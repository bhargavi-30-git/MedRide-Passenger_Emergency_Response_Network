The system uses the Haversine formula to calculate the shortest (great-circle) distance between two GPS coordinates using latitude and longitude. This gives an accurate “as-the-crow-flies” distance, commonly used in GPS and navigation systems.

**In Phase 6 (Day 2), the focus is on direction-aware emergency alerting, not just distance-based alerts.**

**When an emergency user activates an alert:**
Only users ahead of or beside the emergency vehicle (based on direction and position) receive the alert.
Users behind the emergency vehicle do not receive alerts.
The listener app continuously monitors alerts in real time.

**Key parameters used:**
GPS location (latitude, longitude)
Heading/bearing (direction of movement)
Distance
Emergency active status

**Alert lifecycle:**
When emergency is ON, location updates are sent every 2–3 seconds.
The alert appears once and remains visible as long as the emergency is active.
There is no timeout.

**The alert is removed only when:**
Emergency status becomes inactive,
The user moves out of range, or
Direction conditions fail.
This design ensures relevant, non-distracting alerts and improves road safety by notifying only affected users.

Current status: Live location tracking of the emergency trigger is 50% completed.
-------------------------------------------------------------------------------------------------------------------------------------------------------
**Day 3 – Emergency & Listener UI Flow (Google Maps Integration)**
🟢 Normal State (All Users)
App opens on MapScreen
Displays:
  User’s own live location
  Normal Google Maps view

**🚨 Emergency User Flow**
When the user taps START EMERGENCY:
  App switches to a dedicated EmergencyScreen
  Shows:
      🚨 Emergency ACTIVE status
        Live GPS location updates
        RESOLVE EMERGENCY button
User is locked on this screen until emergency is resolved

**👀 Listener (Other Users) Flow**
Listener users stay on MapScreen
The app continuously listens for active emergencies
Emergency alerts are received only within a 100-meter radius
If an emergency is detected within 100 m:
    🧍 Listener’s live location marker
    🚑 Emergency vehicle marker
    Real-time movement of the emergency vehicle
If the emergency moves beyond 100 m, the marker is removed automatically

**👉 This is live tracking within a defined proximity, not just a notification.**

**🧠 Core Design Idea
Role	Screen
Emergency User	EmergencyScreen (focused UI)
Listener User	MapScreen + live emergency tracking**

System characteristics:
📍 GPS-based distance calculation
📏 100 m listening radius
🔴 Live updates
🔁 Real-time tracking
🔒 One active emergency at a time

🎯 Why This Design Is Strong
Prevents unnecessary alerts beyond 100 m
Improves relevance and safety
Mirrors real-world emergency systems
Clean UI with no clutter
Scales well for future integrations

**Viva / Exam Line**
“Emergency alerts are proximity-based and direction-aware. Listener devices continuously monitor emergencies within a 100-meter radius and track the emergency vehicle live on the map until the emergency is resolved or moves out of range.”

**Day -4 Push Notifications (Expo Go Limitations Acknowledged)**

Integrated expo-notifications and expo-device

Successfully:

Requested permissions

Generated Expo Push Tokens

Verified notification delivery on both platforms

Observed platform behavior:

✅ iOS: notifications appear as pop-up banners when app is in background

⚠️ Android (Expo Go): notifications are delivered but may appear silently in the notification tray (no heads-up popup)

This behavior was confirmed to be a known limitation of Expo Go on Android, not a code issue.

**Final Decision on Notifications**

Notifications are kept as-is for cross-platform consistency.

Android silent delivery in Expo Go is documented and accepted.

For demos and real-world usage, in-app real-time emergency alerts (UI + sound + vibration) are considered the primary alert mechanism.