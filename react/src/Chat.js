import { useState, useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { beginGeneratingResponse, appendResponse, markGenerationCompleted,
    markGenerationFailed, changePrompt, changeSystemMessage, trimHistory, 
    changeServerUrl, addPicturesToPrompt
} from "./actions";
import { UserMessage, AssistantMessage, MessageInProgress } from "./messages";
import ImagePreview from "./ImagePreview";


function generate(store, generator, revalidator) {
    store.dispatch(beginGeneratingResponse());
    let { systemMessage, history, serverBaseUrl } = store.getState().chat;

    generator.generate(systemMessage, history, serverBaseUrl,
        function(token) {
            store.dispatch(appendResponse(token));
            revalidator.revalidate();
        }, function() {
            store.dispatch(markGenerationCompleted());
            revalidator.revalidate();
    }).catch(err => {
        console.error(err);
        store.dispatch(markGenerationFailed(err.message));
        revalidator.revalidate();
    });
    revalidator.revalidate();
}


function GenerationError({ error }) {
    let [fade, setFade] = useState(false);

    useEffect(() => {
        setTimeout(() => setFade(true, 500));
        return () => null;
    });

    let fadeClass = fade ? "fade-in" : "fade-out";
    return (
        <div className={`error mt-2 mb-2 ${fadeClass}`}>{error}</div>
    );
}


export function ChatContainer({ store, responseGenerator }) {
    let data = useLoaderData();
    let { serverBaseUrl, systemMessage, history, prompt, images, inProgress, partialResponse, generationError } = data;

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
                defaultSystemMessage={systemMessage}
                history={history}
                pictures={images}
                inProgress={inProgress}
                partialResponse={partialResponse}
                generationError={generationError}
                onGenerate={handleGenerate}
                onRegenerate={handleRegenerate}
                onPicturesUpload={handlePicturesUpload}
                onReset={handleReset} />
        </div>
    );
}

export function Chat({ defaultSystemMessage, history, pictures, inProgress, partialResponse, generationError,
                       onGenerate, onRegenerate, onPicturesUpload, onReset}) {

    let [systemMessage, setSystemMessage] = useState(defaultSystemMessage);
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
            {generationError && <GenerationError error={generationError} />}
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