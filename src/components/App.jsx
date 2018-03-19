import React from 'react';
import io from 'socket.io-client';
import Guest from './Guest.jsx';
import User from './User.jsx';
import Cookie from 'cookie';
import ReactLoading from 'react-loading';

let cookie = Cookie.parse(document.cookie);
let ip = cookie.ip;
let socket = io(ip + ':8081');
const Login = {
    login: '',
        password: '',
        errorlogin: '',
        errorpasswd: '',
};

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            login: cookie.login,
            error: cookie.error,
            ready: cookie.ready,
            waiting: false,
            Login: {
                login: '',
                password: '',
                errorlogin: '',
                errorpasswd: '',
            }

        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.resetLogin = this.resetLogin.bind(this);
    }


    resetLogin(){
        this.setState({Login: Login});
    }

    handleChange(ev) {
        if (ev.target.name === "login") {
            this.setState({
                Login: Object.assign({}, this.state.Login, {login: ev.target.value})
            });
        }
        else if (ev.target.name === "password") {
            this.setState({
                Login: Object.assign({}, this.state.Login, {password: ev.target.value})
            });
        }
    }

    componentDidMount (){
        socket.on("error", (err) => console.log(err));
        socket.on('refresh', data => socket.emit('refresh', data));
        socket.on('user', (user, fn) => {
            this.userLogin(user);
            if (fn)
                fn();
        });
        socket.on('userDisconnect', (user) => this.userLogout());
        socket.on('logPass', (data) => this.handleClick({Login: Object.assign({}, this.state.Login, {errorpasswd: 'error', errorlogin: ''})}));
        socket.on('logLog', (data) => this.handleClick({Login: Object.assign({}, this.state.Login, {errorlogin: 'error', errorpasswd: ''})}));
    }

    handleClick(obj){
       let waiting = true;

        if (obj){
            waiting = false;
        }
        this.setState(prevState => (Object.assign({waiting: waiting}, obj)));
    }

    userLogin(user){
        document.cookie = "login=" + true;
        document.cookie = "error=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: user,['login']: true, ['error']: false, waiting: false, Login: Login});
    }

    userLogout(){
        document.cookie = "login=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        this.setState({['user']: {}, ['login']: undefined});
    }

    render(){
        let display = '';

        if (this.state.waiting && !this.state.login && !this.state.error){
            display = <div className="loadpage"><ReactLoading delay={0} type='cylon' color='white' width='15%' height='15px'/></div>;
        } else if (this.state.login && !this.state.error && !this.state.waiting) {
            display = <User socket={socket} user={this.state.user}/>;
        } else {
            display = <Guest reset={this.resetLogin} handleChange={this.handleChange} socket={socket} submit={this.handleClick} login={this.state.Login}/>;
        }

        return (
            <div className={"app"}>
                {display}
            </div>
        )
    }
}