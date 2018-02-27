import React from 'react';
import UploadForm from './UploadForm.jsx';

export default class Profil extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            uploadForm: null
        };
        this.uploadForm = this.uploadForm.bind(this);
    }

    getImg(){
        console.log(this);
        if (this.props.user.id === this.props.profil){
                return <img style={img} src={`./img/no_pic_${this.props.user.sexe}.jpg`} />
        } else {

        }
    }

    uploadForm(ev){
        const form = <UploadForm user={this.props.user} socket={this.props.socket}/>;

        this.setState(prevState => ({uploadForm: prevState.uploadForm ? null : form}));
    }

    render(){
        return (
            <div style={container} className={"profilContainer"}>
                <div style={profil} className={"profil"}>
                    <div style={profilImgContainer} className={"profilImgContainer"}>
                         {this.getImg()}
                         <button style={addPicture} name={"profiAddPicture"} className={"profilAddPicture"} onClick={this.uploadForm}>+</button>
                    </div>
                    {this.state.uploadForm}
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
    // alignItems: 'center',
    justifyContent: 'left',
    width: '100%',
    height: '100%',
};

const profil = {
    margin: '2vh',
    borderRadius: '2vh',
    width: '80%',
    height: '80%',
    background: 'rgba(255, 255, 255, 1)',
};

const img = {
    margin: '1vh',
    border: '1px solid gray',
    borderRadius: '10vh',
    width: '20%',
    height: 'auto',
};

const profilImgContainer = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const addPicture = {
    outline: 'none',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    lineHeight: '3.22vh',
    padding: '0px',
    border: '1px solid gray',
    borderRadius: '10vh',
    cursor: 'pointer',
    fontSize: '8vh',
    width: '12vw',
    height: '7vh',
    background: 'rgb(196, 205, 223)',
    color: 'white',
};

