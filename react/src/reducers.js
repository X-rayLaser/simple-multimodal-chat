import { TOGGLE_COLLAPSED, ADD_PERSON, GENERATE_PROMPT, 
    GENERATION_IN_PROGRESS, BEGIN_GENERATING_RESPONSE, 
    APPEND_RESPONSE, MARK_GENERATION_AS_COMPLETED, CHANGE_PROMPT, CHANGE_SYSTEM_MESSAGE,
    TRIM_HISTORY, CHANGE_SERVER_BASE_URL, ADD_PICTURES_TO_PROMPT
} from "./actions";

const promptMock = "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";

const initialState = {
    personas: [],
    chat: {
        systemMessage: "",
        history: [],
        prompt: "",
        images: [],
        inProgress: false,
        partialResponse: "",
        serverBaseUrl: ""
    }
};


const generateSystemPrompt = person => promptMock


const tweetsReducer = (state=[], action) => {
    return state.map(tweet => 
        tweet.id === action.tweetId ? {...tweet, collapsed: !tweet.collapsed} : {...tweet}
    );
}

const personReducer = (state={}, action) => {
    if (action.type === TOGGLE_COLLAPSED) {
        return {
            ...state,
            tweets: tweetsReducer(state.tweets, action)
        };
    } else if (action.type === GENERATION_IN_PROGRESS) {
        return {
            ...state,
            system_prompt: '',
            generating: true
        }
    } else if (action.type === GENERATE_PROMPT) {
        let system_prompt = generateSystemPrompt(action.person);
        return {
            ...state,
            system_prompt,
            generating: false
        }
    } else {
        return {...state};
    }
}

const personListReducer = (state=[], action) => {
    if (action.type === TOGGLE_COLLAPSED) {
        return state.map(person =>
            action.personId === person.id ? personReducer(person, action) : {...person}
        );
    } else if (action.type === ADD_PERSON) {
        return [...state, action.person];
    } else if (action.type === GENERATE_PROMPT || action.type === GENERATION_IN_PROGRESS) {
        return state.map(person => person.id === action.person.id ? personReducer(person, action) : {...person});
    } else {
        return [...state];
    }
}

const chatReducer = (state={}, action) => {
    let chat = state;
    if (action.type === CHANGE_PROMPT) {
        return {
            ...chat,
            prompt: action.prompt
        };
    } else if (action.type === ADD_PICTURES_TO_PROMPT) {
        return {
            ...chat,
            images: action.pictures
        };
    } else if (action.type === CHANGE_SYSTEM_MESSAGE) {
        return {
            ...chat,
            systemMessage: action.systemMessage
        }
    } else if (action.type === CHANGE_SERVER_BASE_URL) {
        return {
            ...chat,
            serverBaseUrl: action.url
        };
    } else if (action.type === TRIM_HISTORY) {
        let history = chat.history.filter((_, idx) => idx < action.idx);
        return {
            ...chat,
            history
        }
    } else if (action.type === BEGIN_GENERATING_RESPONSE) {
        let historyLen = chat.history.length;
        let history;
        if (historyLen % 2 === 0) {
            let msg = {
                text: chat.prompt,
                images: chat.images
            };
            history = [...state.history, msg];
        } else {
            history = [...state.history];
        }

        return {
            ...chat,
            inProgress: true,
            partialResponse: "",
            prompt: "",
            images: [],
            history
        };
    } else if (action.type === APPEND_RESPONSE) {
        return {
            ...chat,
            partialResponse: chat.partialResponse + action.text
        };
    } else if (action.type === MARK_GENERATION_AS_COMPLETED) {
        return {
            ...chat,
            history: [...chat.history, { text: chat.partialResponse, images: [] }],
            inProgress: false,
        };
    } else {
        return {...state}
    }
}

const combinedReducer = (state={}, action) => {
    if (action.type === BEGIN_GENERATING_RESPONSE ||
        action.type === APPEND_RESPONSE ||
        action.type === MARK_GENERATION_AS_COMPLETED ||
        action.type === CHANGE_PROMPT ||
        action.type === CHANGE_SYSTEM_MESSAGE ||
        action.type === TRIM_HISTORY ||
        action.type === CHANGE_SERVER_BASE_URL ||
        action.type === ADD_PICTURES_TO_PROMPT)
    {
        return {
            ...state,
            chat: chatReducer(state.chat, action)
        };
    }
    let personas = personListReducer(state.personas, action);
    let res = {
        ...state,
        personas
    };
    return res;
}

export {
    initialState,
    combinedReducer
};