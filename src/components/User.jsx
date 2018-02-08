import React from 'react';
import Chat from './Chat.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allUsers: [],
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.listUsers = this.listUsers.bind(this);
    }

    componentDidMount(){
        this.props.socket.on('allUsers', (data) => {
            this.setState({['allUsers']: data});
        });
    }

    componentWillUnmount(){
        this.props.socket.removeListener('allUsers');
    }

    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    handleLike(ev, user){
        this.props.socket.emit("like", {type: ev.target.innerHTML.trim(), login: user});
    }

    listUsers(list){
        let array = list.data;
        if (array) {
            if (list.type === "all") {
                return array.map((user, index) => {
                    if (user !== this.props.user.login)
                        return <li key={index}>{user}
                            <button onClick={(ev) => this.handleLike(ev, user)}> Add</button>
                            <button onClick={(ev) => this.handleLike(ev, user)}> Remove</button>
                        </li>
                });
            } else if (list.type === "chat"){
                return array.map((user, index) => {
                    let notif = list.notif[user];

                    if (user !== this.props.user.login)
                        return <li key={index}>
                            <button onClick={(ev) => list.click(ev)}>{user}</button> {notif}
                        </li>
                });
            }
        }
    }

    render() {
        let list = this.listUsers({type: 'all', data: this.state.allUsers});

        return (
            <div className={"User"}>
                <p>Welcome {this.props.user.login}</p>
                <button onClick={this.disconnectUser}>Disconnect</button>
                <h2>All Users</h2>
                <ul>{list}</ul>
                <Chat allUsers={this.state.allUsers} user={this.props.user} socket={this.props.socket} listUsers={this.listUsers}/>
            </div>
        );
    }
}