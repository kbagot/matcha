import React from 'react';
import UploadForm from './UploadForm.jsx';

export default class Images extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            images : null,
        };
        this.renderOnline = this.renderOnline.bind(this);
    }

    renderOnline(){
        const connected = this.props.allUsers.findIndex(elem => elem.id === this.props.profil.id);
        const title = connected !== -1 ? "Online" : "Derniere connexion le " + this.props.profil.date;

        return (
            <div title={title} style={connected === -1 ? online : Object.assign({}, online, {backgroundColor: 'rgb(51, 204, 51)'})}>
            </div>
        )
    }

    renderImg(type){
        const images = this.state.images ? this.state.images : this.props.user.img;

        return images.map((elem, i) => {
            if (type === 'all' && !elem.profil) {
                return <a href={""} key={i} onClick={(ev) => this.props.display(ev , images)}><img style={img} src={`img/${elem.imgid}`}/></a>
            } else if (type === 'profil' && elem.profil){
                return <a href={""} key={i} onClick={(ev) => this.props.display(ev , images)}><img style={profilImg} src={`img/${elem.imgid}`}/></a>
            }
        });
    }

    componentDidMount(){
        this.props.socket.on(this.props.profil.login, (data) => this.setState({images: data}));
        if (this.props.profil && this.props.profil.id !== this.props.user.id){
            this.props.socket.emit("profil", {type:'getImages', profil: this.props.profil}, (images) => this.setState({images: images}));
        }
    }

    componentWillUnmount(){
        this.props.socket.removeListener(this.props.profil.login);
    }

    renderUpload(){
        if (this.props.user.id === this.props.profil.id && this.props.user.img.length < 5){
            return <UploadForm user={this.props.user} socket={this.props.socket}/>
        }
    }

    render(){
        let upload = this.renderUpload();
        const images = this.state.images ? this.state.images : this.props.user.img;
        const obj = images.length > 1 ? profilImgContainer : Object.assign({}, profilImgContainer, {backgroundColor: '#0a4669'});

        return (
            <div>
                {this.renderImg('profil')}
                {this.renderOnline()}
                <div style={obj} className={"profilImgContainer"}>
                    {this.renderImg('all')}
                    {upload}
                </div>

            </div>
        )
    }
}
const online = {
    position: 'absolute',
    marginTop: '13vmin',
    marginLeft: '14vmin',
    zIndex: '4',
    backgroundColor: 'gray',
    color: 'red',
    width: '3vmin',
    height: '3vmin',
    boxShadow: '0px 0px 6px black',
    borderRadius: '100%'
};

const profilImg = {
    position: 'absolute',
    margin: '-5vmin',
    filter: 'brightness(1)',
    border: '2px solid white',
    boxShadow: '0px 0px 6px black',
    borderRadius: '100%',
    width: '23vmin',
    height: '23vmin',
    zIndex: '3'
};

const profilImgContainer = {
    position: 'absolute',
    zIndex: '2',
    width: '60vmin',
    backgroundColor: 'transparent',
    marginLeft: '14vmin',
    height: '14.1vmin',
    display: 'inline-flex',
    borderRadius: '0 1vmin 0vmin 0',
    alignItems: 'center',
};

const img = {
    // borderRight: '3px solid white',
    filter: 'brightness(0.60)',
    width: '14.82vmin',
    height: '14.6vmin',
    marginTop: '0.2vh',
    borderTop: '1px solid white',
    borderRight: '1px solid white',
    borderLeft: '1px solid white'


};