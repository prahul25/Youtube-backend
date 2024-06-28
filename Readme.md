YouTube Backend
This project is a backend for a YouTube-like application built with Node.js, Express.js, and MongoDB. It includes functionalities for managing subscriptions, playlists, likes, dashboards, comments, and a health check endpoint.

Table of Contents
Features
Technologies Used
Installation
Usage
API Endpoints
Postman Collection
Contributing
License
Features
Subscription Management
Playlist Management
Like System
Dashboard Statistics
Comments
Health Check
Technologies Used
Node.js
Express.js
MongoDB
Mongoose
Installation
Clone the repository:

sh
Copy code
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
Install dependencies:

sh
Copy code
npm install
Set up environment variables in a .env file:

env
Copy code
MONGO_URI=your-mongodb-uri
PORT=your-port
CORS_ORIGIN=your-cors-origin
Start the server:

sh
Copy code
npm start
Usage
Start the backend server and use tools like Postman to interact with the API.

API Endpoints
Subscription Management
GET /api/v1/subscribe/c/
: Get channel count whom subscribed by channel (User).
POST /api/v1/subscribe/c/
: Toggle subscription.
GET /api/v1/subscribe/s/
: Get user channel subscribers.
Playlist Management
POST /api/v1/playlist/
: Create playlist.
PATCH /api/v1/playlist/
: Update playlist.
DELETE /api/v1/playlist/
: Remove playlist.
GET /api/v1/playlist/
: Get playlist details.
PATCH /api/v1/playlist/add/
/
: Add video to playlist.
PATCH /api/v1/playlist/remove/
/
: Remove video from playlist.
GET /api/v1/playlist/user/
: Get user playlists.
Like System
POST /api/v1/like/toggle/v/
: Toggle video like.
POST /api/v1/like/toggle/c/
: Toggle comment like.
POST /api/v1/like/toggle/t/
: Toggle tweet like.
GET /api/v1/like/video-likes/
: Get video likes count.
GET /api/v1/like/comment-likes/
: Get comment likes count.
GET /api/v1/like/tweet-likes/
: Get tweet likes count.
Dashboard
GET /api/v1/dashboard/stats: Get user dashboard stats.
GET /api/v1/dashboard/videos: Get user uploaded videos.
Comments
POST /api/v1/comment/
: Add comment to video.
GET /api/v1/comment/
: Get video comments.
PATCH /api/v1/comment/c/
: Update comment.
DELETE /api/v1/comment/c/
: Delete comment.
Health Check
GET /api/v1/healthCheck: Check server health.
Video Management
POST /api/v1/video/: Upload video and info.
GET /api/v1/video/: Get all videos.
GET /api/v1/video/
: Get video by ID.
PATCH /api/v1/video/
: Update video details.
DELETE /api/v1/video/
: Delete video.
User Management
POST /api/v1/users/register: Register user.
POST /api/v1/users/login: Login user.
POST /api/v1/users/logout: Logout user.
POST /api/v1/users/refresh-token: Generate new refresh token and access token.
PATCH /api/v1/users/update-password: Update user password.
PATCH /api/v1/users/update-avatarImage: Update avatar image.
PATCH /api/v1/users/update-coverImage: Update cover image.
GET /api/v1/users/user-details: Get user details.
PATCH /api/v1/users/update-user-details: Update user details.
GET /api/v1/users/c/
: Get user channel profile.
GET /api/v1/users/watch-history: Get watch history.
Tweet Management
POST /api/v1/tweet/: Create tweet.
PATCH /api/v1/tweet/
: Update tweet.
DELETE /api/v1/tweet/
: Remove tweet.
GET /api/v1/tweet/user/
: Get user tweets.
Postman Collection
Download the Postman collection: YouTube_Backend.postman_collection.json

Import it into Postman:

Click Import.
Select File.
Choose the collection file.