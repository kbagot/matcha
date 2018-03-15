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
        if (this.validSubmit()){
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
        return (ret === undefined && this.state.login.length && this.state.password.length && this.state.email.length
        && this.state.last.length && this.state.first.length
            && this.state.age >= 18 && this.state.age <= 99);
    }

    getUserTags(tags) {
        this.setState({['tags']: tags});
    }

    render() {
        const valid = !this.validSubmit();
        const globalError = <p>{this.state.error.globalError}</p>;
        const submitStyle = valid ? Object.assign({}, submit, {backgroundColor: '#c3c0c0', cursor: 'default'}) : submit;
        return (
            <div style={registerContainer} className={'Register-Container'}>
                <form style={form} onSubmit={this.handleSubmit}>
                    <span  style={error}>{globalError}</span>
                    <input style={input} type="text" autoComplete={"username"} value={this.state.login} name="login" onChange={this.handleChange} placeholder={"Login*"}/> <span style={error}>{this.state.error.loginError}</span>
                    <input style={input} type="text" autoComplete={"family-name"} value={this.state.last} name="last" onChange={this.handleChange} placeholder={"Nom*"}/> <span style={error}>{this.state.error.lastError}</span>
                    <input style={input} type="text" autoComplete={"given-name"} value={this.state.first} name="first" onChange={this.handleChange} placeholder={"Prenom*"}/> <span style={error}>{this.state.error.firstError}</span>
                    <input style={ageInput} type={"number"} min={"18"} max={"99"} name="age" onChange={this.handleChange} value={this.state.age} placeholder={"Age*"}/> <span style={error}>{this.state.error.ageError}</span>
                    <input style={input} type="password" autoComplete={""} value={this.state.password} name="password" onChange={this.handleChange} placeholder={"Password*"}/> <span style={error}>{this.state.error.passwordError}</span>
                    <input style={input} type="text" autoComplete={"email"} value={this.state.email} name="email" onChange={this.handleChange} placeholder={"Email*"}/> <span style={error}>{this.state.error.emailError}</span>
                    <textarea style={textarea} value={this.state.bio} name="bio" onChange={this.handleChange} placeholder={"Description"}/>
                    <p style={iAm}>Je suis</p>
                    <select style={selectSex} value={this.state.sexe} onChange={this.handleChange} name={"sexe"}>
                        <option value="M">Un Homme</option>
                        <option value="F">Une Femme</option>
                        <option value="T">Transgenre</option>
                    </select>
                    <p style={iAm}>interesse par</p>
                    <select style={selectSex} value={this.state.orientation} onChange={this.handleChange} name={"orientation"}>
                        <option value="m">Les Hommes</option>
                        <option value="f">Les Femmes</option>
                        <option value="bi">Les deux</option>
                        <option value="trans">Trans</option>
                    </select>
                    <p style={iAm}>Tags</p>
                    <div style={{width: '100%', maxHeight: '160px'}}>
                        <SelectTags socket={this.props.socket} sendTags={this.getUserTags} create/>
                    </div>
                    <input style={submitStyle} type="submit" value="S'inscrire" name="Submit" disabled={valid}/>
                </form>
            </div>
        );
    }
}

const error ={
    fontSize: '15px',
    color: 'indianred'
};

const form = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '2vmin',
    flexDirection: 'column'
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

const selectSex = {
    width: '280px',
    minWidth: '280px',
    height: '45px',
    minHeight: '45px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    color: 'rgb(10, 70, 107)',
    border: '1px solid',
    margin: '2px'
};

const iAm = {
    fontSize: '20px',
    color: 'rgb(10, 70, 107)',
    textAlign: 'center',
    margin: '5px'
};

const textarea = {
    width: '350px',
    resize: 'none',
    overflow: 'auto',
    height: '125px',
    minHeight: '125px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    color: 'rgb(10, 70, 107)',
    border: '1px solid',
    margin: '5px'
};

const registerContainer = {
    width: '400px',
    minWidth: '400px',
    minHeight: '816px',
    padding: '0px 70px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px 0px 4px 4px',
    flexDirection: 'column',
    backgroundColor: 'white',
    boxShadow: '0px 0px 10px gray',
};

const ageInput = {
    height: '35px',
    minHeight: '35px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    color: 'rgb(10, 70, 107)',
    border: '1px solid',
    margin: '2px 219px 2px 0px',
    width: '60px',
};

const input = {
    width: '280px',
    minWidth: '280px',
    height: '45px',
    minHeight: '45px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    color: 'rgb(10, 70, 107)',
    border: '1px solid',
    margin: '3px'
};