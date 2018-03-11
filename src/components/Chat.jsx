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
            history: {}
        };
        this.renderChat = this.renderChat.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.newMessage = this.newMessage.bind(this);
        this.addMsg = this.addMsg.bind(this);
        this.handleOpenChat = this.handleOpenChat.bind(this);
        this.renderChatWindow = this.renderChatWindow.bind(this);
        this.renderInvisible = this.renderInvisible.bind(this);
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
                            <button name={'openChat'} style={openChatButton} onClick={() => this.props.socket.emit('chat', {
                                type: 'chatList',
                                login: user,
                                history: list.history[user.id]
                            })}><div style={obj} /><span style={chatListLogin}>{user.login}</span> <img style={miniImg} src={"img/" + user.imgid}/></button>
                        </li>
                    }
                });
            }
        }
    }

    renderChatWindow(id){
        const index = this.state.open.indexOf(id);

        if (index !== -1){

            return (
                <div style={textWindow}>
                <ChatWindow msg={this.state.history[id]} socket={this.props.socket}/>
                </div>
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
                let value = this.state.input[user.login + "Input"] ? this.state.input[user.login + "Input"] : "";
                const online = this.props.allUsers.findIndex(elem => elem.id === Number(user.id)) !== -1;
                const open = this.state.open.indexOf(user.id) !== -1;
                const obj =  online ? Object.assign({}, onlineStyle, {backgroundColor: '#13da13'}) : onlineStyle;
                const windowStyle = open ? Object.assign({}, chatWindow, {height: '22vmin', bottom: '0'}) : chatWindow;

                if (user && this.props.user.match.findIndex(elem => elem.id === user.id) !== -1) {
                    return (
                    <div style={windowStyle} key={user+index}>
                        <button style={chatButton} value={user.id} onClick={this.handleOpenChat}>
                            <div style={obj} />
                            <span style={chatListLogin}>{user.login}</span>
                            <img style={miniImgChatButton} src={"img/" + user.imgid}/>
                        </button>
                        {this.renderChatWindow(user.id)}

                        {/*<form name={user.login} onSubmit={this.handleSubmit}>*/}
                            {/*<input type={"text"} name={user.login + "Input"} value={value} onChange={this.handleChange}/>*/}
                            {/*<input type={"submit"} name={"submit"} value={String.fromCodePoint(0x2934)}/>*/}
                        {/*</form>*/}
                        </div>
                    )
                }
            });
        }
    }

    renderInvisible(){
        const lenght = this.props.user.chat ? this.props.user.chat : 0;
        const invisible = {
            width: `${100 - (length * 20)}%`,
            height: '3vmin',
            backgroundColor: '#dbe4e8'
        };

        return (
            <div style={invisible}>
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


const chatButton = {
    outline: 'none',
    borderRadius: '0.2vmin 0.2vmin 0 0',
    backgroundColor: '#09466a',
    color: 'white',
    height: '3vmin',
    fontSize: '1.3vmin',
    borderColor: '#435f6f',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '19vmin',

};

const chatWindow = {
    backgroundColor: 'transparent',
    width: '18.9vmin'
};

const miniImgChatButton = {
    width: '2.8vmin',
    height: '2.8vmin',
    borderRadius: '50%',
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
    width: '21.4vmin',
    height: '97%',
    overflowY: 'auto',
    right: '0',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    margin: '0',
    boxShadow: '-1px 1px 5px #09466a42',
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
    width: '13vmin',
    fontSize: '1.3vmin'
};

const chatContainer = {
    position: 'fixed',
    bottom: '0',
    display: 'flex',
    height: '20vmin',
    flexFlow: 'row-reverse nowrap',
    alignItems: 'flex-end',
    width: '100%',
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
    width: '20vmin',
    outline: 'none'
};

const textWindow = {
    position: 'absolute',
    width: '18.8vmin',
    height: '81%',
    border: '1px solid black'
};