import React from 'react';
import Chat from './Chat.jsx';
import Notif from './Notif.jsx';
import Profil from './Profil.jsx';
import Research from './Research.jsx';
import UserSettings from './User.Settings.jsx';
import HomeUsers from './HomeUsers.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allUsers: [],
            history: [],
            profil: false,
            view: false,
            researchview: false,
            matchview: false,
            burger: false
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.seekUser = this.seekUser.bind(this);
        this.listUsers = this.listUsers.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.setProfil = this.setProfil.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('match', (res) => {
            this.props.socket.emit('like', {type: res.type, login: res.login});
        });

        this.props.socket.on('allUsers', (data) => {
            this.setState({['allUsers']: data});
        });
        this.props.socket.on('refresh', data => {
            this.props.socket.emit('Register', data);
            this.setState({['allUsers']: data.allUsers});
        });
        // document.body.addEventListener('click', (ev) => {
        //     if (this.state.burger && this.checkClickZone(ev)) {
        //         this.setState({burger: false})
        //     }
        // });
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.handleclickclose, false);
    }

    componentWillUnmount() {
        this.props.socket.removeListener('allUsers');
        this.props.socket.removeListener('match');
        this.props.socket.removeListener('refresh');
        document.removeEventListener('mousedown', this.handleclickclose, false);
    }

    handleclickclose = (e) => {
        if (this.node.contains(e.target))
            console.log('CLICK');
        else
            this.setState({burger: false});
        // console.log('noclick');
        console.log('--------');
    }

    disconnectUser() {
        this.props.socket.emit("userDisconnect", {});
    }

    seekUser(view) {
        this.setState({[view]: true})
    }

    handleLike(ev, user) {
        let index;

        this.props.socket.emit("like", {type: ev.target.innerHTML.trim(), login: user});
        if (this.props.user.chat && (index = this.props.user.chat.findIndex(elem => elem.login === user) !== -1)) {
            this.props.user.chat.splice(index, 1);
        }
    }

    listUsers(list) {
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
            } else if (list.type === "chat") {
                return array.map((user, index) => {
                    if (user.login !== this.props.user.login) {
                        let notif = this.getMessagesNotif(user, this.props.user.notif);

                        return <li key={index}>
                            <button onClick={ev => this.props.socket.emit('chat', {
                                type: 'chatList',
                                login: user,
                                history: list.history['user']
                            })}>{user.login}</button>
                            {notif}
                        </li>
                    }
                });
            }
        }
    }

    getMessagesNotif(user, list) {
        let notif;

        if (list && typeof list === typeof []) {
            notif = list.filter(elem => elem.type === 'message' && Number(elem.from) === Number(user.id));
        }
        return notif ? notif.length : null;
    }

    setProfil(profil) {
        this.setState({profil: profil});
    }

    handleClick(ev, node) {

        if (!node) {
            const id = Number(ev.target.getAttribute('value'));
            this.props.socket.emit('profil', {type: 'getProfil', id: id}, (data) => this.setProfil(data));
        }

        if (node) {
            this.setProfil(node);
        }

        if (ev) {
            ev.preventDefault();
        }
    }

    burgercontent() {
        if (this.state.burger) {
            return (
                <div ref={node => this.node = node} className={'hburgercontent'}>
                    <UserSettings user={this.props.user} socket={this.props.socket}/>
                    <button className={'hburgerbut'} onClick={this.disconnectUser}>Disconnect</button>
                </div>
            )
        }
    }

    render() {
        let list = this.listUsers({type: 'all', data: this.state.allUsers});
        let researchview = null;
        let matchview = null;
        let view = null;
        let profil = this.state.profil ?
            <Profil load={this.setProfil} refresh={this.refreshProfil} allUsers={this.state.allUsers}
                    user={this.props.user}
                    profil={this.state.profil} socket={this.props.socket}/> : null;

        researchview = <Research socket={this.props.socket} allUsers={this.state.allUsers} user={this.props.user}
                                 match={''} handleClick={this.handleClick}/>;
        matchview = <Research socket={this.props.socket} allUsers={this.state.allUsers} user={this.props.user}
                              match={'match'} handleClick={this.handleClick}/>;

        let profilimg;
        if (this.props.user.img)
            profilimg = `../../img/${this.props.user.img["0"].imgid}`;

        let burgercontent = this.burgercontent();
        let burgerdisplay;
        if (this.state.burger)
            burgerdisplay = false;
        else
            burgerdisplay = true;

        /**********/
        this.props.user.visits = ['500', '400'];
        let HomeVisited = <HomeUsers socket={this.props.socket} user={this.props.user} task={'visits'} handleClick={this.handleClick}/>;
        /**********/
        // console.log(this.props.user);
        // if (this.props.user.match && this.props.user.match.findIndex(elem => Number(elem.id) === this.props.profil.id) !== -1) {
        return (
            <div className={"User"}>
                <div className={"header"}>
                    <Notif className={"Notif"} user={this.props.user} socket={this.props.socket}/><br/>
                    <div className={'headercontent'}>
                        <img value={this.props.user.id} src={profilimg} onClick={this.handleClick}/>
                    </div>
                    <div ref={node => this.node = node} className={'headercontent bodyclick'}
                         onClick={() => this.setState({['burger']: burgerdisplay})}>
                        <div className={'hburger'}></div>
                        <div className={'hburger'}></div>
                        <div className={'hburger'}></div>
                    </div>
                    {burgercontent}
                </div>
                {profil}
                <div className={'Content'}>
                    {HomeVisited}
                    {/*{researchview}*/}
                    {/*{matchview}*/}
                    {/*<h2>All Users</h2>*/}
                    {/*<ul>{list}</ul>*/}
                    {/*<Chat allUsers={this.state.allUsers} user={this.props.user} socket={this.props.socket}*/}
                    {/*listUsers={this.listUsers}/>*/}
                </div>
            </div>
        );
    }
}