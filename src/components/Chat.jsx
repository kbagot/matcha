import React from 'react';

export default class Chat extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chatUsers: [],
            socket: this.props.socket
        };
        this.chatUsers = this.chatUsers.bind(this);
    };

    componentDidMount(){
        this.props.socket.on('chatUsers', (data) => {
            this.setState({['chatUsers']: data});
        });
    }

    chatUsers(){
        let array = this.state.chatUsers;
        return array.map((user, index) =>{
            if (user !== this.props.user.login)
                return <li key={index}>{user}</li>
        });
    }

    componentWillUnmount(){
        this.props.socket.removeListener('chatUsers');
    }

    render (){
        let list = this.chatUsers();

        return (
            <ul>{list}</ul>
        )
    }
}