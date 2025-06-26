import ChatContainer from '../components/chat/ChatContainer';

const ChatPage = () => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <h2 className="font-weight-bold m-b-20">Messages</h2>
                    <div className="card">
                        <div className="card-body">
                            <ChatContainer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;