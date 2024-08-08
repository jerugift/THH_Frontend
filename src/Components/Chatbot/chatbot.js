import React, { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import axios from "axios";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import sendButton from "../../Utils/sendButton.png";
import { useSelector } from "react-redux";
import { checkDataFR, checkDataLE, handleFetchCP } from "../../axios/api";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "../../Utils/SearchIcon.gif";
import { toast } from "react-toastify";
import axiosInstance from "../../axios/axiosConfig";
import { TbMessageChatbot } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
const Chatbox = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hi there 👋\nHow can I help you today?\nA. Talent Resource\nB. Deep-Doc-Verify \nC. Link Extraction \n D. Chat with Database",
      fromBot: true,
    },
  ]);
  const [isBotLoading, setBotLoading] = useState(false);
  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const userEmail = user.email;
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState(""); // New state variable
  // ! for scroll automatically
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const HandlefetchResume = () => {
    checkDataFR(user.email)
      .then((res) => {
        console.log("Talent Resourcing response:", res);
        if (res.status === "Success") {
          toast.success(res.message);
          navigate("/home/fetchresume", { state: { data: res.data } });
        } else {
          toast.error(res?.message);
        }
      })
      .catch((error) => {
        console.error("Error during Talent Resourcing request:", error);
        toast.error(error.response.data.message);
      });
  };
  const HandleLinkExtraction = () => {
    checkDataLE(user.email)
      .then((res) => {
        console.log("Link Extraction response:", res);
        if (res.status === "Success") {
          toast.success(res.message);
          navigate("/home/linkextraction", { state: { data: res.data } });
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error("Error during Link Extraction request:", error);
        toast.error(error.response.data.message);
      });
  };
  // Load messages from local storage when again comes
  // ! for scroll automatically
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    const storedFile = localStorage.getItem("selectedFile");
    const storedFileName = localStorage.getItem("selectedFileName");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
      if (storedFile) {
        setSelectedFile(JSON.parse(storedFile));
      }
      if (storedFileName) {
        setSelectedFileName(storedFileName); // Set the stored file name
      }
    }
  }, []);

  useEffect(() => {
    // Save messages to local storage whenever the messages state changes
    localStorage.setItem("chatMessages", JSON.stringify(messages));

    // Scroll to the bottom of the messages container when messages state changes
    if (selectedFile) {
      localStorage.setItem("selectedFile", JSON.stringify(selectedFile));
      localStorage.setItem("selectedFileName", selectedFileName);
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedFile, selectedFileName]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.text ===
        "Your resumes have been fetched click dashboard to view your resumes"
    ) {
      handleSend();
    }
  }, [messages]);
  const handleSend = () => {
    const userMessage = input.trim();
    if (userMessage !== "") {
      setMessages([
        ...messages,
        {
          text: userMessage,
          fromBot: false,
        },
      ]);
      setInput("");
      setBotLoading(true);
      axiosInstance
        .post(
          "/response",
          { message: userMessage },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const botMessage = response.data.message;
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: botMessage,
              fromBot: true,
            },
          ]);
        })
        .catch((error) => {
          console.error("Error processing response:", error);
        })
        .finally(() => {
          setBotLoading(false);
          if (textareaRef.current) {
            setTimeout(() => {
              textareaRef.current.focus(); // Ensure focus is set
            }, 0);
          }
        });
    }
  };
  const handleSearch = async (input, userEmail) => {
    setInput("");
    setMessages([
      ...messages,
      {
        text: input,
        fromBot: false,
      },
    ]);
    setBotLoading(true);
    await axiosInstance
      .post(
        "/search",
        { user_input: input, email: userEmail, file_name: "datascience" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        HandleLinkExtraction();
        setMessages((prevMessages) => [
          ...prevMessages,
          // {
          //   text: input,
          //   fromBot: false,
          // },
          {
            text: response.data.message,
            fromBot: true,
          },
        ]);
      })
      .catch((error) => {
        console.error(error);
        toast.error(
          "Please use a more specific query (For eg., include the job role and the university/college you want the candidate from)"
        );
        setInput("");
      })
      .finally(() => {
        setBotLoading(false);
        if (textareaRef.current) {
          setTimeout(() => {
            textareaRef.current.focus();
          }, 0);
        }
      });
  };
  const handleFile = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleImageUpload = async (selectedFile) => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: selectedFileName,
          fromBot: false,
        },
      ]);
      setBotLoading(true);
      await axiosInstance
        .post("/docvalidation", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const { Classification, Probability } = response.data.data;

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: `${Probability}% ${Classification}`,
              fromBot: true,
            },
          ]);
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: "Image upload failed. Please try again.",
              fromBot: true,
            },
          ]);
        })
        .finally(() => {
          clearFileSelection();
          setBotLoading(false);
          if (textareaRef.current) {
            setTimeout(() => {
              textareaRef.current.focus();
            }, 0);
          }
        });
    }
  };

  const handleFetch = (selectedFile, userEmail) => {
    if (selectedFile && userEmail) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("email", userEmail);
      setBotLoading(true);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: selectedFileName,
          fromBot: false,
        },
      ]);
      axiosInstance
        .post("/extract_keywords", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          toast.success(
            "Your resumes have been fetched click dashboard to view your resumes"
          );

          HandlefetchResume();
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: response.data?.message,
              fromBot: true,
            },
          ]);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: "Talent Resourcing failed sorry for the inconvenience. Please try again.",
              fromBot: true,
            },
          ]);
        })
        .finally(() => {
          clearFileSelection();
          setBotLoading(false);
          if (textareaRef.current) {
            setTimeout(() => {
              textareaRef.current.focus();
            }, 0);
          }
        });
    }
  };
  const handleFetchCopypaste = (data, userEmail) => {
    if (data && userEmail) {
      setBotLoading(true);
      setInput("");
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: data,
          fromBot: false,
        },
      ]);

      handleFetchCP(data, userEmail)
        .then((response) => {
          HandlefetchResume();
          console.log(`copypaste response: ${response}`); // response is the actual data returned
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: response.message, // access message directly from response
              fromBot: true,
            },
          ]);

          toast.success("Successfully fetched");
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: "An error occurred while processing your request.",
              fromBot: true,
            },
          ]);
        })
        .finally(() => {
          setBotLoading(false);
          if (textareaRef.current) {
            setTimeout(() => {
              textareaRef.current.focus();
            }, 0);
          }
        });
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (
        messages[messages.length - 1]?.text.toLowerCase() ===
          "please paste your job description...".toLowerCase() &&
        input.length > 10
      ) {
        await handleFetchCopypaste(input, userEmail);
      } else if (
        messages[messages.length - 1]?.text.toLowerCase() ===
          "type your query".toLowerCase() &&
        input.length > 1
      ) {
        await handleSearch(input, userEmail);
      } else {
        handleSend();
      }
    }
  };
  const clearFileSelection = () => {
    setSelectedFile(null);
    setSelectedFileName("");
    localStorage.removeItem("selectedFile");
    localStorage.removeItem("selectedFileName");
  };
  return (
    <Box
      className="chatbot"
      sx={{
        position: "fixed",
        bottom: { xs: "25%", sm: "25%", md: "25%", lg: "27%", xl: "27%" },
        right: { xs: "5%", sm: "5%", md: "6%", lg: "6%", xl: "7%" },
        backgroundColor: "white",
        border: "1px solid #ccc",
        width: { xs: "65%", sm: "50%", md: "35%", lg: "33%", xl: "30%" },
        borderRadius: "15px",
        boxShadow: "0 2px 10px rgba(5,5,5,99%)",
        zIndex: 1000,
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          backgroundColor: "#058719cf",
          borderRadius: "15px 15px 0px 0px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "2rem", color: "white" }}>Zenbot</h2>
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          padding: "10px",
          margin: 0,
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: message.fromBot ? "flex-start" : "flex-end",
              marginBottom: "10px",
            }}
          >
            <Box component="p" sx={{ display: "flex", alignItems: "end" }}>
              <div>
                {message.fromBot && (
                  <TbMessageChatbot size={30} color="green" />
                )}
              </div>
              <Box
                sx={{
                  backgroundColor: message.fromBot ? "#dbd7d77d" : "#30b945b8",
                  padding: "5px 15px",
                  borderRadius: message.fromBot
                    ? "20px 20px 20px 0px"
                    : "20px 20px 0px 20px ",
                }}
              >
                {message.text?.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </Box>
            </Box>
          </Box>
        ))}
        {isBotLoading && (
          <Box
            key={-1}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "10px",
            }}
          >
            <Box component="p" sx={{ display: "flex", alignItems: "end" }}>
              {/* <TbMessageChatbot size={30} color="green" /> */}
              <Box
                sx={{
                  backgroundColor: "#dbd7d77d",
                  padding: "5px 15px",
                  borderRadius: "20px 20px 20px 0px",
                }}
              >
                <div>
                  Loading your request...
                  <p style={{ color: "red" }}>Please don't close the Chatbot</p>
                </div>
              </Box>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box
        className="chat-input"
        sx={{
          padding: "10px",
          borderTop: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
        }}
      >
        <textarea
          id="user-input"
          placeholder="options..."
          spellCheck="false"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
          disabled={isBotLoading}
          ref={textareaRef}
        ></textarea>
        {messages[messages.length - 1]?.text.toLowerCase() ===
        "please paste your job description...".toLowerCase() ? (
          input.length > 10 ? (
            <Button
              variant="text"
              onClick={async () => await handleFetchCopypaste(input, userEmail)}
              disabled={isBotLoading}
            >
              fetch
            </Button>
          ) : input.trim() ? (
            <Button onClick={handleSend} disabled={isBotLoading}>
              <img
                src={sendButton}
                alt="send"
                style={{ width: "35px", height: "35px" }}
              />
            </Button>
          ) : null
        ) : messages[messages.length - 1]?.text.toLowerCase() ===
          "please upload the job description and wait while we process your request...".toLowerCase() ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFile}
              disabled={isBotLoading}
            />
            <IconButton color="primary" onClick={handleButtonClick}>
              <AttachFileIcon />
            </IconButton>
            {selectedFile ? (
              <>
                <Button
                  variant="text"
                  onClick={() => handleFetch(selectedFile, userEmail)}
                  disabled={isBotLoading}
                >
                  fetch
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "green", marginRight: "5px" }}>
                    {selectedFileName}
                  </span>
                  <IconButton
                    sx={{ width: "10px", height: "10px" }}
                    onClick={clearFileSelection}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              input.trim() && (
                <Button onClick={handleSend} disabled={isBotLoading}>
                  <img
                    src={sendButton}
                    alt="send"
                    style={{ width: "35px", height: "35px" }}
                  />
                </Button>
              )
            )}
          </>
        ) : messages[messages.length - 1]?.text.toLowerCase() ===
          "type your query".toLowerCase() ? (
          <>
            {input.length === 1 ? (
              <Button onClick={handleSend} disabled={isBotLoading}>
                <img
                  src={sendButton}
                  alt="send"
                  style={{ width: "35px", height: "35px" }}
                />
              </Button>
            ) : (
              input.length > 1 && (
                <Button
                  onClick={() => handleSearch(input, userEmail)}
                  disabled={isBotLoading}
                >
                  <img
                    src={SearchIcon}
                    alt="search"
                    style={{ width: "35px", height: "35px" }}
                  />
                </Button>
              )
            )}
          </>
        ) : messages.length > 0 &&
          messages[messages.length - 1]?.text.toLowerCase() ===
            "Upload your file to validate and wait till we process".toLowerCase() ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFile}
              accept="image/*"
              style={{ display: "none" }}
            />
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current.click()}
              aria-label="upload"
            >
              <AttachFileIcon />
            </IconButton>
            {selectedFile ? (
              <>
                <Button
                  variant="text"
                  onClick={() => handleImageUpload(selectedFile)}
                  disabled={isBotLoading}
                >
                  Validate
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "green", marginRight: "5px" }}>
                    {selectedFileName}
                  </span>
                  <IconButton
                    sx={{ width: "10px", height: "10px" }}
                    onClick={clearFileSelection}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              </>
            ) : null}
          </>
        ) : input.trim() ? (
          <Button onClick={handleSend} disabled={isBotLoading}>
            <img
              src={sendButton}
              alt="send"
              style={{ width: "35px", height: "35px" }}
            />
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

export default Chatbox;
