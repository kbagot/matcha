import React from 'react';
import Chat from './Chat.jsx';
import Notif from './Notif.jsx';
import Profil from './Profil.jsx';
import UserSettings from './User.Settings.jsx';
import HomeContent from './HomeContent.jsx';

export default class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allUsers: [],
            history: [],
            profil: false,
            view: false,
            burger: false,
            refreshlist: false,
        };
        this.disconnectUser = this.disconnectUser.bind(this);
        this.seekUser = this.seekUser.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.setProfil = this.setProfil.bind(this);
    }

    componentDidMount() {

        window.scrollTo(0, 0);
        this.props.socket.on('match', (res) => {
            this.props.socket.emit('like', {type: res.type, login: res.login, object: res});
        });

        this.props.socket.on('allUsers', (data) => {
            this.setState({['allUsers']: data});
        });
        this.props.socket.on('refresh', data => {
            this.props.socket.emit('Register', data);
            this.setState({['allUsers']: data.allUsers});
        });
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
        if (this.node.contains(e.target)) {
            if (this.state.burger)
                this.setState({burger: false});
            else
                this.setState({burger: true});
        } else if (this.state.burger && !this.node2.contains(e.target))
            this.setState({burger: false});
    };

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


    setProfil(profil) {
        this.setState({profil: profil,
            refreshlist: !profil,
        });
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
                <div ref={node2 => this.node2 = node2} className={'hburgercontent'}>
                    <UserSettings user={this.props.user} socket={this.props.socket}/>
                    <button className={'hburgerbut'} onClick={this.disconnectUser}>Disconnect</button>
                </div>
            )
        }
    }

    render() {
        let view = null;
        let profil = this.state.profil ?
            <Profil load={this.setProfil} refresh={this.refreshProfil} allUsers={this.state.allUsers}
                    user={this.props.user}
                    profil={this.state.profil} socket={this.props.socket}/> : null;


        let profilimg;
        if (this.props.user.img)
            profilimg = `../../img/${this.props.user.img["0"].imgid}`;

        let burgercontent = this.burgercontent();
        // if (this.props.user.match && this.props.user.match.findpIndex(elem => Number(elem.id) === this.props.profil.id) !== -1) {
        return (
            <div className={"User"}>
                <div className={"header"}>
                    <Notif className={"Notif"} user={this.props.user} socket={this.props.socket} handleClick={this.handleClick} /><br/>
                    <div className={'headercontent'}>
                        <img value={this.props.user.id} src={profilimg} onClick={this.handleClick}/>
                    </div>
                    <div ref={node => this.node = node} className={'headercontent bodyclick'}>
                        <div className={'hburger'}/>
                        <div className={'hburger'}/>
                        <div className={'hburger'}/>
                    </div>
                    {burgercontent}
                </div>
                {profil}
                <HomeContent user={this.props.user} allUsers={this.state.allUsers} socket={this.props.socket} handleClick={this.handleClick}
                refreshlist={this.state.refreshlist}/>
                <Chat allUsers={this.state.allUsers} user={this.props.user} socket={this.props.socket}
                      listUsers={this.listUsers} profil={this.handleClick}/>
            </div>
        );
    }
}