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
            return list.filter(elem => elem.type !== 'message' && !elem.read).length;
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
        if (this.props.user.notif[0]) {
            let unread = false;
            let array = list.map((elem, index) => {
                if (elem.type !== 'message') {
                    if (!elem.read) {
                        unread = true;
                    }
                    return <li className={'notifContent'} name={"test"} key={index}>{msg(elem)}
                        <button style={{float: 'right', color: 'white', backgroundColor: 'indianred', borderRadius: '4px', border: 'none'}} name={"notif"} value={elem.id} onClick={this.deleteNotif}>x</button>
                    </li>
                }
            });
            if (unread) {
                this.props.socket.emit('notif', {type: 'read', data: list});
            }
            return <div className={'notifList'}>
                <ul name={"notif"}>{array}</ul>
            </div>
        }
    }

    deleteNotif(ev){
        if (!this.props.user.notif.filter(elem => Number(elem.id) !== Number(ev.target.value)).length){
            this.handleClick(ev, this);
        }
        this.props.socket.emit('notif', {type: 'delete', data: ev.target.value});
        ev.preventDefault();
    }

    handleClick(ev, obj, list){
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
                return notif.login + " a visite votre profil.";
                break ;
        }
    }

    render(){
        let notif = this.getNotif(this.props.user.notif);
        let list = this.state.dropDown ? this.renderNotif(this.props.user.notif, this.renderNotifMsg) : null;

        return (
            <div className={'headercontent'}>
            <button className={'notifButton'} name="notifButton" onClick={(ev) => this.handleClick(ev, this, list)}>{notif}</button>
            {list}
        </div>
        )
    }
}
