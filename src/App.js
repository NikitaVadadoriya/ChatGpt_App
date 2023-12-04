import { useEffect, useState } from "react";
import chatIcon from "./images/chatgpticon.png";
import chat from "./images/images.png";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import { deepOrange, deepPurple ,grey} from '@mui/material/colors';
import axios from "axios";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';


const App = () => {
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState(null);
  const [prevChat, setPrevChat] = useState([]);
  const [currTitle, setCurrTitle] = useState(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [optionsIndex, setOptionsIndex] = useState(null);
  const [renameIndex, setRenameIndex] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrTitle(null);
  };

  const handleClick = (uniqueTitle) => {
    setCurrTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  };

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
      const existingTitleIndex = prevChat.findIndex(
        (item) => item.title === currTitle && item.role === "user" && item.content === value
      );

      if (existingTitleIndex !== -1) {
        const updatedChat = [...prevChat];
        updatedChat[existingTitleIndex] = { title: currTitle, role: "user", content: value };
        updatedChat[existingTitleIndex + 1] = { title: currTitle, role: message.role, content: message.content };
        setPrevChat(updatedChat);
      } else {
        setPrevChat((prevChats) => [
          ...prevChats,
          { title: currTitle, role: "user", content: value },
          { title: currTitle, role: message.role, content: message.content },
        ]);
      }
    }
  }, [message, currTitle]);

  const handleOptionsClick = (index) => {
    setOptionsIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const currentChat = prevChat.filter((prevChats) => prevChats.title == currTitle);

  const handleEditClick = (index) => {
    setEditingMessageIndex(index);
  };

  const handleSaveEdit = (index) => {
    const updatedChat = [...currentChat];
    updatedChat[index].content = value;

    axios.post("http://localhost:5000/chat", {
      message: value,
    })
      .then((response) => {
        updatedChat[index + 1].content = response.data.message.content;

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

        setValue('');
        setEditingMessageIndex(null);
      })
      .catch((error) => {
        console.error('Error updating chat:', error);
      });
  };

  const handleCancelEdit = () => {
    setMessage('');
    setEditingMessageIndex(null);
  };

  const handleRenameClick = (index) => {
    setRenameIndex(index);
    setNewTitle(currTitle);
    setIsTitleEditing(true);
  };

  const handleSaveRename = () => {
    if (newTitle.trim() !== '') {
      const updatedChat = [...prevChat];
      const titles = Array.from(new Set(updatedChat.map((chat) => chat.title)));

      if (!titles.includes(newTitle)) {
        updatedChat.forEach((chat, i) => {
          if (chat.title === currTitle) {
            updatedChat[i].title = newTitle;
          }
        });

        setPrevChat(updatedChat);
        setRenameIndex(null);
        setOptionsIndex(null);
        setIsTitleEditing(false);
      } else {
        alert('Title already exists. Please choose a different title.');
      }
    } else {
      alert('Please enter a valid title.');
    }
  };

  const handleCancelRename = () => {
    setRenameIndex(null);
    setIsTitleEditing(false);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      const updatedChat = [...prevChat];
      const deletedTitle = updatedChat[index].title;
      setPrevChat(updatedChat.filter((chat) => chat.title !== deletedTitle));
      setOptionsIndex(null);
    }
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    }
  };

  const handlechatKeyPress = (e) => {
    if (e.key === 'Enter') {
      getMessages();
    }
  };

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>

        <ul className="history">
          {Array.from(new Set(prevChat.map((prevChats) => prevChats.title)))?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {renameIndex === index && isTitleEditing ? (
                <>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={handleTitleChange}
                    onKeyPress={handleTitleKeyPress}
                    placeholder="Enter new title..."
                    style={{ width: '70%', marginRight: '10px' }}
                  />
                  <button onClick={handleSaveRename}>Save</button>
                  <button onClick={handleCancelRename}>Cancel</button>
                </>
              ) : (
                
                 <> 
                 {uniqueTitle.slice(0, 14)}
                  <button
                    style={{ color: 'white', cursor: 'pointer', border: 'none' }}
                    onClick={() => handleOptionsClick(index)}
                  >
                    ...
                  </button>
                  {optionsIndex === index && (
                    <div className="box">
                      <button
                        onClick={() => handleRenameClick(index)}
                        style={{ color: 'white', cursor: 'pointer', border: 'none' }}
                      >
                        <EditIcon /> Rename
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        style={{ color: 'white', cursor: 'pointer', border: 'none', paddingBottom: '10px' }}
                      >
                        <DeleteIcon /> Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        <nav>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar> <p style={{ marginLeft: '50px', marginTop: '-30px' }}>Nikita Patel</p>
        </nav>
      </section>

      <section className="main">
        {!currTitle && (
          <div style={{ marginTop: '150px' }}>
            <img className="chaticon" src={chatIcon} />
            <h1 style={{ marginTop: '-10px' }}>How can I help you today?</h1>
          </div>
        )}

        <ul className="feed">
          {currentChat?.map((currMessage, index) => (
            <li key={index}>
              {currMessage.role === 'assistant' ? <><img src={chat} alt="icon" style={{width:'30px',height:'30px', borderRadius: '50%'}}/> <strong>&nbsp;ChatGPT: </strong> </>: <><Avatar sx={{ bgcolor: deepOrange[300],width: '30px', height: '30px'}}>N</Avatar><strong>&nbsp;You: <br /> </strong></>}{' '}
              {editingMessageIndex === index ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Edit your message..."
                  style={{ marginLeft: '10px', backgroundColor: '#323441' }}
                />
              ) : (
                <span>
                  <br />
                  <br />
                  {currMessage.content}
                  <br />
                </span>
              )}
              {editingMessageIndex === index ? (
                <>
                  <button onClick={() => handleSaveEdit(index)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                currMessage.role === 'user' ? (
                  <button style={{ border: 'none',marginLeft:'300px'}} onClick={() => handleEditClick(index)}>
                    <EditIcon sx={{ fontSize: 20 }} />
                  </button>
                ) : null
              )}
            </li>
          ))}
        </ul>

        <div className="bottom-section">
          <div className="input-container">
            <input value={value} onChange={(e) => setValue(e.target.value)}
              onKeyPress={handlechatKeyPress}
              placeholder="Message ChatGPT  ..." />
            <div id="submit" onClick={getMessages}>
              <SendIcon />
            </div>  
          </div>

          <p className="info">ChatGPT can make mistakes. Consider checking important information.</p>
        </div>
      </section>
    </div>
  );
};

export default App;
