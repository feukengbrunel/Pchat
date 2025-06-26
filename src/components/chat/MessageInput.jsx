const MessageInput = ({ value, onChange, onSend }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="conversation-footer">
            <input 
                className="chat-input" 
                type="text" 
                placeholder="Type a message..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <ul className="list-inline d-flex align-items-center m-b-0">
                <li className="list-inline-item m-r-15">
                    <a className="text-gray font-size-20" href="javascript:void(0);" data-toggle="tooltip" title="Emoji">
                        <i className="anticon anticon-smile"></i>
                    </a>
                </li> 
                <li className="list-inline-item m-r-15">
                    <a className="text-gray font-size-20" href="javascript:void(0);" data-toggle="tooltip" title="Attachment">
                        <i className="anticon anticon-paper-clip"></i>
                    </a>
                </li>    
                <li className="list-inline-item">
                    <button 
                        className="d-none d-md-block btn btn-primary"
                        onClick={onSend}
                        disabled={!value.trim()}
                    >
                        <span className="m-r-10">Send</span>
                        <i className="far fa-paper-plane"></i>
                    </button>
                    <a 
                        href="javascript:void(0);" 
                        className="text-gray font-size-20 d-md-none d-block"
                        onClick={onSend}
                    >
                        <i className="far fa-paper-plane"></i>
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default MessageInput;