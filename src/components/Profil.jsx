import React from 'react';
import Images from './Images.jsx';

export default class Profil extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        console.log(this.props.profil);
        return (
            <div style={container} className={"profilContainer"}>
                <div style={profil} className={"profil"}>
                    <Images user={this.props.user} profil={this.props.profil} socket={this.props.socket} />
                </div>
            </div>
        )
    }
}

const container = {
    background:  'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: '0',
    display: 'flex',
    justifyContent: 'left',
    width: '100%',
    height: '100%',
};

const profil = {
    display: 'flex',
    flexDirection: 'column',
    margin: '2vh',
    borderRadius: '2vh',
    width: '80%',
    height: '80%',
    background: 'rgba(255, 255, 255, 1)',
};



