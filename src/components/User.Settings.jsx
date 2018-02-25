import React from 'react';

export default class UserSettings extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: null,
            email: null,
            password: '',
            display: false,
            editLogin: false,
            editEmail: false,
            editPassword: false,
            error: {
                globalError: '',
                loginError: null,
                emailError: null,
                passwordError: null
            }
        };
        this.handleButton = this.handleButton.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        this.props.socket.on('registerError', data => {this.handleError(data)});
    }

    componentWillUnmount(){
        this.props.socket.removeListener('registerError');
    }

    handleButton(ev){
        this.setState(prevState => ({display: !prevState.display}));
    }

    handleSubmit(ev){
        let array = ['login', 'email', 'password'].filter(elem => ev.target.name.toLowerCase().includes(elem) === true);

        if (array[0] && this.state[array[0]] && this.state[array[0]] !== this.props.user[array[0]]){
            this.props.socket.emit('Register', {type: 'edit', value: [this.state[array[0]], array[0], this.props.user.login]})
        }
        ev.preventDefault();
    }

    handleError(data){
        let error = Object.assign({}, this.state.error);

        error[data.type + 'Error'] = data.error;
        this.setState({
            ['error']: error
        });
    }

    handleChange(ev){
        let name = ev.target.name.trim();
        let value = ev.target.value.trim();

        this.setState({[name]: value});
        if (value !== this.props.user[name]) {
            this.props.socket.emit('Register', {type: 'change', value: [{[name]: value}, name]});
        }
    }

    handleEdit(ev){
        const obj = {login: null, email: null, password: '', editLogin: false, editEmail: false, editPassword: false};

        obj[ev.target.name] = true;
        this.setState(obj);
    }

    renderEmail(edit){
        const email = ((typeof this.state.email === typeof null) ? this.props.user.email : this.state.email);
        const valid = (!this.state.error.emailError && this.state.email);

        return (
            <div name={"userSettings"}>
                Email:  { edit ?
                <form name="editEmail" onSubmit={this.handleSubmit}>
                    <input type={"text"} name={"email"} autoComplete={"off"} value={email} onChange={this.handleChange}/>
                    <input type={"submit"} disabled={!valid} /> {this.state.error.emailError}
                </form>
                : <span> {this.props.user.email} <button name="editEmail" onClick={this.handleEdit}>Modifier</button></span>
            }
            </div>
        )
    }

    renderLogin(edit){
        const login = ((typeof this.state.login === typeof null) ? this.props.user.login : this.state.login );
        const valid =  (!this.state.error.loginError && this.state.login);

        return (
            <div name={"userSettings"}>
                <span>Login:</span> { edit ?
                <form name="editLogin" onSubmit={this.handleSubmit}>
                    <input type={"text"} name={"login"} value={login} onChange={this.handleChange}/>
                    <input type={"submit"} disabled={!valid}/> {this.state.error.loginError}
                </form>
                : <span> {this.props.user.login} <button name="editLogin" onClick={this.handleEdit}>Modifier</button></span>
            }
            </div>
        )
    }

    renderPassword(edit){
        const valid = !this.state.error.passwordError && this.state.password.length >= 6;

        return (
            <div name={"userSettings"}>
                {edit ?
                <form name={"editPassword"} onSubmit={this.handleSubmit}>
                    <input type={"password"} autoComplete={"password"} name={"password"} value={this.state.password} onChange={this.handleChange} />
                    <input type={"submit"} disabled={!valid}/> {this.state.error.passwordError}
                </form>
                : <button name={"editPassword"} onClick={this.handleEdit}>Changer Password</button>}
            </div>
        )
    }

    renderPannel(){
        if (this.state.display){
            return (
                <div className={"userSettings"} name={"userSettings"}>
                    {this.state.error.globalError}
                    {this.renderLogin(this.state.editLogin)}
                    {this.renderEmail(this.state.editEmail)}
                    {this.renderPassword(this.state.editPassword)}
                </div>
            )
        }
    }

    render(){
        let userSettings = this.renderPannel();

        return (
            <div name={"userSettings"}>
                <button onClick={this.handleButton}>Mon Compte</button>
                {userSettings}
            </div>)
    }
}