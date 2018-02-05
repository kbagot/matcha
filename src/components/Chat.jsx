import React from 'react';


export default class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            chatUsers: [],
            socket: this.props.socket,
            chat: []
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderChat = this.renderChat.bind(this);
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

    renderChat(){
        return this.state.chat.map(user => {
            return <div key={user}>
                <h3>{user}</h3>
                <form>
                <input type={"text"} name={user+"Chat"} value={""}/>
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
                <div> {chat} </div>
            </div>
        )
    }
}