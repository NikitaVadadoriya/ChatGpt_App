import { useEffect, useState } from "react";
import chatIcon from "./images/chatgpticon.png";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import { deepOrange, deepPurple } from '@mui/material/colors';
import axios from "axios";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const App = () => {
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState(null);
  const [prevChat, setPrevChat] = useState([]);
  const [currTitle, setCurrTitle] = useState(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [optionsIndex, setOptionsIndex] = useState(null);
  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrTitle(null)
  }

  const handleClick = (uniqueTitle) => {
    setCurrTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  }
  const getMessages = async (req, res) => {
    try {
      const response = await axios.post("http://localhost:5000/chat", {
        message: value,
      });
      console.log(response.data.message);
      setMessage(response.data.message);
     
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!currTitle && value && message) {
      setCurrTitle(value);
    }
    if (currTitle && value && message) {
      // Check if the edited question matches an existing title
      const existingTitleIndex = prevChat.findIndex(
        (item) => item.title === currTitle && item.role === "user" && item.content === value
      );
  
      if (existingTitleIndex !== -1) {
        // Update the existing entry with the edited question and response
        const updatedChat = [...prevChat];
        updatedChat[existingTitleIndex] = { title: currTitle, role: "user", content: value };
        updatedChat[existingTitleIndex + 1] = { title: currTitle, role: message.role, content: message.content };
  
        setPrevChat(updatedChat);
      } else {
        // No existing entry found, create a new entry
        setPrevChat((prevChats) => [
          ...prevChats,
          { title: currTitle, role: "user", content: value },
          { title: currTitle, role: message.role, content: message.content },
        ]);
      }
    }
  }, [message, currTitle]);
  
  const handleOptionsClick = (index) => {
    // Toggle the options index
    setOptionsIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const currentChat = prevChat.filter(prevChats => prevChats.title == currTitle);

  const handleEditClick = (index) => {
    // Enable editing mode for the selected message
    setEditingMessageIndex(index);
  };

  const handleSaveEdit = (index) => {
    // Update the content of the edited message
  const updatedChat = [...currentChat];
  updatedChat[index].content = value;

  axios.post("http://localhost:5000/chat", {
    message: value,
  })
  .then((response) => {
    // Update the response of the edited message
    updatedChat[index + 1].content = response.data.message.content;

    // Update the chat history with the edited question and response
    setPrevChat((prevHistory) => {
      const updatedHistory = [...prevHistory];
      const titleIndex = updatedHistory.findIndex(
        (item) => item.title === currTitle && item.role === 'user' && item.content === value
      );

      if (titleIndex !== -1) {
        updatedHistory[titleIndex] = { title: currTitle, role: 'user', content: value };
        updatedHistory[titleIndex + 1] = { title: currTitle, role: 'assistant', content: response.data.message.content };
      }

      return updatedHistory;
    });

    // Clear input and disable editing mode
    setValue('');
    setEditingMessageIndex(null);
  })
  .catch((error) => {
    console.error('Error updating chat:', error);
  });
};

  const handleCancelEdit = () => {
    // Clear input and disable editing mode
    setMessage('');
    setEditingMessageIndex(null);
  };

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>

        <ul className="history">
          {Array.from(new Set(prevChat.map(prevChats => prevChats.title)))?.map((uniqueTitle, index) =>
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              <ChatBubbleOutlineIcon /> {uniqueTitle.slice(0, 10)}
              <button
                style={{ color: 'white', cursor: 'pointer', border: "none" }}
                onClick={() => handleOptionsClick(index)}
              >
                ...
              </button>
              {optionsIndex === index && (
                <div className="box">
                  <button onClick={() => console.log('Option 1 clicked')} style={{ color: 'white', cursor: 'pointer', border: "none" }}><EditIcon  />Edit</button>
                  <button onClick={() => console.log('Option 2 clicked')} style={{ color: 'white', cursor: 'pointer', border: "none" ,paddingButtom:'10px'}}><DeleteIcon />Delete</button>
                </div>
              )} 
            </li>
          )}
        </ul>

        <nav>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar> <p style={{ marginLeft: '50px', marginTop: '-30px' }}>Nikita Patel</p>
        </nav>

      </section>

      <section className="main">
        {!currTitle &&
          <div style={{ marginTop: '150px' }}>
            <img src={chatIcon} /><h1 style={{ marginTop: '-10px' }}>How can i help you today ?</h1></div>}

        <ul className="feed">
          {currentChat?.map((currMessage, index) => (
          <li key={index}>
          {currMessage.role === 'assistant' ? <strong>ChatGPT: </strong> : <strong>You: <br/> </strong>}{' '}
            {editingMessageIndex === index ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  // placeholder="Edit your message..."
                  style={{marginLeft:'10px',backgroundColor:'#323441'}}
                />
              ) : (
                <span><br/><br/>{currMessage.content}<br/></span>
              )}
              {editingMessageIndex === index ? (
                <>
                  <button onClick={()=>handleSaveEdit(index)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
               currMessage.role === 'user' ?  <button style ={{border:'none'}} onClick={() => handleEditClick(index)}><EditIcon sx={{ fontSize: 20 }}/></button> : null
              )}
          </li>)
        )}
        </ul>

        <div className="bottom-section">
          <div className="input-container">
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Message ChatGPT  ..." />
            <div id="submit" onClick={getMessages}>
              <SendIcon />
            </div>
          </div>

          <p className="info">
            ChatGPT can make mistakes. Consider checking important information.
          </p>

        </div>
      </section>
    </div>
  );
};

export default App;