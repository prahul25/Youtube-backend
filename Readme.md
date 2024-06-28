# YouTube Backend

This project is a backend for a YouTube-like application built with Node.js, Express.js, and MongoDB. It includes functionalities for managing subscriptions, playlists, videos, tweet, likes, dashboards, comments, and a health check endpoint.

## Table of Contents

 - [Features](#Features)
 - [Technologies-Used](#Technologies-Used)
 - [Installation](#installation)
 - [Usage](#Usage)
 - [API Endpoints](#API-Endpoints)
 - [Postman Collection](#Postman-Collection)


## Features

- **User Management** 
    * Register, login, and logout users.
    * Update user details, password, avatar, and cover image.
    * Get user details, channel profile, and watch history.
- **Video Management** 
    * Upload videos with additional info.
    * Retrieve all videos or a specific video by ID.
    * Update video details.
    * Delete videos.
- **Comment Management** 
    * Add, update, and delete comments on videos.
    * Retrieve comments for a specific video.
- **Like System** 
    * Toggle likes on videos, comments, and tweets.
    * Retrieve like counts for videos, comments, and tweets.
- **Playlist Management** 
    * Create, update, and delete playlists.
    * Add or remove videos from playlists.
    * Retrieve user playlists and specific playlist details.
- **Tweet Management** 
    * Create, update, and delete tweets
    * Retrieve tweets by a specific user.
- **Subscription Management** 
    * Subscribe and unsubscribe to channels.
    * Retrieve subscriber counts and channel subscriptions.
- **Dashboard** 
    * Retrieve user dashboard statistics and uploaded videos.
- **Health Check**
    * Endpoint to check the server health.

## Technologies-Used
- Node.js
- Express.js
- MongoDB
- Mongoose
## Installation
Clone the repository:
```bash
git clone https://github.com/prahul25/Youtube-backend.git
cd Youtube-backend
```
Install dependencies:
```bash
npm install
```
Set up environment variables in a .env file:
```bash
MONGO_URI=your-mongodb-uri
PORT=your-port
CORS_ORIGIN=your-cors-origin
```
Start the server:
```bash
npm start
```
## Usage
Start the backend server and use tools like Postman to interact with the API.

## API Endpoints
### User Management ###
- **POST /api/v1/users/register** - Register user.
- **POST /api/v1/users/login** - Login user. 
- **POST /api/v1/users/logout** - Logout user.
- **POST /api/v1/users/refresh-token** - Generate new refresh token and access token.
- **PATCH /api/v1/users/update-password** - Update user password.
- **PATCH /api/v1/users/update-avatarImage** - Update avatar image.
- **PATCH /api/v1/users/update-coverImage** - Update cover image.
- **GET /api/v1/users/user-details** - Get user details. 
- **PATCH /api/v1/users/update-user-details** - Update user details.
- **GET /api/v1/users/c/** - Get user channel profile. 
- **GET /api/v1/users/watch-history** - Get watch history. 

### Video Management ###
- **POST /api/v1/video/** - Upload video and info.
- **GET /api/v1/video/** - Get all videos.
- **GET /api/v1/video/:videoId** - Get video by ID.
- **PATCH /api/v1/video/:videoId** - Update video details.
- **DELETE /api/v1/video/:videoId** - Delete video.

### Comment Management ###
- **POST /api/v1/comment/:videoId** - Add comment to video.
- **GET /api/v1/comment/:videoId** - Get video comments.
- **PATCH /api/v1/comment/c/:commentId** - Update comment.
- **DELETE /api/v1/comment/c/:commentId** - Delete comment.

### Like System ###
- **POST /api/v1/like/toggle/v/:videoId** - Toggle video like.
- **POST /api/v1/like/toggle/c/:commentId** - Toggle comment like.
- **POST /api/v1/like/toggle/t/:tweetId** - Toggle tweet like.
- **GET /api/v1/like/video-likes/:videoId** - Get video likes count.
- **GET /api/v1/like/comment-likes/:commentId** - Get comment likes count.
- **GET /api/v1/like/tweet-likes/:tweetId** - Get tweet likes count.

### Playlist Management ###
- **POST /api/v1/playlist/:videoId** - Create playlist.
- **PATCH /api/v1/playlist/:playlistId** - Update playlist.
- **DELETE /api/v1/playlist/:playlistId** - Remove playlist.
- **GET /api/v1/playlist/:playlistId** - Get playlist details.
- **PATCH /api/v1/playlist/add/:videoId/:playlistId** - Add video to playlist.
- **PATCH /api/v1/playlist/remove/:videoId/:playlistId** - Remove video from playlist.
- **GET /api/v1/playlist/user/:userId** - Get user playlists.

### Tweet Management ###
- **POST /api/v1/tweet** - Create tweet.
- **POST /api/v1/tweet/:tweetId** - Update tweet.
- **POST /api/v1/tweet/:tweetId** - Remove tweet.
- **GET /api/v1/tweet/user/:userId** - Get user tweets.

### Subscription Management
- **GET /api/v1/subscribe/c/:channelId** - Get channel count whom subscribed by channel (User).
- **GET /api/v1/subscribe/c/:channelId** - Toggle subscription.
- **GGET /api/v1/subscribe/s/:subscriberId** - Get user channel subscribers.
### Dashboard
- **GET /api/v1/dashboard/stats:** - Get user dashboard stats.
- **GET /api/v1/dashboard/videos:** - Get user uploaded videos.
### Health Check ###
- **GET /api/v1/healthCheck** -` Check server health.

## Postman Collection
Download the Postman collection: YouTube_Backend.postman_collection.json

Import it into Postman:

1.Click Import.

2.Select File.

3.Choose the collection file.