# ⚡ TechBazaar - Electronics Store with ML-Based SQL Injection Detection

A full-featured electronics e-commerce web application with an integrated admin panel featuring **machine learning-based SQL injection detection and mitigation**.

## 🚀 Features

### 🛍️ Customer Features
- **Home Page** – Hero section, search, category filters, featured products
- **Shop Page** – Browse all products with filtering
- **Product Detail** – Modal with full product info
- **Shopping Cart** – Add/remove items, quantity controls
- **Checkout** – 3-step process: Address → Payment → Confirmation
- **User Profile** – Edit personal info, view order history
- **Login/Register** – Secure authentication with SQLi protection

### ⚙️ Admin Panel
- **Overview Dashboard** – Stats, threat distribution, live feed
- **User Management** – View, suspend, activate, promote/demote users
- **Attack Logs** – Complete log of all SQL injection attempts with severity, confidence
- **Live Monitor** – Real-time request stream + manual SQLi testing tool
- **ML Training** – Configure and train the detection model (algorithm, epochs, learning rate)
- **Dataset Management** – Add/remove/bulk-import training data for the ML model

### 🧠 ML-Based SQL Injection Detection
- Pattern-based analysis with weighted scoring
- Trained pattern matching from user-expandable dataset
- String similarity comparison
- Real-time confidence scoring and risk classification
- Automatic attack blocking and logging

## 🔐 Demo Credentials

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@tech.com   | admin123  |
| User  | john@test.com    | john123   |

## 🛠️ Tech Stack
- **HTML5** / **CSS3** / **Vanilla JavaScript**
- No external dependencies
- No server required – runs entirely in the browser

## 📦 How to Run
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. That's it! No build step or server needed.

## 📁 Project Structure
