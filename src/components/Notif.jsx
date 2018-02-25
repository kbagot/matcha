import React from 'react';

export default class Notif extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dropDown: false
        };
        this.deleteNotif = this.deleteNotif.bind(this);
    }

    getNotif(list){
        if (list){
            return list.filter(elem => elem.type !== 'message').length;
        }
    }

    componentDidMount(){
        document.body.addEventListener('click', (ev) => {
            if (this.state.dropDown && this.checkClickZone(ev)) {
                this.setState({dropDown: false})
            }
        });
    }

    checkClickZone(ev){
        const array = ['notifButton', 'notif'];
        let found = false;

        if (ev.target.children){
            for (let elem of ev.target.children){
                if (elem.name && array.indexOf(elem.name === -1)){
                    found = true;
                }
            }
        }
        return found ? false : (array.indexOf(ev.target.name) === -1);
    }

    renderNotif(list, msg){
        if (list){
            let array = list.map((elem, index) => {
                if (elem.type !== 'message'){
                    return <li name={"test"} key={index} >{msg(elem)} <button name={"notif"} value={elem.id} onClick={this.deleteNotif}>x</button></li>
                }
            });
            return <ul name={"notif"}>{array}</ul>
        }
    }

    deleteNotif(ev){
        this.props.socket.emit('notif', ev.target.value);
        ev.preventDefault();
    }

    handleClick(ev, obj){
            obj.setState(prevState => ({
                dropDown: !prevState.dropDown
            }));
    }

    renderNotifMsg(notif){
        switch (notif.type){
            case 'like':
            case 'unlike':
                return notif.login + " vous a " + notif.type + ".";
                break ;
            case 'match':
                return "Vous avez un nouveau match avec " + notif.login + ".";
                break ;
            case 'unmatch':
                return "Vous avez perdu votre match avec " + notif.login + ".";
                break ;
            case 'visit':
                return notif.login + "a visite votre profil.";
                break ;
        }
    }

    render(){
        let notif = this.getNotif(this.props.user.notif);
        let list = this.state.dropDown ? this.renderNotif(this.props.user.notif, this.renderNotifMsg) : null;



        return <div><button name="notifButton" onClick={(ev) => this.handleClick(ev, this)}> Notifications {notif}</button>
                {list}
        </div>

    }
}