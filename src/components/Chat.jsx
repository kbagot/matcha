import React from 'react';
import ChatWindow from './ChatWindow.jsx';

export default class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            chatUsers: [],
            socket: this.props.socket,
            chat: [],
            input: {},
            message: {}
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderChat = this.renderChat.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        this.props.socket.on('chatUsers', (res) => {
            if (res.type === 'chat') {
                this.setState({['chatUsers']: res.chat});
            } else {
                this.props.socket.emit('like', {type: res.type, login: res.login});
            }
        });
    }


    handleClick(ev){
        let array = this.state.chat;
        let index = array.indexOf(ev.target.innerHTML);

        if (index === -1) {
            array.push(ev.target.innerHTML);
        } else {
            array.splice(index, 1);
        }
        this.setState({['chat']: array});
    }

    handleSubmit(ev){
        let oldMessage = this.state.message[ev.target.name];
        let str = this.props.user.login + ": " + this.state.input[ev.target.name+"Input"] + "\n";
        let obj = {[ev.target.name]: oldMessage ? oldMessage + str :  str };
        let obj2 = {[ev.target.name+"Input"]: ""};

        this.setState({['message']: Object.assign({}, this.state.message, obj), ['input']: Object.assign({}, this.state.input, obj2)});
        ev.preventDefault();
    }

    handleChange(ev){
        let obj = {[ev.target.name.trim()]: ev.target.value};

        this.setState({['input']: Object.assign({}, this.state.input, obj)});
    }


    renderChat(){
        return this.state.chat.map(user => {
            let value = this.state.input[user+"Input"] ? this.state.input[user+"Input"] : "";

            return <div className={"chatWindow"} key={user}>
                <h3>{user}</h3>
                <ChatWindow msg={this.state.message[user]}/>
                <form name={user} onSubmit={this.handleSubmit}>
                    <input type={"text"} name={user+"Input"} value={value} onChange={this.handleChange}/>
                    <input type={"submit"} name={"submit"} value={String.fromCodePoint(0x2934)}/>
                </form>
            </div>
        })  ;
    }

    componentWillUnmount(){
        this.props.socket.removeListener('chatUsers');
    }


    render (){
        let list = this.props.listUsers({type: "chat", data: this.state.chatUsers, click: this.handleClick});
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