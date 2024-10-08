import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Link } from 'react-router-dom';

import { addPerson, toggleCollapsed, generatePrompt, setGenerationInProgress } from './actions';
import TweetGallery from './TweetGallery';
import NewPersonForm from './NewPersonForm';
import PersonDisplay from './PersonDisplay';
import NewMessageForm from './NewMessageForm';
import { AssistantMessage, UserMessage } from './messages';

let placeholder = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";
placeholder += placeholder;
placeholder += placeholder;

function App({ store }) {
  let handleSubmit = (formData) => {
    store.dispatch(addPerson(formData));
    console.log(formData);
  }

  let personas = store.getState();
  let lastOne = personas[personas.length - 1];

  const handleGenerate = person => {
    store.dispatch(setGenerationInProgress(person));
    setTimeout(() => store.dispatch(generatePrompt(person)), 15000);
  }
  return (
    <div className="App">
      <NewPersonForm onSubmit={handleSubmit} />
      <Personas store={store} />
      <div>
        <PersonDisplay person={lastOne}
                       onGenerate={handleGenerate} />
      </div>
      <div>
        <NewMessageForm />
      </div>
      <UserMessage avatar={lastOne.avatar} text={placeholder} />
      <AssistantMessage avatar={lastOne.avatar} text={placeholder} tokens={324} totalTokens={2843} modelInfo="Llama-3.1-8B-instruct" samplingParams={"Temperature: 0.87"} />
      <UserMessage avatar={lastOne.avatar} text={placeholder} />
      <AssistantMessage avatar={lastOne.avatar} text={placeholder} tokens={324} totalTokens={2843} modelInfo="Llama-3.1-8B-instruct" samplingParams={"Temperature: 0.87"} />
      <UserMessage avatar={lastOne.avatar} text={placeholder} />
      <AssistantMessage text={placeholder} tokens={324} totalTokens={2843} modelInfo="Llama-3.1-8B-instruct" samplingParams={"Temperature: 0.87"} />
    </div>
  );
}

export function Personas({ store }) {
  function handleToggle(personId, tweetId, collapsed) {
    store.dispatch(toggleCollapsed(personId, tweetId, collapsed));
  }

  let personas = store.getState().personas.map((person, idx) =>
    <Person key={idx} person={person} onToggleCollapsed={handleToggle} />
  );
  return (
    <div>
      {personas}
    </div>
  );
}


function Person({ person, onToggleCollapsed }) {
  let { name, age, language, education, tweets, avatar, pictures } = person;

  function handleToggle(tweetId, collapsed) {
    onToggleCollapsed(person.id, tweetId, collapsed);
  }

  return (
    <div className="person">
      <header className="person-title">
        <h4>{name}</h4>
      </header>
      <div className="person-avatar">
        <img src={avatar} />
      </div>
      <div className="person-body">
        <div className="mb-2">Age: {age}</div>
        <div className="mb-2">Language: {language}</div>
        <div className="mb-2">Education: {education}</div>
        <div className="mb-2">Job title: Junior Frontend Developer</div>
        <div className="mb-2">Experience: 2 years</div>
      </div>
      <div className="person-footer">
        <div className="link">
          <Link to={`/personas/${person.id}/`}>View persona</Link>
        </div>
      </div>
    </div>
  );
}


function TweetList({ tweets, onToggleCollapsed }) {
  let elements = tweets.map((t, index) => 
    <div className="mt-2 mb-2">
      <Tweet id={t.id} key={index} text={t.text} collapsed={t.collapsed} onToggleCollapsed={onToggleCollapsed}/>
    </div>
  );
  return (
    <div className="tweets-container">
      <details>
        <summary>Tweets</summary>
        <div>{elements}</div>
      </details>
    </div>
  );
}


function Tweet({ id, text, collapsed, onToggleCollapsed }) {
    let className = collapsed ? "tweet-body" : "tweet-body collapsed";
    let butonText = collapsed ? "Expand" : "Collapse";

    console.log("In tweet, id,  collapsed=", id, collapsed)

    return (
      <div className="tweet">
        <div className={className}>{text}</div>
        <button onClick={e => onToggleCollapsed(id, collapsed)}>{butonText}</button>
      </div>
    );
}

export default App;
