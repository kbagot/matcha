import React from 'react';
import Images from './Images.jsx';

export default class Profil extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        let img;
        console.log(this.refs.child);
        return (
            <div style={container} className={"profilContainer"}>
                <img style={profilImg} src={"img/lufa17caje8ztkqm.jpg"} />
                <div style={profil} className={"profil"}>
                    <Images ref={instance => this.child = instance} user={this.props.user} profil={this.props.profil} socket={this.props.socket} />
                </div>
            </div>
        )
    }
}
const profilImg = {
    margin: '3vmax',
    position: 'absolute',
    filter: 'brightness(1)',
    top: '0',
    left: '0',
    // border: '1x solid white',
    borderRadius: '100%',
    width: '24vmin',
    height: '24vmin',
    zIndex: '11'
};

const container = {
    zIndex: '10',
    background:  'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: '0',
    left: '0',
    display: 'flex',
    justifyContent: 'left',
    width: '100%',
    height: '100%',
};

const profil = {
    display: 'flex',
    flexDirection: 'column',
    margin: '3vmax',
    borderRadius: '2vh',
    width: '71.5vmin',
    height: '70vmin',
    background: 'rgba(255, 255, 255, 1)',
};



