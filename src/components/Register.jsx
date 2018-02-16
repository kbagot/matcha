import React from 'react';
import SelectTags from './SelectTags.jsx';

export default class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: '',
            age: '',
            last: '',
            first: '',
            password: '',
            email: '',
            sexe: 'M',
            bio: '',
            orientation: 'bi',
            tags: [],
            error : {
                globalError: null,
                ageError: null,
                loginError: null,
                lastError: null,
                firstError: null,
                passwordError: null,
                emailError: null
            }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleError = this.handleError.bind(this);
        this.validSubmit = this.validSubmit.bind(this);
        this.getUserTags= this.getUserTags.bind(this);
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

    handleSubmit(ev){
        if (!this.validSubmit()){
            this.props.socket.emit('Register', {type:"submit" , value: this.state});
            this.props.switch();
        }
        ev.preventDefault();
    }

    validSubmit() {
        let res = [];
        let ret;

        ["loginError", "passwordError", "emailError", "ageError"].forEach((elem) => {
            res.push(this.state.error[elem] === null);
        });

        ret = res.find((elem) => elem === false);
        return !(ret === undefined && this.state.login.length > 0 && this.state.password.length > 0 && this.state.email.length > 0 && this.state.age >= 18 && this.state.age <= 99);
    }

    getUserTags(tags) {
        this.setState({['tags']: tags});
    }

    render() {
        const valid = this.validSubmit();
        const globalError = <p>{this.state.error.globalError}</p>;

        return (
            <div className={'Register-Container'}>
                <h2>Register {this.state.password}</h2>
                <form onSubmit={this.handleSubmit}>
                    {globalError}
                    Login *  <input type="text" autoComplete={"username"} value={this.state.login} name="login" onChange={this.handleChange}/> {this.state.error.loginError} <br />
                    Nom * <input type="text" autoComplete={"family-name"} value={this.state.last} name="last" onChange={this.handleChange}/> {this.state.error.lastError}<br />
                    Prenom * <input type="text" autoComplete={"given-name"}value={this.state.first} name="first" onChange={this.handleChange}/> {this.state.error.firstError}<br />
                    Age * <input type={"number"} min={"18"} max={"99"} name="age" onChange={this.handleChange} value={this.state.age}/> {this.state.error.ageError} <br />
                    Password * <input type="password" autoComplete={""} value={this.state.password} name="password" onChange={this.handleChange}/> {this.state.error.passwordError}<br />
                    Email * <input type="text" autoComplete={"email"} value={this.state.email} name="email" onChange={this.handleChange}/> {this.state.error.emailError}<br />
                    Je suis
                    <select value={this.state.sexe} onChange={this.handleChange} name={"sexe"}>
                        <option value="M">Un Homme</option>
                        <option value="F">Une Femme</option>
                        <option value="T">Erreur de la nature</option>
                    </select><br />
                    Bio <textarea value={this.state.bio} name="bio" onChange={this.handleChange}/><br />
                    J'aime
                    <select value={this.state.orientation} onChange={this.handleChange} name={"orientation"}>
                        <option value="M">Les Hommes</option>
                        <option value="F">Les Femmes</option>
                        <option value="bi">Les deux</option>
                        <option value="trans">dégénérer sexuelle (ovni)</option>
                    </select><br />
                    Tags
                    <SelectTags socket={this.props.socket} sendTags={this.getUserTags} create/><br />
                    <input type="submit" value="S'inscrire" name="Submit" disabled={valid}/>
                </form>
            </div>
        );
    }
}