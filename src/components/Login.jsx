import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            errorlogin: '',
            errorpasswd: 'input',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('logpass', () => {
            this.setState({['errorpasswd']: 'error_input'});
            console.log('rout');
        });
        this.props.socket.on('loglog', () => {
            this.setState({['errorlogin']: 'error_input'});
        });
    }

    componentWillUnmount() {
        this.props.socket.removeListener('logpass');
        this.props.socket.removeListener('loglog');
    }

    handleChange(ev) {
        if (ev.target.name === "login") {
            this.setState({
                ['login']: ev.target.value
            });
            this.setState({
                ['errorlogin']: 'input'
            });
        }
        else if (ev.target.name === "password") {
            this.setState({
                ['password']: ev.target.value
            });
            this.setState({
                ['errorpasswd']: 'input'
            });
        }
    }

    handleSubmit(ev) {
        this.props.socket.emit('login', this.state);
        ev.preventDefault();
    }

    render() {
        const errorStyle = Object.assign({}, input, {borderColor: 'indianred'});
        const loginStyle = this.state.errorlogin === 'error_input' ?  errorStyle : input;
        const passwordStyle = this.state.errorpasswd === 'error_input' ?  errorStyle : input;

        return (
            <div style={loginContainer} className={'Login-Container'}>
                <form style={form} onSubmit={this.handleSubmit}>
                    <input style={loginStyle} autoComplete="username" type="text" value={this.state.login} name="login"
                                 onChange={this.handleChange} placeholder={"Login"}/>
                    <input style={passwordStyle} autoComplete="current-password" type="password" value={this.state.password}
                                    name="password" onChange={this.handleChange} placeholder={"Password"}/>
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