const ChatHeader = ({ user, onBack }) => {
  // Données d'exemple - à remplacer par vos props réelles
  const currentChatUser = user || {
    name: "Erin Gonzales",
    avatar: "/assets/images/avatars/thumb-1.jpg",
    status: "online"
  };

  const menuItems = [
    { key: '1', label: 'Profil' },
    { key: '2', label: 'Notifications' },
    { key: '3', label: 'Archiver' },
    { key: '4', label: 'Supprimer', danger: true },
  ];

  return (
    <div className="conversation-header justify-content-between">
      <div className="media align-items-center">
        <a 
          href="#back" 
          className="chat-close m-r-20 d-md-none d-block text-dark font-size-18 m-t-5"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          <i className="anticon anticon-left-circle"></i>
        </a>
        
        <div className="avatar avatar-image">
          <img src={currentChatUser.avatar} alt={currentChatUser.name} />
        </div>
        
        <div className="p-l-15">
          <h6 className="m-b-0">{currentChatUser.name}</h6>
          <p className="m-b-0 text-muted font-size-13 m-b-0">
            <span className={`badge badge-${currentChatUser.status === 'online' ? 'success' : 'default'} badge-dot m-r-5`}></span>
            <span>{currentChatUser.status === 'online' ? 'En ligne' : 'Hors ligne'}</span>
          </p>
        </div>
      </div>
      
     
    </div>
  );
};

export default ChatHeader;