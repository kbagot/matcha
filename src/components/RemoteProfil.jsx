import React from 'react';

export default class RemoteProfil extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            reload: false,
        };
        this.renderHeart = this.renderHeart.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.renderScore = this.renderScore.bind(this);
    }

    handleLike(ev){
        const defImg = this.props.images.findIndex(elem => elem.imgid === `nopic${this.props.profil.sexe}.jpg`) !== -1;

        if (this.props.profil.id !== this.props.user.id && !defImg) {
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
        ev.preventDefault();
    }


    renderHeart(){
        const defImg = this.props.images.findIndex(elem => elem.imgid === `nopic${this.props.profil.sexe}.jpg`) !== -1;
        const match = this.props.user.match && this.props.user.match.findIndex(elem => Number(elem.id) === this.props.profil.id) !== -1;
        const self = this.props.user.id === this.props.profil.id;
        const obj = defImg || self ? Object.assign({}, heart, {cursor: 'default'}) : heart;

            if (self || match) {
                return <a href={""} onClick={this.handleLike}><img style={obj} src={"img/fullheart.png"}/></a>;
            } else if (this.props.profil.user1) {
                return <a href={""} onClick={this.handleLike}><img style={obj} src={"img/halfheart.png"}/></a>;
            } else {
                return <a href={""} onClick={this.handleLike}><img style={obj} src={"img/emptyheart.png"}/></a>;
            }
    }
    renderScore(){
        return Object.assign({}, scoreContainer, {background: `linear-gradient(#ecf4fe ${10 - this.props.profil.spop}%, #2b94fb ${10 - this.props.profil.spop}%)`});
    }

    render() {
        return (
            <div style={remoteContainer}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={heartContainer}>
                    {this.renderHeart()}
                </div>
                <div style={this.renderScore()}>
                    {this.props.profil.spop}
                </div>
                </div>
                <div style={{display: 'flex'}}>
                <button style={button}>{'\u26A0'}</button>
                <button style={button}>{'\u26D4'}</button>
                </div>
            </div>
        )
    }
}

const button = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '2vmin',
    color: '#2b92fb57',
    padding: '0.4vmin'
};

let scoreContainer ={
    display: 'flex',
    textAlign: 'center',
    width: '2vmin',
    height: '2vmin',
    borderRadius: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    color: '',
    padding: '1vmin',
    fontSize: '1.5vmin'
};

const heartContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1vmin'
};

const heart = {
    width: '4vmin'
};

const remoteContainer = {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    marginTop: '14.4vmin',
    display: 'flex',
    alignItems: 'center',
    padding: '1vmin 1vmin 1vmin 17vmin',
    borderRadius: ' 0 0 0 1vmin ',
};