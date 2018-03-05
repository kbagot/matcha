import React from 'react';
import Images from './Images.jsx';
import About from './About.jsx';
import RemoteProfil from './RemoteProfil.jsx';
import ImagesViewer from './ImagesViewer.jsx';

export default class Profil extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            profil: true,
            images: false,
            imgid: null
        };
        this.displayImages = this.displayImages.bind(this);
        this.displayProfil = this.displayProfil.bind(this);
        this.previousImg = this.previousImg.bind(this);
        this.nextImg = this.nextImg.bind(this);
    }

    displayImages(ev, images){
        ev.preventDefault();
        if (ev.target.src) {
            const src = ev.target.src.split('/').pop();

            this.setState(prevState => ({profil: !prevState.profil, images: images, imgid: src}));
        }
    }

    displayProfil(ev){
        this.setState(prevState => ({profil: !prevState.profil, images: false}));
        ev.preventDefault();
    }

    renderProfil(){
        if (this.state.profil){
            return (
                <div style={profil} className={"profil"}>
                    <Images display={this.displayImages} allUsers={this.props.allUsers}  user={this.props.user} profil={this.props.profil} socket={this.props.socket} />
                    <div style={altContainer}>
                        <RemoteProfil allUsers={this.props.allUsers} user={this.props.user} socket={this.props.socket} profil={this.props.profil}/>
                        <About allUsers={this.props.allUsers} user={this.props.user} profil={this.props.profil} socket={this.props.socket}/>
                    </div>
                </div>
            )
        }
    }

    renderImages(){
        if (this.state.images){
            return <ImagesViewer next={this.nextImg} previous={this.previousImg} images={this.state.images} imgid={this.state.imgid} display={this.displayProfil}/>
        }
    }

    previousImg(ev, index){
        ev.preventDefault();
        this.setState({imgid: this.state.images[index - 1].imgid});
    }

    nextImg(ev, index){
        this.setState(prevState => ({imgid: this.state.images[index + 1].imgid}));
        ev.preventDefault();
    }

    render(){
        return (
            <div style={container} className={"profilContainer"}>
                {this.renderProfil()}
                {this.renderImages()}
            </div>
        )
    }
}

const altContainer = {
    display: 'flex',
};

const container = {
    zIndex: '10',
    background:  'rgba(0, 0, 0, 0.8)',
    position: 'fixed',
    overflow: 'auto',
    top: '0',
    left: '0',
    display: 'flex',
    justifyContent: 'left',
    width: '100%',
    height: '100%',
};

const profil = {
    display: 'flex',
    flexWrap: 'wrap',
    // flexDirection: 'column',
    margin: '5vmax',
    borderRadius: '0vh 0vh 1vmin 1vmin',
    width: '74vmin',
    height: '70vmin',
    background: 'rgba(255, 255, 255, 1)',
    minWidth: '400px',
    minHeight: '400px'
};



