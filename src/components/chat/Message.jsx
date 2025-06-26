const Message = ({ message, showAvatar }) => {
    return message.isCurrentUser ? (
        <div className="msg msg-sent">
            <div className="bubble">
                <div className="bubble-wrapper">
                    <span>{message.text}</span>
                </div>
            </div>
        </div>
    ) : (
        <div className="msg msg-recipient">
            {showAvatar && (
                <div className="m-r-10">
                    <div className="avatar avatar-image">
                        <img src={message.userAvatar || 'default-avatar.jpg'} alt={message.userName} />
                    </div>
                </div>
            )}
            <div className="bubble">
                <div className="bubble-wrapper">
                    <span>{message.text}</span>
                </div>
            </div>
        </div>
    );
};

export default Message;