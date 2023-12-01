import { useEffect, useState } from "react";
import chatIcon from "./images/chatgpticon.png";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import { deepOrange, deepPurple } from '@mui/material/colors';
import axios from "axios";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const App = () => {
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState(null);
  const [prevChat, setPrevChat] = useState([]);
  const [currTitle, setCurrTitle] = useState(null);

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
    console.log(currTitle, value, message);
    if (!currTitle && value && message) {
      setCurrTitle(value);
    }
    if (currTitle && value && message) {
      setPrevChat((prevChats) => (
        [
          ...prevChats,
          {
            title: currTitle,
            role: "user",
            content: value,
          },
          {
            title: currTitle,
            role: message.role,
            content: message.content,
          },
        ]
      ));
    }
  }, [message, currTitle]);

  };
  const currentChat = prevChat.filter(prevChats => prevChats.title == currTitle);
  const uniqueTitles = Array.from(new Set(prevChat.map(prevChats => prevChats.title)));
  console.log(currentChat);
  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) =>
            <>
              <li key={index} onClick={() => handleClick(uniqueTitle)}><ChatBubbleOutlineIcon />  {uniqueTitle}
                <button
                  style={{ color: 'white', cursor: 'pointer' }}
                  onClick={() => handleOptionsClick(index)}
                >
                  ...
                </button>
                {message === index && (
                  <div style={{ marginTop: '4px', padding: '8px', background: '#f0f0f0', color: 'black' }}>
                    <button onClick={() => console.log('Option 1 clicked')}>Option 1</button>
                    <button onClick={() => console.log('Option 2 clicked')}>Option 2</button>
                  </div>
               )} 
              </li>
            </>
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
          {currentChat?.map((currMessage, index) => <li key={index}>
            <p className="role">{currMessage.role}</p>
            <p><br /><br />{currMessage.content}</p>
          </li>
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