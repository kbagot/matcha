import React from 'react';
let socket = io(`http://localhost:8081`);
import io from 'socket.io-client';

export default class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: '',
            password: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(ev){
        if (ev.target.name === "login"){
            this.setState({
            ['login']: ev.target.value}
            );
        }
        else if (ev.target.name === "password"){
            this.setState({
                ['password']: ev.target.value
            });
        }
    }

    handleSubmit(ev){
        socket.emit('login', this.state);
        ev.preventDefault();
    }

    render() {
        return (
            <div className={'Login-Container'}>
                <h2>Login {this.state.password}</h2>
                <form onSubmit={this.handleSubmit}>
                    Login  <input type="text" value={this.state.login} name="login" onChange={this.handleChange}/> <br />
                    Password <input type="password" value={this.state.password} name="password" onChange={this.handleChange}/><br />
                    <input type="submit" value="S'identifier" name="Submit" />
                </form>
            </div>
        );
    }
}