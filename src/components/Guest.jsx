import React from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import ResetPassword from './ResetPassword.jsx';

let prevState = JSON.parse(sessionStorage.getItem('GuestState'));

export default class Guest extends React.Component{
    constructor (props){
        super(props);
        this.state = prevState ? prevState : {
            login: true,
            reset: false,
            status: 'Register'
        };
        this.switchButton = this.switchButton.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.saveState = this.saveState.bind(this);
    }

    switchButton (){
        if (this.state.reset){
            this.setState(prevState => ({
                reset: !prevState.reset,
                ['status']: prevState.login ? 'Register' : 'Login'
            }), this.saveState);
        } else {
            this.setState(prevState => ({
                ['login']: !prevState.login,
                ['status']: !prevState.login ? 'Register' : 'Login'
            }), this.saveState);
        }
    }

    saveState(){
        sessionStorage.setItem('GuestState', JSON.stringify(this.state))
    }

    resetPassword (ev){
        this.setState(prevState => ({
            reset: true,
            ['status']: !prevState.login ? 'Register' : 'Login'
        }), this.saveState);
        ev.preventDefault();
    }

    render () {
        let window = null;

        if (this.state.reset){
            window = <ResetPassword socket={this.props.socket}/>
        }
        else if (this.state.login){
            window = <Login socket={this.props.socket} reset={this.resetPassword} location={this.props.location}/>
        }
        else {
            window = <Register socket={this.props.socket} switch={this.switchButton}/>
        }

        return (
            <div style={container}>
                <button style={switchButton} onClick={this.switchButton}>{this.state.status}</button>
                {window}
            </div>
        );
    }
}

const switchButton = {
    marginTop: '125px',
    marginLeft: '442px',
    fontSize: '15px',
    borderRadius: '3px 3px 0px 0px',
    border: '1px solid #09466a',
    backgroundColor: 'white',
    outline: 'none',
    color: '#0a466b',
    width: '100px',
    height: '35px',
    minHeight: '35px',
    cursor: 'pointer'
};

const container = {
    overflow: 'auto',
    width: '100%',
    minWidth: '546px',
    height: '100%',
    backgroundColor: '#0a466b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};