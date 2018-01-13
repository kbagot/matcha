import React from 'react';

export default class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: '',
            password: '',
            email: '',
            sexe: '',
            bio: '',
            orientation: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(ev){
        let name = ev.target.name;

        this.setState({
           [name]: ev.target.value
        });
    }

    handleSubmit(ev){
        socket.emit('register', this.state);
        ev.preventDefault();
    }

    render() {
        return (
            <div className={'Register-Container'}>
                <h2>Register {this.state.password}</h2>
                <form onSubmit={this.handleSubmit}>
                    Login  <input type="text" value={this.state.login} name="login" onChange={this.handleChange}/> <br />
                    Password <input type="password" value={this.state.password} name="password" onChange={this.handleChange}/><br />
                    Email <input type="email" value={this.state.email} name="email" onChange={this.handleChange}/><br />
                    Je suis
                    <select value={this.state.sexe} onChange={this.handleChange} name={"sexe"}>
                        <option value="M">Un Homme</option>
                        <option value={"F"}>Une Femme</option>
                    </select><br />
                    Bio <textarea value={this.state.bio} name="bio" onChange={this.handleChange}/><br />
                    J'aime
                    <select value={this.state.orientation} onChange={this.handleChange} name={"orientation"}>
                        <option value="homme">Les Hommes</option>
                        <option value={"femme"}>Les Femmes</option>
                        <option value={"bi"}>Les deux</option>
                    </select><br />
                    <input type="submit" value="S'inscrire" name="Submit" />
                </form>
            </div>
        );
    }
}