import { useState, useEffect, useRef } from "react";
import run from "./config/gemini";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./app.css";
import logo from "./assets/logo.png";

function App() {
  const [question, setQuestion] = useState("");
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const componentsEndRef = useRef(null);

  const scrollToBottom = () => {
    componentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [components]);
  const apiCall = async (prompt) => {
    setLoading(true);
    try {
      let response = await run(prompt);
      setLoading(false);

      response = response.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
      );

      response = response.replace(/`([^`]+)`/g, "<code>$1</code>");

      response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      response = response.replace(/_(.*?)_/g, "<em>$1</em>");
      response = response.replace(/\*(.*?)\*/g, "<em>$1</em>");

      response = response.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

      response = response.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
      response = response.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
      response = response.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
      response = response.replace(/^### (.*$)/gim, "<h3>$1</h3>");
      response = response.replace(/^## (.*$)/gim, "<h2>$1</h2>");
      response = response.replace(/^# (.*$)/gim, "<h1>$1</h1>");

      response = response.replace(/^\* (.*$)/gm, "<li>$1</li>");

      response = response.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");

      response = response.replace(/<\/ul><ul>/g, "");

      response = response.replace(/\n/g, "<br/>");

      setComponents((prevComponents) => [
        ...prevComponents,
        { type: "response", content: response },
      ]);
    } catch (error) {
      setLoading(false);
      setComponents((prevComponents) => [
        ...prevComponents,
        {
          type: "error",
          content: "!!Error Occoured while generating this responce!!",
        },
      ]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setComponents((prevComponents) => [
      ...prevComponents,
      { type: "question", content: question },
    ]);
    apiCall(question);
    setQuestion("");
  };

  const renderContent = (content) => {
    const parts = content.split(
      /(<pre><code>[\s\S]*?<\/code><\/pre>|<code>[^<]*<\/code>)/g
    );
    return parts.map((part, index) => {
      if (part.startsWith("<pre><code>") && part.endsWith("</code></pre>")) {
        const codeContent = part.slice(11, -13);
        return (
          <SyntaxHighlighter key={index} language="python" style={tomorrow}>
            {codeContent}
          </SyntaxHighlighter>
        );
      } else if (part.startsWith("<code>") && part.endsWith("</code>")) {
        const codeContent = part.slice(6, -7);
        return <code key={index}>{codeContent}</code>;
      } else {
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      }
    });
  };

  return (
    <>
      <div className="navbar">
        <div>
          <i
            className="bx bx-menu bx-sm"
            onClick={() => {
              setShowMenu(true);
              setShowProfile(false);
            }}
          ></i>
        </div>
        <div>
          <i
            class="bx bxs-user bx-sm"
            onClick={() => {
              setShowProfile(true);
              setShowMenu(false);
            }}
          ></i>
        </div>
      </div>
      <div>
        <div
          className="lefttSideDrawer drawer"
          style={showMenu ? { display: "flex" } : { display: "none" }}
        >
          <div className="drawerMainDiv">
            <i
              className="bx bx-x bx-md"
              onClick={() => {
                setShowMenu(false);
              }}
            ></i>
            <div>
              <div className="drawerOptions">history2</div>
              <div className="drawerOptions">history1</div>
            </div>
          </div>
        </div>
        <div
          className="rightSideDrawer drawer"
          style={showProfile ? { display: "flex" } : { display: "none" }}
        >
          <div className="drawerMainDiv">
            <i
              className="bx bx-x bx-md"
              style={{ textAlign: "right" }}
              onClick={() => {
                setShowProfile(false);
              }}
            ></i>
            <div className="drawerOptions">Sign In</div>
          </div>
          <div className="gitLinkedin">
            <i className="bx bxl-linkedin bx-sm" onClick={()=>window.open("https://www.linkedin.com/in/mihir-13-soni", "_blank")}></i>
            <i className="bx bxl-github bx-sm" onClick={()=> window.open("https://github.com/MrMihirSoni", "_blank")}></i>
          </div>
        </div>
        <div className="background">
          <img src={logo} style={{ width: "500px" }} />
        </div>
        <div className="main">
          {components.map((component, index) =>
            component.type === "question" ? (
              <div className="questionDiv" key={index}>
                <div className="question">{component.content}</div>
              </div>
            ) : (
              <div className="answerDiv">
                <div>
                  <img src={logo} style={{ width: "4rem" }} />
                </div>
                <div className="answer" key={index}>
                  {renderContent(component.content)}
                </div>
              </div>
            )
          )}
          <div ref={componentsEndRef} />
          {loading ? (
            <div style={{ display: "flex" }}>
              <img src={logo} style={{ width: "4rem" }} />
              <h1 style={{ color: "gray" }}>Thinking...</h1>
            </div>
          ) : null}
        </div>
        <div className="formDiv">
          <form onSubmit={handleFormSubmit}>
            <div className="form">
              <textarea
                style={{ width: "100%" }}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Write Your Question!"
                required
              />
              <button type="submit">
                <i className="bx bxs-send" style={{ fontSize: "1.2rem" }}></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
