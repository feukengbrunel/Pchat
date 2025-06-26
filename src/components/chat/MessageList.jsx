import Message from './Message';

const MessageList = ({ messages }) => {
  // Grouper les messages par jour
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedMessages).map(([date, dailyMessages]) => (
        <div key={date}>
          <div className="msg justify-content-center">
            <div className="font-weight-semibold font-size-12">
              {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          {dailyMessages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      ))}
    </>
  );
};

export default MessageList;