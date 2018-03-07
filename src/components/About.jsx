import React from 'react';

export default class About extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            edit: false,
            age: null,
            last: null,
            first: null,
            bio: null,
            sexe: null,
            orientation: null,
            tags: null
        };
        this.renderOnline = this.renderOnline.bind(this);
        this.renderLocation = this.renderLocation.bind(this);
        this.renderOrientation = this.renderOrientation.bind(this);
        this.renderBio = this.renderBio.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
    }

    renderTags(){
        if (this.props.profil.tags.length ) {
            const li = this.props.profil.tags.map((elem, id) => <li style={list} key={id}> {elem} </li>);

            return (
                <div style={tags}>
                    <ul style={uList}>
                        {li}
                    </ul>
                </div>
            )
        }
    }

    renderOnline(){
        const connected = this.props.allUsers.findIndex(elem => elem.id === this.props.profil.id);

        return (
            <div style={connected === -1 ? online : Object.assign({}, online, {backgroundColor: 'rgb(51, 204, 51)'})}>
            </div>
        )
    }

    renderLocation(){
        const city = this.props.profil.city ? this.props.profil.city : '';
        const zip = this.props.profil.zipcode ? '('+this.props.profil.zipcode+')' : '';
        const country = this.props.profil.country ? ', ' +this.props.profil.country : '';
        const distance = this.props.profil.distance ? ' - ' + Math.round(Number(this.props.profil.distance)) + 'km' : '';

        return city + zip + country + distance;
    }


    renderOrientation(){
        if (!this.state.edit) {
            const orientation = {
                M: {
                    hetero: 'Interesse par les femmes',
                    bi: 'Interesse par les hommes et les femmes',
                    gay: 'Interesse par les hommes',
                    trans: 'Interesse par les trans'
                },
                F: {
                    hetero: 'Interessee par les hommes',
                    bi: 'Interessee par les femmes et les hommes',
                    gay: 'Interessee par les femmes',
                    trans: 'Interessee par les trans'
                },
                T: {
                    hetero: 'Interessee par les femmes et les hommes',
                    bi: 'Interessee par les femmes et les hommes',
                    gay: 'Interessee par les femmes et les hommes',
                    trans: 'Interessee par les trans'
                }
            };

            console.log(this.props.profil)
            return orientation[this.props.profil.sexe][this.props.profil.orientation];
        } else {
            return (
                <select style={selectOrientation} value={this.state.orientation !== null ? this.state.orientation : this.props.profil.orientation} onChange={this.handleChange} name={"orientation"}>
                    <option value="M">Les Hommes</option>
                    <option value="F">Les Femmes</option>
                    <option value="bi">Les deux</option>
                    <option value="T">Trans</option>
                </select>
            )
        }
    }

    handleEdit(){
        if (this.state.edit) {
            this.props.socket.emit('profil', {type: 'editProfil', data: this.state});
        }
        this.setState(prevState => ({edit: !prevState.edit}));
    }

    renderEdit(){
        if (this.props.profil.id === this.props.user.id){
            return (
                <div style={editContainer}>
                <button style={edit} onClick={this.handleEdit}>
                    <img style={editLogo} src={this.state.edit ? "img/checked.png" : "img/edit.png"} />
                </button>
                </div>
            );
        }
    }

    handleChange(ev){
        let name = ev.target.name;
        let value = (ev.target.name === 'bio' ? ev.target.value : ev.target.value.trim());

        this.setState({[name]: value});
        ev.preventDefault();
    }

    renderBio(){
        const bioMsg = !this.props.profil.bio ? 'Aucune description.' : this.props.profil.bio;
        if (!this.state.edit) {
            return (
                <p style={bio}>
                    {bioMsg}
                </p>
            )
        } else {
            return (
                <textarea name={'bio'} style={textArea} value={this.state.bio !== null ? this.state.bio : this.props.profil.bio} onChange={this.handleChange} wrap={'hard'} />
            )
        }
    }

    renderTop(){
        const sexeLogo = {
            M: '\u2642',
            F: '\u2640',
            T: '\u26A5'
        };

        if (!this.state.edit){
            return (
            <div style={topContainer}>
                {this.renderEdit()}
                <h3 style={h1}>{this.props.profil.login} {sexeLogo[this.props.profil.sexe]}</h3>
                <p style={firstName}>
                    {this.props.profil.last} {this.props.profil.first}, {this.props.profil.age} <br />
                </p>
                <p style={firstName}>
                    {this.renderLocation()}
                </p>
                <p style={firstName}>
                    {this.renderOrientation()}
                </p>
            </div>
            )
        } else {
            return <div style={topContainer}>
                {this.renderEdit()}
                <h3 style={h1}> {this.props.profil.login}
                    <select style={selectSex} value={this.state.sexe ? this.state.sexe : this.props.profil.sexe} onChange={this.handleChange} name={"sexe"}>
                        <option value="M">{sexeLogo.M}</option>
                        <option value="F">{sexeLogo.F}</option>
                        <option value="T">{sexeLogo.T}</option>
                    </select><br />
                </h3>
                <p style={firstName}>
                    <input style={name} type="text" autoComplete={"family-name"} value={this.state.last !== null ? this.state.last : this.props.profil.last} name="last" onChange={this.handleChange}/>
                    <input style={name} type="text" autoComplete={"given-name"} value={this.state.first !== null ? this.state.first : this.props.profil.first} name="first" onChange={this.handleChange}/>
                    <input style={name} type={"number"} min={"18"} max={"99"} name="age" onChange={this.handleChange} value={this.state.age !== null ? this.state.age : this.props.profil.age}/>
                </p>
                <p style={firstName}>
                    {this.renderLocation()}
                </p>
                <p style={firstName}>
                    {this.renderOrientation()}
                </p>
            </div>
        }
    }

    render (){
        return (
            <div style={container} className={"aboutContainer"} >
                {this.renderTop()}
                {this.renderBio()}
                {this.renderTags()}
            </div>
        )
    }
}

const selectOrientation = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.52)',
    fontSize: '1.8vmin',
    fontFamily: 'Verdana, serif',
};

const name = {
    margin: '0.5vmin',
    borderRadius: '1px',
    fontSize: '1.8vmin',
    border: 'none',
    width: '8vmin',
    backgroundColor: 'transparent',
    boxShadow: '0px 0px 3px rgba(255, 255, 255, 0.52)',
    color: 'white',
    fontFamily: 'Verdana, serif',
};

const selectSex = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    textShadow: '0 0 10px #007eff',
    textTransform: 'uppercase',
    fontSize: '3vmin',
    fontFamily: 'Verdana, serif',
};

const textArea = {
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: 'Verdana, serif',
    marginBottom: '1.8vmin',
    borderRadius: '0 0 1vmin 1vmin',
    boxShadow: '2px 2px 10px #8f949878',
    padding: '2vmin',
    marginTop: '0vmin',
    overflow: 'auto',
    whiteSpace: 'pre-line',
    width: '62vmin',
    height: '35%',
    fontSize: '1.8vmin',
    backgroundColor:'white',
    color: 'black',
};

const editLogo = {
    width: '2vmin'
};

const edit = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3vmin',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    borderRadius: '100%',
    backgroundColor: 'rgb(9, 70, 106)',
    boxShadow: '0px 0px 6px black',
    height: '3vmin',
};

const editContainer = {
    width: '64%',
    zIndex: '0',
    position: 'absolute',
    display: 'flex',
    justifyContent:'flex-end'
};

const topContainer = {
    color: 'rgba(255, 255, 255, 0.52)',
    padding: '2vmin',
    backgroundColor: '#09466a',
    borderRadius: '1vmin 1vmin 0vmin 0vmin',
    boxShadow: '2px 2px 10px #8f949878',
    width: '62vmin',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
};

const tags = {
    height: '20%',
    width: '62vmin',
    overflow: 'auto'
};

const container = {
    fontFamily: 'Verdana, serif',
    width: '100%',
    height: '54vmin',
    padding: '2vmin',
    marginTop: '-2vmin',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
};

const h1 = {
    color: 'white',
    display: 'flex',
    margin: '0',
    padding: '0',
    zIndex: '1'
};

const firstName = {
    fontSize: '1.8vmin',
    margin: '0',
};

const bio = {
    borderRadius: '0 0 1vmin 1vmin',
    boxShadow: '2px 2px 10px #8f949878',
    padding: '2vmin',
    marginTop: '0vmin',
    overflow: 'auto',
    whiteSpace: 'pre-line',
    width: '62vmin',
    height: '35%',
    fontSize: '1.8vmin',
    backgroundColor:'white',
    color: '#0a466970',
};

const list = {
    display: 'inline-block',
    padding: '2px 5px',
    fontSize: '0.9em',
    marginLeft: '1vmin',
    height: '15%',
    marginTop: '1vmin',
    verticalAlign: 'top',
    lineHeight: '1.4',
    borderRadius: '2px',
    backgroundColor: 'rgba(0, 126, 255, 0.08)',
    color: '#007eff',
    border: '1px solid rgba(0, 126, 255, 0.24)'
};

const uList = {
    display: 'flex',
    flexWrap: 'wrap',
    listStyleType: 'none',
    margin: '0',
    alignItems: 'center',
    padding: '0 0 1vmin 0vmin',
    paddingTop: '0',
    overflow: 'auto',
    whiteSpace: 'pre-line',
    width: '90%',
    fontSize: '1.8vmin'
};