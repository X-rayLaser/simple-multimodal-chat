import React, { useState, useEffect } from 'react';
import markdownit from 'markdown-it';
import hljs from 'highlight.js' // https://highlightjs.org
import 'highlight.js/styles/github.css';

const MessageCard = ({ role, avatar, text, modelInfo, samplingParams, tokens, totalTokens, onRegenerate, theme, buttonDisabled=true }) => {
  let [fade, setFade] = useState(false);

  useEffect(() => {
    setTimeout(() => setFade(true, 500));
    return () => null;
  });

  let fadeClass = fade ? "fade-in" : "fade-out";

  const md = markdownit({
    highlight: function (str, lang) {

      console.log("markdowning: ", str, lang);
      if (lang && hljs.getLanguage(lang)) {
        try {
          let value = hljs.highlight(str, { language: lang }).value;
          
          return `<pre><code class="hljs">${value}</code></pre>`;
        } catch (__) {}
      }
  
      return ''; // use external default escaping
    }
  });
  const result = md.render(text);

  let innerHtml = {
    __html: result
  };

  return (
    <div className={`message-card ${theme} ${fadeClass}`}>
      <div className="message-header">
        {avatar && <img src={avatar} alt={`${role} avatar`} className="avatar" />}
        <span className="role">{role}</span>
      </div>
      <div className="message-body">
        <pre dangerouslySetInnerHTML={innerHtml} style={{whiteSpace: 'break-spaces'}} />
      </div>
      <div className="message-footer">
        {role === 'assistant' && (
            <details>
                <summary>Generation details</summary>
                {modelInfo && <p>Model: {modelInfo}</p>}
                {samplingParams && <p>Sampling: {samplingParams}</p>}
                {tokens && <p>Tokens: {tokens}</p>}
                {totalTokens && <p>Total Tokens: {totalTokens}</p>}
            </details>
        )}
        {role === 'assistant' && (
            <div className="regenerate-row">
                <button onClick={onRegenerate} disabled={buttonDisabled}>Regenerate</button>
            </div>
        )}
      </div>
    </div>
  );
};

export const AssistantMessage = ({ avatar, text, modelInfo, samplingParams, tokens, totalTokens, onRegenerate, buttonDisabled }) => (
  
  <MessageCard
    role="assistant"
    avatar={avatar}
    text={text}
    modelInfo={modelInfo}
    samplingParams={samplingParams}
    tokens={tokens}
    totalTokens={totalTokens}
    onRegenerate={onRegenerate}
    theme="assistant-theme"
    buttonDisabled={buttonDisabled}
  />
);

export const UserMessage = ({ avatar, text }) => (
  <MessageCard
    role="user"
    avatar={avatar}
    text={text}
    theme="user-theme"
  />
);


export const MessageInProgress = ({ avatar, text }) => {
  <MessageCard
    role="assistant"
    avatar={avatar}
    text={text}
    theme="assistant-theme"
  />
}