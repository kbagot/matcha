import React from 'react';

export default class About extends React.Component{
    constructor(props){
        super(props);
        this.renderOnline = this.renderOnline.bind(this);
        this.renderLocation = this.renderLocation.bind(this);
        this.renderOrientation = this.renderOrientation.bind(this);
    }

    renderTags(){
        const li = this.props.profil.tags.map((elem, id) => <li style={list} key={id}> {elem} </li>);

        return (
            <ul style={uList}>
                {li}
            </ul>
        )
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
        let resume = `${this.props.profil.city}(${this.props.profil.zipcode}), ${this.props.profil.country}`;

        return city + zip + country + distance;
    }


    renderOrientation(){
        const orientation = {
            M:{
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
            }
        };

        return orientation[this.props.profil.sexe][this.props.profil.orientation];
    }

    render (){
        const sexeLogo = {
            M: '\u2642',
            F: '\u2640',
            T: '\u26A5'
        };

        const bioMsg = !this.props.profil.bio ? 'Aucune description.' : <span>{this.props.profil.bio}</span>;

        return (
            <div style={container} className={"aboutContainer"} >
                <div style={topContainer}>
                <h3 style={h1}>{this.props.profil.login} {sexeLogo[this.props.profil.sexe]}</h3>
                <p style={firstName}>
                    {this.props.profil.first}, {this.props.profil.age} <br />
                </p>
                <p style={firstName}>
                    {this.renderLocation()}
                </p>
                <p style={firstName}>
                    {this.renderOrientation()}
                </p>
                </div>
                <p style={bio}>
                    {bioMsg}
                </p>
                <div style={bio}>
                    {this.renderTags()}
                </div>
            </div>
        )
    }
}

const topContainer = {
    color: 'rgba(43, 147, 251, 0.57)',
    padding: '2vmin',
    background: 'linear-gradient(-0.65turn, rgba(4, 127, 249, 0.49) -100%, white 50%, rgb(219, 235, 254) 150%)',
    borderRadius: '1vmin',
    boxShadow: '2px 2px 10px #8f949878',
    width: '43vmin',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
};

const container = {
    backgroundColor: 'transparent',
    fontFamily: 'Verdana, serif',
    width: '50vmin',
    height: '54vmin',
    paddingTop: '15vmin',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
};

const h1 = {
    color: '#2b93fb',
    display: 'flex',
    margin: '0',
    padding: '0'
};

const firstName = {
    fontSize: '1.8vmin',
    margin: '0',
};

const bio = {
    borderRadius: '1vmin',
    boxShadow: '2px 2px 10px #8f949878',
    padding: '2vmin',
    overflow: 'auto',
    whiteSpace: 'pre-line',
    width: '43vmin',
    fontSize: '1.8vmin',
    background: 'linear-gradient(-0.65turn, rgba(4, 127, 249, 0.49) -100%, white 50%, rgb(219, 235, 254) 150%)',
    color: 'gray',
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