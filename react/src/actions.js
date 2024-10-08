const TOGGLE_COLLAPSED = "toggle_collapsed";
const ADD_PERSON = "add_person";
const GENERATE_PROMPT = "generate_prompt";
const GENERATION_IN_PROGRESS = "generation_in_progress";
const BEGIN_GENERATING_RESPONSE = "begin_generating_response";
const APPEND_RESPONSE = "append_response";
const MARK_GENERATION_AS_COMPLETED = "mark_generation_as_completed"
const CHANGE_PROMPT = "change_prompt";
const CHANGE_SYSTEM_MESSAGE = "change_system_message";
const TRIM_HISTORY = "trim_history";
const CHANGE_SERVER_BASE_URL = "change_server_base_url";
const ADD_PICTURES_TO_PROMPT = "add_pictures_to_prompt";


const toggleCollapsed = (personId, tweetId) => ({
    type: TOGGLE_COLLAPSED,
    personId,
    tweetId
});

const addPerson = (person) => ({
    type: ADD_PERSON,
    person
});

const generatePrompt = person => ({
    type: GENERATE_PROMPT,
    person
});

const setGenerationInProgress = person => ({
    type: GENERATION_IN_PROGRESS,
    person
});

const beginGeneratingResponse = () => ({
    type: BEGIN_GENERATING_RESPONSE
});

const appendResponse = (text) => ({
    type: APPEND_RESPONSE,
    text
});

const markGenerationCompleted = () => ({
    type: MARK_GENERATION_AS_COMPLETED
});

const changePrompt = (prompt) => ({
    type: CHANGE_PROMPT,
    prompt
});

const changeSystemMessage = systemMessage => ({
    type: CHANGE_SYSTEM_MESSAGE,
    systemMessage
});

const trimHistory = idx => ({
    type: TRIM_HISTORY,
    idx
});

const changeServerUrl = url => ({
    type: CHANGE_SERVER_BASE_URL,
    url
});

const addPicturesToPrompt = pictures => ({
    type: ADD_PICTURES_TO_PROMPT,
    pictures
});

export {
    toggleCollapsed,
    addPerson,
    generatePrompt,
    setGenerationInProgress,
    beginGeneratingResponse,
    appendResponse,
    markGenerationCompleted,
    changePrompt,
    changeSystemMessage,
    trimHistory,
    changeServerUrl,
    addPicturesToPrompt,

    GENERATION_IN_PROGRESS,
    TOGGLE_COLLAPSED,
    ADD_PERSON,
    GENERATE_PROMPT,
    BEGIN_GENERATING_RESPONSE,
    APPEND_RESPONSE,
    MARK_GENERATION_AS_COMPLETED,
    CHANGE_PROMPT,
    CHANGE_SYSTEM_MESSAGE,
    TRIM_HISTORY,
    CHANGE_SERVER_BASE_URL,
    ADD_PICTURES_TO_PROMPT
}