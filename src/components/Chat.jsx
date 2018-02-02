import React from 'react';

export default class Chat extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chatUsers: [],
            test: [],
            socket: this.props.socket
        };
        this.chatUsers = this.chatUsers.bind(this);
    };

    componentDidMount(){
        this.props.socket.on('allUsers', (data) => {
            this.setState({['test']: data});
        });
        this.props.socket.on('chatUsers', (res, fn) => {
        });
    }

    handleLike(ev, user){
        this.props.socket.emit("like", {type: ev.target.innerHTML.trim(), login: user});
    }

    chatUsers(list){
        let array = list;

        if (array) {
            return array.map((user, index) => {
                if (user !== this.props.user.login)
                    return <li key={index}>{user}
                        <button onClick={(ev) => this.handleLike(ev, user)}> Add</button>
                        <button onClick={(ev) => this.handleLike(ev, user)}> Remove</button>
                    </li>
            });
        }
    }

    componentWillUnmount(){
        this.props.socket.removeListener('allUsers');
    }

    render (){
        let list = this.chatUsers(this.state.test);

        return (
            <div className={"chat"}>
                <h2>All Users</h2>
                <ul>{list}</ul>
                <h2>Chat Users</h2>
                <ul></ul>
            </div>
        )
    }
}