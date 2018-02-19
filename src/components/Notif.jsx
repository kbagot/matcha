import React from 'react';

export default class Notif extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dropDown: false
        }
    }

    getNotif(list){
        if (list && list === []){
            return list.filter(elem => elem.type !== 'message').length;
        }
    }

    componentDidMount(){
        document.body.addEventListener('click', (ev) => {
            if (this.state.dropDown && ev.target.name !== 'notifButton') {
                this.setState({dropDown: false})
            }
        });
    }


    renderNotif(list, msg){
        if (list){
            let array = list.map((elem, index) => {
                if (elem.type !== 'message'){
                    return <li key={index}>{msg(elem)}</li>
                }
            });
            return <ul>{array}</ul>
        }
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
                return notif.from + " vous a " + notif.type + ".";
                break ;
            case 'match':
                return "Vous avez un nouveau match avec " + notif.from + ".";
                break ;
            case 'unmatch':
                return "Vous avez perdu votre match avec " + notif.from + ".";
                break ;
            case 'visit':
                return notif.from + "a visite votre profil.";
                break ;
        }
    }

    render(){
        let notif = this.getNotif(this.props.user.notif);
        let list = this.state.dropDown ? this.renderNotif(this.props.user.notif, this.renderNotifMsg) : null;



        return <div>
            <button name="notifButton" onClick={(ev) => this.handleClick(ev, this)}> Notifications {notif}</button>
                {list}
        </div>

    }
}