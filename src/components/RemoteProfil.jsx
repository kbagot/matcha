import React from 'react';

export default class RemoteProfil extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            reload: false,
        };
        this.renderHeart = this.renderHeart.bind(this);
        this.handleLike = this.handleLike.bind(this);
    }

    handleLike(ev){
        ev.preventDefault();
        if (this.props.profil.id !== this.props.user.id) {
            let index;
            const user = {
                login: this.props.profil.login,
                id: this.props.profil.id
            };
            const type = {
                ['fullheart.png']: 'Remove',
                ['halfheart.png']: Number(this.props.profil.user1) === this.props.user.id ? 'Remove' : 'Add',
                ['emptyheart.png']: 'Add'
            };

            this.props.socket.emit("like", {type: type[ev.target.src.split('/').pop()], login: user});
            this.props.socket.emit('profil', {type: 'getProfil', id: this.props.user.id});
            if (this.props.user.chat && (index = this.props.user.chat.findIndex(elem => elem.login === user) !== -1)) {
                this.props.user.chat.splice(index, 1);
            }
        }
    }


    renderHeart(){
        const index = this.props.user.match && this.props.user.match.findIndex(elem => Number(elem.id) === this.props.profil.id) !== -1;

            if (this.props.user.id === this.props.profil.id || index) {
                return <a href={""} onClick={this.handleLike}><img style={heart} src={"img/fullheart.png"}/></a>;
            } else if (this.props.profil.user1) {
                return <a href={""} onClick={this.handleLike}><img style={heart} src={"img/halfheart.png"}/></a>;
            } else {
                return <a href={""} onClick={this.handleLike}><img style={heart} src={"img/emptyheart.png"}/></a>;
            }
    }

    render() {
        console.log(this.props.profil);
        return (
            <div style={remoteContainer}>
                <div style={heartContainer}>
                    {this.renderHeart()}
                </div>
                <div style={scoreContainer}>
                    100
                    {this.props.profil.spop}
                </div>
            </div>
        )
    }
}

const scoreContainer ={
    display: 'flex',
    textAlign: 'center',
    width: '9vmin',
    height: '9vmin',
    borderRadius: '100%',
    background: 'linear-gradient(white 80%, gray 80%)',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'rgba(0, 0, 0, 0.27)',
    fontSize: '4vmin'
};

const heartContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const heart = {
    width: '9vmin'
};

const remoteContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '4vmin',
    width: '24vmin',
};