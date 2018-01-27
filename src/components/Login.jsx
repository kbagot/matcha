import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            errorlogin: '',
            errorpasswd: 'input',
            coords: {},
        };
        navigator.geolocation.getCurrentPosition((position) => {
            this.state.coords = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            };
            console.log(this.state.coords);
        });
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
        return (
            <div className={'Login-Container'}>
                <form onSubmit={this.handleSubmit}>
                    Login <input className={this.state.errorlogin} type="text" value={this.state.login} name="login"
                                 onChange={this.handleChange}/> <br/>
                    Password <input className={this.state.errorpasswd} type="password" value={this.state.password}
                                    name="password" onChange={this.handleChange}/><br/>
                    <input type="submit" value="S'identifier" name="Submit"/>
                </form>
                <h1>{this.state.error}</h1>
            </div>
        );
    }
}