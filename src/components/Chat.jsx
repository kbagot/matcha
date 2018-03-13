import React from 'react';
import ChatWindow from './ChatWindow.jsx';

let toScroll = [];
let socket = [];

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
        this.autoScroll = this.autoScroll.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
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
        document.body.addEventListener('click', (ev) => {
           if (this.state.more && ev.target.name !== 'moreButton'){
               this.setState({more: false});
           }
        });
    }

    componentWillUnmount(){
        if (this.props.user.match){
            this.props.match.forEach(elem => this.props.socket.removeListener(elem.login));
        }
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.user.match && this.props.user.match !== prevProps.user.match){
            this.props.user.match.forEach(elem => {
               if (socket.indexOf(elem.login) === -1){
                   this.props.socket.on(elem.login, (data) => {
                       this.props.socket.emit('chat', {type: 'updateImg', user: {img: data[0].imgid, id: elem.id}});
                   });
                   socket.push(elem.login);
               }
            });
        }

        if (prevState.open !== this.state.open || toScroll.length) {
            const array = Array.from(this.state.open);

            toScroll = [...toScroll, ...array.filter(elem => prevState.open.indexOf(elem) === -1)];
            if (toScroll.length) {
                toScroll.map(user => this.autoScroll({login: {id: user}}));
            }
        }
    }

    autoScroll(user){
        const open = document.getElementById('Chat'+user.login.id);

        if (open){
            const index = toScroll.indexOf(user.login.id);

            toScroll.splice(index, 1);
            open.scrollTop = open.scrollHeight - open.clientHeight;
        }
    }

    componentWillUnmount(){
        this.props.socket.removeListener('chat');
    }

    newMessage(data){
        let chatIndex;

        if (this.props.user.chat){
            chatIndex = this.props.user.chat.findIndex(elem => elem.login === data.login.login);
        }

        if (!this.props.user.chat || chatIndex === -1 || (chatIndex !== -1 && this.state.open.indexOf(data.login.id.toString()) === -1)){
            this.props.socket.emit('chat', {type: 'unreadMsg', msg: data.msg, from: data.login});
        } else {
            this.props.socket.emit('chat', {type: 'readMsg', msg: data.msg, from: data.login});
        }
        this.addMsg(data.msg, data.login.id, data.login.id);
    }

    handleSubmit(ev){
        ev.preventDefault();
        const input = this.state.input[ev.target.name + "Input"];

        if (input) {
            let inputMsg = input.trim();

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
        this.setState({['history']: Object.assign({}, this.state.history, obj)}, () => this.autoScroll({login:{id: loginTo}}));
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


    handleMouseOver(ev){
        const elem = [ev.target, ev.target.parentNode].filter(elem => elem.name === 'openChat')[0];

        if (elem) {
            const ul = elem.parentNode.parentNode;

            if (ul.getAttribute('name') === 'ulChatList'){
                ul.style.overflow = 'auto';
            }
            elem.style.color = 'white';
            elem.style.backgroundColor = 'rgba(9, 70, 106, 0.42)';
        }
    }

    handleMouseOut(ev){
        const elem = [ev.target, ev.target.parentNode].filter(elem => elem.name === 'openChat')[0];

        if (elem){
            const id = elem.getAttribute('value');
            const message = this.props.user.notif.filter(elem => Number(elem.from) === Number(id) && elem.type === 'message');
            if (!message.length) {
                elem.style.backgroundColor = openChatButton.backgroundColor;
                elem.style.color = openChatButton.color;
            } else {
                elem.style.backgroundColor = '#0a466b';
                elem.style.color = 'white';
            }
        }
    }

    listUsers(list) {
        let array = list.data;

        if (array) {
            return array.map((user, index) => {

                if (user.login && user.login !== this.props.user.login) {
                    let notif = this.getMessagesNotif(user, this.props.user.notif);
                    const online = this.props.allUsers.findIndex(elem => elem.id === Number(user.id)) !== -1;
                    const obj =  online ? Object.assign({}, onlineStyle, {backgroundColor: '#13da13'}) : onlineStyle;
                    const button = notif ? Object.assign({}, openChatButton, {backgroundColor: '#0a466b', color: 'white'}) : openChatButton;

                    return <li key={index}>
                        <button  name={'openChat'} value={user.id} style={button} onClick={ev => this.closeChat(user)}>
                            <div style={obj} />
                            <span style={chatListLogin}>{user.login}</span>
                            <img style={miniImg} src={"img/" + user.imgid}/>
                        </button>
                    </li>
                }
            });
        }
    }

    renderChatWindow(user){
        const index = this.state.open.indexOf(user.id);

        if (index !== -1){
            return (
                <div style={textWindow} id={"Chat" + user.id}>
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

    handleOpenChat(ev, user){
        const id = [ev.target.getAttribute('value'), ev.target.parentNode.getAttribute('value')].filter(elem => elem)[0];
        const array = Array.from(this.state.open);
        const open = array.indexOf(user.id);

        if (open === -1) {
            array.push(user.id);
            this.setState({open: array});
            this.props.socket.emit('chat', {type: 'openChat', login: user, history: this.state.history[user.id]});
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
                const obj =  online ? Object.assign({}, miniOnline, {backgroundColor: '#13da13'}) : miniOnline;
                const windowStyle = open ? Object.assign({}, chatWindow, {height: '22vmin', bottom: '0'}) : chatWindow;

                if (user && this.props.user.match.findIndex(elem => elem.id === user.id) !== -1 && index < 5) {
                    return (
                    <div style={windowStyle} key={user+index}>
                        <div style={{width: '100%', display: 'flex', minHeight: '30px', backgroundColor: 'white', borderWidth: '1px 1px 1px 1px'}}>
                            <button style={chatButton} value={user.id} onClick={(ev) => this.handleOpenChat(ev, user)}>
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
                <button name={"moreButton"} style={moreButton} onClick={() => {
                    const index = this.state.open.indexOf(this.props.user.chat[4].id);
                    const array = Array.from(this.state.open);

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
        const array = Array.from(this.state.open);

        if (index !== -1){
            array.splice(index, 1, id);
        } else {
            array.push(0, id);
        }

        this.setState({open: array});
        this.props.socket.emit('chat', {type: 'swapIndex', user: this.props.user.chat.findIndex(elem => elem.id === id)});
    }

    closeChat(user){
        this.props.socket.emit('chat', {
            type: 'chatList',
            login: user,
            history: this.state.history[user.id]
        });
        if (this.props.user.chat) {
            const index = this.props.user.chat.findIndex(elem => elem.id === user.id);
            const obj = {};
            const array = Array.from(this.state.open);
            const open = array.indexOf(user.id);

            if (index !== -1){
                if (this.props.user.chat.length === 7) {
                    obj.more = false;
                }
                if (open !== -1){
                 array.splice(open, 1);
                 obj.open = array;
                }
            }
            else if (index === -1) {
                array.push(user.id);
                obj.open = array;
            }
            this.setState(obj);
        } else {
            const array = Array.from(this.state.open);
            const obj = {};

            array.push(user.id);
            obj.open = array;
            this.setState(obj);
        }

    }

    renderMoreChat(){
        if (this.state.more && this.props.user.chat && this.props.user.chat.length > 5){
            const chat = this.props.user.chat.map((user, index) => {
                if (index > 4){
                   return (
                       <li key={user+index} style={moreChatLi}><button name={"moreButton"} onClick={this.swapChat} value={user.id} style={moreChatButton}>{user.login}</button><button onClick={() => this.closeChat(user)} style={moreChatClose}>x</button></li>
                   )
               }
            });

            return <ul style={moreChatContainer}>{chat}</ul>;
        }
    }

    renderInvisible(){
        const length = this.props.user.chat ? this.props.user.chat.length : 0;
        const invisible = {
            width: length > 5 ? '5%' : `${100 - (length * 19)}%`,
            height: '37px',
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

        if (list && list.length) {
            return (
                <div style={container}>
                    <div style={chatContainer}>
                        {chat}
                        {this.renderInvisible()}
                    </div>
                    <ul className={'ulChatList'} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut} name={'ulChatList'} style={ulChatList}>
                        <li><h2 style={contact}>Contacts</h2></li>
                        {list}
                    </ul>
                </div>
            )
        } else {
            return <div/>
        }
    }
}


const clickZone ={
    width: '16%',
    position: 'fixed',
    right: '0',
    backgroundColor:'transparent',
    height: '4vmin'
};

const chatClose = {
    width: '10%',
    backgroundColor: 'rgb(233, 233, 233)',
    fontSize: '1.2vmin',
    outline: 'none',
    color: 'rgba(72, 99, 115, 0.73)',
    borderColor: 'rgba(9, 70, 106, 0.07)',
    borderWidth: '1px 1px 1px 0px',
    height: '3vmin'
};

const moreChatLi = {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(9, 70, 106, 0.07)',
};

const moreChatClose = {
    border: 'none',
    outline: 'none',
    fontSize: '1.5vmin',
    backgroundColor: 'rgb(233, 233, 233)',
    color: 'rgba(72, 99, 115, 0.73)'
};

const moreChatButton = {
    outline: 'none',
    width: '95%',
    border: 'none',
    padding: '0.6vmin',
    fontSize: '1vmin',
    color: 'rgba(72, 99, 115, 0.73)',
    backgroundColor: 'transparent'
};

const moreChatContainer = {
    position: 'absolute',
    bottom: '37px',
    borderRadius: '0 2px 0 0',
    margin: '0',
    padding: '0',
    width: '150px',
    listStyleType: 'none',
    backgroundColor: 'rgb(233, 233, 233)',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap'
};

const moreButton = {
    borderColor: 'rgba(9, 70, 106, 0.07)',
    outline: 'none',
    fontSize: '20px',
    backgroundColor: 'rgb(233, 233, 233)',
    width: '100%',
    height: '40px',
};

const submitButton ={
    outline: 'none',
    height: '100%',
    width: '10%',
    backgroundColor: '#dbe4e8',
    border: 'none',
    margin: '0'
};

const textInput = {
    outline: 'none',
    padding: '5px',
    width: '90%',
    color: '#0a4669',
    border: 'none',
    backgroundColor: 'transparent',
    height: '100%',
    // fontSize: '15
};

const textWindow = {
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor : 'white',
    width:'90%',
    height: '72%',
    border: '1px solid #cccccc'
};

const formInput = {
    outline: 'none',
    backgroundColor: 'white',
    padding: '0',
    margin: '0',
    color: 'white',
    height: '30px',
    fontSize: '15px',
    borderColor: 'rgb(204, 204, 204)',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
};

const chatButton = {
    outline: 'none',
    backgroundColor: 'rgba(9, 70, 106, 0.11)',
    color: 'rgba(72, 99, 115, 0.73)',
    minHeight: '37px',
    fontSize: '1vw',
    borderColor: 'rgb(233, 233, 233)',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '90%',
};

const chatWindow = {
    backgroundColor: 'white',
    width: '19%'
};

const miniImgChatButton = {
    width: '27px',
    height: '27px',
    borderRadius: '50%',
    marginRight: '1.2vmin',
};

const miniOnline = {
    width: '10px',
    height: '10px',
    marginRight: '0.5vmin',
    backgroundColor: 'gray',
    borderRadius: '100%'

};
const miniImg = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginLeft: '1vmin'
};

const contact = {
    backgroundColor: 'rgba(9, 70, 106, 0.11)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(9, 70, 106, 0.07)',
    justifyContent: 'center',
    color: 'rgb(114, 136, 148)',
    marginBottom: '1vmin',
    fontSize: '18px',
    height: '50px',
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
    backgroundColor: 'white',
    width: '230px',
    minWidth: '230px',
    position: 'fixed',
    top: '60px',
    overflow: 'hidden',
    right: '0',
    maxHeight: '70%',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    margin: '0',
    boxShadow: '0px 0px 1px #09466a42',
    zIndex: '2'
};

const onlineStyle = {
    width: '10px',
    height: '10px',
    marginRight: '5px',
    backgroundColor: 'gray',
    borderRadius: '100%'
};

const chatListLogin ={
    textAlign: 'left',
    overflow: 'hidden',
    marginRight: '5px',
    maxWidth: '100px',
    fontSize: '15px',
    whiteSpace: 'nowrap'
};

const chatContainer = {
    position: 'fixed',
    bottom: '0',
    display: 'flex',
    // height: '20vmin',
    minHeight: '250px',
    flexFlow: 'row-reverse nowrap',
    alignItems: 'flex-end',
    left: '0',
    width: '80%',
    minWidth: '864px',
    zIndex: '1'
};

const openChatButton = {
    borderRadius: '0.2vmin 0vmin 0vmin 0.2vmin',
    backgroundColor: 'rgba(9, 70, 106, 0.11)',
    color: 'rgba(72, 99, 115, 0.73)',
    borderWidth: '0px 0px 1px 0px',
    borderColor: 'rgba(9, 70, 106, 0.07)',
    display: 'flex',
    height: '45px',
    justifyContent: 'space-between',
    alignItems: 'center',
    outline: 'none',
    width: '100%',
    WebkitTransition: '0.5s'
};

