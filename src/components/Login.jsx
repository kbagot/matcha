import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

     handleSubmit(ev) {
         ev.preventDefault();
         if ("geolocation" in navigator) {
             const pos = {
                 lat: '',
                 lon: ''
             };
             this.props.submit();
             navigator.geolocation.getCurrentPosition(async position => {
                 pos.lat = position.coords.latitude;
                 pos.lon = position.coords.longitude;
                 this.props.socket.emit('login', Object.assign({} , this.props.login, pos));
             }, error => {
                 this.props.socket.emit('login', Object.assign({} , this.props.login, pos));
             }, {timeout: 4000});
         }
    }

    render() {
        const errorStyle = Object.assign({}, input, {borderColor: 'indianred'});
        const loginStyle = this.props.login.errorlogin !== '' ?  errorStyle : input;
        const passwordStyle = this.props.login.errorpasswd !== '' ?  errorStyle : input;

        return (
            <div style={loginContainer} className={'Login-Container'}>
                <form style={form} onSubmit={this.handleSubmit}>
                    <input style={loginStyle} autoComplete="username" type="text" value={this.props.login.login} name="login"
                                 onChange={this.props.handleChange} placeholder={"Login"}/>
                    <input style={passwordStyle} autoComplete="current-password" type="password" value={this.props.login.password}
                                    name="password" onChange={this.props.handleChange} placeholder={"Password"}/>
                    <input style={submit} type="submit" value="S'identifier" name="Submit"/>
                </form>
                <a style={forgotten} href="" onClick={this.props.reset}> Mot de passe oublie ?</a>
            </div>
        );
    }
}

const forgotten = {
    fontSize: '15px',
    color: '#09466a',
    textDecoration: 'none'
};

const submit = {
    width: '200px',
    height: '35px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    border: '1px solid'
};

const input = {
    width: '280px',
    height: '45px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    border: '1px solid',
    margin: '20px'
};

const form = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(10, 70, 107)',
    padding: '2vmin',
    flexDirection: 'column'
};

const loginContainer = {
    width: '400px',
    minWidth: '400px',
    height: '300px',
    minHeight: '300px',
    padding: '40px 70px',
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(10, 70, 107)',
    borderRadius: '4px 0px 4px 4px',
    flexDirection: 'column',
    backgroundColor: 'white',
};