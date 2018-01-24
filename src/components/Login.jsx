import React from 'react';

export default class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: '',
            password: '',
            errorlogin: '',
            errorpasswd: 'input',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.socket.on('logpass',() => {this.setState({['errorpasswd']: 'error_input'})});
        this.props.socket.on('loglog', () => {this.setState({['errorlogin']: 'error_input'})});
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
        this.props.socket.emit('login', this.state);
        ev.preventDefault();
    }

    render() {
        return (
             <div className={'Login-Container'}>
                <h2>Login {this.state.password}</h2>
                <form onSubmit={this.handleSubmit}>
                    Login  <input class={this.state.errorlogin} type="text" value={this.state.login} name="login" onChange={this.handleChange}/> <br />
                    Password <input class={this.state.errorpasswd} type="password" value={this.state.password} name="password" onChange={this.handleChange}/><br />
                    <input type="submit" value="S'identifier" name="Submit" />
                </form>
                 <h1>{this.state.error}</h1>
            </div>
        );
    }
}