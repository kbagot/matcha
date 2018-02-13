import React from 'react';
import Chat from './Chat.jsx';
import Research from './Research.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allUsers: [],
            history: []
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.seekUser = this.seekUser.bind(this);
        this.state = {
            view: false
        };
        this.listUsers = this.listUsers.bind(this);
    }

    componentDidMount(){
        this.props.socket.on('match', (res) => {
            this.props.socket.emit('like', {type: res.type, login: res.login});
        });

        this.props.socket.on('allUsers', (data) => {
            this.setState({['allUsers']: data});
        });
    }

    componentWillUnmount(){
        this.props.socket.removeListener('allUsers');
        this.props.socket.removeListener('match');

    }

    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    seekUser() {
        this.setState({['view']: true})
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
                    if (user !== this.props.user.login) {
                        let notif = this.getMessagesNotif(user, this.props.user.message);

                        return <li key={index}>
                            <button onClick={ev => this.props.socket.emit('chat', {
                                type: 'chatList',
                                login: ev.target.innerHTML,
                                history: list.history['user']
                            })}>{user}</button> {notif}
                        </li>
                    }
                });
            }
        }
    }

    getMessagesNotif(login, list){
        let messages;

        if (list){
            messages = list[login];
        }
        return messages ? messages.length : null;
    }

    render() {
        let list = this.listUsers({type: 'all', data: this.state.allUsers});
       let view = null;
       
      if (this.state.view) {
            view = <Research socket={this.props.socket}/>
        }else{
            view = <button onClick={this.seekUser}>Research</button>
        }

      return (
            <div className={"User"}>
                <p>Welcome {this.props.user.login}</p>
                <button onClick={this.disconnectUser}>Disconnect</button>
                <h2>All Users</h2>
                <ul>{list}</ul>
                <Chat allUsers={this.state.allUsers} user={this.props.user} socket={this.props.socket} listUsers={this.listUsers}/>{}
                {view}
            </div>
        );
    }
}