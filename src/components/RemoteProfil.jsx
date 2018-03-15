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
        this.handleBlock = this.handleBlock.bind(this);
        this.renderBlock = this.renderBlock.bind(this);
        this.renderReport = this.renderReport.bind(this);
        this.handleReport = this.handleReport.bind(this);
        this.renderLocate = this.renderLocate.bind(this);
        this.handleLocate = this.handleLocate.bind(this);
    }

    handleLike(ev) {
        const defImg = this.props.images.findIndex(elem => elem.imgid === `nopic.png`) !== -1;
        const block = this.props.user.block && this.props.user.block.indexOf(this.props.profil.id) !== -1;

        if (this.props.profil.id !== this.props.user.id && !defImg && !block) {
            let index;
            const user = {
                login: this.props.profil.login,
                id: this.props.profil.id,
                img: this.props.profil.img
            };
            const type = {
                ['fullheart.png']: 'Remove',
                ['halfheart.png']: Number(this.props.profil.user1) === this.props.user.id ? 'Remove' : 'Add',
                ['emptyheart.png']: 'Add'
            };

            this.props.socket.emit("like", {type: type[ev.target.src.split('/').pop()], login: user});
            if (this.props.user.chat && (index = this.props.user.chat.findIndex(elem => elem.login === user) !== -1)) {
                this.props.user.chat.splice(index, 1);
            }
        }
        ev.preventDefault();
    }


    renderHeart(){
        const defImg = this.props.images.findIndex(elem => elem.imgid === `nopic.png`) !== -1;
        const match = this.props.user.match && this.props.user.match.findIndex(elem => Number(elem.id) === this.props.profil.id) !== -1;
        const self = this.props.user.id === this.props.profil.id;
        const block = this.props.user.block && this.props.user.block.indexOf(this.props.profil.id) !== -1;

        const obj = defImg || self || block ? Object.assign({}, heart, {cursor: 'default'}) : heart;

            if (self || match) {
                return <a href={""} onClick={this.handleLike}><img style={obj} src={"img/fullheart.png"}/></a>;
            } else if (this.props.profil.user1) {
                return <a href={""} onClick={this.handleLike}><img style={obj} src={"img/halfheart.png"}/></a>;
            } else {
                return <a href={""} onClick={this.handleLike}><img style={obj} src={"img/emptyheart.png"}/></a>;
            }
    }

    renderReport(){
        if (this.props.user.id !==  this.props.profil.id){
            return <button style={button} onClick={this.handleReport}>{'\u26A0'}</button>
        }
    }

    renderScore(){
        const pop = this.props.profil.respop;

        return Object.assign({}, scoreContainer, {background: `linear-gradient(rgba(9, 70, 104, 0.29) ${100 - pop}%, rgb(9, 70, 104)  0%)`});
    }

    handleBlock(){
        if (!this.props.user.block || (this.props.user.id !== this.props.profil.id && this.props.user.block.indexOf(this.props.profil.id) === -1)) {
            this.props.socket.emit('profil', {type: 'block', data: this.props.profil})
        }
    }

    renderBlock(){
        if (this.props.user.id !== this.props.profil.id  && (!this.props.user.block || this.props.user.block.indexOf(this.props.profil.id) === -1)){
            return <button style={button} onClick={this.handleBlock} >{'\u26D4'}</button>

        }
    }

    renderLocate(){
        if (this.props.user.id === this.props.profil.id){
            return (
                <div style={heartContainer}>
                    <a href={""} onClick={this.handleLocate}><img style={heart} src={'img/icon/locate.png'} /></a>
                </div>
            )
        }
    }

    handleLocate(ev){
        navigator.geolocation.getCurrentPosition(async position => {
            const pos = {
                lat: '',
                lon: ''
            };
            pos.lat = position.coords.latitude;
            pos.lon = position.coords.longitude;
            this.props.socket.emit('profil', {type: 'locate', user: this.state.profil, pos: pos});
        }, error => {
            this.props.socket.emit('profil', {type: 'locate', user: this.props.profil,  pos: pos});
        }, {timeout: 4000});
        ev.preventDefault();
    }

    handleReport(){
        this.props.socket.emit('profil', {type: 'report', data: this.props.profil});
    }

    render() {

        return (
            <div style={remoteContainer}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={heartContainer}>
                        {this.renderHeart()}
                    </div>
                    {this.renderLocate()}
                    <div style={this.renderScore()}>
                        <b>{this.props.profil.respop}</b>
                    </div>
                </div>
                <div style={{display: 'flex'}}>
                    {this.renderReport()}
                    {this.renderBlock()}
                </div>
            </div>
        )
    }
}

const button = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#2b92fb57',
    padding: '2px'
};

let scoreContainer ={
    color: 'white',
    fontFamily: 'Verdana',
    display: 'flex',
    textAlign: 'center',
    width: '45px',
    height: '45px',
    borderRadius: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '7px',
    fontSize: '15px'
};

const heartContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px'
};

const heart = {
    width: '40px'
};

const remoteContainer = {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    marginTop: '144px',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 10px 10px 170px',
    borderRadius: ' 0 0 0 10px',
};