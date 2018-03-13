import React from 'react';
import UploadForm from './UploadForm.jsx';
import RemoteProfil from './RemoteProfil.jsx';

export default class Images extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            images : null,
            edit: false,
        };
        this.renderOnline = this.renderOnline.bind(this);
        this.renderEdit = this.renderEdit.bind(this);
        this.renderEditButtons = this.renderEditButtons.bind(this);
    }

    renderOnline(){
        const connected = this.props.allUsers.findIndex(elem => elem.id === this.props.profil.id);
        const title = connected !== -1 ? "Online" : "Derniere connexion le " + this.props.profil.date;

        return (
            <div title={title} style={connected === -1 ? online : Object.assign({}, online, {backgroundColor: 'rgb(51, 204, 51)'})}>
            </div>
        )
    }

    renderEdit(){
        if (this.props.profil.id === this.props.user.id && this.state.images[0].imgid !== `nopic.png`){
            return (
                    <button style={edit} onClick={() => this.setState(prevState => ({edit: !prevState.edit}))}>
                        <img style={editLogo} src={"img/edit.png"} />
                    </button>
            );
        }
    }

    setProfil(elem){
        this.props.socket.emit('profil', {type: 'profilImg', img: elem});
    }

    deleteImg(elem){
        this.props.socket.emit('profil', {type: 'imgDel', img: elem});
        if (this.state.images.length === 1 && this.state.images[0] === elem){
            this.setState(prevState => ({edit: !prevState.edit}));
        }
    }

    renderEditButtons(elem){
        if (this.props.profil.id === this.props.user.id && this.state.edit) {
            const obj = elem.profil ? Object.assign({}, editButtonsContainer, {width: '110px', marginTop: '170px'}) : editButtonsContainer;

                return (
                    <div style={obj}>
                        <button style={editButtons} title={"Supprimer"} onClick={() => this.deleteImg(elem)}><img style={{width: '15px'}} src={"img/garbage.png"}/></button>
                        {(() => {
                            if (!elem.profil){
                                return <button style={editButtons} title={"Profil"} onClick={() => this.setProfil(elem)}><img style={{width: '25px'}} src={"img/user.png"} /></button>;
                            }
                        })()}

                    </div>
                )
        }
    }

    renderImg(type){
        const images = this.state.images;

        if (images) {
            return images.map((elem, i) => {
                if (type === 'all' && !elem.profil) {
                    return(
                    <div key={i} style={imgContainer}><a href={""} onClick={(ev) => this.props.display(ev, images)}>
                        <img style={img} src={`img/${elem.imgid}`}/>
                    </a>{this.renderEditButtons(elem)}</div>
                    )
                } else if (type === 'profil' && elem.profil) {
                    return (
                        <div key={i}><a href={""} onClick={(ev) => this.props.display(ev, images)}>
                            <img style={profilImg} src={`img/${elem.imgid}`}/>
                        </a>{this.renderEditButtons(elem)}</div>
                    )
                }
            });
        }
    }

    componentDidMount(){
        this.props.socket.on(this.props.profil.login, (data) => this.setState({images: data}));
        if (this.props.profil && this.props.profil.id !== this.props.user.id){
            this.props.socket.emit("profil", {type:'getImages', profil: this.props.profil});
        } else  if (this.props.profil.id === this.props.user.id){
            this.setState({images: this.props.user.img});
        }
    }


    componentWillUnmount(){
        this.props.socket.removeListener(this.props.profil.login);
        this.props.socket.removeListener(this.props.profil.id);
    }

    renderUpload(){
        const images = this.state.images;

        if (this.props.user.id === this.props.profil.id && images.length < 5){
            return <UploadForm length={images.length} user={this.props.user} socket={this.props.socket}/>
        }
    }

    render() {
        if (this.state.images) {
            let upload = this.renderUpload();
            const images = this.state.images;
            const obj = images.length > 1 ? profilImgContainer : Object.assign({}, profilImgContainer, {backgroundColor: '#0a4669'});

            return (
                <div>
                    <button onClick={() => this.props.load(false)} style={close}>x</button>
                    {this.renderImg('profil')}
                    {this.renderEdit()}
                    {this.renderOnline()}
                    <div style={obj} className={"profilImgContainer"}>
                        {this.renderImg('all')}
                        {upload}
                    </div>
                    <RemoteProfil allUsers={this.props.allUsers} user={this.props.user} socket={this.props.socket} profil={this.props.profil} images={this.state.images}/>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

const close = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: '-13px',
    marginLeft: '761px',
    zIndex: '4',
    width: '30px',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0px 0px 6px black',
    height: '30px',
    fontFamily: 'Verdana, serif'
};

const editButtons = {
    border: 'none',
    outline: 'none',
    margin: '10px',
    display: 'flex',
    justifyContent: 'center',
    width: '25px',
    height: '25px',
    boxShadow: '0px 0px 6px black',
    backgroundColor: 'rgb(9, 70, 106)',
    borderRadius: '50%'
};

const editButtonsContainer = {
    marginTop: '121px',
    position: 'absolute',
    width: '150px',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: '5'
};

const editLogo = {
    width: '20px'
};

const edit = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: '162px',
    marginLeft: '116px',
    zIndex: '4',
    width: '30px',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    borderRadius: '100%',
    backgroundColor: 'rgb(9, 70, 106)',
    boxShadow: '0px 0px 6px black',
    height: '30px',
};

const online = {
    position: 'absolute',
    marginTop: '130px',
    marginLeft: '154px',
    zIndex: '4',
    backgroundColor: 'gray',
    color: 'red',
    width: '30px',
    height: '30px',
    boxShadow: '0px 0px 6px black',
    borderRadius: '100%'
};

const profilImg = {
    position: 'absolute',
    margin: '-50px',
    filter: 'brightness(1)',
    border: '2px solid white',
    boxShadow: '0px 0px 6px black',
    borderRadius: '100%',
    width: '241px',
    height: '241px',
    zIndex: '3'
};

const profilImgContainer = {
    position: 'absolute',
    zIndex: '2',
    width: '610px',
    marginLeft: '170px',
    backgroundColor: 'transparent',
    height: '144px',
    display: 'inline-flex',
    borderRadius: '0 10px 0 0',
    alignItems: 'center',
};

const imgContainer = {
    width: '152px',
    display: 'flex',
    flexDirection: 'column'
};

const img = {
    // borderRight: '3px solid white',
    filter: 'brightness(0.60)',
    width: '100%',
    height: '145px',
    marginTop: '2px',
    borderTop: '1px solid white',
    borderRight: '1px solid white',
    borderLeft: '1px solid white'


};