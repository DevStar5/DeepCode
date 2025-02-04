import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [directory, setDirectory] = useState('');
  const [message, setMessage] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState([]);

  const handleClone = async () => {
    try {
      setIsCloning(true);
      setMessage('Cloning website... Please wait');
      setDownloadStatus([]);

      // Setup SSE (Server-Sent Events) connection
      const eventSource = new EventSource(`http://localhost:5000/clone-status`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'download') {
          setDownloadStatus(prev => [...prev, data.file]);
          // Remove the file from status after 2 seconds
          setTimeout(() => {
            setDownloadStatus(prev => prev.filter(f => f !== data.file));
          }, 2000);
        }
      };

      const response = await axios.post('http://localhost:5000/clone', { url, directory });
      eventSource.close();
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to clone website');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="app-container">
      <div className="cloner-card">
        <h1 className="title">DeepCode</h1>
        <div className="input-container">
          <div className="input-group">
            <label>Website URL</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isCloning}
            />
          </div>
          <div className="input-group">
            <label>Save Directory</label>
            <input
              type="text"
              placeholder="C:\Downloads"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              disabled={isCloning}
            />
          </div>
        </div>
        <button
          className={`clone-button ${isCloning ? 'cloning' : ''}`}
          onClick={handleClone}
          disabled={!url || !directory || isCloning}
        >
          {isCloning ? (
            <>
              <span className="spinner"></span>
              Cloning...
            </>
          ) : (
            'Clone Website'
          )}
        </button>
        
        {isCloning && (
          <div className="download-status">
            {downloadStatus.map((file, index) => (
              <div key={index} className="status-item">
                <span className="writing-text">writing...</span>
                <span className="file-name">{file}</span>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className={`message ${isCloning ? 'info' : message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;