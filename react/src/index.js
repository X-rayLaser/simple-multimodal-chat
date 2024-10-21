import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Personas } from './App';
import PersonDisplay from './PersonDisplay';
import NewPersonForm from './NewPersonForm';
import reportWebVitals from './reportWebVitals';
import { createStore, applyMiddleware } from 'redux';
import { initialState, combinedReducer } from './reducers';
import { createHashRouter, RouterProvider, useLoaderData, Link, NavLink, 
  Outlet, Form, redirect, useNavigation, useNavigate
} from 'react-router-dom';
import {  generatePrompt, setGenerationInProgress, addPerson, 
  beginGeneratingResponse, appendResponse, markGenerationCompleted,
  changeSystemMessage, addSystemPromptToken
} from './actions';
import { ChatContainer } from './Chat';
import { useSubmit, useRevalidator, useRouteError } from "react-router-dom";
import { useState, useEffect } from 'react';


const saver = store => next => action => {
  let result = next(action)
  localStorage['app-state'] = JSON.stringify(store.getState())
  return result
}
const storeFactory = (initialState) =>
  applyMiddleware(saver)(createStore)(
    combinedReducer,
    (localStorage['app-state']) ? JSON.parse(localStorage['app-state']) : initialState
  )

const store = storeFactory(initialState);


class ResponseGenerator {
  generate(systemMessage, history, serverBaseUrl, onToken, onCompletion) {
    let preparedHistory = history.map((msg, idx) => {
      let role = idx % 2 === 0 ? "user" : "assistant";
      let texts = [{ type: "text", text: msg.text }];
      let images = [];
      if (msg.images.length > 0) {
        images = msg.images.map(image => ({ type: "image_url", image_url: { url: image } }));
      }
      return { role, content: [...texts, ...images]};
    });

    let preparedMessages = [{ role: "system", "content": systemMessage || ""}, ...preparedHistory]

    async function generateCompletion(url, messages) {
      let payload = {
        model: "llava-hf/llava-1.5-7b-hf",
        base_url: serverBaseUrl,
        messages,
      };

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onCompletion();
          return;
        }

        const decoder = new TextDecoder('utf-8');
        const token = decoder.decode(value);
        if (token) {
          onToken(token);
        }

      }
    }

    return generateCompletion("http://localhost:8000/make_response/", preparedMessages);
  }
  
}


const responseGenerator = new ResponseGenerator();


function NavBarLink({ to, children }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive, isPending }) => isPending ? "pending" : isActive ? "active" : ""}
    >
      {children}
    </NavLink>);
}

function Root() {
  return (
    <div>
      <header className="navbar">
        <nav>
          <ul>
            <li>
              <NavBarLink to="/personas">AI personas</NavBarLink>
            </li>
            <li>
              <NavBarLink to="/new-persona/">New persona</NavBarLink>
            </li>
            <li>
              <NavBarLink to="/chat/">Chat</NavBarLink>
            </li>
          </ul>
          </nav>
      </header>
      <div className="outlet">
        <Outlet />
      </div>
    </div>
  );
}

function chatLoader({ params }) {
  return store.getState().chat;
}

function personDetailLoader({ params }) {
  let id = parseInt(params.personId);
  let personas = store.getState().personas;
  let person = personas.filter(person => person.id === id)[0];
  return person;
}

function PersonDetail({ store }) {
  let person = useLoaderData();
  let submit = useSubmit();
  let revalidator = useRevalidator();

  let history = [{
    images: [],
    text: preparePrompt(person)
  }];
  let baseUrl = store.chat.serverBaseUrl;

  const handleGenerate = person => {
    submit({ person }, {
      method: "post", encType: "application/json"
    });

    responseGenerator.generate("", history, baseUrl, token => {
      store.dispatch(addSystemPromptToken(person, token));
      revalidator.revalidate();
    }, () => {

    }).catch(error => {
      console.error(error);
    }).finally(() => {
      submit({ person }, {
        method: "post", encType: "application/json", action: `/personas/${person.id}/finishGeneration/`
      })
    });
  }

  const handleStartChat = (system_prompt) => {
    submit({ system_prompt }, {
      method: "post", encType: "application/json", action: "/new-chat/"
    });
  }

  return (
    <div className="App">
      <PersonDisplay person={person} onGenerate={handleGenerate} onStartChat={handleStartChat} />
    </div>
  );
}

function preparePrompt(person) {
  let tweets = person.tweets || [];
  let tweetString = tweets.join("\n\n");
  const makeTweetSection = (text) => `\nAlso, take into account the following tweets:\n\n${text}`;
  let tweetSection = (tweets.length > 0) ? makeTweetSection(tweetString) : "";

  return `
Please, generate a system prompt of a fictional (AI) character based on the following data.

Attributes:
- name: ${person.name}
- age: ${person.age}
- education: ${person.education}
${tweetSection}

Be as creative and as imaginative as possible`;
}

function NewPersonComponent({ store }) {
  let submit = useSubmit();
  let [fade, setFade] = useState(false);

  useEffect(() => {
    setTimeout(() => setFade(true, 500));
    return () => null;
  });

  function handleSubmit(formData) {
    submit({ person: formData }, {
      method: "post", encType: "application/json"
    });
  }
  return (
    <div className={fade ? "fade-in" : "fade-out"}>
      <NewPersonForm onSubmit={handleSubmit} />
    </div>
  );
}

async function startChatAction({ request }) {
  let data = await request.json();
  let system_prompt = data.system_prompt;
  console.log("system prompt", system_prompt)
  store.dispatch(changeSystemMessage(system_prompt));
  return redirect(`/chat/`);
}

async function createPersonAction({ request, params }) {
  let data = await request.json();

  let person = data.person;

  if (person) {
    store.dispatch(addPerson(person));
  }
  return redirect(`/personas/${person.id}/`);
}

async function generateAction({ request, params }) {
  let id = params.personId;
  let data = await request.json();

  let person = data.person;

  if (person) {
    store.dispatch(setGenerationInProgress(person));
  }
  return redirect(`/personas/${id}/`);
}

async function finishGenerationAction({ request, params }) {
  let id = params.personId;
  let data = await request.json();
  let person = data.person;

  if (person) {
    store.dispatch(generatePrompt(person));
  }
  return redirect(`/personas/${id}/`);
}

function RootErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

const router = createHashRouter([{
  path: "/",
  element: <Root />,
  errorElement: <RootErrorPage />,
  children: [{
    index: true,
    element: <h2>Choose an article to see its text</h2>
  }, {
    path: "/new-persona/",
    element: <NewPersonComponent store={store} />,
    action: createPersonAction
  }, {
    path: "/personas/",
    element: <Personas store={store} />
  }, {
    path: "/personas/:personId/",
    element: <PersonDetail store={store} />,
    loader: personDetailLoader,
    action: generateAction
  }, {
    path: "/personas/:personId/finishGeneration/",
    action: finishGenerationAction
  }, {
    path: "/chat/",
    element: <ChatContainer store={store} responseGenerator={responseGenerator} />,
    loader: chatLoader
  }, {
    path: "/new-chat/",
    action: startChatAction
  }]
}]);

const root = ReactDOM.createRoot(document.getElementById('root'));

const provider = <RouterProvider router={router} />;
root.render(
  <React.StrictMode>
    {provider}
  </React.StrictMode>
);

store.subscribe(() => {
  root.render(
    <React.StrictMode>
      {provider}
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
