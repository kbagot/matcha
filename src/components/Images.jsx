import React from 'react';
import UploadForm from './UploadForm.jsx';

export default class Images extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            images : null,
            style: null,
        };
        this.handleClickIn = this.handleClickIn.bind(this);
    }

    renderImg(){
        const images = this.state.images ? this.state.images : this.props.user.img;
        let index = images.findIndex(elem => elem.profil === true);

        return images.map((elem, i) => {
            let imgStyle = i === index ? profilImg : img;

            return <a href={""} key={i} onClick={this.handleClickIn}><img style={imgStyle} src={`img/${elem.imgid}`} /></a>
        });
    }

    componentDidMount(){
        this.props.socket.on(this.props.profil.login, (data) => this.setState({images: data}));
        if (this.props.profil && this.props.profil.id !== this.props.user.id){
            this.props.socket.emit("profil", {type:'getImages', profil: this.props.profil}, (images) => this.setState({images: images}));
        }
    }

    renderUpload(){
        if (this.props.user.id === this.props.profil.id && this.props.user.img.length < 5){
            return <UploadForm user={this.props.user} socket={this.props.socket}/>
        }
    }

    handleClickIn(ev){
        ev.preventDefault();
    }

    render(){
        let images = this.renderImg();
        let upload = this.renderUpload();

        return (
            <div >
                <div style={profilImgContainer} className={"profilImgContainer"}>
                    {images}
                    {upload}
                </div>
            </div>
        )
    }
}

const profilImg = {
    marginTop: '1vh',
    border: '1px solid gray',
    borderRadius: '100%',
    width: '19vmin',
    height: '19vmin',
};

const profilImgContainer = {
    backgroundColor: 'gray',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-evenly'
};

const img = {
    border: '1px solid gray',
    borderRadius: '100%',
    width: '10vmin',
    height: '10vmin',
};