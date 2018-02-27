import React from 'react';
import Chat from './Chat.jsx';
import Notif from './Notif.jsx';
import Research from './Research.jsx';
import UserSettings from './User.Settings.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allUsers: [],
            history: [],
            view: false,
            researchview: false,
            matchview: false
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.seekUser = this.seekUser.bind(this);
        this.listUsers = this.listUsers.bind(this);
    }

    componentDidMount(){
        this.props.socket.on('match', (res) => {
            this.props.socket.emit('like', {type: res.type, login: res.login});
        });

        this.props.socket.on('allUsers', (data) => {
            this.setState({['allUsers']: data});
        });

        this.props.socket.on('refresh', data =>{
            this.props.socket.emit('Register', data);
            this.setState({['allUsers']: data.allUsers});
        });
    }

    componentWillUnmount(){
        this.props.socket.removeListener('allUsers');
        this.props.socket.removeListener('match');
        this.props.socket.removeListener('refresh');
    }

    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    seekUser(view) {
        this.setState({[view]: true})
    }

    handleLike(ev, user){
        let index;

        this.props.socket.emit("like", {type: ev.target.innerHTML.trim(), login: user});
        if (this.props.user.chat && (index = this.props.user.chat.findIndex(elem => elem.login === user) !== -1)){
            this.props.user.chat.splice(index, 1);
        }
    }

    listUsers(list){
        let array = list.data;

        if (array) {
            if (list.type === "all") {
                return array.map((user, index) => {
                    if (user.login !== this.props.user.login) {
                        return <li key={index}>{user.login}
                            <button onClick={(ev) => this.handleLike(ev, user)}> Add</button>
                            <button onClick={(ev) => this.handleLike(ev, user)}> Remove</button>
                        </li>
                    }
                });
            } else if (list.type === "chat"){
                return array.map((user, index) => {
                    if (user.login !== this.props.user.login) {
                        let notif = this.getMessagesNotif(user, this.props.user.notif);

                        return <li key={index}>
                            <button onClick={ev => this.props.socket.emit('chat', {
                                type: 'chatList',
                                login: user,
                                history: list.history['user']
                            })}>{user.login}</button> {notif}
                        </li>
                    }
                });
            }
        }
    }

    getMessagesNotif(user, list){
        let notif;

        if (list && typeof list === typeof []){
            notif = list.filter(elem => elem.type === 'message' && Number(elem.from) === Number(user.id));
        }
        return notif ? notif.length : null;
    }

    render() {
        let list = this.listUsers({type: 'all', data: this.state.allUsers});
          let researchview = null;
        let matchview = null;
        let view = null;

        if (this.state.view) {
            view = <Research socket={this.props.socket}/>
        } else {
            view = <button onClick={this.seekUser}>Research</button>
        }

      if (this.state.researchview) {
            researchview = <Research socket={this.props.socket} match={''}/>
        }else{
            researchview = <button onClick={() => this.seekUser('researchview')}>Research</button>
        }

        if (this.state.matchview) {
            matchview = <Research socket={this.props.socket} match={'match'}/>
        }else {
            matchview = <button onClick={() => this.seekUser('matchview')}>Match ME motherfucker</button>
        }

        return (
            <div className={"User"}>
                <h3>Welcome {this.props.user.login} </h3>
                <Notif className={"Notif"} user={this.props.user} socket={this.props.socket}/><br />
                <UserSettings user={this.props.user} socket={this.props.socket} /><br />
                <button onClick={this.disconnectUser}>Disconnect</button>
                <h2>All Users</h2>
                <ul>{list}</ul>
                <Chat allUsers={this.state.allUsers} user={this.props.user} socket={this.props.socket} listUsers={this.listUsers}/>{}
                {researchview}
                {matchview}
            </div>
        );
    }
}