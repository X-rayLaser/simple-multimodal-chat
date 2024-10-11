import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { beginGeneratingResponse, appendResponse, markGenerationCompleted, 
    changePrompt, changeSystemMessage, trimHistory, changeServerUrl, addPicturesToPrompt
} from "./actions";
import { UserMessage, AssistantMessage, MessageInProgress } from "./messages";
import ImagePreview from "./ImagePreview";


function generate(store, generator, revalidator) {
    store.dispatch(beginGeneratingResponse());
    let { newSysMsg, newHistory } = store.getState().chat;
    generator.generate(
        function(token) {
            store.dispatch(appendResponse(token));
            revalidator.revalidate();
        }, function() {
            store.dispatch(markGenerationCompleted());
            revalidator.revalidate();
        });
    revalidator.revalidate();
}


export function ChatContainer({ store, responseGenerator }) {
    let data = useLoaderData();
    let { serverBaseUrl, systemMessage, history, prompt, images, inProgress, partialResponse } = data;

    let revalidator = useRevalidator();

    function handleBaseUrlChange(e) {
        let value = e.target.value;
        store.dispatch(changeServerUrl(value));
        revalidator.revalidate();
    }

    function handleGenerate(e, systemMessage, prompt) {
        store.dispatch(changeSystemMessage(systemMessage))
        store.dispatch(changePrompt(prompt));
        generate(store, responseGenerator, revalidator);
        e.preventDefault();
    }

    function handlePicturesUpload(dataURIs) {
        store.dispatch(addPicturesToPrompt(dataURIs));
        revalidator.revalidate();
    }

    function handleRegenerate(msgIdx) {
        store.dispatch(trimHistory(msgIdx));
        generate(store, responseGenerator, revalidator);
    }

    function handleReset() {
        store.dispatch(trimHistory(0));
        revalidator.revalidate();
    }
    return (
        <div className="chat">
            <form className="settings-panel">
                <div className="base-url">
                    <label for="base-url-input">Base Url:</label>
                    <input
                        id="base-url-input"
                        type="text"
                        placeholder="Base url of the LLM server"
                        value={serverBaseUrl}
                        onChange={handleBaseUrlChange} />
                </div>
            </form>
            <Chat 
                history={history}
                pictures={images}
                inProgress={inProgress}
                partialResponse={partialResponse}
                onGenerate={handleGenerate}
                onRegenerate={handleRegenerate}
                onPicturesUpload={handlePicturesUpload}
                onReset={handleReset} />
        </div>
    );
}

export function Chat({ history, pictures, inProgress, partialResponse, 
                       onGenerate, onRegenerate, onPicturesUpload, onReset}) {

    let [systemMessage, setSystemMessage] = useState("");
    let [prompt, setPrompt] = useState("");

    let messages = history.map((msg, idx) => {
        let element = (idx % 2 === 0 ? <UserMessage text={msg.text} />
            : <AssistantMessage 
                text={msg.text} 
                onRegenerate={() => onRegenerate(idx)}
                buttonDisabled={inProgress} />);
        return <div key={idx} className="mb-2">{element}</div>;
    });

    const handlePicturesChange = (e) => {
        const files = Array.from(e.target.files);
        const readers = files.map((file) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
          });
        });
    
        Promise.all(readers).then((dataURIs) => {
            onPicturesUpload(dataURIs);
        });
    };

    function handlePromptChange(e) {
        let value = e.target.value;
        setPrompt(value);
    }

    function handleSystemMessageChange(e) {
        let value = e.target.value;
        setSystemMessage(value);
    }

    function handleSubmit(e) {
        onGenerate(e, systemMessage, prompt);
        setPrompt("");
    }

    const removePicture = (index) => {
        
    };

    let finishedResponse = history.length % 2 === 0;

    let buttonDisabled = inProgress || (finishedResponse && prompt.length === 0);
    
    return (
        <div>
            <textarea
                value={systemMessage} 
                disabled={inProgress}
                className="prompt"
                onChange={handleSystemMessageChange}
                placeholder="Enter your system message here"></textarea>
            <div>{messages}</div>

            {inProgress && partialResponse.length > 0 && (
                <AssistantMessage text={partialResponse} />
            )}

            <form onSubmit={handleSubmit}>
                {!inProgress && finishedResponse && (
                    <textarea 
                        className="mt-2 prompt mb-2" 
                        value={prompt} 
                        onInput={handlePromptChange}
                        placeholder="Enter your prompt text here"></textarea>
                )}
                <div>
                
                <label className="mt-2 mb-2">Pictures:</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePicturesChange}
                    className="mb-2"
                />
                {pictures.length > 0 && (
                    <div className="pictures-container">
                        {pictures.map((pic, index) => (
                            <ImagePreview key={index} url={pic} onRemove={() => removePicture(index)} />
                        ))}
                    </div>
                )}
                </div>
                <button type="submit" disabled={buttonDisabled} className="submit-button">Generate</button>
                <button 
                    type="button"
                    className="submit-button ms-2" 
                    disabled={inProgress}
                    onClick={onReset}
                    >
                    Reset chat
                </button>
            </form>
        </div>
    );
}