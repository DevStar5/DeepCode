# DeepCode - Website Cloner

A powerful web application that allows users to clone websites by downloading all assets and resources while maintaining the original structure.

## 🚀 Features

- 🌐 Clone entire websites with a simple URL input
- 📁 Maintains original directory structure
- 🎨 Downloads all associated assets (CSS, images, fonts)
- 💻 User-friendly web interface
- ⚡ Real-time cloning progress feedback
- 🔄 Handles both relative and absolute URLs

## 🛠️ Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React
- **Key Libraries**: 
  - axios (HTTP requests)
  - cheerio (HTML parsing)
  - cors (Cross-origin resource sharing)

## ⚙️ Prerequisites

- Node.js >= 14.0.0
- NPM >= 6.0.0

## 📦 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/deepcode.git
   cd deepcode
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

## 🚀 Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   node index.js
   ```
   Server will run on http://localhost:5000

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

## 🔧 Configuration

- Backend port can be configured in `backend/index.js`
- Frontend API endpoint can be configured in frontend environment files

## 📝 Usage

1. Open your browser and navigate to http://localhost:3000
2. Enter the website URL you want to clone
3. Specify the save directory
4. Click "Clone Website" and monitor the progress

## ⚠️ Important Notes

- Ensure both servers are running simultaneously
- Verify write permissions in the target directory
- Some websites may have restrictions preventing cloning
- Large websites may require significant time and resources

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- List any acknowledgments here 