import React from 'react';
import ChatWindow from './ChatWindow.jsx';

export default class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            socket: this.props.socket,
            chat: [].concat(this.props.user.chat),
            input: {},
            history: {}
        };
        this.renderChat = this.renderChat.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.newMessage = this.newMessage.bind(this);
        this.addMsg = this.addMsg.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('chat',  (data) => {
            if (data.type === 'chatLog') {
                let obj = {[data.login]: JSON.parse(data.log)};

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
        if (this.props.user.chat.indexOf(data.login.login) === -1){
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

    renderChat(){
        if (this.props.user.chat) {
            return this.props.user.chat.map(user => {
                console.log(user);
                console.log(this.state.input);
                let value = this.state.input[user + "Input"] ? this.state.input[user + "Input"] : "";

                if (user && this.props.user.match.findIndex(elem => elem.login === user) !== -1) {
                    let id = this.props.user.match.filter(elem => elem.login === user)[0].id;
                    return <div className={"chatWindow"} key={user}>
                        <h3>{user}</h3>
                        <ChatWindow msg={this.state.history[id]} socket={this.props.socket}/>
                        <form name={user} onSubmit={this.handleSubmit}>
                            <input type={"text"} name={user + "Input"} value={value} onChange={this.handleChange}/>
                            <input type={"submit"} name={"submit"} value={String.fromCodePoint(0x2934)}/>
                        </form>
                    </div>
                }
            });
        }
    }

    render (){
        let list = this.props.listUsers({type: "chat", data: this.props.user.match, history: this.state.history});
        let chat = this.renderChat();

        return (
            <div className={"chat"}>
                <h2>Chat Users</h2>
                <ul>{list}</ul>
                 {chat}
            </div>
        )
    }
}