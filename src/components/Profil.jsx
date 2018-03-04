import React from 'react';
import Images from './Images.jsx';
import About from './About.jsx';
import RemoteProfil from './RemoteProfil.jsx';

export default class Profil extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div style={container} className={"profilContainer"}>
               <div style={profil} className={"profil"}>
                    <Images allUsers={this.props.allUsers}  user={this.props.user} profil={this.props.profil} socket={this.props.socket} />
                   <div style={altContainer}>
                       <RemoteProfil allUsers={this.props.allUsers} user={this.props.user} socket={this.props.socket} profil={this.props.profil}/>
                       <About allUsers={this.props.allUsers} user={this.props.user} profil={this.props.profil} socket={this.props.socket}/>
                    </div>
                </div>
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
    flexWrap: 'wrap',
    // flexDirection: 'column',
    margin: '5vmax',
    borderRadius: '0vh 0vh 2vh 2vh',
    width: '74vmin',
    height: '70vmin',
    background: 'rgba(255, 255, 255, 1)',
    minWidth: '400px',
    minHeight: '400px'
};



