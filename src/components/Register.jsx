import React from 'react';

export default class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: '',
            password: '',
            email: '',
            sexe: 'M',
            bio: '',
            orientation: 'bi',
            error : ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleError = this.handleError.bind(this);
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

    handleChange(ev){
        let name = ev.target.name;
        let change = [];
        let value = ev.target.value;

        this.setState({
           [name]: value
        }, () => {
            if (["login", "password", "email"].indexOf(name) !== -1){
                change.push(this.state, name);
                this.props.socket.emit("changeRegister", change);
            }
        });
    }

    handleSubmit(ev){
        // console.log(ev.target.login);
        if (this.state.error)
            console.log(this.state.error );
        this.props.socket.emit('register', this.state);
        ev.preventDefault();
    }


    render() {
        return (
            <div className={'Register-Container'}>
                <h2>Register {this.state.password}</h2>
                <form onSubmit={this.handleSubmit}>
                    Login  <input type="text" value={this.state.login} name="login" onChange={this.handleChange}/> {this.state.error.loginError} <br />
                    Password <input type="password" value={this.state.password} name="password" onChange={this.handleChange}/> {this.state.error.passwordError}<br />
                    Email <input type="email" value={this.state.email} name="email" onChange={this.handleChange}/> {this.state.error.emailError}<br />
                    Je suis
                    <select value={this.state.sexe} onChange={this.handleChange} name={"sexe"}>
                        <option value="M">Un Homme</option>
                        <option value="F">Une Femme</option>
                    </select><br />
                    Bio <textarea value={this.state.bio} name="bio" onChange={this.handleChange}/><br />
                    J'aime
                    <select value={this.state.orientation} onChange={this.handleChange} name={"orientation"}>
                        <option value="homme">Les Hommes</option>
                        <option value="femme">Les Femmes</option>
                        <option value="bi">Les deux</option>
                    </select><br />
                    <input type="submit" value="S'inscrire" name="Submit"/>
                </form>
            </div>
        );
    }
}