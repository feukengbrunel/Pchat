import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatContent = ({ onBack }) => {
    const { selectedConversation, messages, sendMessage } = useChat();
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (!selectedConversation) {
        return (
            <div className="conversation d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <h4>Select a conversation</h4>
                    <p>Choose a friend to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="conversation">
            <div className="conversation-wrapper">
                <div className="conversation-header justify-content-between">
                    <div className="media align-items-center">
                        <a 
                            href="javascript:void(0);" 
                            className="chat-close m-r-20 d-md-none d-block text-dark font-size-18 m-t-5"
                            onClick={onBack}
                        >
                            <i className="anticon anticon-left-circle"></i>
                        </a>
                        <div className="avatar avatar-image">
                            <img src={selectedConversation.photoURL || 'default-avatar.jpg'} alt={selectedConversation.displayName} />
                        </div>
                        <div className="p-l-15">
                            <h6 className="m-b-0">{selectedConversation.displayName}</h6>
                            <p className="m-b-0 text-muted font-size-13 m-b-0">
                                <span className="badge badge-success badge-dot m-r-5"></span>
                                <span>Online</span>
                            </p>
                        </div>
                    </div>
                    <div className="dropdown dropdown-animated scale-left">
                        <a className="text-dark font-size-20" href="javascript:void(0);" data-toggle="dropdown">
                            <i className="anticon anticon-setting"></i>
                        </a>
                        <div className="dropdown-menu">
                            <button className="dropdown-item" type="button">View profile</button>
                            <button className="dropdown-item" type="button">Mute notifications</button>
                            <button className="dropdown-item" type="button">Block user</button>
                        </div>
                    </div>
                </div>
                <div className="conversation-body">
                    {messages.map((message, index) => (
                        <Message 
                            key={message.id} 
                            message={message} 
                            showAvatar={index === 0 || messages[index-1].userId !== message.userId}
                        />
                    ))}
                </div>
                <MessageInput 
                    value={newMessage}
                    onChange={setNewMessage}
                    onSend={handleSend}
                />
            </div>
        </div>
    );
};

export default ChatContent;