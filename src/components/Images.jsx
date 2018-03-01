import React from 'react';
import UploadForm from './UploadForm.jsx';

export default class Images extends React.Component{
    constructor(props){
        super(props);
    }

    getImg(){
        if (this.props.user.id === this.props.profil.id){
            let index = this.props.user.img.findIndex(elem => elem.profil === 1);

            return this.props.user.img.map((elem, i) => {
                let imgStyle = i === index ? profilImg : img;

                return <img key={i} style={imgStyle} src={`img/${elem.imgid}`} />
            });
        } else {
            this.props.socket.emit("profil", {type:'getImages', profil: this.props.profil});
        }
    }

    renderUpload(){
        if (this.props.user.id === this.props.profil.id && this.props.user.img.length < 5){
            return <UploadForm user={this.props.user} socket={this.props.socket}/>
        }
    }

    render(){
        let images = this.getImg();
        let upload = this.renderUpload();

        return (
        <div style={profilImgContainer} className={"profilImgContainer"}>
            {images}
            {upload}
        </div>
        )
    }
}

const profilImg = {
    margin: '1vh',
    border: '1px solid gray',
    borderRadius: '10vh',
    width: '19vmin',
    height: '19vmin',
};

const profilImgContainer = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const img = {
    marginRight: '1vw',
    border: '1px solid gray',
    borderRadius: '10vh',
    width: '10vmin',
    height: '10vmin',
};