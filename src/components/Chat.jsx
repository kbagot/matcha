import React from 'react';
import ChatWindow from './ChatWindow.jsx';

export default class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            socket: this.props.socket,
            chat: [].concat(this.props.user.chat),
            open: [],
            input: {},
            history: {},
            more: false
        };
        this.renderChat = this.renderChat.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.newMessage = this.newMessage.bind(this);
        this.addMsg = this.addMsg.bind(this);
        this.handleOpenChat = this.handleOpenChat.bind(this);
        this.renderChatWindow = this.renderChatWindow.bind(this);
        this.renderInvisible = this.renderInvisible.bind(this);
        this.renderInput = this.renderInput.bind(this);
        this.renderMoreButton = this.renderMoreButton.bind(this);
        this.renderMoreChat = this.renderMoreChat.bind(this);
        this.swapChat = this.swapChat.bind(this);
        this.closeChat =this.closeChat.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('chat',  (data) => {
            if (data.type === 'chatLog') {
                let obj = {[data.id]: JSON.parse(data.log)};

                this.setState({['history']: Object.assign({}, this.state.history, obj)});
            } else if (data.type === 'allChatLog'){
                this.setState({['history']: data.log});
            } else {
                this.newMessage(data);
            }
        });
    }

    componentWillUnmount(){
        this.props.socket.removeListener('chat');
    }

    newMessage(data){
        if (!this.props.user.chat || this.props.user.chat.findIndex(elem => elem.login === data.login.login) === -1){
            this.props.socket.emit('chat', {type: 'unreadMsg', msg: data.msg, from: data.login});
        } else {
            this.addMsg(data.msg, data.login.id, data.login.id);
            this.props.socket.emit('chat', {type: 'readMsg', msg: data.msg, from: data.login});
        }
    }

    handleSubmit(ev){
        ev.preventDefault();
        let inputMsg = this.state.input[ev.target.name + "Input"].trim();

        if (inputMsg) {
            let input = Object.assign({}, this.state.input, {[ev.target.name + "Input"]: ""});

            this.setState({['input']: input});
            this.props.socket.emit("chat", {
                type: 'newMsg',
                from: {login: this.props.user.login, id: this.props.user.id},
                to: this.props.user.match.filter(elem => elem.login === ev.target.name)[0],
                msg: inputMsg
            });
            this.addMsg(inputMsg, this.props.user.match.filter(elem => elem.login === ev.target.name)[0].id, this.props.user.id);
        }
    }

    addMsg(msg, loginTo, loginFrom){
        let obj;
        let old = this.state.history[loginTo];

        if (!old){
            obj = {[loginTo]: [{msg: msg, from: loginFrom}]};
        } else {
            old.push({msg: msg, from: loginFrom});
            obj = {[loginTo]: old};
        }
        this.setState({['history']: Object.assign({}, this.state.history, obj)});
    }

    handleChange(ev){
        let obj = {[ev.target.name.trim()]: ev.target.value};

        this.setState({['input']: Object.assign({}, this.state.input, obj)});
    }

    getMessagesNotif(user, list) {
        let notif;

        if (list && typeof list === typeof []) {
            notif = list.filter(elem => elem.type === 'message' && Number(elem.from) === Number(user.id));
        }
        return notif ? notif.length : null;
    }

    listUsers(list) {
        let array = list.data;

        if (array) {
            if (list.type === "all") {
                return array.map((user, index) => {
                    if (user.login !== this.props.user.login) {
                        return <li key={index}><a href={""} value={user.id} onClick={this.props.profil}>{user.login}</a>
                            <button onClick={(ev) => this.handleLike(ev, user)}> Add</button>
                            <button onClick={(ev) => this.handleLike(ev, user)}> Remove</button>
                        </li>
                    }
                });
            } else if (list.type === "chat") {
                return array.map((user, index) => {
                    if (user.login !== this.props.user.login) {
                        let notif = this.getMessagesNotif(user, this.props.user.notif);
                        const online = this.props.allUsers.findIndex(elem => elem.id === Number(user.id)) !== -1;
                        const obj =  online ? Object.assign({}, onlineStyle, {backgroundColor: '#13da13'}) : onlineStyle;

                        return <li key={index}>
                            <button name={'openChat'} style={openChatButton} onClick={ev => this.closeChat(user)}><div style={obj} /><span style={chatListLogin}>{user.login}</span> <img style={miniImg} src={"img/" + user.imgid}/></button>
                        </li>
                    }
                });
            }
        }
    }

    renderChatWindow(user){
        const index = this.state.open.indexOf(user.id);
        const value = this.state.input[user.login + "Input"] ? this.state.input[user.login + "Input"] : "";

        if (index !== -1){

            return (
                <div style={textWindow}>
                    <ChatWindow msg={this.state.history[user.id]} socket={this.props.socket} user={this.props.user}/>
                </div>

            )
        }
    }

    renderInput(user){
        const index = this.state.open.indexOf(user.id);
        const value = this.state.input[user.login + "Input"] ? this.state.input[user.login + "Input"] : "";

        if (index !== -1) {
            return (
                <form style={formInput} name={user.login} onSubmit={this.handleSubmit}>
                    <input style={textInput} type={"text"} name={user.login + "Input"} value={value} onChange={this.handleChange}/>
                    <input style={submitButton} type={"submit"} name={"submit"} value={String.fromCodePoint(0x2934)}/>
                </form>
            )
        }
    }

    handleOpenChat(ev){
        const id = [ev.target.getAttribute('value'), ev.target.parentNode.getAttribute('value')].filter(elem => elem)[0];
        const array = this.state.open;
        const open = array.indexOf(id);

        if (open === -1) {
            array.push(id);
            this.setState({open: array});
        } else {
            array.splice(open, 1);
            this.setState({open: array});
        }
    }

    renderChat(){
        if (this.props.user.chat) {
            return this.props.user.chat.map((user, index) => {
                const online = this.props.allUsers.findIndex(elem => elem.id === Number(user.id)) !== -1;
                const open = this.state.open.indexOf(user.id) !== -1;
                const obj =  online ? Object.assign({}, onlineStyle, {backgroundColor: '#13da13'}) : onlineStyle;
                const windowStyle = open ? Object.assign({}, chatWindow, {height: '22vmin', bottom: '0'}) : chatWindow;

                if (user && this.props.user.match.findIndex(elem => elem.id === user.id) !== -1 && index < 5) {
                    return (
                    <div style={windowStyle} key={user+index}>
                        <div style={{width: '100%', display: 'flex', height: '3vmin'}}>
                            <button style={chatButton} value={user.id} onClick={this.handleOpenChat}>
                                <img style={miniImgChatButton} src={"img/" + user.imgid}/>
                                <span style={chatListLogin}>{user.login}</span>
                                <div style={obj} />
                            </button>
                            <button style={chatClose} onClick={() => this.closeChat(user)}>x</button>
                        </div>
                        {this.renderChatWindow(user)}
                        {this.renderInput(user)}
                    </div>
                    )
                }
            });
        }
    }


    renderMoreButton(length){
        if (length > 5){
            return (
                <button style={moreButton} onClick={() => {
                    const index = this.state.open.indexOf(this.props.user.chat[4].id);
                    const array = this.state.open;

                    if (index !== -1){
                        array.splice(index, 1);
                    }
                    this.setState(prevState => ({more: !prevState.more, open: array}));
                }}>
                    {'\u25B2'}
                </button>
            )
        }
    }

    swapChat(ev){
        const id = ev.target.getAttribute('value');
        const index = this.state.open.indexOf(this.props.user.chat[0].id);
        const array = this.state.open;

        console.log(array);
        if (index !== -1){
            array.splice(index, 1, id);
        } else {
            array.push(0, id);
        }

        this.setState({open: array});
        this.props.socket.emit('chat', {type: 'swapIndex', user: this.props.user.chat.findIndex(elem => elem.id === id)});
    }

    closeChat(user){
        if (this.props.user.chat) {
            const index = this.props.user.chat.findIndex(elem => elem.id === user.id);
            if (index !== -1 && this.props.user.chat.length === 7) {
                this.setState({more: false});
            } else if (index === -1) {
                const array = this.state.open;

                array.push(user.id);
                this.setState({open: array});
            }
        }
        this.props.socket.emit('chat', {
            type: 'chatList',
            login: user,
            history: this.state.history[user.id]
        })
    }

    renderMoreChat(){
        if (this.state.more && this.props.user.chat && this.props.user.chat.length > 5){
            const chat = this.props.user.chat.map((user, index) => {
                if (index > 4){
                   return (
                       <li key={user+index} style={moreChatLi}><button onClick={this.swapChat} value={user.id} style={moreChatButton}>{user.login}</button><button onClick={() => this.closeChat(user)} style={moreChatClose}>x</button></li>
                   )
               }
            });

            return <ul style={moreChatContainer}>{chat}</ul>;
        }
    }

    renderInvisible(){
        const length = this.props.user.chat ? this.props.user.chat.length : 0;
        const invisible = {
            width: length > 5 ? '5%' : `${105 - (length * 25)}%`,
            height: '3vmin',
            backgroundColor: '#dbe4e8',
        };

            return (
                <div style={invisible}>
                    {this.renderMoreChat()}
                    {this.renderMoreButton(length)}
                </div>
            )
    }

    render (){
        let list = this.listUsers({type: "chat", data: this.props.user.match, history: this.state.history});
        let chat = this.renderChat();
        let all = this.listUsers({type: 'all', data: this.props.allUsers});

        if (list && list.length) {
            return (
                <div style={container}>
                    <div style={chatContainer}>
                        {chat}
                        {this.renderInvisible()}
                    </div>
                    <ul style={ulChatList}>
                        <li><h2 style={contact}>Contacts</h2></li>
                        {list}
                    </ul>
                </div>
            )
        } else {
            return <div>{all}</div>
        }
    }
}


const chatClose = {
    width: '10%',
    backgroundColor: 'rgb(9, 70, 106)',
    fontSize: '1.2vmin',
    outline: 'none',
    color: 'white',
    border: 'none',
    height: '3vmin'
};

const moreChatLi = {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgb(67, 95, 111)',
};

const moreChatClose = {
    border: 'none',
    outline: 'none',
    fontSize: '1.5vmin',
    backgroundColor: 'transparent',
    color: 'white'
};

const moreChatButton = {
    outline: 'none',
    width: '95%',
    border: 'none',
    padding: '0.6vmin',
    fontSize: '1.3vmin',
    color: 'white',
    backgroundColor: 'transparent'
};

const moreChatContainer = {
    position: 'absolute',
    bottom: '3vmin',
    borderRadius: '0 0.2vmin  0 0',
    margin: '0',
    padding: '0',
    width: '15vmin',
    listStyleType: 'none',
    backgroundColor: 'rgb(9, 70, 106)',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap'
};

const moreButton = {
    border: 'none',
    outline: 'none',
    fontSize: '1.8vmin',
    backgroundColor: '#0a4669',
    width: '100%',
    height: '3vmin',
};

const submitButton ={
    height: '100%',
    backgroundColor: '#dbe4e8',
    border: 'none',
    margin: '0'
};

const textInput = {
    padding: '0.5vmin',
    width: '100%',
    color: '#0a4669',
    border: 'none',
    backgroundColor: 'transparent',
    height: '100%',
    fontSize: '1.2vmin'
};

const formInput = {
    outline: 'none',
    backgroundColor: 'white',
    padding: '0',
    margin: '0',
    color: 'white',
    height: '3vmin',
    fontSize: '1.3vmin',
    borderColor: 'rgb(204, 204, 204)',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
};

const chatButton = {
    outline: 'none',
    backgroundColor: '#09466a',
    color: 'white',
    height: '3vmin',
    fontSize: '1vmin',
    borderColor: '#435f6f',
    borderWidth: '1px 0 1px 1px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '90%',
};

const chatWindow = {
    backgroundColor: 'transparent',
    width: '25%'
};

const miniImgChatButton = {
    width: '2.8vmin',
    height: '2.8vmin',
    borderRadius: '50%',
    marginRight: '1.2vmin',
    boxShadow: '-3px 0px 0px #004065'
};

const miniImg = {
    width: '4vmin',
    height: '4vmin',
    borderRadius: '50%',
    boxShadow: '-3px 0px 0px #004065'
};

const contact = {
    backgroundColor: 'rgb(9, 70, 106)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #486474',
    justifyContent: 'center',
    color: 'white',
    marginBottom: '1vmin',
    fontSize: '2.8vmin',
    height: '5vmin',
    margin: '0'
};

const container = {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Verdana ,serif',
    alignItems: 'flex-end'
};

const ulChatList = {
    backgroundColor: '#0a466921',
    width: '16%',
    overflowY: 'auto',
    overflowX: 'hidden',
    right: '0',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    margin: '0',
    boxShadow: '-1px 1px 5px #09466a42',
    zIndex: '2'
};

const onlineStyle = {
    width: '1vmin',
    height: '1vmin',
    marginRight: '0.5vmin',
    backgroundColor: 'gray',
    borderRadius: '100%'
};

const chatListLogin ={
    textAlign: 'left',
    overflow: 'hidden',
    maxWidth: '13vmin',
    marginRight: '1vmin',
    fontSize: '1.3vmin'
};

const chatContainer = {
    position: 'fixed',
    bottom: '0',
    display: 'flex',
    height: '20vmin',
    flexFlow: 'row-reverse nowrap',
    alignItems: 'flex-end',
    left: '0',
    width: '84.1%',
    zIndex: '1'
};

const openChatButton = {
    borderRadius: '0.2vmin',
    backgroundColor: '#09466a',
    color: 'white',
    height: '5vmin',
    fontSize: '2vmin',
    borderWidth: '0px 0px 1px 0px',
    borderColor: '#435f6f',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    outline: 'none',
    width: '100%'
};

const textWindow = {
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor : 'white',
    height: '73%',
    border: '1px solid #cccccc'
};