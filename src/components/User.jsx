import React from 'react';
import Chat from './Chat.jsx';
import Notif from './Notif.jsx';
import Profil from './Profil.jsx';
import Research from './Research.jsx';
import UserSettings from './User.Settings.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allUsers: [],
            history: [],
            profil: false,
            view: false,
            researchview: false,
            matchview: false
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.seekUser = this.seekUser.bind(this);
        this.listUsers = this.listUsers.bind(this);
        this.handleClick = this.handleClick.bind(this);
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
                        return <li key={index}><a href={""} value={user.id} onClick={this.handleClick}>{user.login}</a>
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

    handleClick(ev, node){

        if (!node) {
            const id = Number(ev.target.getAttribute('value'));
            this.props.socket.emit('profil', {type: 'getProfil', id: id}, (data) => this.handleClick(null, data));
        }

        if (node){
            this.props.socket.on('user', () => {
                this.props.socket.emit('profil', {type: 'getProfil', id: node.id}, (data) => this.setState({profil: data}))
            });
            this.props.socket.on(node.id, (profil) => this.setState({profil: profil}));
            this.setState({profil: node});
        }

        if (ev){
            ev.preventDefault();
        }
    }

    render() {
        let list = this.listUsers({type: 'all', data: this.state.allUsers});
        let researchview = null;
        let matchview = null;
        let view = null;
        let profil = this.state.profil ? <Profil refresh={this.refreshProfil} allUsers={this.state.allUsers} user={this.props.user} profil={this.state.profil} socket={this.props.socket}/> : null;

            researchview = <Research socket={this.props.socket} match={''} handleClick={this.handleClick}/>;

            // matchview = <Research socket={this.props.socket} match={'match'}/>;

        return (
            <div className={"User"}>
                <h3>Welcome <a href={""} value={this.props.user.id} onClick={this.handleClick}>{this.props.user.login}</a></h3>
                <Notif className={"Notif"} user={this.props.user} socket={this.props.socket}/><br />
                <UserSettings user={this.props.user} socket={this.props.socket} /><br />
                <button onClick={this.disconnectUser}>Disconnect</button>
                {profil}
                {researchview}
                {matchview}
                <h2>All Users</h2>
                <ul>{list}</ul>
                <Chat allUsers={this.state.allUsers} user={this.props.user} socket={this.props.socket} listUsers={this.listUsers}/>
            </div>
        );
    }
}