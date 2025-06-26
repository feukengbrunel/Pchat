import { useChat } from '../../hooks/useChat';

const ChatList = ({ onSelect }) => {
    const { conversations, selectConversation, loading } = useChat();

    // Trier les conversations par dernier message
    const sortedConversations = [...conversations].sort((a, b) => {
        const aTime = a.lastMessage?.timestamp?.toDate()?.getTime() || 0;
        const bTime = b.lastMessage?.timestamp?.toDate()?.getTime() || 0;
        return bTime - aTime;
    });

    return (
        <>
            <div className="chat-user-tool">
                <i className="anticon anticon-search search-icon p-r-10 font-size-20"></i>
                <input placeholder="Search..." />
            </div>
            <div className="chat-user-list">
                {sortedConversations.map(conversation => (
                    <a 
                        key={conversation.id} 
                        className="chat-list-item p-h-25" 
                        href="javascript:void(0);"
                        onClick={() => {
                            selectConversation(conversation);
                            onSelect();
                        }}
                    >
                        <div className="media align-items-center">
                            <div className="avatar avatar-image">
                                <img src={conversation.photoURL || 'default-avatar.jpg'} alt={conversation.displayName} />
                            </div>
                            <div className="p-l-15">
                                <h5 className="m-b-0">{conversation.displayName}</h5>
                                <p className="msg-overflow m-b-0 text-muted font-size-13">
                                    {conversation.lastMessage?.with === conversation.id 
                                        ? `You: ${conversation.lastMessage.text}`
                                        : conversation.lastMessage?.text || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </>
    );
};

export default ChatList;