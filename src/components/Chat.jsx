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
        };
        this.renderChat = this.renderChat.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateObject = this.updateObject.bind(this);
        this.newMessage = this.newMessage.bind(this);
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

        if (this.state.chat.indexOf(data.login) === -1){
            this.props.socket.emit('chat', {type: 'unreadMsg', msg: data.msg, from: data.login});
        } else {
            this.props.socket.emit('chat', {type: 'readMsg', msg: data.msg, from: data.login});
        }
        this.setState({['message']: obj});
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
        let inputMsg = this.state.input[ev.target.name + "Input"].trim();
        if (inputMsg) {
            let input = Object.assign({}, this.state.input, {[ev.target.name + "Input"]: ""});
            let message = this.updateObject(this.state.message, ev.target.name, this.props.user.login, inputMsg);

            this.setState({['message']: message, ['input']: input});
            this.props.socket.emit("chat", {
                type: 'newMsg',
                from: this.props.user.login,
                login: ev.target.name,
                msg: inputMsg
            });
        }
        ev.preventDefault();
    }

    handleChange(ev){
        let obj = {[ev.target.name.trim()]: ev.target.value};

        this.setState({['input']: Object.assign({}, this.state.input, obj)});
    }

    renderChat(){
        if (this.props.user.chat) {
            console.log(this.props.user);
            return this.props.user.chat.map(user => {
                let value = this.state.input[user + "Input"] ? this.state.input[user + "Input"] : "";

                if (user) {
                    return <div className={"chatWindow"} key={user}>
                        <h3>{user}</h3>
                        <ChatWindow msg={this.props.user.message[user]} socket={this.props.socket}/>
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