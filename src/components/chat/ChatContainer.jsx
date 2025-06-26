import { useState } from 'react';
import ChatList from './ChatList';
import ChatContent from './ChatContent';
import SkeletonChat from './SkeletonChat';
import { useChat } from '../../hooks/useChat';

const ChatContainer = () => {
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const { loading } = useChat();

    if (loading) return <SkeletonChat />;

    return (
        <div className="chat chat-app row">
            <div className={`chat-list ${mobileChatOpen ? 'd-none' : 'd-block d-md-block'}`}>
                <ChatList onSelect={() => setMobileChatOpen(true)} />
            </div>
            <div className={`chat-content ${!mobileChatOpen ? 'd-none d-md-block' : 'd-block'}`}>
                <ChatContent onBack={() => setMobileChatOpen(false)} />
            </div>
        </div>
    );
};

export default ChatContainer;