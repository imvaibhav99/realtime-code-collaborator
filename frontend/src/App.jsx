import './App.css' 
import React, { useState } from 'react';
import io from 'socket.io-client';    
import Editor from '@monaco-editor/react';
import { useEffect } from 'react';
import { use } from 'react';
   

const socket = io('https://code-lab-euk3.onrender.com'); // Connect to the server


const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('//start coding here...');
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.on("userJoined", (users)=>{
      setUsers(users);
    })

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode); // Update the code in the editor when a user changes it
    })
    socket.on("userTyping", (userName) => {
      setTyping(`${userName} is typing...`); // Show typing indicator
      setTimeout(() => setTyping(""), 2000); // Clear typing indicator after 2 seconds
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage); // Update the language in the editor when a user changes it
    });
    return()=>{
      socket.off("userJoined"); // Clean up the event listener when the component unmounts
      socket.off("codeUpdate"); // Clean up the code update listener
      socket.off("userTyping"); // Clean up the typing indicator listener
    }
  },[]);

  useEffect(()=>{
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom"); // Notify the server that the user is leaving the room
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload); // Clean up the event listener
      socket.emit("leaveRoom"); // Notify the server that the user is leaving the room
    }
  },[])


  const joinRoom = () => {
    if(roomId && userName){
      socket.emit("join", {roomId, userName});
      setJoined(true);
    }
      
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom"); // Notify the server that the user is leaving the room
    setJoined(false);
    setRoomId('');
    setUserName('');
    setCode('//start coding here...');
   // setUsers([]);
    setLanguage('javascript');
  }


  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopySuccess("Room ID copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 2000); // Clear message after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", {roomId,code: newCode}); // Emit code change to the server
    socket.emit("typing", {roomId, userName}); // Notify other users that this user is typing
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", {roomId, language: newLanguage}); // Notify other users about the language change
  }

  if(!joined){
    return <div className='join-container'>
      <div className='join-form'>
        <h1>Join a Room</h1>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
    </div>
    </div>
  }else
  return (
    <div className='editor-container'>
      <div className='sidebar'>
        <div className='room-info'>
          <h2>Room ID: {roomId} </h2>
          <button onClick={copyRoomId} className='copy-button'>Copy Room ID</button>
          {copySuccess && <span className='copy-success'>{copySuccess}</span>}
        </div>
        <h3>Users in Room: </h3>
        <ul >
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
        <p className='typing-indicator'>{typing}</p>
        <select className='language-selector' value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c++">C++</option>
        </select>
        <button className='leave-button' onClick={leaveRoom}>Leave Room</button>
      </div>
      <div className="editor-wrapper">
        <Editor
          height="100vh"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}

export default App
