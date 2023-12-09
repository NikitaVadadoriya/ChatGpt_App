import { useEffect, useState } from "react";
import chatIcon from "./images/chatgpticon.png";
import chat from "./images/images.png";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import { deepOrange } from "@mui/material/colors";
import axios from "axios";

const App = () => {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [optionsIndex, setOptionsIndex] = useState(null);
  const [renameIndex, setRenameIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [selectedChatTitle, setSelectedChatTitle] = useState(false);
  const [chatTitles, setChatTitles] = useState([]);
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const NewChat = () => {
    setEditingMessageIndex(null);
    setOptionsIndex(null);
    setRenameIndex(null);
    setIsTitleEditing(false);
    setValue("");
    setMessage("");
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/chat/history");
      setChatHistory(response.data);
      setChatTitles(
        response.data.filter((message) => message.role === "user").map(
          (message) => message.title || message.content
        )
      );
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post("http://localhost:5000/chat", {
        message: value,
      });
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", content: value, title: response.data.title },
        {
          role: "assistant",
          content: response.data.message,
          title: response.data.title,
        },
      ]);
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleEditClick = (index) => {
    setEditingMessageIndex(index);
  };

  const handleCancelEdit = () => {
    setMessage("");
    setEditingMessageIndex(null);
  };

  const handleEdit = async (index) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/chat/edit/${index}`,
        {
          newQuestion: value,
        }
      );
      setChatHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[index * 2 + 0].content = value;
        updatedHistory[index * 2 + 1].content = response.data.message;
        return updatedHistory;
      });
      setEditingMessageIndex(null);
    } catch (error) {
      console.error("Error editing question:", error);
    }
  };

  const handleTitleClick = (content) => {
    setMessage(null);
    setSelectedChatTitle(content);
  };

  const handleOptionsClick = (index) => {
    setOptionsIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleRenameClick = (index) => {
    setRenameIndex(index);
    setNewTitle(chatHistory[index]?.title || chatHistory[index]?.content);
    setIsTitleEditing(true);
  };

  const handleSaveRename = async (index) => {
    try {
      setNewTitle(chatHistory[index]?.content);
      const response = await axios.put(
        `http://localhost:5000/chat/rename/${index}`,
        {
          newTitle,
        }
      );

      if (response.data.success) {
        const updatedChatHistory = [...chatHistory];
        updatedChatHistory[index * 2].title = newTitle;
        setChatHistory(updatedChatHistory);
        setRenameIndex(null);
        setOptionsIndex(null);
        setIsTitleEditing(false);
      } else {
        console.error("Error renaming chat title:", response.data.error);
      }
    } catch (error) {
      console.error("Error saving rename:", error);
    }
  };

  const handleCancelRename = () => {
    setRenameIndex(null);
    setIsTitleEditing(false);
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this chat history?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/chat/delete/${index}`
        );
        if (response.data.success) {
          setChatHistory((prevHistory) => [
            ...prevHistory.slice(0, index * 2),
            ...prevHistory.slice(index * 2 + 2),
          ]);
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const handlechatKeyPress = (e) => {
    if (e.key === "Enter") {
      createNewChat();
    }
  };

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={NewChat}>+ New Chat</button>
        <ul className="history">
          {Array.from(
            new Set(
              chatHistory
                .filter((message) => message.role === "user")
                .map((message) =>  message.title || message.content)
            )
          ).map((content, index) => (
            <li key={index} onClick={() => handleTitleClick(content)}>
              {renameIndex === index && isTitleEditing ? (
                <>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter new title..."
                    style={{ width: "70%", marginRight: "10px" }}
                  />
                  <button onClick={() => handleSaveRename(index)}>Save</button>
                  <button onClick={handleCancelRename}>Cancel</button>
                </>
              ) : (
                <>
                 {content}
                  <>
                    <button
                      style={{
                        color: "white",
                        cursor: "pointer",
                        border: "none",
                      }}
                      onClick={() => handleOptionsClick(index)}
                    >
                      ...
                    </button>
                    {optionsIndex === index && (
                      <div className="box">
                        <button
                          onClick={() => handleRenameClick(index)}
                          style={{
                            color: "white",
                            cursor: "pointer",
                            border: "none",
                          }}
                        >
                          <EditIcon /> Rename
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          style={{
                            color: "white",
                            cursor: "pointer",
                            border: "none",
                            paddingBottom: "10px",
                          }}
                        >
                          <DeleteIcon /> Delete
                        </button>
                      </div>
                    )}
                  </>
                </>
              )}
            </li>
          ))}
        </ul>
        <nav>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>{" "}
          <p style={{ marginLeft: "50px", marginTop: "-30px" }}>Nikita Patel</p>
        </nav>
      </section>

      <section className="main">
        <ul className="feed">
          {chatHistory.map((currMessage, index) => (
            <li key={index}>
               
              {currMessage.role === "assistant" ? (
                <>
                  <img
                    src={chat}
                    alt="icon"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                    }}
                  />{" "}
                  <strong>&nbsp;&nbsp;ChatGPT: </strong>{" "}
                </>
              ) : (
                <>
                  <Avatar
                    sx={{
                      bgcolor: deepOrange[300],
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    N
                  </Avatar>
                  <strong>
                    &nbsp;&nbsp;You: <br />{" "}
                  </strong>
                </>
              )}{" "}
              {editingMessageIndex === index ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Edit your message..."
                  style={{ marginLeft: "10px", backgroundColor: "#323441" }}
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
                  <button
                    onClick={() => handleEdit(index)}
                    backgroundColor="success"
                  >
                    Save&Submit
                  </button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : currMessage.role === "user" ? (
                <button
                  style={{ border: "none" }}
                  onClick={() => handleEditClick(index)}
                >
                  <br /> <ModeOutlinedIcon sx={{ fontSize: 15 }} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="bottom-section">
          <div className="input-container">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handlechatKeyPress}
              placeholder="Message ChatGPT  ..."
            />
            <div id="submit" onClick={createNewChat}>
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
