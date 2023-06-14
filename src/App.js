import React, { useState, useEffect } from "react";
import "./styles.css";
import Mermaid from "./Mermaid";

function MindmappingTab({ prompt, setPrompt, result, setResult, callOpenAi }) {
  return (
    <div className="App">
      <div className="outer">
        <div>
          <div>Prompt</div>
          <div className="textarea">
            <textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div>
          <div>Output</div>
          <div className="textarea">
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
      <button onClick={() => callOpenAi()}>Create</button>
      <Mermaid key={result ? result.length : 0} chart={result} />
    </div>
  );
}

function SettingsTab({
  token,
  setToken,
  model,
  setModel,
  promptTemplate,
  setPromptTemplate,
  maxTokens,
  setMaxTokens,
  temperature,
  setTemperature
}) {
  const handlePromptTemplateChange = (e) => {
    setPromptTemplate(e.target.value);
    localStorage.setItem("promptTemplate", e.target.value);
  };

  function extractIntFromString(str) {
    const result = str.match(/\d+/);
    if (result) {
      return parseInt(result[0], 10);
    } else {
      return 0;
    }
  };

  function extractFloatFromString(str) {
    str = str.replace(',', '.'); // Replace comma with period as a decimal separator
    const result = str.match(/^-?(\d+)?(\.\d*)?/); // Match optional digits before and after the decimal point
    if (result) {
      return result[0] === '' ? '0' : result[0]; // Return '0' if the input is an empty string
    } else {
      return '0';
    }
  }

  const handleMaxTokensChange = (e) => {
    let maxTokens = extractIntFromString(e.target.value);
    setMaxTokens(maxTokens);
    localStorage.setItem("maxTokens", maxTokens);
  };

  const handleTemperatureChange = (e) => {
    let temperate = extractFloatFromString(e.target.value);
    setTemperature(temperate);
    localStorage.setItem("temperate", temperate);
  };

  return (
    <div>
      <div>OpenAI Token</div>
      <div>
        <input
          type="password"
          id="token"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="model">Model:</label>
        <select
          name="model"
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
        </select>
      </div>

      <div>
        <label htmlFor="maxTokens">max tokens:</label>
        <input
          type="text"
          id="maxTokens"
          name="maxTokens"
          value={maxTokens}
          onChange={handleMaxTokensChange}
        />
      </div>

      <div>
        <label htmlFor="temperature">temperature:</label>
        <input
          type="text"
          id="temperature"
          name="temperature"
          value={temperature}
          onChange={handleTemperatureChange}
        />
      </div>

      <div>
        <label htmlFor="promptTemplate">Prompt Template:</label>
        <textarea
          type="text"
          id="promptTemplate"
          name="promptTemplate"
          value={promptTemplate}
          onChange={handlePromptTemplateChange}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const [activeTab, setActiveTab] = useState("Mindmapping");
  const [token, setToken] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");

  const [maxTokens, setMaxTokens] = useState(
    localStorage.getItem("maxTokens") || 2000
  );

  const [temperature, setTemperature] = useState(
    localStorage.getItem("temperature") || 0.7
  );

  const [promptTemplate, setPromptTemplate] = useState(
    localStorage.getItem("promptTemplate") ||
      `Create a mermaid mindmap based on user input like these examples:
brainstorming mindmap
mindmap
\t\troot(("leisure activities weekend"))
\t\t\t\t["spend time with friends"]
\t\t\t\t::icon(fafa fa-users)
\t\t\t\t\t\t("action activities")
\t\t\t\t\t\t::icon(fafa fa-play)
\t\t\t\t\t\t\t\t("dancing at night club")
\t\t\t\t\t\t\t\t("going to a restaurant")
\t\t\t\t\t\t\t\t("go to the theater")
\t\t\t\t["spend time your self"]
\t\t\t\t::icon(fa fa-fa-user)
\t\t\t\t\t\t("meditation")
\t\t\t\t\t\t::icon(fa fa-om)
\t\t\t\t\t\t("\`take a sunbath ☀️\`")
\t\t\t\t\t\t("reading a book")
\t\t\t\t\t\t::icon(fa fa-book)
text summary mindmap:
Barack Obama (born August 4, 1961) is an American politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic Party, he was the first African-American president of the United States.
mindmap
\troot("Barack Obama")
\t\t("Born August 4, 1961")
\t\t::icon(fa fa-baby-carriage)
\t\t("American Politician")
\t\t\t::icon(fa fa-flag)
\t\t\t\t("44th President of the United States")
\t\t\t\t\t("2009 - 2017")
\t\t("Democratic Party")
\t\t\t::icon(fa fa-democrat)
\t\t("First African-American President")
cause and effects mindmap:
mindmap
\troot("Landlord sells apartment")
\t\t::icon(fa fa-sell)
\t\t("Renter must be notified of sale")
\t\t::icon(fa fa-envelope)
\t\t\t("Tenants may feel some uncertainty")
\t\t\t::icon(fa fa-question-circle)
\t\t("Notice periods must be observed")
\t\t::icon(fa fa-calendar)
\t\t\t("Landlord can submit notice of termination for personal use")
\t\t\t::icon(fa fa-home)
\t\t\t\t("Tenant has to look for a new apartment")
\t\t\t\t::icon(fa fa-search)
\t\t("New owner")
\t\t::icon(fa fa-user)
\t\t\t\t("New owner takes over existing rental agreement")
\t\t\t\t::icon(fa fa-file-contract)
\t\t\t\t\t\t("Tenant keeps previous apartment")
\t\t\t\t\t\t::icon(fa fa-handshake)
\t\t\t\t("New owner terminates newly concluded lease")
\t\t\t\t::icon(fa fa-ban)
\t\t\t\t\t\t("Tenant has to look for a new apartment")
\t\t\t\t\t\t::icon(fa fa-search)
Only one root, use free FontAwesome icons, and follow node types "[", "(". No need to use "mermaid", "\`\`\`", or "graph TD". Respond only with code and syntax.`
  );

  useEffect(() => {});

  // gpt-3.5-turbo
  async function callOpenAi() {
    setResult("");

    console.log(temperature);
    let url = "https://api.openai.com/v1/chat/completions";
    let data = {
      model: model,
      messages: [
        {
          role: "system",
          content: promptTemplate
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      max_tokens: maxTokens,
      temperature: Number(temperature)
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let text = "";

    let resultString = ""; // Define resultString here to collect all results

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      text += decoder.decode(value, { stream: true });
      const lines = text.split("\n");
      text = lines.pop();

      for (const line of lines) {
        const message = line.replace(/^data: /, "").trim();

        if (message === "") {
          continue;
        }

        if (message === "[DONE]") {
          /*setResult((prev) => {
            let result = processString(prev);
            console.log(result);
            return result;
          });*/
          return;
        }

        try {
          const parsed = JSON.parse(message);
          let result = parsed.choices[0].delta.content || "";

          // Append each line to the resultString
          if (
            result !== "```" &&
            result !== "```mermaid" &&
            !result.includes("mermaid")
          ) {
            resultString += result;
          }

          // If the result contains a newline, update the result state
          if (
            result.includes("\n") &&
            result !== "```" &&
            result !== "```mermaid" &&
            !result.includes("mermaid")
          ) {
            setResult(resultString);
          }
        } catch (error) {
          console.error("Could not JSON parse stream message", {
            message,
            error
          });
        }
      }
    }

    console.log("before processString");
    // Set the final state after the loop ends if it hasn't been set yet
    if (
      !resultString.includes("\n") &&
      result !== "```" &&
      result !== "```mermaid" &&
      !result.includes("mermaid")
    ) {
      setResult(resultString);
    }
  }

  return (
    <div className="App">
      <div className="tab-buttons">
        <button
          className="tab-button"
          onClick={() => setActiveTab("Mindmapping")}
        >
          Mindmapping
        </button>
        <button className="tab-button" onClick={() => setActiveTab("Settings")}>
          Settings
        </button>
      </div>
      {activeTab === "Mindmapping" ? (
        <MindmappingTab
          prompt={prompt}
          setPrompt={setPrompt}
          result={result}
          setResult={setResult}
          callOpenAi={callOpenAi}
          model={model}
          promptTemplate={promptTemplate}
        />
      ) : (
        <SettingsTab
          token={token}
          setToken={setToken}
          model={model}
          setModel={setModel}
          promptTemplate={promptTemplate}
          setPromptTemplate={setPromptTemplate}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          temperature={temperature}
          setTemperature={setTemperature}
        />
      )}
    </div>
  );
}
