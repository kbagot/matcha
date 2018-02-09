import React from 'react';
import ChatWindow from './ChatWindow.jsx';

export default class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            socket: this.props.socket,
            chat: [].concat(this.props.user.chat),
            input: {},
            message: {},
            notif: {}
        };
        this.renderChat = this.renderChat.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateObject = this.updateObject.bind(this);
        this.newMessage = this.newMessage.bind(this);
        this.addNotif = this.addNotif.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('match', (res) => {
            this.props.socket.emit('like', {type: res.type, login: res.login});
        });
        this.props.socket.on('chat', (data) => this.newMessage(data));
    }

    componentWillUnmount(){
        this.props.socket.removeListener('match');
        this.props.socket.removeListener('chat');
    }

    newMessage(data){
        let obj = this.updateObject(this.state.message, data.login, data.login, data.msg);
        let obj2 = {};

        if (this.state.chat.indexOf(data.login) === -1){
            this.props.socket.emit('chat', {type: 'unreadMsg', msg: data.msg, from: data.login});
            obj2 = this.addNotif(data.login);
        }
        this.setState({['message']: obj, ['notif']: obj2});
    }

    addNotif(login){
        let old = this.state.notif[login];
        let obj = {[login]: old ? old + 1 : 1};

        return Object.assign({}, this.state.notif, obj);
    }

    updateObject(object, loginConv, loginMsg, msg){
        let old = object[loginConv];
        let obj = {login: loginMsg, msg: msg};

        if (old) {
            old.push(obj);
        } else {
            old = [obj];
        }

        obj = {[loginConv]: old};
        return Object.assign({}, object, obj);
    }

    handleSubmit(ev){
        let input = Object.assign({}, this.state.input, {[ev.target.name + "Input"]: ""});
        let message = this.updateObject(this.state.message, ev.target.name, this.props.user.login, this.state.input[ev.target.name + "Input"]);

        this.setState({['message']: message, ['input']: input});
        this.props.socket.emit("chat", {type:'newMsg', login: ev.target.name ,msg: this.state.input[ev.target.name + "Input"]});
        ev.preventDefault();
    }

    handleChange(ev){
        let obj = {[ev.target.name.trim()]: ev.target.value};

        this.setState({['input']: Object.assign({}, this.state.input, obj)});
    }

    renderChat(){
        if (this.props.user.chat) {
            return this.props.user.chat.map(user => {
                let value = this.state.input[user + "Input"] ? this.state.input[user + "Input"] : "";

                if (user) {
                    return <div className={"chatWindow"} key={user}>
                        <h3>{user}</h3>
                        <ChatWindow msg={this.state.message[user]} socket={this.props.socket}/>
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
        let list = this.props.listUsers({type: "chat", data: this.props.user.match});
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