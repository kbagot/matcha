import React from 'react';
import Cookie from 'cookie';

export default class Reset extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            password: '',
            error: {
                globalError: '',
                passwordErrror: null
            }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        this.props.socket.on('registerError', (data) => this.handleError(data));
    }

    componentWillUnmount(){
        this.props.socket.removeListener('registerError');
    }

    handleError(data){
        let error = Object.assign({}, this.state.error);

        error[data.type + 'Error'] = data.error;
        this.setState({
            ['error']: error
        });
    }

    handleSubmit(ev){
        ev.preventDefault();
        const login = Cookie.parse(document.cookie).reset;

        document.cookie = "reset=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (login && this.state.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)){
            this.props.valid();
            this.props.socket.emit('Register', {type: 'edit', value: [this.state.password, 'password', login]});
        }
    }

    handleChange(ev){
        let name = ev.target.name;
        let change = [];
        let value = (ev.target.name === 'bio' ? ev.target.value : ev.target.value.trim());

        this.setState({
            [name]: value
        }, () => {
            if (["login", "last", "first", "password", "email", "age"].indexOf(name) !== -1){
                change.push(this.state, name);
                this.props.socket.emit("Register", {type: "change", value: change});
            }
        });
    }

    render (){
        const error = Object.values(this.state.error).filter(elem => elem);
        const valid = !error.length && !!this.state.password.length;
        const submitStyle = !valid ? Object.assign({}, submit, {backgroundColor: '#c3c0c0', cursor: 'default'}) : submit;

        return (
            <div style={resetContainer}>
                <form style={form} onSubmit={this.handleSubmit}>
                    Veuillez entrer votre nouveau mot de passe
                    <span style={errorStyle}>{this.state.error.globalError}</span>
                    <input style={input} type="password" autoComplete={""} value={this.state.password} name="password" onChange={this.handleChange} placeholder={"Password*"}/> <span style={errorStyle}>{this.state.error.passwordError}</span>
                    <input style={submitStyle} type="submit" value="Changer" name="Submit" disabled={!valid}/>
                </form>
            </div>
        )
    }
}

const errorStyle = {
    fontSize: '15px',
    color: 'indianred'
};

const submit = {
    marginTop: '20px',
    width: '200px',
    minWidth: '200px',
    height: '35px',
    minHeight: '35px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    color: '#0a466b',
    border: '1px solid',
    cursor: 'pointer'
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
    justifyContent: 'center',
    color: 'rgb(10, 70, 107)',
    padding: '2vmin',
    flexDirection: 'column'
};

const resetContainer = {
    width: '400px',
    minWidth: '400px',
    height: '300px',
    minHeight: '300px',
    padding: '40px 70px',
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(10, 70, 107)',
    borderRadius: '4px 4px 4px 4px',
    flexDirection: 'column',
    marginTop: '150px',
    backgroundColor: 'white',
};