import React from 'react';
import UploadForm from './UploadForm.jsx';

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
        if (this.props.profil.id === this.props.user.id && this.state.images[0].imgid !== `nopic${this.props.user.sexe}.jpg`){
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
            const obj = elem.profil ? Object.assign({}, editButtonsContainer, {width: '9.5vmin', marginTop: '16vmin'}) : editButtonsContainer;

                return (
                    <div style={obj}>
                        <button style={editButtons} title={"Supprimer"} onClick={() => this.deleteImg(elem)}><img style={{width: '1.5vmin'}} src={"img/garbage.png"}/></button>
                        {(() => {
                            if (!elem.profil){
                                return <button style={editButtons} title={"Profil"} onClick={() => this.setProfil(elem)}><img style={{width: '2.5vmin'}} src={"img/user.png"} /></button>;
                            }
                        })()}

                    </div>
                )
        }
    }

    renderImg(type){
        const images = this.state.images;

        console.log(images);
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
                    {this.renderImg('profil')}
                    {this.renderEdit()}
                    {this.renderOnline()}
                    <div style={obj} className={"profilImgContainer"}>
                        {this.renderImg('all')}
                        {upload}
                    </div>

                </div>
            )
        } else {
            return <div></div>
        }
    }
}

const editButtons = {
    border: 'none',
    outline: 'none',
    margin: '1vmin',
    display: 'flex',
    justifyContent: 'center',
    width: '2.5vmin',
    height: '2.5vmin',
    boxShadow: '0px 0px 6px black',
    backgroundColor: 'rgb(9, 70, 106)',
    borderRadius: '50%'
};

const editButtonsContainer = {
    marginTop: '12.4vmin',
    position: 'absolute',
    width: '14.9vmin',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: '5'
};

const editLogo = {
    width: '2vmin'
};

const edit = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: '15vmin',
    marginLeft: '11vmin',
    zIndex: '4',
    width: '3vmin',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    borderRadius: '100%',
    backgroundColor: 'rgb(9, 70, 106)',
    boxShadow: '0px 0px 6px black',
    height: '3vmin',
};

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
    width: '60.1vmin',
    backgroundColor: 'transparent',
    marginLeft: '13.9vmin',
    height: '14.1vmin',
    display: 'inline-flex',
    borderRadius: '0 1vmin 0vmin 0',
    alignItems: 'center',
};

const imgContainer = {
    width: '15vmin',
    display: 'flex',
    flexDirection: 'column'
};

const img = {
    // borderRight: '3px solid white',
    filter: 'brightness(0.60)',
    width: '14.9vmin',
    height: '14.6vmin',
    marginTop: '0.2vh',
    borderTop: '1px solid white',
    borderRight: '1px solid white',
    borderLeft: '1px solid white'


};