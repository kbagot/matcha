import React from 'react';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatUsers: []
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.chatUsers = this.chatUsers.bind(this);
    }


    componentDidMount(){
        this.props.socket.on('newChatUser', (data) => {
            console.log(data);
            this.setState({['chatUsers']: data});
        });
    }

    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    chatUsers(){
        return this.state.chatUsers.map((user, index) =>{
            if (user !== this.props.user.login)
                return <li key={index}>{user}</li>
        });
    }

    render() {
        let list = this.chatUsers();
        return (
            <div className={"User"}>
                <p>Welcome {this.props.user.login}</p>
                <button onClick={this.disconnectUser}>Disconnect</button>
                <ul>{list}</ul>
            </div>
        )
    }
}