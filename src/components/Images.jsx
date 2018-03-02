import React from 'react';
import UploadForm from './UploadForm.jsx';

export default class Images extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            images : null,
        };
    }

    renderImg(type){
        const images = this.state.images ? this.state.images : this.props.user.img;

        return images.map((elem, i) => {
            if (type === 'all' && !elem.profil) {
                return <a href={""} key={i} onClick={this.handleClickIn}><img style={img} src={`img/${elem.imgid}`}/></a>
            } else if (type === 'profil' && elem.profil){
                return <img key={i} style={profilImg} src={`img/${elem.imgid}`}/>
            }
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

    render(){
        let upload = this.renderUpload();

        return (
            <div>
                {/*{this.renderImg('profil')}*/}
                <div style={profilImgContainer} className={"profilImgContainer"}>
                    {this.renderImg('all')}
                    {upload}
                </div>

            </div>
        )
    }
}

const profilImg = {
    filter: 'brightness(1)',
    // border: '1x solid white',
    borderRadius: '100%',
    width: '24vmin',
    height: '24vmin',
    zIndex: '11'
};

const profilImgContainer = {
    marginLeft: '14vw',
    // backgroundColor: 'gray',
    display: 'inline-flex',
    alignItems: 'center',
};

const img = {
    filter: 'brightness(0.60)',
    // borderBottom: '1px soslid white',
    // borderTop: '1px solid white',
    // border: '1px solid gray',
    // borderRadius: '100%',
    width: '15vmin',
    height: '15vmin',
};