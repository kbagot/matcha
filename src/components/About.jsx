import React from 'react';

export default class About extends React.Component{
    constructor(props){
        super(props);
        this.renderOnline = this.renderOnline.bind(this);
        this.renderLocation = this.renderLocation.bind(this);
        this.renderOrientation = this.renderOrientation.bind(this);
    }

    renderTags(){
        if (this.props.profil.tags.length) {
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
                {this.renderTags()}
            </div>
        )
    }
}

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
    padding: '0'
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