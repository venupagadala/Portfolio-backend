# 📨 Portfolio Contact Form Backend

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/venupagadala/Portfolio-backend)

Node.js backend service for handling contact form submissions from portfolio websites. Securely processes form data and sends formatted emails via Gmail SMTP.

## ✨ Features

- **Secure Email Delivery**: Uses Nodemailer with Gmail SMTP
- **Input Validation**: Verifies required fields (name, email, message)
- **Professional Email Formatting**: HTML emails with proper styling
- **CORS Protection**: Configurable CORS policies for security
- **Error Handling**: Comprehensive error logging and user feedback
- **Phone Number Support**: Optional phone number field in submissions

## 🛠️ Tech Stack

![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?style=for-the-badge&logo=nodemailer&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-Enabled-brightgreen?style=for-the-badge)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- Gmail account (with App Password enabled)

### Installation
```bash
git clone https://github.com/venupagadala/Portfolio-backend.git
cd Portfolio-backend
npm install
```

### Configuration
1. Rename `.env.example` to `.env`
2. Update with your credentials:
```env
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password  # 16-character Gmail App Password
PORT=5000
```

### Running the Server
```bash
node index.js
# or for development with nodemon
npm run dev
```

## 🌐 API Endpoint

**POST** `/send`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello! I'd like to discuss a project.",
  "phone": "+1234567890"  // optional
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Email sent successfully!"
}
```

**Error Responses:**
- 400 Bad Request (missing fields)
- 500 Internal Server Error (email failed to send)

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_USER` | Yes | Your Gmail address |
| `EMAIL_PASS` | Yes | Gmail App Password (16 chars) |
| `PORT` | No | Server port (default: 5000) |

## 📦 Deployment

### Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` and follow prompts
3. Set environment variables in Vercel dashboard

### Render
1. Create new Web Service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy!



## 📬 Contact

For questions or support, please [open an issue](https://github.com/venupagadala/Portfolio-backend/issues) or contact the maintainer.

---

**Note:** For production use, consider:
- Adding rate limiting
- Implementing spam protection (like reCAPTCHA)
- Using a dedicated email service (Mailgun, SendGrid, etc.)
- Restricting CORS origin to your specific domain
