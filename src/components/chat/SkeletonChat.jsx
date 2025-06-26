const SkeletonChat = () => {
    return (
        <div className="chat chat-app row">
            <div className="chat-list">
                <div className="chat-user-tool">
                    <div className="ant-skeleton-input" style={{ width: '100%' }}></div>
                </div>
                <div className="chat-user-list">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="chat-list-item p-h-25">
                            <div className="media align-items-center">
                                <div className="ant-skeleton-avatar ant-skeleton-avatar-circle" style={{ width: 40, height: 40 }}></div>
                                <div className="p-l-15" style={{ width: '70%' }}>
                                    <div className="ant-skeleton-paragraph" style={{ width: '60%', marginBottom: 8 }}></div>
                                    <div className="ant-skeleton-paragraph" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-content">
                <div className="conversation">
                    <div className="conversation-wrapper">
                        <div className="conversation-header justify-content-between">
                            <div className="media align-items-center">
                                <div className="ant-skeleton-avatar ant-skeleton-avatar-circle" style={{ width: 40, height: 40 }}></div>
                                <div className="p-l-15" style={{ width: '60%' }}>
                                    <div className="ant-skeleton-paragraph" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="conversation-body">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="msg" style={{ marginBottom: 16 }}>
                                    <div className="bubble">
                                        <div className="ant-skeleton-paragraph" style={{ width: `${Math.random() * 50 + 30}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="conversation-footer">
                            <div className="ant-skeleton-input" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonChat;